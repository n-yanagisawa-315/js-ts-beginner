import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { buildReviewQueue, DEFAULT_SESSION_SIZE } = await import(
  "../src/lib/review-queue.ts"
);
const {
  isReviewBatchResponseFor,
  parseReviewBatchRequest,
  REVIEW_API_VERSION,
} = await import("../src/lib/review-contract.ts");
const { resolveReviewBatchFromLessons } = await import(
  "../src/lib/review-resolver.ts"
);
const { reviewVariant } = await import("../src/lib/review-variant.ts");

const index = [
  {
    id: "lesson-a",
    track: "js",
    chapter: "js-syntax",
    chapterTitle: "構文",
    title: "講義A",
    questions: [
      { id: "a1", kind: "choice", contrastGroup: "contrast", catalogOrder: 0 },
      { id: "a2", kind: "code", contrastGroup: "contrast", catalogOrder: 1 },
      { id: "bad-date", kind: "input", contrastGroup: null, catalogOrder: 2 },
    ],
  },
  {
    id: "lesson-b",
    track: "ts",
    chapter: "ts-intro",
    chapterTitle: "TypeScript",
    title: "講義B",
    questions: [
      { id: "future", kind: "order", contrastGroup: null, catalogOrder: 3 },
    ],
  },
];

function questionProgress({
  attempts = 1,
  lastAttemptAt,
  nextReviewAt,
  masteryStage = "practicing",
  correct = true,
  misconceptionId = null,
}) {
  return {
    attempts,
    incorrectAttempts: correct ? 0 : 1,
    firstTryCorrect: correct,
    hintUsed: false,
    answerViewed: false,
    lastAttemptAt,
    lastCorrectAt: correct ? lastAttemptAt : null,
    streak: 1,
    intervalDays: 1,
    nextReviewAt,
    hintUseCount: 0,
    answerViewCount: 0,
    lastAssistanceAt: null,
    masteryStage,
    retainedAt: null,
    transferredAt: null,
    attemptHistory: [
      {
        correct,
        misconceptionId,
      },
    ],
    selfExplanations: [],
  };
}

const state = {
  version: 3,
  lessons: {},
  lessonEvents: [],
  concepts: {},
  questions: {
    "lesson-a:a1": questionProgress({
      attempts: 2,
      lastAttemptAt: "2026-01-03T00:00:00.000Z",
      nextReviewAt: "2026-01-04T00:00:00.000Z",
    }),
    "lesson-a:a2": questionProgress({
      attempts: 7,
      lastAttemptAt: "2026-01-02T00:00:00.000Z",
      nextReviewAt: "2026-01-05T00:00:00.000Z",
      masteryStage: "needs-review",
      correct: false,
      misconceptionId: "misread",
    }),
    "lesson-a:bad-date": questionProgress({
      lastAttemptAt: "not-a-date",
      nextReviewAt: "2026-01-01T00:00:00.000Z",
    }),
    "lesson-b:future": questionProgress({
      lastAttemptAt: "2026-01-06T00:00:00.000Z",
      nextReviewAt: "2026-02-01T00:00:00.000Z",
    }),
    "unknown:question": questionProgress({
      lastAttemptAt: "2026-01-01T00:00:00.000Z",
      nextReviewAt: "2026-01-02T00:00:00.000Z",
    }),
  },
};

const dueQueue = buildReviewQueue(
  index,
  state,
  new Date("2026-01-10T00:00:00.000Z"),
);
assert.equal(dueQueue.isPreview, false);
assert.deepEqual(
  dueQueue.items.map((item) => item.question.id),
  ["a2", "a1"],
  "期限到来だけを対象にし、優先度の後で同じ対比群を並べる",
);
assert.equal(dueQueue.items[0].priority, 9);
assert.equal(dueQueue.items[0].attemptCount, 7);
assert.ok(dueQueue.items.every((item) => item.due));

