const V1_KEY = "js-ts-beginner-progress-v1";
const V2_KEY = "js-ts-beginner-learning-v2";
const V3_KEY = "js-ts-beginner-learning-v3";
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

function parseProgressMap(value: unknown): ProgressMap {
  if (typeof value !== "object" || value === null) return {};
  const progress: ProgressMap = {};
  for (const [id, item] of Object.entries(value)) {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as { score?: unknown }).score === "number" &&
      typeof (item as { total?: unknown }).total === "number"
    ) {
      const { score, total } = item as { score: number; total: number };
      progress[id] = { score, total };
    }
  }
  return progress;
}

function parseQuestionProgress(value: unknown): Record<string, QuestionProgress> {
  if (typeof value !== "object" || value === null) return {};
  const questions: Record<string, QuestionProgress> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "object" || item === null) continue;
    const candidate = item as Partial<QuestionProgress>;
    const history = Array.isArray(candidate.attemptHistory)
      ? candidate.attemptHistory.filter(
          (event): event is AttemptEvent =>
            typeof event === "object" &&
            event !== null &&
            typeof (event as AttemptEvent).attemptedAt === "string" &&
            typeof (event as AttemptEvent).correct === "boolean",
        )
      : [];
    const masteryStage: MasteryStage = [
      "new",
      "practicing",
      "retained",
      "mastered",
      "needs-review",
    ].includes(candidate.masteryStage ?? "")
      ? (candidate.masteryStage as MasteryStage)
      : "new";
    questions[key] = {
      ...emptyQuestionProgress(),
      ...candidate,
      masteryStage,
      attemptHistory: history.slice(-MAX_ATTEMPT_HISTORY),
      selfExplanations: Array.isArray(candidate.selfExplanations)
        ? candidate.selfExplanations.slice(-10)
        : [],
    };
  }
  return questions;
}

export function readLearningState(): LearningState {
  if (typeof window === "undefined") return EMPTY_LEARNING_STATE;
  try {
    const raw = window.localStorage.getItem(V3_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        (parsed as { version?: unknown }).version === 3
      ) {
        const state = parsed as Partial<LearningState>;
        return {
          version: 3,
          lessons: parseProgressMap(state.lessons),
          questions: parseQuestionProgress(state.questions),
          lessonEvents: Array.isArray(state.lessonEvents)
            ? state.lessonEvents.slice(-500)
            : [],
          concepts:
            typeof state.concepts === "object" && state.concepts !== null
              ? state.concepts
              : {},
        };
      }
    }

    const v2Raw = window.localStorage.getItem(V2_KEY);
    if (v2Raw) {
      const parsed: unknown = JSON.parse(v2Raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        (parsed as { version?: unknown }).version === 2
      ) {
        const legacy = parsed as {
          lessons?: unknown;
          questions?: unknown;
        };
        const migrated: LearningState = {
          version: 3,
          lessons: parseProgressMap(legacy.lessons),
          questions: parseQuestionProgress(legacy.questions),
          lessonEvents: [],
          concepts: {},
        };
        window.localStorage.setItem(V3_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    const legacyRaw = window.localStorage.getItem(V1_KEY);
    if (!legacyRaw) return EMPTY_LEARNING_STATE;
    const migrated: LearningState = {
      version: 3,
      lessons: parseProgressMap(JSON.parse(legacyRaw)),
      questions: {},
      lessonEvents: [],
      concepts: {},
    };
    window.localStorage.setItem(V3_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return EMPTY_LEARNING_STATE;
  }
}

function writeLearningState(state: LearningState): void {
  window.localStorage.setItem(V3_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(LEARNING_STATE_EVENT));
}

export function subscribeLearningState(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LEARNING_STATE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LEARNING_STATE_EVENT, onStoreChange);
  };
}

export function learningStateSnapshot(): string {
  return JSON.stringify(readLearningState());
}

export function emptyLearningStateSnapshot(): string {
  return JSON.stringify(EMPTY_LEARNING_STATE);
}

export function readProgress(): ProgressMap {
  return readLearningState().lessons;
}

export function writeProgress(id: string, score: number, total: number): void {
  const current = readLearningState();
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
        conceptRetainedAt && conceptTransferredAt
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
        event.dueAt !== null,
    ),
  );
  const independentReviewCorrect = independentReviewAttempts.filter(
    (event) => event.correct,
  ).length;
  const confidenceAttempts = practiced.flatMap((item) =>
    item.attemptHistory.filter((event) => event.confidence !== null),
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
