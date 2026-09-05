import { supabase } from "./supabase.js";

/*
============================================================
MUSH FRONTEND CORE
MUSH — Made Up Sups & Heroes
============================================================
*/

const app = document.getElementById("app");

const state = {
  user: null,
  profile: null,
  page: "home",
  notifications: [],
  unreadNotifications: 0,
  contentPreferences: null,
  notificationPreferences: null
};


/* ==========================================================
   INITIALIZATION
========================================================== */

async function init() {
  if (!supabase) {
    render();
    return;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    await loadUser(session.user);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await loadUser(session.user);
    } else {
      state.user = null;
      state.profile = null;
      state.notifications = [];
      state.unreadNotifications = 0;
      render();
    }
  });

  render();
}


/* ==========================================================
   USER
========================================================== */

async function loadUser(user) {
  state.user = user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  state.profile = profile;

  await Promise.all([
    loadNotifications(),
    loadPreferences()
  ]);
}


async function loadNotifications() {
  if (!state.user) return;

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", state.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  state.notifications = data || [];

  state.unreadNotifications =
    state.notifications.filter(
      notification => !notification.read_at
    ).length;
}


async function loadPreferences() {
  if (!state.user) return;

  const [
    notificationResult,
    contentResult
  ] = await Promise.all([
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", state.user.id)
      .maybeSingle(),

    supabase
      .from("content_preferences")
      .select("*")
      .eq("user_id", state.user.id)
      .maybeSingle()
  ]);

  state.notificationPreferences =
    notificationResult.data;

  state.contentPreferences =
    contentResult.data;
}


/* ==========================================================
   NAVIGATION
========================================================== */

