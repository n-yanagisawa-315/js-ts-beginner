import type {
  BehaviorCase,
  DiagramId,
  Lesson,
  Question,
} from "@/lib/course/types";

type ChallengeQuestion = Omit<
  Question,
  | "kind"
  | "runtime"
  | "hints"
  | "reviewVariants"
  | "misconceptionId"
  | "misconceptionByAnswer"
> & {
  hints: [string, string, string];
  behaviorCases?: BehaviorCase[];
  typeTests?: string;
  misconception: {
    id: string;
    wrong: string;
    feedback: string;
    nextCheck: string;
  };
};

function challengeQuestion(question: ChallengeQuestion): Question {
  const { misconception, ...rest } = question;
  return {
    ...rest,
    kind: "code",
    runtime: question.typeTests ? undefined : "node",
    reviewVariants: [
      {
        id: `${question.id}-review-readable`,
        prompt: "チームレビューで、意図が名前と処理順から読めるか確認してください。",
      },
      {
        id: `${question.id}-review-edge`,
        prompt: "注文が0件のケースでも契約を守るか確認してください。",
      },
    ],
    misconceptionId: misconception.id,
    feedbackByAnswer: {
      [misconception.wrong]: misconception.feedback,
    },
    misconceptionByAnswer: {
      [misconception.wrong]: {
        id: misconception.id,
        feedback: misconception.feedback,
        nextCheck: misconception.nextCheck,
      },
    },
  };
}

function slides(
  title: string,
  lead: string,
  diagram: DiagramId,
  code: string,
  watch: string,
) {
  return [
    {
      title: `${title}：契約を読む`,
      lead,
      points: [
        "入力と出力を先に言葉で固定する",
        "通常ケースだけでなく、空・端・失敗も契約に含める",
        "注文管理で壊してはいけない情報を見つける",
      ],
      diagram,
      code,
      storyBeat: "problem" as const,
    },
    {
      title: `${title}：小さく追跡する`,
      lead: "最小の注文データを1件ずつ追い、どの値がいつ作られるかを確認します。暗記した構文ではなく、データの移動を根拠にします。",
      points: [
        "境界の直前・境界・直後を並べる",
        "元データと新しいデータの参照を区別する",
        "同期処理と待機後の処理を分ける",
      ],
      diagram,
      code,
      storyBeat: "trace" as const,
    },
    {
      title: `${title}：別の注文へ移す`,
      lead: "同じ考え方を、件数や状態が異なる注文にも適用します。解答例と文字が同じかではなく、契約を満たすかでレビューします。",
      points: [
        "0件でも成立するか",
        "入力を書き換えていないか",
        "失敗時にも処理が完了するか",
      ],
      watch,
      diagram,
      code,
      storyBeat: "transfer" as const,
    },
  ];
}

