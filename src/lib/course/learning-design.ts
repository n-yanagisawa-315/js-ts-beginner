import type {
  ChapterId,
  ExerciseKind,
  Lesson,
  ProjectRole,
  Question,
  ScaffoldLevel,
  Slide,
  StoryBeat,
  TalkLine,
  Track,
  TransferLevel,
} from "./types";

const PROJECT_BY_TRACK: Record<Track, string> = {
  js: "注文管理画面",
  ts: "型安全な注文管理",
  node: "注文API",
  sql: "注文データベース",
  github: "注文管理アプリの共同開発",
};

/** トラック全体の最終ゴール（予告カード用。会話のたびに繰り返さない） */
const GOAL_BY_TRACK: Record<Track, string> = {
  js: "最終的には、注文を一覧表示・追加・更新できる画面を作ります。",
  ts: "最終的には、注文データの取り違えを実行前に止められる型を付けます。",
  node: "最終的には、注文をファイル・通信・プロセスへ安全につなぐAPIを作ります。",
  sql: "最終的には、注文を正しく探して更新できるデータベース操作を身につけます。",
  github: "最終的には、注文管理アプリの変更を失わず共有できる共同開発の流れを整えます。",
};

const PROJECT_MILESTONE_BY_CHAPTER: Record<ChapterId, string> = {
  "js-syntax": "画面が読む値と、処理する順番を確かめる",
  "js-data": "1件の注文と注文一覧をデータとして組み立てる",
  "js-loop": "注文の状態で処理を分け、一覧を順に扱う",
  "js-fn": "金額計算や表示名の手順を、何度でも使える関数にする",
  "js-callback": "注文ごとの処理や、操作のあとに動く処理を関数として渡す",
  "js-array-fn": "未払いの抽出・合計・並べ替えを配列から作る",
  "js-modern": "欠けた注文データを安全に読み、元の一覧を壊さず更新する",
  "js-ref": "注文オブジェクトを、意図せず共有・変更しない形にする",
  "js-class": "同じ決まりを持つ注文を、共通の設計から作る",
  "js-async": "返事が後から来る処理でも、画面を止めずに進める",
  "js-dom": "注文一覧の表示・追加・削除・支払更新・保存・APIまで操作できる画面にする",
  "js-module": "注文画面の表示・計算・通信をファイルへ分ける",
  "js-npm": "注文画面を、同じ依存関係で再現できるようにする",
  "ts-intro": "注文番号・金額・状態へ型の約束を付ける",
  "ts-shape": "注文全体と表示用データの形を契約として表す",
  "ts-guard": "APIから来た不明な値を検査してから注文として扱う",
  "ts-generic": "注文一覧を扱う共通処理でも、具体的な型を保つ",
  "ts-advanced": "注文の更新・表示用の型を、元の契約から組み立てる",
  "node-runtime": "注文APIをサーバー上で起動する",
  "node-fs": "注文データをJSONファイルから読み書きする",
  "node-http": "注文の取得・追加をHTTPの入口へつなぐ",
  "node-npm": "注文APIを、どの環境でも同じ手順で起動する",
  "node-async": "複数の注文通信を、止めずに処理する",
  "node-prod": "失敗を記録し、注文処理を途中で壊さず終了する",
  "js-challenge": "JavaScriptの仕組みを組み合わせ、未知の注文処理を解く",
  "ts-challenge": "型の道具を組み合わせ、注文データの制約を型で表す",
  "node-challenge": "Node.jsのAPIを組み合わせ、注文サービスの課題を解く",
  "sql-select": "注文テーブルから必要な列を読み出す",
  "sql-filter": "状態や金額を条件に、必要な注文だけを選ぶ",
  "sql-sort": "注文を金額や日時で並べ、表示件数を絞る",
  "sql-group": "顧客や状態ごとの件数・合計を集計する",
  "sql-join": "注文と顧客をキーで結び、表示情報を完成させる",
  "sql-write": "注文の追加・支払更新・取消を安全に行う",
  "sql-transaction": "制約と取引で、複数更新の整合性を守る",
  "github-repository": "注文管理アプリを履歴管理できる状態にする",
  "github-commit": "変更を選び、意味のある単位で記録する",
  "github-branch": "機能開発をmainから分けて、安全に統合する",
  "github-remote": "ローカルの履歴を共有先と同期する",
  "github-pr": "変更内容をPull Requestとして提案・確認する",
  "github-conflict": "同じ箇所の変更を読み、意図を保って解決する",
  "github-automation": "Issue・Actions・保護ルールで共同開発を整える",
};

const PROJECT_TERMS =
  /(注文|受注|order|customer|paid|unpaid|支払|顧客|商品|price|quantity|status|在庫|金額|合計|API|HTTP)/i;

