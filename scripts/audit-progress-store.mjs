import assert from "node:assert/strict";

const V1_KEY = "js-ts-beginner-progress-v1";
const V2_KEY = "js-ts-beginner-learning-v2";
const V3_KEY = "js-ts-beginner-learning-v3";

class StorageMock {
  data = new Map();
  reads = 0;
  throwOnRead = false;
  throwOnWrite = false;

  getItem(key) {
    this.reads += 1;
    if (this.throwOnRead) throw new Error("read blocked");
    return this.data.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.throwOnWrite) throw new Error("write blocked");
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

class WindowMock {
  listeners = new Map();

  constructor(storage = new StorageMock()) {
    this.localStorage = storage;
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
    for (const listener of this.listeners.get(event.type) ?? []) {
      listener(event);
    }
    return true;
  }

  storageEvent(key, newValue, storageArea = this.localStorage) {
    this.dispatchEvent({ type: "storage", key, newValue, storageArea });
  }
}

let moduleNumber = 0;
async function freshProgress(windowMock) {
  globalThis.window = windowMock;
  moduleNumber += 1;
  return import(`../src/lib/progress.ts?audit=${moduleNumber}`);
}

function v3(lessons = {}) {
  return JSON.stringify({
    version: 3,
    lessons,
    questions: {},
    lessonEvents: [],
    concepts: {},
  });
}

{
  const browser = new WindowMock();
  const progress = await freshProgress(browser);
  const first = progress.getLearningStateSnapshot();
  const readsAfterFirstSnapshot = browser.localStorage.reads;
  assert.strictEqual(
    progress.getLearningStateSnapshot(),
    first,
    "未変更のスナップショットは同じ参照を返す",
  );
  assert.equal(
    browser.localStorage.reads,
    readsAfterFirstSnapshot,
    "未変更のスナップショットはlocalStorageを再読込しない",
  );
  assert.strictEqual(
    progress.getServerLearningStateSnapshot(),
    progress.getServerLearningStateSnapshot(),
    "SSRスナップショットは安定する",
  );

  let notifications = 0;
  const unsubscribe = progress.subscribeLearningState(() => {
    notifications += 1;
  });
  progress.writeProgress("lesson-a", 1, 2);
  const written = progress.getLearningStateSnapshot();
  assert.equal(written.lessons["lesson-a"].score, 1);
  assert.equal(notifications, 1, "同一タブの書き込みを通知する");

  progress.writeProgress("lesson-a", 1, 2);
  assert.strictEqual(progress.getLearningStateSnapshot(), written);
  assert.equal(notifications, 1, "同じ内容の書き込みは通知しない");

  browser.storageEvent("unrelated", "x");
  browser.storageEvent(V3_KEY, v3({ wrong: { score: 1, total: 1 } }), {});
  assert.equal(notifications, 1, "無関係なキーとstorage areaを無視する");

  const crossTabRaw = v3({ external: { score: 2, total: 3 } });
  browser.localStorage.data.set(V3_KEY, crossTabRaw);
  const readsBeforeEvent = browser.localStorage.reads;
  browser.storageEvent(V3_KEY, crossTabRaw);
  assert.equal(
    browser.localStorage.reads,
    readsBeforeEvent,
    "V3 storage eventはnewValueから直接更新する",
  );
  const crossTab = progress.getLearningStateSnapshot();
  assert.deepEqual(crossTab.lessons.external, { score: 2, total: 3 });
  assert.equal(
    browser.localStorage.getItem(V3_KEY),
    crossTabRaw,
  );
  assert.equal(notifications, 2);

  browser.storageEvent(V3_KEY, crossTabRaw);
  assert.equal(notifications, 2, "同じrawのstorage eventは通知しない");

  browser.localStorage.clear();
  browser.storageEvent(null, null);
  assert.strictEqual(
    progress.getLearningStateSnapshot(),
    progress.getServerLearningStateSnapshot(),
    "storage clear後は共有の空スナップショットへ戻る",
  );
  assert.equal(notifications, 3);

  unsubscribe();
  browser.storageEvent(V3_KEY, v3({ later: { score: 1, total: 1 } }));
  assert.equal(notifications, 3, "unsubscribe後は通知しない");
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
  browser.localStorage.setItem(
    V1_KEY,
    JSON.stringify({ older: { score: 1, total: 1 } }),
  );
  const progress = await freshProgress(browser);
  const migrated = progress.getLearningStateSnapshot();
  assert.deepEqual(
    migrated.lessons.legacy,
    { score: 1, total: 2 },
    "壊れたV3から独立してV2へフォールバックする",
  );
  assert.equal(
    browser.localStorage.getItem(V3_KEY),
    "{corrupt",
    "getSnapshot中は移行を書き込まない",
  );
  const unsubscribe = progress.subscribeLearningState(() => {});
  assert.equal(JSON.parse(browser.localStorage.getItem(V3_KEY)).version, 3);
  assert.equal(browser.localStorage.getItem(V2_KEY), null);
  assert.equal(browser.localStorage.getItem(V1_KEY), null);
  unsubscribe();
}

{
  const browser = new WindowMock();
  browser.localStorage.setItem(
    V1_KEY,
    JSON.stringify({ v1: { score: 2, total: 4 } }),
  );
  const progress = await freshProgress(browser);
  assert.deepEqual(progress.getLearningStateSnapshot().lessons.v1, {
    score: 2,
    total: 4,
  });
  progress.subscribeLearningState(() => {})();
  assert.equal(JSON.parse(browser.localStorage.getItem(V3_KEY)).version, 3);
  assert.equal(browser.localStorage.getItem(V1_KEY), null);
}

{
  const browser = new WindowMock();
  browser.localStorage.setItem(V3_KEY, v3({ safe: { score: 1, total: 1 } }));
  const progress = await freshProgress(browser);
  const safe = progress.getLearningStateSnapshot();
  browser.localStorage.throwOnRead = true;
  assert.strictEqual(
    progress.getLearningStateSnapshot(),
    safe,
    "読み取り例外時は利用可能なメモリ状態を保つ",
  );

  browser.localStorage.throwOnWrite = true;
  progress.writeProgress("memory", 3, 3);
  const memory = progress.getLearningStateSnapshot();
  assert.deepEqual(memory.lessons.memory, { score: 3, total: 3 });
  assert.notStrictEqual(memory, safe, "書き込み例外時もメモリ上の更新を保つ");
}

{
  const browser = new WindowMock();
  browser.localStorage.setItem(
    V2_KEY,
    JSON.stringify({ version: 2, lessons: {}, questions: {} }),
  );
  const progress = await freshProgress(browser);
  progress.getLearningStateSnapshot();
  browser.localStorage.throwOnWrite = true;
  progress.subscribeLearningState(() => {})();
  browser.localStorage.throwOnWrite = false;
  assert.equal(browser.localStorage.getItem(V3_KEY), null);
  assert.notEqual(
    browser.localStorage.getItem(V2_KEY),
    null,
    "V3保存失敗時はlegacy keyを削除しない",
  );
}

console.log(
  "進捗ストアの参照安定性・通知・タブ間同期・移行・SSR・storage例外を確認しました。",
);
