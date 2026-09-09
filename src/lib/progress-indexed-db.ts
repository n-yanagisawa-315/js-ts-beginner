import type { LearningState } from "./progress";

const DATABASE_NAME = "js-ts-beginner-learning";
const DATABASE_VERSION = 1;
const STORE_NAME = "learning-state";
const STATE_KEY = "current";

export type PersistedLearningState = {
  revision: string;
  state: LearningState;
};

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

export function supportsLearningStateDatabase(): boolean {
  return typeof window !== "undefined" && window.indexedDB !== undefined;
}

export function openLearningStateDatabase(): Promise<IDBDatabase> {
  if (!supportsLearningStateDatabase()) {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB upgrade was blocked"));
  });
}

export async function readPersistedLearningState(
  database: IDBDatabase,
): Promise<PersistedLearningState | null> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const value = await requestResult<unknown>(
    transaction.objectStore(STORE_NAME).get(STATE_KEY),
  );
  await transactionDone(transaction);
  if (
    typeof value !== "object" ||
    value === null ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    !("state" in value)
  ) {
    return null;
  }
  return value as PersistedLearningState;
}

export async function writePersistedLearningState(
  database: IDBDatabase,
  record: PersistedLearningState,
): Promise<boolean> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const current = await requestResult<unknown>(store.get(STATE_KEY));
  const currentRevision =
    typeof current === "object" &&
    current !== null &&
    "revision" in current &&
    typeof current.revision === "string"
      ? current.revision
      : null;
  const shouldWrite =
    currentRevision === null || currentRevision.localeCompare(record.revision) < 0;
  if (shouldWrite) {
    store.put(record, STATE_KEY);
  }
  await transactionDone(transaction);
  return shouldWrite;
}

export async function clearPersistedLearningState(
  database: IDBDatabase,
): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(STATE_KEY);
  await transactionDone(transaction);
}