function navigate(page) {
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ==========================================================
   AUTH GATE
========================================================== */

function requireAuth(destination = "studio") {
  if (state.user) {
    navigate(destination);
    return;
  }

  /*
   * Preserve where the user wanted to go.
   * auth.js can use this after successful login.
   */

  sessionStorage.setItem(
    "mush_redirect_after_auth",
    destination
  );

  window.dispatchEvent(
    new CustomEvent("mush:require-auth")
  );
}


/* ==========================================================
   SIDEBAR
========================================================== */

function renderSidebar() {
  return `
    <aside class="sidebar">

      <div class="logo">
        M<span>U</span>SH
        <small>MADE UP SUPS & HEROES</small>
      </div>

      <nav class="nav">

        ${navItem("home", "⌂", "Home")}

        ${navItem("discover", "◉", "Discover")}

        ${navItem(
          "studio",
          "✎",
          "Story Studio",
          true
        )}

        ${navItem(
          "video",
          "▶",
          "Video"
        )}

        ${navItem(
          "worlds",
          "◈",
          "Worlds"
        )}

        ${navItem(
          "characters",
          "♙",
          "Characters"
        )}

        ${navItem(
          "library",
          "▤",
          "Library"
        )}

        ${navItem(
          "notifications",
          "🔔",
          "Notifications"
        )}

      </nav>

      <div class="account-panel">

        ${
          state.user
            ? `
              <div class="account-name">
                ${escapeHTML(
                  state.profile?.username ||
                  state.user.email ||
                  "MUSH Member"
                )}
              </div>

              <div class="account-level">
                MUSH MEMBER
              </div>

              <button
                class="account-signout"
                id="signout"
              >
                Sign out
              </button>
            `
            : `
              <button
                class="primary-button full"
                id="authenticate"
              >
                Sign in / Join MUSH
              </button>
            `
        }

      </div>

    </aside>
  `;
}


function navItem(
  page,
  icon,
  label,
  protectedPage = false
) {
  const active =
    state.page === page
      ? "active"
      : "";

  return `
    <button
      class="${active}"
      data-nav="${page}"
      data-protected="${protectedPage}"
    >
      <span class="nav-icon">
        ${icon}
      </span>

      ${label}

      ${
        page === "notifications" &&
        state.unreadNotifications > 0
          ? `
            <span class="notification-badge">
              ${state.unreadNotifications}
            </span>
          `
          : ""
      }

    </button>
  `;
}


/* ==========================================================
   HEADER
========================================================== */

function renderHeader() {
  return `
    <header class="topbar">

      <div class="current-section">
        ${escapeHTML(
          state.page
        ).toUpperCase()}
      </div>

      <input
        id="search"
        class="search"
        type="search"
        placeholder="Search MUSH..."
      />

      <div class="top-actions">

        <button
          class="icon-button"
          id="create-button"
          title="Create"
        >
          ＋
        </button>

        <button
          class="icon-button"
          data-nav="notifications"
          title="Notifications"
        >
          🔔
          ${
            state.unreadNotifications
              ? `<sup>${state.unreadNotifications}</sup>`
              : ""
          }
        </button>

        <div class="profile">
          ${
            state.profile?.username
              ? escapeHTML(
                  state.profile.username
                    .charAt(0)
                    .toUpperCase()
                )
              : "?"
          }
        </div>

      </div>

    </header>
  `;
}


/* ==========================================================
   HOME
========================================================== */

function renderHome() {
  return `
    <section class="hero">

      <div class="hero-content">

        <span class="hero-label">
          THE LIVING FICTIONAL FRANCHISE
        </span>

        <h1>
          CREATE.<br>
          CONNECT.<br>
          BECOME.
        </h1>

        <p>
          Build worlds. Write stories. Create characters.
          Publish videos, anime, movies, art and more.
          Everything belongs to a connected fictional universe.
        </p>

        <div class="hero-buttons">

          <button
            class="button primary"
            id="start-creating"
          >
            Start Creating
          </button>

          <button
            class="button secondary"
            data-nav="discover"
          >
            Explore MUSH
          </button>

        </div>

      </div>

    </section>


    <section class="section">

      <div class="section-header">
        <h2>Everything starts with an idea.</h2>
      </div>

      <div class="feature-grid">

        ${featureCard(
          "✎",
          "Story Studio",
          "Write novels, Tanga, comics, lore and more directly inside MUSH."
        )}

        ${featureCard(
          "▶",
          "MUSH Video",
          "A YouTube + Netflix style home for shorts, videos, movies and anime."
        )}

        ${featureCard(
          "◈",
          "Universe Builder",
          "Build connected worlds, Yusenities, Dusenities and realities."
        )}

        ${featureCard(
          "♙",
          "Characters",
          "Create characters that can appear across stories and media."
        )}

      </div>

    </section>


    <section class="section">

      <div class="section-header">
        <h2>Follow what matters.</h2>
      </div>

      <div class="follow-explainer">

        <div>
          <strong>Follow creators.</strong>
          <span>Get notified when they publish.</span>
        </div>

        <div>
          <strong>Follow characters.</strong>
          <span>Know when they appear in new works.</span>
        </div>

        <div>
          <strong>Follow worlds.</strong>
          <span>Stay connected to their evolving stories.</span>
        </div>

      </div>

    </section>
  `;
}


function featureCard(icon, title, description) {
  return `
    <article class="feature-card">

      <div class="feature-icon">
        ${icon}
      </div>

      <h3>
        ${title}
      </h3>

      <p>
        ${description}
      </p>

    </article>
  `;
}


/* ==========================================================
   DISCOVER
========================================================== */

function renderDiscover() {
  return `
    <div class="page-heading">

      <div class="eyebrow">
        MUSH DISCOVER
      </div>

      <h1>
        Explore the<br>
        living archive.
      </h1>

      <p>
        Discover stories, characters, worlds,
        creators and media from across MUSH.
      </p>

    </div>

    <div class="content-placeholder">

      <div class="placeholder-icon">
        ◉
      </div>

      <h2>
        Discovery Engine
      </h2>

      <p>
        Trending works, recommendations,
        followed creators and universe discovery
        will appear here.
      </p>

    </div>
  `;
}


/* ==========================================================
   STORY STUDIO
========================================================== */

function renderStudio() {
  if (!state.user) {
    return renderAuthRequired(
      "Story Studio"
    );
  }

  return `
    <div class="page-heading">

      <div class="eyebrow">
        CREATOR SPACE
      </div>

      <h1>
        Story Studio
      </h1>

      <p>
        Write and publish directly inside MUSH.
      </p>

    </div>

    <div class="studio-actions">

      <button
        class="button purple"
        id="new-story"
      >
        ＋ New Story
      </button>

      <button class="button secondary">
        Drafts
      </button>

      <button class="button secondary">
        Published
      </button>

    </div>

    <div class="content-placeholder">

      <div class="placeholder-icon">
        ✎
      </div>

      <h2>
        Your Story Workspace
      </h2>

      <p>
        Your drafts, chapters and published works
        will appear here.
      </p>

    </div>
  `;
}


/* ==========================================================
   VIDEO
========================================================== */

function renderVideo() {
  return `
    <div class="page-heading">

      <div class="eyebrow">
        MUSH VIDEO
      </div>

      <h1>
        Watch.
      </h1>

      <p>
        Shorts, videos, movies, anime and
        original fictional-universe content.
      </p>

    </div>

    <div class="video-banner">

      <div>

        <span>
          MUSH VIDEO
        </span>

        <h2>
          Your worlds.<br>
          On screen.
        </h2>

        <button
          class="button purple"
          id="upload-video"
        >
          Upload Content
        </button>

      </div>

    </div>

    <div class="section">

      <h2>
        Trending
      </h2>

      <div class="video-grid-placeholder">

        ${videoPlaceholder("▶")}
        ${videoPlaceholder("🎬")}
        ${videoPlaceholder("📺")}
        ${videoPlaceholder("🎞️")}

      </div>

    </div>
  `;
}


function videoPlaceholder(icon) {
  return `
    <article class="video-placeholder">

      <div>
        ${icon}
      </div>

      <span>
        MUSH VIDEO
      </span>

    </article>
  `;
}


/* ==========================================================
   WORLDS
========================================================== */

function renderWorlds() {
  return archivePage(
    "WORLDS",
    "Explore Yusenities, Dusenities and the realities of MUSH."
  );
}


/* ==========================================================
   CHARACTERS
========================================================== */

function renderCharacters() {
  return archivePage(
    "CHARACTERS",
    "Discover characters from across the MUSH franchise."
  );
}


/* ==========================================================
   LIBRARY
========================================================== */

function renderLibrary() {
  if (!state.user) {
    return renderAuthRequired(
      "Your Library"
    );
  }

  return `
    <div class="page-heading">

      <div class="eyebrow">
        PERSONAL LIBRARY
      </div>

      <h1>
        Your Library
      </h1>

      <p>
        Saved stories, videos, characters and worlds.
      </p>

    </div>

    <div class="content-placeholder">

      <div class="placeholder-icon">
        ▤
      </div>

      <h2>
        Nothing saved yet
      </h2>

      <p>
        Save something from MUSH and it will appear here.
      </p>

    </div>
  `;
}


/* ==========================================================
   NOTIFICATIONS
========================================================== */

function renderNotifications() {
  if (!state.user) {
    return renderAuthRequired(
      "Notifications"
    );
  }

  const notifications =
    state.notifications;

  return `
    <div class="page-heading">

      <div class="eyebrow">
        NOTIFICATION CENTER
      </div>

      <h1>
        Notifications
      </h1>

    </div>

    <div class="notification-list">

      ${
        notifications.length
          ? notifications
              .map(notificationCard)
              .join("")
          : `
            <div class="content-placeholder">

              <div class="placeholder-icon">
                🔔
              </div>

              <h2>
                You're all caught up.
              </h2>

              <p>
                New activity from creators,
                characters and worlds you follow
                will appear here.
              </p>

            </div>
          `
      }

    </div>
  `;
}


function notificationCard(notification) {
  return `
    <article
      class="notification-card ${
        notification.read_at
          ? ""
          : "unread"
      }"
      data-notification-id="${notification.id}"
    >

      <div class="notification-icon">
        🔔
      </div>

      <div>

        <strong>
          ${escapeHTML(
            notification.title
          )}
        </strong>

        ${
          notification.body
            ? `
              <p>
                ${escapeHTML(
                  notification.body
                )}
              </p>
            `
            : ""
        }

        <small>
          ${formatDate(
            notification.created_at
          )}
        </small>

      </div>

    </article>
  `;
}


/* ==========================================================
   ARCHIVE
========================================================== */

function archivePage(title, description) {
  return `
    <div class="page-heading">

      <div class="eyebrow">
        MUSH ARCHIVE
      </div>

      <h1>
        ${escapeHTML(title)}
      </h1>

      <p>
        ${escapeHTML(description)}
      </p>

    </div>

    <div class="content-placeholder">

      <div class="placeholder-icon">
        ◈
      </div>

      <h2>
        Archive Explorer
      </h2>

      <p>
        Connected MUSH records will appear here.
      </p>

    </div>
  `;
}


/* ==========================================================
   AUTH REQUIRED
========================================================== */

function renderAuthRequired(title) {
  return `
    <div class="content-placeholder auth-required">

      <div class="placeholder-icon">
        🔐
      </div>

      <h2>
        ${escapeHTML(title)} requires a MUSH account.
      </h2>

      <p>
        Create your free Halo account to continue.
      </p>

      <button
        class="button purple"
        id="join-mush"
      >
        Sign up / Sign in
      </button>

    </div>
  `;
}


/* ==========================================================
   RENDER
========================================================== */

function render() {

  if (!app) return;

  let pageContent;

  switch (state.page) {

    case "home":
      pageContent = renderHome();
      break;

    case "discover":
      pageContent = renderDiscover();
      break;

    case "studio":
      pageContent = renderStudio();
      break;

    case "video":
      pageContent = renderVideo();
      break;

    case "worlds":
      pageContent = renderWorlds();
      break;

    case "characters":
      pageContent = renderCharacters();
      break;

    case "library":
      pageContent = renderLibrary();
      break;

    case "notifications":
      pageContent =
        renderNotifications();
      break;

    default:
      pageContent =
        renderHome();
  }

  app.innerHTML = `
    ${renderSidebar()}

    <div class="main">

      ${renderHeader()}

      <main class="content">
        ${pageContent}
      </main>

    </div>
  `;

  attachEvents();
}


/* ==========================================================
   EVENTS
========================================================== */

function attachEvents() {

  document
    .querySelectorAll("[data-nav]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.nav;

          const protectedPage =
            button.dataset.protected === "true";

          if (
            protectedPage &&
            !state.user
          ) {
            requireAuth(page);
            return;
          }

          navigate(page);
        }
      );

    });


  const authenticate =
    document.getElementById(
      "authenticate"
    );

  if (authenticate) {
    authenticate.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "mush:require-auth"
          )
        );
      }
    );
  }


  const join =
    document.getElementById(
      "join-mush"
    );

  if (join) {
    join.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "mush:require-auth"
          )
        );
      }
    );
  }


  const signout =
    document.getElementById(
      "signout"
    );

  if (signout) {
    signout.addEventListener(
      "click",
      async () => {

        if (!supabase) return;

        await supabase.auth.signOut();

        navigate("home");
      }
    );
  }


  const create =
    document.getElementById(
      "create-button"
    );

  if (create) {
    create.addEventListener(
      "click",
      () => requireAuth("studio")
    );
  }


  const start =
    document.getElementById(
      "start-creating"
    );

  if (start) {
    start.addEventListener(
      "click",
      () => requireAuth("studio")
    );
  }


  const upload =
    document.getElementById(
      "upload-video"
    );

  if (upload) {
    upload.addEventListener(
      "click",
      () => requireAuth("video")
    );
  }


  document
    .querySelectorAll(
      ".notification-card.unread"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        async () => {

          const id =
            card.dataset.notificationId;

          await supabase
            .from("notifications")
            .update({
              read_at:
                new Date().toISOString()
            })
            .eq("id", id)
            .eq(
              "recipient_id",
              state.user.id
            );

          await loadNotifications();

          render();
        }
      );

    });
}


/* ==========================================================
   HELPERS
========================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatDate(date) {

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(
    new Date(date)
  );
}


/* ==========================================================
   START
========================================================== */
window.addEventListener(
  "mush:navigate",
  event => {
    const page = event.detail?.page;

    if (page) {
      navigate(page);
    }
  }
);
init();