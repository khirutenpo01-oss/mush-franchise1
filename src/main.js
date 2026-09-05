/* ==========================================================
   MUSH CORE APPLICATION
========================================================== */

* {
  box-sizing: border-box;
}

html {
  margin: 0;
  padding: 0;
  background: var(--bg);
}

body {
  margin: 0;
  padding: 0;

  min-width: 320px;

  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(123, 44, 255, .12),
      transparent 35%
    ),
    var(--bg);

  color: var(--text);

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

#app {
  min-height: 100vh;

  display: grid;

  grid-template-columns:
    250px minmax(0, 1fr);
}


/* ==========================================================
   SIDEBAR
========================================================== */

.sidebar {
  position: fixed;

  inset: 0 auto 0 0;

  width: 250px;

  display: flex;

  flex-direction: column;

  padding: 28px 18px;

  background:
    linear-gradient(
      180deg,
      #0e0b18,
      #09080f
    );

  border-right:
    1px solid var(--border);

  z-index: 100;
}

.logo {
  padding:
    4px 10px 28px;

  color: white;

  font-size: 27px;

  font-weight: 900;

  letter-spacing: -1px;
}

.logo span {
  color: var(--purple);
}

.logo small {
  display: block;

  margin-top: 5px;

  color: var(--muted);

  font-size: 7px;

  font-weight: 700;

  letter-spacing: 1.5px;
}


/* ==========================================================
   NAVIGATION
========================================================== */

.nav {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.nav button {
  width: 100%;

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 12px 13px;

  border: 1px solid transparent;

  border-radius: 9px;

  background: transparent;

  color: var(--muted);

  text-align: left;

  font-size: 12px;

  transition:
    background .2s,
    color .2s,
    border-color .2s;
}

.nav button:hover {
  background: var(--surface);

  color: white;
}

.nav button.active {
  background:
    rgba(123, 44, 255, .15);

  border-color:
    rgba(123, 44, 255, .25);

  color: white;
}

.nav-icon {
  width: 24px;

  display: inline-grid;

  place-items: center;

  color: var(--violet);

  font-size: 15px;
}

.notification-badge {
  min-width: 19px;

  height: 19px;

  display: inline-grid;

  place-items: center;

  margin-left: auto;

  border-radius: 999px;

  background: var(--red);

  color: white;

  font-size: 9px;

  font-weight: 800;
}


/* ==========================================================
   ACCOUNT
========================================================== */

.account-panel {
  margin-top: auto;

  padding-top: 18px;

  border-top:
    1px solid var(--border);
}

.account-name {
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color: white;

  font-size: 12px;

  font-weight: 700;
}

.account-level {
  margin-top: 4px;

  color: var(--muted);

  font-size: 8px;

  letter-spacing: 1.5px;
}

.account-signout {
  width: 100%;

  margin-top: 14px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background: transparent;

  color: var(--muted);
}

.account-signout:hover {
  background: var(--surface);

  color: white;
}


/* ==========================================================
   MAIN
========================================================== */

.main {
  grid-column: 2;

  min-width: 0;

  min-height: 100vh;
}


/* ==========================================================
   TOPBAR
========================================================== */

.topbar {
  position: sticky;

  top: 0;

  z-index: 50;

  height: 70px;

  display: grid;

  grid-template-columns:
    180px minmax(200px, 1fr) auto;

  align-items: center;

  gap: 25px;

  padding: 0 32px;

  background:
    rgba(7, 6, 12, .88);

  backdrop-filter:
    blur(18px);

  border-bottom:
    1px solid var(--border);
}

.current-section {
  color: white;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 2px;
}

.search {
  width: 100%;

  max-width: 520px;

  padding: 10px 15px;

  border:
    1px solid var(--border);

  border-radius: 999px;

  outline: none;

  background: var(--surface);

  color: white;

  font-size: 12px;
}

.search:focus {
  border-color: var(--purple);

  box-shadow:
    0 0 0 3px
    rgba(123, 44, 255, .12);
}

.search::placeholder {
  color: #686273;
}

.top-actions {
  display: flex;

  align-items: center;

  gap: 9px;
}

.icon-button {
  position: relative;

  width: 38px;

  height: 38px;

  display: grid;

  place-items: center;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background: var(--surface);

  color: white;

  font-size: 16px;
}

.icon-button:hover {
  border-color: var(--purple);

  background: var(--surface-2);
}

.icon-button sup {
  position: absolute;

  top: -4px;

  right: -4px;

  min-width: 16px;

  height: 16px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background: var(--red);

  color: white;

  font-size: 8px;
}

.profile {
  width: 38px;

  height: 38px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      var(--purple),
      var(--blue)
    );

  color: white;

  font-weight: 800;
}


