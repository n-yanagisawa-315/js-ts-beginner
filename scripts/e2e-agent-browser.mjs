import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE_URL = "http://127.0.0.1:3100";
const CHUNK_DELAY_MS = 700;
const ARTIFACTS = path.join(ROOT, "test-results", "agent-browser");
const SOCKET_DIR = path.join(os.tmpdir(), `jtb-ab-${process.pid}`);
const AGENT_BROWSER = path.join(
  ROOT,
  "node_modules",
  "agent-browser",
  "bin",
  "agent-browser.js",
);
const NEXT = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const requested = process.argv.slice(2);
const suiteNames = ["catalog", "learning", "extensions", "ui", "review"];
const selectAllKey = process.platform === "darwin" ? "Meta+A" : "Control+A";
const selected = requested.length === 0 || requested.includes("all")
  ? suiteNames
  : requested;

for (const name of selected) {
  if (!suiteNames.includes(name)) {
    console.error(`不明なsuite: ${name}\n利用可能: ${suiteNames.join(", ")}, all`);
    process.exit(2);
  }
}

const state = { session: "", scenario: "", commandLog: [] };
let server;
let proxyServer;
let serverOutput = "";
let originPort = 0;
let originUrl = "";
let delayedChunkPaths = new Set();
let delayedChunkRequests = 0;
let delayedChunkPending = 0;
let firstDelayedChunkAt = 0;

function request(baseUrl, pathname = "/") {
  return new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${pathname}`, (response) => {
      response.resume();
      resolve(response.statusCode ?? 0);
    });
    req.once("error", reject);
    req.setTimeout(1_000, () => req.destroy(new Error("timeout")));
  });
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null) {
      throw new Error(`Next.jsが起動前に終了しました。\n${serverOutput}`);
    }
    try {
      if ((await request(originUrl)) === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Next.jsの起動がタイムアウトしました。\n${serverOutput}`);
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const reservation = http.createServer();
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", () => {
      const address = reservation.address();
      if (!address || typeof address === "string") {
        reservation.close();
        reject(new Error("Next.js用の空きポートを取得できませんでした。"));
        return;
      }
      const port = address.port;
      reservation.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function startServer() {
  try {
    await request(BASE_URL);
    throw new Error(`${BASE_URL} は既に使用中です。既存プロセスは停止しません。`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("既に使用中")) {
      throw error;
    }
  }
  originPort = await availablePort();
  originUrl = `http://127.0.0.1:${originPort}`;
  server = spawn(process.execPath, [NEXT, "start", "-H", "127.0.0.1", "-p", String(originPort)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const collect = (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-20_000);
  };
  server.stdout.on("data", collect);
  server.stderr.on("data", collect);
  await waitForServer();
  proxyServer = http.createServer((incoming, outgoing) => {
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: originPort,
        method: incoming.method,
        path: incoming.url,
        headers: { ...incoming.headers, host: `127.0.0.1:${originPort}` },
      },
      (response) => {
        const pathname = new URL(incoming.url ?? "/", BASE_URL).pathname;
        const forward = () => {
          outgoing.writeHead(response.statusCode ?? 502, response.headers);
          response.pipe(outgoing);
        };
        if (!delayedChunkPaths.has(pathname)) {
          forward();
          return;
        }
        delayedChunkRequests += 1;
        delayedChunkPending += 1;
        if (firstDelayedChunkAt === 0) firstDelayedChunkAt = Date.now();
        setTimeout(() => {
          delayedChunkPending -= 1;
          forward();
        }, CHUNK_DELAY_MS);
      },
    );
    upstream.on("error", (error) => {
      if (!outgoing.headersSent) outgoing.writeHead(502);
      outgoing.end(error.message);
    });
    incoming.pipe(upstream);
  });
  await new Promise((resolve, reject) => {
    proxyServer.once("error", reject);
    proxyServer.listen(3100, "127.0.0.1", resolve);
  });
}

async function stopServer() {
  if (proxyServer?.listening) {
    await new Promise((resolve) => proxyServer.close(resolve));
  }
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

async function delayLessonCodeLabChunk() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, ".next", "react-loadable-manifest.json"), "utf8"),
  );
  const files =
    manifest["components/lesson-studio.tsx -> @/components/code-lab"]?.files;
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("CodeLabの遅延chunkをmanifestから特定できません");
  }
  delayedChunkPaths = new Set(files.map((file) => `/_next/${file}`));
  delayedChunkRequests = 0;
  delayedChunkPending = 0;
  firstDelayedChunkAt = 0;
}