const TRACK_CAPSTONE_CODE: Record<Track, string> = {
  js: `// 注文管理ツールの引き継ぎコード
const TAX_RATE = 0.1;
const orders = [
  { id: 1, customer: "Aya", items: [1200, 800], paid: true },
  { id: 2, customer: "Ren", items: [500], paid: false },
  { id: 3, customer: "Mio", items: [900, 300], paid: true },
];

function subtotal(order) {
  return order.items.reduce((sum, price) => sum + price, 0);
}

function total(order) {
  return Math.floor(subtotal(order) * (1 + TAX_RATE));
}

function label(order) {
  const status = order.paid ? "支払済み" : "未払い";
  return \`#\${order.id} \${order.customer} \${status}\`;
}

function paidOrders(source) {
  return source.filter((order) => order.paid);
}

function renderOrders(source) {
  const list = document.querySelector("#order-list");
  list.replaceChildren();
  source.forEach((order) => {
    const row = document.createElement("li");
    const status = order.paid ? "支払済み" : "未払い";
    row.dataset.orderId = String(order.id);
    row.textContent = \`\${order.customer} \${total(order)}円 \${status}\`;
    list.append(row);
  });
  document.querySelector("#order-count").textContent =
    \`\${source.length}件\`;
}

function totalsByCustomer(source) {
  return source.reduce((result, order) => {
    result[order.customer] = total(order);
    return result;
  }, {});
}

async function saveOrder(order, save) {
  const payload = {
    id: order.id,
    customer: order.customer,
    total: total(order),
  };
  return await save(payload);
}

for (const order of orders) {
  console.log(label(order));
}

paidOrders(orders).forEach((order) => {
  console.log(order.customer, total(order));
});

const summary = totalsByCustomer(orders);
renderOrders(orders);
console.log(summary);

// package.json には start と test がある
// package-lock.json はリポジトリへ保存済み
// CI は毎回同じ依存関係を復元する必要がある
// node_modules は生成物なので保存しない
// ここまでを読み、最後の設問へ答える`,
  ts: `type OrderStatus = "draft" | "paid" | "cancelled";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer: string;
  status: OrderStatus;
  items: OrderItem[];
};

type OrderSummary = {
  id: string;
  total: number;
  label: string;
};

function itemTotal(item: OrderItem): number {
  return item.price * item.quantity;
}

function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + itemTotal(item), 0);
}

function isPaid(order: Order): boolean {
  return order.status === "paid";
}

function summarize(order: Order): OrderSummary {
  return {
    id: order.id,
    total: orderTotal(order),
    label: \`\${order.customer}: \${order.status}\`,
  };
}

const apiValue: unknown = {
  id: "o-1",
  customer: "Aya",
  status: "paid",
  items: [{ name: "本", price: 1200, quantity: "1" }],
};

const order = apiValue as Order;
const unsafeQuantity = "1" as unknown as number;
const summary = summarize(order);

console.log(summary);
console.log(unsafeQuantity + 1);

// 型アサーションは値を変換しない
// unknown を経由しても実行時検査は増えない
// API境界では値の検証が別途必要
// ここまでを読み、最後の設問へ答える`,
  node: `import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";

const PORT = Number(process.env.PORT ?? 3000);
const DATA_FILE = new URL("./orders.json", import.meta.url);

async function readOrders() {
  const text = await readFile(DATA_FILE, "utf8");
  return JSON.parse(text);
}

async function saveOrders(orders) {
  await writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
}

function sendJson(res, status, value) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/orders") {
      const orders = await readOrders();
      console.log("orders.read", orders.length);
      sendJson(res, 200, orders);
      return;
    }

    if (req.method === "POST" && req.url === "/orders") {
      const orders = await readOrders();
      const next = { id: Date.now(), status: "draft" };
      orders.push(next);
      await saveOrders(orders);
      console.log("orders.created", next.id);
      sendJson(res, 201, next);
      return;
    }

    sendJson(res, 404, { error: "not found" });
  } catch (error) {
    console.error("request.failed", error);
    sendJson(res, 500, { error: "internal error" });
  }
});

server.listen(PORT, () => {
  console.log("server.started", PORT);
});

process.on("SIGTERM", () => {
  console.log("server.stopping");
  server.close(() => process.exit(0));
});

// コンテナ基盤は標準出力と標準エラーを収集する
// 一時ファイルだけへログを残さない
// ここまでを読み、最後の設問へ答える`,
  sql: `-- 注文データベースの引き継ぎクエリ
SELECT c.name, COUNT(o.id) AS order_count, SUM(o.total) AS paid_total
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.name
ORDER BY paid_total DESC;`,
  github: `# 注文管理アプリの共同開発フロー
git status
git switch -c feature/order-filter
git add src/order-filter.js
git commit -m "注文状態の絞り込みを追加"
git push -u origin feature/order-filter
gh pr create --base main --head feature/order-filter`,
};

const CONTRAST_GROUP: Partial<Record<Slide["diagram"], string>> = {
  label: "declaration-let-const-var",
  rewrite: "declaration-let-const-var",
  "var-hoist": "declaration-let-const-var",
  loop: "iteration-choice",
  "for-loop": "iteration-choice",
  "while-loop": "iteration-choice",
  "for-of-loop": "iteration-choice",
  "foreach-loop": "iteration-choice",
  map: "iteration-choice",
  promise: "async-model-choice",
  "async-await": "async-model-choice",
  "event-loop": "async-model-choice",
  shape: "type-shape-choice",
  union: "type-shape-choice",
  annotate: "type-shape-choice",
  "node-fs": "node-path-and-fs",
  "node-path": "node-path-and-fs",
  "node-cjs-esm": "module-system-choice",
  modules: "module-system-choice",
};

function isSummary(slide: Slide): boolean {
  return slide.title === "この講義の要点";
}

function firstTeachingSlide(lesson: Lesson): Slide | undefined {
  return lesson.slides.find((slide) => !isSummary(slide));
}

type PredictionLens =
  | "order"
  | "binding"
  | "value"
  | "branch"
  | "iteration"
  | "function"
  | "object"
  | "async"
  | "dom"
  | "module"
  | "type"
  | "node"
  | "sql"
  | "git";

function predictionLensForLesson(lesson: Lesson): PredictionLens {
  if (lesson.track === "sql") return "sql";
  if (lesson.track === "github") return "git";
  if (lesson.track === "ts") return "type";
  if (lesson.track === "node") return "node";

  const diagram = firstTeachingSlide(lesson)?.diagram;
  if (!diagram) return "order";
  const group = CONTRAST_GROUP[diagram];
  if (group === "iteration-choice") return "iteration";
  if (group === "declaration-let-const-var") return "binding";
  if (group === "async-model-choice") return "async";
  if (group === "module-system-choice") return "module";

  switch (diagram) {
    case "sequence":
    case "calc":
      return "order";
    case "values":
    case "dynamic":
      return "value";
    case "branch":
    case "truthy":
      return "branch";
    case "fn-box":
    case "callback-flow":
    case "closure":
    case "this-call":
    case "class-instance":
      return "function";
    case "object":
    case "array":
    case "ref":
    case "spread":
    case "scope":
      return "object";
    case "dom-tree":
    case "dom-query":
    case "dom-update":
    case "dom-create":
    case "dom-event":
    case "dom-form":
    case "dom-render":
    case "dom-storage":
    case "dom-fetch":
      return "dom";
    case "modules":
      return "module";
    default:
      return "order";
  }
}

