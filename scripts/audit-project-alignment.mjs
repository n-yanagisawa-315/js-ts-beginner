import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { COURSE_FILES, EXPECTED_TOTALS } from "./course-manifest.mjs";

const ROOT = process.cwd();
const COURSE_DIR = path.join(ROOT, "src/lib/course");
const PROJECT_TERMS =
  /(注文|受注|order|customer|paid|unpaid|支払|顧客|商品|price|quantity|status|在庫|金額|合計|API|HTTP)/i;
const issues = [];
let lessonCount = 0;
let buildCount = 0;

function nameOf(node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : "";
}

function textOf(node) {
  return node &&
    (ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node))
    ? node.getText().replace(/^['"`]|['"`]$/g, "")
    : "";
}

function fieldsOf(node) {
  return new Map(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [nameOf(property.name), property.initializer]),
  );
}

for (const file of COURSE_FILES) {
  const fullPath = path.join(COURSE_DIR, file);
  if (!fs.existsSync(fullPath)) {
    issues.push(`${file}: ファイルがありません`);
    continue;
  }
  const sourceText = fs.readFileSync(fullPath, "utf8");
  const sourceFile = ts.createSourceFile(
    fullPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (file === "language-challenges.ts") {
    const challengeCount = sourceText.match(/challengeQuestion\(\{/g)?.length ?? 0;
    lessonCount += 12;
    buildCount += challengeCount;
    if (challengeCount !== 36 || !PROJECT_TERMS.test(sourceText)) {
      issues.push(`${file}: 注文題材のチャレンジ36問を確認できません`);
    }
    continue;
  }
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = fieldsOf(node);
      const questionsNode = fields.get("questions");
      const slidesNode = fields.get("slides");
      if (
        questionsNode &&
        slidesNode &&
        ts.isArrayLiteralExpression(questionsNode) &&
        ts.isArrayLiteralExpression(slidesNode)
      ) {
        lessonCount += 1;
        const lessonId = textOf(fields.get("id")) || `${file}:${lessonCount}`;
        const buildQuestions = questionsNode.elements
          .filter(ts.isObjectLiteralExpression)
          .filter((question) => {
            const questionFields = fieldsOf(question);
            return (
              textOf(questionFields.get("projectRole")) === "build" ||
              ["dom", "sql", "git"].includes(textOf(questionFields.get("runtime"))) ||
              ["sql", "git"].includes(textOf(questionFields.get("kind")))
            );
          });
        if (buildQuestions.length === 0) {
          issues.push(`${lessonId}: 注文プロジェクトを進める設問がありません`);
        }
        for (const question of buildQuestions) {
          buildCount += 1;
          const questionFields = fieldsOf(question);
          const actualTask = [
            "prompt",
            "lead",
            "code",
            "starter",
            "answer",
            "sample",
            "fixtureHtml",
          ]
            .map((key) => textOf(questionFields.get(key)))
            .join("\n");
          if (!PROJECT_TERMS.test(actualTask)) {
            issues.push(
              `${lessonId}/${textOf(questionFields.get("id"))}: ラベルだけで実際の課題が注文データを扱っていません`,
            );
          }
        }
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

if (lessonCount !== EXPECTED_TOTALS.lessons) issues.push(`講義数: ${lessonCount}/${EXPECTED_TOTALS.lessons}`);

if (issues.length > 0) {
  console.error("プロジェクト接続監査で問題が見つかりました:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `${lessonCount}講義すべてに、注文データを実際に扱うプロジェクト設問${buildCount}問があることを確認しました。`,
  );
}
