import type {
  ChapterId,
  ExerciseKind,
  Lesson,
  ProjectRole,
  Question,
  ScaffoldLevel,
  Slide,
  StoryBeat,
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

const INCIDENT_BY_TRACK: Record<Track, string> = {
  js: "店員が迷わず注文を処理できるよう、画面の動きを1つずつ組み立てます。",
  ts: "注文データの取り違えを実行前に見つけられるよう、コードへ約束を加えます。",
  node: "注文をファイル・通信・プロセスへ安全につなぎ、運用できる形へ育てます。",
  sql: "注文を正しく探して更新できるよう、データベースへ質問する手順を組み立てます。",
  github: "注文管理アプリの変更を失わず共有できるよう、履歴と共同作業の流れを整えます。",
};

const PROJECT_MILESTONE_BY_CHAPTER: Record<ChapterId, string> = {
  "js-syntax": "注文画面が読む値と、処理する順番を確かめる",
  "js-data": "1件の注文と注文一覧をデータとして組み立てる",
  "js-loop": "注文の状態に応じて処理を分け、一覧を順に扱う",
  "js-fn": "金額計算や表示名の手順を再利用できる関数にする",
  "js-callback": "注文ごとの処理と、操作された後の処理を関数として渡す",
  "js-array-fn": "未払い注文の抽出、合計、並べ替えを配列から作る",
  "js-modern": "欠けた注文データを安全に読み、元の一覧を壊さず更新する",
  "js-ref": "注文オブジェクトを意図せず共有・変更しない形へ直す",
  "js-class": "同じ決まりを持つ注文を同じ形から作る",
  "js-async": "注文APIの返事を待ちながら画面を止めない",
  "js-dom": "注文一覧を表示し、追加・支払更新・保存を操作できる画面にする",
  "js-module": "注文画面の表示、計算、通信をファイルへ分ける",
  "js-npm": "注文画面を同じ依存関係で再現できるようにする",
  "ts-intro": "注文番号・金額・状態へ型の約束を付ける",
  "ts-shape": "注文全体と表示用データの形を契約として表す",
  "ts-guard": "APIから来た不明な値を検査してから注文として扱う",
  "ts-generic": "注文一覧を扱う共通処理でも具体的な型を保つ",
  "ts-advanced": "注文の更新・表示用の型を元の契約から組み立てる",
  "node-runtime": "注文APIをサーバーマシン上で起動する",
  "node-fs": "注文データをJSONファイルから読み書きする",
  "node-http": "注文の取得・追加をHTTPの入口へつなぐ",
  "node-npm": "注文APIをどの環境でも同じ手順で起動する",
  "node-async": "複数の注文通信を止めずに処理する",
  "node-prod": "失敗を記録し、注文処理を途中で壊さず終了する",
  "js-challenge": "JavaScriptの仕組みを組み合わせ、未知の注文処理を解く",
  "ts-challenge": "型の道具を組み合わせ、注文データの制約を型で表す",
  "node-challenge": "Node.jsのAPIを組み合わせ、注文サービスの課題を解く",
  "sql-select": "注文テーブルから必要な列を読み出す",
  "sql-filter": "状態や金額を条件に必要な注文だけを選ぶ",
  "sql-sort": "注文を金額や日時で並べ、表示件数を絞る",
  "sql-group": "顧客や状態ごとの件数・合計を集計する",
  "sql-join": "注文と顧客をキーで結び、表示情報を完成させる",
  "sql-write": "注文の追加・支払更新・取消を安全に行う",
  "sql-transaction": "制約と取引で複数更新の整合性を守る",
  "github-repository": "注文管理アプリを履歴管理できる状態にする",
  "github-commit": "変更を選び、意味のある単位で記録する",
  "github-branch": "機能開発をmainから分けて安全に統合する",
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
      return `${PROJECT_BY_TRACK[lesson.track]}の工程「${PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter]}」を始めます。このスライドでは「${slide.title}」を使い、最初に確認する動きを一つに絞ります。`;
    case "prediction":
      return `最初の手がかり「${previous?.title ?? lesson.title}」を踏まえ、コードを動かす前に「${slide.title}」の結果を予想します。`;
    case "trace":
      return `「${previous?.title ?? lesson.title}」だけでは原因を説明し切れません。次に「${slide.title}」の値と実行位置を順番に追います。`;
    case "resolution":
      return `「${previous?.title ?? lesson.title}」まで追って原因が見えました。「${slide.title}」を判断基準にして修正します。`;
    case "transfer":
      return `修正後の注文処理を別の入力でも確かめます。「${slide.title}」で同じ仕組みを使えるか判断します。`;
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
        ? `${PROJECT_BY_TRACK[lesson.track]}を進める工程で「${slide?.title ?? lesson.title}」を使います`
        : projectRole === "transfer"
          ? `${PROJECT_BY_TRACK[lesson.track]}で学んだ判断を別の入力へ応用します`
          : `基礎練習として「${slide?.title ?? lesson.title}」だけを取り出して確かめます`),
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
          ? undefined
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
      lesson.slides.findIndex((slide) => !isSummary(slide));
    return enrichQuestion(
      lesson,
      question,
      index,
      lesson.questions.length,
      slides[slideIndex],
    );
  });

  return {
    ...lesson,
    story:
      lesson.story ??
      {
        project: PROJECT_BY_TRACK[lesson.track],
        incident: `${INCIDENT_BY_TRACK[lesson.track]} 今回は「${PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter]}」のために「${lesson.title}」を使います。`,
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
  const first = lesson.objectives?.[0]?.label ?? lesson.title;
  return `${lesson.story?.project ?? PROJECT_BY_TRACK[lesson.track]}の工程「${PROJECT_MILESTONE_BY_CHAPTER[lesson.chapter]}」で「${lesson.title}」が必要になりました。説明を見る前に、最初の目標「${first}」がどの値や実行順を変えるか、一つだけ予想してください。`;
}

function orderingQuestionIndex(questions: Question[]): number {
  for (let index = questions.length - 2; index >= 0; index -= 1) {
    const question = questions[index];
    const lineCount = question?.answer.trim().split("\n").length ?? 0;
    if (
      question?.kind === "code" &&
      question.scaffoldLevel === "faded" &&
      lineCount >= 2 &&
      lineCount <= 8
    ) {
      return index;
    }
  }
  return -1;
}

function asOrderingQuestion(question: Question): Question {
  const lines = question.answer.trim().split("\n");
  const offset = Math.max(1, Math.floor(lines.length / 2));
  const fragments = [...lines.slice(offset), ...lines.slice(0, offset)];
  return {
    ...question,
    kind: "order",
    prompt: `処理が正しい順で動くように、${lines.length}個のコード断片を並べてください。${question.prompt}`,
    starter: undefined,
    fragments,
    exerciseKind: "faded",
    scaffoldLevel: "faded",
  };
}

function transferQuestion(
  lesson: Lesson,
  question: Question,
  relatedLessons: Lesson[],
  availableConceptIds: string[],
  far: boolean,
): Question {
  const misconceptionId = `${lesson.id}:cumulative-transfer`;
  const relatedObjectives = relatedLessons.flatMap(
    (item) => item.objectives ?? [],
  );
  let prompt: string;
  let options: string[];
  let answer: string;
  let explain: string;
  let code = relatedLessons
    .flatMap((item) => item.slides)
    .map((slide) => slide.code)
    .filter((value): value is string => Boolean(value))
    .slice(0, 3)
    .join("\n\n// 次の処理\n");

  if (far && lesson.track === "js") {
    code = TRACK_CAPSTONE_CODE.js;
    prompt =
      "引き継いだ注文管理コードを読みます。支払済み注文だけを集計し、CIでも同じ依存関係を再現する組み合わせを選んでください。";
    options = [
      "paidOrdersで絞ってから集計し、CIではnpm ciを使う",
      "元のordersを直接削除しながら集計し、CIではnpm updateを使う",
      "forEachの戻り値を新配列として集計し、lockを削除する",
      "未払いを含む全件を集計し、node_modulesを保存して配布する",
    ];
    answer = options[0];
    explain =
      "配列の変換と副作用を分け、支払状態で絞ってから集計します。依存関係はlockからnpm ciで再現します。";
  } else if (far && lesson.track === "ts") {
    code = TRACK_CAPSTONE_CODE.ts;
    prompt =
      "API由来のquantityが文字列の可能性を残すコードです。型だけを言い切らず、実行時にも安全に合計する修正を選んでください。";
    options = [
      "unknownの形とquantityの型を検証し、数値へ変換できた値だけOrderとして扱う",
      "as Orderを二重に書き、文字列のquantityをnumberへ自動変換する",
      "OrderItem.quantityをanyへ変え、すべての演算を許可する",
      "型注釈を削除すれば実行時に自動検証される",
    ];
    answer = options[0];
    explain =
      "型アサーションは値を変換しません。外部境界ではunknownとして形を検証し、変換後の値へ型を付けます。";
  } else if (far && lesson.track === "node") {
    code = TRACK_CAPSTONE_CODE.node;
    prompt =
      "複数コンテナで動く注文APIを安全に運用します。非同期I/O、ログ収集、終了処理をまとめた判断を選んでください。";
    options = [
      "I/Oはawaitで失敗を捕捉し、ログはstdout/stderrへ出し、SIGTERMでserver.closeを始める",
      "同期I/Oでイベントループを止め、ログは/tmpだけへ保存し、SIGKILLで必ず終了する",
      "Promiseの失敗を無視し、ログはlocalStorageへ出し、終了処理を省く",
      "すべての要求を同じ配列へ無制限にため、終了時に新規受付を続ける",
    ];
    answer = options[0];
    explain =
      "待ち時間は非同期処理へ渡し、診断可能な標準ストリームへ記録し、通常終了要求では新規受付を止めて処理中の要求を待ちます。";
  } else if (far && lesson.track === "sql") {
    code = TRACK_CAPSTONE_CODE.sql;
    prompt =
      "支払済み注文を顧客ごとに集計します。表を安全に結び、集計結果を大きい順で表示する考え方を選んでください。";
    options = [
      "顧客IDでJOINし、WHEREで支払済みに絞ってからGROUP BYし、合計でORDER BYする",
      "名前の一部が似ている行を結び、全注文を集計して順序を指定しない",
      "JOINせず全行を掛け合わせ、重複した合計をそのまま使う",
      "UPDATEで元データを書き換えてから画面用の合計を作る",
    ];
    answer = options[0];
    explain =
      "テーブルの関係はIDで結び、対象行を絞ってから集計します。表示順はORDER BYで明示します。";
  } else if (far && lesson.track === "github") {
    code = TRACK_CAPSTONE_CODE.github;
    prompt =
      "注文絞り込み機能をmainへ直接置かず、レビューして共有する流れを選んでください。";
    options = [
      "機能branchでcommitし、originへpushしてPull Requestを作る",
      "mainの履歴を削除し、作業ファイルだけをチャットへ貼る",
      "未commitのままPull Requestを作り、差分確認を省く",
      "別機能の変更も同じcommitへ混ぜ、説明なしでmergeする",
    ];
    answer = options[0];
    explain =
      "branchへ意味のあるcommitを作り、remoteへ共有してPull Requestで差分を確認します。";
  } else {
    const objectives = relatedObjectives.map((objective) => objective.label);
    const first = objectives[0] ?? "入力の状態";
    const last = objectives.at(-1) ?? "出力の状態";
    prompt = `章末の注文処理を調査します。「${first}」と「${last}」を両方使って原因を切り分ける手順を選んでください。`;
    options = [
      `最初に「${first}」の値と実行順を確認し、その結果を「${last}」の判断へ渡す`,
      `「${last}」だけを見て、「${first}」の入力状態は確認しない`,
      `どちらも自動で正しくなる前提にして、実行結果を確認しない`,
      `二つの仕組みを同じものとして扱い、名前だけを書き換える`,
    ];
    answer = options[0];
    explain = `章末課題では片方の用語を思い出すだけでなく、「${first}」の結果が「${last}」へどう影響するかを順に追います。`;
  }

  const optionOffset = lesson.order % options.length;
  options = [...options.slice(optionOffset), ...options.slice(0, optionOffset)];

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
  const measuredConceptIds = [
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

  const base: Question = {
    ...question,
    prompt,
    lead: far
      ? "初めて見る長いコードから、複数の仕組みを組み合わせて判断します。"
      : "この章で別々に学んだ仕組みを、1つの注文処理の中でつなぎます。",
    kind: "choice",
    options,
    starter: undefined,
    fragments: undefined,
    answer,
    explain,
    code,
    exerciseKind: "transfer",
    scaffoldLevel: "independent",
    transferLevel: far ? "far" : "near",
    conceptIds: measuredConceptIds,
    misconceptionId,
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
    const connectedIncident = `前の講義で「${previous.summary}」まで確認しました。その仕組みを使ったところ、次は「${lesson.title}」が必要になりました。${lesson.story.incident}`;
    return {
      ...lesson,
      story: { ...lesson.story, incident: connectedIncident },
      slides: lesson.slides.map((slide, index) =>
        index === 0 && slide.storyContext
          ? {
              ...slide,
              storyContext: `${connectedIncident} ${slide.storyContext}`,
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
    const orderQuestionIndex = chapterLast
      ? orderingQuestionIndex(lesson.questions)
      : -1;
    return {
      ...lesson,
      questions: lesson.questions.map((question, index) =>
        index === orderQuestionIndex
          ? asOrderingQuestion(question)
          : index === lastQuestionIndex
          ? {
              ...transferQuestion(
                lesson,
                question,
                relatedLessons,
                allConcepts,
                trackLast,
              ),
              scenario: trackLast
                ? `${PROJECT_BY_TRACK[lesson.track]}全体の引き継ぎコードを読み、未知のコードから判断する`
                : `${lesson.chapter}で学んだ複数の方法を区別して判断する章末課題`,
              projectRole: "transfer",
            }
          : question,
      ),
    };
  });
}