function predictionFocusPrompt(lens: PredictionLens): string {
  switch (lens) {
    case "order":
      return "命令はどの順で動くかに近いものを選びます。";
    case "binding":
      return "名前と値の結び付きで何が起きるかに近いものを選びます。";
    case "value":
      return "値の形や見え方がどう変わるかに近いものを選びます。";
    case "branch":
      return "条件で処理がどう分かれるかに近いものを選びます。";
    case "iteration":
      return "何回・どの順で処理が進むかに近いものを選びます。";
    case "function":
      return "何が入り、何が戻るか／いつ動くかに近いものを選びます。";
    case "object":
      return "まとめたデータの持ち方や共有のされ方に近いものを選びます。";
    case "async":
      return "待っているあいだに何が進むかに近いものを選びます。";
    case "dom":
      return "画面のどの要素や操作が変わるかに近いものを選びます。";
    case "module":
      return "どのファイルへ分け、どうつなぐかに近いものを選びます。";
    case "type":
      return "どの約束（型）が誤りを実行前に止めるかに近いものを選びます。";
    case "node":
      return "どの入出力や起動の手順が動きを変えるかに近いものを選びます。";
    case "sql":
      return "どの列・条件・並びが結果の行を変えるかに近いものを選びます。";
    case "git":
      return "どの操作が履歴や共有の状態を変えるかに近いものを選びます。";
  }
}

function predictionOptionStems(
  lens: PredictionLens,
  objective: string,
): [string, string, string] {
  switch (lens) {
    case "order":
      return [
        `「${objective}」は、命令が動く順番に関係する`,
        `「${objective}」は、値の形や計算の結果に関係する`,
        `「${objective}」は、条件で処理を分けることに関係する`,
      ];
    case "binding":
      return [
        `「${objective}」は、名前に値を結び付ける`,
        `「${objective}」は、すでに結んだ値を書き換える`,
        `「${objective}」は、同じ名前を別の場所でも使えるようにする`,
      ];
    case "value":
      return [
        `「${objective}」は、値の種類や見え方を決める`,
        `「${objective}」は、計算や変換の結果を作る`,
        `「${objective}」は、後から同じ値を参照できるようにする`,
      ];
    case "branch":
      return [
        `「${objective}」は、条件が真のときだけ進む道を選ぶ`,
        `「${objective}」は、複数の候補から一つを選ぶ`,
        `「${objective}」は、条件に関係なく同じ処理を繰り返す`,
      ];
    case "iteration":
      return [
        `「${objective}」は、同じ処理を繰り返す回数や順番に関係する`,
        `「${objective}」は、一覧の各要素へ一度ずつ処理を渡す`,
        `「${objective}」は、条件で処理を1回だけ分岐させる`,
      ];
    case "function":
      return [
        `「${objective}」は、渡した値を受け取り、結果を返す`,
        `「${objective}」は、後で動かす処理そのものを渡す`,
        `「${objective}」は、作ったあとも外側の値を覚えている`,
      ];
    case "object":
      return [
        `「${objective}」は、複数の値を一つのまとまりとして持つ`,
        `「${objective}」は、同じまとまりを共有して書き換える`,
        `「${objective}」は、必要な部品だけを取り出して使う`,
      ];
    case "async":
      return [
        `「${objective}」は、返事を待ちながら他の処理を進める`,
        `「${objective}」は、成功・失敗のあとで次の処理をつなぐ`,
        `「${objective}」は、画面を止めずに完了まで一気に待つ`,
      ];
    case "dom":
      return [
        `「${objective}」は、画面上の要素を探して表示を変える`,
        `「${objective}」は、操作が起きたあとに処理を動かす`,
        `「${objective}」は、入力や保存の内容を読み書きする`,
      ];
    case "module":
      return [
        `「${objective}」は、役割ごとに別ファイルへ分ける`,
        `「${objective}」は、分けたファイルを読み込んでつなぐ`,
        `「${objective}」は、同じ名前でも衝突しない公開の範囲を決める`,
      ];
    case "type":
      return [
        `「${objective}」は、値の形を約束して誤りを実行前に止める`,
        `「${objective}」は、いくつかの候補のうちどれかを表す`,
        `「${objective}」は、不明な値を検査してから安全に扱う`,
      ];
    case "node":
      return [
        `「${objective}」は、ファイルや通信など外部との入出力に関係する`,
        `「${objective}」は、プロセスの起動や終了の手順に関係する`,
        `「${objective}」は、同じ環境で再現できる依存関係の扱いに関係する`,
      ];
    case "sql":
      return [
        `「${objective}」は、どの列を読み出すかに関係する`,
        `「${objective}」は、どの行を条件で残すかに関係する`,
        `「${objective}」は、並びや件数、複数表の結び付きに関係する`,
      ];
    case "git":
      return [
        `「${objective}」は、変更を記録して履歴に残す`,
        `「${objective}」は、作業の流れを分岐・統合する`,
        `「${objective}」は、共有先と履歴を同期する`,
      ];
  }
}

function storyBeat(index: number, teachingCount: number): StoryBeat {
  if (index === 0) return "problem";
  if (index === 1) return "prediction";
  if (index === teachingCount - 1) return "transfer";
  if (index === teachingCount - 2) return "resolution";
  return "trace";
}