function clearChunkDelay() {
  delayedChunkPaths = new Set();
}

async function ab(args, options = {}) {
  const command = ["--session", state.session, ...args];
  state.commandLog.push(`agent-browser ${args.join(" ")}`);
  try {
    const result = await execFileAsync(process.execPath, [AGENT_BROWSER, ...command], {
      cwd: ROOT,
      env: {
        ...process.env,
        HOME: ARTIFACTS,
        AGENT_BROWSER_NAMESPACE: "js-ts-beginner-e2e",
        AGENT_BROWSER_SOCKET_DIR: SOCKET_DIR,
      },
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: options.timeout ?? 30_000,
    });
    return result.stdout.trim();
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`agent-browser ${args.join(" ")}\n${output || error.message}`);
  }
}

async function evaluate(source) {
  const encoded = Buffer.from(source).toString("base64");
  const output = await ab(["eval", "-b", encoded]);
  try {
    return JSON.parse(output);
  } catch {
    return output;
  }
}

async function assertEval(source, message) {
  const result = await evaluate(`Boolean(${source})`);
  if (result !== true) throw new Error(message);
}

async function waitFn(source, timeout = 15_000) {
  await ab(["wait", "--fn", source, "--timeout", String(timeout)], { timeout: timeout + 5_000 });
}

async function open(pathname) {
  await ab(["open", `${BASE_URL}${pathname}`], { timeout: 60_000 });
  await ab(["wait", "--load", "domcontentloaded"]);
}

async function clickRole(role, name) {
  await ab(["find", "role", role, "click", "--name", name]);
}

async function fillLabel(label, value) {
  await ab(["find", "label", label, "fill", value]);
}

async function press(key) {
  await ab(["press", key]);
}

async function waitText(text, timeout = 15_000) {
  await ab(["wait", "--text", text, "--timeout", String(timeout)], { timeout: timeout + 5_000 });
}

async function clickChoiceLabel(text) {
  const escaped = text.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const snapshot = await ab(["snapshot", "-i"]);
    const ref = snapshot.match(new RegExp(`LabelText "[^"]*${escaped}[^"]*".*ref=(e\\d+)`))?.[1];
    if (ref) {
      await ab(["click", `@${ref}`]);
      return;
    }
    await ab(["wait", "100"]);
  }
  throw new Error(`選択肢「${text}」が表示されません`);
}

async function setStorage(entries) {
  await open("/");
  await ab(["storage", "local", "clear"]);
  for (const [key, value] of Object.entries(entries)) {
    await ab(["storage", "local", "set", key, typeof value === "string" ? value : JSON.stringify(value)]);
  }
}

async function replaceEditor(source) {
  let ref;
  for (let attempt = 0; attempt < 30 && !ref; attempt += 1) {
    const snapshot = await ab(["snapshot", "-i"]);
    ref = snapshot.match(/textbox "コードエディター".*ref=(e\d+)/)?.[1];
    if (!ref) await ab(["wait", "100"]);
  }
  if (!ref) throw new Error("コードエディターが表示されていません");
  await ab(["focus", `@${ref}`]);
  await press(selectAllKey);
  await ab(["fill", `@${ref}`, source]);
  await ab(["wait", "100"]);
}

async function advanceUntil(source, message = "目的の演習まで進めませんでした") {
  for (let index = 0; index < 80; index += 1) {
    if (await evaluate(`Boolean(${source})`) === true) return;
    const clicked = await evaluate(`(() => {
      const pattern = /会話を続ける|この内容を演習する|残りの演習へ|結果を見る/;
      const buttons = [...document.querySelectorAll('button')].filter((node) => pattern.test(node.textContent || '') && !node.disabled);
      buttons.at(-1)?.click();
      return buttons.length > 0;
    })()`);
    if (!clicked) await ab(["wait", "50"]);
  }
  throw new Error(message);
}

async function enterLesson(lessonId) {
  await open(`/lesson/${lessonId}`);
  await clickRole("radio", "まだ分からないので、説明で確かめたい");
  await clickRole("button", "予想を残して説明を見る");
  await waitText("今の自信はどのくらい？");
  await clickRole("radio", "半分くらい 50%");
  await clickRole("button", "この自信で解答する");
  await waitFn(`document.querySelector('.slide-stage') !== null`);
}

