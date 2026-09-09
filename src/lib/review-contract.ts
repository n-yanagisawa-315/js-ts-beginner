import type { Question } from "./course/types";
import type {
  ReviewLessonDTO,
} from "./course/client-dtos";

export const REVIEW_API_VERSION = 1 as const;
export const MAX_REVIEW_BATCH_SIZE = 10;
export const MAX_REVIEW_ID_LENGTH = 128;

export type ReviewBatchRef = {
  lessonId: string;
  questionId: string;
  attemptCount: number;
};

export type ReviewBatchRequest = {
  version: typeof REVIEW_API_VERSION;
  items: ReviewBatchRef[];
};

export type ReviewResolvedLessonDTO = Omit<ReviewLessonDTO, "questions">;

export type ReviewBatchItem = {
  lesson: ReviewResolvedLessonDTO;
  question: Question;
  attemptCount: number;
};

export type ReviewBatchResponse = {
  version: typeof REVIEW_API_VERSION;
  items: ReviewBatchItem[];
};

export type ReviewBatchError = {
  version: typeof REVIEW_API_VERSION;
  error: {
    code: "INVALID_REQUEST" | "QUESTION_NOT_FOUND";
    message: string;
  };
};

type ParseResult =
  | { ok: true; value: ReviewBatchRequest }
  | { ok: false; error: ReviewBatchError };

function invalid(message: string): ParseResult {
  return {
    ok: false,
    error: {
      version: REVIEW_API_VERSION,
      error: { code: "INVALID_REQUEST", message },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_REVIEW_ID_LENGTH &&
    value.trim() === value
  );
}

const TRACKS = new Set(["js", "ts", "node", "sql", "github"]);
const QUESTION_KINDS = new Set([
  "choice",
  "input",
  "code",
  "shell",
  "order",
  "sql",
  "git",
]);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOptionalStringArray(value: unknown): value is string[] | undefined {
  return value === undefined || isStringArray(value);
}

function isSqlExpectedRows(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every(
        (row) =>
          isRecord(row) &&
          Object.values(row).every(
            (cell) =>
              typeof cell === "string" ||
              typeof cell === "number" ||
              cell === null,
          ),
      ))
  );
}

function isGitInitialState(value: unknown): boolean {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  return (
    (value.files === undefined ||
      (isRecord(value.files) && Object.values(value.files).every(isString))) &&
    isOptionalString(value.branch) &&
    isOptionalStringArray(value.branches) &&
    isOptionalString(value.remote) &&
    (value.initialized === undefined || typeof value.initialized === "boolean")
  );
}

function isGitAssertions(value: unknown): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  return value.every((assertion) => {
    if (!isRecord(assertion) || !isString(assertion.kind)) return false;
    switch (assertion.kind) {
      case "staged":
        return isString(assertion.path);
      case "commit-count":
        return (
          Number.isSafeInteger(assertion.count) &&
          (assertion.count as number) >= 0
        );
      case "branch":
      case "remote":
        return isString(assertion.name);
      case "pushed":
        return isString(assertion.branch);
      case "pr-open":
        return isString(assertion.base) && isString(assertion.head);
      case "remote-tracked":
        return isString(assertion.remote) && isString(assertion.branch);
      case "merged":
        return isString(assertion.branch);
      case "clean":
      case "initialized":
        return true;
      default:
        return false;
    }
  });
}

function isQuestion(value: unknown): value is Question {
  if (
    !isRecord(value) ||
    !isBoundedId(value.id) ||
    !isString(value.prompt) ||
    !isString(value.answer) ||
    !isString(value.explain) ||
    !isString(value.kind) ||
    !QUESTION_KINDS.has(value.kind)
  ) {
    return false;
  }
  if (
    !isOptionalString(value.starter) ||
    !isOptionalString(value.sample) ||
    !isOptionalString(value.hint) ||
    !isOptionalString(value.fixtureHtml) ||
    !isOptionalString(value.domProbe) ||
    !isOptionalString(value.sqlSchema) ||
    !isOptionalString(value.sqlSeed) ||
    !isOptionalString(value.sqlExpectedTable) ||
    !isOptionalStringArray(value.aliases) ||
    !isOptionalStringArray(value.steps) ||
    !isOptionalStringArray(value.hints) ||
    !isOptionalStringArray(value.conceptIds) ||
    !isSqlExpectedRows(value.sqlExpectedRows) ||
    !isGitInitialState(value.gitInitialState) ||
    !isGitAssertions(value.gitAssertions)
  ) {
    return false;
  }
  if (value.kind === "choice") {
    return (
      isStringArray(value.options) &&
      value.options.length > 0 &&
      value.options.includes(value.answer)
    );
  }
  if (value.kind === "order") {
    return isStringArray(value.fragments) && value.fragments.length > 0;
  }
  if (value.kind === "sql") {
    return isString(value.sqlSchema) && isString(value.sqlSeed);
  }
  if (value.kind === "git") {
    return isRecord(value.gitInitialState) && Array.isArray(value.gitAssertions);
  }
  return true;
}

function isResolvedLesson(value: unknown): value is ReviewResolvedLessonDTO {
  return (
    isRecord(value) &&
    isBoundedId(value.id) &&
    isString(value.track) &&
    TRACKS.has(value.track) &&
    isBoundedId(value.chapter) &&
    isString(value.chapterTitle) &&
    isString(value.title)
  );
}

export function parseReviewBatchRequest(value: unknown): ParseResult {
  if (!isRecord(value) || value.version !== REVIEW_API_VERSION) {
    return invalid("version が対応していません。");
  }
  if (
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > MAX_REVIEW_BATCH_SIZE
  ) {
    return invalid(`items は1〜${MAX_REVIEW_BATCH_SIZE}件で指定してください。`);
  }

  const items: ReviewBatchRef[] = [];
  const pairs = new Set<string>();
  for (const item of value.items) {
    if (
      !isRecord(item) ||
      !isBoundedId(item.lessonId) ||
      !isBoundedId(item.questionId) ||
      typeof item.attemptCount !== "number" ||
      !Number.isSafeInteger(item.attemptCount) ||
      item.attemptCount < 0
    ) {
      return invalid("各 item のIDと attemptCount が不正です。");
    }
    const pair = JSON.stringify([item.lessonId, item.questionId]);
    if (pairs.has(pair)) {
      return invalid("lessonId と questionId の組は重複できません。");
    }
    pairs.add(pair);
    items.push({
      lessonId: item.lessonId,
      questionId: item.questionId,
      attemptCount: item.attemptCount,
    });
  }

  return {
    ok: true,
    value: { version: REVIEW_API_VERSION, items },
  };
}

export function isReviewBatchResponseFor(
  value: unknown,
  request: ReviewBatchRequest,
): value is ReviewBatchResponse {
  if (
    !isRecord(value) ||
    value.version !== REVIEW_API_VERSION ||
    !Array.isArray(value.items) ||
    value.items.length !== request.items.length
  ) {
    return false;
  }
  return value.items.every((item, index) => {
    const expected = request.items[index];
    return (
      isRecord(item) &&
      isResolvedLesson(item.lesson) &&
      isQuestion(item.question) &&
      item.lesson.id === expected.lessonId &&
      item.question.id === expected.questionId &&
      typeof item.attemptCount === "number" &&
      Number.isSafeInteger(item.attemptCount) &&
      item.attemptCount >= 0 &&
      item.attemptCount === expected.attemptCount
    );
  });
}

