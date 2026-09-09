import {
  clearPersistedLearningState,
  openLearningStateDatabase,
  readPersistedLearningState,
  supportsLearningStateDatabase,
  writePersistedLearningState,
} from "./progress-indexed-db.ts";

const V1_KEY = "js-ts-beginner-progress-v1";
const V2_KEY = "js-ts-beginner-learning-v2";
const V3_KEY = "js-ts-beginner-learning-v3";
const SUMMARY_KEY = "js-ts-beginner-learning-summary-v4";
export const LEARNING_STATE_EVENT = "js-ts-beginner-learning-state";

const CORRECT_INTERVALS = [1, 3, 7, 14, 30, 60] as const;
export const INCORRECT_REVIEW_DELAY_MS = 10 * 60 * 1000;
const MAX_ATTEMPT_HISTORY = 40;

export type ProgressMap = Record<string, { score: number; total: number }>;

export type AttemptContext =
  | "lesson"
  | "review"
  | "transfer"
  | "prequestion"
  | "exit-recall";

export type AttemptEvent = {
  id: string;
  attemptedAt: string;
  context: AttemptContext;
  correct: boolean;
  firstAttempt: boolean;
  supported: boolean;
  hintLevel: number;
  answerViewed: boolean;
  responseTimeMs: number | null;
  confidence: number | null;
  variantId: string | null;
  misconceptionId: string | null;
  response: string | null;
  dueAt: string | null;
  advancedSchedule: boolean;
};

export type MasteryStage =
  | "new"
  | "practicing"
  | "retained"
  | "mastered"
  | "needs-review";

export type SelfExplanationEvent = {
  recordedAt: string;
  response: string;
};

export type LessonLearningEvent = {
  lessonId: string;
  recordedAt: string;
  context: "prequestion" | "exit-recall";
  response: string;
  confidence: number | null;
};

export type ConceptProgress = {
  retainedAt: string | null;
  transferredAt: string | null;
  masteryStage: MasteryStage;
  lastAttemptAt: string | null;
};

export type QuestionProgress = {
  attempts: number;
  incorrectAttempts: number;
  firstTryCorrect: boolean | null;
  hintUsed: boolean;
  answerViewed: boolean;
  lastAttemptAt: string | null;
  lastCorrectAt: string | null;
  streak: number;
  intervalDays: number;
  nextReviewAt: string | null;
  hintUseCount: number;
  answerViewCount: number;
  lastAssistanceAt: string | null;
  masteryStage: MasteryStage;
  retainedAt: string | null;
  transferredAt: string | null;
  attemptHistory: AttemptEvent[];
  selfExplanations: SelfExplanationEvent[];
};

export type LearningState = {
  version: 3;
  lessons: ProgressMap;
  questions: Record<string, QuestionProgress>;
  lessonEvents: LessonLearningEvent[];
  concepts: Record<string, ConceptProgress>;
};

export type ReviewSchedule = Pick<
  QuestionProgress,
  "streak" | "intervalDays" | "nextReviewAt"
>;

export const EMPTY_LEARNING_STATE: LearningState = {
  version: 3,
  lessons: {},
  questions: {},
  lessonEvents: [],
  concepts: {},
};

export function questionProgressKey(lessonId: string, questionId: string): string {
  return `${lessonId}:${questionId}`;
}

