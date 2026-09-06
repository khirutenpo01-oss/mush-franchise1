import { supabase } from "./supabase.js";
import {
  createDraftId,
  getDraft,
  saveDraft,
  deleteDraft,
  saveMedia,
  getDraftMedia,
  deleteDraftMedia
} from "./local-draft-store.js";

let studioState = {
  storyId: null,
  isLocalDraft: true,
  title: "",
  description: "",
  creationMethod: "human",
  aiDisclosure: "",
  chapters: [],
  activeChapter: 0,
  saving: false,
  lastSaved: null
};


/* ==========================================================
   OPEN STORY STUDIO
========================================================== */

export async function openStoryStudio(existingStoryId = null) {
  const user = await getUser();

  if (!user) {
    window.dispatchEvent(
      new CustomEvent("mush:require-auth", {
        detail: {
          destination: "studio"
        }
      })
    );

    return;
  }

  if (existingStoryId) {
    await loadStory(existingStoryId);
  } else {
    createBlankStory();
  }

  renderStoryStudio();
}


/* ==========================================================
   USER
========================================================== */

async function getUser() {
  if (!supabase) return null;

  const {
    data
  } = await supabase.auth.getUser();

  return data?.user || null;
}


/* ==========================================================
   LOCAL STORY
========================================================== */

function createBlankStory() {
  studioState = {
    storyId: createDraftId(),
    isLocalDraft: true,
    title: "",
    description: "",
    creationMethod: "human",
    aiDisclosure: "",
    chapters: [
      {
        id: crypto.randomUUID(),
        title: "Chapter 1",
        content: ""
      }
    ],
    activeChapter: 0,
    saving: false,
    lastSaved: null
  };

  saveLocalDraft();
}


function saveLocalDraft() {
  const draft = {
    id: studioState.storyId,
    title: studioState.title,
    description: studioState.description,
    creationMethod: studioState.creationMethod,
    aiDisclosure: studioState.aiDisclosure,
    chapters: studioState.chapters,
    activeChapter: studioState.activeChapter
  };

  saveDraft(draft);

  studioState.lastSaved = new Date();

  updateSaveStatus(
    "Saved locally"
  );
}


/* ==========================================================
   LOAD EXISTING STORY
========================================================== */

async function loadStory(storyId) {
  const localDraft = getDraft(storyId);

  if (localDraft) {
    studioState = {
      ...studioState,
      ...localDraft,
      storyId,
      isLocalDraft: true
    };

    return;
  }

  const {
    data: story,
    error
  } = await supabase
    .from("content")
    .select("*")
    .eq("id", storyId)
    .maybeSingle();

  if (error) throw error;

  if (!story) {
    throw new Error(
      "Story could not be found."
    );
  }

  const {
    data: versions,
    error: versionsError
  } = await supabase
    .from("content_versions")
    .select("*")
    .eq("content_id", storyId)
    .order("version_number", {
      ascending: true
    });

  if (versionsError)
    throw versionsError;

  const chapters =
    (versions || []).map(
      (version, index) => ({
        id:
          version.id ||
          crypto.randomUUID(),

        title:
          version.chapter_title ||
          `Chapter ${index + 1}`,

        content:
          version.body ||
          version.content ||
          ""
      })
    );

  studioState = {
    storyId,
    isLocalDraft: false,

    title:
      story.title || "",

    description:
      story.description || "",

    creationMethod:
      story.creation_method ||
      "human",

    aiDisclosure:
      story.ai_disclosure ||
      "",

    chapters:
      chapters.length
        ? chapters
        : [
            {
              id: crypto.randomUUID(),
              title: "Chapter 1",
              content: ""
            }
          ],

    activeChapter: 0,
    saving: false,
    lastSaved: null
  };
}


/* ==========================================================
   RENDER
========================================================== */

