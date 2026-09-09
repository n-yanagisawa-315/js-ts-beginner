import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const COURSE_FILE = path.join(ROOT, "src/lib/course/js-dom.ts");
const issues = [];

if (!fs.existsSync(COURSE_FILE)) {
  console.error("DOM教材監査: src/lib/course/js-dom.ts がありません。");
  process.exit(1);
}

const sourceText = fs.readFileSync(COURSE_FILE, "utf8");
const sourceFile = ts.createSourceFile(
  COURSE_FILE,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

function nameOf(node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : "";
}

function textOf(node) {
  return node &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : "";
}

function fieldsOf(node) {
  return new Map(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [nameOf(property.name), property.initializer]),
  );
}

function objectsOf(node) {
  return node && ts.isArrayLiteralExpression(node)
    ? node.elements.filter(ts.isObjectLiteralExpression)
    : [];
}

const lessons = [];
function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const fields = fieldsOf(node);
    const slides = objectsOf(fields.get("slides"));
    const questions = objectsOf(fields.get("questions"));
    if (textOf(fields.get("chapter")) === "js-dom" && slides.length > 0) {
      lessons.push({ fields, slides, questions });
      return;
    }
  }
  ts.forEachChild(node, visit);
}
visit(sourceFile);

if (lessons.length !== 8) issues.push(`DOM講義数: ${lessons.length}/8`);

let slideCount = 0;
let questionCount = 0;
let runtimeQuestionCount = 0;
for (const lesson of lessons) {
  const id = textOf(lesson.fields.get("id")) || "unknown";
  slideCount += lesson.slides.length;
  questionCount += lesson.questions.length;
  if (lesson.slides.length !== 5) {
    issues.push(`${id}: スライド数 ${lesson.slides.length}/5`);
  }
  if (lesson.questions.length !== 4) {
    issues.push(`${id}: 問題数 ${lesson.questions.length}/4`);
  }
  let lessonRuntimeQuestions = 0;
  for (const question of lesson.questions) {
    const fields = fieldsOf(question);
    const kind = textOf(fields.get("kind"));
    const runtime = textOf(fields.get("runtime"));
    const answer = textOf(fields.get("answer"));
    if (/\.innerHTML\b/.test(answer)) {
      issues.push(`${id}: innerHTMLではなくcreateElement/textContentを使ってください`);
    }
    if (kind === "code" && runtime === "dom") {
      runtimeQuestionCount += 1;
      lessonRuntimeQuestions += 1;
      if (!textOf(fields.get("fixtureHtml"))) {
        issues.push(`${id}: DOM問題にfixtureHtmlがありません`);
      }
      if (!textOf(fields.get("domProbe"))) {
        issues.push(`${id}: DOM問題にdomProbeがありません`);
      }
    }
  }
  if (lessonRuntimeQuestions < 2) {
    issues.push(`${id}: DOM振る舞い問題が2問未満です`);
  }
}

if (slideCount !== 40) issues.push(`DOMスライド数: ${slideCount}/40`);
if (questionCount !== 32) issues.push(`DOM問題数: ${questionCount}/32`);

const runner = fs.readFileSync(path.join(ROOT, "src/lib/run-dom.ts"), "utf8");
for (const required of [
  'sandbox", "allow-scripts"',
  "Content-Security-Policy",
  "event.source !== iframe.contentWindow",
  "fakeLocalStorage",
  "fakeFetch",
]) {
  if (!runner.includes(required)) issues.push(`DOM実行器の隔離条件不足: ${required}`);
}

const design = fs.readFileSync(
  path.join(ROOT, "src/lib/course/learning-design.ts"),
  "utf8",
);
if (!design.includes('ProjectRole')) issues.push("設問のprojectRole分類がありません");
if (design.includes('で「${slide?.title ?? lesson.title}」を使う場面')) {
  issues.push("全問へ注文場面を装う旧シナリオが残っています");
}

if (issues.length > 0) {
  console.error("DOM教材監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `DOM 8講義・${slideCount}スライド・${questionCount}問（振る舞い採点${runtimeQuestionCount}問）とsandbox隔離を確認しました。`,
  );
}
