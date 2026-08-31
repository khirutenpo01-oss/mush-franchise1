import { createClient } from "@supabase/supabase-js";
import "./auth.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

let mode = "signup";
let modal = null;

/* ============================================================
   AUTH MODAL
   ============================================================ */

function createAuthModal() {
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "mush-auth-modal";

  modal.innerHTML = `
    <div class="mush-auth-backdrop" data-close-auth></div>

    <section class="mush-auth-card" role="dialog" aria-modal="true">

      <button
        class="mush-auth-close"
        type="button"
        data-close-auth
        aria-label="Close"
      >
        ×
      </button>

      <div class="mush-auth-brand">
        MUSH
      </div>

      <div class="mush-auth-kicker">
        MADE UP SUPS & HEROES
      </div>

      <h2 id="mush-auth-title">
        Enter the MUSH.
      </h2>

      <p id="mush-auth-intro" class="mush-auth-intro">
        Create your account and begin your journey through MUSH.
      </p>

      <div class="mush-auth-tabs">

        <button
          type="button"
          data-mode="signup"
        >
          JOIN MUSH
        </button>

        <button
          type="button"
          data-mode="signin"
        >
          SIGN IN
        </button>

      </div>

      <form id="mush-auth-form">

        <div id="mush-username-wrap">

          <label>
            USERNAME

            <input
              name="username"
              autocomplete="username"
              maxlength="32"
              placeholder="Your MUSH name"
            />

          </label>

        </div>

        <label>
          EMAIL

          <input
            name="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          />

        </label>

        <label>
          PASSWORD

          <input
            name="password"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            placeholder="At least 6 characters"
          />

        </label>

        <button
          class="mush-auth-submit"
          type="submit"
          id="mush-auth-submit"
        >
          Create my MUSH account
        </button>

        <div
          class="mush-auth-status"
          id="mush-auth-status"
          aria-live="polite"
        ></div>

      </form>

      <div class="mush-auth-levels">

        <span>
          LEVEL 1 · EXPLORE
        </span>

        <span>
          LEVEL 2 · CREATE
        </span>

        <span>
          LEVEL 3+ · REALITIES
        </span>

      </div>

    </section>
  `;

  document.body.appendChild(modal);

  /* Close / tab controls */

  modal.addEventListener("click", (event) => {

    const modeButton = event.target.closest("[data-mode]");

    if (modeButton) {

      mode = modeButton.dataset.mode;

      updateAuthModal();

      return;
    }

    if (event.target.closest("[data-close-auth]")) {

      closeAuth();

    }

  });

  /* Form */

  modal
    .querySelector("#mush-auth-form")
    .addEventListener("submit", submitAuthentication);

  return modal;
}


/* ============================================================
   MODAL STATE
   ============================================================ */

function updateAuthModal() {

  createAuthModal();

  const signup = mode === "signup";

  modal.querySelector("#mush-auth-title").textContent =
    signup
      ? "Enter the MUSH."
      : "Welcome back.";

  modal.querySelector("#mush-auth-intro").textContent =
    signup
      ? "Create your account and begin at Level 1. Explore the archive and read five published works to unlock Level 2."
      : "Sign in to continue exploring your worlds, characters, stories and canon.";

  modal.querySelector("#mush-username-wrap").style.display =
    signup
      ? "block"
      : "none";

  modal.querySelector("#mush-auth-submit").textContent =
    signup
      ? "Create my MUSH account"
      : "Enter MUSH";

  modal
    .querySelectorAll("[data-mode]")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );

    });

  modal.querySelector("#mush-auth-status").textContent = "";
}


/* ============================================================
   OPEN / CLOSE
   ============================================================ */

function openAuth(nextMode = "signup") {

  mode = nextMode;

  createAuthModal();

  updateAuthModal();

  modal.classList.add("open");

  setTimeout(() => {

    const input =
      mode === "signup"
        ? modal.querySelector('input[name="username"]')
        : modal.querySelector('input[name="email"]');

    input?.focus();

  }, 50);
}


function closeAuth() {

  if (modal) {

    modal.classList.remove("open");

  }

}


/* ============================================================
   STATUS
   ============================================================ */

function showStatus(message, error = false) {

  const status =
    modal.querySelector("#mush-auth-status");

  status.textContent = message;

  status.className =
    `mush-auth-status ${error ? "error" : "success"}`;
}


/* ============================================================
   SIGN UP / SIGN IN
   ============================================================ */

async function submitAuthentication(event) {

  event.preventDefault();

  if (!supabase) {

    showStatus(
      "Supabase is not connected. Check the Netlify environment variables.",
      true
    );

    return;
  }

  const form =
    new FormData(event.currentTarget);

  const email =
    String(form.get("email") || "").trim();

  const password =
    String(form.get("password") || "");

  const username =
    String(form.get("username") || "").trim();

  const submit =
    modal.querySelector("#mush-auth-submit");

  submit.disabled = true;

  try {

    /* =========================
       SIGN UP
       ========================= */

    if (mode === "signup") {

      if (!username) {

        throw new Error(
          "Choose a MUSH username."
        );

      }

      const { data, error } =
        await supabase.auth.signUp({

          email,

          password,

          options: {

            data: {
              username
            }

          }

        });

      if (error) {

        throw error;

      }

      /*
       * Supabase may require email confirmation.
       */

      if (!data.session) {

        showStatus(
          "Account created. Check your email to confirm your account, then sign in."
        );

      } else {

        showStatus(
          "Welcome to MUSH. Your Level 1 account is ready."
        );

        setTimeout(() => {

          window.location.reload();

        }, 800);

      }

    }

    /* =========================
       SIGN IN
       ========================= */

    else {

      const { error } =
        await supabase.auth.signInWithPassword({

          email,

          password

        });

      if (error) {

        throw error;

      }

      showStatus(
        "Welcome back. Loading your MUSH archive..."
      );

      setTimeout(() => {

        window.location.reload();

      }, 700);

    }

  } catch (error) {

    showStatus(
      error.message ||
      "Authentication failed.",
      true
    );

  } finally {

    submit.disabled = false;

  }

}


/* ============================================================
   AUTH BUTTON CONNECTION
   ============================================================ */

/*
 * This catches the existing MUSH authentication button.
 *
 * We use capture mode so the old prompt-based handler
 * doesn't interfere with the new authentication interface.
 */

document.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest("#authenticate");

    if (!button) return;

    event.preventDefault();

    event.stopImmediatePropagation();

    openAuth("signup");

  },
  true
);


/* ============================================================
   GLOBAL MUSH AUTH API
   ============================================================ */

window.MUSHAuth = {

  open: openAuth,

  signIn: () => openAuth("signin"),

  close: closeAuth

};
