import { supabase } from "./supabase.js";
import { openStoryStudio } from "./story-studio.js";

const BUCKET = "mush-media";
const app = document.getElementById("app");

/* ==========================================================
   STYLES
========================================================== */

const style = document.createElement("style");

style.textContent = `
.mush-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(8px);
}

.mush-modal {
  width: min(520px,100%);
  max-height: 90vh;
  overflow:auto;
  background:#111020;
  color:white;
  border:1px solid rgba(255,255,255,.12);
  border-radius:20px;
  padding:28px;
  box-shadow:0 30px 80px rgba(0,0,0,.5);
}

.mush-modal h2 {
  margin-top:0;
}

.mush-form {
  display:grid;
  gap:14px;
}

.mush-form label {
  display:grid;
  gap:6px;
}

.mush-form input,
.mush-form textarea,
.mush-form select {
  width:100%;
  box-sizing:border-box;
  padding:12px;
  border-radius:10px;
  border:1px solid rgba(255,255,255,.15);
  background:#1b1a2c;
  color:white;
}

.mush-actions {
  display:flex;
  gap:10px;
  justify-content:flex-end;
  margin-top:10px;
}

.mush-actions button {
  padding:11px 16px;
  border:0;
  border-radius:10px;
  cursor:pointer;
}

.mush-primary {
  background:#7547ff;
  color:white;
}

.mush-secondary {
  background:#29283a;
  color:white;
}

.mush-create-row {
  display:flex;
  gap:10px;
  margin:20px 0;
}

.mush-profile {
  padding:25px;
  border-radius:18px;
  background:rgba(255,255,255,.04);
}

.mush-profile-grid {
  display:grid;
  grid-template-columns:150px 1fr;
  gap:30px;
}

.mush-avatar {
  width:140px;
  height:140px;
  border-radius:50%;
  background:#27263b;
  display:grid;
  place-items:center;
  overflow:hidden;
  font-size:48px;
}

.mush-avatar img {
  width:100%;
  height:100%;
  object-fit:cover;
}

.mush-stats {
  display:flex;
  gap:12px;
  margin:20px 0;
}

.mush-stat {
  padding:14px 18px;
  border-radius:12px;
  background:rgba(255,255,255,.06);
}

.mush-stat strong {
  display:block;
  font-size:22px;
}

.mush-story-upload {
  margin-left:8px;
}

@media(max-width:700px) {
  .mush-profile-grid {
    grid-template-columns:1fr;
  }
}
`;

document.head.appendChild(style);


/* ==========================================================
   HELPERS
========================================================== */

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function getUser() {
  if (!supabase) return null;

  const {
    data
  } = await supabase.auth.getUser();

  return data?.user || null;
}

function toast(message) {
  const old = document.getElementById("mush-toast");
  old?.remove();

  const element = document.createElement("div");

  element.id = "mush-toast";

  element.textContent = message;

  element.style.cssText = `
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:11000;
    padding:14px 18px;
    border-radius:12px;
    background:#34246f;
    color:white;
    box-shadow:0 15px 40px rgba(0,0,0,.4);
  `;

  document.body.appendChild(element);

  setTimeout(() => element.remove(),3500);
}

function pickFiles(accept,multiple,callback) {

  const input =
    document.createElement("input");

  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  input.style.display = "none";

  document.body.appendChild(input);

  input.addEventListener(
    "change",
    async () => {

      const files =
        [...input.files];

      input.remove();

      if (files.length) {
        await callback(files);
      }

    },
    { once:true }
  );

  input.click();
}


/* ==========================================================
   STORAGE
========================================================== */

async function uploadFile(file,folder) {

  const user = await getUser();

  if (!user) {
    throw new Error(
      "You must be signed in to upload files."
    );
  }

  const cleanName =
    file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

  const path =
    `${user.id}/${folder}/${crypto.randomUUID()}-${cleanName}`;

  const {
    error
  } =
    await supabase.storage
      .from(BUCKET)
      .upload(
        path,
        file,
        {
          contentType:file.type,
          upsert:false
        }
      );

  if (error) throw error;

  const {
    data
  } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

  return data.publicUrl;
}


