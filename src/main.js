import { createClient } from "@supabase/supabase-js";
import "./style.css";

/*
 * ============================================================
 * MUSH FRONTEND
 * Made Up Sups & Heroes
 * ============================================================
 *
 * Architecture:
 *
 * Authentication
 *      ↓
 * Creator Studio
 *      ↓
 * Reality Explorer
 *      ↓
 * Canon Engine
 *      ↓
 * Collaboration
 *
 * The frontend never contains a Supabase service-role key.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {
  user: null,
  profile: null,

  page: "discover",

  search: "",

  records: [],

  loading: false
};


/* ============================================================
   UTILITIES
   ============================================================ */

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


function getLevel() {
  return state.profile?.membership_level || 1;
}


/* ============================================================
   AUTHENTICATION
   ============================================================ */

async function loadSession() {
  if (!supabase) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.user = session?.user || null;

  if (!state.user) {
    state.profile = null;
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", state.user.id)
    .maybeSingle();

  state.profile = data;
}


async function authenticate() {
  if (!supabase) {
    alert(
      "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );

    return;
  }

  const email = prompt("Email");

  if (!email) return;

  const password = prompt("Password");

  if (!password) return;

  const createAccount = confirm(
    "Create a new MUSH account?\n\nOK = Sign up\nCancel = Sign in"
  );

  let result;

  if (createAccount) {
    result = await supabase.auth.signUp({
      email,
      password
    });
  } else {
    result = await supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  if (result.error) {
    alert(result.error.message);
    return;
  }

  await loadSession();
  await loadRecords();

  render();
}


async function signOut() {
  if (!supabase) return;

  await supabase.auth.signOut();

  state.user = null;
  state.profile = null;
  state.records = [];

  render();
}


/* ============================================================
   DATABASE
   ============================================================ */

async function loadRecords() {
  if (!supabase || !state.user) {
    state.records = [];
    return;
  }

  state.loading = true;

  const [
    content,
    characters,
    canon,
    tusenities,
    yusenities,
    dusenities
  ] = await Promise.all([
    supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("characters")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("canon_facts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("tusenities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("yusenities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("dusenities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  state.records = [
    ...(content.data || []).map(record => ({
      ...record,
      _type: "content"
    })),

    ...(characters.data || []).map(record => ({
      ...record,
      _type: "character"
    })),

    ...(canon.data || []).map(record => ({
      ...record,
      _type: "canon"
    })),

    ...(tusenities.data || []).map(record => ({
      ...record,
      _type: "tusenity"
    })),

    ...(yusenities.data || []).map(record => ({
      ...record,
      _type: "yusenity"
    })),

    ...(dusenities.data || []).map(record => ({
      ...record,
      _type: "dusenity"
    }))
  ];

  state.loading = false;
}


/* ============================================================
   NAVIGATION
   ============================================================ */

const navigation = [
  ["discover", "⌂", "Discover"],
  ["stories", "▣", "Stories"],
  ["characters", "♙", "Characters"],
  ["realities", "◎", "Realities"],
  ["canon", "◆", "Canon"],
  ["studio", "＋", "Creator Studio"],
  ["collab", "🤝", "Collaboration"]
];


function renderSidebar() {
  return `
    <aside class="sidebar">

      <div class="brand">
        <div class="brand-name">MUSH</div>
        <div class="brand-subtitle">
          MADE UP SUPS & HEROES
        </div>
      </div>

      <nav class="navigation">

        ${navigation
          .map(
            ([page, icon, label]) => `
              <button
                class="nav-item ${
                  state.page === page ? "active" : ""
                }"
                data-page="${page}"
              >
                <span class="nav-icon">${icon}</span>
                <span>${label}</span>
              </button>
            `
          )
          .join("")}

      </nav>

      <div class="account-panel">

        ${
          state.user
            ? `
              <div class="account-name">
                ${escapeHTML(
                  state.profile?.username ||
                    state.user.email
                )}
              </div>

              <div class="account-level">
                MUSH MEMBER · LEVEL ${getLevel()}
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


/* ============================================================
   HEADER
   ============================================================ */

function renderHeader() {
  return `
    <header class="topbar">

      <div class="current-section">
        ${state.page.toUpperCase()}
      </div>

      <input
        id="search"
        class="search"
        type="search"
        placeholder="Search the MUSH archive..."
        value="${escapeHTML(state.search)}"
      />

      <div class="connection-status ${
        supabase ? "connected" : "offline"
      }">
        ${supabase ? "● BACKEND READY" : "○ BACKEND NOT CONFIGURED"}
      </div>

    </header>
  `;
}


/* ============================================================
   RECORD CARDS
   ============================================================ */

function recordCard(record) {
  const title =
    record.title ||
    record.name ||
    "Untitled";

  const description =
    record.description ||
    "No description available.";

  let type =
    record.content_type ||
    record._type;

  if (record._type === "character") {
    type = `R${record.realm || "?"} · ${
      record.tier || "?"
    }`;
  }

  return `
    <article class="record-card">

      <div class="record-type">
        ${escapeHTML(type)}
      </div>

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${escapeHTML(description)}
      </p>

      <div class="record-meta">
        ${escapeHTML(record.status || "ARCHIVE RECORD")}

        ${
          record.open_user_mode
            ? " · OPEN USER MODE"
            : ""
        }
      </div>

    </article>
  `;
}


/* ============================================================
   DISCOVER
   ============================================================ */

function renderDiscover() {
  const records = state.records.slice(0, 6);

  return `
    <div class="hero">

      <div class="eyebrow">
        THE LIVING FICTIONAL FRANCHISE
      </div>

      <h1>
        THE ARCHIVE<br>
        IS ALIVE.
      </h1>

      <p>
        MUSH — Made Up Sups & Heroes — is a
        living collaborative franchise where
        creators and readers can build characters,
        stories, realities and legends together.
      </p>

      <button
        class="primary-button"
        data-page="stories"
      >
        Explore the archive
      </button>

    </div>

    <div class="section-title">
      LATEST DISCOVERIES
    </div>

    <div class="record-grid">
      ${
        records.length
          ? records.map(recordCard).join("")
          : emptyState()
      }
    </div>
  `;
}


/* ============================================================
   FILTERED ARCHIVES
   ============================================================ */

function filteredRecords() {
  let records = [...state.records];

  if (state.search) {
    const query = state.search.toLowerCase();

    records = records.filter(record =>
      [
        record.title,
        record.name,
        record.description,
        record.content_type
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  switch (state.page) {
    case "stories":
      return records.filter(
        record => record._type === "content"
      );

    case "characters":
      return records.filter(
        record => record._type === "character"
      );

    case "canon":
      return records.filter(
        record => record._type === "canon"
      );

    case "realities":
      return records.filter(record =>
        [
          "tusenity",
          "yusenity",
          "dusenity"
        ].includes(record._type)
      );

    default:
      return records;
  }
}


function renderArchive() {
  const records = filteredRecords();

  return `
    <div class="page-heading">

      <div class="eyebrow">
        MUSH ARCHIVE
      </div>

      <h2>
        ${escapeHTML(state.page)}
      </h2>

    </div>

    <div class="record-grid">

      ${
        records.length
          ? records.map(recordCard).join("")
          : emptyState()
      }

    </div>
  `;
}


/* ============================================================
   CREATOR STUDIO
   ============================================================ */

function renderStudio() {
  return `
    <div class="hero compact">

      <div class="eyebrow">
        CREATOR STUDIO · LEVEL ${getLevel()}
      </div>

      <h1>
        CREATE.
      </h1>

      <p>
        Turn an idea into a MUSH creation.
        Content begins as a draft and progresses
        through review, publication and canon.
      </p>

    </div>

    <div class="studio-panel">

      <form id="content-form">

        <label>
          CONTENT TYPE

          <select name="type">

            <option value="tanga">
              Tanga
            </option>

            <option value="novel">
              Novel
            </option>

            <option value="video">
              Video
            </option>

            <option value="anime">
              Anime
            </option>

            <option value="artwork">
              Artwork
            </option>

            <option value="audio">
              Audio
            </option>

            <option value="one_shot">
              One-Shot
            </option>

            <option value="lore_text">
              Lore Text
            </option>

          </select>

        </label>

        <label>
          TITLE

          <input
            name="title"
            required
            placeholder="Enter your creation's title"
          />

        </label>

        <label>
          DESCRIPTION

          <textarea
            name="description"
            required
            placeholder="Describe your creation..."
          ></textarea>

        </label>

        <label class="checkbox-label">

          <input
            type="checkbox"
            name="open_user_mode"
          />

          <span>
            Enable Open User Mode
          </span>

        </label>

        <button
          class="primary-button"
          type="submit"
        >
          Save Draft
        </button>

      </form>

    </div>
  `;
}


/* ============================================================
   COLLABORATION
   ============================================================ */

function renderCollaboration() {
  return `
    <div class="hero compact">

      <div class="eyebrow">
        COLLABORATION ENGINE
      </div>

      <h1>
        BUILD<br>
        TOGETHER.
      </h1>

      <p>
        Multiple creators can collaborate on
        MUSH characters, Tanga, novels, anime,
        lore and other creative projects while
        preserving individual contribution records.
      </p>

      <button
        class="primary-button"
        id="create-project"
      >
        Create Project
      </button>

    </div>

    <div class="feature-grid">

      <div class="feature-card">
        <strong>CREATORS</strong>
        <span>Invite collaborators.</span>
      </div>

      <div class="feature-card">
        <strong>ROLES</strong>
        <span>Writer · Artist · Editor · Lorekeeper</span>
      </div>

      <div class="feature-card">
        <strong>ATTRIBUTION</strong>
        <span>Track individual contributions.</span>
      </div>

    </div>
  `;
}


/* ============================================================
   EMPTY STATE
   ============================================================ */

function emptyState() {
  return `
    <div class="empty-state">

      <div class="empty-icon">
        ◎
      </div>

      <h3>
        The archive is waiting.
      </h3>

      <p>
        Sign in or create something new
        to begin filling MUSH.
      </p>

    </div>
  `;
}


/* ============================================================
   CONTENT CREATION
   ============================================================ */

async function createContent(event) {
  event.preventDefault();

  if (!supabase || !state.user) {
    alert("You must sign in before creating content.");
    return;
  }

  const form = new FormData(event.target);

  const payload = {
    content_type: form.get("type"),
    title: form.get("title"),
    description: form.get("description"),
    creator_id: state.user.id,
    status: "draft",
    open_user_mode:
      form.get("open_user_mode") === "on"
  };

  const { error } = await supabase
    .from("content")
    .insert(payload);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Draft created successfully.");

  await loadRecords();

  render();
}


/* ============================================================
   COLLABORATIVE PROJECT
   ============================================================ */

async function createProject() {
  if (!supabase || !state.user) {
    alert("Sign in first.");
    return;
  }

  const name = prompt("Project name");

  if (!name) return;

  const type = prompt(
    "Project type",
    "tanga"
  );

  if (!type) return;

  const { error } = await supabase.rpc(
    "create_collaboration_project",
    {
      p_name: name,
      p_type: type,
      p_description: null,
      p_content_id: null
    }
  );

  if (error) {
    alert(error.message);
    return;
  }

  alert("Collaboration project created.");
}


/* ============================================================
   MAIN PAGE
   ============================================================ */

function renderPage() {
  if (state.page === "discover") {
    return renderDiscover();
  }

  if (state.page === "studio") {
    return renderStudio();
  }

  if (state.page === "collab") {
    return renderCollaboration();
  }

  return renderArchive();
}


/* ============================================================
   RENDER
   ============================================================ */

function render() {
  document.querySelector("#app").innerHTML = `
    <div class="application">

      ${renderSidebar()}

      <main class="main">

        ${renderHeader()}

        <div class="content">
          ${renderPage()}
        </div>

      </main>

    </div>
  `;


  document
    .querySelectorAll("[data-page]")
    .forEach(button => {
      button.addEventListener("click", () => {
        state.page = button.dataset.page;

        render();
      });
    });


  const search = document.querySelector("#search");

  search?.addEventListener("input", event => {
    state.search = event.target.value;

    render();
  });


  document
    .querySelector("#authenticate")
    ?.addEventListener(
      "click",
      authenticate
    );


  document
    .querySelector("#signout")
    ?.addEventListener(
      "click",
      signOut
    );


  document
    .querySelector("#content-form")
    ?.addEventListener(
      "submit",
      createContent
    );


  document
    .querySelector("#create-project")
    ?.addEventListener(
      "click",
      createProject
    );
}


/* ============================================================
   START APPLICATION
   ============================================================ */

await loadSession();

await loadRecords();

render();