export function scheduleReview(
  previousStreak: number,
  correct: boolean,
  attemptedAt: Date,
): ReviewSchedule {
  if (!correct) {
    return {
      streak: 0,
      intervalDays: 0,
      nextReviewAt: new Date(
        attemptedAt.getTime() + INCORRECT_REVIEW_DELAY_MS,
      ).toISOString(),
    };
  }

  const streak = previousStreak + 1;
  const intervalDays =
    CORRECT_INTERVALS[Math.min(streak - 1, CORRECT_INTERVALS.length - 1)];
  return {
    streak,
    intervalDays,
    nextReviewAt: new Date(
      attemptedAt.getTime() + intervalDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
}

function emptyQuestionProgress(): QuestionProgress {
  return {
    attempts: 0,
    incorrectAttempts: 0,
    firstTryCorrect: null,
    hintUsed: false,
    answerViewed: false,
    lastAttemptAt: null,
    lastCorrectAt: null,
    streak: 0,
    intervalDays: 0,
    nextReviewAt: null,
    hintUseCount: 0,
    answerViewCount: 0,
    lastAssistanceAt: null,
    masteryStage: "new",
    retainedAt: null,
    transferredAt: null,
    attemptHistory: [],
    selfExplanations: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonnegativeInteger(value: unknown, fallback = 0): number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
    ? value
    : fallback;
}

function nullableFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableConfidence(value: unknown): number | null {
  const confidence = nullableFiniteNumber(value);
  return confidence === null ? null : Math.min(100, Math.max(0, confidence));
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function nullableIsoDate(value: unknown): string | null {
  return isIsoDate(value) ? value : null;
}

const ATTEMPT_CONTEXTS: readonly AttemptContext[] = [
  "lesson",
  "review",
  "transfer",
  "prequestion",
  "exit-recall",
];
const MASTERY_STAGES: readonly MasteryStage[] = [
  "new",
  "practicing",
  "retained",
  "mastered",
  "needs-review",
];

function parseAttemptEvent(value: unknown): AttemptEvent | null {
  if (!isRecord(value) || !isIsoDate(value.attemptedAt)) return null;
  const context = ATTEMPT_CONTEXTS.includes(value.context as AttemptContext)
    ? (value.context as AttemptContext)
    : "lesson";
  return {
    id: typeof value.id === "string" ? value.id : "",
    attemptedAt: value.attemptedAt,
    context,
    correct: typeof value.correct === "boolean" ? value.correct : false,
    firstAttempt:
      typeof value.firstAttempt === "boolean" ? value.firstAttempt : false,
    supported: typeof value.supported === "boolean" ? value.supported : true,
    hintLevel: nonnegativeInteger(value.hintLevel),
    answerViewed:
      typeof value.answerViewed === "boolean" ? value.answerViewed : false,
    responseTimeMs: nullableFiniteNumber(value.responseTimeMs),
    confidence: nullableConfidence(value.confidence),
    variantId: nullableString(value.variantId),
    misconceptionId: nullableString(value.misconceptionId),
    response: nullableString(value.response),
    dueAt: nullableIsoDate(value.dueAt),
    advancedSchedule:
      typeof value.advancedSchedule === "boolean"
        ? value.advancedSchedule
        : false,
  };
}

function parseSelfExplanationEvent(
  value: unknown,
): SelfExplanationEvent | null {
  if (
    !isRecord(value) ||
    !isIsoDate(value.recordedAt) ||
    typeof value.response !== "string"
  ) {
    return null;
  }
  return { recordedAt: value.recordedAt, response: value.response };
}

function parseLessonLearningEvent(
  value: unknown,
): LessonLearningEvent | null {
  if (
    !isRecord(value) ||
    typeof value.lessonId !== "string" ||
    !isIsoDate(value.recordedAt) ||
    (value.context !== "prequestion" && value.context !== "exit-recall") ||
    typeof value.response !== "string"
  ) {
    return null;
  }
  return {
    lessonId: value.lessonId,
    recordedAt: value.recordedAt,
    context: value.context,
    response: value.response,
    confidence: nullableConfidence(value.confidence),
  };
}

function parseConceptProgress(value: unknown): ConceptProgress | null {
  if (!isRecord(value)) return null;
  const retainedAt = nullableIsoDate(value.retainedAt);
  const transferredAt = nullableIsoDate(value.transferredAt);
  const requestedStage = MASTERY_STAGES.includes(
    value.masteryStage as MasteryStage,
  )
    ? (value.masteryStage as MasteryStage)
    : "new";
  const masteryStage =
    requestedStage === "mastered"
      ? retainedAt && transferredAt
        ? "mastered"
        : retainedAt
          ? "retained"
          : "new"
      : requestedStage === "retained" && !retainedAt
        ? "new"
        : requestedStage;
  return {
    retainedAt,
    transferredAt,
    masteryStage,
    lastAttemptAt: nullableIsoDate(value.lastAttemptAt),
  };
}

function parseProgressMap(value: unknown): ProgressMap {
  if (!isRecord(value)) return {};
  const progress: ProgressMap = {};
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) continue;
    const total = nonnegativeInteger(item.total);
    progress[id] = {
      score: Math.min(nonnegativeInteger(item.score), total),
      total,
    };
  }
  return progress;
}

function parseQuestionProgress(value: unknown): Record<string, QuestionProgress> {
  if (!isRecord(value)) return {};
  const questions: Record<string, QuestionProgress> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!isRecord(item)) continue;
    const attempts = nonnegativeInteger(item.attempts);
    const incorrectAttempts = Math.min(
      nonnegativeInteger(item.incorrectAttempts),
      attempts,
    );
    const history = Array.isArray(item.attemptHistory)
      ? item.attemptHistory
          .map(parseAttemptEvent)
          .filter((event): event is AttemptEvent => event !== null)
          .slice(-MAX_ATTEMPT_HISTORY)
      : [];
    const requestedStage = MASTERY_STAGES.includes(
      item.masteryStage as MasteryStage,
    )
      ? (item.masteryStage as MasteryStage)
      : "new";
    const retainedAt = nullableIsoDate(item.retainedAt);
    const transferredAt = nullableIsoDate(item.transferredAt);
    const fallbackStage: MasteryStage = attempts > 0 ? "practicing" : "new";
    const masteryStage =
      requestedStage === "mastered"
        ? retainedAt && transferredAt
          ? "mastered"
          : retainedAt
            ? "retained"
            : fallbackStage
        : requestedStage === "retained" && !retainedAt
          ? fallbackStage
          : (requestedStage === "practicing" ||
                requestedStage === "needs-review") &&
              attempts === 0
            ? "new"
            : requestedStage;
    questions[key] = {
      attempts,
      incorrectAttempts,
      firstTryCorrect:
        typeof item.firstTryCorrect === "boolean"
          ? item.firstTryCorrect
          : null,
      hintUsed: typeof item.hintUsed === "boolean" ? item.hintUsed : false,
      answerViewed:
        typeof item.answerViewed === "boolean" ? item.answerViewed : false,
      lastAttemptAt: nullableIsoDate(item.lastAttemptAt),
      lastCorrectAt: nullableIsoDate(item.lastCorrectAt),
      streak: nonnegativeInteger(item.streak),
      intervalDays: nonnegativeInteger(item.intervalDays),
      nextReviewAt: nullableIsoDate(item.nextReviewAt),
      hintUseCount: nonnegativeInteger(item.hintUseCount),
      answerViewCount: nonnegativeInteger(item.answerViewCount),
      lastAssistanceAt: nullableIsoDate(item.lastAssistanceAt),
      masteryStage,
      retainedAt,
      transferredAt,
      attemptHistory: history.slice(-MAX_ATTEMPT_HISTORY),
      selfExplanations: Array.isArray(item.selfExplanations)
        ? item.selfExplanations
            .map(parseSelfExplanationEvent)
            .filter(
              (event): event is SelfExplanationEvent => event !== null,
            )
            .slice(-10)
        : [],
    };
  }
  return questions;
}