/* ==========================================================
   NEW STORY
========================================================== */

function newStoryDialog() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "mush-modal-backdrop";

  wrapper.innerHTML = `
    <div class="mush-modal">

      <h2>
        Name your novel
      </h2>

      <p>
        Every story begins with its name.
      </p>

      <form class="mush-form" id="mush-new-story-form">

        <label>
          Novel / Story name

          <input
            id="mush-story-name"
            required
            maxlength="160"
            placeholder="Enter your novel's name"
          />
        </label>

        <div class="mush-actions">

          <button
            type="button"
            class="mush-secondary"
            id="mush-story-cancel"
          >
            Cancel
          </button>

          <button
            class="mush-primary"
          >
            Continue
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(wrapper);

  const close = () =>
    wrapper.remove();

  wrapper
    .querySelector("#mush-story-cancel")
    .addEventListener(
      "click",
      close
    );

  wrapper
    .querySelector("form")
    .addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const title =
          document
            .getElementById(
              "mush-story-name"
            )
            .value
            .trim();

        if (!title) return;

        close();

        await openStoryStudio();

        const titleInput =
          document.getElementById(
            "story-title"
          );

        if (titleInput) {

          titleInput.value =
            title;

          titleInput.dispatchEvent(
            new Event(
              "input",
              { bubbles:true }
            )
          );

        }

      }
    );
}


/* ==========================================================
   STORY STUDIO UPLOADS
========================================================== */

function addStoryUploadButton() {

  const toolbar =
    document.querySelector(
      ".story-editor .editor-toolbar"
    );

  if (
    !toolbar ||
    document.getElementById(
      "mush-story-upload"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.id =
    "mush-story-upload";

  button.type =
    "button";

  button.className =
    "mush-story-upload";

  button.textContent =
    "＋ Media / Text";

  toolbar.appendChild(button);

  button.addEventListener(
    "click",
    () => {

      pickFiles(
        "image/*,video/*,.txt,.md,.json,.csv,.pdf,.doc,.docx",
        true,
        insertStoryFiles
      );

    }
  );
}


async function insertStoryFiles(files) {

  const editor =
    document.getElementById(
      "editor"
    );

  if (!editor) return;

  for (const file of files) {

    try {

      if (
        file.type.startsWith("image/")
      ) {

        const url =
          await uploadFile(
            file,
            "story-images"
          );

        editor.insertAdjacentHTML(
          "beforeend",
          `
          <p>
            <img
              src="${url}"
              alt="${escapeHTML(file.name)}"
              style="max-width:100%;border-radius:12px"
            />
          </p>
          `
        );

      }

      else if (
        file.type.startsWith("video/")
      ) {

        const url =
          await uploadFile(
            file,
            "story-videos"
          );

        editor.insertAdjacentHTML(
          "beforeend",
          `
          <p>
            <video
              src="${url}"
              controls
              style="max-width:100%;border-radius:12px"
            ></video>
          </p>
          `
        );

      }

      else if (
        /\.(txt|md|json|csv)$/i.test(
          file.name
        )
      ) {

        const text =
          await file.text();

        editor.insertAdjacentHTML(
          "beforeend",
          `
          <p>
            ${escapeHTML(text)
              .replaceAll("\n","<br>")}
          </p>
          `
        );

      }

      else {

        const url =
          await uploadFile(
            file,
            "story-files"
          );

        editor.insertAdjacentHTML(
          "beforeend",
          `
          <p>
            <a
              href="${url}"
              target="_blank"
              rel="noopener"
            >
              ${escapeHTML(file.name)}
            </a>
          </p>
          `
        );

      }

      editor.dispatchEvent(
        new Event(
          "input",
          { bubbles:true }
        )
      );

      toast(
        `${file.name} added to your chapter.`
      );

    }

    catch(error) {

      toast(
        error.message ||
        "Upload failed."
      );

    }

  }

}


/* ==========================================================
   VIDEO / GENERAL UPLOAD
========================================================== */

async function uploadMushContent(files) {

  const user =
    await getUser();

  if (!user) {

    window.dispatchEvent(
      new CustomEvent(
        "mush:require-auth"
      )
    );

    return;
  }

  for (const file of files) {

    try {

      const url =
        await uploadFile(
          file,
          "content"
        );

      let type =
        "story";

      if (
        file.type.startsWith("video/")
      ) {
        type = "video";
      }

      else if (
        file.type.startsWith("image/")
      ) {
        type = "artwork";
      }

      const {
        error
      } =
        await supabase
          .from("content")
          .insert({

            content_type:type,

            title:
              file.name
                .replace(
                  /\.[^.]+$/,
                  ""
                ),

            description:
              `Uploaded from device: ${file.name}`,

            creator_id:
              user.id,

            status:
              "draft",

            open_user_mode:
              false,

            creation_method:
              "human"

          });

      if (error) {

        toast(
          `Upload succeeded, but MUSH could not create the content record: ${error.message}`
        );

      }

      else {

        toast(
          `${file.name} uploaded successfully.`
        );

      }

      console.log(
        "Uploaded file:",
        url
      );

    }

    catch(error) {

      toast(
        error.message ||
        "Upload failed."
      );

    }

  }

}


/* ==========================================================
   CHARACTERS
========================================================== */

function createCharacterDialog() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "mush-modal-backdrop";

  wrapper.innerHTML = `
    <div class="mush-modal">

      <h2>Create Character</h2>

      <form
        class="mush-form"
        id="mush-character-form"
      >

        <label>
          Character name

          <input
            id="character-name"
            required
          />
        </label>

        <label>
          Description

          <textarea
            id="character-description"
            rows="4"
          ></textarea>
        </label>

        <label>
          Realm

          <input
            id="character-realm"
            type="number"
            min="1"
            max="12"
            value="1"
            required
          />
        </label>

        <label>
          Tier

          <select id="character-tier">

            <option>f</option>
            <option>e</option>
            <option>d</option>
            <option>c</option>
            <option>b</option>
            <option>a</option>
            <option>s</option>
            <option>ss</option>
            <option>sss</option>

          </select>
        </label>

        <label>
          Character image

          <input
            id="character-image"
            type="file"
            accept="image/*"
          />
        </label>

        <div class="mush-actions">

          <button
            type="button"
            class="mush-secondary"
            id="character-cancel"
          >
            Cancel
          </button>

          <button
            class="mush-primary"
          >
            Create Character
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(wrapper);

  const close =
    () => wrapper.remove();

  document
    .getElementById(
      "character-cancel"
    )
    .onclick = close;

  wrapper
    .querySelector("form")
    .addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const user =
          await getUser();

        if (!user) return;

        try {

          const image =
            document
              .getElementById(
                "character-image"
              )
              .files[0];

          if (image) {

            await uploadFile(
              image,
              "characters"
            );

          }

          const {
            error
          } =
            await supabase
              .from("characters")
              .insert({

                name:
                  document
                    .getElementById(
                      "character-name"
                    )
                    .value
                    .trim(),

                description:
                  document
                    .getElementById(
                      "character-description"
                    )
                    .value
                    .trim(),

                creator_id:
                  user.id,

                realm:
                  Number(
                    document
                      .getElementById(
                        "character-realm"
                      )
                      .value
                  ),

                tier:
                  document
                    .getElementById(
                      "character-tier"
                    )
                    .value,

                status:
                  "draft",

                open_user_mode:
                  false

              });

          if (error)
            throw error;

          close();

          toast(
            "Character created."
          );

        }

        catch(error) {

          toast(
            error.message ||
            "Character creation failed."
          );

        }

      }
    );

}


