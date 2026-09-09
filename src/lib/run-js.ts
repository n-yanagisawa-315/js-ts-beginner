function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

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

export async function runStudentJs(source: string): Promise<StudentRunResult> {
  if (typeof document !== "undefined") {
    return runStudentJsInSandbox(source);
  }
  return runStudentJsInProcess(source);
}

async function runStudentJsInProcess(source: string): Promise<StudentRunResult> {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(formatValue).join(" "));
    },
  };
  try {
    const fn = new Function(
      "console",
      `"use strict";\nreturn (async () => {\n${source}\n})();`,
    );
    await Promise.race([
      fn(fakeConsole),
      new Promise((_, reject) => {
        globalThis.setTimeout(() => reject(new Error("実行がタイムアウトしました")), 1000);
      }),
    ]);
    await Promise.resolve();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 80));
    return { logs };
  } catch (cause) {
    const rawLine = lineFromCause(cause);
    return {
      logs,
      error: cause instanceof Error ? cause.message : String(cause),
      line: rawLine && rawLine > 3 ? rawLine - 3 : rawLine,
    };
  }
}

const JS_RESULT_MESSAGE = "js-ts-beginner-js-result";

function safeScriptValue(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function runStudentJsInSandbox(source: string): Promise<StudentRunResult> {
  const requestId = crypto.randomUUID();
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.title = "JavaScriptコードの実行";
  iframe.setAttribute("sandbox", "allow-scripts");

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({
        logs: [],
        error: "実行がタイムアウトしました",
      });
    }, 1500);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
      iframe.remove();
    }

    function receive(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as {
        type?: string;
        requestId?: string;
        logs?: unknown[];
        error?: unknown;
        line?: unknown;
      };
      if (data.type !== JS_RESULT_MESSAGE || data.requestId !== requestId) return;
      cleanup();
      resolve({
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        error: typeof data.error === "string" ? data.error : undefined,
        line: typeof data.line === "number" ? data.line : undefined,
      });
    }

    window.addEventListener("message", receive);
    document.body.append(iframe);
    iframe.srcdoc = `<!doctype html>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'">
<script>
(() => {
  const requestId = ${safeScriptValue(requestId)};
  const source = ${safeScriptValue(source)};
  const logs = [];
  const format = (value) => {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    try { return JSON.stringify(value); } catch { return String(value); }
  };
  const fakeConsole = {
    log: (...values) => logs.push(values.map(format).join(" ")),
    error: (...values) => logs.push(values.map(format).join(" ")),
  };
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  (async () => {
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
    parent.postMessage({
      type: ${safeScriptValue(JS_RESULT_MESSAGE)},
      requestId,
      logs,
      error,
      line,
    }, "*");
  })();
})();
<\/script>`;
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
