import assert from "node:assert/strict";

const V1_KEY = "js-ts-beginner-progress-v1";
const V2_KEY = "js-ts-beginner-learning-v2";
const V3_KEY = "js-ts-beginner-learning-v3";
const SUMMARY_KEY = "js-ts-beginner-learning-summary-v4";
const wait = () => new Promise((resolve) => setTimeout(resolve, 10));

class StorageMock {
  data = new Map();
  reads = 0;
  writes = 0;
  throwOnRead = false;
  throwOnWrite = false;

  getItem(key) {
    this.reads += 1;
    if (this.throwOnRead) throw new Error("read blocked");
    return this.data.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.throwOnWrite) throw new Error("write blocked");
    this.writes += 1;
    this.data.set(key, String(value));
  }

  removeItem(key) {
    if (this.throwOnWrite) throw new Error("remove blocked");
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }
}

class RequestMock {
  result;
  error = null;
  onsuccess = null;
  onerror = null;
  onupgradeneeded = null;
  onblocked = null;
}

class TransactionMock {
  error = null;
  #oncomplete = null;
  #onabort = null;
  #onerror = null;
  #pending = 0;
  #finished = false;

  constructor(indexedDB, mode) {
    this.indexedDB = indexedDB;
    this.mode = mode;
  }

  set oncomplete(value) {
    this.#oncomplete = value;
    if (this.#finished && value) queueMicrotask(value);
  }
  get oncomplete() {
    return this.#oncomplete;
  }
  set onabort(value) {
    this.#onabort = value;
  }
  get onabort() {
    return this.#onabort;
  }
  set onerror(value) {
    this.#onerror = value;
  }
  get onerror() {
    return this.#onerror;
  }

  objectStore() {
    return {
      get: (key) => this.#request(() => this.indexedDB.records.get(key)),
      put: (value, key) =>
        this.#request(() => {
          this.indexedDB.puts += 1;
          this.indexedDB.records.set(key, structuredClone(value));
          return key;
        }),
      delete: (key) =>
        this.#request(() => {
          this.indexedDB.records.delete(key);
        }),
    };
  }

  #request(operation) {
    const request = new RequestMock();
    this.#pending += 1;
    setTimeout(() => {
      try {
        request.result = operation();
        request.onsuccess?.();
      } catch (error) {
        request.error = error;
        this.error = error;
        request.onerror?.();
        this.#onerror?.();
        this.#onabort?.();
      } finally {
        this.#pending -= 1;
        this.#scheduleCompletion();
      }
    }, 0);
    return request;
  }

  #scheduleCompletion() {
    setTimeout(() => {
      if (this.#pending === 0 && !this.error) {
        this.#finished = true;
        this.#oncomplete?.();
      }
    }, 0);
  }
}

class DatabaseMock {
  constructor(indexedDB) {
    this.indexedDB = indexedDB;
    this.objectStoreNames = { contains: () => indexedDB.upgraded };
  }

  createObjectStore() {
    this.indexedDB.upgraded = true;
  }

  transaction(_name, mode) {
    return new TransactionMock(this.indexedDB, mode);
  }
}

class IndexedDBMock {
  records = new Map();
  puts = 0;
  upgraded = false;
  failOpen = false;

  open() {
    const request = new RequestMock();
    setTimeout(() => {
      if (this.failOpen) {
        request.error = new Error("open failed");
        request.onerror?.();
        return;
      }
      request.result = new DatabaseMock(this);
      if (!this.upgraded) request.onupgradeneeded?.();
      request.onsuccess?.();
    }, 0);
    return request;
  }
}

class WindowMock {
  listeners = new Map();

  constructor({ storage = new StorageMock(), indexedDB = new IndexedDBMock() } = {}) {
    this.localStorage = storage;
    if (indexedDB !== null) this.indexedDB = indexedDB;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
    return true;
  }

  setTimeout = setTimeout;
  clearTimeout = clearTimeout;

  storageEvent(key, newValue, storageArea = this.localStorage) {
    this.dispatchEvent({ type: "storage", key, newValue, storageArea });
  }
}

let moduleNumber = 0;
async function freshProgress(windowMock) {
  globalThis.window = windowMock;
  globalThis.document = {
    visibilityState: "visible",
    addEventListener() {},
  };
  globalThis.Event ??= class Event {
    constructor(type) {
      this.type = type;
    }
  };
  moduleNumber += 1;
  return import(`../src/lib/progress.ts?audit=${moduleNumber}`);
}

