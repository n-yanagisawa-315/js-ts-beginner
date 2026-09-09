import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const COURSE_DIR = path.join(ROOT, "src/lib/course");
const COURSE_FILES = [
  "js-start.ts",
  "js-basic.ts",
  "js-callback.ts",
  "js-middle.ts",
  "js-modern.ts",
  "js-advanced.ts",
  "js-dom.ts",
  "js-npm.ts",
  "ts-lessons.ts",
  "ts-modern.ts",
  "node-start.ts",
  "node-core.ts",
];

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return undefined;
}

function propertiesOf(object) {
  return new Map(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [propertyName(property.name), property.initializer]),
  );
}

function textOf(node) {
  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.text;
  }
  return "";
}

function numberOf(node) {
  return node && ts.isNumericLiteral(node) ? Number(node.text) : undefined;
}

function arrayOf(node) {
  return node && ts.isArrayLiteralExpression(node)
    ? node.elements.filter(ts.isObjectLiteralExpression)
    : [];
}

const issues = [];
const lessons = new Map();
let teachingSlides = 0;
let questions = 0;

for (const file of COURSE_FILES) {
  const fullPath = path.join(COURSE_DIR, file);
  const sourceText = fs.readFileSync(fullPath, "utf8");
  const sourceFile = ts.createSourceFile(
    fullPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  function visit(node) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const fields = propertiesOf(node);
    const id = textOf(fields.get("id"));
    const slides = arrayOf(fields.get("slides"));
    const lessonQuestions = arrayOf(fields.get("questions"));
    if (!id || slides.length === 0 || lessonQuestions.length === 0) {
      ts.forEachChild(node, visit);
      return;
    }

    const nonSummarySlides = slides.filter((slide) => {
      const title = textOf(propertiesOf(slide).get("title"));
      return !title.includes("この講義の要点");
    });
    teachingSlides += nonSummarySlides.length;
    questions += lessonQuestions.length;
    lessons.set(id, {
      file,
      sourceText,
      chapter: textOf(fields.get("chapter")),
      order: numberOf(fields.get("order")),
      teachingSlides: nonSummarySlides.length,
      questions: lessonQuestions.length,
    });

    if (lessonQuestions.length < nonSummarySlides.length) {
      issues.push(
        `${id}: 教えるスライド${nonSummarySlides.length}枚に対して設問が${lessonQuestions.length}問しかありません`,
      );
    }

    nonSummarySlides.forEach((slide) => {
      const slideFields = propertiesOf(slide);
      const title = textOf(slideFields.get("title"));
      const points = slideFields.get("points");
      if (points && ts.isArrayLiteralExpression(points) && points.elements.length > 3) {
        issues.push(`${id}「${title}」: 要点が4個以上あります`);
      }
    });
  }

  visit(sourceFile);
}

const expectedJsOrder = [
  "js-control",
  "js-function",
  "js-scope",
  "js-callback",
  "js-foreach",
  "js-closure",
];
expectedJsOrder.forEach((id, index) => {
  const lesson = lessons.get(id);
  const previous = index > 0 ? lessons.get(expectedJsOrder[index - 1]) : undefined;
  if (!lesson || (previous && Number(lesson.order) <= Number(previous.order))) {
    issues.push(`学習順序: ${expectedJsOrder.join(" → ")} の順になっていません`);
  }
});
if (lessons.get("js-foreach")?.chapter !== "js-callback") {
  issues.push("js-foreach: 関数・コールバックを学ぶ前の章に置かれています");
}

const expectedMinimums = new Map([
  ["js-henasu", 7],
  ["js-function", 8],
  ["ts-annotate", 5],
  ["node-runtime", 5],
]);
for (const [id, minimum] of expectedMinimums) {
  const lesson = lessons.get(id);
  if (!lesson || lesson.teachingSlides < minimum || lesson.questions < minimum) {
    issues.push(`${id}: 初心者向けマイクロチャンクが${minimum}組未満です`);
  }
}

const satisfies = lessons.get("ts-satisfies");
if (!satisfies) {
  issues.push("ts-satisfies: 講義が見つかりません");
} else {
  const section = satisfies.sourceText.slice(
    satisfies.sourceText.indexOf('id: "ts-satisfies"'),
  );
  if (section.includes('palette.red; // "#f00"')) {
    issues.push("ts-satisfies: 通常のオブジェクト値をリテラル型とする誤説明が残っています");
  }
  if (section.includes("satisfies Record<string, string>")) {
    issues.push("ts-satisfies: 未習のRecordを導入設問で要求しています");
  }
}

const slideLayout = fs.readFileSync(
  path.join(COURSE_DIR, "slide-layout.ts"),
  "utf8",
);
if (
  /case "fn-box":\s*return \[/.test(slideLayout) ||
  slideLayout.includes('points.slice(1).join("。")')
) {
  issues.push("会話生成: 一つのページへ関数規則または複数要点を再結合しています");
}
const explicitTalkSection = slideLayout.slice(
  slideLayout.indexOf("function pagesFromExplicitTalk"),
  slideLayout.indexOf("export function talkPages"),
);
if (
  explicitTalkSection.includes("POINT_QUESTIONS") ||
  explicitTalkSection.includes("points.forEach")
) {
  issues.push("会話生成: 詳しい会話の後へ薄い箇条書き会話を自動追加しています");
}

const learningDesign = fs.readFileSync(
  path.join(COURSE_DIR, "learning-design.ts"),
  "utf8",
);
const prequestionSection = learningDesign.slice(
  learningDesign.indexOf("export function prequestionForLesson"),
  learningDesign.indexOf("function orderingQuestionIndex"),
);
if (prequestionSection.includes(".at(-1)")) {
  issues.push("学習前質問: 最初と最後の未習目標を同時に問う構造が残っています");
}
if (
  /worked[\s\S]{0,180}\?\s*question\.answer/.test(learningDesign)
) {
  issues.push("worked問題: 解答全文を入力欄の初期値に入れています");
}

if (issues.length > 0) {
  console.error("教材粒度の監査で問題が見つかりました:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log(
    `${teachingSlides}枚の教えるスライド・${questions}問: 粒度と重点講義の回帰条件を満たしています。`,
  );
}
