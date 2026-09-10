export type LessonResumePhase =
  | "predict"
  | "slides"
  | "quiz"
  | "exit"
  | "done";

export type LessonResumeState = {
  phase: LessonResumePhase;
  slide: number;
  conversationPage: number;
  prediction: string;
  exitRecall: string;
  attemptedSlides: number[];
  correctCount: number;
  drafts: Record<number, string>;
  updatedAt: string;
};

const RESUME_KEY = "js-ts-beginner-lesson-resume-v1";
const RESUME_EVENT = "js-ts-beginner-lesson-resume";

type ResumeMap = Record<string, LessonResumeState>;

function isPhase(value: unknown): value is LessonResumePhase {
  return (
    value === "predict" ||
    value === "slides" ||
    value === "quiz" ||
    value === "exit" ||
    value === "done"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDrafts(value: unknown): Record<number, string> {
  if (!isRecord(value)) return {};
  const drafts: Record<number, string> = {};
  for (const [key, draft] of Object.entries(value)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || typeof draft !== "string") {
      continue;
    }
    drafts[index] = draft;
  }
  return drafts;
}

function parseResumeState(value: unknown): LessonResumeState | null {
  if (!isRecord(value) || !isPhase(value.phase)) return null;
  if (
    typeof value.slide !== "number" ||
    !Number.isInteger(value.slide) ||
    value.slide < 0
  ) {
    return null;
  }
  if (
    typeof value.conversationPage !== "number" ||
    !Number.isInteger(value.conversationPage) ||
    value.conversationPage < 0
  ) {
    return null;
  }
  if (typeof value.prediction !== "string") return null;
  if (typeof value.exitRecall !== "string") return null;
  if (typeof value.correctCount !== "number" || value.correctCount < 0) {
    return null;
  }
  if (typeof value.updatedAt !== "string") return null;
  const attemptedSlides = Array.isArray(value.attemptedSlides)
    ? value.attemptedSlides.filter(
        (item): item is number =>
          typeof item === "number" && Number.isInteger(item) && item >= 0,
      )
    : [];
  return {
    phase: value.phase,
    slide: value.slide,
    conversationPage: value.conversationPage,
    prediction: value.prediction.slice(0, 2000),
    exitRecall: value.exitRecall.slice(0, 2000),
    attemptedSlides,
    correctCount: Math.floor(value.correctCount),
    drafts: parseDrafts(value.drafts),
    updatedAt: value.updatedAt,
  };
}

function readResumeMap(): ResumeMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RESUME_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};
    const map: ResumeMap = {};
    for (const [lessonId, value] of Object.entries(parsed)) {
      const state = parseResumeState(value);
      if (state) map[lessonId] = state;
    }
    return map;
  } catch {
    return {};
  }
}

function writeResumeMap(map: ResumeMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESUME_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(RESUME_EVENT));
  } catch {
    // Ignore quota / private mode failures; lesson can still continue in memory.
  }
}

export function readLessonResume(lessonId: string): LessonResumeState | null {
  return readResumeMap()[lessonId] ?? null;
}

export function writeLessonResume(
  lessonId: string,
  state: Omit<LessonResumeState, "updatedAt">,
): void {
  const map = readResumeMap();
  map[lessonId] = {
    ...state,
    prediction: state.prediction.slice(0, 2000),
    exitRecall: state.exitRecall.slice(0, 2000),
    attemptedSlides: [...new Set(state.attemptedSlides)].sort((a, b) => a - b),
    drafts: Object.fromEntries(
      Object.entries(state.drafts).filter(([, value]) => value.trim() !== ""),
    ),
    updatedAt: new Date().toISOString(),
  };
  writeResumeMap(map);
}

export function clearLessonResume(lessonId: string): void {
  const map = readResumeMap();
  if (!(lessonId in map)) return;
  delete map[lessonId];
  writeResumeMap(map);
}

export function subscribeLessonResume(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === RESUME_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(RESUME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RESUME_EVENT, onStoreChange);
  };
}
