import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COURSE_DIR = path.join(ROOT, "src/lib/course");
const COURSE_FILES = [
  "js-start.ts",
  "js-basic.ts",
  "js-callback.ts",
  "js-middle.ts",
  "js-modern.ts",
  "js-advanced.ts",
  "js-npm.ts",
  "ts-lessons.ts",
  "ts-modern.ts",
  "node-start.ts",
  "node-core.ts",
];

const requiredFiles = [
  "MISSION.md",
  "RESOURCES.md",
  "NOTES.md",
  "learning-records/README.md",
  "reference/javascript-core.html",
  "reference/typescript-core.html",
  "reference/node-core.html",
  "assets/reference.css",
  "src/app/review/page.tsx",
  "src/app/reference/[topic]/route.ts",
  "src/components/review-session.tsx",
  "src/components/confidence-scale.tsx",
  "src/lib/grade-behavior.ts",
  "src/lib/review-queue.ts",
  "src/lib/course/learning-design.ts",
  "src/lib/course/sources.ts",
  "EVIDENCE.md",
];

const issues = [];
const propertyName = (node) =>
  ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : "";
const propertiesOf = (object) =>
  new Map(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [propertyName(property.name), property.initializer]),
  );
const textOf = (node) =>
  node &&
  (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : "";

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, file))) issues.push(`${file} がありません`);
}

let choiceCount = 0;
let maxChoiceRange = 0;
let lessonCount = 0;
let slideCount = 0;
let questionCount = 0;
for (const file of COURSE_FILES) {
  const fullPath = path.join(COURSE_DIR, file);
  const sourceFile = ts.createSourceFile(
    fullPath,
    fs.readFileSync(fullPath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = propertiesOf(node);
      if (fields.has("id") && fields.has("slides") && fields.has("questions")) {
        lessonCount += 1;
      }
    }
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "slides" &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) continue;
        slideCount += 1;
        const fields = propertiesOf(element);
        for (const field of ["title", "lead", "diagram"]) {
          if (!fields.has(field)) {
            const location = sourceFile.getLineAndCharacterOfPosition(element.pos);
            issues.push(`${file}:${location.line + 1}: スライドに${field}がありません`);
          }
        }
      }
    }
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "questions" &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      const ids = new Set();
      for (const element of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) continue;
        const fields = propertiesOf(element);
        questionCount += 1;
        const id = textOf(fields.get("id"));
        if (!id || ids.has(id)) {
          const location = sourceFile.getLineAndCharacterOfPosition(element.pos);
          issues.push(`${file}:${location.line + 1}: 問題IDが空か重複しています`);
        }
        ids.add(id);
        if (textOf(fields.get("kind")) !== "choice") continue;
        choiceCount += 1;
        const options = fields.get("options");
        if (!options || !ts.isArrayLiteralExpression(options)) {
          issues.push(`${file}: choice問題にoptionsがありません`);
          continue;
        }
        const lengths = options.elements.map((option) => textOf(option).length);
        const range = Math.max(...lengths) - Math.min(...lengths);
        maxChoiceRange = Math.max(maxChoiceRange, range);
        if (range > 5) {
          const location = sourceFile.getLineAndCharacterOfPosition(element.pos);
          issues.push(`${file}:${location.line + 1}: 選択肢の文字数差が${range}です`);
        }
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

const mission = fs.readFileSync(path.join(ROOT, "MISSION.md"), "utf8");
for (const heading of ["## Why", "## Success looks like", "## Constraints", "## Out of scope"]) {
  if (!mission.includes(heading)) issues.push(`MISSION.md に ${heading} がありません`);
}

const resources = fs.readFileSync(path.join(ROOT, "RESOURCES.md"), "utf8");
if (!resources.includes("## Knowledge")) issues.push("RESOURCES.md にKnowledgeがありません");
if (!resources.includes("## Wisdom")) issues.push("RESOURCES.md にWisdomがありません");
if (!resources.includes("Learning design evidence")) {
  issues.push("RESOURCES.md から根拠台帳を参照できません");
}

const evidence = fs.readFileSync(path.join(ROOT, "EVIDENCE.md"), "utf8");
for (const claim of [
  "検索練習",
  "分散学習",
  "Worked example",
  "自己説明",
  "物語、図解、チャンク化",
  "採用しない主張",
]) {
  if (!evidence.includes(claim)) issues.push(`EVIDENCE.md に ${claim} がありません`);
}

const progress = fs.readFileSync(path.join(ROOT, "src/lib/progress.ts"), "utf8");
for (const field of [
  "attempts",
  "incorrectAttempts",
  "firstTryCorrect",
  "hintUsed",
  "answerViewed",
  "lastAttemptAt",
  "nextReviewAt",
  "attemptHistory",
  "confidence",
  "variantId",
  "masteryStage",
  "retainedAt",
  "transferredAt",
  "lessonEvents",
  "concepts",
]) {
  if (!progress.includes(field)) issues.push(`学習状態に ${field} がありません`);
}

const lessonStudio = fs.readFileSync(
  path.join(ROOT, "src/components/lesson-studio.tsx"),
  "utf8",
);
const reviewSession = fs.readFileSync(
  path.join(ROOT, "src/components/review-session.tsx"),
  "utf8",
);
if (!lessonStudio.includes("gradeCodeByBehavior")) {
  issues.push("通常演習が振る舞い採点へ接続されていません");
}
if (!reviewSession.includes("gradeCodeByBehavior")) {
  issues.push("復習演習が振る舞い採点へ接続されていません");
}
for (const marker of ["predict", 'mode="exit"', "ConfidenceScale"]) {
  if (!lessonStudio.includes(marker)) {
    issues.push(`学習フローに ${marker} がありません`);
  }
}
const quizChallenge = fs.readFileSync(
  path.join(ROOT, "src/components/quiz-challenge.tsx"),
  "utf8",
);
const codeLab = fs.readFileSync(
  path.join(ROOT, "src/components/code-lab.tsx"),
  "utf8",
);
if (
  !quizChallenge.includes("あとで解き直す") ||
  !codeLab.includes("あとで解き直す")
) {
  issues.push("誤答後に正解を強制せず形成的評価として進めません");
}