/* ==========================================================
   CONTENT
========================================================== */

.content {
  width: 100%;

  max-width: 1250px;

  margin: 0 auto;

  padding:
    55px 50px 90px;
}


/* ==========================================================
   HERO
========================================================== */

.hero {
  min-height: 570px;

  display: flex;

  align-items: center;

  position: relative;

  overflow: hidden;

  margin:
    -55px -50px 0;

  padding:
    80px 50px;

  background:
    radial-gradient(
      circle at 75% 40%,
      rgba(63, 124, 255, .16),
      transparent 30%
    ),
    radial-gradient(
      circle at 60% 50%,
      rgba(123, 44, 255, .18),
      transparent 45%
    );
}

.hero-content {
  position: relative;

  max-width: 720px;

  z-index: 1;
}

.hero-label,
.eyebrow {
  color: var(--violet);

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 2.5px;
}

.hero h1 {
  margin:
    16px 0 22px;

  font-size:
    clamp(48px, 7vw, 88px);

  line-height: .9;

  letter-spacing: -4px;

  color: white;
}

.hero p {
  max-width: 620px;

  margin: 0;

  color: var(--muted);

  font-size: 15px;

  line-height: 1.7;
}

.hero-buttons {
  display: flex;

  gap: 12px;

  margin-top: 30px;
}


/* ==========================================================
   BUTTONS
========================================================== */

.button,
.primary-button {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding:
    11px 18px;

  border-radius: 9px;

  font-size: 12px;

  font-weight: 800;

  transition:
    transform .2s,
    box-shadow .2s,
    background .2s;
}

.button:hover,
.primary-button:hover {
  transform: translateY(-1px);
}

.button.primary,
.primary-button {
  border: none;

  background:
    linear-gradient(
      135deg,
      var(--purple),
      var(--blue)
    );

  color: white;

  box-shadow:
    0 10px 30px
    rgba(123, 44, 255, .2);
}

.button.secondary {
  border:
    1px solid var(--border);

  background: var(--surface);

  color: white;
}

.button.purple {
  border: none;

  background: var(--purple);

  color: white;
}

.primary-button.full {
  width: 100%;
}


/* ==========================================================
   SECTIONS
========================================================== */

.section {
  margin-top: 65px;
}

.section-header {
  margin-bottom: 25px;
}

.section h2,
.section-header h2 {
  margin: 0;

  color: white;

  font-size: 22px;

  letter-spacing: -.5px;
}


/* ==========================================================
   FEATURE GRID
========================================================== */

.feature-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;
}

.feature-card {
  min-height: 210px;

  padding: 24px;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      var(--surface),
      #0e0d15
    );

  transition:
    transform .2s,
    border-color .2s;
}

.feature-card:hover {
  transform: translateY(-3px);

  border-color:
    rgba(123, 44, 255, .5);
}

.feature-icon {
  width: 40px;

  height: 40px;

  display: grid;

  place-items: center;

  margin-bottom: 22px;

  border-radius: 10px;

  background:
    rgba(123, 44, 255, .12);

  color: var(--violet);

  font-size: 18px;
}

.feature-card h3 {
  margin:
    0 0 9px;

  color: white;

  font-size: 15px;
}

.feature-card p {
  margin: 0;

  color: var(--muted);

  font-size: 11px;

  line-height: 1.6;
}


/* ==========================================================
   FOLLOW EXPLAINER
========================================================== */

.follow-explainer {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 14px;
}

.follow-explainer > div {
  padding: 20px;

  border-left:
    2px solid var(--purple);

  background: var(--surface);
}

.follow-explainer strong,
.follow-explainer span {
  display: block;
}

.follow-explainer strong {
  color: white;

  font-size: 13px;
}

.follow-explainer span {
  margin-top: 6px;

  color: var(--muted);

  font-size: 10px;
}


/* ==========================================================
   PAGE HEADINGS
========================================================== */

.page-heading {
  max-width: 750px;

  margin-bottom: 40px;
}

.page-heading h1 {
  margin:
    12px 0 15px;

  color: white;

  font-size:
    clamp(40px, 6vw, 70px);

  line-height: .95;

  letter-spacing: -3px;
}

.page-heading p {
  margin: 0;

  color: var(--muted);

  font-size: 14px;

  line-height: 1.7;
}


/* ==========================================================
   PLACEHOLDERS
========================================================== */