const previewQueue = buildReviewQueue(
  index,
  state,
  new Date("2025-12-01T00:00:00.000Z"),
);
assert.equal(previewQueue.isPreview, true);
assert.equal(
  previewQueue.items[0].question.id,
  "future",
  "期限到来がなければ最終回答が新しい問題から先取りする",
);
assert.ok(previewQueue.items.every((item) => !item.due));

const tieIndex = [
  {
    ...index[0],
    questions: [
      { id: "later", kind: "choice", contrastGroup: null, catalogOrder: 20 },
      { id: "earlier", kind: "choice", contrastGroup: null, catalogOrder: 10 },
    ],
  },
];
const tieProgress = questionProgress({
  lastAttemptAt: "2026-01-01T00:00:00.000Z",
  nextReviewAt: "2026-01-02T00:00:00.000Z",
});
const tieQueue = buildReviewQueue(
  tieIndex,
  {
    ...state,
    questions: {
      "lesson-a:later": tieProgress,
      "lesson-a:earlier": tieProgress,
    },
  },
  new Date("2026-01-03T00:00:00.000Z"),
);
assert.equal(tieQueue.items[0].question.id, "earlier");
assert.equal(DEFAULT_SESSION_SIZE, 10);

const baseQuestion = {
  id: "q1",
  prompt: "Ayaを表示してください",
  kind: "choice",
  options: ["Aya", "Ren"],
  answer: "Aya",
  explain: "Ayaが正解です",
  reviewVariants: [{ id: "authored", prompt: "著者版を選んでください" }],
};
const authored = reviewVariant(baseQuestion, 0);
assert.equal(authored.prompt, "著者版を選んでください");
assert.match(authored.variantId, /authored$/);
const contextual = reviewVariant(
  { ...baseQuestion, reviewVariants: undefined },
  1,
);
assert.equal(contextual.answer, "Ren");
assert.equal(contextual.scaffoldLevel, "independent");

const validRequest = {
  version: REVIEW_API_VERSION,
  items: [{ lessonId: "lesson-a", questionId: "q1", attemptCount: 2 }],
};
const parsed = parseReviewBatchRequest(validRequest);
assert.equal(parsed.ok, true);
assert.equal(parseReviewBatchRequest({ ...validRequest, version: 2 }).ok, false);
assert.equal(parseReviewBatchRequest({ ...validRequest, items: [] }).ok, false);
assert.equal(
  parseReviewBatchRequest({
    ...validRequest,
    items: Array.from({ length: 11 }, (_, index) => ({
      lessonId: "lesson-a",
      questionId: `q${index}`,
      attemptCount: 0,
    })),
  }).ok,
  false,
);
for (const item of [
  { lessonId: "", questionId: "q1", attemptCount: 0 },
  { lessonId: "lesson-a", questionId: " q1", attemptCount: 0 },
  { lessonId: "lesson-a", questionId: "q1", attemptCount: -1 },
  { lessonId: "lesson-a", questionId: "q1", attemptCount: 1.5 },
  { lessonId: "lesson-a", questionId: "q1", attemptCount: Number.MAX_VALUE },
]) {
  assert.equal(
    parseReviewBatchRequest({ version: REVIEW_API_VERSION, items: [item] }).ok,
    false,
  );
}
assert.equal(
  parseReviewBatchRequest({
    version: REVIEW_API_VERSION,
    items: [validRequest.items[0], validRequest.items[0]],
  }).ok,
  false,
);