function storyContextForSlide(
  lesson: Lesson,
  slides: Slide[],
  index: number,
): string {
  const slide = slides[index];
  if (!slide) return lesson.title;
  const previous = slides[index - 1];
  const beat = storyBeat(index, slides.length);
  switch (beat) {
    case "problem":
      return `この講義のゴールは「${PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter]}」。いまは「${slide.title}」から入ります。`;
    case "prediction":
      return `「${previous?.title ?? lesson.title}」を踏まえ、「${slide.title}」の結果を予想します。`;
    case "trace":
      return `「${previous?.title ?? lesson.title}」の次に、「${slide.title}」の値と実行位置を追います。`;
    case "resolution":
      return `「${slide.title}」を判断基準にして、いまの問題を直します。`;
    case "transfer":
      return `「${slide.title}」で、同じ仕組みを別の入力でも使えるか確かめます。`;
  }
}

function exerciseKind(index: number, count: number): ExerciseKind {
  if (index === 0) return "worked";
  if (index <= Math.floor(count / 3)) return "faded";
  return "independent";
}

function scaffoldLevel(index: number, count: number): ScaffoldLevel {
  if (index === 0) return "worked";
  if (index < Math.max(2, Math.floor(count / 2))) return "faded";
  return "independent";
}

function transferLevel(kind: ExerciseKind): TransferLevel {
  return kind === "transfer" ? "near" : kind === "independent" ? "same" : "same";
}

function diagnoseOption(
  option: string,
  answer: string,
  baseId: string,
  index: number,
) {
  if (option.toLowerCase() === answer.toLowerCase() && option !== answer) {
    return {
      id: `${baseId}:case-sensitive`,
      feedback: `「${option}」は大文字・小文字だけが異なります。JavaScriptは命令名の大小を区別します。`,
      nextCheck: "命令名を正解例と1文字ずつ比較する",
    };
  }
  if (/\b(?:undefined|null)\b/.test(option) && !answer.includes(option)) {
    return {
      id: `${baseId}:missing-versus-empty`,
      feedback: `「${option}」を選んだ場合は、「値が未設定」と「対象が存在しない」を同じものとして扱っていないか確認します。`,
      nextCheck: "その値が作られる時点と、実際に保持される値を追う",
    };
  }
  if (/\bvar\b/.test(option) && !/\bvar\b/.test(answer)) {
    return {
      id: `${baseId}:var-scope`,
      feedback: `「${option}」ではvarの関数スコープと巻き上げが入ります。ブロック単位で名前を分けたい場面とは動きが異なります。`,
      nextCheck: "名前が見える範囲と、再代入が必要かを分けて確認する",
    };
  }
  if (/自動|必ず|すべて|何でも|そのまま/.test(option)) {
    return {
      id: `${baseId}:overgeneralization`,
      feedback: `「${option}」は処理が自動で行われる範囲を広く見積もりすぎています。構文が保証する処理だけに分けて考えます。`,
      nextCheck: "コードに実際に書かれた変換・待機・検査だけを列挙する",
    };
  }
  if (/\b(?:Promise|await|then|async)\b/.test(option + answer)) {
    return {
      id: `${baseId}:async-order`,
      feedback: `「${option}」では、処理を開始する時点と結果を受け取る時点が混ざっています。`,
      nextCheck: "同期処理、Promiseの確定、コールバック再開の順を番号で書く",
    };
  }
  return {
    id: `${baseId}:alternative-${index + 1}`,
    feedback: `「${option}」という結果になるには、コード中に別の処理が必要です。現在のコードが実際に行う操作だけを順に追ります。`,
    nextCheck: "入力値→実行される行→出力値の3段階で確認する",
  };
}

function misconceptionByAnswer(
  question: Question,
  baseId: string,
): Question["misconceptionByAnswer"] {
  if (question.kind !== "choice" || !question.options) {
    return question.misconceptionByAnswer;
  }
  return Object.fromEntries(
    question.options
      .filter((option) => option !== question.answer)
      .map((option, index) => [
        option,
        diagnoseOption(option, question.answer, baseId, index),
      ]),
  );
}

function fadedStarter(question: Question, level: ScaffoldLevel): string | undefined {
  if (question.kind !== "code" || level !== "faded") return question.starter;
  if (question.starter?.trim()) return question.starter;
  const lines = question.answer.split("\n");
  const target = lines.findIndex(
    (line) =>
      /\b(return|const|let|if|for|await|console|throw)\b|=/.test(line) &&
      !/^\s*(?:\/\/|\/\*)/.test(line),
  );
  if (target < 0) return question.starter;
  const indent = lines[target]?.match(/^\s*/)?.[0] ?? "";
  return lines
    .map((line, index) =>
      index === target ? `${indent}// ここを1行だけ補う` : line,
    )
    .join("\n");
}

function hasExecutableStarter(starter: string | undefined): boolean {
  return Boolean(
    starter
      ?.split("\n")
      .some((line) => {
        const trimmed = line.trim();
        return (
          trimmed !== "" &&
          !trimmed.startsWith("//") &&
          !trimmed.startsWith("#") &&
          !trimmed.startsWith("/*") &&
          !trimmed.startsWith("*") &&
          trimmed !== "*/"
        );
      }),
  );
}

