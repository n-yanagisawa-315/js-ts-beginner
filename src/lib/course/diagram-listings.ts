import type { DiagramId } from "@/lib/course/types";

export type Listing = {
  code: string;
  label: string;
};

export const DIAGRAM_LISTING: Record<DiagramId, Listing> = {
  sequence: {
    label: "script.js",
    code: `console.log("いち");
console.log("に");
console.log("さん");
// 表示は いち → に → さん`,
  },
  values: {
    label: "values.js",
    code: `3 // number
"Aya" // string
true // boolean
console.log(typeof 3); // "number"
console.log(typeof "Aya"); // "string"`,
  },
  label: {
    label: "label.js",
    code: `let name = "Aya";
let age = 20;
console.log(name, age);
// name と age は「名前」。値が箱に入っている`,
  },
  rewrite: {
    label: "rewrite.js",
    code: `let age = 20;
age = 21;
console.log(age); // 21
// 名前はそのまま、指す値だけ付け替える`,
  },
  calc: {
    label: "calc.js",
    code: `console.log(1 + 2); // 3 足し算
console.log(1 + "2"); // "12" 文字列連結
console.log("1" + "2"); // "12"`,
  },
  dynamic: {
    label: "dynamic.js",
    code: `let x = 1;
x = "hello";
console.log(typeof x); // "string"
// 同じ名前でも、中身の種類は後から変わりうる`,
  },
  "fn-box": {
    label: "add.js",
    code: `function add(a, b) {
  return a + b;
}
console.log(add(2, 3)); // 5
// 入る: 2, 3 → 箱 add → 出る: 5`,
  },
  "callback-flow": {
    label: "callback.js",
    code: `function later(fn) {
  fn("準備完了"); // ここで呼ぶ
}
function notify(message) {
  console.log(message);
}
later(notify); // ()なしで渡す
// 準備完了`,
  },
  object: {
    label: "object.js",
    code: `const user = { name: "Aya", age: 20 };
console.log(user.name);
console.log(user.age);
// 1つの束に、名前つきの値が並ぶ`,
  },
  array: {
    label: "array.js",
    code: `const scores = [80, 90, 70];
console.log(scores[0]); // 80 先頭
console.log(scores[2]); // 70 末尾
console.log(scores.length); // 3`,
  },
  branch: {
    label: "branch.js",
    code: `const n = 3;
if (n > 0) {
  console.log("正");
} else {
  console.log("それ以外");
}`,
  },
  truthy: {
    label: "truthy.js",
    code: `Boolean(0); // false 個数ゼロ
Boolean("0"); // true 札に文字がある
Boolean(""); // false 空の札
Boolean([]); // true 列はある`,
  },
  loop: {
    label: "loop.js",
    code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}
// 0, 1, 2。始める・続ける・更新`,
  },
  "for-loop": {
    label: "for-loop.js",
    code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}