function parseConcepts(value: unknown): Record<string, ConceptProgress> {
  if (!isRecord(value)) return {};
  const concepts: Record<string, ConceptProgress> = {};
  for (const [id, item] of Object.entries(value)) {
    const concept = parseConceptProgress(item);
    if (concept) concepts[id] = concept;
  }
  return concepts;
}

type V3Parse = {
  state: LearningState;
  repaired: boolean;
};

type StorageRead = {
  state: LearningState;
  revision: string;
  fullState: boolean;
  migrationKeys: string[];
};

type SummaryQuestionProgress = Omit<
  QuestionProgress,
  "attemptHistory" | "selfExplanations"
>;

type LearningStateSummary = {
  version: 4;
  revision: string;
  persistedRevision: string | null;
  lessons: ProgressMap;
  questions: Record<string, SummaryQuestionProgress>;
  concepts: Record<string, ConceptProgress>;
};

let cachedLearningState = EMPTY_LEARNING_STATE;
let cacheInitialized = false;
let pendingMigrationKeys: string[] = [];
let currentRevision = "";
let hydratedRevision = "";
let lastRevisionTime = 0;
let revisionCounter = 0;
const writerId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
let hydrationStarted = false;
let lifecycleListenersInstalled = false;
let databasePromise: ReturnType<typeof openLearningStateDatabase> | null = null;
let pendingFullWrite:
  | { revision: string; state: LearningState }
  | null = null;
let writePromise: Promise<void> | null = null;
let idleHandle: number | ReturnType<typeof globalThis.setTimeout> | null = null;
let fallbackToLocalStorage = false;

function nextRevision(): string {
  const now = Math.max(Date.now(), lastRevisionTime);
  revisionCounter = now === lastRevisionTime ? revisionCounter + 1 : 0;
  lastRevisionTime = now;
  return `${String(now).padStart(15, "0")}-${String(revisionCounter).padStart(6, "0")}-${writerId}`;
}