function renderStoryStudio() {
  const app =
    document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    <section class="story-studio">

      <div class="story-studio-header">

        <div>

          <button
            type="button"
            class="button ghost"
            id="studio-back"
          >
            ← Back
          </button>

          <div class="eyebrow">
            STORY STUDIO
          </div>

          <h1>
            Write your story
          </h1>

          <p id="studio-save-status">
            ${
              studioState.isLocalDraft
                ? "Saved locally"
                : "Loaded from MUSH"
            }
          </p>

        </div>

        <div class="story-studio-actions">

          <button
            type="button"
            class="button ghost"
            id="preview-story"
          >
            Preview
          </button>

          <button
            type="button"
            class="button ghost"
            id="save-story"
          >
            Save Draft
          </button>

          <button
            type="button"
            class="button purple"
            id="publish-story"
          >
            Publish
          </button>

        </div>

      </div>


      <div class="story-studio-grid">

        <aside class="story-sidebar">

          <label>
            Novel / Story name

            <input
              id="story-title"
              maxlength="160"
              value="${escapeHTML(
                studioState.title
              )}"
              placeholder="Your story title"
            />

          </label>


          <div class="story-word-count">

            <strong id="word-count">
              ${wordCount()}
            </strong>

            words

          </div>


          <h3>
            Chapters
          </h3>

          <div id="chapter-list">
            ${renderChapterList()}
          </div>

          <button
            type="button"
            class="button ghost"
            id="add-chapter"
          >
            ＋ Add Chapter
          </button>

        </aside>


        <main class="story-editor">

          <div class="editor-toolbar">

            <button
              type="button"
              data-command="bold"
            >
              <strong>B</strong>
            </button>

            <button
              type="button"
              data-command="italic"
            >
              <em>I</em>
            </button>

            <button
              type="button"
              data-command="underline"
            >
              <u>U</u>
            </button>

          </div>


          <div
            id="editor"
            class="story-editor-content"
            contenteditable="true"
            spellcheck="true"
          >
            ${getActiveChapter().content}
          </div>


          <div class="story-editor-settings">

            <label>

              Description

              <textarea
                id="story-description"
                rows="5"
                placeholder="Describe your story..."
              >${escapeHTML(
                studioState.description
              )}</textarea>

            </label>


            <label>

              Creation method

              <select id="creation-method">

                <option
                  value="human"
                  ${
                    studioState.creationMethod ===
                    "human"
                      ? "selected"
                      : ""
                  }
                >
                  Human created
                </option>

                <option
                  value="ai_assisted"
                  ${
                    studioState.creationMethod ===
                    "ai_assisted"
                      ? "selected"
                      : ""
                  }
                >
                  AI assisted
                </option>

                <option
                  value="ai_generated"
                  ${
                    studioState.creationMethod ===
                    "ai_generated"
                      ? "selected"
                      : ""
                  }
                >
                  AI generated
                </option>

              </select>

            </label>


            <label>

              AI disclosure

              <textarea
                id="ai-disclosure"
                rows="4"
                placeholder="Describe how AI was used, if applicable..."
              >${escapeHTML(
                studioState.aiDisclosure
              )}</textarea>

            </label>

          </div>

        </main>

      </div>

    </section>
  `;

  attachStudioEvents();
}


/* ==========================================================
   CHAPTER LIST
========================================================== */

function renderChapterList() {
  return studioState.chapters
    .map(
      (chapter, index) => `
        <button
          type="button"
          class="chapter-item ${
            index === studioState.activeChapter
              ? "active"
              : ""
          }"
          data-chapter="${index}"
        >
          <span>
            ${escapeHTML(
              chapter.title ||
              `Chapter ${index + 1}`
            )}
          </span>
        </button>
      `
    )
    .join("");
}


/* ==========================================================
   EVENTS
========================================================== */

function attachStudioEvents() {
  const editor =
    document.getElementById("editor");

  const title =
    document.getElementById("story-title");

  const description =
    document.getElementById(
      "story-description"
    );

  const creationMethod =
    document.getElementById(
      "creation-method"
    );

  const aiDisclosure =
    document.getElementById(
      "ai-disclosure"
    );


  document
    .getElementById("studio-back")
    ?.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "mush:navigate",
            {
              detail: {
                page: "home"
              }
            }
          )
        );
      }
    );


  title?.addEventListener(
    "input",
    () => {
      studioState.title =
        title.value;

      queueAutosave();
    }
  );


  description?.addEventListener(
    "input",
    () => {
      studioState.description =
        description.value;

      queueAutosave();
    }
  );


  creationMethod?.addEventListener(
    "change",
    () => {
      studioState.creationMethod =
        creationMethod.value;

      queueAutosave();
    }
  );


  aiDisclosure?.addEventListener(
    "input",
    () => {
      studioState.aiDisclosure =
        aiDisclosure.value;

      queueAutosave();
    }
  );


  editor?.addEventListener(
    "input",
    () => {
      getActiveChapter().content =
        editor.innerHTML;

      updateWordCount();

      queueAutosave();
    }
  );


  document
    .querySelectorAll(
      "[data-command]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const command =
            button.dataset.command;

          document.execCommand(
            command,
            false,
            null
          );

          editor?.focus();

        }
      );

    });


  document
    .querySelectorAll(
      "[data-chapter]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          saveCurrentEditor();

          studioState.activeChapter =
            Number(
              button.dataset.chapter
            );

          renderStoryStudio();

        }
      );

    });


  document
    .getElementById("add-chapter")
    ?.addEventListener(
      "click",
      addChapter
    );


  document
    .getElementById("save-story")
    ?.addEventListener(
      "click",
      async () => {
        saveCurrentEditor();
        saveLocalDraft();
        toast(
          "Draft saved locally."
        );
      }
    );


  document
    .getElementById("publish-story")
    ?.addEventListener(
      "click",
      publishStory
    );


  document
    .getElementById("preview-story")
    ?.addEventListener(
      "click",
      previewStory
    );


  updateWordCount();
}


/* ==========================================================
   AUTOSAVE
========================================================== */

let autosaveTimer = null;

function queueAutosave() {
  clearTimeout(autosaveTimer);

  updateSaveStatus(
    "Unsaved changes"
  );

  autosaveTimer =
    setTimeout(
      () => {

        saveCurrentEditor();
        saveLocalDraft();

      },
      800
    );
}


/* ==========================================================
   CHAPTERS
========================================================== */

function addChapter() {
  saveCurrentEditor();

  studioState.chapters.push({
    id: crypto.randomUUID(),
    title:
      `Chapter ${
        studioState.chapters.length + 1
      }`,
    content: ""
  });

  studioState.activeChapter =
    studioState.chapters.length - 1;

  saveLocalDraft();

  renderStoryStudio();
}


function saveCurrentEditor() {
  const editor =
    document.getElementById("editor");

  if (!editor) return;

  getActiveChapter().content =
    editor.innerHTML;
}


function getActiveChapter() {
  return (
    studioState.chapters[
      studioState.activeChapter
    ] ||
    studioState.chapters[0]
  );
}


/* ==========================================================
   WORD COUNT
========================================================== */

function wordCount() {
  const text =
    studioState.chapters
      .map(chapter =>
        htmlToText(chapter.content)
      )
      .join(" ");

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}


function updateWordCount() {
  const element =
    document.getElementById(
      "word-count"
    );

  if (element) {
    element.textContent =
      wordCount();
  }
}


/* ==========================================================
   PUBLISH
========================================================== */

async function publishStory() {
  saveCurrentEditor();

  if (!studioState.title.trim()) {
    toast(
      "Please give your story a title."
    );

    return;
  }

  if (
    studioState.creationMethod !==
      "human" &&
    !studioState.aiDisclosure.trim()
  ) {
    toast(
      "Please provide the required AI disclosure."
    );

    return;
  }

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

  try {
    studioState.saving = true;

    updateSaveStatus(
      "Publishing..."
    );


    /*
     * Upload local media first.
     */

    const media =
      studioState.isLocalDraft
        ? await getDraftMedia(
            studioState.storyId
          )
        : [];


    const mediaMap =
      new Map();


    for (const item of media) {

      const file =
        item.file;

      const folder =
        file.type.startsWith("image/")
          ? "story-images"
          : file.type.startsWith("video/")
            ? "story-videos"
            : "story-files";

      const url =
        await uploadFile(
          file,
          folder,
          user
        );

      mediaMap.set(
        item.id,
        url
      );
    }


    /*
     * Create or update the content record.
     */

    let contentId =
      studioState.storyId;


    if (studioState.isLocalDraft) {

      const {
        data,
        error
      } =
        await supabase
          .from("content")
          .insert({
            content_type:
              "novel",

            title:
              studioState.title.trim(),

            description:
              studioState.description.trim(),

            creator_id:
              user.id,

            status:
              "published",

            open_user_mode:
              false,

            creation_method:
              studioState.creationMethod,

            ai_disclosure:
              studioState.aiDisclosure.trim()
          })
          .select("id")
          .single();

      if (error)
        throw error;

      contentId =
        data.id;

    } else {

      const {
        error
      } =
        await supabase
          .from("content")
          .update({

            title:
              studioState.title.trim(),

            description:
              studioState.description.trim(),

            creation_method:
              studioState.creationMethod,

            ai_disclosure:
              studioState.aiDisclosure.trim(),

            status:
              "published"

          })
          .eq(
            "id",
            contentId
          );

      if (error)
        throw error;

    }


    /*
     * Save chapters.
     */

    for (
      let index = 0;
      index <
      studioState.chapters.length;
      index++
    ) {

      const chapter =
        studioState.chapters[index];

      const {
        error
      } =
        await supabase
          .from("content_versions")
          .upsert(
            {
              content_id:
                contentId,

              version_number:
                index + 1,

              chapter_title:
                chapter.title,

              body:
                replaceLocalMedia(
                  chapter.content,
                  mediaMap
                )
            },
            {
              onConflict:
                "content_id,version_number"
            }
          );

      if (error)
        throw error;

    }


    /*
     * Delete the local copy only after
     * every Supabase operation succeeded.
     */

    if (studioState.isLocalDraft) {

      await deleteDraftMedia(
        studioState.storyId
      );

      deleteDraft(
        studioState.storyId
      );

    }


    studioState.storyId =
      contentId;

    studioState.isLocalDraft =
      false;

    studioState.saving =
      false;

    updateSaveStatus(
      "Published successfully"
    );

    toast(
      "Your story has been published."
    );

  }

  catch(error) {

    studioState.saving =
      false;

    updateSaveStatus(
      "Saved locally — publish failed"
    );

    toast(
      error.message ||
      "Publishing failed. Your local draft is safe."
    );

    /*
     * Deliberately do NOT delete the local draft.
     */

    saveLocalDraft();

  }
}


/* ==========================================================
   LOCAL MEDIA
========================================================== */

export async function addLocalStoryMedia(
  file
) {
  if (!studioState.isLocalDraft) {
    throw new Error(
      "This story is already published."
    );
  }

  const mediaId =
    await saveMedia(
      studioState.storyId,
      file
    );

  const editor =
    document.getElementById("editor");

  if (!editor)
    return mediaId;

  if (
    file.type.startsWith("image/")
  ) {

    const objectUrl =
      URL.createObjectURL(file);

    editor.insertAdjacentHTML(
      "beforeend",
      `
      <p>
        <img
          src="${objectUrl}"
          data-local-media-id="${mediaId}"
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

    const objectUrl =
      URL.createObjectURL(file);

    editor.insertAdjacentHTML(
      "beforeend",
      `
      <p>
        <video
          src="${objectUrl}"
          data-local-media-id="${mediaId}"
          controls
          style="max-width:100%;border-radius:12px"
        ></video>
      </p>
      `
    );

  }

  else {

    editor.insertAdjacentHTML(
      "beforeend",
      `
      <p>
        <span
          data-local-media-id="${mediaId}"
        >
          📎 ${escapeHTML(file.name)}
        </span>
      </p>
      `
    );

  }

  editor.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );

  return mediaId;
}


