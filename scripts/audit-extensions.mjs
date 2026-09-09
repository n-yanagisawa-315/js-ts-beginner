import fs from "node:fs";
import { languageChallenges } from "../src/lib/course/language-challenges.ts";
import { gradeCodeByBehavior } from "../src/lib/grade-behavior.ts";
import {
  createGitState,
  gradeGitAssertions,
} from "../src/lib/git/git-state.ts";
import { executeGitCommand } from "../src/lib/git/git-command.ts";

const issues = [];
const sqlWorker = fs.readFileSync("src/lib/sql/sql-worker.ts", "utf8");
const sqlRunner = fs.readFileSync("src/lib/sql/sql-runner.ts", "utf8");
for (const marker of ["ATTACH", "load_extension", "SAFE_PRAGMAS", "MAX_ROWS = 500"]) {
  if (!sqlWorker.includes(marker)) issues.push(`SQL Workerの制限 ${marker} がありません`);
}
for (const marker of ["SQL_EXECUTION_TIMEOUT_MS = 2_000", "worker.terminate()"]) {
  if (!sqlRunner.includes(marker)) issues.push(`SQL runnerの復旧条件 ${marker} がありません`);
}
const challengeQuestions = languageChallenges.flatMap((lesson) =>
  lesson.questions.map((question) => ({ lesson, question })),
);

if (languageChallenges.length !== 12 || challengeQuestions.length !== 36) {
  issues.push(
    `チャレンジ数が想定外です: ${languageChallenges.length}講義・${challengeQuestions.length}問`,
  );
}

for (const { lesson, question } of challengeQuestions) {
  if ((question.hints?.length ?? 0) !== 3) {
    issues.push(`${question.id}: 3段階ヒントがありません`);
  }
  if ((question.reviewVariants?.length ?? 0) < 2) {
    issues.push(`${question.id}: 定義済み復習variantが不足しています`);
  }
  if (lesson.track === "ts") {
    if (!question.typeTests?.trim()) issues.push(`${question.id}: 型テストがありません`);
    continue;
  }
  if (!question.behaviorCases?.length) {
    issues.push(`${question.id}: behavior caseがありません`);
    continue;
  }
  if (!(await gradeCodeByBehavior(question, question.answer, lesson.track))) {
    issues.push(`${question.id}: 模範解答がhidden behavior caseを通りません`);
  }
}

let state = createGitState({
  files: { "orders.js": "export const orders = [];" },
  branch: "main",
  remote: "origin",
});
const failed = executeGitCommand(state, "git commit -m empty");
if (failed.exitCode === 0 || failed.state !== state) {
  issues.push("Git失敗コマンドの原子性が守られていません");
}

for (const command of [
  "git add orders.js",
  'git commit -m "注文一覧を追加"',
  "git push origin main",
]) {
  const result = executeGitCommand(state, command);
  if (result.exitCode !== 0) {
    issues.push(`${command}: ${result.error}`);
    break;
  }
  state = result.state;
}
const gitGrade = gradeGitAssertions(state, [
  { kind: "commit-count", count: 1 },
  { kind: "pushed", branch: "main" },
]);
if (!gitGrade.passed) issues.push("Gitのcommit/push最終状態採点に失敗しました");

const unsafeCommand = executeGitCommand(state, "git status; rm -rf .");
if (unsafeCommand.exitCode === 0 || unsafeCommand.state !== state) {
  issues.push("Git模擬ターミナルが危険な連結記号を拒否していません");
}

if (issues.length) {
  console.error("拡張教材監査で問題が見つかりました:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log(
    "36チャレンジのヒント・復習variant・hidden caseと、Git原子性・commit/push採点を確認しました。",
  );
}