// 初期化は1回
// 条件 → 本体 → 更新 を繰り返す`,
  },
  "while-loop": {
    label: "while-loop.js",
    code: `let fuel = 3;
while (fuel > 0) {
  console.log(fuel);
  fuel--;
}
// 条件に使う値を本体で変える`,
  },
  "loop-control": {
    label: "loop-control.js",
    code: `for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  if (i === 4) break;
  console.log(i);
}`,
  },
  "for-of-loop": {
    label: "for-of.js",
    code: `for (const value of ["A", "B"]) {
  console.log(value);
}
// iterableから値を1個ずつ受け取る`,
  },
  "foreach-loop": {
    label: "foreach.js",
    code: `const xs = ["A", "B"];
xs.forEach((value, index, array) => {
  console.log(index, value);
});
// 戻り値は常に undefined`,
  },
  scope: {
    label: "scope.js",
    code: `const outer = 1;
function f() {
  const inner = 2;
  console.log(outer, inner);
}
f();
// console.log(inner); // 外からは見えない`,
  },
  "var-hoist": {
    label: "var-scope.js",
    code: `function sample() {
  console.log(value); // undefined
  if (true) {
    var value = 1;
  }
  console.log(value); // 1
}`,
  },
  ref: {
    label: "ref.js",
    code: `const a = { n: 5 };
const b = a;
b.n = 9;
console.log(a.n); // 9
// a と b は同じ束を指す`,
  },
  spread: {
    label: "spread.js",
    code: `const user = { name: "Aya", age: 20 };
const copy = { ...user, age: 21 };
console.log(copy);
// { name: "Aya", age: 21 }`,
  },
  map: {
    label: "map.js",
    code: `const src = [1, 2, 3];
const doubled = src.map((n) => n * 2);
console.log(doubled); // [2, 4, 6]
console.log(src); // [1, 2, 3] 元は残る`,
  },
  closure: {
    label: "closure.js",
    code: `function makeCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}
const next = makeCounter();
console.log(next()); // 1
console.log(next()); // 2`,
  },
  "this-call": {
    label: "this.js",
    code: `const user = {
  name: "Aya",
  hello() {
    return this.name;
  },
};
console.log(user.hello()); // "Aya"
const f = user.hello;
// f(); // this が外れる`,
  },
  "class-instance": {
    label: "class.js",
    code: `class User {
  constructor(name) {
    this.name = name;
  }
}
const a = new User("Aya");
console.log(a.name); // "Aya"`,
  },
  promise: {
    label: "promise.js",
    code: `const p = Promise.resolve("ok");
p.then((value) => {
  console.log(value); // "ok"
});
console.log("先に出る");`,
  },
  "async-await": {
    label: "async.js",
    code: `async function load() {
  const value = await Promise.resolve("ok");
  console.log(value);
}
load();
console.log("await の前までは同期");
// await の前までは同期
// ok`,
  },
  "event-loop": {
    label: "event-loop.js",
    code: `console.log("同期");
Promise.resolve().then(() => console.log("micro"));
setTimeout(() => console.log("macro"), 0);
// 同期 → micro → macro`,
  },
  modules: {
    label: "app.js",
    code: `// math.js export function add(a, b) { return a + b; }
import { add } from "./math.js";
console.log(add(2, 3)); // 5`,
  },
  contract: {
    label: "contract.ts",
    code: `let age: number = 20;
// age = "二十"; // 型が合わない
console.log(age);`,
  },
  annotate: {
    label: "annotate.ts",
    code: `let n: number = 1;
n = 2;
// n = "x"; // number ではない`,
  },
  shape: {
    label: "shape.ts",
    code: `type User = {
  name: string;
  age: number;
};
const user: User = { name: "Aya", age: 20 };`,
  },
  union: {
    label: "union.ts",
    code: `type Id = string | number;
const a: Id = "u1";
const b: Id = 12;
// const c: Id = true; // どちらでもない`,
  },
  "fn-type": {
    label: "fn-type.ts",
    code: `type Add = (a: number, b: number) => number;
const add: Add = (a, b) => a + b;
console.log(add(1, 2)); // 3`,
  },
  narrow: {
    label: "narrow.ts",
    code: `function show(x: string | number) {
  if (typeof x === "string") {
    console.log(x.toUpperCase());
  } else {
    console.log(x.toFixed(1));
  }
}`,
  },
  unknown: {
    label: "unknown.ts",
    code: `const raw: unknown = JSON.parse("1");
if (typeof raw === "number") {
  console.log(raw + 1);
}
// unknown は絞るまで触れない`,
  },
  generic: {
    label: "generic.ts",
    code: `function first<T>(items: T[]): T {
  return items[0];
}
const n = first([1, 2, 3]); // T は number`,
  },
  utility: {
    label: "utility.ts",
    code: `type User = { name: string; age: number };
type Draft = Partial<User>;
const d: Draft = { age: 21 };
// name も age も省略できる`,
  },
  conditional: {
    label: "conditional.ts",
    code: `type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<string>; // "yes"
type B = IsString<number>; // "no"`,
  },
  "node-vs-browser": {
    label: "node.mjs",
    code: `console.log(typeof window); // "undefined"
console.log(process.version);
// ブラウザの DOM はここには無い`,
  },
  "node-cli": {
    label: "cli",
    code: `node
node app.js
// REPL で試す / ファイルを実行する
// 待ちが無ければプロセスは終わる`,
  },
  "node-cjs-esm": {
    label: "modules",
    code: `// CJS
const fs = require("node:fs");
module.exports = { ok: true };

// ESM
import fs from "node:fs";
export const ok = true;`,
  },
  "node-process": {
    label: "process.mjs",
    code: `console.log(process.argv);
console.log(process.env.NODE_ENV);
console.log(process.cwd());`,
  },
  "node-fs": {
    label: "fs.mjs",
    code: `import { readFile, writeFile } from "node:fs/promises";
const text = await readFile("note.txt", "utf8");
await writeFile("out.txt", text);`,
  },
  "node-path": {
    label: "path.mjs",
    code: `import path from "node:path";
const file = path.join("dir", "file.txt");
console.log(file); // dir/file.txt`,
  },
  "node-http": {
    label: "http.mjs",
    code: `import http from "node:http";
http.createServer((req, res) => {
  res.end("ok");
}).listen(3000);`,
  },
  "node-npm": {
    label: "package.json",
    code: `{
  "name": "app",
  "type": "module",
  "dependencies": { "fastify": "^5.0.0" }
}`,
  },
  "node-stream": {
    label: "stream.mjs",
    code: `import { createReadStream } from "node:fs";
for await (const chunk of createReadStream("big.txt")) {
  console.log(chunk.length);
}`,
  },
  "node-libuv": {
    label: "libuv.mjs",
    code: `import { readFile } from "node:fs/promises";
console.log("依頼");
const text = await readFile("a.txt", "utf8");
console.log(text);
// I/O は裏で進み、終わったら続き`,
  },
  "node-error": {
    label: "error.mjs",
    code: `try {
  throw new Error("業務の失敗");
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}`,
  },
  "node-prod": {
    label: "shutdown.mjs",
    code: `process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
// 新規を断り、進行中を待ってから終了`,
  },
  "dom-tree": {
    label: "index.html",
    code: `<main id="orders">
  <p id="order-count">0件</p>
  <ul id="order-list"></ul>
</main>`,
  },
  "dom-query": {
    label: "orders.js",
    code: `const count = document.querySelector("#order-count");
console.log(count.textContent);`,
  },
  "dom-update": {
    label: "orders.js",
    code: `const count = document.querySelector("#order-count");
count.textContent = "3件";
count.classList.add("is-ready");`,
  },
  "dom-create": {
    label: "orders.js",
    code: `const row = document.createElement("li");
row.textContent = "ORD-1042 Aya";
document.querySelector("#order-list").append(row);`,
  },
  "dom-event": {
    label: "orders.js",
    code: `const button = document.querySelector("[data-pay]");
button.addEventListener("click", () => {
  button.textContent = "支払済み";
});`,
  },
  "dom-form": {
    label: "orders.js",
    code: `const form = document.querySelector("#order-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  console.log(data.get("customer"));
});`,
  },
  "dom-render": {
    label: "orders.js",
    code: `function render(orders) {
  const list = document.querySelector("#order-list");
  list.replaceChildren();
  orders.forEach((order) => {
    const row = document.createElement("li");
    row.textContent = order.customer;
    list.append(row);
  });
}`,
  },
  "dom-storage": {
    label: "orders.js",
    code: `localStorage.setItem("orders", JSON.stringify(orders));
const saved = JSON.parse(localStorage.getItem("orders") ?? "[]");`,
  },
  "dom-fetch": {
    label: "orders.js",
    code: `status.textContent = "読込中";
try {
  const response = await fetch("/api/demo-orders");
  render(await response.json());
} catch {
  status.textContent = "再読み込みしてください";
}`,
  },
  "sql-table": {
    label: "query.sql",
    code: "SELECT id, customer, total FROM orders;",
  },
  "sql-filter": {
    label: "query.sql",
    code: "SELECT * FROM orders WHERE status = 'unpaid';",
  },
  "sql-sort": {
    label: "query.sql",
    code: "SELECT * FROM orders ORDER BY total DESC LIMIT 3;",
  },
  "sql-group": {
    label: "query.sql",
    code: "SELECT status, COUNT(*) FROM orders GROUP BY status;",
  },
  "sql-join": {
    label: "query.sql",
    code: "SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id;",
  },
  "sql-write": {
    label: "query.sql",
    code: "UPDATE orders SET status = 'paid' WHERE id = 1;",
  },
  "sql-transaction": {
    label: "query.sql",
    code: "BEGIN;\nUPDATE orders SET status = 'paid' WHERE id = 1;\nCOMMIT;",
  },
  "git-repository": {
    label: "terminal",
    code: "git init\ngit status",
  },
  "git-staging": {
    label: "terminal",
    code: "git add src/orders.js\ngit commit -m \"注文表示を追加\"",
  },
  "git-history": {
    label: "terminal",
    code: "git log --oneline",
  },
  "git-branch": {
    label: "terminal",
    code: "git switch -c feature/order-filter",
  },
  "git-remote": {
    label: "terminal",
    code: "git remote add origin https://github.com/example/orders.git\ngit push -u origin main",
  },
  "git-pr": {
    label: "terminal",
    code: "gh pr create --base main --head feature/order-filter",
  },
  "git-conflict": {
    label: "terminal",
    code: "git status\ngit add src/orders.js\ngit commit",
  },
  "git-actions": {
    label: "terminal",
    code: "gh pr status\ngh run list",
  },
};

export function listingsFor(slide: {
  diagram: DiagramId;
  code?: string;
  codeExample?: string;
  codeCaption?: string;
}): Listing[] {
  const fallback = DIAGRAM_LISTING[slide.diagram];
  const items: Listing[] = [];
  if (slide.code) {
    items.push({
      code: slide.code,
      label: slide.codeCaption ?? "参考コード",
    });
  }
  if (slide.codeExample) {
    items.push({ code: slide.codeExample, label: "対比" });
  }
  const compact = (value: string) => value.replace(/\s+/g, "");
  const hasFallback = items.some(
    (item) => compact(item.code) === compact(fallback.code),
  );
  if (!hasFallback && items.length < 2) {
    items.push({
      ...fallback,
      label: items.length === 0 ? fallback.label : "もう一つの例",
    });
  }
  if (items.length === 0) items.push(fallback);
  return items;
}