/* ==========================================================
   MEDIA UPLOAD
========================================================== */

async function uploadFile(
  file,
  folder,
  user
) {
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
      .from("mush-media")
      .upload(
        path,
        file,
        {
          contentType:
            file.type ||
            "application/octet-stream",

          upsert:
            false
        }
      );

  if (error)
    throw error;

  const {
    data
  } =
    supabase.storage
      .from("mush-media")
      .getPublicUrl(path);

  return data.publicUrl;
}


/* ==========================================================
   MEDIA REPLACEMENT
========================================================== */

function replaceLocalMedia(
  html,
  mediaMap
) {
  const container =
    document.createElement("div");

  container.innerHTML =
    html || "";

  container
    .querySelectorAll(
      "[data-local-media-id]"
    )
    .forEach(element => {

      const id =
        element.dataset
          .localMediaId;

      const url =
        mediaMap.get(id);

      if (!url) return;

      if (
        element.tagName ===
        "IMG"
      ) {

        element.src =
          url;

      }

      else if (
        element.tagName ===
        "VIDEO"
      ) {

        element.src =
          url;

      }

      else {

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.target =
          "_blank";

        link.rel =
          "noopener";

        link.textContent =
          element.textContent;

        element.replaceWith(
          link
        );

      }

      element.removeAttribute(
        "data-local-media-id"
      );

    });

  return container.innerHTML;
}


