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
const VISIBLE_FIELDS = ["prompt", "lead", "starter", "steps", "hint", "sample"];
const EXPECTED_QUESTION_COUNT = 213;

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

function answerRequirements(answer, fileName) {
  const source = ts.createSourceFile(
    fileName,
    answer,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS,
  );
  const names = new Set();
  const values = new Set();

  function visit(node) {
    if (
      (ts.isVariableDeclaration(node) ||
        ts.isParameter(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name)
    ) {
      names.add(node.name.text);
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text) values.add(node.text);
    }
    if (ts.isNumericLiteral(node)) values.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { names, values };
}

function includesTerm(source, term) {
  return source.toLocaleLowerCase().includes(term.toLocaleLowerCase());
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
    const fileName = textOf(fields.get("fileName")) || "script.js";
    const visible = VISIBLE_FIELDS.map((field) => textOf(fields.get(field)))
      .filter(Boolean)
      .join("\n");
    const location = sourceFile.getLineAndCharacterOfPosition(question.pos);
    const label = `${file}:${location.line + 1} (${id})`;

    if (!textOf(fields.get("prompt"))) {
      issues.push(`${label}: prompt がありません`);
    }
    if (kind === "code" && !textOf(fields.get("starter"))) {
      issues.push(`${label}: code問題に starter がありません`);
    }

    if (kind !== "code" || !answer) continue;
    const requirements = answerRequirements(answer, fileName);
    for (const name of requirements.names) {
      if (!includesTerm(visible, name)) {
        issues.push(`${label}: 正解で使う名前「${name}」が指示にもstarterにもありません`);
      }
    }
    for (const value of requirements.values) {
      if (!includesTerm(visible, value)) {
        issues.push(`${label}: 正解で使う値「${value}」が指示にもstarterにもありません`);
      }
    }
  }
}

if (questionCount !== EXPECTED_QUESTION_COUNT) {
  issues.push(`設問数が想定と異なります: ${questionCount}/${EXPECTED_QUESTION_COUNT}`);
}

if (issues.length > 0) {
  console.error("設問の明確さ監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`${questionCount}問: 正解で要求する名前と値は設問内に明記されています。`);
}
