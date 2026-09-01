import { supabase } from "./supabase.js";

/*
============================================================
HALO IDENTITY / MUSH AUTHENTICATION
============================================================

MUSH is an application inside the future Halo ecosystem.

This module handles:
- Sign up
- Sign in
- Sign out
- Email verification
- Password reset
- Returning users to the page they requested
============================================================
*/


const authContainer =
  document.getElementById("auth-container");


/* ==========================================================
   AUTH MODAL
========================================================== */

function createAuthModal() {

  if (document.getElementById("halo-auth-modal")) {
    return;
  }

  const modal =
    document.createElement("div");

  modal.id =
    "halo-auth-modal";

  modal.innerHTML = `
    <div class="auth-overlay">

      <div class="auth-modal">

        <button
          class="auth-close"
          id="auth-close"
          aria-label="Close"
        >
          ×
        </button>

        <div class="auth-brand">

          <div class="halo-mark">
            H
          </div>

          <div>
            <strong>
              HALO
            </strong>

            <small>
              ONE IDENTITY · MANY WORLDS
            </small>
          </div>

        </div>


        <div class="auth-heading">

          <span>
            MUSH
          </span>

          <h2 id="auth-title">
            Join MUSH
          </h2>

          <p id="auth-description">
            Create your Halo account to enter MUSH.
          </p>

        </div>


        <form id="auth-form">

          <div
            id="username-field"
            class="auth-field"
          >

            <label>
              Username
            </label>

            <input
              id="auth-username"
              type="text"
              minlength="3"
              maxlength="30"
              autocomplete="username"
              placeholder="Choose your username"
            />

          </div>


          <div class="auth-field">

            <label>
              Email
            </label>

            <input
              id="auth-email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />

          </div>


          <div class="auth-field">

            <label>
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              required
              minlength="8"
              autocomplete="current-password"
              placeholder="At least 8 characters"
            />

          </div>


          <div
            id="confirm-password-field"
            class="auth-field"
          >

            <label>
              Confirm password
            </label>

            <input
              id="auth-confirm-password"
              type="password"
              minlength="8"
              autocomplete="new-password"
              placeholder="Enter your password again"
            />

          </div>


          <div
            id="auth-message"
            class="auth-message"
          ></div>


          <button
            type="submit"
            class="auth-submit"
            id="auth-submit"
          >
            Create Halo Account
          </button>

        </form>


        <div class="auth-switch">

          <span id="auth-switch-text">
            Already have a Halo account?
          </span>

          <button
            id="auth-switch"
            type="button"
          >
            Sign in
          </button>

        </div>


        <button
          id="forgot-password"
          class="forgot-password"
          type="button"
        >
          Forgot password?
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  attachAuthEvents();
}


/* ==========================================================
   AUTH MODE
========================================================== */

let authMode = "signup";


function setAuthMode(mode) {

  authMode = mode;

  const title =
    document.getElementById(
      "auth-title"
    );

  const description =
    document.getElementById(
      "auth-description"
    );

  const usernameField =
    document.getElementById(
      "username-field"
    );

  const confirmField =
    document.getElementById(
      "confirm-password-field"
    );

  const submit =
    document.getElementById(
      "auth-submit"
    );

  const switchText =
    document.getElementById(
      "auth-switch-text"
    );

  const switchButton =
    document.getElementById(
      "auth-switch"
    );

  const forgot =
    document.getElementById(
      "forgot-password"
    );


  clearMessage();


  if (mode === "signup") {

    title.textContent =
      "Join MUSH";

    description.textContent =
      "Create your Halo account to enter MUSH.";

    usernameField.style.display =
      "block";

    confirmField.style.display =
      "block";

    submit.textContent =
      "Create Halo Account";

    switchText.textContent =
      "Already have a Halo account?";

    switchButton.textContent =
      "Sign in";

    forgot.style.display =
      "none";

  } else {

    title.textContent =
      "Welcome back";

    description.textContent =
      "Sign in to continue your MUSH journey.";

    usernameField.style.display =
      "none";

    confirmField.style.display =
      "none";

    submit.textContent =
      "Sign in to MUSH";

    switchText.textContent =
      "New to Halo?";

    switchButton.textContent =
      "Create account";

    forgot.style.display =
      "block";
  }
}


/* ==========================================================
   OPEN / CLOSE
========================================================== */

function openAuth(mode = "signup") {

  createAuthModal();

  const modal =
    document.getElementById(
      "halo-auth-modal"
    );

  modal.classList.add("visible");

  setAuthMode(mode);

  document
    .getElementById("auth-email")
    ?.focus();
}


function closeAuth() {

  const modal =
    document.getElementById(
      "halo-auth-modal"
    );

  if (modal) {
    modal.classList.remove(
      "visible"
    );
  }
}


/* ==========================================================
   EVENTS
========================================================== */

function attachAuthEvents() {

  document
    .getElementById("auth-close")
    .addEventListener(
      "click",
      closeAuth
    );


  document
    .getElementById("auth-switch")
    .addEventListener(
      "click",
      () => {

        setAuthMode(
          authMode === "signup"
            ? "signin"
            : "signup"
        );

      }
    );


  document
    .getElementById("auth-form")
    .addEventListener(
      "submit",
      handleAuthSubmit
    );


  document
    .getElementById("forgot-password")
    .addEventListener(
      "click",
      handlePasswordReset
    );


  document
    .querySelector(
      ".auth-overlay"
    )
    .addEventListener(
      "click",
      event => {

        if (
          event.target.classList.contains(
            "auth-overlay"
          )
        ) {
          closeAuth();
        }

      }
    );

}


/* ==========================================================
   SUBMIT
========================================================== */

async function handleAuthSubmit(event) {

  event.preventDefault();

  if (!supabase) {

    showMessage(
      "Authentication is not configured yet.",
      "error"
    );

    return;
  }


  const email =
    document
      .getElementById(
        "auth-email"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "auth-password"
      )
      .value;


  const username =
    document
      .getElementById(
        "auth-username"
      )
      .value
      .trim();


  setLoading(true);


  try {

    if (authMode === "signup") {

      const confirmPassword =
        document
          .getElementById(
            "auth-confirm-password"
          )
          .value;


      if (
        !username ||
        username.length < 3
      ) {

        throw new Error(
          "Choose a username with at least 3 characters."
        );

      }


      if (
        password !==
        confirmPassword
      ) {

        throw new Error(
          "Your passwords do not match."
        );

      }


      const {
        data,
        error
      } =
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
       * The database trigger created earlier
       * automatically creates the user's
       * notification/content preference rows.
       */

      if (data.user) {

        showMessage(
          "Account created. Check your email to verify your Halo account.",
          "success"
        );

        setTimeout(
          () => {
            closeAuth();
          },
          2500
        );

      }


    } else {

      const {
        data,
        error
      } =
        await supabase.auth.signInWithPassword({

          email,

          password

        });


      if (error) {
        throw error;
      }


      if (data.session) {

        showMessage(
          "Welcome back to MUSH.",
          "success"
        );

        setTimeout(
          () => {

            closeAuth();

            returnToRequestedPage();

          },
          700
        );

      }

    }

  } catch (error) {

    showMessage(
      friendlyAuthError(
        error
      ),
      "error"
    );

  } finally {

    setLoading(false);

  }

}


/* ==========================================================
   PASSWORD RESET
========================================================== */

async function handlePasswordReset() {

  const email =
    document
      .getElementById(
        "auth-email"
      )
      .value
      .trim();


  if (!email) {

    showMessage(
      "Enter your email address first.",
      "error"
    );

    return;
  }


  setLoading(true);


  try {

    const {
      error
    } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/`
        }
      );


    if (error) {
      throw error;
    }


    showMessage(
      "Password reset instructions have been sent to your email.",
      "success"
    );

  } catch (error) {

    showMessage(
      friendlyAuthError(
        error
      ),
      "error"
    );

  } finally {

    setLoading(false);

  }

}


