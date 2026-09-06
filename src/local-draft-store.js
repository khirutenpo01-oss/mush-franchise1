const DRAFT_KEY = "mush_local_story_drafts_v1";
const DB_NAME = "mush-local-drafts";
const DB_VERSION = 1;
const MEDIA_STORE = "media";

function readDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeDrafts(drafts) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

export function createDraftId() {
  return `local-${crypto.randomUUID()}`;
}

export function getDraft(draftId) {
  const drafts = readDrafts();
  return drafts[draftId] || null;
}

export function getAllDrafts() {
  return Object.values(readDrafts());
}

export function saveDraft(draft) {
  const drafts = readDrafts();

  drafts[draft.id] = {
    ...draft,
    updatedAt: new Date().toISOString()
  };

  writeDrafts(drafts);

  return drafts[draft.id];
}

export function deleteDraft(draftId) {
  const drafts = readDrafts();

  delete drafts[draftId];

  writeDrafts(drafts);
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, {
          keyPath: "id"
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMedia(draftId, file) {
  const db = await openDatabase();

  const id = `${draftId}-${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      MEDIA_STORE,
      "readwrite"
    );

    transaction.objectStore(MEDIA_STORE).put({
      id,
      draftId,
      name: file.name,
      type: file.type,
      file
    });

    transaction.oncomplete = () => {
      db.close();
      resolve(id);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getDraftMedia(draftId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      MEDIA_STORE,
      "readonly"
    );

    const request =
      transaction
        .objectStore(MEDIA_STORE)
        .getAll();

    request.onsuccess = () => {
      db.close();

      resolve(
        request.result.filter(
          item => item.draftId === draftId
        )
      );
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deleteDraftMedia(draftId) {
  const db = await openDatabase();

  const media =
    await getDraftMedia(draftId);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      MEDIA_STORE,
      "readwrite"
    );

    const store =
      transaction.objectStore(MEDIA_STORE);

    for (const item of media) {
      store.delete(item.id);
    }

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}