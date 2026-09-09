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
const TEXT_FIELDS = ["prompt", "lead", "steps", "hint"];
const EXPECTED_QUESTION_COUNT = 252;

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
  if (!node) return "";
  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.text;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(textOf).filter(Boolean).join("\n");
  }
  return "";
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[「」"'`;]/g, "")
    .replace(/\s+/g, "");
}

function containsAnswer(text, answer) {
  const wanted = answer.trim().toLowerCase().replace(/\s+/g, " ");
  const source = text.toLowerCase().replace(/\s+/g, " ");
  if (!wanted) return false;
  if (/^-?\d+$/.test(wanted)) {
    return new RegExp(
      `(?<![\\p{L}\\p{N}])${wanted.replace("-", "\\-")}(?![\\p{L}\\p{N}])`,
      "u",
    ).test(source);
  }
  return source.includes(wanted);
}

function answerLines(answer) {
  return answer
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .split("\n")
    .map(normalize)
    .filter((line) => line.length >= 8 && !/^[{}(),]+$/.test(line));
}

function collectQuestions(sourceFile) {
  const questions = [];

  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "questions" &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (ts.isObjectLiteralExpression(element)) questions.push(element);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return questions;
}

const issues = [];
let questionCount = 0;

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

  for (const question of collectQuestions(sourceFile)) {
    questionCount += 1;
    const fields = propertiesOf(question);
    const id = textOf(fields.get("id")) || `question-${questionCount}`;
    const kind = textOf(fields.get("kind"));
    const answer = textOf(fields.get("answer"));
    const visible = TEXT_FIELDS.map((field) => textOf(fields.get(field)))
      .filter(Boolean)
      .join("\n");
    const location = sourceFile.getLineAndCharacterOfPosition(question.pos);
    const label = `${file}:${location.line + 1} (${id})`;

    if (kind === "shell" && containsAnswer(visible, answer)) {
      issues.push(`${label}: シェルの正解コマンドが問題文領域にあります`);
    }

    if (
      (kind === "choice" || kind === "input") &&
      containsAnswer(visible, answer)
    ) {
      issues.push(`${label}: 正答の語句が問題文領域にあります`);
    }

    if (kind === "code") {
      const compactVisible = normalize(visible);
      for (const line of answerLines(answer)) {
        if (compactVisible.includes(line)) {
          issues.push(`${label}: 完成コードの一部が問題文領域にあります`);
          break;
        }
      }
    }
  }
}

const codeLab = fs.readFileSync(
  path.join(ROOT, "src/components/code-lab.tsx"),
  "utf8",
);
if (/file-chip[\s\S]{0,240}question\.answer/.test(codeLab)) {
  issues.push(
    "src/components/code-lab.tsx: シェルの正解を手順チップへ表示しています",
  );
}

if (questionCount !== EXPECTED_QUESTION_COUNT) {
  issues.push(
    `設問数が想定と異なります: ${questionCount}/${EXPECTED_QUESTION_COUNT}`,
  );
}

if (issues.length > 0) {
  console.error("設問の答え漏洩監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`設問 ${questionCount} 問: 答え漏洩は見つかりませんでした。`);
}