function parseV3(raw: string | null): V3Parse | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 3) {
      return null;
    }
    const state: LearningState = {
      version: 3,
      lessons: parseProgressMap(parsed.lessons),
      questions: parseQuestionProgress(parsed.questions),
      lessonEvents: Array.isArray(parsed.lessonEvents)
        ? parsed.lessonEvents
            .map(parseLessonLearningEvent)
            .filter(
              (event): event is LessonLearningEvent => event !== null,
            )
            .slice(-500)
        : [],
      concepts: parseConcepts(parsed.concepts),
    };
    return { state, repaired: JSON.stringify(state) !== raw };
  } catch {
    return null;
  }
}

function parseV2(raw: string | null): LearningState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== 2
    ) {
      return null;
    }
    return {
      version: 3,
      lessons: parseProgressMap(parsed.lessons),
      questions: parseQuestionProgress(parsed.questions),
      lessonEvents: [],
      concepts: {},
    };
  } catch {
    return null;
  }
}

function parseV1(raw: string | null): LearningState | null {
  if (!raw) return null;
  try {
    return {
      version: 3,
      lessons: parseProgressMap(JSON.parse(raw)),
      questions: {},
      lessonEvents: [],
      concepts: {},
    };
  } catch {
    return null;
  }
}

function parseSummary(raw: string | null): StorageRead | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== 4 ||
      typeof parsed.revision !== "string"
    ) {
      return null;
    }
    return {
      state: {
        version: 3,
        lessons: parseProgressMap(parsed.lessons),
        questions: parseQuestionProgress(parsed.questions),
        lessonEvents: [],
        concepts: parseConcepts(parsed.concepts),
      },
      revision: parsed.revision,
      fullState: false,
      migrationKeys: [],
    };
  } catch {
    return null;
  }
}

function summaryFor(
  state: LearningState,
  revision: string,
): LearningStateSummary {
  const questions: Record<string, SummaryQuestionProgress> = {};
  for (const [key, question] of Object.entries(state.questions)) {
    const summary: Partial<QuestionProgress> = { ...question };
    delete summary.attemptHistory;
    delete summary.selfExplanations;
    questions[key] = summary as SummaryQuestionProgress;
  }
  return {
    version: 4,
    revision,
    persistedRevision: hydratedRevision === revision ? revision : null,
    lessons: state.lessons,
    questions,
    concepts: state.concepts,
  };
}

function summarySignalsPersistedState(
  raw: string | null,
  revision: string,
): boolean {
  if (!raw) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return (
      isRecord(parsed) &&
      parsed.version === 4 &&
      parsed.revision === revision &&
      parsed.persistedRevision === revision
    );
  } catch {
    return false;
  }
}

function readStorageState(
  summaryOverride?: string | null,
  v3Override?: string | null,
): StorageRead | null {
  let hadStorageError = false;
  const read = (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      hadStorageError = true;
      return null;
    }
  };

  const v3Raw = v3Override === undefined ? read(V3_KEY) : v3Override;
  const v3 = parseV3(v3Raw);
  if (v3) {
    return {
      state: v3.state,
      revision: nextRevision(),
      fullState: true,
      migrationKeys: [V3_KEY],
    };
  }

  const v2Raw = read(V2_KEY);
  const v2 = parseV2(v2Raw);
  if (v2) {
    return {
      state: v2,
      revision: nextRevision(),
      fullState: true,
      migrationKeys: [V3_KEY, V2_KEY, V1_KEY],
    };
  }

  const v1Raw = read(V1_KEY);
  const v1 = parseV1(v1Raw);
  if (v1) {
    return {
      state: v1,
      revision: nextRevision(),
      fullState: true,
      migrationKeys: [V3_KEY, V1_KEY],
    };
  }

  const summaryRaw =
    summaryOverride === undefined ? read(SUMMARY_KEY) : summaryOverride;
  const summary = parseSummary(summaryRaw);
  if (summary) return summary;
  if (hadStorageError) return null;
  return {
    state: EMPTY_LEARNING_STATE,
    revision: "",
    fullState: false,
    migrationKeys: [],
  };
}

function updateCache(result: StorageRead): boolean {
  const changed =
    result.revision !== currentRevision ||
    (result.fullState && hydratedRevision !== result.revision);
  if (changed) cachedLearningState = result.state;
  cacheInitialized = true;
  currentRevision = result.revision;
  if (result.fullState) hydratedRevision = result.revision;
  pendingMigrationKeys = result.migrationKeys;
  return changed;
}

export function getLearningStateSnapshot(): LearningState {
  if (typeof window === "undefined") return EMPTY_LEARNING_STATE;
  if (cacheInitialized) return cachedLearningState;
  const result = readStorageState();
  if (result) updateCache(result);
  return cachedLearningState;
}

