import type { Lesson } from "./course/types";
import {
  REVIEW_API_VERSION,
  type ReviewBatchError,
  type ReviewBatchRequest,
  type ReviewBatchResponse,
} from "./review-contract.ts";
import { reviewVariant } from "./review-variant.ts";

export function resolveReviewBatchFromLessons(
  lessons: readonly Lesson[],
  request: ReviewBatchRequest,
  chapterTitleFor: (lesson: Lesson) => string,
): ReviewBatchResponse | ReviewBatchError {
  const items: ReviewBatchResponse["items"] = [];
  for (const ref of request.items) {
    const lesson = lessons.find((candidate) => candidate.id === ref.lessonId);
    const question = lesson?.questions.find(
      (candidate) => candidate.id === ref.questionId,
    );
    if (!lesson || !question) {
      return {
        version: REVIEW_API_VERSION,
        error: {
          code: "QUESTION_NOT_FOUND",
          message: "指定された講義と問題の組が見つかりません。",
        },
      };
    }
    items.push({
      lesson: {
        id: lesson.id,
        track: lesson.track,
        chapter: lesson.chapter,
        chapterTitle: chapterTitleFor(lesson),
        title: lesson.title,
      },
      question: reviewVariant(question, ref.attemptCount),
      attemptCount: ref.attemptCount,
    });
  }
  return { version: REVIEW_API_VERSION, items };
}
