import type { Lesson } from "@/lib/course/types";

/** 上級DOMの不足トピック（script・インライン・削除・POST・スクロール） */
export const jsDomBrowser: Lesson[] = [
  {
    id: "js-dom-browser",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 32,
    title: "ブラウザの入り口と動きを足す",
    summary: "script配置、インラインイベント、削除、POST、スクロール表示",
    minutes: 22,
    slides: [
      {
        title: "HTMLからJavaScriptを動かす",
        lead: "ブラウザはHTMLを読み、scriptタグの中身を実行します。外部ファイルなら src で読み込みます。注文画面でも、まずHTMLがあり、その上でDOMを触る、という順番です。",
        points: [
          "script は HTML の一部として読み込まれる",
          "src があると外部ファイルを実行する",
          "DOMを触るコードは、対象要素より後ろか DOMContentLoaded 後に置く",
        ],
        diagram: "dom-tree",
        code: `<!-- index.html -->
<script src="./app.js"></script>

<!-- または -->
<script>
  console.log(document.title);
</script>`,
        codeExample: `document.addEventListener("DOMContentLoaded", () => {
  console.log("HTMLの準備が終わった");
});`,
        talk: [
          {
            speaker: "beginner",
            text: "JavaScriptは、HTMLと別の世界で勝手に動くんですか？",
          },
          {
            speaker: "engineer",
            text: "いいえ。ブラウザがHTMLを読み、scriptを見つけたときに実行します。外部ならsrcのファイルを読みます。",
          },
          {
            speaker: "beginner",
            text: "scriptをheadの先頭に置くと、まだ無い要素を取れますか？",
          },
          {
            speaker: "engineer",
            text: "その時点では要素が無いことがあります。対象より後ろに置くか、DOMContentLoadedを待ちます。",
          },
        ],
      },
      {
        title: "インラインイベントは避ける",
        lead: "onclick=\"...\" のようにHTMLへ直接書くのがインラインイベントハンドラーです。動きますが、表示と処理が混ざり、テストや再利用が難しくなります。新規コードでは addEventListener を基本にします。",
        points: [
          "インラインはHTML属性に処理を書く方式",
          "addEventListener は要素と処理をコード側で結ぶ",
          "教材・実務とも、まず addEventListener を選ぶ",
        ],
        diagram: "dom-event",
        code: `<!-- 避けたい例 -->
<button onclick="markPaid()">支払</button>

<!-- 推奨 -->
<button id="pay">支払</button>
<script>
  document.querySelector("#pay").addEventListener("click", markPaid);
</script>`,
        talk: [
          {
            speaker: "beginner",
            text: "HTMLにonclickを書けば、addEventListenerより短く済みますよね？",
          },
          {
            speaker: "engineer",
            text: "短いことはありますが、見た目と処理が同じファイルに混ざります。注文画面では分離した方が追いやすいです。",
          },
          {
            speaker: "beginner",
            text: "古い解説でonclickを見たら、そのまま真似してよいですか？",
          },
          {
            speaker: "engineer",
            text: "動きの理解には使えますが、新しく書くならaddEventListenerへ置き換えます。",
          },
        ],
      },
      {
        title: "要素を削除する",
        lead: "不要になった注文行は remove で外せます。親から removeChild でも同じです。一覧を全部作り直す replaceChildren と、1行だけ消す remove を場面で使い分けます。",
        points: [
          "element.remove() で自身を外す",
          "parent.removeChild(child) でも外せる",
          "全行の再描画なら replaceChildren も有効",
        ],
        diagram: "dom-create",
        code: `const row = list.querySelector('[data-order-id="o-1"]');
row?.remove();

// 親から外す書き方
// list.removeChild(row);`,
        codeExample: `list.replaceChildren(); // 子をすべて消して空にする`,
        talk: [
          {
            speaker: "beginner",
            text: "1件だけ消したいときも、毎回一覧を空にして全部描き直す必要がありますか？",
          },
          {
            speaker: "engineer",
            text: "いいえ。その行だけ remove すれば足ります。全件の正本が変わったあとに揃えるなら、replaceChildrenで再描画でもよいです。",
          },
          {
            speaker: "beginner",
            text: "removeした要素は、もう二度と使えませんか？",
          },
          {
            speaker: "engineer",
            text: "木から外れただけで、変数が残っていれば再appendもできます。不要なら参照も捨てます。",
          },
        ],
      },
      {
        title: "fetchで注文を送る",
        lead: "取得がGETなら、新規作成はPOSTで本文を送ります。method・headers・bodyを指定し、JSONなら Content-Type と JSON.stringify をセットにします。",
        points: [
          "method: \"POST\" を明示する",
          "bodyは文字列（JSONなら stringify）",
          "レスポンスも ok を確認してから json する",
        ],
        diagram: "dom-fetch",
        code: `async function createOrder(order) {
  const response = await fetch("/api/demo-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error("登録に失敗");
  return response.json();
}`,
        codeExample: `const saved = await createOrder({
  customer: "Aya",
  item: "Tea",
  total: 500,
});`,
        talk: [
          {
            speaker: "beginner",
            text: "今までのfetchと同じ書き方で、サーバーへ注文を送れますか？",
          },
          {
            speaker: "engineer",
            text: "URLだけでは取得向きです。送るときはmethodとbodyを付けます。JSONならstringifyが必要です。",
          },
          {
            speaker: "beginner",
            text: "オブジェクトをそのままbodyへ渡せばいいですか？",
          },
          {
            speaker: "engineer",
            text: "fetchのbodyは文字列などのボディです。オブジェクトはJSON.stringifyして送り、受け側もokを確認します。",
          },
        ],
      },
      {
        title: "スクロールで要素を表示する",
        lead: "下へスクロールしたときに案内を出すには、scrollイベントか IntersectionObserver を使います。毎回計算するならthrottleし、要素が見えたかだけ知りたいならObserverが向きます。",
        points: [
          "scrollは高頻度なので処理を軽く保つ",
          "IntersectionObserverは「見えた」を監視できる",
          "表示切替はclassListで行うと扱いやすい",
        ],
        diagram: "dom-update",
        code: `const tip = document.querySelector("#scroll-tip");
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    tip.classList.toggle("is-visible", entry.isIntersecting);
  }
});
observer.observe(document.querySelector("#order-list"));`,
        codeExample: `/* CSS */
#scroll-tip { opacity: 0; }
#scroll-tip.is-visible { opacity: 1; }`,
        talk: [
          {
            speaker: "beginner",
            text: "スクロールのたびにgetBoundingClientRectで位置を計算するのが定番ですか？",
          },
          {
            speaker: "engineer",
            text: "できますが重いことがあります。見えたかどうかだけならIntersectionObserverが向きます。",
          },
          {
            speaker: "beginner",
            text: "見えたらどうやって見せますか？",
          },
          {
            speaker: "engineer",
            text: "classListでis-visibleを付け外しし、CSSで透明度や位置を変えるのが分かりやすいです。",
          },
        ],
      },
      {
        title: "この講義の要点",
        lead: "ブラウザではHTMLのscriptからJavaScriptが動き、イベントはaddEventListenerで結び、不要な要素はremoveで外し、送受信はmethod付きのfetch、表示切替はIntersectionObserverとclassListで足せます。",
        points: [
          "scriptの位置とDOMContentLoadedで実行タイミングを合わせる",
          "インラインonclickよりaddEventListenerを選ぶ",
          "削除・POST・スクロール表示を場面で使い分ける",
        ],
        diagram: "dom-tree",
        code: `document.addEventListener("DOMContentLoaded", () => {
  button.addEventListener("click", onPay);
  row.remove();
});`,
        talk: [
          {
            speaker: "beginner",
            text: "この講義で足した道具を、順番に確認させてください。",
          },
          {
            speaker: "engineer",
            text: "まずscriptで動かし、イベントはリスナーで結びます。行の削除、POST送信、スクロール表示はそれぞれremove・fetch・Observerです。",
          },
          {
            speaker: "beginner",
            text: "全部を毎回同じ講義で使いますか？",
          },
          {
            speaker: "engineer",
            text: "いいえ。必要な場面だけ選びます。入口のscriptとイベントの結び方は、どの注文画面でも土台になります。",
          },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-browser-q1",
        slide: 0,
        kind: "choice",
        prompt:
          "ページ読み込み直後に #order-list を触るコードの置き方として適切なものを選んでください。",
        lead: "HTMLの要素がまだ無い時点でquerySelectorするとnullになります。実行タイミングの正しい組み合わせを選びます。",
        options: [
          "要素後ろのscriptか読込完了後に触る",
          "head先頭で必ず要素を取得してから触る",
          "scriptはHTMLでは使えず別アプリが必要",
          "無い要素もquerySelectorが自動で作る",
        ],
        answer: "要素後ろのscriptか読込完了後に触る",
        explain: "DOMが揃ってから触るか、要素より後のscriptに置きます。",
        steps: [
          "要素の準備タイミングを確認する",
          "scriptの位置またはイベント待ちを選ぶ",
        ],
        exerciseKind: "worked",
        projectRole: "drill",
      },
      {
        id: "js-dom-browser-q2",
        slide: 1,
        kind: "choice",
        prompt:
          "新規の注文ボタンクリック処理として推奨される書き方を選んでください。",
        lead: "表示用HTMLと処理用JavaScriptの役割分担を意識します。",
        options: [
          "addEventListenerでクリック処理を結ぶ",
          "onclick属性へクリック処理を直接書く",
          "HTMLコメントへクリック処理を書いておく",
          "CSSのhoverへクリック処理を書いておく",
        ],
        answer: "addEventListenerでクリック処理を結ぶ",
        explain: "新規コードではaddEventListenerで要素と処理を結びます。",
        steps: ["インラインとリスナーの違いを思い出す", "推奨側を選ぶ"],
        exerciseKind: "worked",
        projectRole: "drill",
      },
      {
        id: "js-dom-browser-q3",
        slide: 2,
        kind: "code",
        runtime: "dom",
        prompt: 'data-order-id="o-2" の注文行をDOMから削除してください。',
        lead: "一覧の1行だけ消すときは、該当要素を見つけて remove します。",
        fixtureHtml: `<main>
  <ul id="order-list">
    <li data-order-id="o-1">Aya / Tea</li>
    <li data-order-id="o-2">Ken / Bread</li>
  </ul>
</main>`,
        domProbe: `document.querySelector('[data-order-id="o-2"]') === null && document.querySelectorAll("#order-list li").length === 1`,
        starter: `const list = document.querySelector("#order-list");
const row = list.querySelector('[data-order-id="o-2"]');
// row を remove で削除する`,
        answer: `const list = document.querySelector("#order-list");
const row = list.querySelector('[data-order-id="o-2"]');
row?.remove();`,
        explain: "セレクターで行を特定し、removeで木から外します。",
        hints: [
          "list.querySelectorで data-order-id を指定します。",
          "見つかった要素に remove() を呼びます。",
          "o-1は残します。",
        ],
        steps: [
          "対象の行をセレクターで取る",
          "removeで外す",
          "他の行が残っているか確認する",
        ],
        sample: "o-2だけ消え、o-1が残る",
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面で、取り消した注文行だけを一覧から外します。",
      },
      {
        id: "js-dom-browser-q4",
        slide: 3,
        kind: "code",
        runtime: "dom",
        prompt:
          "注文オブジェクトをPOSTで送り、返ってきたidを#messageへ表示してください。",
        lead: "教材のfake APIは /api/demo-orders へのPOSTを受け付けます。JSONで送り、レスポンスのidを表示します。",
        fixtureHtml: `<main>
  <p id="message"></p>
</main>`,
        domProbe: `message.textContent === "ORD-NEW"`,
        starter: `const message = document.querySelector("#message");
const order = { customer: "Aya", item: "Tea", total: 500 };
const response = await fetch("/api/demo-orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(order),
});
// ok を確認し、json の id を message へ（失敗時は「登録失敗」）
const saved = undefined;
message.textContent = "";`,
        answer: `const message = document.querySelector("#message");
const order = { customer: "Aya", item: "Tea", total: 500 };
const response = await fetch("/api/demo-orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(order),
});
if (!response.ok) throw new Error("登録失敗");
const saved = await response.json();
message.textContent = saved.id;`,
        explain:
          "methodとContent-Type、stringifyしたbodyを付けて送り、jsonのidを表示します。",
        hints: [
          "methodはPOSTです。",
          "bodyはJSON.stringify(order)です。",
          "await response.json()のidを使います。",
        ],
        steps: [
          "fetchにmethodとheadersとbodyを渡す",
          "okを確認する",
          "jsonのidをmessageへ入れる",
        ],
        sample: "ORD-NEW",
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario:
          "注文管理画面の実装で、新規注文をAPIへPOSTし、発行されたidを案内欄へ出します。",
      },
      {
        id: "js-dom-browser-q5",
        slide: 4,
        kind: "code",
        runtime: "dom",
        prompt:
          "#sentinelが見えたら #scroll-tip に is-visible を付け、見えなくなったら外してください。",
        lead: "IntersectionObserverで監視し、classList.toggleの第2引数に isIntersecting を渡します。",
        fixtureHtml: `<main style="height:200px;overflow:auto" id="scroller">
  <p id="scroll-tip">一覧が視界に入りました</p>
  <div style="height:240px"></div>
  <p id="sentinel">注文一覧付近</p>
  <div style="height:240px"></div>
</main>`,
        domProbe: `typeof tip.classList.contains === "function" && Boolean(window.__courseObserver)`,
        starter: `const tip = document.querySelector("#scroll-tip");
const sentinel = document.querySelector("#sentinel");
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    // entry.isIntersecting で tip の is-visible を切り替える
  }
});
// sentinel を observe し、window.__courseObserver = observer も代入する`,
        answer: `const tip = document.querySelector("#scroll-tip");
const sentinel = document.querySelector("#sentinel");
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    tip.classList.toggle("is-visible", entry.isIntersecting);
  }
});
observer.observe(sentinel);
window.__courseObserver = observer;`,
        explain:
          "監視対象が見えたかでclassを切り替えます。教材確認のためobserverをwindowへ残します。",
        hints: [
          "new IntersectionObserver(callback)です。",
          "toggleの第2引数にentry.isIntersectingを渡します。",
          "observe(sentinel)を忘れずに。",
        ],
        steps: [
          "Observerを作る",
          "isIntersectingでclassを切り替える",
          "sentinelをobserveする",
        ],
        sample: "監視が始まり、表示クラスを付け外しできる",
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario:
          "注文一覧が画面に入ったときだけ案内を出すスクロール連動を実装します。",
      },
    ],
  },
];
