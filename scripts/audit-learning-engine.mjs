import assert from "node:assert/strict";

const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

const progress = await import("../src/lib/progress.ts");
const { buildReviewQueue, reviewVariant, DEFAULT_SESSION_SIZE } = await import(
  "../src/lib/review-queue.ts"
);
const { applyCourseLearningDesign } = await import(
  "../src/lib/course/learning-design.ts"
);

const start = new Date("2026-01-01T09:00:00.000Z");
const first = progress.recordQuestionAttempt({
  lessonId: "lesson-a",
  questionId: "q1",
  correct: true,
  attemptedAt: start,
  context: "lesson",
  firstAttempt: true,
  conceptIds: ["js:values"],
});
assert.equal(first.intervalDays, 1, "初回の無支援正答は1日後に設定する");
assert.equal(first.masteryStage, "practicing");

const repeated = progress.recordQuestionAttempt({
  lessonId: "lesson-a",
  questionId: "q1",
  correct: true,
  attemptedAt: new Date(start.getTime() + 60_000),
  context: "lesson",
  firstAttempt: false,
});
assert.equal(
  repeated.nextReviewAt,
  first.nextReviewAt,
  "同一セッションの再試行では間隔を伸ばさない",
);

const dueAt = new Date(new Date(first.nextReviewAt).getTime() + 1);
const retained = progress.recordQuestionAttempt({
  lessonId: "lesson-a",
  questionId: "q1",
  correct: true,
  attemptedAt: dueAt,
  context: "review",
  firstAttempt: true,
  conceptIds: ["js:values"],
});
assert.equal(retained.intervalDays, 3, "期限後の無支援初回正答だけ進級する");
assert.equal(retained.masteryStage, "retained");

progress.recordQuestionAttempt({
  lessonId: "lesson-a",
  questionId: "q1",
  correct: true,
  attemptedAt: new Date(dueAt.getTime() + 60_000),
  context: "transfer",
  firstAttempt: true,
  conceptIds: ["js:values"],
});
assert.equal(
  progress.readLearningState().concepts["js:values"].masteryStage,
  "mastered",
  "保持済み概念を転移課題で使えたときだけ概念習熟にする",
);

progress.recordLessonLearningEvent({
  lessonId: "lesson-a",
  context: "prequestion",
  response: "先に値が決まると予想する",
  confidence: 50,
  recordedAt: start,
});
assert.equal(progress.readLearningState().lessonEvents.length, 1);

const supportedAt = new Date(new Date(retained.nextReviewAt).getTime() + 1);
const supported = progress.recordQuestionAttempt({
  lessonId: "lesson-a",
  questionId: "q1",
  correct: true,
  attemptedAt: supportedAt,
  context: "review",
  firstAttempt: true,
  supported: true,
  hintLevel: 1,
});
assert.equal(
  supported.nextReviewAt,
  retained.nextReviewAt,
  "ヒント付き正答では間隔を伸ばさない",
);

storage.clear();
const assistedInitial = progress.recordQuestionAttempt({
  lessonId: "lesson-b",
  questionId: "q1",
  correct: true,
  attemptedAt: start,
  context: "lesson",
  firstAttempt: true,
  answerViewed: true,
});
assert.equal(assistedInitial.intervalDays, 0);
assert.equal(
  new Date(assistedInitial.nextReviewAt).getTime() - start.getTime(),
  progress.INCORRECT_REVIEW_DELAY_MS,
  "答え閲覧後は短い無支援再確認を予定する",
);

const baseQuestion = {
  id: "q1",
  prompt: "Ayaを表示してください",
  kind: "choice",
  options: ["Aya", "Ren"],
  answer: "Aya",
  explain: "Ayaが正解です",
  variantId: "lesson-a:q1:base",
  contrastGroup: "names",
};
const variant = reviewVariant(baseQuestion, 1);
assert.match(variant.prompt, /Ren/);
assert.equal(variant.answer, "Ren");
assert.equal(variant.scaffoldLevel, "independent");

const identifierVariant = reviewVariant(
  {
    ...baseQuestion,
    kind: "code",
    prompt: "countを表示する",
    answer: "const count = 1;\nconsole.log(count);",
    options: undefined,
  },
  2,
);
assert.match(identifierVariant.answer, /countReview/);
assert.match(identifierVariant.variantId, /identifier-review/);