export function getServerLearningStateSnapshot(): LearningState {
  return EMPTY_LEARNING_STATE;
}

export function readLearningState(): LearningState {
  return getLearningStateSnapshot();
}

function removePendingMigrationKeys(): void {
  const remaining: string[] = [];
  for (const key of pendingMigrationKeys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      remaining.push(key);
    }
  }
  pendingMigrationKeys = remaining;
}

function persistSummary(state = cachedLearningState, revision = currentRevision): void {
  try {
    window.localStorage.setItem(
      SUMMARY_KEY,
      JSON.stringify(summaryFor(state, revision)),
    );
  } catch {
    // The in-memory state remains authoritative for this tab.
  }
}

export function initializeLearningState(): LearningState {
  if (typeof window === "undefined") return EMPTY_LEARNING_STATE;
  if (!cacheInitialized) {
    const result = readStorageState();
    if (result) updateCache(result);
  }
  startHydration();
  installLifecycleListeners();
  return cachedLearningState;
}

function writeLearningState(state: LearningState): void {
  const revision = nextRevision();
  cachedLearningState = state;
  currentRevision = revision;
  hydratedRevision = "";
  cacheInitialized = true;
  persistSummary(state, revision);
  pendingFullWrite = { revision, state };
  scheduleFullWrite();
  window.dispatchEvent(new Event(LEARNING_STATE_EVENT));
}

function database(): ReturnType<typeof openLearningStateDatabase> {
  databasePromise ??= openLearningStateDatabase();
  return databasePromise;
}

function persistFallbackState(state: LearningState): void {
  try {
    window.localStorage.setItem(V3_KEY, JSON.stringify(state));
  } catch {
    // Memory remains usable when browser storage is blocked or full.
  }
}

async function flushPendingWrite(): Promise<void> {
  if (writePromise) return writePromise;
  writePromise = (async () => {
    while (pendingFullWrite) {
      const pending = pendingFullWrite;
      pendingFullWrite = null;
      if (fallbackToLocalStorage || !supportsLearningStateDatabase()) {
        fallbackToLocalStorage = true;
        persistFallbackState(pending.state);
        continue;
      }
      try {
        const db = await database();
        await writePersistedLearningState(db, pending);
        if (pending.revision === currentRevision) {
          hydratedRevision = pending.revision;
          persistSummary();
        }
        removePendingMigrationKeys();
      } catch {
        fallbackToLocalStorage = true;
        databasePromise = null;
        persistFallbackState(pending.state);
      }
    }
  })().finally(() => {
    writePromise = null;
    if (pendingFullWrite) scheduleFullWrite();
  });
  return writePromise;
}

export function flushLearningStatePersistence(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (idleHandle !== null) {
    if ("cancelIdleCallback" in window && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleHandle as number);
    } else {
      globalThis.clearTimeout(idleHandle);
    }
    idleHandle = null;
  }
  return flushPendingWrite();
}

function scheduleFullWrite(): void {
  if (idleHandle !== null || writePromise) return;
  const run = () => {
    idleHandle = null;
    void flushPendingWrite();
  };
  if ("requestIdleCallback" in window && typeof window.requestIdleCallback === "function") {
    idleHandle = window.requestIdleCallback(run, { timeout: 1_000 });
  } else {
    idleHandle = globalThis.setTimeout(run, 50);
  }
}

async function hydrateFromDatabase(
  expectedRevision?: string,
  retryCount = 0,
): Promise<void> {
  if (fallbackToLocalStorage || !supportsLearningStateDatabase()) return;
  try {
    const persisted = await readPersistedLearningState(await database());
    if (!persisted) return;
    const parsed = parseV3(JSON.stringify(persisted.state));
    if (!parsed) return;
    if (
      persisted.revision.localeCompare(currentRevision) > 0 ||
      (persisted.revision === currentRevision &&
        hydratedRevision !== persisted.revision)
    ) {
      updateCache({
        state: parsed.state,
        revision: persisted.revision,
        fullState: true,
        migrationKeys: [],
      });
      persistSummary();
      window.dispatchEvent(new Event(LEARNING_STATE_EVENT));
    }
    if (
      expectedRevision &&
      persisted.revision.localeCompare(expectedRevision) < 0 &&
      retryCount < 4
    ) {
      globalThis.setTimeout(
        () => void hydrateFromDatabase(expectedRevision, retryCount + 1),
        150,
      );
    }
  } catch {
    fallbackToLocalStorage = true;
    databasePromise = null;
  }
}