const jsBoundaryQuestions = [
  challengeQuestion({
    id: "js-challenge-boundary-free-shipping",
    prompt: "注文合計が5,000円以上なら送料無料にする isFreeShipping(total) を実装してください。",
    starter: `function isFreeShipping(total) {\n  // ここを実装\n}`,
    answer: `function isFreeShipping(total) {\n  return total >= 5000;\n}`,
    explain: "「以上」は境界値そのものを含むため >= を使います。",
    hints: ["境界は5,000円です。", "4,999・5,000・5,001を並べます。", "「以上」は >= です。"],
    behaviorCases: [
      { args: [4999], expected: false },
      { args: [5000], expected: true },
      { args: [5001], expected: true },
    ],
    misconception: {
      id: "js-boundary-exclusive",
      wrong: `function isFreeShipping(total) {\n  return total > 5000;\n}`,
      feedback: "5,000円ちょうどが除外されています。「以上」は境界を含みます。",
      nextCheck: "引数5,000でtrueになるか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-boundary-stock",
    prompt: "在庫が注文数以上なら受付可能にする canAccept(stock, quantity) を実装してください。",
    starter: `function canAccept(stock, quantity) {\n  // ここを実装\n}`,
    answer: `function canAccept(stock, quantity) {\n  return quantity > 0 && stock >= quantity;\n}`,
    explain: "在庫同数は受付可能ですが、0個注文は受け付けません。",
    hints: ["条件は2つあります。", "注文数は正、かつ在庫以上ではなく在庫以内です。", "quantity > 0 && stock >= quantity とします。"],
    behaviorCases: [
      { args: [3, 3], expected: true },
      { args: [2, 3], expected: false },
      { args: [3, 0], expected: false },
    ],
    misconception: {
      id: "js-stock-zero-valid",
      wrong: `function canAccept(stock, quantity) {\n  return stock >= quantity;\n}`,
      feedback: "0個の注文まで受付可能になります。数量の下限も契約の一部です。",
      nextCheck: "canAccept(3, 0)を確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-boundary-page",
    prompt: "注文件数から1ページ10件の最終ページ番号を返す lastPage(count) を実装してください。0件は0です。",
    starter: `function lastPage(count) {\n  // ここを実装\n}`,
    answer: `function lastPage(count) {\n  return count === 0 ? 0 : Math.ceil(count / 10);\n}`,
    explain: "10の倍数と0件を分けると、端の仕様が明確になります。",
    hints: ["0件を先に扱います。", "11件は2ページです。", "正の件数にはMath.ceilを使います。"],
    behaviorCases: [
      { args: [0], expected: 0 },
      { args: [10], expected: 1 },
      { args: [11], expected: 2 },
    ],
    misconception: {
      id: "js-page-floor",
      wrong: `function lastPage(count) {\n  return Math.floor(count / 10);\n}`,
      feedback: "端数のある最後のページが失われます。11件目にも表示先が必要です。",
      nextCheck: "11件で2になるか確認します。",
    },
  }),
];

const jsImmutableQuestions = [
  challengeQuestion({
    id: "js-challenge-immutable-status",
    prompt: "注文orderを変更せず、statusだけを更新した新しい注文を返す markPaid(order) を実装してください。",
    starter: `function markPaid(order) {\n  // ここを実装\n}`,
    answer: `function markPaid(order) {\n  return { ...order, status: "paid" };\n}`,
    explain: "スプレッドで元の項目をコピーし、後ろのstatusで上書きします。",
    hints: ["order.statusへ代入しません。", "新しいオブジェクトを返します。", "{ ...order, status: \"paid\" }を使います。"],
    behaviorCases: [
      { args: [{ id: "o1", status: "new" }], expected: { id: "o1", status: "paid" } },
      { args: [{ id: "o2", status: "held", total: 800 }], expected: { id: "o2", status: "paid", total: 800 } },
    ],
    misconception: {
      id: "js-mutate-order",
      wrong: `function markPaid(order) {\n  order.status = "paid";\n  return order;\n}`,
      feedback: "受け取った注文そのものを書き換えています。変更前を参照する画面まで変わります。",
      nextCheck: "戻り値と引数が別オブジェクトか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-immutable-line",
    prompt: "指定idの商品だけquantityを1増やした新しい配列を返す addOne(lines, id) を実装してください。",
    starter: `function addOne(lines, id) {\n  // ここを実装\n}`,
    answer: `function addOne(lines, id) {\n  return lines.map((line) =>\n    line.id === id ? { ...line, quantity: line.quantity + 1 } : line\n  );\n}`,
    explain: "mapで新しい配列を作り、対象要素だけ新しいオブジェクトにします。",
    hints: ["配列にはmapを使います。", "idが一致する要素だけコピーします。", "quantityはline.quantity + 1です。"],
    behaviorCases: [
      { args: [[{ id: "a", quantity: 1 }, { id: "b", quantity: 2 }], "a"], expected: [{ id: "a", quantity: 2 }, { id: "b", quantity: 2 }] },
      { args: [[], "a"], expected: [] },
    ],
    misconception: {
      id: "js-map-missing-return",
      wrong: `function addOne(lines, id) {\n  lines.map((line) => { line.quantity += 1; });\n  return lines;\n}`,
      feedback: "元要素を変更し、idも無視しています。mapの戻り値を新しい配列として返します。",
      nextCheck: "対象外商品の数量と元配列が維持されるか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-immutable-remove",
    prompt: "指定id以外の注文だけを持つ新しい配列を返す removeOrder(orders, id) を実装してください。",
    starter: `function removeOrder(orders, id) {\n  // ここを実装\n}`,
    answer: `function removeOrder(orders, id) {\n  return orders.filter((order) => order.id !== id);\n}`,
    explain: "filterは条件を満たす要素から新しい配列を作ります。",
    hints: ["削除操作ではなく選別と考えます。", "残したい注文の条件を書きます。", "order.id !== idです。"],
    behaviorCases: [
      { args: [[{ id: "o1" }, { id: "o2" }], "o1"], expected: [{ id: "o2" }] },
      { args: [[], "o1"], expected: [] },
    ],
    misconception: {
      id: "js-splice-mutation",
      wrong: `function removeOrder(orders, id) {\n  orders.splice(orders.findIndex((order) => order.id === id), 1);\n  return orders;\n}`,
      feedback: "spliceは元配列を変更し、見つからないと末尾を消す危険もあります。",
      nextCheck: "存在しないidと元配列の両方を確認します。",
    },
  }),
];

const jsClosureQuestions = [
  challengeQuestion({
    id: "js-challenge-closure-number",
    prompt: "呼ぶたびに注文番号を1増やして返す createOrderNumber(start) を実装してください。",
    starter: `function createOrderNumber(start) {\n  // 関数を返す\n}`,
    answer: `function createOrderNumber(start) {\n  let current = start;\n  return () => {\n    current += 1;\n    return current;\n  };\n}`,
    explain: "返した関数が外側のcurrentを保持するクロージャです。",
    hints: ["startをローカル変数へ保存します。", "戻り値は関数です。", "内側の関数でcurrentを増やして返します。"],
    behaviorCases: [
      { args: [100], expected: [101, 102] },
      { args: [0], expected: [1, 2] },
    ],
    misconception: {
      id: "js-closure-reset",
      wrong: `function createOrderNumber(start) {\n  return () => start + 1;\n}`,
      feedback: "毎回同じ値を計算するため、呼び出し間の状態が残りません。",
      nextCheck: "同じ生成済み関数を2回呼び、値が変わるか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-closure-discount",
    prompt: "割引率を覚え、合計へ適用する関数を返す createDiscount(rate) を実装してください。",
    starter: `function createDiscount(rate) {\n  // ここを実装\n}`,
    answer: `function createDiscount(rate) {\n  return (total) => Math.round(total * (1 - rate));\n}`,
    explain: "内側の関数は生成時のrateを保持し、注文ごとのtotalだけ受け取ります。",
    hints: ["返すのはtotalを受け取る関数です。", "rateは外側から参照できます。", "total * (1 - rate)を丸めます。"],
    behaviorCases: [
      { args: [0.1, 1000], expected: 900 },
      { args: [0.25, 800], expected: 600 },
    ],
    misconception: {
      id: "js-closure-rate-argument",
      wrong: `function createDiscount(rate) {\n  return (rate, total) => Math.round(total * (1 - rate));\n}`,
      feedback: "内側でrateを再定義し、生成時の割引率を隠しています。",
      nextCheck: "生成後の関数がtotalだけで呼べるか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-closure-cart",
    prompt: "追加された金額の累計を返すaddを持つ createCartTotal() を実装してください。",
    starter: `function createCartTotal() {\n  // { add } を返す\n}`,
    answer: `function createCartTotal() {\n  let total = 0;\n  return {\n    add(amount) {\n      total += amount;\n      return total;\n    },\n  };\n}`,
    explain: "totalは外から直接変更できず、addだけが更新できます。",
    hints: ["totalはcreateCartTotalの中に置きます。", "addはamountを受け取ります。", "totalへ加算して累計を返します。"],
    behaviorCases: [
      { args: [[300, 200]], expected: [300, 500] },
      { args: [[]], expected: [] },
    ],
    misconception: {
      id: "js-closure-global-total",
      wrong: `let total = 0;\nfunction createCartTotal() {\n  return { add(amount) { return total += amount; } };\n}`,
      feedback: "全カートが同じグローバル変数を共有し、注文ごとの状態を分離できません。",
      nextCheck: "カートを2つ生成し、片方の追加が他方へ影響しないか確認します。",
    },
  }),
];

const jsAsyncQuestions = [
  challengeQuestion({
    id: "js-challenge-async-sequence",
    prompt: "注文取得後に保存し、最後に保存済み注文を返す syncOrder(id) をasync/awaitで実装してください。",
    starter: `async function syncOrder(id) {\n  // fetchOrderとsaveOrderを順に待つ\n}`,
    answer: `async function syncOrder(id) {\n  const order = await fetchOrder(id);\n  await saveOrder(order);\n  return order;\n}`,
    explain: "後続処理が前の結果を必要とするため、取得と保存を順にawaitします。",
    hints: ["fetchOrderの結果が保存に必要です。", "両方のPromiseをawaitします。", "最後にorderを返します。"],
    behaviorCases: [{ args: ["o1"], expected: { id: "o1" } }],
    misconception: {
      id: "js-async-missing-await",
      wrong: `async function syncOrder(id) {\n  const order = fetchOrder(id);\n  saveOrder(order);\n  return order;\n}`,
      feedback: "Promise自体を注文として保存しています。必要な値になるまでawaitします。",
      nextCheck: "saveOrderへ渡る値がPromiseではなく注文か確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-async-parallel",
    prompt: "互いに独立した在庫と配送枠を並行取得する loadCheckout(id) を実装してください。",
    starter: `async function loadCheckout(id) {\n  // getStockとgetSlotsを並行実行\n}`,
    answer: `async function loadCheckout(id) {\n  const [stock, slots] = await Promise.all([\n    getStock(id),\n    getSlots(id),\n  ]);\n  return { stock, slots };\n}`,
    explain: "依存しないI/OはPromise.allへ同時に渡せます。",
    hints: ["2つの取得は互いの結果を使いません。", "Promise.allは配列を受け取ります。", "分割代入でstockとslotsを受けます。"],
    behaviorCases: [{ args: ["sku-1"], expected: { stock: 3, slots: ["午前"] } }],
    misconception: {
      id: "js-async-unneeded-sequence",
      wrong: `async function loadCheckout(id) {\n  const stock = await getStock(id);\n  const slots = await getSlots(id);\n  return { stock, slots };\n}`,
      feedback: "結果は正しくても独立した待機を直列化しています。同時に開始できます。",
      nextCheck: "片方の結果をもう片方の引数に使っていないか確認します。",
    },
  }),
  challengeQuestion({
    id: "js-challenge-async-finally",
    prompt: "送信の成功・失敗にかかわらずローディングを止める submitOrder(order) を実装してください。",
    starter: `async function submitOrder(order) {\n  setLoading(true);\n  // sendOrderを実行し、必ず停止\n}`,
    answer: `async function submitOrder(order) {\n  setLoading(true);\n  try {\n    return await sendOrder(order);\n  } finally {\n    setLoading(false);\n  }\n}`,
    explain: "finallyは成功時にも例外時にも実行されます。",
    hints: ["停止処理は必ず必要です。", "try/finallyを使います。", "sendOrderのreturnをawaitしてからfinallyへ進みます。"],
    behaviorCases: [
      { args: [{ id: "o1" }], expectedLogs: ["true", "false"] },
      { args: [{ id: "fail" }], expectedLogs: ["true", "false"] },
    ],
    misconception: {
      id: "js-async-loading-success-only",
      wrong: `async function submitOrder(order) {\n  setLoading(true);\n  const result = await sendOrder(order);\n  setLoading(false);\n  return result;\n}`,
      feedback: "送信が失敗すると停止行へ到達せず、ローディングが残ります。",
      nextCheck: "sendOrderがrejectした経路を追います。",
    },
  }),
];

const tsPickReadonlyQuestions = [
  challengeQuestion({
    id: "ts-challenge-pick-summary",
    prompt: "Orderからidとtotalだけを選ぶ独自型 OrderSummary<T> をkeyofとmapped typeで実装してください。",
    starter: `type OrderSummary<T extends { id: unknown; total: unknown }> = unknown;`,
    answer: `type OrderSummary<T extends { id: unknown; total: unknown }> = {\n  [K in "id" | "total"]: T[K];\n};`,
    explain: "必要なキーだけを反復し、元型Tの対応する値型を取り出します。",
    hints: ["キーはid | totalです。", "mapped typeでKを反復します。", "値型はT[K]です。"],
    typeTests: `type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\ntype Expect<T extends true> = T;\ntype Order = { id: string; total: number; status: "new" };\ntype Case = Expect<Equal<OrderSummary<Order>, { id: string; total: number }>>;`,
    misconception: {
      id: "ts-summary-hardcode-values",
      wrong: `type OrderSummary<T> = { id: string; total: number };`,
      feedback: "元のOrderの値型を引き継がず、Tを使っていません。",
      nextCheck: "idが数値の注文型でも対応できるか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-readonly-order",
    prompt: "注文の全プロパティをreadonlyにする独自型 FrozenOrder<T> を実装してください。",
    starter: `type FrozenOrder<T> = unknown;`,
    answer: `type FrozenOrder<T> = {\n  readonly [K in keyof T]: T[K];\n};`,
    explain: "keyof Tの各キーへreadonly修飾子を付けます。",
    hints: ["Tのキー全体を列挙します。", "keyof Tを使います。", "readonly [K in keyof T]と書きます。"],
    typeTests: `type Order = { id: string; total: number };\ndeclare const order: FrozenOrder<Order>;\n// @ts-expect-error readonlyのため変更不可\norder.total = 2000;\nconst total: number = order.total;`,
    misconception: {
      id: "ts-readonly-object-wrapper",
      wrong: `type FrozenOrder<T> = { readonly value: T };`,
      feedback: "元の注文と異なるvalueラッパー型になっています。各プロパティへ修飾を付けます。",
      nextCheck: "FrozenOrder<Order>にidが直接存在するか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-optional-patch",
    prompt: "id以外の注文項目を任意指定できる更新型 OrderPatch<T> を実装してください。",
    starter: `type OrderPatch<T extends { id: unknown }> = unknown;`,
    answer: `type OrderPatch<T extends { id: unknown }> = {\n  [K in Exclude<keyof T, "id">]?: T[K];\n};`,
    explain: "idをキー集合から除外し、残りを任意プロパティにします。",
    hints: ["idは更新対象から除きます。", "Exclude<keyof T, \"id\">を作ります。", "mapped typeのキーへ?を付けます。"],
    typeTests: `type Order = { id: string; total: number; note: string };\nconst ok: OrderPatch<Order> = { note: "玄関前" };\n// @ts-expect-error idは更新不可\nconst ng: OrderPatch<Order> = { id: "o2" };`,
    misconception: {
      id: "ts-patch-id-optional",
      wrong: `type OrderPatch<T> = { [K in keyof T]?: T[K] };`,
      feedback: "idまで更新候補に含まれています。識別子はキー集合から除外します。",
      nextCheck: "{ id: \"o2\" }が型エラーになるか確認します。",
    },
  }),
];

const tsUnionQuestions = [
  challengeQuestion({
    id: "ts-challenge-union-label",
    prompt: "kindで判別する注文結果OrderResultから日本語メッセージを返す resultLabel を実装してください。",
    starter: `type OrderResult =\n  | { kind: "success"; orderId: string }\n  | { kind: "failure"; reason: string };\n\nfunction resultLabel(result: OrderResult): string {\n  // ここを実装\n}`,
    answer: `type OrderResult =\n  | { kind: "success"; orderId: string }\n  | { kind: "failure"; reason: string };\n\nfunction resultLabel(result: OrderResult): string {\n  return result.kind === "success"\n    ? \`受付: \${result.orderId}\`\n    : \`失敗: \${result.reason}\`;\n}`,
    explain: "共通のkindを調べると、各分岐固有のプロパティへ安全にアクセスできます。",
    hints: ["共通プロパティkindを見ます。", "success分岐ではorderIdがあります。", "failure分岐ではreasonがあります。"],
    typeTests: `const a = resultLabel({ kind: "success", orderId: "o1" });\nconst b = resultLabel({ kind: "failure", reason: "在庫切れ" });\n// @ts-expect-error successにreasonはない\nresultLabel({ kind: "success", reason: "x" });`,
    misconception: {
      id: "ts-union-property-without-narrow",
      wrong: `function resultLabel(result: OrderResult): string {\n  return result.orderId;\n}`,
      feedback: "failureにはorderIdがありません。kindで型を絞ってから固有項目を使います。",
      nextCheck: "failureを渡した経路を確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-union-exhaustive",
    prompt: "new/paid/shippedを扱い、追加状態の処理漏れを検出する statusLabel をneverで実装してください。",
    starter: `type Status = "new" | "paid" | "shipped";\nfunction statusLabel(status: Status): string {\n  // switchとneverを使う\n}`,
    answer: `type Status = "new" | "paid" | "shipped";\nfunction statusLabel(status: Status): string {\n  switch (status) {\n    case "new": return "受付";\n    case "paid": return "支払済み";\n    case "shipped": return "発送済み";\n    default: {\n      const unreachable: never = status;\n      return unreachable;\n    }\n  }\n}`,
    explain: "全分岐後のstatusがneverになることで、状態追加時の漏れを型エラーにできます。",
    hints: ["switchで3状態を列挙します。", "defaultへ到達する型を考えます。", "const unreachable: never = statusとします。"],
    typeTests: `const labels: string[] = [statusLabel("new"), statusLabel("paid"), statusLabel("shipped")];\n// @ts-expect-error 未定義状態\nstatusLabel("cancelled");`,
    misconception: {
      id: "ts-union-default-silent",
      wrong: `function statusLabel(status: Status): string {\n  default: return "";\n}`,
      feedback: "空文字のdefaultでは状態追加時の漏れを型が知らせません。neverへ代入します。",
      nextCheck: "Statusへcancelledを追加したときコンパイルが失敗するか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-union-payment",
    prompt: "cardとcashで必要項目が異なる支払方法Paymentを定義してください。",
    starter: `type Payment = unknown;`,
    answer: `type Payment =\n  | { method: "card"; last4: string }\n  | { method: "cash"; changeFor?: number };`,
    explain: "methodを判別子にすると、方法と詳細項目の不正な組合せを防げます。",
    hints: ["2つのオブジェクト型のunionです。", "判別子はmethodです。", "cashのchangeForだけ任意です。"],
    typeTests: `const card: Payment = { method: "card", last4: "1234" };\nconst cash: Payment = { method: "cash" };\n// @ts-expect-error cardにはlast4が必要\nconst broken: Payment = { method: "card" };`,
    misconception: {
      id: "ts-union-all-optional",
      wrong: `type Payment = { method: "card" | "cash"; last4?: string; changeFor?: number };`,
      feedback: "全項目を任意にするとcardなのにlast4がない組合せを許します。",
      nextCheck: "{ method: \"card\" }が拒否されるか確認します。",
    },
  }),
];

const tsGenericQuestions = [
  challengeQuestion({
    id: "ts-challenge-generic-first",
    prompt: "注文配列の先頭を元の要素型のまま返す firstOrder<T> を実装してください。",
    starter: `function firstOrder<T>(orders: readonly T[]): T | undefined {\n  // ここを実装\n}`,
    answer: `function firstOrder<T>(orders: readonly T[]): T | undefined {\n  return orders[0];\n}`,
    explain: "Tが入力要素と戻り値を結び、空配列はundefinedになります。",
    hints: ["配列要素の型をTにします。", "空配列の可能性を残します。", "戻り値はorders[0]です。"],
    typeTests: `const found = firstOrder([{ id: "o1", total: 500 }]);\nconst id: string | undefined = found?.id;\nconst empty: number | undefined = firstOrder<number>([]);`,
    misconception: {
      id: "ts-generic-any-first",
      wrong: `function firstOrder(orders: any[]): any { return orders[0]; }`,
      feedback: "anyでは入力から戻り値へ型情報を運べません。",
      nextCheck: "戻り値のidがstringとして補完されるか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-generic-id",
    prompt: "idを持つ任意の注文要素から一致する1件を返す findById<T> を実装してください。",
    starter: `function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {\n  // ここを実装\n}`,
    answer: `function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {\n  return items.find((item) => item.id === id);\n}`,
    explain: "制約でidアクセスを保証しつつ、具体的な要素型Tを維持します。",
    hints: ["Tにはid:stringの制約があります。", "findを使います。", "item.idとidを比較します。"],
    typeTests: `const detailed = findById([{ id: "o1", coupon: true }], "o1");\nconst coupon: boolean | undefined = detailed?.coupon;\n// @ts-expect-error idがない要素は不可\nfindById([{ total: 100 }], "o1");`,
    misconception: {
      id: "ts-generic-no-constraint",
      wrong: `function findById<T>(items: T[], id: string) { return items.find((item) => item.id === id); }`,
      feedback: "Tがidを持つ保証がありません。必要最小限の制約を付けます。",
      nextCheck: "idを持たない配列が呼び出せないか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-generic-group",
    prompt: "注文を指定キーの文字列値で分類する groupBy<T, K> の型シグネチャと本体を実装してください。",
    starter: `function groupBy<T, K extends keyof T>(items: readonly T[], key: K): Record<string, T[]> {\n  // ここを実装\n}`,
    answer: `function groupBy<T, K extends keyof T>(items: readonly T[], key: K): Record<string, T[]> {\n  return items.reduce<Record<string, T[]>>((groups, item) => {\n    const value = String(item[key]);\n    (groups[value] ??= []).push(item);\n    return groups;\n  }, {});\n}`,
    explain: "Kをkeyof Tに制約し、選んだキーで安全に要素へアクセスします。",
    hints: ["keyはTに存在する必要があります。", "item[key]を文字列化します。", "reduceの初期値は{}です。"],
    typeTests: `const grouped = groupBy([{ id: "o1", status: "new" as const }], "status");\nconst orderId: string = grouped.new[0].id;\n// @ts-expect-error 存在しないキー\n groupBy([{ id: "o1" }], "status");`,
    misconception: {
      id: "ts-generic-key-string",
      wrong: `function groupBy<T>(items: T[], key: string) { return {}; }`,
      feedback: "任意のstringでは、Tに存在しないキーも渡せます。keyof Tへ制約します。",
      nextCheck: "存在しないstatusを指定した呼び出しが型エラーになるか確認します。",
    },
  }),
];

const tsConditionalQuestions = [
  challengeQuestion({
    id: "ts-challenge-conditional-id",
    prompt: "注文型がidを持つ場合だけidの型を取り出す OrderId<T> をconditional typeとinferで実装してください。",
    starter: `type OrderId<T> = unknown;`,
    answer: `type OrderId<T> = T extends { id: infer I } ? I : never;`,
    explain: "構造が一致した場合だけinfer Iでidの型を取り出します。",
    hints: ["Tが{id: ...}を満たすか分岐します。", "id位置でinferします。", "一致しない場合はneverです。"],
    typeTests: `type A = OrderId<{ id: string; total: number }>;\ntype B = OrderId<{ total: number }>;\nconst id: A = "o1";\n// @ts-expect-error Bはnever\nconst missing: B = "x";`,
    misconception: {
      id: "ts-infer-whole-object",
      wrong: `type OrderId<T> = T extends infer I ? I : never;`,
      feedback: "T全体を推論しており、idの位置から値型を取り出していません。",
      nextCheck: "結果が注文全体ではなくstringになるか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-conditional-awaited",
    prompt: "注文取得結果Promiseから中身を再帰的に取り出す ResolvedOrder<T> を実装してください。",
    starter: `type ResolvedOrder<T> = unknown;`,
    answer: `type ResolvedOrder<T> = T extends Promise<infer U>\n  ? ResolvedOrder<U>\n  : T;`,
    explain: "Promiseの中身Uへ同じ型を再適用し、入れ子もほどきます。",
    hints: ["Promise<中身>の形を調べます。", "中身をinfer Uで得ます。", "UへResolvedOrderを再適用します。"],
    typeTests: `type Order = { id: string };\ntype Loaded = ResolvedOrder<Promise<Promise<Order>>>;\nconst loaded: Loaded = { id: "o1" };\n// @ts-expect-error Promiseは残らない\nconst pending: Loaded = Promise.resolve({ id: "o1" });`,
    misconception: {
      id: "ts-conditional-one-level",
      wrong: `type ResolvedOrder<T> = T extends Promise<infer U> ? U : T;`,
      feedback: "Promiseが入れ子の場合に1段残ります。推論したUへ再帰適用します。",
      nextCheck: "Promise<Promise<Order>>でOrderになるか確認します。",
    },
  }),
  challengeQuestion({
    id: "ts-challenge-conditional-handler",
    prompt: "注文イベント関数から引数の注文型を取り出す EventOrder<T> を実装してください。",
    starter: `type EventOrder<T> = unknown;`,
    answer: `type EventOrder<T> = T extends (order: infer O) => unknown ? O : never;`,
    explain: "関数の第1引数位置でinfer Oを使います。",
    hints: ["Tが関数型かを調べます。", "第1引数の位置でinferします。", "関数でなければneverです。"],
    typeTests: `type Handler = (order: { id: string; total: number }) => void;\ntype Payload = EventOrder<Handler>;\nconst payload: Payload = { id: "o1", total: 500 };\n// @ts-expect-error totalが必要\nconst broken: Payload = { id: "o1" };`,
    misconception: {
      id: "ts-infer-return",
      wrong: `type EventOrder<T> = T extends (...args: any[]) => infer O ? O : never;`,
      feedback: "戻り値を推論しており、必要な第1引数の注文型ではありません。",
      nextCheck: "Handlerの戻り値voidではなく引数型になるか確認します。",
    },
  }),
];

const nodeProcessQuestions = [
  challengeQuestion({
    id: "node-challenge-process-port",
    prompt: "環境変数PORTを数値化し、未設定なら3000を返す getPort(env) を実装してください。",
    starter: `function getPort(env) {\n  // process.envを渡したenvとして扱う\n}`,
    answer: `function getPort(env) {\n  return env.PORT === undefined ? 3000 : Number(env.PORT);\n}`,
    explain: "環境変数は文字列またはundefinedなので、存在確認後に数値化します。",
    hints: ["env.PORTは文字列かundefinedです。", "未設定を先に分岐します。", "設定値にはNumberを使います。"],
    behaviorCases: [
      { args: [{}], expected: 3000 },
      { args: [{ PORT: "8080" }], expected: 8080 },
      { args: [{ PORT: "0" }], expected: 0 },
    ],
    misconception: {
      id: "node-process-falsy-port",
      wrong: `function getPort(env) {\n  return Number(env.PORT) || 3000;\n}`,
      feedback: "PORT=\"0\"まで未設定扱いになります。undefinedを明示的に判定します。",
      nextCheck: "PORTが\"0\"のケースを確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-process-args",
    prompt: "process.argv相当の配列から--orderに続く値を返す readOrderId(argv) を実装してください。",
    starter: `function readOrderId(argv) {\n  // node, script以降を調べる\n}`,
    answer: `function readOrderId(argv) {\n  const index = argv.indexOf("--order");\n  return index === -1 ? undefined : argv[index + 1];\n}`,
    explain: "フラグ位置を探し、存在するときだけ次の要素を返します。",
    hints: ["indexOfでフラグ位置を探します。", "-1は未検出です。", "値はindex + 1です。"],
    behaviorCases: [
      { args: [["node", "app.js", "--order", "o1"]], expected: "o1" },
      { args: [["node", "app.js"]], expected: undefined },
    ],
    misconception: {
      id: "node-argv-fixed-index",
      wrong: `function readOrderId(argv) {\n  return argv[3];\n}`,
      feedback: "別のオプションが増えると固定位置がずれます。フラグ自体を探します。",
      nextCheck: "--verboseが前にあるケースを確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-process-exit",
    prompt: "処理結果に応じて終了コードを設定する exitCodeFor(result) を実装してください。成功0、入力不正2、その他1です。",
    starter: `function exitCodeFor(result) {\n  // "ok" | "invalid" | "error"\n}`,
    answer: `function exitCodeFor(result) {\n  if (result === "ok") return 0;\n  if (result === "invalid") return 2;\n  return 1;\n}`,
    explain: "終了コードを返す純粋関数に分けるとprocess.exitCodeへ安全に設定できます。",
    hints: ["成功は0です。", "入力不正を先に区別します。", "残りは1です。"],
    behaviorCases: [
      { args: ["ok"], expected: 0 },
      { args: ["invalid"], expected: 2 },
      { args: ["error"], expected: 1 },
    ],
    misconception: {
      id: "node-exit-success-one",
      wrong: `function exitCodeFor(result) {\n  return result === "ok" ? 1 : 0;\n}`,
      feedback: "OSの慣例では0が成功、0以外が失敗です。",
      nextCheck: "成功ケースが0になるか確認します。",
    },
  }),
];

const nodePathFsQuestions = [
  challengeQuestion({
    id: "node-challenge-path-safe",
    prompt: "基準ディレクトリと注文idからJSONファイルパスを作る orderPath(base, id, pathApi) を実装してください。",
    starter: `function orderPath(base, id, pathApi) {\n  // OS依存の区切りを直書きしない\n}`,
    answer: `function orderPath(base, id, pathApi) {\n  return pathApi.join(base, "orders", \`\${id}.json\`);\n}`,
    explain: "path.joinへ断片を渡すとOSごとの区切りへ対応できます。",
    hints: ["文字列の/連結を避けます。", "base, orders, ファイル名を渡します。", "ファイル名はid.jsonです。"],
    behaviorCases: [{ args: ["/data", "o1", "path-posix"], expected: "/data/orders/o1.json" }],
    misconception: {
      id: "node-path-concatenate",
      wrong: `function orderPath(base, id) {\n  return base + "/orders/" + id + ".json";\n}`,
      feedback: "区切り文字を直書きするとOS差や末尾区切りで壊れます。",
      nextCheck: "path.join相当のAPIを使っているか確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-fs-json",
    prompt: "fs/promises相当のfsApiで注文JSONを読み、オブジェクトを返す readOrder(file, fsApi) を実装してください。",
    starter: `async function readOrder(file, fsApi) {\n  // UTF-8で読む\n}`,
    answer: `async function readOrder(file, fsApi) {\n  const text = await fsApi.readFile(file, "utf8");\n  return JSON.parse(text);\n}`,
    explain: "エンコーディングを指定して文字列として読み、完了後にJSONを解析します。",
    hints: ["readFileはPromiseを返します。", "文字コードはutf8です。", "得た文字列をJSON.parseします。"],
    behaviorCases: [{ args: ["order.json"], expected: { id: "o1" } }],
    misconception: {
      id: "node-fs-buffer-parse",
      wrong: `async function readOrder(file, fsApi) {\n  return JSON.parse(await fsApi.readFile(file));\n}`,
      feedback: "文字列として読む契約が曖昧です。utf8を指定してから解析します。",
      nextCheck: "readFileの第2引数を確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-fs-write",
    prompt: "注文を整形JSONとして保存する writeOrder(file, order, fsApi) を実装してください。",
    starter: `async function writeOrder(file, order, fsApi) {\n  // 2スペースで整形して保存\n}`,
    answer: `async function writeOrder(file, order, fsApi) {\n  const text = JSON.stringify(order, null, 2);\n  await fsApi.writeFile(file, text, "utf8");\n}`,
    explain: "JSON化・文字コード・書き込み完了の待機を明示します。",
    hints: ["JSON.stringifyの第3引数は2です。", "writeFileへutf8を渡します。", "書き込みをawaitします。"],
    behaviorCases: [{ args: ["order.json", { id: "o1" }], expectedLogs: ["written"] }],
    misconception: {
      id: "node-fs-write-no-await",
      wrong: `async function writeOrder(file, order, fsApi) {\n  fsApi.writeFile(file, JSON.stringify(order));\n}`,
      feedback: "書き込み完了前に関数が終了し、失敗も呼び出し側へ伝わりません。",
      nextCheck: "writeFileのPromiseをawaitしているか確認します。",
    },
  }),
];

const nodeAsyncIoQuestions = [
  challengeQuestion({
    id: "node-challenge-io-parallel",
    prompt: "複数注文ファイルを並行して読み込む readOrders(files, readOne) を実装してください。",
    starter: `async function readOrders(files, readOne) {\n  // 並行読み込み\n}`,
    answer: `async function readOrders(files, readOne) {\n  return Promise.all(files.map((file) => readOne(file)));\n}`,
    explain: "mapで全I/Oを開始し、Promise.allで全完了を待ちます。",
    hints: ["filesをPromiseの配列へ変換します。", "変換にはmapを使います。", "Promise.allをreturnします。"],
    behaviorCases: [
      { args: [["a.json", "b.json"]], expected: [{ id: "a" }, { id: "b" }] },
      { args: [[]], expected: [] },
    ],
    misconception: {
      id: "node-io-foreach-await",
      wrong: `async function readOrders(files, readOne) {\n  const orders = [];\n  files.forEach(async (file) => orders.push(await readOne(file)));\n  return orders;\n}`,
      feedback: "forEachは内側のPromiseを待たず、空の配列を先に返す可能性があります。",
      nextCheck: "外側が全readOneの完了を待つ構造か確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-io-settled",
    prompt: "一部の読込失敗を許し、成功した注文だけ返す readAvailable(files, readOne) を実装してください。",
    starter: `async function readAvailable(files, readOne) {\n  // allSettledを使う\n}`,
    answer: `async function readAvailable(files, readOne) {\n  const results = await Promise.allSettled(files.map(readOne));\n  return results\n    .filter((result) => result.status === "fulfilled")\n    .map((result) => result.value);\n}`,
    explain: "allSettledなら1件の失敗で全体をrejectせず、結果ごとに判定できます。",
    hints: ["Promise.allでは1件の失敗でrejectします。", "allSettledのstatusを見ます。", "fulfilledのvalueだけ取り出します。"],
    behaviorCases: [{ args: [["ok.json", "missing.json"]], expected: [{ id: "ok" }] }],
    misconception: {
      id: "node-io-all-reject",
      wrong: `async function readAvailable(files, readOne) {\n  return Promise.all(files.map(readOne));\n}`,
      feedback: "1件の失敗で成功分も受け取れません。各結果を検査できるallSettledを使います。",
      nextCheck: "2件中1件だけ失敗するケースを確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-io-cleanup",
    prompt: "注文ロックを取得して処理し、失敗時も必ず解放する withOrderLock(id, lockApi, task) を実装してください。",
    starter: `async function withOrderLock(id, lockApi, task) {\n  // acquire後、必ずrelease\n}`,
    answer: `async function withOrderLock(id, lockApi, task) {\n  await lockApi.acquire(id);\n  try {\n    return await task();\n  } finally {\n    await lockApi.release(id);\n  }\n}`,
    explain: "取得後の処理をtry/finallyで囲み、例外時にも解放完了を待ちます。",
    hints: ["acquireを最初に待ちます。", "taskはtry内です。", "releaseはfinallyでawaitします。"],
    behaviorCases: [
      { args: ["o1"], expectedLogs: ["acquire:o1", "task", "release:o1"] },
      { args: ["fail"], expectedLogs: ["acquire:fail", "task", "release:fail"] },
    ],
    misconception: {
      id: "node-lock-success-only",
      wrong: `async function withOrderLock(id, lockApi, task) {\n  await lockApi.acquire(id);\n  const result = await task();\n  await lockApi.release(id);\n  return result;\n}`,
      feedback: "taskが失敗するとreleaseへ到達せず、ロックが残ります。",
      nextCheck: "taskがrejectした経路でもreleaseされるか確認します。",
    },
  }),
];

const nodeHttpQuestions = [
  challengeQuestion({
    id: "node-challenge-http-json",
    prompt: "注文をJSONで200応答し、必ずレスポンスを終了する sendOrder(res, order) を実装してください。",
    starter: `function sendOrder(res, order) {\n  // status, header, body, end\n}`,
    answer: `function sendOrder(res, order) {\n  res.statusCode = 200;\n  res.setHeader("content-type", "application/json; charset=utf-8");\n  res.end(JSON.stringify(order));\n}`,
    explain: "ヘッダー設定後、endへ本文を渡すと送信と終了を同時に行えます。",
    hints: ["Content-Typeを設定します。", "注文をJSON.stringifyします。", "最後はres.endです。"],
    behaviorCases: [{ args: [{}, { id: "o1" }], expectedLogs: ["200", "application/json; charset=utf-8", "{\"id\":\"o1\"}", "end"] }],
    misconception: {
      id: "node-http-write-without-end",
      wrong: `function sendOrder(res, order) {\n  res.write(JSON.stringify(order));\n}`,
      feedback: "writeだけでは応答が終了せず、クライアントが待ち続けます。",
      nextCheck: "全経路でres.endが呼ばれるか確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-http-not-found",
    prompt: "注文がなければ404、あれば200でJSONを返し、各分岐を終了する respondOrder(res, order) を実装してください。",
    starter: `function respondOrder(res, order) {\n  // nullなら404\n}`,
    answer: `function respondOrder(res, order) {\n  res.setHeader("content-type", "application/json; charset=utf-8");\n  if (order === null) {\n    res.statusCode = 404;\n    res.end(JSON.stringify({ error: "注文が見つかりません" }));\n    return;\n  }\n  res.statusCode = 200;\n  res.end(JSON.stringify(order));\n}`,
    explain: "404応答後にreturnし、後続の200応答へ流れないようにします。",
    hints: ["nullを先に扱います。", "404でendした後はreturnします。", "残りの経路で200を返します。"],
    behaviorCases: [
      { args: [{}, null], expectedLogs: ["404", "end"] },
      { args: [{}, { id: "o1" }], expectedLogs: ["200", "end"] },
    ],
    misconception: {
      id: "node-http-double-end",
      wrong: `function respondOrder(res, order) {\n  if (order === null) res.end("not found");\n  res.end(JSON.stringify(order));\n}`,
      feedback: "404分岐後も後続へ進み、endを2回呼びます。終了後にreturnします。",
      nextCheck: "null時にendが1回だけ呼ばれるか確認します。",
    },
  }),
  challengeQuestion({
    id: "node-challenge-http-error",
    prompt: "非同期の注文取得に失敗しても500で応答を終了する handleGet(res, loadOrder) を実装してください。",
    starter: `async function handleGet(res, loadOrder) {\n  // 成功200、失敗500\n}`,
    answer: `async function handleGet(res, loadOrder) {\n  try {\n    const order = await loadOrder();\n    res.statusCode = 200;\n    res.end(JSON.stringify(order));\n  } catch {\n    res.statusCode = 500;\n    res.end(JSON.stringify({ error: "内部エラー" }));\n  }\n}`,
    explain: "Promiseの失敗をcatchし、エラー経路でもstatusCodeとendを設定します。",
    hints: ["loadOrderをtry内でawaitします。", "catchで500を設定します。", "成功・失敗の両方でendします。"],
    behaviorCases: [
      { args: [{}, "resolve"], expectedLogs: ["200", "end"] },
      { args: [{}, "reject"], expectedLogs: ["500", "end"] },
    ],
    misconception: {
      id: "node-http-unhandled-rejection",
      wrong: `async function handleGet(res, loadOrder) {\n  const order = await loadOrder();\n  res.end(JSON.stringify(order));\n}`,
      feedback: "取得失敗時に応答が終了せず、クライアントが待ち続けます。",
      nextCheck: "loadOrderがrejectする経路で500とendが設定されるか確認します。",
    },
  }),
];

export const languageChallenges: Lesson[] = [
  {
    id: "js-challenge-boundary",
    track: "js",
    level: "start",
    chapter: "js-challenge",
    order: 58,
    title: "注文条件の境界値",
    summary: "以上・未満・0件を具体例で検証する",
    minutes: 25,
    slides: slides("境界値", "条件式の不具合は、境界のすぐ近くで起きます。注文管理の金額・数量・ページ数を、境界の前後3点で確かめます。", "branch", `4999 → false\n5000 → true\n5001 → true`, "日本語の「以上」「より大きい」「未満」を同じ記号にしないでください。"),
    questions: jsBoundaryQuestions,
  },
  {
    id: "js-challenge-immutable",
    track: "js",
    level: "basic",
    chapter: "js-challenge",
    order: 59,
    title: "注文データの非破壊更新",
    summary: "元データを保ったまま注文を更新する",
    minutes: 30,
    slides: slides("非破壊更新", "画面や履歴が同じ注文を参照していると、直接変更は別の表示まで巻き込みます。新しい配列・オブジェクトを作ります。", "spread", `const next = { ...order, status: "paid" };`, "spreadが浅いコピーであることにも注意します。"),
    questions: jsImmutableQuestions,
  },
  {
    id: "js-challenge-closure",
    track: "js",
    level: "middle",
    chapter: "js-challenge",
    order: 60,
    title: "注文ごとに状態を閉じ込める",
    summary: "クロージャで番号・割引・累計を保持する",
    minutes: 30,
    slides: slides("クロージャ", "関数を返したあとも、その関数は生成時の変数を覚えています。注文ごとに独立した小さな状態を作ります。", "closure", `const next = createOrderNumber(100);\nnext(); // 101\nnext(); // 102`, "状態をグローバルへ置くと、別注文同士が干渉します。"),
    questions: jsClosureQuestions,
  },
  {
    id: "js-challenge-async",
    track: "js",
    level: "advanced",
    chapter: "js-challenge",
    order: 61,
    title: "注文処理の非同期順序",
    summary: "依存・並行・後始末をawaitで組み立てる",
    minutes: 35,
    slides: slides("非同期順序", "待つ処理をすべて直列にするのではなく、依存する処理、独立した処理、必須の後始末を分けます。", "event-loop", `const [stock, slots] = await Promise.all([\n  getStock(id), getSlots(id)\n]);`, "awaitの付け忘れと、不要な直列化は別の問題です。"),
    questions: jsAsyncQuestions,
  },
  {
    id: "ts-challenge-pick-readonly",
    track: "ts",
    level: "start",
    chapter: "ts-challenge",
    order: 15,
    title: "注文型の選択と読み取り専用化",
    summary: "mapped typeで必要な項目と更新可否を表す",
    minutes: 30,
    slides: slides("型の写像", "注文型の一部を手で書き直さず、元の型からキーと値型を写します。仕様変更への追従漏れを減らします。", "utility", `type View<T> = {\n  readonly [K in keyof T]: T[K]\n};`, "値型をハードコードすると、元型の変更から取り残されます。"),
    questions: tsPickReadonlyQuestions,
  },
  {
    id: "ts-challenge-discriminated-union",
    track: "ts",
    level: "basic",
    chapter: "ts-challenge",
    order: 16,
    title: "注文状態の判別ユニオン",
    summary: "有効な状態と項目の組合せだけを許す",
    minutes: 30,
    slides: slides("判別ユニオン", "共通のリテラル型を判別子にすると、分岐後に固有項目を安全に使え、あり得ない組合せを除外できます。", "union", `if (result.kind === "success") {\n  console.log(result.orderId);\n}`, "全プロパティをoptionalにするだけでは、不正な組合せを防げません。"),
    questions: tsUnionQuestions,
  },
  {
    id: "ts-challenge-generic",
    track: "ts",
    level: "middle",
    chapter: "ts-challenge",
    order: 17,
    title: "注文情報を運ぶジェネリクス",
    summary: "入力と出力の型関係を保った関数を作る",
    minutes: 35,
    slides: slides("ジェネリクス", "具体的な注文型を失わずに再利用するには、入力で決まった型を出力まで運びます。必要な操作だけ制約で保証します。", "generic", `function first<T>(items: readonly T[]): T | undefined {\n  return items[0];\n}`, "anyは型関係を消します。制約は必要最小限にします。"),
    questions: tsGenericQuestions,
  },
  {
    id: "ts-challenge-conditional-infer",
    track: "ts",
    level: "advanced",
    chapter: "ts-challenge",
    order: 18,
    title: "注文型を分解する条件型",
    summary: "conditional typeとinferで内側の型を得る",
    minutes: 35,
    slides: slides("条件型とinfer", "型の形を条件として調べ、一致した位置の型を名前付きで取り出します。注文ID、Promise、イベント引数を分解します。", "conditional", `type IdOf<T> = T extends { id: infer I }\n  ? I\n  : never;`, "inferする位置が、戻り値・引数・プロパティのどこかを確認します。"),
    questions: tsConditionalQuestions,
  },
  {
    id: "node-challenge-process",
    track: "node",
    level: "start",
    chapter: "node-challenge",
    order: 13,
    title: "注文CLIとprocess",
    summary: "環境変数・引数・終了コードを境界で扱う",
    minutes: 25,
    slides: slides("process", "Node.jsの外側から入る環境変数とコマンドライン引数は文字列です。解析を小さな純粋関数へ分けます。", "node-process", `const port = getPort(process.env);\nprocess.exitCode = exitCodeFor(result);`, "process.exit()で即時終了すると、未完了の出力を失うことがあります。"),
    questions: nodeProcessQuestions,
  },
  {
    id: "node-challenge-path-fs",
    track: "node",
    level: "basic",
    chapter: "node-challenge",
    order: 14,
    title: "注文ファイルとpath/fs",
    summary: "移植可能なパスでJSONを安全に読み書きする",
    minutes: 30,
    slides: slides("pathとfs", "パスは文字列連結せず、ファイルI/Oは文字コードと完了待ちを明示します。注文JSONの入出力契約を固定します。", "node-fs", `const file = path.join(base, "orders", \`\${id}.json\`);\nconst text = await fs.readFile(file, "utf8");`, "書き込みPromiseを待たずにプロセスを終えないでください。"),
    questions: nodePathFsQuestions,
  },
  {
    id: "node-challenge-async-io",
    track: "node",
    level: "middle",
    chapter: "node-challenge",
    order: 15,
    title: "注文I/Oの並行処理",
    summary: "複数I/O・部分失敗・後始末を制御する",
    minutes: 35,
    slides: slides("非同期I/O", "独立した読込は並行化し、許容する失敗範囲を選び、取得した資源はfinallyで解放します。", "node-libuv", `const results = await Promise.allSettled(\n  files.map(readOne)\n);`, "forEachは内側の非同期処理の完了を待ちません。"),
    questions: nodeAsyncIoQuestions,
  },
  {
    id: "node-challenge-http-ending",
    track: "node",
    level: "advanced",
    chapter: "node-challenge",
    order: 16,
    title: "HTTP応答を必ず終了する",
    summary: "成功・未検出・例外の全経路でendする",
    minutes: 35,
    slides: slides("HTTP終了処理", "HTTPハンドラーは本文を書くことだけでなく、すべての分岐で応答を一度だけ終了する責任があります。", "node-http", `res.statusCode = 200;\nres.end(JSON.stringify(order));`, "end後にreturnしない分岐は、二重送信につながります。"),
    questions: nodeHttpQuestions,
  },
];
