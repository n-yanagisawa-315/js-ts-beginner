import type { Lesson, Question } from "./course/types.ts";
import {
  questionProgressKey,
  type LearningState,
} from "./progress.ts";

export type ReviewItem = {
  lesson: Lesson;
  question: Question;
  lastAttemptAt: string;
  nextReviewAt: string;
  due: boolean;
  priority: number;
};

export const DEFAULT_SESSION_SIZE = 10;
const REVIEW_REPLACEMENTS = [
  ["Aya", "Ren"],
  ["Tokyo", "Osaka"],
  ["hello", "welcome"],
  ["apple", "orange"],
] as const;
const RESERVED_LITERAL_VALUES = new Set([
  "number",
  "string",
  "boolean",
  "undefined",
  "object",
  "function",
  "GET",
  "POST",
  "PUT",
  "DELETE",
]);

function replacementFor(question: Question):
  | { from: string; to: string; kind: "value" | "identifier"; identifier: boolean }
  | undefined {
  const known = REVIEW_REPLACEMENTS.find(([from]) =>
    [
      question.prompt,
      question.lead,
      question.code,
      question.starter,
      question.answer,
      question.sample,
    ].some((value) => value?.includes(from)),
  );
  if (known) {
    return { from: known[0], to: known[1], kind: "value", identifier: false };
  }
  const identifier = question.answer.match(
    /\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/,
  )?.[1];
  if (
    identifier &&
    !["console", "require", "module", "exports"].includes(identifier)
  ) {
    return {
      from: identifier,
      to: `${identifier}Review`,
      kind: "identifier",
      identifier: true,
    };
  }
  const literal = [...question.answer.matchAll(/(["'])([^"'\\\n]+)\1/g)]
    .map((match) => match[2])
    .find(
      (value) =>
        value &&
        !RESERVED_LITERAL_VALUES.has(value) &&
        !value.startsWith("/") &&
        !value.startsWith("node:") &&
        !/\.[a-z]{1,5}$/i.test(value),
    );
  return literal
    ? {
        from: literal,
        to: `${literal}-復習`,
        kind: "value",
        identifier: false,
      }
    : undefined;
}

export function reviewVariant(question: Question, attemptCount: number): Question {
  const replacement = replacementFor(question);
  if (!replacement) {
    const rotatedOptions = question.options?.length
      ? [...question.options.slice(1), question.options[0]!]
      : question.options;
    return {
      ...question,
      options: rotatedOptions,
      variantId: `${question.variantId ?? question.id}:context-review-${attemptCount + 1}`,
      scenario: `前回とは異なる注文の調査担当として、資料を見ずに根拠を説明します。${question.scenario ?? ""}`,
      scaffoldLevel: "independent",
    };
  }
  const { from, to, kind, identifier } = replacement;
  const replace = (value: string | undefined) =>
    identifier
      ? value?.replace(new RegExp(`\\b${from}\\b`, "g"), to)
      : value?.replaceAll(from, to);
  return {
    ...question,
    prompt: replace(question.prompt) ?? question.prompt,
    lead: replace(question.lead),
    code: replace(question.code),
    starter: replace(question.starter),
    options: question.options?.map((option) => replace(option) ?? option),
    steps: question.steps?.map((step) => replace(step) ?? step),
    hints: question.hints?.map((hint) => replace(hint) ?? hint),
    hint: replace(question.hint),
    sample: replace(question.sample),
    answer: replace(question.answer) ?? question.answer,
    explain: replace(question.explain) ?? question.explain,
    feedbackByAnswer: question.feedbackByAnswer
      ? Object.fromEntries(
          Object.entries(question.feedbackByAnswer).map(([answer, feedback]) => [
            replace(answer) ?? answer,
            replace(feedback) ?? feedback,
          ]),
        )
      : undefined,
    misconceptionByAnswer: question.misconceptionByAnswer
      ? Object.fromEntries(
          Object.entries(question.misconceptionByAnswer).map(
            ([answer, diagnosis]) => [
              replace(answer) ?? answer,
              {
                ...diagnosis,
                feedback: replace(diagnosis.feedback) ?? diagnosis.feedback,
                nextCheck: replace(diagnosis.nextCheck) ?? diagnosis.nextCheck,
              },
            ],
          ),
        )
      : undefined,
    fragments: question.fragments?.map((fragment) => replace(fragment) ?? fragment),
    variantId: `${question.variantId ?? question.id}:${kind}-review-${attemptCount + 1}`,
    scenario: `値や場面を変えた復習問題です。${replace(question.scenario) ?? ""}`,
    scaffoldLevel: "independent",
  };
}

function interleave(items: ReviewItem[]): ReviewItem[] {
  const remaining = [...items];
  const mixed: ReviewItem[] = [];
  while (remaining.length > 0) {
    const previous = mixed.at(-1);
    let index = previous
      ? remaining.findIndex(
          (item) =>
            Boolean(item.question.contrastGroup) &&
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
  lessons: Lesson[],
  state: LearningState,
  now = new Date(),
): { items: ReviewItem[]; isPreview: boolean } {
  const practiced: ReviewItem[] = [];
  for (const lesson of lessons) {
    for (const question of lesson.questions) {
      const progress =
        state.questions[questionProgressKey(lesson.id, question.id)];
      if (!progress?.lastAttemptAt || !progress.nextReviewAt) continue;
      practiced.push({
        lesson,
        question: reviewVariant(question, progress.attempts),
        lastAttemptAt: progress.lastAttemptAt,
        nextReviewAt: progress.nextReviewAt,
        due: new Date(progress.nextReviewAt).getTime() <= now.getTime(),
        priority:
          (progress.masteryStage === "needs-review" ? 4 : 0) +
          (progress.attemptHistory.at(-1)?.correct === false ? 3 : 0) +
          (progress.attemptHistory.at(-1)?.misconceptionId ? 2 : 0),
      });
    }
  }

  const due = practiced
    .filter((item) => item.due)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        new Date(a.nextReviewAt).getTime() -
          new Date(b.nextReviewAt).getTime(),
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
        new Date(b.lastAttemptAt).getTime() -
        new Date(a.lastAttemptAt).getTime(),
    )
    .slice(0, DEFAULT_SESSION_SIZE);
  return { items: interleave(preview), isPreview: true };
}