function startHydration(): void {
  if (hydrationStarted) return;
  hydrationStarted = true;
  if (!supportsLearningStateDatabase()) {
    fallbackToLocalStorage = true;
    if (currentRevision) persistFallbackState(cachedLearningState);
    return;
  }
  if (pendingMigrationKeys.length > 0) {
    pendingFullWrite = {
      revision: currentRevision || nextRevision(),
      state: cachedLearningState,
    };
    if (!currentRevision) currentRevision = pendingFullWrite.revision;
    void flushPendingWrite().then(() => persistSummary());
    return;
  }
  void hydrateFromDatabase();
}

function installLifecycleListeners(): void {
  if (lifecycleListenersInstalled) return;
  lifecycleListenersInstalled = true;
  const flush = () => void flushLearningStatePersistence();
  if (typeof document === "undefined") {
    window.addEventListener("pagehide", flush);
    return;
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") flush();
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

export function subscribeLearningState(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return;
    if (
      event.key !== null &&
      event.key !== SUMMARY_KEY &&
      event.key !== V3_KEY
    ) return;
    if (event.key === null) {
      pendingFullWrite = null;
      const changed = updateCache({
        state: EMPTY_LEARNING_STATE,
        revision: "",
        fullState: false,
        migrationKeys: [],
      });
      void database()
        .then(clearPersistedLearningState)
        .catch(() => {});
      if (changed) onStoreChange();
      return;
    }
    const result =
      event.key === SUMMARY_KEY
        ? parseSummary(event.newValue)
        : readStorageState(undefined, event.newValue);
    if (!result) return;
    const comparison = result.revision.localeCompare(currentRevision);
    if (comparison < 0) return;
    if (comparison === 0) {
      if (
        event.key === SUMMARY_KEY &&
        hydratedRevision !== result.revision &&
        summarySignalsPersistedState(event.newValue, result.revision)
      ) {
        void hydrateFromDatabase(result.revision);
      }
      return;
    }
    if (updateCache(result)) {
      onStoreChange();
      if (!result.fullState) void hydrateFromDatabase(result.revision);
    }
  };
  const onLocalChange = () => onStoreChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(LEARNING_STATE_EVENT, onLocalChange);
  initializeLearningState();
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LEARNING_STATE_EVENT, onLocalChange);
  };
}

/** @deprecated Use getLearningStateSnapshot. */
export const learningStateSnapshot = getLearningStateSnapshot;

/** @deprecated Use getServerLearningStateSnapshot. */
export const emptyLearningStateSnapshot = getServerLearningStateSnapshot;

export function getLatestExitRecallSnapshot(lessonId: string): string {
  const events = getLearningStateSnapshot().lessonEvents;
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.lessonId === lessonId && event.context === "exit-recall") {
      return event.response;
    }
  }
  return "";
}

export function getServerLatestExitRecallSnapshot(): string {
  return "";
}

export function readProgress(): ProgressMap {
  return readLearningState().lessons;
}

export function writeProgress(id: string, score: number, total: number): void {
  const current = readLearningState();
  const previous = current.lessons[id];
  if (previous?.score === score && previous.total === total) return;
  writeLearningState({
    ...current,
    lessons: { ...current.lessons, [id]: { score, total } },
  });
}