/* ==========================================================
   RETURN AFTER AUTH
========================================================== */

function returnToRequestedPage() {

  const destination =
    sessionStorage.getItem(
      "mush_redirect_after_auth"
    );


  sessionStorage.removeItem(
    "mush_redirect_after_auth"
  );


  if (
    destination
  ) {

    window.dispatchEvent(
      new CustomEvent(
        "mush:navigate",
        {
          detail: {
            page: destination
          }
        }
      )
    );

    return;
  }


  window.dispatchEvent(
    new CustomEvent(
      "mush:navigate",
      {
        detail: {
          page: "studio"
        }
      }
    )
  );

}


/* ==========================================================
   UI HELPERS
========================================================== */

function setLoading(loading) {

  const button =
    document.getElementById(
      "auth-submit"
    );

  if (!button) return;


  button.disabled =
    loading;

  button.textContent =
    loading
      ? "Please wait..."
      : authMode === "signup"
        ? "Create Halo Account"
        : "Sign in to MUSH";
}


function showMessage(
  message,
  type = "error"
) {

  const element =
    document.getElementById(
      "auth-message"
    );

  if (!element) return;

  element.textContent =
    message;

  element.className =
    `auth-message ${type}`;
}


function clearMessage() {

  const element =
    document.getElementById(
      "auth-message"
    );

  if (!element) return;

  element.textContent =
    "";

  element.className =
    "auth-message";
}


/* ==========================================================
   ERROR TRANSLATION
========================================================== */

function friendlyAuthError(
  error
) {

  const message =
    String(
      error?.message ||
      error ||
      ""
    );


  if (
    message
      .toLowerCase()
      .includes(
        "user already registered"
      )
  ) {

    return (
      "An account already exists with this email. Try signing in."
    );

  }


  if (
    message
      .toLowerCase()
      .includes(
        "invalid login credentials"
      )
  ) {

    return (
      "Incorrect email or password."
    );

  }


  if (
    message
      .toLowerCase()
      .includes(
        "password should be at least"
      )
  ) {

    return (
      "Your password needs to be at least 8 characters."
    );

  }


  return message ||
    "Something went wrong. Please try again.";
}


/* ==========================================================
   MUSH AUTH EVENT
========================================================== */

window.addEventListener(
  "mush:require-auth",
  () => {

    openAuth(
      "signup"
    );

  }
);


/* ==========================================================
   INITIALIZE
========================================================== */

createAuthModal();