function enrichQuestion(
  lesson: Lesson,
  question: Question,
  teachingIndex: number,
  teachingCount: number,
  slide: Slide | undefined,
): Question {
  const kind = question.exerciseKind ?? exerciseKind(teachingIndex, teachingCount);
  const scaffold =
    question.scaffoldLevel ?? scaffoldLevel(teachingIndex, teachingCount);
  const conceptIds = question.conceptIds ?? [
    `${lesson.track}:${slide?.diagram ?? lesson.chapter}`,
  ];
  const misconceptionId =
    question.misconceptionId ?? `${conceptIds[0]}:common-misread`;
  const misconceptionMap =
    question.misconceptionByAnswer ??
    misconceptionByAnswer(question, misconceptionId);
  const worked = kind === "worked";
  const projectText = [
    question.prompt,
    question.lead,
    question.code,
    question.starter,
    question.sample,
  ]
    .filter(Boolean)
    .join("\n");
  const projectRole: ProjectRole =
    question.projectRole ??
    (kind === "transfer"
      ? "transfer"
      : question.runtime === "dom" || PROJECT_TERMS.test(projectText)
        ? "build"
        : "drill");
  const generatedHints = [
    question.hint,
    question.steps?.[0]
      ? `最初の一歩だけ確認します。${question.steps[0]}`
      : undefined,
  ].filter((hint): hint is string => Boolean(hint));
  return {
    ...question,
    objectiveId:
      question.objectiveId ?? `${lesson.id}:objective-${teachingIndex + 1}`,
    conceptIds,
    variantId: question.variantId ?? `${lesson.id}:${question.id}:base`,
    scenario:
      question.scenario ??
      (projectRole === "build"
        ? `${PROJECT_BY_TRACK[lesson.track]}づくりの中で、「${slide?.title ?? lesson.title}」を使います`
        : projectRole === "transfer"
          ? `${PROJECT_BY_TRACK[lesson.track]}で学んだ判断を、別の入力へ応用します`
          : `基礎練習として、「${slide?.title ?? lesson.title}」だけを取り出して確かめます`),
    exerciseKind: kind,
    projectRole,
    scaffoldLevel: scaffold,
    lead: worked
      ? `直前のスライドにある完成例を手がかりに、同じ働きを自分で再現します。${question.lead ?? ""}`.trim()
      : question.lead,
    starter:
      worked && (question.kind === "code" || question.kind === "shell")
        ? question.starter
        : scaffold === "independent"
          ? hasExecutableStarter(question.starter)
            ? question.starter
            : undefined
          : fadedStarter(question, scaffold),
    steps:
      worked && (!question.steps || question.steps.length === 0)
        ? [
            "入力と最初の値を確認する",
            "コードを上から1行ずつ追う",
            "出力と理由を自分の言葉で確かめる",
          ]
        : question.steps,
    contrastGroup:
      question.contrastGroup ??
      (slide ? CONTRAST_GROUP[slide.diagram] : undefined),
    transferLevel: question.transferLevel ?? transferLevel(kind),
    misconceptionId,
    misconceptionByAnswer: misconceptionMap,
    feedbackByAnswer:
      question.feedbackByAnswer ??
      (misconceptionMap
        ? Object.fromEntries(
            Object.entries(misconceptionMap).map(([answer, diagnosis]) => [
              answer,
              `${diagnosis.feedback} 次は「${diagnosis.nextCheck}」を確認してください。`,
            ]),
          )
        : undefined),
    hints: question.hints ?? (
      scaffold === "independent"
        ? generatedHints.slice(0, 1)
        : generatedHints
    ),
  };
}

export function applyLearningDesign(lesson: Lesson): Lesson {
  const teachingSlides = lesson.slides.filter((slide) => !isSummary(slide));
  const teachingSlideIndexes = lesson.slides.flatMap((slide, index) =>
    isSummary(slide) ? [] : [index],
  );
  const teachingIndexBySlide = new Map<number, number>();
  let teachingIndex = 0;
  lesson.slides.forEach((slide, slideIndex) => {
    if (!isSummary(slide)) {
      teachingIndexBySlide.set(slideIndex, teachingIndex);
      teachingIndex += 1;
    }
  });

  const slides = lesson.slides.map((slide, slideIndex) => {
    if (isSummary(slide)) return slide;
    const index = teachingIndexBySlide.get(slideIndex) ?? 0;
    const objectiveId = `${lesson.id}:objective-${index + 1}`;
    return {
      ...slide,
      objectiveId: slide.objectiveId ?? objectiveId,
      conceptIds: slide.conceptIds ?? [`${lesson.track}:${slide.diagram}`],
      storyBeat: slide.storyBeat ?? storyBeat(index, teachingSlides.length),
      storyContext:
        slide.storyContext ??
        storyContextForSlide(lesson, teachingSlides, index),
    };
  });

  const questions = lesson.questions.map((question, index) => {
    const slideIndex =
      question.slide ??
      teachingSlideIndexes[index] ??
      lesson.slides.findIndex((slide) => !isSummary(slide));
    return enrichQuestion(
      lesson,
      { ...question, slide: slideIndex },
      index,
      lesson.questions.length,
      slides[slideIndex],
    );
  });

  const firstFocus = teachingSlides[0]?.title ?? lesson.title;

  return {
    ...lesson,
    story:
      lesson.story ??
      {
        project: PROJECT_BY_TRACK[lesson.track],
        incident: `${GOAL_BY_TRACK[lesson.track]} この講義のゴールは「${PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter]}」です。まずは「${firstFocus}」から入ります。`,
        outcome: lesson.summary,
      },
    objectives:
      lesson.objectives ??
      teachingSlides.map((slide, index) => ({
        id: `${lesson.id}:objective-${index + 1}`,
        label: slide.title,
        conceptIds: [`${lesson.track}:${slide.diagram}`],
        prerequisites:
          index === 0 ? [] : [`${lesson.id}:objective-${index}`],
      })),
    slides,
    questions,
  };
}

export function prequestionForLesson(lesson: Lesson): string {
  if (lesson.id === "js-run") {
    return "説明を見る前に、JavaScriptが命令をどの順で動かすか、一つだけ予想してください。";
  }
  const first =
    lesson.objectives?.[0]?.label ??
    firstTeachingSlide(lesson)?.title ??
    lesson.title;
  const lens = predictionLensForLesson(lesson);
  return `説明を見る前に、「${first}」について一つだけ予想してください。${predictionFocusPrompt(lens)}`;
}