export function recordQuestionAttempt({
  lessonId,
  questionId,
  correct,
  attemptedAt = new Date(),
  context = "lesson",
  firstAttempt = true,
  supported = false,
  hintLevel = 0,
  answerViewed = false,
  responseTimeMs = null,
  confidence = null,
  variantId = null,
  response = null,
  misconceptionId = null,
  conceptIds = [],
}: {
  lessonId: string;
  questionId: string;
  correct: boolean;
  attemptedAt?: Date;
  context?: AttemptContext;
  firstAttempt?: boolean;
  supported?: boolean;
  hintLevel?: number;
  answerViewed?: boolean;
  responseTimeMs?: number | null;
  confidence?: number | null;
  variantId?: string | null;
  response?: string | null;
  misconceptionId?: string | null;
  conceptIds?: string[];
}): QuestionProgress {
  const current = readLearningState();
  const key = questionProgressKey(lessonId, questionId);
  const previous = current.questions[key] ?? emptyQuestionProgress();
  const dueAt = previous.nextReviewAt;
  const unassistedFirstTry =
    firstAttempt && !supported && !answerViewed && hintLevel === 0;
  const dueReview =
    (context === "review" || context === "transfer") &&
    dueAt !== null &&
    new Date(dueAt).getTime() <= attemptedAt.getTime();
  const startsSchedule =
    correct &&
    unassistedFirstTry &&
    previous.nextReviewAt === null &&
    (context === "lesson" || context === "exit-recall" || context === "transfer");
  const advancesSchedule = correct && unassistedFirstTry && dueReview;
  const recordsFailure =
    !correct &&
    firstAttempt &&
    (context === "lesson" || context === "review" || context === "transfer");
  const needsUnassistedCorrection =
    correct &&
    !unassistedFirstTry &&
    previous.nextReviewAt === null &&
    context === "lesson";
  const schedule = startsSchedule || advancesSchedule
    ? scheduleReview(previous.streak, true, attemptedAt)
    : recordsFailure || needsUnassistedCorrection
      ? scheduleReview(previous.streak, false, attemptedAt)
      : {
          streak: previous.streak,
          intervalDays: previous.intervalDays,
          nextReviewAt: previous.nextReviewAt,
        };
  const retainedAt =
    advancesSchedule && schedule.streak >= 2
      ? attemptedAt.toISOString()
      : previous.retainedAt;
  const transferredAt =
    context === "transfer" && correct && unassistedFirstTry
      ? attemptedAt.toISOString()
      : previous.transferredAt;
  const masteryStage: MasteryStage = (!correct && firstAttempt) || needsUnassistedCorrection
    ? "needs-review"
    : previous.masteryStage === "needs-review" && !advancesSchedule
      ? "needs-review"
    : retainedAt && transferredAt
      ? "mastered"
      : retainedAt
        ? "retained"
        : correct
          ? "practicing"
          : previous.masteryStage;
  const event: AttemptEvent = {
    id: `${attemptedAt.getTime()}-${previous.attempts + 1}`,
    attemptedAt: attemptedAt.toISOString(),
    context,
    correct,
    firstAttempt,
    supported: supported || hintLevel > 0 || answerViewed,
    hintLevel,
    answerViewed,
    responseTimeMs,
    confidence,
    variantId,
    misconceptionId,
    response: response?.slice(0, 500) ?? null,
    dueAt,
    advancedSchedule: startsSchedule || advancesSchedule,
  };
  const next: QuestionProgress = {
    ...previous,
    attempts: previous.attempts + 1,
    incorrectAttempts: previous.incorrectAttempts + (correct ? 0 : 1),
    firstTryCorrect:
      previous.attempts === 0 ? correct : previous.firstTryCorrect,
    lastAttemptAt: attemptedAt.toISOString(),
    lastCorrectAt: correct
      ? attemptedAt.toISOString()
      : previous.lastCorrectAt,
    retainedAt,
    transferredAt,
    masteryStage,
    hintUsed: previous.hintUsed || hintLevel > 0 || supported,
    answerViewed: previous.answerViewed || answerViewed,
    attemptHistory: [...previous.attemptHistory, event].slice(
      -MAX_ATTEMPT_HISTORY,
    ),
    ...schedule,
  };
  const concepts = { ...current.concepts };
  for (const conceptId of conceptIds) {
    const previousConcept = concepts[conceptId] ?? {
      retainedAt: null,
      transferredAt: null,
      masteryStage: "new" as MasteryStage,
      lastAttemptAt: null,
    };
    const conceptRetainedAt =
      advancesSchedule && schedule.streak >= 2
        ? attemptedAt.toISOString()
        : previousConcept.retainedAt;
    const conceptTransferredAt =
      context === "transfer" && correct && unassistedFirstTry
        ? attemptedAt.toISOString()
        : previousConcept.transferredAt;
    concepts[conceptId] = {
      retainedAt: conceptRetainedAt,
      transferredAt: conceptTransferredAt,
      lastAttemptAt: attemptedAt.toISOString(),
      masteryStage:
        !correct && firstAttempt
          ? "needs-review"
          : previousConcept.masteryStage === "needs-review" && !advancesSchedule
          ? "needs-review"
          : conceptRetainedAt && conceptTransferredAt
          ? "mastered"
          : conceptRetainedAt
            ? "retained"
            : !correct
              ? "needs-review"
              : "practicing",
    };
  }
  writeLearningState({
    ...current,
    questions: { ...current.questions, [key]: next },
    concepts,
  });
  return next;
}