.content-placeholder {
  min-height: 300px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 50px;

  border:
    1px dashed var(--border);

  border-radius: 16px;

  background:
    rgba(18, 16, 27, .55);

  text-align: center;
}

.placeholder-icon {
  width: 55px;

  height: 55px;

  display: grid;

  place-items: center;

  margin-bottom: 18px;

  border-radius: 15px;

  background:
    rgba(123, 44, 255, .12);

  color: var(--violet);

  font-size: 22px;
}

.content-placeholder h2 {
  margin:
    0 0 10px;

  color: white;

  font-size: 20px;
}

.content-placeholder p {
  max-width: 520px;

  margin: 0;

  color: var(--muted);

  font-size: 12px;

  line-height: 1.6;
}

.auth-required .button {
  margin-top: 22px;
}


/* ==========================================================
   VIDEO
========================================================== */

.video-banner {
  min-height: 280px;

  display: flex;

  align-items: center;

  padding: 45px;

  border:
    1px solid var(--border);

  border-radius: 18px;

  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(123, 44, 255, .22),
      transparent 40%
    ),
    var(--surface);
}

.video-banner span {
  color: var(--violet);

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 2px;
}

.video-banner h2 {
  margin:
    12px 0 25px;

  color: white;

  font-size: 42px;

  line-height: 1;
}

.video-grid-placeholder {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 14px;

  margin-top: 20px;
}

.video-placeholder {
  aspect-ratio: 16 / 9;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background: var(--surface);

  color: var(--muted);
}

.video-placeholder > div {
  font-size: 26px;

  margin-bottom: 10px;
}

.video-placeholder span {
  font-size: 8px;

  letter-spacing: 1px;
}


/* ==========================================================
   NOTIFICATIONS
========================================================== */

.notification-list {
  display: flex;

  flex-direction: column;

  gap: 8px;
}

.notification-card {
  display: flex;

  gap: 15px;

  padding: 18px;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background: var(--surface);

  cursor: pointer;
}

.notification-card:hover {
  background: var(--surface-2);
}

.notification-card.unread {
  border-color:
    rgba(123, 44, 255, .45);
}

.notification-icon {
  flex: 0 0 auto;

  width: 38px;

  height: 38px;

  display: grid;

  place-items: center;

  border-radius: 10px;

  background:
    rgba(123, 44, 255, .12);
}

.notification-card strong {
  color: white;

  font-size: 12px;
}

.notification-card p {
  margin: 6px 0;

  color: var(--muted);

  font-size: 11px;
}

.notification-card small {
  color: #686273;

  font-size: 9px;
}


/* ==========================================================
   STORY STUDIO PAGE ACTIONS
========================================================== */

.content > .studio-actions {
  display: flex;

  gap: 8px;

  margin:
    -15px 0 25px;
}


/* ==========================================================
   RESPONSIVE
========================================================== */

@media (max-width: 1050px) {

  #app {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .sidebar {
    width: 210px;
  }

  .feature-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .video-grid-placeholder {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 760px) {

  #app {
    display: block;
  }

  .sidebar {
    position: static;

    width: 100%;

    padding:
      15px;

    border-right: none;

    border-bottom:
      1px solid var(--border);
  }

  .logo {
    padding:
      5px 8px 15px;
  }

  .nav {
    display: grid;

    grid-template-columns:
      repeat(4, 1fr);
  }

  .nav button {
    justify-content: center;

    padding: 9px 5px;

    font-size: 9px;
  }

  .nav-icon {
    display: none;
  }

  .account-panel {
    display: none;
  }

  .main {
    min-height: auto;
  }

  .topbar {
    grid-template-columns: 1fr auto;

    height: auto;

    padding:
      14px 18px;
  }

  .current-section {
    display: none;
  }

  .search {
    grid-column: 1 / -1;

    grid-row: 2;

    max-width: none;
  }

  .content {
    padding:
      35px 20px 60px;
  }

  .hero {
    min-height: 500px;

    margin:
      -35px -20px 0;

    padding:
      60px 20px;
  }

  .hero h1 {
    font-size: 54px;

    letter-spacing: -3px;
  }

  .feature-grid,
  .follow-explainer {
    grid-template-columns: 1fr;
  }

  .video-grid-placeholder {
    grid-template-columns: 1fr;
  }

  .page-heading h1 {
    font-size: 48px;
  }
}
import "./styles.css";
import { openStoryStudio } from "./story-studio.js";
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


  const newStory =
    document.getElementById(
      "new-story"
    );

  if (newStory) {
    newStory.addEventListener(
      "click",
      () => {
        if (!state.user) {
          requireAuth("studio");
          return;
        }

        openStoryStudio();
      }
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