{
  const browser = new WindowMock();
  const progress = await freshProgress(browser);
  const first = progress.getLearningStateSnapshot();
  const readsAfterFirst = browser.localStorage.reads;
  assert.strictEqual(progress.getLearningStateSnapshot(), first);
  assert.equal(browser.localStorage.reads, readsAfterFirst);
  assert.strictEqual(
    progress.getServerLearningStateSnapshot(),
    progress.getServerLearningStateSnapshot(),
  );

  let notifications = 0;
  const unsubscribe = progress.subscribeLearningState(() => {
    notifications += 1;
  });
  progress.recordLessonLearningEvent({
    lessonId: "lesson-a",
    context: "prequestion",
    response: "完全履歴にだけ保存する回答",
    confidence: 75,
  });
  progress.recordQuestionAttempt({
    lessonId: "lesson-a",
    questionId: "q1",
    correct: true,
    response: "detail",
  });
  progress.writeProgress("lesson-a", 1, 2);
  const written = progress.getLearningStateSnapshot();
  progress.writeProgress("lesson-a", 1, 2);
  assert.strictEqual(progress.getLearningStateSnapshot(), written);
  assert.equal(notifications, 3, "実変更のみ同一タブへ通知する");

  const summary = JSON.parse(browser.localStorage.getItem(SUMMARY_KEY));
  assert.equal(summary.version, 4);
  assert.deepEqual(summary.lessons["lesson-a"], { score: 1, total: 2 });
  assert.equal(summary.lessonEvents, undefined);
  assert.equal(summary.questions["lesson-a:q1"].attemptHistory, undefined);
  assert.equal(summary.questions["lesson-a:q1"].selfExplanations, undefined);
  assert.equal(browser.localStorage.getItem(V3_KEY), null);

  await progress.flushLearningStatePersistence();
  const persisted = browser.indexedDB.records.get("current");
  assert.equal(persisted.state.lessonEvents.length, 1);
  assert.equal(persisted.state.questions["lesson-a:q1"].attemptHistory.length, 1);
  assert.equal(browser.indexedDB.puts, 1, "連続更新を1回のfull state保存へまとめる");
  unsubscribe();
}

{
  const indexedDB = new IndexedDBMock();
  const firstBrowser = new WindowMock({ indexedDB });
  const firstProgress = await freshProgress(firstBrowser);
  firstProgress.subscribeLearningState(() => {})();
  firstProgress.recordQuestionAttempt({
    lessonId: "cross",
    questionId: "q1",
    correct: false,
    response: "tab detail",
  });
  await firstProgress.flushLearningStatePersistence();
  const summaryRaw = firstBrowser.localStorage.getItem(SUMMARY_KEY);

  const secondStorage = new StorageMock();
  secondStorage.setItem(SUMMARY_KEY, summaryRaw);
  const secondBrowser = new WindowMock({ storage: secondStorage, indexedDB });
  const secondProgress = await freshProgress(secondBrowser);
  assert.equal(
    secondProgress.getLearningStateSnapshot().questions["cross:q1"].attemptHistory.length,
    0,
    "起動時はsummaryを同期読込する",
  );
  let hydrated = 0;
  const unsubscribe = secondProgress.subscribeLearningState(() => {
    hydrated += 1;
  });
  await wait();
  await wait();
  assert.equal(
    secondProgress.getLearningStateSnapshot().questions["cross:q1"].attemptHistory.length,
    1,
    "IndexedDBからfull stateを非同期hydrateする",
  );
  assert.equal(hydrated, 1);
  unsubscribe();
}

{
  const browser = new WindowMock();
  browser.localStorage.setItem(V3_KEY, "{corrupt");
  browser.localStorage.setItem(
    V2_KEY,
    JSON.stringify({
      version: 2,
      lessons: { legacy: { score: 1, total: 2 } },
      questions: {},
    }),
  );
  browser.localStorage.setItem(V1_KEY, JSON.stringify({ older: { score: 1, total: 1 } }));
  const progress = await freshProgress(browser);
  assert.deepEqual(progress.getLearningStateSnapshot().lessons.legacy, {
    score: 1,
    total: 2,
  });
  progress.subscribeLearningState(() => {})();
  assert.notEqual(browser.localStorage.getItem(V2_KEY), null);
  await progress.flushLearningStatePersistence();
  assert.deepEqual(
    browser.indexedDB.records.get("current").state.lessons.legacy,
    { score: 1, total: 2 },
  );
  assert.equal(browser.localStorage.getItem(V3_KEY), null);
  assert.equal(browser.localStorage.getItem(V2_KEY), null);
  assert.equal(browser.localStorage.getItem(V1_KEY), null);
}

{
  const browser = new WindowMock({ indexedDB: null });
  browser.localStorage.setItem(
    V2_KEY,
    JSON.stringify({
      version: 2,
      lessons: { legacy: { score: 1, total: 1 } },
      questions: {},
    }),
  );
  const progress = await freshProgress(browser);
  progress.initializeLearningState();
  assert.notEqual(
    browser.localStorage.getItem(V2_KEY),
    null,
    "IndexedDB成功前はlegacy full stateを削除しない",
  );
  progress.writeProgress("fallback", 2, 2);
  await progress.flushLearningStatePersistence();
  const fallback = JSON.parse(browser.localStorage.getItem(V3_KEY));
  assert.deepEqual(fallback.lessons.fallback, { score: 2, total: 2 });
  assert.notEqual(browser.localStorage.getItem(V2_KEY), null);
}

{
  const browser = new WindowMock();
  const progress = await freshProgress(browser);
  progress.subscribeLearningState(() => {})();
  progress.writeProgress("newer", 2, 2);
  await progress.flushLearningStatePersistence();
  const newest = browser.indexedDB.records.get("current");
  const { openLearningStateDatabase, writePersistedLearningState } =
    await import("../src/lib/progress-indexed-db.ts");
  await writePersistedLearningState(await openLearningStateDatabase(), {
    revision: "000000000000001-old",
    state: {
      version: 3,
      lessons: { stale: { score: 1, total: 1 } },
      questions: {},
      lessonEvents: [],
      concepts: {},
    },
  });
  assert.deepEqual(
    browser.indexedDB.records.get("current"),
    newest,
    "古い非同期writeは新しいstateを上書きしない",
  );
}

console.log(
  "summary・IndexedDB hydrate・移行・fallback・書き込み順序を確認しました。",
);
