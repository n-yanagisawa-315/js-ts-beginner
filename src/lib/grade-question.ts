import type { Question, Track } from "@/lib/course/types";
import { grade } from "@/lib/grade";
import { gradeCodeByBehavior } from "@/lib/grade-behavior";
import { executeGitCommand } from "@/lib/git/git-command";
import {
  createGitState,
  gradeGitAssertions,
} from "@/lib/git/git-state";
import { runSqlQuestion, type SqlRow } from "@/lib/sql/sql-runner";

export type QuestionGradeResult = {
  passed: boolean;
  feedback: string;
  diagnostics: string[];
};

function comparableRows(rows: SqlRow[]) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "bigint" ? Number(value) : value,
      ]),
    ),
  );
}

function sameRows(actual: SqlRow[], expected: NonNullable<Question["sqlExpectedRows"]>) {
  return JSON.stringify(comparableRows(actual)) === JSON.stringify(expected);
}

async function gradeSql(
  question: Question,
  source: string,
): Promise<QuestionGradeResult> {
  try {
    const statement = question.sqlExpectedTable
      ? `${source.replace(/;?\s*$/, ";")}\nSELECT * FROM ${question.sqlExpectedTable} ORDER BY rowid;`
      : source;
    const result = await runSqlQuestion(question, statement);
    const passed = question.sqlExpectedRows
      ? sameRows(result.rows, question.sqlExpectedRows)
      : true;
    return {
      passed,
      feedback: passed
        ? question.explain
        : "SQLは実行できましたが、返された行・列・順番が期待結果と異なります。",
      diagnostics: passed
        ? []
        : [`実際の結果: ${JSON.stringify(comparableRows(result.rows))}`],
    };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return {
      passed: false,
      feedback: "SQLを実行できませんでした。構文と対象の表・列を確認してください。",
      diagnostics: [message],
    };
  }
}

function gradeGit(question: Question, source: string): QuestionGradeResult {
  let state = createGitState(question.gitInitialState);
  const diagnostics: string[] = [];
  for (const command of source.split("\n").map((line) => line.trim()).filter(Boolean)) {
    const result = executeGitCommand(state, command);
    if (result.exitCode !== 0) {
      diagnostics.push(`${command}: ${result.error ?? result.output.join(" ")}`);
    }
    state = result.state;
  }
  const gradeResult = gradeGitAssertions(state, question.gitAssertions ?? []);
  const missing = gradeResult.results
    .filter((result) => !result.passed)
    .map((result) => result.message);
  return {
    passed: gradeResult.passed,
    feedback: gradeResult.passed
      ? question.explain
      : "コマンドは実行できましたが、リポジトリの最終状態が課題の条件を満たしていません。",
    diagnostics: [...diagnostics, ...missing],
  };
}

export async function gradeQuestion(
  question: Question,
  response: string,
  track: Track,
): Promise<QuestionGradeResult> {
  if (question.kind === "sql") return gradeSql(question, response);
  if (question.kind === "git") return gradeGit(question, response);
  const passed =
    question.kind === "code"
      ? await gradeCodeByBehavior(question, response, track)
      : grade(question, response);
  return {
    passed,
    feedback: passed ? question.explain : "もう一度、条件と実行結果を確認してください。",
    diagnostics: [],
  };
}