/* ==========================================================
   PREVIEW
========================================================== */

function previewStory() {
  saveCurrentEditor();

  const overlay =
    document.createElement("div");

  overlay.className =
    "mush-modal-backdrop";

  overlay.innerHTML = `
    <div
      class="mush-modal"
      style="width:min(900px,100%)"
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:20px;
          align-items:center;
        "
      >

        <h2>
          ${escapeHTML(
            studioState.title ||
            "Untitled Story"
          )}
        </h2>

        <button
          type="button"
          class="mush-secondary"
          id="close-preview"
        >
          Close
        </button>

      </div>

      <div
        style="margin-top:20px;line-height:1.8"
      >

        ${studioState.chapters
          .map(
            chapter => `
              <article>

                <h3>
                  ${escapeHTML(
                    chapter.title
                  )}
                </h3>

                <div>
                  ${chapter.content}
                </div>

              </article>
            `
          )
          .join("")}

      </div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );

  overlay
    .querySelector(
      "#close-preview"
    )
    ?.addEventListener(
      "click",
      () => overlay.remove()
    );
}


/* ==========================================================
   STATUS
========================================================== */

function updateSaveStatus(
  message
) {
  const element =
    document.getElementById(
      "studio-save-status"
    );

  if (element) {
    element.textContent =
      message;
  }
}


/* ==========================================================
   HELPERS
========================================================== */

function htmlToText(
  html
) {
  const element =
    document.createElement(
      "div"
    );

  element.innerHTML =
    html || "";

  return element.textContent ||
    element.innerText ||
    "";
}


function escapeHTML(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function toast(
  message
) {
  const old =
    document.getElementById(
      "mush-toast"
    );

  old?.remove();

  const element =
    document.createElement(
      "div"
    );

  element.id =
    "mush-toast";

  element.textContent =
    message;

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

  document.body.appendChild(
    element
  );

  setTimeout(
    () => element.remove(),
    3500
  );
}