export function recordQuestionAssistance({
  lessonId,
  questionId,
  hintUsed = false,
  answerViewed = false,
  assistedAt = new Date(),
}: {
  lessonId: string;
  questionId: string;
  hintUsed?: boolean;
  answerViewed?: boolean;
  assistedAt?: Date;
}): void {
  const current = readLearningState();
  const key = questionProgressKey(lessonId, questionId);
  const previous = current.questions[key] ?? emptyQuestionProgress();
  writeLearningState({
    ...current,
    questions: {
      ...current.questions,
      [key]: {
        ...previous,
        hintUsed: previous.hintUsed || hintUsed,
        answerViewed: previous.answerViewed || answerViewed,
        hintUseCount: previous.hintUseCount + (hintUsed ? 1 : 0),
        answerViewCount: previous.answerViewCount + (answerViewed ? 1 : 0),
        lastAssistanceAt: assistedAt.toISOString(),
      },
    },
  });
}

export function recordSelfExplanation({
  lessonId,
  questionId,
  response,
  recordedAt = new Date(),
}: {
  lessonId: string;
  questionId: string;
  response: string;
  recordedAt?: Date;
}): void {
  const trimmed = response.trim();
  if (trimmed.length < 10) return;
  const current = readLearningState();
  const key = questionProgressKey(lessonId, questionId);
  const previous = current.questions[key] ?? emptyQuestionProgress();
  writeLearningState({
    ...current,
    questions: {
      ...current.questions,
      [key]: {
        ...previous,
        selfExplanations: [
          ...previous.selfExplanations,
          { recordedAt: recordedAt.toISOString(), response: trimmed.slice(0, 500) },
        ].slice(-10),
      },
    },
  });
}

export function recordLessonLearningEvent({
  lessonId,
  context,
  response,
  confidence,
  recordedAt = new Date(),
}: {
  lessonId: string;
  context: "prequestion" | "exit-recall";
  response: string;
  confidence: number | null;
  recordedAt?: Date;
}): void {
  const trimmed = response.trim();
  if (!trimmed) return;
  const current = readLearningState();
  writeLearningState({
    ...current,
    lessonEvents: [
      ...current.lessonEvents,
      {
        lessonId,
        context,
        response: trimmed.slice(0, 1000),
        confidence,
        recordedAt: recordedAt.toISOString(),
      },
    ].slice(-500),
  });
}

export function learningStats(state: LearningState, now = new Date()) {
  const practiced = Object.values(state.questions).filter(
    (item) => item.attempts > 0,
  );
  const firstTryKnown = practiced.filter(
    (item) => item.firstTryCorrect !== null,
  );
  const firstTryCorrect = firstTryKnown.filter(
    (item) => item.firstTryCorrect,
  ).length;
  const dueCount = practiced.filter(
    (item) =>
      item.nextReviewAt !== null &&
      new Date(item.nextReviewAt).getTime() <= now.getTime(),
  ).length;
  const conceptProgress = Object.values(state.concepts ?? {});
  const masterySource = conceptProgress.length > 0 ? conceptProgress : practiced;
  const retainedCount = masterySource.filter(
    (item) => item.masteryStage === "retained" || item.masteryStage === "mastered",
  ).length;
  const masteredCount = masterySource.filter(
    (item) => item.masteryStage === "mastered",
  ).length;
  const independentReviewAttempts = practiced.flatMap((item) =>
    item.attemptHistory.filter(
      (event) =>
        (event.context === "review" || event.context === "transfer") &&
        event.firstAttempt &&
        !event.supported &&
        event.dueAt !== null &&
        event.advancedSchedule,
    ),
  );
  const independentReviewCorrect = independentReviewAttempts.filter(
    (event) => event.correct,
  ).length;
  const confidenceAttempts = practiced.flatMap((item) =>
    item.attemptHistory.filter(
      (event) =>
        event.firstAttempt &&
        !event.supported &&
        event.confidence !== null,
    ),
  );
  const calibrationError =
    confidenceAttempts.length === 0
      ? null
      : confidenceAttempts.reduce(
          (sum, event) =>
            sum + Math.abs((event.confidence ?? 0) / 100 - (event.correct ? 1 : 0)),
          0,
        ) / confidenceAttempts.length;
  return {
    practicedCount: practiced.length,
    attemptCount: practiced.reduce((sum, item) => sum + item.attempts, 0),
    dueCount,
    firstTryRate:
      firstTryKnown.length === 0
        ? null
        : firstTryCorrect / firstTryKnown.length,
    retainedCount,
    masteredCount,
    independentRetentionRate:
      independentReviewAttempts.length === 0
        ? null
        : independentReviewCorrect / independentReviewAttempts.length,
    calibrationError,
  };
}
