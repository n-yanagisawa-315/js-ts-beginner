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

export async function runStudentJs(source: string): Promise<{
  logs: string[];
  error?: string;
  line?: number;
}> {
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

export function syntaxLine(source: string): number | undefined {
  try {
    new Function(source);
    return undefined;
  } catch (cause) {
    const rawLine = lineFromCause(cause);
    return rawLine && rawLine > 0 ? rawLine : 1;
  }
}