const contextVariant = reviewVariant(
  {
    ...baseQuestion,
    prompt: "適切な説明を選ぶ",
    options: ["増える", "減る", "変わらない"],
    answer: "変わらない",
  },
  3,
);
assert.notDeepEqual(contextVariant.options, ["増える", "減る", "変わらない"]);
assert.match(contextVariant.variantId, /context-review/);

const fixtureLesson = (id, order) => ({
  id,
  track: "js",
  level: "start",
  chapter: "js-syntax",
  order,
  title: `講義${order}`,
  summary: `結果${order}`,
  minutes: 1,
  slides: [
    { title: "値を調べる", lead: "値を確認する", diagram: "values", talk: [] },
    { title: "値を保存する", lead: "名前を付ける", diagram: "label", talk: [] },
    { title: "別の値で試す", lead: "別場面へ移す", diagram: "rewrite", talk: [] },
  ],
  questions: [
    {
      id: "q1",
      slide: 0,
      prompt: "console.logを選ぶ",
      kind: "choice",
      options: ["Console.log", "console.log", "console.Log"],
      answer: "console.log",
      explain: "大小を区別します",
    },
    {
      id: "q2",
      slide: 1,
      prompt: "値を保存して表示する",
      kind: "code",
      starter: "",
      answer: "const count = 1;\nconsole.log(count);",
      explain: "保存後に表示します",
    },
    {
      id: "q3",
      slide: 2,
      prompt: "結果を選ぶ",
      kind: "choice",
      options: ["1", "2", "3"],
      answer: "1",
      explain: "1です",
    },
  ],
});
const designed = applyCourseLearningDesign([
  fixtureLesson("story-1", 1),
  fixtureLesson("story-2", 2),
]);
assert.match(designed[1].story.incident, /前の講義で「結果1」まで確認/);
assert.match(designed[0].slides[1].storyContext, /値を調べる.*値を保存する/);
assert.match(designed[0].questions[1].starter, /ここを1行だけ補う/);
assert.equal(designed[1].questions[1].kind, "order");
assert.ok(designed[1].questions[1].fragments.length >= 2);
assert.equal(designed[1].questions[2].exerciseKind, "transfer");
assert.match(designed[1].questions[2].answer, /paidOrders.*npm ci/);
const diagnoses = Object.values(designed[0].questions[0].misconceptionByAnswer);
assert.ok(diagnoses.every((item) => item.id && item.nextCheck));
assert.equal(
  new Set(diagnoses.map((item) => item.feedback)).size,
  diagnoses.length,
  "各選択肢に固有の説明を返す",
);

storage.clear();
const lessons = [
  {
    id: "lesson-a",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 1,
    title: "test",
    summary: "test",
    minutes: 1,
    slides: [],
    questions: Array.from({ length: 12 }, (_, index) => ({
      ...baseQuestion,
      id: `q${index + 1}`,
      variantId: `q${index + 1}:base`,
    })),
  },
];
for (const question of lessons[0].questions) {
  progress.recordQuestionAttempt({
    lessonId: lessons[0].id,
    questionId: question.id,
    correct: true,
    attemptedAt: start,
    context: "lesson",
    firstAttempt: true,
  });
}
const queue = buildReviewQueue(
  lessons,
  progress.readLearningState(),
  new Date(start.getTime() + 24 * 60 * 60 * 1000 + 1),
);
assert.equal(queue.isPreview, false);
assert.equal(queue.items.length, DEFAULT_SESSION_SIZE, "復習は短い既定件数に制限する");
assert.ok(queue.items.every((item) => item.due));

storage.clear();
storage.set(
  "js-ts-beginner-learning-v2",
  JSON.stringify({
    version: 2,
    lessons: { legacy: { score: 1, total: 2 } },
    questions: {},
  }),
);
const migrated = progress.readLearningState();
assert.equal(migrated.version, 3);
assert.deepEqual(migrated.lessons.legacy, { score: 1, total: 2 });

console.log(
  "V3移行・無支援進級・支援付き据え置き・全問復習変種・因果物語・穴埋め・行並べ替え・誤概念診断・10問上限を確認しました。",
);
