import type {
  ReviewLessonDTO,
  ReviewQuestionIndexDTO,
} from "./course/client-dtos.ts";
import type { LearningState } from "./progress.ts";
import { questionProgressKey } from "./progress.ts";
import type { ReviewResolvedLessonDTO } from "./review-contract.ts";

export const DEFAULT_SESSION_SIZE = 10;

export type ReviewQueueRef = {
  lesson: ReviewResolvedLessonDTO;
  question: ReviewQuestionIndexDTO;
  attemptCount: number;
  lastAttemptAt: string;
  nextReviewAt: string;
  due: boolean;
  priority: number;
};

export type ReviewQueue = {
  items: ReviewQueueRef[];
  isPreview: boolean;
};

function timestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
    ? parsed
    : null;
}

function compareCatalogOrder(a: ReviewQueueRef, b: ReviewQueueRef): number {
  return a.question.catalogOrder - b.question.catalogOrder;
}

function interleave(items: ReviewQueueRef[]): ReviewQueueRef[] {
  const remaining = [...items];
  const mixed: ReviewQueueRef[] = [];
  while (remaining.length > 0) {
    const previous = mixed.at(-1);
    let index = previous
      ? remaining.findIndex(
          (item) =>
            item.question.contrastGroup !== null &&
            item.question.contrastGroup === previous.question.contrastGroup &&
            item.question.id !== previous.question.id,
        )
      : 0;
    if (index < 0 && previous) {
      index = remaining.findIndex(
        (item) =>
          item.lesson.id !== previous.lesson.id &&
          item.lesson.chapter !== previous.lesson.chapter,
      );
    }
    if (index < 0 && previous) {
      index = remaining.findIndex(
        (item) => item.lesson.id !== previous.lesson.id,
      );
    }
    if (index < 0) index = 0;
    const [next] = remaining.splice(index, 1);
    if (next) mixed.push(next);
  }
  return mixed;
}

export function buildReviewQueue(
  lessons: ReviewLessonDTO[],
  state: LearningState,
  now = new Date(),
): ReviewQueue {
  const practiced: ReviewQueueRef[] = [];
  const nowTime = now.getTime();
  for (const lesson of lessons) {
    for (const question of lesson.questions) {
      const progress =
        state.questions[questionProgressKey(lesson.id, question.id)];
      if (!progress?.lastAttemptAt || !progress.nextReviewAt) continue;
      const lastAttemptTime = timestamp(progress.lastAttemptAt);
      const nextReviewTime = timestamp(progress.nextReviewAt);
      if (lastAttemptTime === null || nextReviewTime === null) continue;
      const latestAttempt = progress.attemptHistory.at(-1);
      practiced.push({
        lesson: {
          id: lesson.id,
          track: lesson.track,
          chapter: lesson.chapter,
          chapterTitle: lesson.chapterTitle,
          title: lesson.title,
        },
        question,
        attemptCount:
          Number.isSafeInteger(progress.attempts) && progress.attempts >= 0
            ? progress.attempts
            : 0,
        lastAttemptAt: progress.lastAttemptAt,
        nextReviewAt: progress.nextReviewAt,
        due: nextReviewTime <= nowTime,
        priority:
          (progress.masteryStage === "needs-review" ? 4 : 0) +
          (latestAttempt?.correct === false ? 3 : 0) +
          (latestAttempt?.misconceptionId ? 2 : 0),
      });
    }
  }

  const due = practiced
    .filter((item) => item.due)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt) ||
        Date.parse(a.lastAttemptAt) - Date.parse(b.lastAttemptAt) ||
        compareCatalogOrder(a, b),
    );
  if (due.length > 0) {
    return {
      items: interleave(due).slice(0, DEFAULT_SESSION_SIZE),
      isPreview: false,
    };
  }

  const preview = practiced
    .sort(
      (a, b) =>
        Date.parse(b.lastAttemptAt) - Date.parse(a.lastAttemptAt) ||
        Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt) ||
        b.priority - a.priority ||
        compareCatalogOrder(a, b),
    );
  return {
    items: interleave(preview).slice(0, DEFAULT_SESSION_SIZE),
    isPreview: true,
  };
}
