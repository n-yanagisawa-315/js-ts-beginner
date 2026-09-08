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
    return node.text.trim();
  }
  return "";
}

function collectSlides(sourceFile) {
  const slides = [];
  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "slides" &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (ts.isObjectLiteralExpression(element)) slides.push(element);
      }
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return slides;
}

const issues = [];
const beginnerLines = new Map();
let slideCount = 0;
let talkLineCount = 0;

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

  for (const slide of collectSlides(sourceFile)) {
    slideCount += 1;
    const fields = propertiesOf(slide);
    const title = textOf(fields.get("title")) || `slide-${slideCount}`;
    const lead = textOf(fields.get("lead"));
    const pointsNode = fields.get("points");
    const sourceTexts = new Set([lead]);
    if (pointsNode && ts.isArrayLiteralExpression(pointsNode)) {
      for (const point of pointsNode.elements) sourceTexts.add(textOf(point));
    }

    const talk = fields.get("talk");
    const location = sourceFile.getLineAndCharacterOfPosition(slide.pos);
    const label = `${file}:${location.line + 1} (${title})`;
    if (!talk || !ts.isArrayLiteralExpression(talk)) {
      issues.push(`${label}: talk がありません`);
      continue;
    }

    const lines = talk.elements.filter(ts.isObjectLiteralExpression);
    talkLineCount += lines.length;
    if (lines.length < 4) {
      issues.push(`${label}: 会話が4発言未満です`);
    }

    let previousSpeaker;
    lines.forEach((line, index) => {
      const lineFields = propertiesOf(line);
      const speaker = textOf(lineFields.get("speaker"));
      const text = textOf(lineFields.get("text"));

      if (index === 0 && speaker !== "beginner") {
        issues.push(`${label}: 会話が初心者から始まっていません`);
      }
      if (speaker === previousSpeaker) {
        issues.push(`${label}: 同じ話者が連続しています`);
      }
      previousSpeaker = speaker;

      if (!text) {
        issues.push(`${label}: 空の発言があります`);
      } else if (sourceTexts.has(text)) {
        issues.push(`${label}: 既存のlead/pointをそのまま転載しています`);
      }

      if (speaker === "beginner" && text) {
        beginnerLines.set(text, (beginnerLines.get(text) ?? 0) + 1);
      }
    });
  }
}

for (const [line, count] of beginnerLines) {
  if (count >= 4) {
    issues.push(`初心者の同一発言が${count}回あります: ${line}`);
  }
}

if (issues.length > 0) {
  console.error("会話監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `${slideCount}スライド・${talkLineCount}発言: 自然な会話の基本条件を満たしています。`,
  );
}
