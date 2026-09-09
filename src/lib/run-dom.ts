import type { Question } from "./course/types.ts";
import { SEED_ORDERS } from "./order-project.ts";

export type DomRunResult = {
  passed: boolean;
  html: string;
  logs: string[];
  error?: string;
};

const MESSAGE_TYPE = "js-ts-beginner-dom-result";

function scriptValue(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createDomDocument({
  source,
  fixtureHtml,
  probe = "return true;",
  requestId = "preview",
}: {
  source: string;
  fixtureHtml: string;
  probe?: string;
  requestId?: string;
}) {
  const sourceValue = scriptValue(source);
  const probeValue = scriptValue(probe);
  const ordersValue = scriptValue(SEED_ORDERS);
  const requestValue = scriptValue(requestId);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval'">
  <style>
    :root { color: #294955; background: #f7fbfb; font-family: system-ui, sans-serif; }
    body { margin: 0; padding: 16px; }
    button, input, select { min-height: 36px; font: inherit; }
    button { cursor: pointer; }
    ul { padding-left: 20px; }
    .paid, .is-paid { color: #087d70; }
    .unpaid, .is-unpaid { color: #765900; }
    .loading { opacity: .6; }
    .error { color: #b4234d; }
  </style>
</head>
<body>
${fixtureHtml}
<script>
(() => {
  const requestId = ${requestValue};
  const logs = [];
  const storage = new Map();
  const fakeConsole = {
    log: (...values) => logs.push(values.map(String).join(" ")),
    error: (...values) => logs.push(values.map(String).join(" ")),
  };
  const fakeLocalStorage = {
    getItem: (key) => storage.has(String(key)) ? storage.get(String(key)) : null,
    setItem: (key, value) => storage.set(String(key), String(value)),
    removeItem: (key) => storage.delete(String(key)),
    clear: () => storage.clear(),
    key: (index) => [...storage.keys()][index] ?? null,
    get length() { return storage.size; },
  };
  const fakeFetch = async (url, options = {}) => {
    if (String(url) === "/api/demo-orders?fail=1") {
      throw new Error("教材用に再現した一時的な読込失敗です");
    }
    if (String(url) !== "/api/demo-orders") {
      throw new Error("教材用API以外へは接続できません");
    }
    const method = String(options.method ?? "GET").toUpperCase();
    const value = method === "POST"
      ? { id: "ORD-NEW", status: "unpaid", ...JSON.parse(options.body ?? "{}") }
      : ${ordersValue};
    return {
      ok: true,
      status: method === "POST" ? 201 : 200,
      json: async () => structuredClone(value),
    };
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  (async () => {
    let passed = false;
    let error;
    try {
      const source = ${sourceValue};
      const probe = ${probeValue};
      passed = Boolean(await new AsyncFunction(
        "document", "window", "localStorage", "fetch", "console", "FormData",
        source +
          "\\nawait new Promise((resolve) => setTimeout(resolve, 30));" +
          "\\nreturn (" + probe + ");"
      )(document, window, fakeLocalStorage, fakeFetch, fakeConsole, FormData));
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
    parent.postMessage({
      type: ${scriptValue(MESSAGE_TYPE)},
      requestId,
      passed,
      html: document.body.innerHTML,
      logs,
      error,
    }, "*");
  })();
})();
</script>
</body>
</html>`;
}

export async function runDomQuestion(
  question: Question,
  source: string,
): Promise<DomRunResult> {
  if (!question.fixtureHtml || !question.domProbe) {
    return {
      passed: false,
      html: "",
      logs: [],
      error: "DOM問題の検証条件がありません。",
    };
  }

  const requestId = crypto.randomUUID();
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.title = "DOMコードの採点";

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({
        passed: false,
        html: "",
        logs: [],
        error: "DOMコードの実行がタイムアウトしました。",
      });
    }, 2000);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
      iframe.remove();
    }

    function receive(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as Partial<DomRunResult> & {
        type?: string;
        requestId?: string;
      };
      if (data.type !== MESSAGE_TYPE || data.requestId !== requestId) return;
      cleanup();
      resolve({
        passed: Boolean(data.passed),
        html: typeof data.html === "string" ? data.html : "",
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        error: typeof data.error === "string" ? data.error : undefined,
      });
    }

    window.addEventListener("message", receive);
    document.body.append(iframe);
    iframe.srcdoc = createDomDocument({
      source,
      fixtureHtml: question.fixtureHtml ?? "",
      probe: question.domProbe,
      requestId,
    });
  });
}
