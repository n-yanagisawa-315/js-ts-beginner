function lineFromCause(cause: unknown): number | undefined {
  if (cause && typeof cause === "object" && "lineNumber" in cause) {
    const line = Number((cause as { lineNumber?: number }).lineNumber);
    if (Number.isFinite(line) && line > 0) return line;
  }
  if (cause instanceof Error && cause.stack) {
    const match = cause.stack.match(/<anonymous>:(\d+):\d+/);
    if (match) return Number(match[1]);
  }
  return undefined;
}

export type StudentRunResult = {
  logs: string[];
  error?: string;
  line?: number;
};

export const JS_RUN_TIMEOUT_MS = 1500;
export const JS_RUN_MAX_LOGS = 200;

export const JS_RUN_TIMEOUT_MESSAGE =
  "実行がタイムアウトしました。while や for の中で、条件に使う値を変える処理（例: i++）があるか確認してください。";

export const JS_RUN_LOG_LIMIT_MESSAGE =
  "表示が多すぎて停止しました。while や for が終わらない書き方になっていないか確認してください。";

export async function runStudentJs(source: string): Promise<StudentRunResult> {
  if (typeof window !== "undefined" && typeof Worker !== "undefined") {
    return runStudentJsInWorker(source);
  }
  return runStudentJsInNodeWorker(source);
}

async function runStudentJsInNodeWorker(
  source: string,
): Promise<StudentRunResult> {
  const { Worker } = await import("node:worker_threads");
  const requestId = crypto.randomUUID();
  const worker = new Worker(
    `
const { parentPort } = require("node:worker_threads");
parentPort.on("message", async (event) => {
  const logs = [];
  const format = (value) => {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    try { return JSON.stringify(value); } catch { return String(value); }
  };
  const fakeConsole = {
    log: (...values) => {
      if (logs.length >= ${JS_RUN_MAX_LOGS}) {
        throw new Error(${JSON.stringify(JS_RUN_LOG_LIMIT_MESSAGE)});
      }
      logs.push(values.map(format).join(" "));
    },
    error: (...values) => {
      if (logs.length >= ${JS_RUN_MAX_LOGS}) {
        throw new Error(${JSON.stringify(JS_RUN_LOG_LIMIT_MESSAGE)});
      }
      logs.push(values.map(format).join(" "));
    },
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let error;
  let line;
  try {
    await new AsyncFunction("console", '"use strict";\\n' + event.source)(fakeConsole);
    await new Promise((resolve) => setTimeout(resolve, 80));
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
    const match = cause && cause.stack && cause.stack.match(/<anonymous>:(\\d+):\\d+/);
    if (match) line = Math.max(1, Number(match[1]) - 2);
  }
  parentPort.postMessage({
    type: ${JSON.stringify("js-ts-beginner-js-result")},
    requestId: event.requestId,
    logs,
    error,
    line,
  });
});
`,
    { eval: true },
  );

  return new Promise((resolve) => {
    let settled = false;
    function finish(result: StudentRunResult) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      void worker.terminate();
      resolve(result);
    }
    const timeout = setTimeout(() => {
      finish({ logs: [], error: JS_RUN_TIMEOUT_MESSAGE });
    }, JS_RUN_TIMEOUT_MS);
    worker.on("message", (data: {
      type?: string;
      requestId?: string;
      logs?: unknown[];
      error?: unknown;
      line?: unknown;
    }) => {
      if (data.type !== "js-ts-beginner-js-result" || data.requestId !== requestId) {
        return;
      }
      finish({
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        error: typeof data.error === "string" ? data.error : undefined,
        line: typeof data.line === "number" ? data.line : undefined,
      });
    });
    worker.on("error", () => {
      finish({
        logs: [],
        error: "コードの実行環境を準備できませんでした。",
      });
    });
    worker.postMessage({ requestId, source });
  });
}

const JS_RESULT_MESSAGE = "js-ts-beginner-js-result";

function safeScriptValue(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function workerBootstrapSource(): string {
  return `self.onmessage = async (event) => {
  const requestId = event.data.requestId;
  const source = event.data.source;
  const logs = [];
  const format = (value) => {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    try { return JSON.stringify(value); } catch { return String(value); }
  };
  const fakeConsole = {
    log: (...values) => {
      if (logs.length >= ${JS_RUN_MAX_LOGS}) {
        throw new Error(${safeScriptValue(JS_RUN_LOG_LIMIT_MESSAGE)});
      }
      logs.push(values.map(format).join(" "));
    },
    error: (...values) => {
      if (logs.length >= ${JS_RUN_MAX_LOGS}) {
        throw new Error(${safeScriptValue(JS_RUN_LOG_LIMIT_MESSAGE)});
      }
      logs.push(values.map(format).join(" "));
    },
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let error;
  let line;
  try {
    await new AsyncFunction("console", '"use strict";\\n' + source)(fakeConsole);
    await new Promise((resolve) => setTimeout(resolve, 80));
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
    const match = cause && cause.stack && cause.stack.match(/<anonymous>:(\\d+):\\d+/);
    if (match) line = Math.max(1, Number(match[1]) - 2);
  }
  self.postMessage({
    type: ${safeScriptValue(JS_RESULT_MESSAGE)},
    requestId,
    logs,
    error,
    line,
  });
};`;
}

function runStudentJsInWorker(source: string): Promise<StudentRunResult> {
  const requestId = crypto.randomUUID();
  const blob = new Blob([workerBootstrapSource()], {
    type: "text/javascript",
  });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  return new Promise((resolve) => {
    let settled = false;

    function finish(result: StudentRunResult) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.removeEventListener("message", receive);
      worker.removeEventListener("error", onError);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    }

    const timeout = window.setTimeout(() => {
      finish({
        logs: [],
        error: JS_RUN_TIMEOUT_MESSAGE,
      });
    }, JS_RUN_TIMEOUT_MS);

    function receive(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        requestId?: string;
        logs?: unknown[];
        error?: unknown;
        line?: unknown;
      };
      if (data.type !== JS_RESULT_MESSAGE || data.requestId !== requestId) return;
      finish({
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        error: typeof data.error === "string" ? data.error : undefined,
        line: typeof data.line === "number" ? data.line : undefined,
      });
    }

    function onError() {
      finish({
        logs: [],
        error: "コードの実行環境を準備できませんでした。",
      });
    }

    worker.addEventListener("message", receive);
    worker.addEventListener("error", onError);
    worker.postMessage({ requestId, source });
  });
}

export function syntaxLine(source: string): number | undefined {
  try {
    new Function(source);
    return undefined;
  } catch (cause) {
    const rawLine = lineFromCause(cause);
    return rawLine && rawLine > 0 ? rawLine : 1;
  }
}
