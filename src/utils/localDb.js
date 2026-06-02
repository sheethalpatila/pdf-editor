import { openDB } from "idb";

const DB_NAME = "docprecision-db";
const DB_VERSION = 2;

const STORE_FILES = "files";
const STORE_SETTINGS = "settings";
const STORE_EDITS = "edits";

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, {
          keyPath: "id"
        });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, {
          keyPath: "key"
        });
      }

      if (!db.objectStoreNames.contains(STORE_EDITS)) {
        db.createObjectStore(STORE_EDITS, {
          keyPath: "fileId"
        });
      }
    }
  });
}

export async function savePdfFile(file) {
  const db = await getDb();

  const fileRecord = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.put(STORE_FILES, fileRecord);

  await db.put(STORE_SETTINGS, {
    key: "lastOpenedFileId",
    value: fileRecord.id
  });

  await db.put(STORE_EDITS, {
    fileId: fileRecord.id,
    edits: [],
    updatedAt: new Date().toISOString()
  });

  return fileRecord;
}

export async function getPdfFile(id) {
  const db = await getDb();

  return db.get(STORE_FILES, id);
}

export async function getLastOpenedPdf() {
  const db = await getDb();

  const setting = await db.get(
    STORE_SETTINGS,
    "lastOpenedFileId"
  );

  if (!setting?.value) {
    return null;
  }

  return db.get(STORE_FILES, setting.value);
}

export async function getAllPdfFiles() {
  const db = await getDb();

  return db.getAll(STORE_FILES);
}

export async function deletePdfFile(id) {
  const db = await getDb();

  await db.delete(STORE_FILES, id);
  await db.delete(STORE_EDITS, id);

  const setting = await db.get(
    STORE_SETTINGS,
    "lastOpenedFileId"
  );

  if (setting?.value === id) {
    await db.delete(
      STORE_SETTINGS,
      "lastOpenedFileId"
    );
  }
}

export async function saveFileEdits(fileId, edits) {
  if (!fileId) return;

  const db = await getDb();

  await db.put(STORE_EDITS, {
    fileId,
    edits,
    updatedAt: new Date().toISOString()
  });
}

export async function getFileEdits(fileId) {
  if (!fileId) return [];

  const db = await getDb();

  const record = await db.get(
    STORE_EDITS,
    fileId
  );

  return record?.edits || [];
}

export async function setLastOpenedPdf(fileId) {
  const db = await getDb();

  await db.put(STORE_SETTINGS, {
    key: "lastOpenedFileId",
    value: fileId
  });
}