const learningDesign = fs.readFileSync(
  path.join(ROOT, "src/lib/course/learning-design.ts"),
  "utf8",
);
for (const marker of [
  "storyBeat",
  "storyContextForSlide",
  "前の講義で",
  "objectiveId",
  "conceptIds",
  "scaffoldLevel",
  '"faded"',
  '"independent"',
  "lastByChapter",
  "lastByTrack",
  'transferLevel: far ? "far" : "near"',
  "asOrderingQuestion",
  "fadedStarter",
  "diagnoseOption",
  "transferQuestion",
]) {
  if (!learningDesign.includes(marker)) {
    issues.push(`教材再構成に ${marker} がありません`);
  }
}

const learningDesignAst = ts.createSourceFile(
  "learning-design.ts",
  learningDesign,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
let capstoneCount = 0;
const inspectCapstones = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === "TRACK_CAPSTONE_CODE" &&
    node.initializer &&
    ts.isObjectLiteralExpression(node.initializer)
  ) {
    for (const property of node.initializer.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const text = textOf(property.initializer);
      const lines = text.split("\n").length;
      capstoneCount += 1;
      if (lines < 50 || lines > 100) {
        issues.push(`トラック末転移コードが50〜100行ではありません: ${lines}行`);
      }
    }
  }
  ts.forEachChild(node, inspectCapstones);
};
inspectCapstones(learningDesignAst);
if (capstoneCount !== 3) issues.push(`トラック末転移課題が${capstoneCount}/3件です`);

const slideBoard = fs.readFileSync(
  path.join(ROOT, "src/components/slide-board.tsx"),
  "utf8",
);
const diagram = fs.readFileSync(
  path.join(ROOT, "src/components/diagram.tsx"),
  "utf8",
);
const slideLayout = fs.readFileSync(
  path.join(ROOT, "src/lib/course/slide-layout.ts"),
  "utf8",
);
if (
  !slideBoard.includes("story-ribbon") ||
  !slideBoard.includes("activeCodeLines={page?.activeCodeLines}") ||
  !slideLayout.includes("synchronizeConversationPages") ||
  !slideLayout.includes("maxScore")
) {
  issues.push("物語と会話位置を図解へ同期できていません");
}
if (!diagram.includes("diagram-code-line") || !diagram.includes("is-active")) {
  issues.push("図解が該当コード行を強調できていません");
}

if (!codeLab.includes('question.scaffoldLevel === "independent"')) {
  issues.push("独力問題で手順を外していません");
}
if (
  !quizChallenge.includes('question.kind === "order"') ||
  !quizChallenge.includes("selectedFragmentIndexes")
) {
  issues.push("行並べ替えが実際の操作として実装されていません");
}
if (
  !lessonStudio.includes("recordSelfExplanation") ||
  !codeLab.includes("SelfExplanation") ||
  !quizChallenge.includes("SelfExplanation") ||
  !progress.includes("selfExplanations")
) {
  issues.push("誤答後の自己説明が記録されません");
}
const reviewQueue = fs.readFileSync(
  path.join(ROOT, "src/lib/review-queue.ts"),
  "utf8",
);
for (const marker of [
  "replacementFor",
  'kind: "identifier"',
  "context-review",
  "misconceptionByAnswer",
]) {
  if (!reviewQueue.includes(marker) && !learningDesign.includes(marker)) {
    issues.push(`復習変種または誤概念診断に ${marker} がありません`);
  }
}

const sourceModule = fs.readFileSync(
  path.join(ROOT, "src/lib/course/sources.ts"),
  "utf8",
);
const officialLinkCount = sourceModule.match(/https:\/\//g)?.length ?? 0;
if (officialLinkCount < 15) {
  issues.push(`スライド用の公式資料が不足しています: ${officialLinkCount}`);
}

for (const file of [
  "reference/javascript-core.html",
  "reference/typescript-core.html",
  "reference/node-core.html",
]) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  if (!html.includes("../assets/reference.css")) {
    issues.push(`${file} が共通CSSを使用していません`);
  }
  if ((html.match(/https:\/\//g)?.length ?? 0) < 1) {
    issues.push(`${file} に公式資料へのリンクがありません`);
  }
}

if (choiceCount !== 66) {
  issues.push(`選択問題数が想定外です: ${choiceCount}/66`);
}
if (lessonCount !== 49) issues.push(`講義数が想定外です: ${lessonCount}/49`);
if (slideCount !== 262) issues.push(`スライド数が想定外です: ${slideCount}/262`);
if (questionCount !== 213) issues.push(`問題数が想定外です: ${questionCount}/213`);

if (issues.length > 0) {
  console.error("学習品質監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `学習品質監査に成功しました。${lessonCount}講義・${slideCount}スライド・${questionCount}問について、物語と目標、段階的足場除去、自己説明、章末累積、50〜100行の転移課題、同期図解、V3履歴、根拠台帳を確認しました。選択問題${choiceCount}問の最大文字数差は${maxChoiceRange}です。`,
  );
}
