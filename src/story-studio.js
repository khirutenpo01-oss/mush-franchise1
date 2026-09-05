import { supabase } from "./supabase.js";

/*
============================================================
MUSH STORY STUDIO
============================================================

The first functional MUSH writing environment.

Current capabilities:
- Create story
- Edit story
- Create chapters
- Autosave
- Word count
- AI disclosure
- Preview
- Publish
============================================================
*/

let studioState = {
  storyId: null,
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
   OPEN STUDIO
========================================================== */

export async function openStoryStudio(
  existingStoryId = null
) {

  if (!supabase) {
    showStudioError(
      "Supabase is not configured."
    );

    return;
  }


  const {
    data: {
      user
    }
  } =
    await supabase.auth.getUser();


  if (!user) {

    window.dispatchEvent(
      new CustomEvent(
        "mush:require-auth"
      )
    );

    return;
  }


  if (existingStoryId) {

    await loadStory(
      existingStoryId
    );

  } else {

    createBlankStory();

  }


  renderStudio();
}


/* ==========================================================
   NEW STORY
========================================================== */

function createBlankStory() {

  studioState = {

    storyId: null,

    title: "",

    description: "",

    creationMethod:
      "human",

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

}


/* ==========================================================
   LOAD STORY
========================================================== */

async function loadStory(
  storyId
) {

  const {
    data: story,
    error
  } =
    await supabase
      .from("content")
      .select("*")
      .eq("id", storyId)
      .maybeSingle();


  if (error) {

    showStudioError(
      error.message
    );

    return;
  }


  if (!story) {

    showStudioError(
      "Story not found."
    );

    return;
  }


  studioState.storyId =
    story.id;

  studioState.title =
    story.title || "";

  studioState.description =
    story.description || "";

  studioState.creationMethod =
    story.creation_method ||
    "human";

  studioState.aiDisclosure =
    story.ai_disclosure ||
    "";


  /*
   * Content versions contain the
   * actual written material.
   */

  const {
    data: versions
  } =
    await supabase
      .from("content_versions")
      .select("*")
      .eq(
        "content_id",
        storyId
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (
    versions &&
    versions.length
  ) {

    studioState.chapters =
      versions.map(
        (version, index) => ({
          id: version.id,

          title:
            version.title ||
            `Chapter ${index + 1}`,

          content:
  extractChapterContent(
    version.body
  )
        })
      );

  }


  if (
    !studioState.chapters.length
  ) {

    studioState.chapters = [
      {
        id: crypto.randomUUID(),

        title: "Chapter 1",

        content: ""
      }
    ];

  }

}


/* ==========================================================
   RENDER
========================================================== */

function renderStudio() {

  const app =
    document.getElementById(
      "app"
    );


  if (!app) return;


  app.innerHTML = `

    <div class="story-studio">

      <header class="studio-header">

        <div>

          <button
            class="studio-back"
            id="studio-back"
          >
            ← Back to MUSH
          </button>

        </div>


        <div class="studio-status">

          <span
            id="save-status"
          >
            ${
              studioState.lastSaved
                ? "Saved"
                : "Not saved"
            }
          </span>

          <span>
            •
          </span>

          <span id="word-count">
            0 words
          </span>

        </div>


        <div class="studio-actions">

          <button
            class="studio-preview"
            id="preview-story"
          >
            Preview
          </button>

          <button
            class="studio-save"
            id="save-story"
          >
            Save Draft
          </button>

          <button
            class="studio-publish"
            id="publish-story"
          >
            Publish
          </button>

        </div>

      </header>


      <div class="studio-layout">


        <!-- LEFT SIDEBAR -->

        <aside class="chapter-sidebar">

          <div class="chapter-heading">

            <span>
              STORY
            </span>

            <button
              id="add-chapter"
            >
              ＋
            </button>

          </div>


          <input
            id="story-title"
            class="story-title-input"
            placeholder="Untitled Story"
            value="${escapeHTML(
              studioState.title
            )}"
          />


          <div
            id="chapter-list"
            class="chapter-list"
          >

            ${renderChapters()}

          </div>


          <div class="studio-meta">

            <span>
              CREATION METHOD
            </span>

            <select
              id="creation-method"
            >

              <option
                value="human"
                ${
                  studioState.creationMethod ===
                  "human"
                    ? "selected"
                    : ""
                }
              >
                Human
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
                AI Assisted
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
                AI Generated
              </option>

            </select>


            <textarea
              id="ai-disclosure"
              placeholder="Optional AI disclosure..."
            >${escapeHTML(
              studioState.aiDisclosure
            )}</textarea>

          </div>

        </aside>


        <!-- EDITOR -->

        <main class="story-editor">

          <div class="editor-title">

            <input
              id="chapter-title"
              value="${escapeHTML(
                studioState
                  .chapters[
                    studioState.activeChapter
                  ]?.title ||
                  "Chapter 1"
              )}"
              placeholder="Chapter title"
            />

          </div>


          <div class="editor-toolbar">

            <button
              data-command="bold"
              title="Bold"
            >
              B
            </button>

            <button
              data-command="italic"
              title="Italic"
            >
              I
            </button>

            <button
              data-command="underline"
              title="Underline"
            >
              U
            </button>

            <span></span>

            <button
              data-command="formatBlock"
              data-value="h2"
            >
              H2
            </button>

            <button
              data-command="formatBlock"
              data-value="blockquote"
            >
              ❝
            </button>

          </div>


          <div
            id="editor"
            class="editor"
            contenteditable="true"
            spellcheck="true"
            data-placeholder="Begin your story..."
          >
            ${
              studioState
                .chapters[
                  studioState.activeChapter
                ]?.content || ""
            }
          </div>


          <div class="editor-footer">

            <span id="editor-word-count">
              0 words
            </span>

            <span>
              MUSH STORY STUDIO
            </span>

          </div>

        </main>


        <!-- RIGHT PANEL -->

        <aside class="story-settings">

          <div class="settings-heading">
            STORY DETAILS
          </div>


          <label>
            Description
          </label>

          <textarea
            id="story-description"
            placeholder="Tell readers what this story is about..."
          >${escapeHTML(
            studioState.description
          )}</textarea>


          <div class="setting-divider"></div>


          <div class="settings-heading">
            CONTENT TRANSPARENCY
          </div>


          <div class="transparency-card">

            <strong>
              ${
                studioState.creationMethod ===
                "human"
                  ? "Human created"
                  : studioState.creationMethod ===
                    "ai_assisted"
                    ? "AI assisted"
                    : "AI generated"
              }
            </strong>

            <p>
              MUSH requires creators to identify
              how their content was made.
            </p>

          </div>


          <div class="setting-divider"></div>


          <div class="settings-heading">
            PUBLICATION
          </div>


          <label class="toggle-row">

            <span>
              Public
            </span>

            <input
              type="checkbox"
              id="public-toggle"
              checked
            />

          </label>


          <div class="publication-note">

            You control when your work becomes
            part of the public MUSH archive.

          </div>

        </aside>

      </div>

    </div>
  `;


  attachStudioEvents();

  updateWordCount();

}


/* ==========================================================
   CHAPTER LIST
========================================================== */

function renderChapters() {

  return studioState
    .chapters
    .map(
      (chapter, index) => `

        <button
          class="
            chapter-item
            ${
              index ===
              studioState.activeChapter
                ? "active"
                : ""
            }
          "
          data-chapter="${index}"
        >

          <span>
            ${index + 1}
          </span>

          <div>

            <strong>
              ${escapeHTML(
                chapter.title ||
                `Chapter ${index + 1}`
              )}
            </strong>

            <small>
              ${wordCount(
                chapter.content
              )} words
            </small>

          </div>

        </button>

      `
    )
    .join("");
}


/* ==========================================================
   EVENTS
========================================================== */

function attachStudioEvents() {

  document
    .getElementById(
      "studio-back"
    )
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


  document
    .getElementById(
      "story-title"
    )
    ?.addEventListener(
      "input",
      event => {

        studioState.title =
          event.target.value;

        queueAutosave();

      }
    );


  document
    .getElementById(
      "story-description"
    )
    ?.addEventListener(
      "input",
      event => {

        studioState.description =
          event.target.value;

        queueAutosave();

      }
    );


  document
    .getElementById(
      "creation-method"
    )
    ?.addEventListener(
      "change",
      event => {

        studioState.creationMethod =
          event.target.value;

        queueAutosave();

        updateTransparency();

      }
    );


  document
    .getElementById(
      "ai-disclosure"
    )
    ?.addEventListener(
      "input",
      event => {

        studioState.aiDisclosure =
          event.target.value;

        queueAutosave();

      }
    );


  document
    .getElementById(
      "chapter-title"
    )
    ?.addEventListener(
      "input",
      event => {

        const chapter =
          getActiveChapter();

        if (!chapter) return;

        chapter.title =
          event.target.value;

        queueAutosave();

        renderChapterListOnly();

      }
    );


  document
    .getElementById(
      "editor"
    )
    ?.addEventListener(
      "input",
      event => {

        const chapter =
          getActiveChapter();

        if (!chapter) return;

        chapter.content =
          event.target.innerHTML;

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

          const value =
            button.dataset.value ||
            null;

          document
            .execCommand(
              command,
              false,
              value
            );

          document
            .getElementById(
              "editor"
            )
            ?.focus();

        }
      );

    });


  document
    .getElementById(
      "add-chapter"
    )
    ?.addEventListener(
      "click",
      addChapter
    );


  document
    .querySelectorAll(
      "[data-chapter]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          saveActiveEditorToState();

          studioState.activeChapter =
            Number(
              button.dataset.chapter
            );

          renderStudio();

        }
      );

    });


  document
    .getElementById(
      "save-story"
    )
    ?.addEventListener(
      "click",
      () => saveStory()
    );


  document
    .getElementById(
      "preview-story"
    )
    ?.addEventListener(
      "click",
      previewStory
    );


  document
    .getElementById(
      "publish-story"
    )
    ?.addEventListener(
      "click",
      publishStory
    );

}