export function predictionOptionsForLesson(lesson: Lesson): string[] {
  if (lesson.id === "js-run") {
    return [
      "JavaScriptは、書かれた命令を上から1行ずつ動かす",
      "JavaScriptは、すべての行を同時に動かす",
      "JavaScriptは、下の行から上へ向かって動かす",
      "まだ分からないので、説明で確かめたい",
    ];
  }
  const objective =
    lesson.objectives?.[0]?.label ??
    firstTeachingSlide(lesson)?.title ??
    lesson.title;
  return [
    ...predictionOptionStems(predictionLensForLesson(lesson), objective),
    "まだ分からないので、説明で確かめたい",
  ];
}

function exitRecallProbe(lens: PredictionLens): string {
  switch (lens) {
    case "order":
      return "命令や値は、どの順で決まり、どこへ結び付くかを思い出すと書きやすいです。";
    case "binding":
      return "名前はどこで作られ、どこまで見えるかを思い出すと書きやすいです。";
    case "value":
      return "値の種類や見え方が、どこでどう変わるかを思い出すと書きやすいです。";
    case "branch":
      return "条件が真／偽のとき、処理がどう分かれるかを思い出すと書きやすいです。";
    case "iteration":
      return "何回・どの順で処理が進み、いつ終わるかを思い出すと書きやすいです。";
    case "function":
      return "何が入り、何が戻り、呼ぶたびに何が新しくなるかを思い出すと書きやすいです。";
    case "object":
      return "まとめたデータの持ち方や、共有・取り出しの違いを思い出すと書きやすいです。";
    case "async":
      return "待っているあいだに何が進み、完了後に何が続くかを思い出すと書きやすいです。";
    case "dom":
      return "画面のどの要素を探し、どの操作のあとに何が変わるかを思い出すと書きやすいです。";
    case "module":
      return "何をどのファイルへ分け、どう読み込んでつなぐかを思い出すと書きやすいです。";
    case "type":
      return "どの約束が実行前に誤りを止め、何を検査するかを思い出すと書きやすいです。";
    case "node":
      return "どの入出力や起動手順が、動きや終了の仕方を変えるかを思い出すと書きやすいです。";
    case "sql":
      return "どの列・条件・並びが、結果の行を変えるかを思い出すと書きやすいです。";
    case "git":
      return "どの操作が履歴や共有の状態を変えるかを思い出すと書きやすいです。";
  }
}

export function exitRecallHintsForLesson(lesson: Lesson): string[] {
  const hints: string[] = [];
  const summary = lesson.summary.trim();
  if (summary) {
    hints.push(
      `この講義の要約は「${summary}」でした。その意味を、仕組みの説明として自分の言葉に言い換えてみてください。`,
    );
  }

  const topics = (() => {
    const fromObjectives =
      lesson.objectives?.map((item) => item.label).filter(Boolean) ?? [];
    if (fromObjectives.length > 0) return fromObjectives.slice(0, 3);
    return lesson.slides
      .filter((slide) => !isSummary(slide))
      .map((slide) => slide.title)
      .slice(0, 3);
  })();
  if (topics.length > 0) {
    hints.push(
      `触れた話題の手がかり: ${topics
        .map((topic) => `「${topic}」`)
        .join("、")}。このうち今思い出せるものを説明に入れてください。`,
    );
  }

  hints.push(exitRecallProbe(predictionLensForLesson(lesson)));

  const summarySlide = lesson.slides.find((slide) => isSummary(slide));
  const point = summarySlide?.points?.find((item) => item.trim());
  if (point) {
    hints.push(
      `もう一段の観点: 「${point}」。答えそのものを写すのではなく、なぜそう言えるかを書いてください。`,
    );
  }

  return [...new Set(hints)].slice(0, 3);
}

function transferConceptIds(
  lesson: Lesson,
  relatedLessons: Lesson[],
  availableConceptIds: string[],
  far: boolean,
): string[] {
  const relatedObjectives = relatedLessons.flatMap(
    (item) => item.objectives ?? [],
  );
  const farConceptSuffixes: Record<Track, string[]> = {
    js: ["map", "fn-box", "modules"],
    ts: ["unknown", "shape", "narrow"],
    node: ["node-fs", "node-http", "node-prod"],
    sql: ["sql-join", "sql-group", "sql-transaction"],
    github: ["git-branch", "git-remote", "git-pr"],
  };
  const farConceptIds = availableConceptIds.filter((conceptId) =>
    farConceptSuffixes[lesson.track].some((suffix) =>
      conceptId.endsWith(`:${suffix}`),
    ),
  );
  const nearConceptIds = [
    ...(relatedObjectives[0]?.conceptIds ?? []),
    ...(relatedObjectives.at(-1)?.conceptIds ?? []),
  ];
  return [
    ...new Set(
      far
        ? farConceptIds.length >= 2
          ? farConceptIds
          : availableConceptIds.slice(0, 3)
        : nearConceptIds.length > 0
          ? nearConceptIds
          : availableConceptIds.slice(0, 2),
    ),
  ].slice(0, 4);
}