const fixtureLesson = {
  id: "lesson-a",
  track: "js",
  level: "start",
  chapter: "js-syntax",
  order: 1,
  title: "講義A",
  summary: "テスト",
  minutes: 1,
  slides: [],
  questions: [
    baseQuestion,
    { ...baseQuestion, id: "q2", reviewVariants: undefined },
  ],
};
const resolved = resolveReviewBatchFromLessons(
  [fixtureLesson],
  validRequest,
  () => "構文",
);
assert.ok(!("error" in resolved));
assert.equal(resolved.items[0].question.id, "q1");
assert.equal(resolved.items[0].attemptCount, 2);
assert.equal(
  isReviewBatchResponseFor(resolved, validRequest),
  true,
  "応答順と要求ペアを照合する",
);
const orderedRequest = {
  version: REVIEW_API_VERSION,
  items: [
    { lessonId: "lesson-a", questionId: "q1", attemptCount: 2 },
    { lessonId: "lesson-a", questionId: "q2", attemptCount: 1 },
  ],
};
const ordered = resolveReviewBatchFromLessons(
  [fixtureLesson],
  orderedRequest,
  () => "構文",
);
assert.ok(!("error" in ordered));
assert.equal(isReviewBatchResponseFor(ordered, orderedRequest), true);
assert.equal(
  isReviewBatchResponseFor(
    { ...ordered, items: [...ordered.items].reverse() },
    orderedRequest,
  ),
  false,
  "並び替わった応答を拒否する",
);
const malformedQuestion = structuredClone(ordered);
malformedQuestion.items[0].question.prompt = 42;
assert.equal(
  isReviewBatchResponseFor(malformedQuestion, orderedRequest),
  false,
  "内部Questionが壊れた応答を拒否する",
);
const missing = resolveReviewBatchFromLessons(
  [fixtureLesson],
  {
    version: REVIEW_API_VERSION,
    items: [{ lessonId: "other", questionId: "q1", attemptCount: 0 }],
  },
  () => "構文",
);
assert.ok("error" in missing);
assert.equal(missing.error.code, "QUESTION_NOT_FOUND");

const dtoSource = fs.readFileSync(
  path.join(ROOT, "src/lib/course/client-dtos.ts"),
  "utf8",
);
const reviewTypes = dtoSource.slice(dtoSource.indexOf("export type ReviewQuestionIndexDTO"));
assert.match(reviewTypes, /kind:\s*Question\["kind"\]/);
for (const field of [
  "answer",
  "explain",
  "fixtureHtml",
  "typeTests",
  "reviewVariants",
  "sqlSchema",
  "gitInitialState",
]) {
  assert.ok(!reviewTypes.includes(field), `Review indexに${field}を含めない`);
}

const serverSource = fs.readFileSync(
  path.join(ROOT, "src/lib/course/server.ts"),
  "utf8",
);
const getReviewSource = serverSource.slice(
  serverSource.indexOf("export function getReviewPageDTO"),
  serverSource.indexOf("export function resolveReviewBatch"),
);
assert.match(getReviewSource, /questions:\s*lesson\.questions\.map/);
assert.match(getReviewSource, /kind:\s*question\.kind/);
assert.doesNotMatch(getReviewSource, /questions:\s*lesson\.questions[,}\n]/);

const routeSource = fs.readFileSync(
  path.join(ROOT, "src/app/api/review/questions/route.ts"),
  "utf8",
);
assert.match(routeSource, /await request\.json\(\)/);
assert.match(routeSource, /catch\s*\{/);
assert.match(routeSource, /"Cache-Control": "no-store"/);

const clientSource = fs.readFileSync(
  path.join(ROOT, "src/components/review-session.tsx"),
  "utf8",
);
assert.doesNotMatch(clientSource, /@\/lib\/course\/server/);
assert.match(clientSource, /\/api\/review\/questions/);
assert.match(clientSource, /question\.kind === "sql"/);
assert.match(clientSource, /question\.kind === "git"/);
assert.match(clientSource, /preloadReviewExerciseChunks\(initialQueue\)/);
assert.ok(
  clientSource.indexOf("preloadReviewExerciseChunks(initialQueue)") <
    clientSource.indexOf(".then((response)"),
  "API応答前にkindベースのchunk preloadを開始する",
);

console.log(
  "軽量index、期限/先取り排他、優先度・交互化・catalog順、変種、バッチ検証、サーバー解決、Client境界を確認しました。",
);