/* ==========================================================
   WORLDS
========================================================== */

function createWorldDialog() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "mush-modal-backdrop";

  wrapper.innerHTML = `
    <div class="mush-modal">

      <h2>Create World</h2>

      <form
        class="mush-form"
        id="mush-world-form"
      >

        <label>
          World name

          <input
            id="world-name"
            required
          />
        </label>

        <label>
          Description

          <textarea
            id="world-description"
            rows="5"
          ></textarea>
        </label>

        <label>
          Cover image

          <input
            id="world-cover"
            type="file"
            accept="image/*"
          />
        </label>

        <div class="mush-actions">

          <button
            type="button"
            class="mush-secondary"
            id="world-cancel"
          >
            Cancel
          </button>

          <button
            class="mush-primary"
          >
            Create World
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(wrapper);

  const close =
    () => wrapper.remove();

  document
    .getElementById(
      "world-cancel"
    )
    .onclick = close;

  wrapper
    .querySelector("form")
    .addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const user =
          await getUser();

        if (!user) return;

        try {

          let coverUrl = null;

          const cover =
            document
              .getElementById(
                "world-cover"
              )
              .files[0];

          if (cover) {

            coverUrl =
              await uploadFile(
                cover,
                "worlds"
              );

          }

          const {
            error
          } =
            await supabase
              .from("worlds")
              .insert({

                name:
                  document
                    .getElementById(
                      "world-name"
                    )
                    .value
                    .trim(),

                description:
                  document
                    .getElementById(
                      "world-description"
                    )
                    .value
                    .trim(),

                creator_id:
                  user.id,

                cover_url:
                  coverUrl,

                status:
                  "draft"

              });

          if (error)
            throw error;

          close();

          toast(
            "World created."
          );

        }

        catch(error) {

          toast(
            error.message ||
            "World creation failed."
          );

        }

      }
    );

}


/* ==========================================================
   PROFILE
========================================================== */

async function showProfile() {

  const user =
    await getUser();

  if (!user) {

    window.dispatchEvent(
      new CustomEvent(
        "mush:require-auth"
      )
    );

    return;
  }

  const {
    data: profile
  } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id",user.id)
      .maybeSingle();

  const {
    count: followers
  } =
    await supabase
      .from("follows")
      .select(
        "id",
        {
          count:"exact",
          head:true
        }
      )
      .eq(
        "target_type",
        "profile"
      )
      .eq(
        "target_id",
        user.id
      );

  const {
    count: following
  } =
    await supabase
      .from("follows")
      .select(
        "id",
        {
          count:"exact",
          head:true
        }
      )
      .eq(
        "follower_id",
        user.id
      );

  app.innerHTML = `

    <div class="page-heading">

      <div class="eyebrow">
        ACCOUNT
      </div>

      <h1>
        Your Profile
      </h1>

      <p>
        Manage your Halo identity and MUSH account.
      </p>

    </div>

    <div class="mush-profile">

      <div class="mush-profile-grid">

        <div>

          <div class="mush-avatar">

            ${
              profile?.avatar_url

                ? `
                  <img
                    src="${profile.avatar_url}"
                    alt="Profile image"
                  />
                `

                : escapeHTML(
                    (
                      profile?.username ||
                      user.email ||
                      "M"
                    )
                    .charAt(0)
                    .toUpperCase()
                  )
            }

          </div>

          <input
            id="profile-image"
            type="file"
            accept="image/*"
          />

        </div>


        <div>

          <h2>
            ${escapeHTML(
              profile?.username ||
              "MUSH Member"
            )}
          </h2>

          <div class="mush-stats">

            <div class="mush-stat">

              <strong>
                ${followers || 0}
              </strong>

              Followers

            </div>

            <div class="mush-stat">

              <strong>
                ${following || 0}
              </strong>

              Following

            </div>

            <div class="mush-stat">

              <strong>
                ${profile?.membership_level || 1}
              </strong>

              Membership

            </div>

          </div>


          <form
            id="profile-form"
            class="mush-form"
          >

            <label>

              Username

              <input
                id="profile-username"
                value="${escapeHTML(
                  profile?.username || ""
                )}"
                minlength="3"
                maxlength="30"
                required
              />

            </label>

            <label>

              Email

              <input
                value="${escapeHTML(
                  user.email || ""
                )}"
                disabled
              />

            </label>


            <div class="mush-actions">

              <button
                class="mush-primary"
              >
                Save Profile
              </button>

              <button
                type="button"
                class="mush-secondary"
                id="profile-logout"
              >
                Log out
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  `;


  document
    .getElementById(
      "profile-form"
    )
    .addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const username =
          document
            .getElementById(
              "profile-username"
            )
            .value
            .trim();

        const {
          error
        } =
          await supabase
            .from("profiles")
            .update({ username })
            .eq("id",user.id);

        if (error)
          toast(error.message);
        else
          toast(
            "Profile updated."
          );

      }
    );


  document
    .getElementById(
      "profile-image"
    )
    .addEventListener(
      "change",
      async event => {

        const file =
          event.target.files[0];

        if (!file) return;

        try {

          const url =
            await uploadFile(
              file,
              "avatars"
            );

          const {
            error
          } =
            await supabase
              .from("profiles")
              .update({
                avatar_url:url
              })
              .eq(
                "id",
                user.id
              );

          if (error)
            throw error;

          toast(
            "Profile image updated."
          );

          showProfile();

        }

        catch(error) {

          toast(
            error.message
          );

        }

      }
    );


  document
    .getElementById(
      "profile-logout"
    )
    .addEventListener(
      "click",
      async () => {

        await supabase
          .auth
          .signOut();

        window.dispatchEvent(
          new CustomEvent(
            "mush:navigate",
            {
              detail:{
                page:"home"
              }
            }
          )
        );

      }
    );

}


/* ==========================================================
   PAGE ENHANCEMENT
========================================================== */

function enhancePage() {

  if (!app) return;

  /*
   * Story Studio
   */

  addStoryUploadButton();


  /*
   * Video upload
   */

  const videoUpload =
    document.getElementById(
      "upload-video"
    );

  if (
    videoUpload &&
    !videoUpload.dataset.enhanced
  ) {

    videoUpload.dataset.enhanced =
      "true";

    videoUpload.addEventListener(
      "click",
      () => {

        pickFiles(
          "video/*,image/*,.txt,.md,.json,.csv,.pdf,.doc,.docx",
          true,
          uploadMushContent
        );

      }
    );

  }


  /*
   * Characters
   */

  const heading =
    document.querySelector(
      ".page-heading"
    );

  if (
    heading &&
    /CHARACTERS/i.test(
      heading.textContent
    ) &&
    !document.getElementById(
      "create-character"
    )
  ) {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "mush-create-row";

    row.innerHTML = `
      <button
        class="button purple"
        id="create-character"
      >
        ＋ Create Character
      </button>
    `;

    heading.after(row);

    document
      .getElementById(
        "create-character"
      )
      .addEventListener(
        "click",
        createCharacterDialog
      );

  }


  /*
   * Worlds
   */

  if (
    heading &&
    /WORLDS/i.test(
      heading.textContent
    ) &&
    !document.getElementById(
      "create-world"
    )
  ) {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "mush-create-row";

    row.innerHTML = `
      <button
        class="button purple"
        id="create-world"
      >
        ＋ Create World
      </button>
    `;

    heading.after(row);

    document
      .getElementById(
        "create-world"
      )
      .addEventListener(
        "click",
        createWorldDialog
      );

  }

}


/* ==========================================================
   EVENTS
========================================================== */

/*
 * Capture this before main.js's existing
 * New Story listener.
 */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "#new-story"
      );

    if (!button) return;

    event.preventDefault();

    event.stopImmediatePropagation();

    newStoryDialog();

  },
  true
);


/*
 * Profile button.
 */

document.addEventListener(
  "click",
  event => {

    const profile =
      event.target.closest(
        ".profile"
      );

    if (!profile) return;

    event.preventDefault();

    showProfile();

  },
  true
);


/*
 * Re-run enhancements whenever
 * main.js changes the page.
 */

const observer =
  new MutationObserver(
    () => {

      setTimeout(
        enhancePage,
        0
      );

    }
  );

if (app) {

  observer.observe(
    app,
    {
      childList:true,
      subtree:true
    }
  );

}

enhancePage();