function farTransferQuestion(
  lesson: Lesson,
  question: Question,
  conceptIds: string[],
): Question {
  const misconceptionId = `${lesson.id}:cumulative-transfer`;
  const base = {
    ...question,
    options: undefined,
    fragments: undefined,
    misconceptionByAnswer: undefined,
    feedbackByAnswer: undefined,
    exerciseKind: "transfer" as const,
    scaffoldLevel: "independent" as const,
    transferLevel: "far" as const,
    conceptIds,
    misconceptionId,
    code: TRACK_CAPSTONE_CODE[lesson.track],
    lead: "初めて見る長いコードから、複数の仕組みを組み合わせて完成させます。",
  };

  if (lesson.track === "js") {
    return {
      ...base,
      kind: "code",
      fileName: "script.js",
      prompt:
        "支払済み注文だけを取り出し、各注文の顧客名と合計金額を空白区切りで1行ずつ表示してください。",
      starter: `const orders = [
  { customer: "Aya", price: 1200, qty: 1, paid: true },
  { customer: "Ren", price: 800, qty: 2, paid: false },
  { customer: "Kai", price: 500, qty: 3, paid: true },
];
function total(order) {
  return order.price * order.qty;
}
// 支払済みだけを表示
`,
      sample: "Aya 1200\nKai 1500",
      answer: `const orders = [
  { customer: "Aya", price: 1200, qty: 1, paid: true },
  { customer: "Ren", price: 800, qty: 2, paid: false },
  { customer: "Kai", price: 500, qty: 3, paid: true },
];
function total(order) {
  return order.price * order.qty;
}
orders
  .filter((order) => order.paid)
  .forEach((order) => {
    console.log(order.customer, total(order));
  });`,
      explain:
        "配列の変換と副作用を分け、支払状態で絞ってから表示します。依存関係の再現は別途 lock から npm ci で行います。",
      steps: [
        "支払済みの注文だけを残す",
        "各注文の合計を求める",
        "顧客名と合計を1行ずつ表示する",
      ],
      hint: "元の配列を消し込まず、条件に合うものだけを取り出してから表示します。",
    };
  }

  if (lesson.track === "ts") {
    return {
      ...base,
      kind: "code",
      fileName: "script.ts",
      prompt:
        "API由来の quantity が文字列でも数値でも扱えるよう、数値へ変換できた行だけ合計して表示してください。",
      starter: `type OrderItem = { price: number; quantity: unknown };
const items: OrderItem[] = [
  { price: 1200, quantity: 1 },
  { price: 800, quantity: "2" },
  { price: 500, quantity: "x" },
];
// 変換できた quantity だけを掛けて合計を表示
`,
      sample: "2800",
      answer: `type OrderItem = { price: number; quantity: unknown };
const items: OrderItem[] = [
  { price: 1200, quantity: 1 },
  { price: 800, quantity: "2" },
  { price: 500, quantity: "x" },
];
let sum = 0;
for (const item of items) {
  const quantity = Number(item.quantity);
  if (Number.isFinite(quantity)) {
    sum += item.price * quantity;
  }
}
console.log(sum);`,
      typeTests: `const _ok: number = Number("2");`,
      explain:
        "型アサーションは値を変換しません。外部境界では値を検証し、変換できたものだけ計算に使います。",
      steps: [
        "quantity を数値へ変換する",
        "有限の数値だけを合計へ加える",
        "合計を表示する",
      ],
      hint: "as で型を言い切っても、実行時の文字列は数値になりません。",
    };
  }

  if (lesson.track === "node") {
    return {
      ...base,
      kind: "code",
      fileName: "server.js",
      runtime: "node",
      prompt:
        "読み取りに失敗したとき、標準エラーへ failed と出し、続けて status に 500 を表示する処理を完成させてください。",
      starter: `async function handle() {
  try {
    throw new Error("boom");
  } catch (error) {
    // 失敗を記録し、500を表示
  }
}
await handle();
`,
      sample: "failed\n500",
      answer: `async function handle() {
  try {
    throw new Error("boom");
  } catch (error) {
    console.error("failed");
    console.log(500);
  }
}
await handle();`,
      explain:
        "待ち時間のある処理の失敗は捕捉し、診断可能な標準ストリームへ残してからエラー応答へ進みます。",
      steps: [
        "失敗を標準エラーへ残す",
        "呼び出し側へ渡す状態として500を表示する",
      ],
      hint: "ログは一時ファイルだけへ閉じ込めず、標準出力・標準エラーへ出します。",
    };
  }

  if (lesson.track === "sql") {
    return {
      ...base,
      kind: "sql",
      prompt:
        "支払済み注文を顧客ごとに集計し、合計金額の大きい順で顧客名と合計を返す SQL を書いてください。",
      starter: "-- 顧客と注文を結び、支払済みだけを集計\n",
      answer: `SELECT c.name, SUM(o.total) AS paid_total
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.name
ORDER BY paid_total DESC;`,
      sqlSchema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL
);`,
      sqlSeed: `INSERT INTO customers (id, name) VALUES (1, 'Aya'), (2, 'Ren');
INSERT INTO orders (id, customer_id, total, status) VALUES
  (1, 1, 1200, 'paid'),
  (2, 1, 800, 'draft'),
  (3, 2, 1500, 'paid');`,
      sqlExpectedRows: [
        { name: "Ren", paid_total: 1500 },
        { name: "Aya", paid_total: 1200 },
      ],
      explain:
        "テーブルの関係はIDで結び、対象行を絞ってから集計します。表示順はORDER BYで明示します。",
      steps: [
        "顧客と注文をIDで結ぶ",
        "支払済みだけに絞る",
        "顧客ごとに合計し、大きい順に並べる",
      ],
      hint: "名前のあいまい一致ではなく、外部キーで結びます。",
    };
  }

  return {
    ...base,
    kind: "git",
    prompt:
      "注文絞り込み機能を feature/order-filter 枝で commit し、origin へ push してから Pull Request を作ってください。",
    starter: "# branch → commit → push → PR\n",
    answer: `git switch -c feature/order-filter
git add src/order-filter.js
git commit -m "注文状態の絞り込みを追加"
git push -u origin feature/order-filter
gh pr create --base main --head feature/order-filter`,
    gitInitialState: {
      branch: "main",
      remote: "origin",
      files: {
        "src/order-filter.js":
          "export function paidOnly(orders) {\n  return orders.filter((o) => o.paid);\n}\n",
      },
    },
    gitAssertions: [
      { kind: "branch", name: "feature/order-filter" },
      { kind: "pushed", branch: "feature/order-filter" },
      { kind: "pr-open", base: "main", head: "feature/order-filter" },
    ],
    explain:
      "branchへ意味のあるcommitを作り、remoteへ共有してPull Requestで差分を確認します。",
    steps: [
      "作業枝を作る",
      "変更をcommitする",
      "originへpushする",
      "Pull Requestを作る",
    ],
    hint: "mainへ直接置かず、レビューできる流れで共有します。",
  };
}

function transferQuestion(
  lesson: Lesson,
  question: Question,
  relatedLessons: Lesson[],
  availableConceptIds: string[],
  far: boolean,
): Question {
  const conceptIds = transferConceptIds(
    lesson,
    relatedLessons,
    availableConceptIds,
    far,
  );
  if (far) {
    return farTransferQuestion(lesson, question, conceptIds);
  }

  const framedLead = question.lead
    ? `この章で学んだ仕組みをつなげます。${question.lead}`
    : "この章で別々に学んだ仕組みを、1つの注文処理の中でつなぎます。";

  if (question.kind === "choice") {
    const misconceptionId = `${lesson.id}:cumulative-transfer`;
    const base: Question = {
      ...question,
      lead: framedLead,
      exerciseKind: "transfer",
      scaffoldLevel: "independent",
      transferLevel: "near",
      conceptIds,
      misconceptionId,
      fragments: undefined,
    };
    const diagnosis = misconceptionByAnswer(base, misconceptionId);
    return {
      ...base,
      misconceptionByAnswer: diagnosis,
      feedbackByAnswer: diagnosis
        ? Object.fromEntries(
            Object.entries(diagnosis).map(([option, item]) => [
              option,
              `${item.feedback} 次は「${item.nextCheck}」を確認してください。`,
            ]),
          )
        : undefined,
    };
  }

  return {
    ...question,
    lead: framedLead,
    options: undefined,
    fragments: undefined,
    misconceptionByAnswer: undefined,
    feedbackByAnswer: undefined,
    exerciseKind: "transfer",
    scaffoldLevel: "independent",
    transferLevel: "near",
    conceptIds,
    misconceptionId: `${lesson.id}:cumulative-transfer`,
  };
}

function storyTalkForLesson(
  previous: Lesson,
  lesson: Lesson,
  firstSlide: Slide,
): TalkLine[] {
  const milestone = PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter];
  return [
    {
      speaker: "beginner",
      text: `前の講義で「${previous.summary}」まで見ました。次は何をしますか？`,
    },
    {
      speaker: "engineer",
      text: `次は「${lesson.title}」です。前で学んだことを土台に、新しい仕組みを1つ足します。`,
    },
    {
      speaker: "beginner",
      text: "どこから始めますか？",
    },
    {
      speaker: "engineer",
      text: `まずは「${firstSlide.title}」からです。この講義のゴールは「${milestone}」です。`,
    },
  ];
}

export function applyCourseLearningDesign(source: Lesson[]): Lesson[] {
  const lessons = source.map(applyLearningDesign);
  const lastByChapter = new Map<string, Lesson>();
  const lastByTrack = new Map<Track, Lesson>();
  for (const lesson of lessons) {
    const chapterLast = lastByChapter.get(lesson.chapter);
    if (!chapterLast || chapterLast.order < lesson.order) {
      lastByChapter.set(lesson.chapter, lesson);
    }
    const trackLast = lastByTrack.get(lesson.track);
    if (!trackLast || trackLast.order < lesson.order) {
      lastByTrack.set(lesson.track, lesson);
    }
  }

  const connectedLessons = lessons.map((lesson) => {
    const previous = lessons
      .filter((candidate) => candidate.track === lesson.track && candidate.order < lesson.order)
      .sort((a, b) => b.order - a.order)[0];
    if (!previous || !lesson.story) return lesson;
    const firstFocus =
      lesson.objectives?.[0]?.label ??
      firstTeachingSlide(lesson)?.title ??
      lesson.title;
    const connectedIncident = `前は「${previous.summary}」まで見ました。今回は「${lesson.title}」です。まずは「${firstFocus}」の動きを予想してみましょう。`;
    const firstTeaching = lesson.slides.findIndex((slide) => !isSummary(slide));
    return {
      ...lesson,
      story: { ...lesson.story, incident: connectedIncident },
      slides: lesson.slides.map((slide, index) =>
        index === firstTeaching
          ? {
              ...slide,
              storyTalk: storyTalkForLesson(previous, lesson, slide),
            }
          : slide,
      ),
    };
  });

  return connectedLessons.map((lesson) => {
    const chapterLast = lastByChapter.get(lesson.chapter)?.id === lesson.id;
    const trackLast = lastByTrack.get(lesson.track)?.id === lesson.id;
    if (!chapterLast && !trackLast) return lesson;
    const allConcepts = [
      ...new Set(
        connectedLessons
          .filter((item) =>
            trackLast
              ? item.track === lesson.track
              : item.chapter === lesson.chapter,
          )
          .flatMap((item) => item.objectives?.flatMap((objective) => objective.conceptIds) ?? []),
      ),
    ];
    const relatedLessons = connectedLessons.filter((item) =>
      trackLast
        ? item.track === lesson.track
        : item.chapter === lesson.chapter,
    );
    const lastQuestionIndex = lesson.questions.length - 1;
    return {
      ...lesson,
      questions: lesson.questions.map((question, index) =>
        index === lastQuestionIndex
          ? {
              ...transferQuestion(
                lesson,
                question,
                relatedLessons,
                allConcepts,
                trackLast,
              ),
              scenario: trackLast
                ? `${PROJECT_BY_TRACK[lesson.track]}全体の引き継ぎコードを読み、未知のコードから完成させる`
                : `${lesson.chapter}で学んだ複数の方法をつなげる章末課題`,
              projectRole: "transfer",
            }
          : question,
      ),
    };
  });
}
