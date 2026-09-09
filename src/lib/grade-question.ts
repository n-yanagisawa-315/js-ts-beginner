import type { Question, Track } from "@/lib/course/types";
import { grade } from "@/lib/grade";
import type { DomRunResult } from "@/lib/run-dom";
import type { StudentRunResult } from "@/lib/run-js";
import type { SqlRow, SqlRunResult } from "@/lib/sql/sql-runner";

export type QuestionGradeResult = {
  passed: boolean;
  feedback: string;
  diagnostics: string[];
};

export type RuntimeEvidence =
  | {
      runtime: "dom";
      source: string;
      result: DomRunResult;
    }
  | {
      runtime: "js";
      source: string;
      result: StudentRunResult;
    }
  | {
      runtime: "sql";
      source: string;
      result: SqlRunResult;
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
  evidence?: RuntimeEvidence,
): Promise<QuestionGradeResult> {
  try {
    const { runSqlQuestion, sqlQuestionSource } =
      await import("@/lib/sql/sql-runner");
    const result =
      evidence?.runtime === "sql" && evidence.source === source
        ? evidence.result
        : await runSqlQuestion(question, sqlQuestionSource(question, source));
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

async function gradeGit(
  question: Question,
  source: string,
): Promise<QuestionGradeResult> {
  const [{ executeGitCommand }, { createGitState, gradeGitAssertions }] =
    await Promise.all([
      import("@/lib/git/git-command"),
      import("@/lib/git/git-state"),
    ]);
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
  evidence?: RuntimeEvidence,
): Promise<QuestionGradeResult> {
  if (question.kind === "sql") return gradeSql(question, response, evidence);
  if (question.kind === "git") return gradeGit(question, response);
  const passed =
    question.kind === "code"
      ? await import("@/lib/grade-behavior").then((module) =>
          module.gradeCodeByBehavior(question, response, track, evidence),
        )
      : grade(question, response);
  return {
    passed,
    feedback: passed ? question.explain : "もう一度、条件と実行結果を確認してください。",
    diagnostics: [],
  };
}
