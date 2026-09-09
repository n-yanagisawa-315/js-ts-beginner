import type { Question } from "@/lib/course/types";

export const SQL_MAX_ROWS = 500;
export const SQL_EXECUTION_TIMEOUT_MS = 2_000;

export type SqlCell =
  | string
  | number
  | null
  | bigint
  | Uint8Array
  | Int8Array
  | ArrayBuffer;

export type SqlRow = Record<string, SqlCell>;

export type SqlRunResult = {
  columns: string[];
  rows: SqlRow[];
  truncated: boolean;
};

export type SqlRunRequest = {
  source: string;
  schema?: string;
  seed?: string;
};

type WorkerResult = SqlRunResult & {
  type: "result";
  id: string;
};

type WorkerFailure = {
  type: "error";
  id: string;
  error: {
    name: string;
    message: string;
  };
};

type WorkerResponse = WorkerResult | WorkerFailure;

export class SqlExecutionError extends Error {
  readonly code: "execution" | "timeout" | "worker";

  constructor(
    message: string,
    code: "execution" | "timeout" | "worker" = "execution",
  ) {
    super(message);
    this.name = "SqlExecutionError";
    this.code = code;
  }
}

export function runSql(
  request: SqlRunRequest,
  options: { signal?: AbortSignal } = {},
): Promise<SqlRunResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.reject(
      new SqlExecutionError(
        "SQL実行環境はブラウザ内でのみ利用できます。",
        "worker",
      ),
    );
  }

  if (options.signal?.aborted) {
    return Promise.reject(new DOMException("SQL実行を中止しました。", "AbortError"));
  }

  const worker = new Worker(new URL("./sql-worker.ts", import.meta.url), {
    type: "module",
    name: "sql-exercise",
  });
  const id = crypto.randomUUID();

  return new Promise<SqlRunResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      worker.terminate();
      window.clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", handleAbort);
    };

    const finish = (
      complete: (value: SqlRunResult) => void,
      value: SqlRunResult,
    ) => {
      if (settled) return;
      settled = true;
      cleanup();
      complete(value);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const handleAbort = () => {
      fail(new DOMException("SQL実行を中止しました。", "AbortError"));
    };

    const timeoutId = window.setTimeout(() => {
      fail(
        new SqlExecutionError(
          "SQLの実行が2秒を超えたため停止しました。",
          "timeout",
        ),
      );
    }, SQL_EXECUTION_TIMEOUT_MS);

    options.signal?.addEventListener("abort", handleAbort, { once: true });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      if (!response || response.id !== id) return;

      if (response.type === "error") {
        fail(new SqlExecutionError(response.error.message));
        return;
      }

      finish(resolve, {
        columns: response.columns,
        rows: response.rows,
        truncated: response.truncated,
      });
    };

    worker.onerror = (event) => {
      event.preventDefault();
      fail(
        new SqlExecutionError(
          event.message || "SQL Workerで予期しないエラーが発生しました。",
          "worker",
        ),
      );
    };

    worker.onmessageerror = () => {
      fail(
        new SqlExecutionError(
          "SQL Workerからの結果を読み取れませんでした。",
          "worker",
        ),
      );
    };

    worker.postMessage({
      type: "execute",
      id,
      schema: request.schema ?? "",
      seed: request.seed ?? "",
      source: request.source,
    });
  });
}

export function sqlQuestionSource(
  question: Pick<Question, "sqlExpectedTable">,
  source: string,
) {
  if (!question.sqlExpectedTable) return source;
  const table = question.sqlExpectedTable.replaceAll('"', '""');
  return `${source.trim().replace(/;*$/, ";")}\nSELECT * FROM "${table}" ORDER BY rowid;`;
}

export function runSqlQuestion(
  question: Pick<Question, "sqlSchema" | "sqlSeed">,
  source: string,
  options?: { signal?: AbortSignal },
) {
  return runSql(
    {
      source,
      schema: question.sqlSchema,
      seed: question.sqlSeed,
    },
    options,
  );
}