async function answerQuiz(answer, choice = false) {
  if (choice) await clickChoiceLabel(answer);
  else await fillLabel("答え", answer);
  await clickRole("button", "解答する");
  await waitText("今の自信はどのくらい？");
  await clickRole("radio", "半分くらい 50%");
  await clickRole("button", "この自信で解答する");
  await waitText("正解。");
  await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('button')].filter((b) => /次のスライド|結果を見る/.test(b.textContent || ''));
    buttons.at(-1)?.click();
  })()`);
}

function questionProgress(overrides = {}) {
  return {
    attempts: 1, incorrectAttempts: 0, firstTryCorrect: true, hintUsed: false,
    answerViewed: false, lastAttemptAt: "2026-01-01T00:00:00.000Z",
    lastCorrectAt: "2026-01-01T00:00:00.000Z", streak: 1, intervalDays: 1,
    nextReviewAt: "2026-01-02T00:00:00.000Z", hintUseCount: 0,
    answerViewCount: 0, lastAssistanceAt: null, masteryStage: "practicing",
    retainedAt: null, transferredAt: null, attemptHistory: [], selfExplanations: [],
    ...overrides,
  };
}

function learningState(questions = {}) {
  return { version: 3, lessons: {}, lessonEvents: [], concepts: {}, questions };
}

async function noOverflow() {
  await assertEval(
    "document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1",
    "ページが横方向にはみ出しています",
  );
}

const suites = {
  async catalog() {
    await open("/");
    await waitText("5つの講座で、作る力をつなげる");
    for (const name of ["JavaScript", "TypeScript", "Node.js", "SQL", "GitHub"]) {
      await assertEval(
        `[...document.querySelectorAll('h1,h2,h3')].some((node) => node.textContent.trim() === ${JSON.stringify(name)})`,
        `${name}トラックがありません`,
      );
      await assertEval(
        `[...document.querySelectorAll('a')].some((node) => node.getAttribute('aria-label') === ${JSON.stringify(`${name}講座を見る`)})`,
        `${name}講座リンクがありません`,
      );
    }
    await clickRole("link", "JavaScript講座を見る");
    await ab(["wait", "--url", "**/track/js"]);
    await waitText("JavaScript 入門");
    await waitText("37講義");
    for (const [track, heading] of [
      ["ts", "TypeScript 入門"], ["node", "Node.js 入門"], ["sql", "SQL 入門"], ["github", "GitHub 入門"],
    ]) {
      await open(`/track/${track}`);
      await waitText(heading);
    }
    for (const [pathname, heading] of [["/track/sql", "SQL 入門"], ["/lesson/js-run", "説明を見る前に予想する"]]) {
      if (await evaluate(`fetch(${JSON.stringify(pathname)}).then((response) => response.status)`) !== 200) throw new Error(`${pathname} が200ではありません`);
      await open(pathname);
      await waitText(heading);
    }
    for (const pathname of ["/track/unknown", "/lesson/unknown", "/reference/unknown"]) {
      if (await evaluate(`fetch(${JSON.stringify(pathname)}).then((response) => response.status)`) !== 404) throw new Error(`${pathname} が404ではありません`);
      await open(pathname);
      await waitText("講義が見つかりません");
    }
    await ab(["set", "viewport", "375", "812"]);
    await ab(["set", "media", "light", "reduced-motion"]);
    for (const pathname of ["/", "/track/js"]) {
      await open(pathname);
      await noOverflow();
    }
    await evaluate(`[...document.querySelectorAll('a')].find((node) => node.textContent.includes('講座一覧へ戻る'))?.focus()`);
    await assertEval("document.activeElement?.textContent.includes('講座一覧へ戻る')", "戻るリンクにfocusできません");
  },

  async learning() {
    await open("/lesson/js-run");
    await clickRole("button", "ここを質問");
    await waitText("どこが分からない？");
    await waitText("質問は外部APIへ送らず");
    await clickRole("button", "質問パネルを閉じる");
    await clickRole("radio", "まだ分からないので、説明で確かめたい");
    await clickRole("button", "予想を残して説明を見る");
    await waitText("今の自信はどのくらい？");
    await clickRole("radio", "かなり自信 75%");
    await clickRole("button", "この自信で解答する");
    await assertEval(
      "JSON.parse(localStorage.getItem('js-ts-beginner-learning-v3')).lessonEvents[0]?.context === 'prequestion'",
      "予想イベントが保存されていません",
    );
    await delayLessonCodeLabChunk();
    await advanceUntil(
      `document.body.innerText.includes('コード演習を準備中…')`,
      "CodeLabの読み込み表示まで進めませんでした",
    );
    if (delayedChunkRequests === 0 || delayedChunkPending === 0) {
      throw new Error("700ms遅延中にCodeLabの読み込み表示を確認できませんでした");
    }
    await waitFn(
      `[...document.querySelectorAll('.monaco-editor')].some((node) => node.getClientRects().length > 0)`,
      20_000,
    );
    if (Date.now() - firstDelayedChunkAt < CHUNK_DELAY_MS) {
      throw new Error("CodeLabが700msのchunk遅延完了前に表示されました");
    }
    clearChunkDelay();
    await replaceEditor("// わざと誤答する");
    await clickRole("button", "ヒントを1段だけ見る");
    await clickRole("button", "できた！");
    await waitText("今の自信はどのくらい？", 30_000);
    await clickRole("radio", "半分くらい 50%");
    await clickRole("button", "この自信で解答する");
    await waitText("次へ進む前に、考え方の違いを1文で説明する", 30_000);
    await fillLabel("次へ進む前に、考え方の違いを1文で説明する", "表示命令が必要だと分かりました。");
    await clickRole("button", "演習に戻る");
    await clickRole("button", "あとで解き直す");
    await waitFn(`document.querySelector('.slide-stage') !== null`);

    await enterLesson("js-dom-tree");
    await advanceUntil(`[...document.querySelectorAll('.monaco-editor')].some((node) => node.getClientRects().length > 0)`);
    await replaceEditor('const list = document.querySelector("#order-list");\nconst parentTag = list.parentElement.tagName;');
    await waitFn(`document.querySelector('[title="注文管理画面の実行結果"]') !== null`, 20_000);

    await ab(["set", "viewport", "375", "812"]);
    await open("/lesson/js-run");
    await clickRole("button", "ここを質問");
    await assertEval(
      "document.querySelector('.learning-assistant-panel').getBoundingClientRect().width <= 375",
      "質問パネルがviewportを超えています",
    );
    await noOverflow();
  },

  async extensions() {
    await open("/track/sql");
    await waitText("SQL 入門");
    await enterLesson("sql-table-first");
    await advanceUntil(`document.body.innerText.includes('スライドへ戻る')`);
    await clickChoiceLabel("B行");
    await clickRole("button", "解答する");
    await waitText("今の自信はどのくらい？");
    await clickRole("radio", "半分くらい 50%");
    await clickRole("button", "この自信で解答する");
    await waitText("正解。");
    await clickRole("button", "次のスライド");
    await advanceUntil(`document.body.innerText.includes('最初に書くSQLの単語')`);
    await answerQuiz("SELECT");
    await advanceUntil(`[...document.querySelectorAll('button')].some((b) => b.textContent.includes('SQLを実行'))`);
    await replaceEditor("SELECT * FROM orders;");
    await clickRole("button", "SQLを実行");
    await waitText("コーヒー");
    await replaceEditor("ATTACH DATABASE 'other.db' AS other;");
    await clickRole("button", "SQLを実行");
    await waitText("ATTACH はこのSQL演習では使用できません。");

    await ab(["set", "viewport", "375", "812"]);
    await enterLesson("github-repository-basics");
    await advanceUntil(`document.body.innerText.includes('スライドへ戻る')`);
    await answerQuiz("Git（手元の履歴管理）", true);
    await advanceUntil(`document.body.innerText.includes('管理情報を置く隠しディレクトリ名')`);
    await answerQuiz(".git");
    await advanceUntil(`[...document.querySelectorAll('h1,h2,h3')].some((n) => n.textContent.includes('Git terminal'))`);
    await fillLabel("Gitコマンド", "git init -b main");
    await press("Enter");
    await waitText("Initialized empty Git repository");
    await noOverflow();
  },

  async ui() {
    for (const [pathname, width, height] of [
      ["/", 1440, 900], ["/track/js", 1024, 768], ["/lesson/js-run", 375, 812], ["/lesson/js-run", 812, 375],
    ]) {
      await ab(["set", "viewport", String(width), String(height)]);
      await open(pathname);
      await assertEval("document.querySelectorAll('main').length === 1", `${pathname} のmain要素数が不正です`);
      await noOverflow();
    }
    await ab(["set", "viewport", "375", "812"]);
    await open("/lesson/js-run");
    await clickRole("button", "ここを質問");
    await press("Escape");
    await waitFn(`document.querySelector('[role="dialog"]') === null`);
    await assertEval("document.activeElement?.textContent.includes('ここを質問')", "質問ボタンへfocusが戻りません");
    await clickRole("radio", "まだ分からないので、説明で確かめたい");
    await clickRole("button", "予想を残して説明を見る");
    await waitText("今の自信はどのくらい？");
    await assertEval("document.activeElement?.getAttribute('role') === 'radio'", "自信radioにfocusされません");
    await press("Escape");
    await assertEval("document.activeElement?.textContent.includes('予想を残して説明を見る')", "送信ボタンへfocusが戻りません");

    await setStorage({});
    await enterLesson("js-run");
    await ab(["click", "main h2"]);
    const before = await evaluate(`document.querySelector('.learning-flow-title')?.firstElementChild?.textContent`);
    await press("ArrowRight");
    const after = await evaluate(`document.querySelector('.learning-flow-title')?.firstElementChild?.textContent`);
    if (!before || before === after) throw new Error("ArrowRightでスライドが進みません");
    await clickRole("button", "ここを質問");
    await waitFn(`document.querySelector('[role="dialog"]') !== null`);
    const dialogSnapshot = await ab(["snapshot", "-i"]);
    const closeRef = dialogSnapshot.match(/button "質問パネルを閉じる".*ref=(e\d+)/)?.[1];
    if (!closeRef) throw new Error("質問パネルの閉じるボタンがありません");
    await ab(["focus", `@${closeRef}`]);
    const guarded = await evaluate(`document.querySelector('.learning-flow-title')?.firstElementChild?.textContent`);
    await press("ArrowRight");
    const guardedAfter = await evaluate(`document.querySelector('.learning-flow-title')?.firstElementChild?.textContent`);
    if (guarded !== guardedAfter) throw new Error("入力中にArrowRightでスライドが進みました");
  },

  async review() {
    const key = "js-ts-beginner-learning-v3";
    await setStorage({
      [key]: "{broken",
      "js-ts-beginner-learning-v2": {
        version: 2, lessons: { "js-run": { score: 1, total: 5 } },
        questions: { "js-run:q1": questionProgress() },
      },
    });
    await open("/review");
    await waitText("期限到来");
    await assertEval(
      `JSON.parse(localStorage.getItem(${JSON.stringify(key)})).version === 3 && localStorage.getItem('js-ts-beginner-learning-v2') === null`,
      "legacy進捗がv3へ移行されません",
    );

    await setStorage({ [key]: learningState({ "js-run:q1": questionProgress() }) });
    const requestCountBeforeBatch = ((await ab(["network", "requests", "--filter", "/api/review/questions"])).match(/POST/g) ?? []).length;
    await open("/review");
    await waitText("期限到来");
    await ab(["wait", "300"]);
    let requests = await ab(["network", "requests", "--filter", "/api/review/questions"]);
    if ((requests.match(/POST/g) ?? []).length - requestCountBeforeBatch !== 1) throw new Error(`batch POST回数が1ではありません:\n${requests}`);

    await setStorage({ [key]: learningState({ "js-run:q1": questionProgress() }) });
    await ab(["network", "route", "**/api/review/questions", "--abort"]);
    await open("/review");
    await waitText("復習問題を読み込めませんでした");
    await ab(["network", "unroute", "**/api/review/questions"]);
    await clickRole("button", "もう一度試す");
    await waitText("期限到来");
    requests = await ab(["network", "requests", "--filter", "/api/review/questions"]);
    if ((requests.match(/POST/g) ?? []).length < 2) throw new Error("batch失敗後に再試行されません");

    await setStorage({});
    const requestCountBeforeEmpty = ((await ab(["network", "requests", "--filter", "/api/review/questions"])).match(/POST/g) ?? []).length;
    await open("/review");
    await waitText("まず講義の演習に挑戦しましょう");
    requests = await ab(["network", "requests", "--filter", "/api/review/questions"]);
    if ((requests.match(/POST/g) ?? []).length !== requestCountBeforeEmpty) throw new Error("空進捗でbatch POSTされました");

    await setStorage({ [key]: learningState({ "sql-table-first:select-all-orders": questionProgress() }) });
    await open("/review");
    await waitText("コード演習を準備中…").catch(() => {});
    await waitText("SQLを実行", 30_000);
    await waitText("SQLを実行すると、ここに結果が表示されます。");

    await setStorage({ [key]: learningState({ "github-repository-basics:repo-basics-init": questionProgress() }) });
    await open("/review");
    await waitText("Git terminal", 30_000);
    await fillLabel("Gitコマンド", "git init -b main");
    await press("Enter");
    await waitText("Initialized empty Git repository");

    const rows = Array.from({ length: 123 }, (_, index) => ({ id: index + 1 }));
    const response = {
      version: 1,
      items: [{
        lesson: { id: "sql-table-first", track: "sql", chapter: "sql-select", chapterTitle: "SELECT入門編", title: "注文表をのぞいてみよう" },
        attemptCount: 1,
        question: {
          id: "select-all-orders", prompt: "123行を表示してください。", kind: "sql", runtime: "sql",
          starter: "SELECT * FROM nums;", answer: "SELECT * FROM nums;", explain: "123行を取得できます。",
          sqlSchema: "CREATE TABLE nums (id INTEGER PRIMARY KEY);",
          sqlSeed: "WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM seq WHERE x < 123) INSERT INTO nums(id) SELECT x FROM seq;",
          sqlExpectedRows: rows, variantId: "pagination-review", scaffoldLevel: "independent",
        },
      }],
    };
    await setStorage({ [key]: learningState({ "sql-table-first:select-all-orders": questionProgress() }) });
    await ab(["network", "route", "**/api/review/questions", "--body", JSON.stringify(response)]);
    await open("/review");
    await waitText("SQLを実行", 30_000);
    await clickRole("button", "SQLを実行");
    await waitText("1〜50行 / 全123行");
    await clickRole("button", "SQL実行結果を次の50行表示");
    await waitText("1〜100行 / 全123行");
    await replaceEditor("SELECT id FROM nums;");
    await waitText("SQLを実行すると、ここに結果が表示されます。");
    await clickRole("button", "SQLを実行");
    await waitText("1〜50行 / 全123行");
  },
};

async function runScenario(suite, name, fn) {
  state.session = suite.slice(0, 1);
  state.scenario = `${suite}/${name}`;
  state.commandLog = [];
  const started = Date.now();
  try {
    await fn();
    const browserErrors = await ab(["errors"]).catch(() => "");
    if (browserErrors && !/No errors|0 errors/i.test(browserErrors)) {
      throw new Error(`ブラウザエラー:\n${browserErrors}`);
    }
    const consoleOutput = await ab(["--json", "console"]).catch(() => "");
    if (consoleOutput) {
      const consoleResult = JSON.parse(consoleOutput);
      const consoleErrors = consoleResult.data?.messages?.filter(
        (message) => message.type === "error",
      );
      if (consoleErrors?.length) {
        throw new Error(
          `console.error:\n${consoleErrors.map((message) => message.text).join("\n")}`,
        );
      }
    }
    console.log(`  ✓ ${state.scenario} (${Date.now() - started}ms)`);
    return true;
  } catch (error) {
    const safeName = state.scenario.replaceAll("/", "-");
    const screenshot = path.join(ARTIFACTS, `${safeName}.png`);
    await ab(["screenshot", "--full", screenshot]).catch(() => {});
    const snapshot = await ab(["snapshot", "-i"]).catch(() => "");
    console.error(`  ✗ ${state.scenario}\n${error.stack ?? error}\nスクリーンショット: ${screenshot}\n${snapshot}\n直近コマンド:\n${state.commandLog.slice(-12).join("\n")}`);
    return false;
  } finally {
    await ab(["close"]).catch(() => {});
  }
}

async function main() {
  await rm(ARTIFACTS, { recursive: true, force: true });
  await rm(SOCKET_DIR, { recursive: true, force: true });
  await mkdir(ARTIFACTS, { recursive: true });
  await mkdir(SOCKET_DIR, { recursive: true });
  await startServer();
  let passed = 0;
  let failed = 0;
  for (const suite of selected) {
    console.log(`\n[${suite}]`);
    const ok = await runScenario(suite, "coverage", suites[suite]);
    if (ok) passed += 1;
    else failed += 1;
  }
  console.log(`\nagent-browser E2E: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error.stack ?? error);
  process.exitCode = 1;
} finally {
  await stopServer();
  await rm(SOCKET_DIR, { recursive: true, force: true });
}
