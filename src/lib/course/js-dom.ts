import type { Lesson } from "@/lib/course/types";

export const jsDom: Lesson[] = [
  {
    id: "js-dom-tree",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 24,
    title: "DOMは画面の部品ツリー",
    summary: "注文管理画面の要素をたどり、querySelectorで選ぶ",
    minutes: 18,
    slides: [
      {
        title: "HTMLは親子の木になる",
        lead: "ブラウザはHTMLを、親と子がつながるDOMツリーに変えます。注文一覧のulにはliが並び、JavaScriptはその枝をたどって表示を調べられます。",
        points: ["documentが木の入口", "mainの中にフォームと一覧がある", "要素の入れ子が親子関係になる"],
        diagram: "dom-tree",
        code: `const list = document.querySelector("#order-list");
        console.log(list?.parentElement?.tagName); // MAIN`,
        codeExample: `const form = document.querySelector("#order-form");
        console.log(form?.children.length);`,
        talk: [
          { speaker: "beginner", text: "注文画面のHTMLは、どうやってJavaScriptから触れる形になるんですか？" },
          { speaker: "engineer", text: "ブラウザがHTMLを親子のDOMツリーに変換します。documentがその木の入口で、mainの下にフォームと注文一覧がぶら下がります。" },
          { speaker: "beginner", text: "一覧のulと各注文のliは、どういう関係ですか？" },
          { speaker: "engineer", text: "ulが親、liが子です。入れ子がそのまま親子関係になるので、枝をたどって表示を調べられます。" },
        ],
      },
      {
        title: "querySelectorで一つ選ぶ",
        lead: "querySelectorはCSSセレクターに合う最初の要素を返します。注文件数なら#order-countのように、役割が変わりにくいidを目印にします。",
        points: ["#はidを選ぶ", "見つからない場合はnull", "選んだ要素を変数に保存する"],
        diagram: "dom-query",
        code: `const count = document.querySelector("#order-count");
        console.log(count?.textContent);`,
        codeExample: `const list = document.querySelector("#order-list");
        console.log(list instanceof HTMLElement);`,
        talk: [
          { speaker: "beginner", text: "注文件数の数字だけ取りたいとき、どう探せばいいですか？" },
          { speaker: "engineer", text: "querySelectorにCSSセレクターを渡すと、最初に一致した要素を1つ返します。#order-countのように、役割が変わりにくいidが目印になります。" },
          { speaker: "beginner", text: "見つからなかったら何が返りますか？ すぐ文字を書いて大丈夫？" },
          { speaker: "engineer", text: "見つからないとnullです。選んだ要素は変数に保存し、使う前に存在を確かめてから更新します。" },
        ],
      },
      {
        title: "querySelectorAllで複数選ぶ",
        lead: "注文行が複数あるときはquerySelectorAllを使います。戻り値はNodeListで、forEachを使って各行の内容を順番に確認できます。",
        points: ["一致する要素をまとめて受け取る", "lengthで個数を確認する", "forEachで一件ずつ扱う"],
        diagram: "dom-query",
        code: `const rows = document.querySelectorAll("#order-list li");
        rows.forEach((row) => console.log(row.textContent));`,
        codeExample: `const unpaid = document.querySelectorAll('[data-status="unpaid"]');
        console.log(unpaid.length);`,
        talk: [
          { speaker: "beginner", text: "注文行が何行もあるときは、querySelectorでは足りないですか？" },
          { speaker: "engineer", text: "最初の1つしか取れないので、複数ならquerySelectorAllを使います。戻り値はNodeListで、lengthで件数を見られます。" },
          { speaker: "beginner", text: "各行の文字を順に確認するにはどうしますか？" },
          { speaker: "engineer", text: "NodeListはforEachで回せます。各liのtextContentを順に読めば、一覧の中身を一件ずつ確認できます。" },
        ],
      },
      {
        title: "選ぶ範囲を一覧の内側に絞る",
        lead: "document全体ではなく、先にorder-listを選んでから内側を探せます。範囲を絞ると、別の場所にある似た要素を誤って扱いません。",
        points: ["親要素からquerySelectorを呼べる", "セレクターの意図が読みやすくなる", "nullの可能性を先に確かめる"],
        diagram: "dom-tree",
        code: `const list = document.querySelector("#order-list");
        const firstOrder = list?.querySelector("li");
        console.log(firstOrder?.textContent);`,
        codeExample: `const form = document.querySelector("#order-form");
        const customer = form?.querySelector('[name="customer"]');`,
        talk: [
          { speaker: "beginner", text: "いつもdocumentから探せば十分ではないですか？" },
          { speaker: "engineer", text: "画面の別場所に似た要素があると、意図しない枝を掴むことがあります。先に#order-listを取り、その要素からquerySelectorすると範囲を限定できます。" },
          { speaker: "beginner", text: "親がnullのまま内側を探すとどうなりますか？" },
          { speaker: "engineer", text: "親が無いのに子を探すと失敗します。list?.querySelectorのように、親の存在を先に確かめてから内側を探します。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "DOMはHTMLから作られる部品の木です。安定したセレクターで必要な枝を選び、一つか複数か、探索範囲はどこかを意識します。",
        points: ["querySelectorは最初の一つ", "querySelectorAllは一致する複数", "親から探すと範囲を限定できる"],
        diagram: "dom-tree",
        code: `const list = document.querySelector("#order-list");
        const rows = list?.querySelectorAll("li") ?? [];
        console.log(rows.length);`,
        codeExample: `document.querySelector("#order-count");`,
        talk: [
          { speaker: "beginner", text: "DOMを触るとき、最初に意識することは何ですか？" },
          { speaker: "engineer", text: "HTMLから作られた部品の木だと捉えることです。安定したセレクターで枝を選び、一つか複数か、どこから探すかを決めます。" },
          { speaker: "beginner", text: "querySelectorとquerySelectorAllの使い分けを確認させてください。" },
          { speaker: "engineer", text: "最初の一つならquerySelector、一致する全部ならquerySelectorAllです。親から探せば、似た要素の取り違えを減らせます。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-tree-q1",
        slide: 0,
        prompt: "注文一覧の親要素のタグ名を取得し、変数parentTagへ代入してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `typeof parentTag === "string" && parentTag === "MAIN"`,
        starter: `const list = document.querySelector("#order-list");
        const parentTag = "";`,
        answer: `const list = document.querySelector("#order-list");
        const parentTag = list.parentElement.tagName;`,
        explain: "order-listのparentElementをたどると、固定HTMLではMAINに着きます。",
        hints: ["一覧を選んだあと、一つ上の要素へ進みます。", "タグ名を表すプロパティを使います。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `parentTag が "MAIN" になる`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、注文一覧の親要素のタグ名を取得し、変数parentTagへ代入してください。",
      },
      {
        id: "js-dom-tree-q2",
        slide: 1,
        prompt: "注文件数を表す要素をidで選び、countElementへ代入してください。",
        lead: "この課題では `#order-count` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `countElement === document.getElementById("order-count")`,
        starter: `const countElement = document.querySelector("");`,
        answer: `const countElement = document.querySelector("#order-count");`,
        explain: "idセレクターを使うと、件数表示の要素を一意に選べます。",
        hints: ["idを選ぶCSS記号を思い出します。", "画面文言ではなく固定idを使います。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `countElement が #order-count を指し、表示は "0"`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、注文件数を表す要素をidで選び、countElementへ代入してください。",
      },
      {
        id: "js-dom-tree-q3",
        slide: 2,
        prompt: "order-listへpaidとunpaidの注文行を追加したあと、すべてのliをrowsへ取得してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `rows.length === 2 && rows[0].textContent === "田中" && rows[1].dataset.status === "unpaid"`,
        starter: `const list = document.querySelector("#order-list");
        const paidRow = document.createElement("li");
        paidRow.dataset.status = "paid";
        paidRow.textContent = "田中";
        const unpaidRow = document.createElement("li");
        unpaidRow.dataset.status = "unpaid";
        unpaidRow.textContent = "佐藤";
        list.append(paidRow, unpaidRow);
        const rows = [];`,
        answer: `const list = document.querySelector("#order-list");
        const paidRow = document.createElement("li");
        paidRow.dataset.status = "paid";
        paidRow.textContent = "田中";
        const unpaidRow = document.createElement("li");
        unpaidRow.dataset.status = "unpaid";
        unpaidRow.textContent = "佐藤";
        list.append(paidRow, unpaidRow);
        const rows = list.querySelectorAll("li");`,
        explain: "一覧の内側でliに一致する全要素を選ぶと、二つの注文行を取得できます。",
        hints: ["複数取得するメソッドを使います。", "探索はlistの内側に限定できます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `rows.length が 2 になる`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、order-listへpaidとunpaidの注文行を追加したあと、すべてのliをrowsへ取得してください。",
      },
      {
        id: "js-dom-tree-q4",
        slide: 3,
        prompt: "order-formの内側だけから、nameがcustomerの入力欄をcustomerInputへ取得してください。",
        lead: "この課題では `[name=\"customer\"]` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `customerInput === document.querySelector('#order-form [name="customer"]')`,
        starter: `const form = document.querySelector("#order-form");
        const customerInput = null;`,
        answer: `const form = document.querySelector("#order-form");
        const customerInput = form.querySelector('[name="customer"]');`,
        explain: "先にフォームを選び、その要素から属性セレクターで入力欄を探します。",
        hints: ["documentではなくformから検索します。", "name属性は角括弧のセレクターで選べます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `customerInput.name が "customer" になる`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、order-formの内側だけから、nameがcustomerの入力欄をcustomerInputへ取得してください。",
      },
    ],
  },
  {
    id: "js-dom-update",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 25,
    title: "選んだ要素を安全に更新する",
    summary: "textContent、classList、属性で注文画面を変える",
    minutes: 18,
    slides: [
      {
        title: "textContentで文字を変える",
        lead: "選んだ要素のtextContentへ文字列を代入すると、表示文を更新できます。注文数は配列のlengthから作り、データと画面を一致させます。",
        points: ["文字をそのまま表示する", "件数はorders.lengthから作る", "再代入すると以前の表示を置き換える"],
        diagram: "dom-update",
        code: `const orders = [{ customer: "田中" }, { customer: "佐藤" }];
        document.querySelector("#order-count").textContent = String(orders.length);`,
        codeExample: `document.querySelector("#message").textContent = "注文を読み込みました";`,
        talk: [
          { speaker: "beginner", text: "選んだ要素の表示文を変えるには、何を書き換えますか？" },
          { speaker: "engineer", text: "textContentへ文字列を代入します。タグとして解釈せず、文字そのものが画面に出ます。" },
          { speaker: "beginner", text: "注文件数は、画面の文字を手で数えればいいですか？" },
          { speaker: "engineer", text: "いいえ。orders.lengthなどデータから作り、textContentへ入れ直します。再代入すると以前の表示は置き換わります。" },
        ],
      },
      {
        title: "classListで状態を表す",
        lead: "classList.addとremoveは、要素の見た目を表すクラスを増減します。未払い注文にはunpaidを付けるなど、状態名をクラス名へ対応させます。",
        points: ["addでクラスを付ける", "removeでクラスを外す", "toggleの第2引数で真偽に合わせる"],
        diagram: "dom-update",
        code: `const row = document.createElement("li");
        row.classList.toggle("unpaid", true);
        console.log(row.classList.contains("unpaid"));`,
        codeExample: `row.classList.remove("unpaid");
        row.classList.add("paid");`,
        talk: [
          { speaker: "beginner", text: "未払いの見た目を付けるとき、styleを直接書くべきですか？" },
          { speaker: "engineer", text: "状態名をクラスに対応させる方が追いやすいです。classList.addでunpaidを付け、外すときはremoveを使います。" },
          { speaker: "beginner", text: "真偽値に合わせて付け外しを一度にやる方法はありますか？" },
          { speaker: "engineer", text: "toggleの第2引数に真偽を渡せます。trueなら付け、falseなら外す、と状態と見た目を揃えられます。" },
        ],
      },
      {
        title: "属性で要素に情報を持たせる",
        lead: "setAttributeは属性を設定し、getAttributeは読み取ります。注文idや支払状態はdata属性にすると、後のクリック処理から参照できます。",
        points: ["data-order-idはdataset.orderIdでも読める", "状態はdata-statusへ保存できる", "見た目の文字と識別情報を分ける"],
        diagram: "dom-update",
        code: `const row = document.createElement("li");
        row.dataset.orderId = "o-1";
        row.dataset.status = "paid";`,
        codeExample: `console.log(row.getAttribute("data-order-id")); // o-1`,
        talk: [
          { speaker: "beginner", text: "クリック後にどの注文か知るために、表示文字へidを埋め込みますか？" },
          { speaker: "engineer", text: "表示と識別は分けます。data-order-idなどのdata属性に置き、あとからdataset.orderIdやgetAttributeで読みます。" },
          { speaker: "beginner", text: "支払状態も同じように持てますか？" },
          { speaker: "engineer", text: "data-statusへ保存できます。見た目の文字はtextContent、識別や状態は属性、と役割を分けると後の処理が楽です。" },
        ],
      },
      {
        title: "値がない可能性を確かめる",
        lead: "querySelectorは対象がなければnullです。重要な要素はifで存在を確認し、見つからないときに分かるエラーを出すと不具合を追えます。",
        points: ["nullのまま更新しない", "早めに失敗させる", "安定したセレクターを使う"],
        diagram: "dom-query",
        code: `const count = document.querySelector("#order-count");
        if (!count) throw new Error("order-count がありません");
        count.textContent = "0";`,
        codeExample: `const message = document.querySelector("#message");
        if (message) message.textContent = "準備完了";`,
        talk: [
          { speaker: "beginner", text: "querySelectorの結果を、確認なしでtextContentへ書いていいですか？" },
          { speaker: "engineer", text: "対象が無いとnullなので、そのまま書くと実行時エラーになります。ifで存在を確認してから更新します。" },
          { speaker: "beginner", text: "見つからないとき、黙ってスキップするのが安全ですか？" },
          { speaker: "engineer", text: "重要な要素なら、分かるエラーを早めに出した方が不具合を追えます。セレクターも、壊れにくいidを使うのが基本です。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "要素を選んだら、文字、クラス、属性を目的別に更新します。データから表示を作り、要素が存在しない場合も考えて処理します。",
        points: ["文字はtextContent", "状態の見た目はclassList", "識別情報はdata属性"],
        diagram: "dom-update",
        code: `const row = document.createElement("li");
        row.textContent = "田中: キーボード";
        row.classList.add("paid");
        row.dataset.status = "paid";`,
        codeExample: `document.querySelector("#order-count").textContent = "1";`,
        talk: [
          { speaker: "beginner", text: "要素を更新するとき、何をどの道具で変えると整理しやすいですか？" },
          { speaker: "engineer", text: "文字はtextContent、状態の見た目はclassList、注文idなどの識別情報はdata属性、と目的別に分けます。" },
          { speaker: "beginner", text: "データと画面がずれたときは、どちらを正にしますか？" },
          { speaker: "engineer", text: "配列などのデータを正にし、そこから表示を作り直します。要素が無い場合も考えて、nullのまま触らないようにします。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-update-q1",
        slide: 0,
        prompt: "ordersの件数をorder-countへ文字として表示してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelector("#order-count").textContent === "2"`,
        starter: `const orders = [{ customer: "田中" }, { customer: "佐藤" }];
        const count = document.querySelector("#order-count");`,
        answer: `const orders = [{ customer: "田中" }, { customer: "佐藤" }];
        const count = document.querySelector("#order-count");
        count.textContent = String(orders.length);`,
        explain: "配列のlengthを文字列へ変換し、件数要素のtextContentへ代入します。",
        hints: ["件数は固定値ではなく配列から得ます。", "選んだ要素の表示文字を更新します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `画面の件数: 2`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersの件数をorder-countへ文字として表示してください。",
      },
      {
        id: "js-dom-update-q2",
        slide: 1,
        prompt: "注文行rowに、statusがunpaidのときだけunpaidクラスが付く処理を書いてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `row.classList.contains("unpaid") === true`,
        starter: `const row = document.createElement("li");
        const status = "unpaid";`,
        answer: `const row = document.createElement("li");
        const status = "unpaid";
        row.classList.toggle("unpaid", status === "unpaid");`,
        explain: "toggleの第2引数へ条件を渡すと、真偽とクラスの有無を一致させられます。",
        hints: ["statusと文字列を比較します。", "条件付きtoggleを使えます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `row.className が "unpaid" になる`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、注文行rowに、statusがunpaidのときだけunpaidクラスが付く処理を書いてください。",
      },
      {
        id: "js-dom-update-q3",
        slide: 2,
        prompt: "注文行rowへ注文id o-7と状態paidをdata属性として設定してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `row.getAttribute("data-order-id") === "o-7" && row.dataset.status === "paid"`,
        starter: `const row = document.createElement("li");`,
        answer: `const row = document.createElement("li");
        row.dataset.orderId = "o-7";
        row.dataset.status = "paid";`,
        explain: "datasetのキャメルケースはdata属性のハイフン区切りへ変換されます。",
        hints: ["orderIdはdata-order-idに対応します。", "statusもdatasetへ保存できます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `<li data-order-id="o-7" data-status="paid">`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、注文行rowへ注文id o-7と状態paidをdata属性として設定してください。",
      },
      {
        id: "js-dom-update-q4",
        slide: 3,
        prompt: "message要素が存在する場合だけ「準備完了」と表示する処理を書いてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelector("#message").textContent === "準備完了"`,
        starter: `const message = document.querySelector("#message");`,
        answer: `const message = document.querySelector("#message");
        if (message) {
          message.textContent = "準備完了";
        }`,
        explain: "要素の存在を条件にしてから更新すると、nullへアクセスしません。",
        hints: ["ifの条件に選択結果を使えます。", "条件内でtextContentを変更します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `messageがある画面だけ表示が変わる`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、message要素が存在する場合だけ「準備完了」と表示する処理を書いてください。",
      },
    ],
  },
  {
    id: "js-dom-create",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 26,
    title: "注文行を組み立てて描画する",
    summary: "createElementとappendで安全なrenderを作る",
    minutes: 20,
    slides: [
      {
        title: "createElementで部品を作る",
        lead: "createElementはまだ画面にない要素をメモリ上で作ります。注文行ならliを作り、textContentで顧客名や商品名を設定します。",
        points: ["タグ名から要素を作る", "作っただけでは画面に出ない", "利用者の文字はtextContentへ入れる"],
        diagram: "dom-create",
        code: `const row = document.createElement("li");
        row.textContent = "田中: キーボード";
        row.dataset.status = "paid";`,
        codeExample: `const amount = document.createElement("span");
        amount.textContent = "12000円";`,
        talk: [
          { speaker: "beginner", text: "注文行のliは、最初からHTMLに書いておく必要がありますか？" },
          { speaker: "engineer", text: "動的に増やすならcreateElementでメモリ上に作れます。タグ名から要素を作り、顧客名などはtextContentで入れます。" },
          { speaker: "beginner", text: "createElementした瞬間に、画面へ出ますか？" },
          { speaker: "engineer", text: "出ません。作っただけでは木に繋がっていないので、あとで親へ追加して初めて表示されます。" },
        ],
      },
      {
        title: "appendで親へつなぐ",
        lead: "作った注文行はappendでorder-listの子にすると画面へ現れます。小さなspanを行へ入れ、最後に行を一覧へ入れる順番です。",
        points: ["子要素を親の末尾へ追加する", "複数要素を一度にappendできる", "親子関係がDOMツリーへ反映される"],
        diagram: "dom-create",
        code: `const list = document.querySelector("#order-list");
        const row = document.createElement("li");
        row.textContent = "佐藤: マウス";
        list.append(row);`,
        codeExample: `const badge = document.createElement("span");
        badge.textContent = "未払い";
        row.append(badge);`,
        talk: [
          { speaker: "beginner", text: "作ったliを画面に出すには、何をすればいいですか？" },
          { speaker: "engineer", text: "order-listなど親要素へappendします。子を親の末尾へ足すと、DOMツリーに反映されて表示されます。" },
          { speaker: "beginner", text: "行の中の小さなspanも、同じ流れですか？" },
          { speaker: "engineer", text: "はい。先にspanを行へappendし、最後に行を一覧へappendする、と内側から組み立てると追いやすいです。複数も一度に渡せます。" },
        ],
      },
      {
        title: "renderは配列から画面を作る",
        lead: "renderOrdersはordersを受け取り、一覧を空にしてから各注文行を作り直します。画面を直接つぎ足すより、現在の配列を正として再描画すると整理しやすくなります。",
        points: ["replaceChildrenで古い行を消す", "forEachで注文ごとに行を作る", "件数も同じ配列から更新する"],
        diagram: "dom-render",
        code: `function renderOrders(orders) {
          const list = document.querySelector("#order-list");
          list.replaceChildren();
          orders.forEach((order) => {
            const row = document.createElement("li");
            row.textContent = \`\${order.customer}: \${order.item}\`;
            list.append(row);
          });
        }`,
        codeExample: `document.querySelector("#order-count").textContent =
          String(orders.length);`,
        talk: [
          { speaker: "beginner", text: "注文を足すたびに、古い行の横へつぎ足し続けるのが普通ですか？" },
          { speaker: "engineer", text: "ずれやすいので、renderOrdersのように配列を正として一覧を作り直す方が整理しやすいです。" },
          { speaker: "beginner", text: "作り直す前に、古い行はどうしますか？" },
          { speaker: "engineer", text: "replaceChildrenで空にしてから、forEachで注文ごとに行を作ります。件数表示も同じ配列のlengthから更新します。" },
        ],
      },
      {
        title: "innerHTMLを避けて文字を守る",
        lead: "顧客名や商品名は外から入る文字です。innerHTMLへ連結するとタグとして解釈されますが、textContentなら文字として表示されます。",
        points: ["利用者の値をHTML文字列へ連結しない", "要素はcreateElementで作る", "文字はtextContentで設定する"],
        diagram: "dom-create",
        code: `const order = { customer: "<b>田中</b>", item: "机" };
        const row = document.createElement("li");
        row.textContent = \`\${order.customer}: \${order.item}\`;`,
        codeExample: `// <b>もタグではなく文字として表示される
        document.querySelector("#order-list").append(row);`,
        talk: [
          { speaker: "beginner", text: "顧客名をinnerHTMLへ連結すれば、短く書けそうですが？" },
          { speaker: "engineer", text: "外から入る文字がタグとして解釈される危険があります。要素はcreateElement、文字はtextContent、が安全です。" },
          { speaker: "beginner", text: "textContentなら、尖ったカッコを含む名前も大丈夫ですか？" },
          { speaker: "engineer", text: "文字として表示されるので、HTMLとして実行されません。利用者の値をHTML文字列へ連結しない、が要点です。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "注文行は要素として作り、文字を設定し、親へ追加します。render関数にまとめれば、ordersから安全に同じ画面を再現できます。",
        points: ["createElementで作る", "textContentで文字を入れる", "appendでツリーへつなぐ"],
        diagram: "dom-render",
        code: `function createOrderRow(order) {
          const row = document.createElement("li");
          row.textContent = \`\${order.customer}: \${order.item}\`;
          return row;
        }`,
        codeExample: `list.append(...orders.map(createOrderRow));`,
        talk: [
          { speaker: "beginner", text: "注文行を画面へ出す手順を、短い順で確認したいです。" },
          { speaker: "engineer", text: "createElementで作り、textContentで文字を入れ、appendで親へつなぎます。これをrenderにまとめれば、ordersから同じ画面を再現できます。" },
          { speaker: "beginner", text: "なぜrenderにまとめる価値があるんですか？" },
          { speaker: "engineer", text: "追加・削除・絞り込みのあとも、同じ関数で安全に描き直せるからです。画面をバラバラにいじるよりずれが減ります。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-create-q1",
        slide: 0,
        prompt: "顧客「田中」、商品「キーボード」のli要素をrowとして作り、文字を設定してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `row.tagName === "LI" && row.textContent === "田中: キーボード"`,
        starter: `const order = { customer: "田中", item: "キーボード" };`,
        answer: `const order = { customer: "田中", item: "キーボード" };
        const row = document.createElement("li");
        row.textContent = \`\${order.customer}: \${order.item}\`;`,
        explain: "liを生成し、注文の二つの値をtextContentへまとめます。",
        hints: ["まだ一覧への追加は不要です。", "文字列にはorderのプロパティを使います。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `row が <li>田中: キーボード</li> になる`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、顧客「田中」、商品「キーボード」のli要素をrowとして作り、文字を設定してください。",
      },
      {
        id: "js-dom-create-q2",
        slide: 1,
        prompt: "作成済みrowをorder-listの末尾へ追加してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelector("#order-list").lastElementChild === row`,
        starter: `const list = document.querySelector("#order-list");
        const row = document.createElement("li");
        row.textContent = "佐藤: マウス";`,
        answer: `const list = document.querySelector("#order-list");
        const row = document.createElement("li");
        row.textContent = "佐藤: マウス";
        list.append(row);`,
        explain: "appendするとrowが一覧の子になり、末尾へ表示されます。",
        hints: ["親はlistです。", "追加したい子をappendへ渡します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `order-listの子要素数が1になる`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、作成済みrowをorder-listの末尾へ追加してください。",
      },
      {
        id: "js-dom-create-q3",
        slide: 2,
        prompt: "ordersから安全にliを作り、一覧を再描画するrenderOrdersを完成させてください。",
        lead: "この課題では `row` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelectorAll("#order-list li").length === 2 && document.querySelector("#order-list").textContent.includes("佐藤: 椅子")`,
        starter: `function renderOrders(orders) {
          const list = document.querySelector("#order-list");
          // 古い行を消し、各注文を追加
        }`,
        answer: `function renderOrders(orders) {
          const list = document.querySelector("#order-list");
          list.replaceChildren();
          orders.forEach((order) => {
            const row = document.createElement("li");
            row.textContent = \`\${order.customer}: \${order.item}\`;
            list.append(row);
          });
        }
        renderOrders([{ customer: "田中", item: "机" }, { customer: "佐藤", item: "椅子" }]);`,
        explain: "一覧を空にしてから、各注文をtextContentで行へ設定してappendします。",
        hints: ["replaceChildrenは子を空にできます。", "forEach内で一つのliを作ります。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `田中: 机 / 佐藤: 椅子`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersから安全にliを作り、一覧を再描画するrenderOrdersを完成させてください。",
      },
      {
        id: "js-dom-create-q4",
        slide: 3,
        prompt: "タグのような顧客名も文字として扱い、注文行を一覧へ安全に表示してください。innerHTMLは使いません。",
        lead: "この課題では `row` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelector("#order-list b") === null && document.querySelector("#order-list li").textContent === "<b>田中</b>: 机"`,
        starter: `const order = { customer: "<b>田中</b>", item: "机" };
        const list = document.querySelector("#order-list");`,
        answer: `const order = { customer: "<b>田中</b>", item: "机" };
        const list = document.querySelector("#order-list");
        const row = document.createElement("li");
        row.textContent = \`\${order.customer}: \${order.item}\`;
        list.append(row);`,
        explain: "textContentは入力をHTMLとして解析せず、そのまま見える文字にします。",
        hints: ["liはcreateElementで作ります。", "外から来る値はtextContentへ入れます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `<b>という記号も画面に表示される`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、タグのような顧客名も文字として扱い、注文行を一覧へ安全に表示してください。innerHTMLは使いません。",
      },
    ],
  },
  {
    id: "js-dom-event",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 27,
    title: "操作にイベントで応える",
    summary: "addEventListener、target、datasetで注文操作を受け取る",
    minutes: 20,
    slides: [
      {
        title: "addEventListenerでクリックを待つ",
        lead: "ボタンへclickのリスナーを登録すると、利用者が押した時に関数が呼ばれます。登録時には実行せず、関数そのものを渡します。",
        points: ["イベント名はclick", "第2引数はコールバック", "一度登録するとクリックごとに呼ばれる"],
        diagram: "dom-event",
        code: `const button = document.createElement("button");
        button.textContent = "支払済みにする";
        button.addEventListener("click", () => {
          button.textContent = "支払済み";
        });`,
        codeExample: `document.querySelector("#order-list").append(button);`,
        talk: [
          { speaker: "beginner", text: "ボタンを押した処理は、登録した瞬間に一度だけ動くんですか？" },
          { speaker: "engineer", text: "いいえ。addEventListenerの第2引数はコールバックなので、登録時は実行せず、クリックのたびに呼ばれます。" },
          { speaker: "beginner", text: "イベント名は自由に付けられますか？" },
          { speaker: "engineer", text: "ブラウザが決めた名前を使います。押す操作ならclickです。関数そのものを渡す点は、これまで学んだコールバックと同じです。" },
        ],
      },
      {
        title: "event.targetは操作された場所",
        lead: "リスナーが受け取るeventには、実際に操作された要素が入っています。targetを確認すると、どのボタンから始まった操作か分かります。",
        points: ["eventは発生情報を持つ", "targetは最初に操作された要素", "要素の型やmatchesを確認して使う"],
        diagram: "dom-event",
        code: `list.addEventListener("click", (event) => {
          if (!(event.target instanceof HTMLElement)) return;
          console.log(event.target.tagName);
        });`,
        codeExample: `if (event.target.matches("button")) {
          event.target.textContent = "処理済み";
        }`,
        talk: [
          { speaker: "beginner", text: "リスナーの中で、どの要素が押されたかはどう分かりますか？" },
          { speaker: "engineer", text: "引数のeventに発生情報が入り、event.targetが最初に操作された要素です。" },
          { speaker: "beginner", text: "targetをそのまま信用して、すぐにdatasetを読んでいいですか？" },
          { speaker: "engineer", text: "内側の子要素のこともあるので、要素の型やmatchesで「意図したボタンか」を確かめてから使います。" },
        ],
      },
      {
        title: "datasetで注文idを受け渡す",
        lead: "注文ボタンにdata-order-idを付けておくと、クリック時にdataset.orderIdから対象注文を識別できます。表示文字にidを埋め込む必要はありません。",
        points: ["data属性はDOMに残る小さな識別情報", "datasetでは文字列として読む", "findでordersの注文と結び付ける"],
        diagram: "dom-event",
        code: `button.dataset.orderId = "o-2";
        button.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.orderId;
          console.log(id);
        });`,
        codeExample: `const order = orders.find((item) => item.id === id);`,
        talk: [
          { speaker: "beginner", text: "押された注文を特定するために、ボタン文言へ番号を書きますか？" },
          { speaker: "engineer", text: "表示文字に埋め込まなくても、data-order-idを付けておけばクリック時にdataset.orderIdから読めます。" },
          { speaker: "beginner", text: "読んだidはどうやってordersと結び付けますか？" },
          { speaker: "engineer", text: "datasetの値は文字列なので、findでordersから同じidの注文を探します。DOMに残る小さな識別情報、と考えるとよいです。" },
        ],
      },
      {
        title: "currentTargetは登録した要素",
        lead: "targetは内側の文字やアイコンになることがあります。currentTargetはリスナーを登録した要素なので、ボタン自身のdatasetを読む場面で安定します。",
        points: ["targetは実際の発生元", "currentTargetはリスナー登録先", "用途に応じて読み分ける"],
        diagram: "dom-event",
        code: `button.addEventListener("click", (event) => {
          const clickedButton = event.currentTarget;
          clickedButton.dataset.status = "paid";
        });`,
        codeExample: `console.log(button.dataset.status); // paid`,
        callouts: [
          {
            label: "currentTargetはリスナー登録先",
            line: 1,
            token: "currentTarget",
            target: "code",
            style: "brace",
          },
        ],
        talk: [
          { speaker: "beginner", text: "targetとcurrentTargetは、同じものだと思っていました。" },
          { speaker: "engineer", text: "違うことがあります。targetは実際の発生元、currentTargetはリスナーを登録した要素です。" },
          { speaker: "beginner", text: "ボタンのdatasetを読むなら、どちらが安定しますか？" },
          { speaker: "engineer", text: "アイコンや文字がtargetになることがあるので、登録先のcurrentTargetから読む方が安定します。用途で読み分けます。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "イベントは利用者の操作が起きた時にコールバックを呼びます。操作元と登録先を区別し、data属性で注文データへつなげます。",
        points: ["リスナーには関数を渡す", "targetとcurrentTargetを区別する", "datasetから注文idを読む"],
        diagram: "dom-event",
        code: `button.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.orderId;
          markPaid(id);
        });`,
        codeExample: `button.dataset.orderId = order.id;`,
        talk: [
          { speaker: "beginner", text: "イベント処理で忘れやすい点を整理したいです。" },
          { speaker: "engineer", text: "リスナーには関数を渡し、操作が起きたときにコールバックが動きます。targetとcurrentTargetを区別し、datasetから注文idを読みます。" },
          { speaker: "beginner", text: "表示文字と注文データのつなぎは、どこに置きますか？" },
          { speaker: "engineer", text: "data属性です。画面の文言を解析するより、識別情報をDOMに持たせてordersと結び付ける方が安全です。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-event-q1",
        slide: 0,
        prompt: "一覧に追加したボタンをクリックするとmessageへ「更新しました」と表示するリスナーを登録してください。",
        lead: "この課題では `click`、`#message` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { button.click(); return Boolean(document.querySelector("#message").textContent === "更新しました"); })()`,
        starter: `const button = document.createElement("button");
        button.textContent = "更新";
        document.querySelector("#order-list").append(button);`,
        answer: `const button = document.createElement("button");
        button.textContent = "更新";
        document.querySelector("#order-list").append(button);
        button.addEventListener("click", () => {
          document.querySelector("#message").textContent = "更新しました";
        });`,
        explain: "clickイベントへ関数を登録し、その中でmessageを更新します。",
        hints: ["関数はその場で呼ばず、第2引数へ渡します。", "表示変更はリスナーの中に書きます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `クリック後: 更新しました`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、一覧に追加したボタンをクリックするとmessageへ「更新しました」と表示するリスナーを登録してください。",
      },
      {
        id: "js-dom-event-q2",
        slide: 1,
        prompt: "order-listでクリックされた要素がbuttonなら、その文字を「処理済み」へ変えてください。",
        lead: "この課題では `event`、`click` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { button.click(); return Boolean(button.textContent === "処理済み"); })()`,
        starter: `const list = document.querySelector("#order-list");
        const button = document.createElement("button");
        button.textContent = "処理";
        list.append(button);`,
        answer: `const list = document.querySelector("#order-list");
        const button = document.createElement("button");
        button.textContent = "処理";
        list.append(button);
        list.addEventListener("click", (event) => {
          if (event.target instanceof HTMLElement && event.target.matches("button")) {
            event.target.textContent = "処理済み";
          }
        });`,
        explain: "一覧のリスナーでtargetを調べ、buttonに一致した場合だけ変更します。",
        hints: ["event.targetを使います。", "matchesでタグを確認できます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `ボタンの表示だけが変化する`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、order-listでクリックされた要素がbuttonなら、その文字を「処理済み」へ変えてください。",
      },
      {
        id: "js-dom-event-q3",
        slide: 2,
        prompt: "ボタンへ注文id o-2をdata属性で設定し、クリック時にclickedIdへ保存してください。",
        lead: "この課題では `event` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { button.click(); return Boolean(clickedId === "o-2" && button.dataset.orderId === "o-2"); })()`,
        starter: `const button = document.createElement("button");
        let clickedId = "";
        document.querySelector("#order-list").append(button);`,
        answer: `const button = document.createElement("button");
        let clickedId = "";
        button.dataset.orderId = "o-2";
        button.addEventListener("click", (event) => {
          clickedId = event.currentTarget.dataset.orderId;
        });
        document.querySelector("#order-list").append(button);`,
        explain: "登録先のボタンをcurrentTargetで受け取り、datasetからidを読みます。",
        hints: ["先にbutton.datasetへidを設定します。", "クリック時は登録先要素を参照します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `clickedId が "o-2" になる`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ボタンへ注文id o-2をdata属性で設定し、クリック時にclickedIdへ保存してください。",
      },
      {
        id: "js-dom-event-q4",
        slide: 3,
        prompt: "data-order-idを持つボタンを押すと、対応するordersのstatusがpaidへ変わる処理を書いてください。",
        lead: "この課題では `event`、`item`、`click` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { button.click(); return Boolean(orders[0].status === "paid"); })()`,
        starter: `const orders = [{ id: "o-1", status: "unpaid" }];
        const button = document.createElement("button");
        button.dataset.orderId = "o-1";
        document.querySelector("#order-list").append(button);`,
        answer: `const orders = [{ id: "o-1", status: "unpaid" }];
        const button = document.createElement("button");
        button.dataset.orderId = "o-1";
        button.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.orderId;
          const order = orders.find((item) => item.id === id);
          if (order) order.status = "paid";
        });
        document.querySelector("#order-list").append(button);`,
        explain: "datasetのidで配列を検索し、見つかった注文だけを更新します。",
        hints: ["findの比較対象はorder.idです。", "見つからない場合を考えてから更新します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `orders[0].status が "paid" になる`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、data-order-idを持つボタンを押すと、対応するordersのstatusがpaidへ変わる処理を書いてください。",
      },
    ],
  },
  {
    id: "js-dom-form",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 28,
    title: "フォームから注文を受け取る",
    summary: "submit、FormData、入力検証で注文を追加する",
    minutes: 22,
    slides: [
      {
        title: "submitイベントで送信をまとめる",
        lead: "フォームはボタンのクリックではなくsubmitを受け取ります。Enterキーでの送信も同じ入口になり、preventDefaultでページ移動を止められます。",
        points: ["formへsubmitを登録する", "preventDefaultで既定送信を止める", "送信方法が違っても同じ処理になる"],
        diagram: "dom-form",
        code: `const form = document.querySelector("#order-form");
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          console.log("注文を確認");
        });`,
        codeExample: `form.dispatchEvent(new Event("submit", { cancelable: true }));`,
        talk: [
          { speaker: "beginner", text: "送信ボタンのclickだけ聞けば、フォーム入力は取れますか？" },
          { speaker: "engineer", text: "Enterキー送信を取りこぼします。formへsubmitを登録すると、押し方に関係なく同じ入口になります。" },
          { speaker: "beginner", text: "submitを受けると、ページが再読み込みされませんか？" },
          { speaker: "engineer", text: "既定の送信を止めるためpreventDefaultを呼びます。止めたあとに、自分で入力の処理を続けます。" },
        ],
      },
      {
        title: "FormDataで名前付き入力を読む",
        lead: "FormDataへformを渡すと、name属性を鍵にして入力値を読めます。customer、item、totalという画面とデータで共通の名前を使います。",
        points: ["name属性がデータの鍵", "getの結果は文字列など", "数値はNumberで変換する"],
        diagram: "dom-form",
        code: `const data = new FormData(form);
        const customer = String(data.get("customer") ?? "");
        const total = Number(data.get("total"));`,
        codeExample: `const item = String(data.get("item") ?? "");`,
        talk: [
          { speaker: "beginner", text: "入力欄を1つずつquerySelectorで拾う必要がありますか？" },
          { speaker: "engineer", text: "FormDataへformを渡せば、name属性を鍵にして値を読めます。customer・item・totalなど、画面とデータで共通の名前にします。" },
          { speaker: "beginner", text: "金額も文字列のまま足して大丈夫ですか？" },
          { speaker: "engineer", text: "getの結果は文字列などなので、数値にしたい欄はNumberで変換します。名前が揃っていると読み取りが一か所にまとまります。" },
        ],
      },
      {
        title: "空欄と金額を検証する",
        lead: "注文へ追加する前に、顧客名と商品名が空でなく、合計金額が正の数か確認します。失敗時はmessageへ理由を表示し、配列を変更しません。",
        points: ["trimで空白だけの入力を防ぐ", "Number.isFiniteで数値を確かめる", "不正なら早めにreturnする"],
        diagram: "dom-form",
        code: `if (!customer.trim() || !item.trim()) {
          message.textContent = "顧客名と商品名を入力してください";
          return;
        }
        if (!Number.isFinite(total) || total <= 0) return;`,
        codeExample: `message.textContent = "";`,
        talk: [
          { speaker: "beginner", text: "入力をそのままordersへ足して、あとで直せばいいですか？" },
          { speaker: "engineer", text: "追加前に検証します。顧客名と商品名はtrim後に空でないか、合計は正の数かを確かめ、不正なら配列を変えずにreturnします。" },
          { speaker: "beginner", text: "失敗したことは、利用者にどう伝えますか？" },
          { speaker: "engineer", text: "messageなどへ理由を表示します。Number.isFiniteで数値を確かめ、空白だけの入力もtrimで防ぎます。" },
        ],
      },
      {
        title: "検証後にordersへ追加する",
        lead: "入力が正しい場合だけ新しい注文オブジェクトを作り、ordersへ追加してrenderOrdersを呼びます。フォームをresetすると次の入力へ進めます。",
        points: ["注文の形を一か所で揃える", "初期statusはunpaid", "追加後に再描画してresetする"],
        diagram: "dom-form",
        code: `orders.push({
          id: String(Date.now()),
          customer,
          item,
          total,
          status: "unpaid",
        });
        renderOrders(orders);
        form.reset();`,
        codeExample: `message.textContent = "注文を追加しました";`,
        talk: [
          { speaker: "beginner", text: "検証を通ったあとの順番を確認したいです。" },
          { speaker: "engineer", text: "注文オブジェクトを作り、ordersへ追加し、renderOrdersで再描画し、フォームをresetします。初期statusはunpaidに揃えます。" },
          { speaker: "beginner", text: "注文の形がバラバラだと何が困りますか？" },
          { speaker: "engineer", text: "描画や保存のたびに例外が出やすくなります。追加する形を一か所で揃えると、あとが安定します。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "submitを一つの入口にし、FormDataで値を読み、検証を通った注文だけを配列へ追加します。データ変更後は再描画します。",
        points: ["submitで受けてpreventDefault", "FormDataはnameで読む", "検証してから追加とrender"],
        diagram: "dom-form",
        code: `form.addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(form);
          addOrder(data);
        });`,
        codeExample: `renderOrders(orders);`,
        talk: [
          { speaker: "beginner", text: "フォームから注文を受け取る流れを短く言えますか？" },
          { speaker: "engineer", text: "submitで受けてpreventDefaultし、FormDataでnameから読み、検証を通ったものだけ追加してrenderします。" },
          { speaker: "beginner", text: "データ変更と画面更新のタイミングは？" },
          { speaker: "engineer", text: "配列を先に変え、そのあと再描画します。検証に落ちたときは配列も画面の件数も変えません。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-form-q1",
        slide: 0,
        prompt: "order-formのsubmitでページ遷移を止め、messageへ「送信を受け取りました」と表示してください。",
        lead: "この課題では `event`、`#message` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { const event = new Event("submit", { bubbles: true, cancelable: true }); form.dispatchEvent(event); return Boolean(event.defaultPrevented && document.querySelector("#message").textContent === "送信を受け取りました"); })()`,
        starter: `const form = document.querySelector("#order-form");`,
        answer: `const form = document.querySelector("#order-form");
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          document.querySelector("#message").textContent = "送信を受け取りました";
        });`,
        explain: "submitリスナー内で既定動作を止めてから表示を変更します。",
        hints: ["対象はbuttonではなくformです。", "eventの既定動作を止めるメソッドを呼びます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `送信後も同じ画面に残る`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、order-formのsubmitでページ遷移を止め、messageへ「送信を受け取りました」と表示してください。",
      },
      {
        id: "js-dom-form-q2",
        slide: 1,
        prompt: "固定フォームへ入力済みの値からFormDataを作り、customer、item、totalを取り出してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `customer === "田中" && item === "机" && total === 12000`,
        starter: `const form = document.querySelector("#order-form");
        form.elements.customer.value = "田中";
        form.elements.item.value = "机";
        form.elements.total.value = "12000";`,
        answer: `const form = document.querySelector("#order-form");
        form.elements.customer.value = "田中";
        form.elements.item.value = "机";
        form.elements.total.value = "12000";
        const data = new FormData(form);
        const customer = String(data.get("customer"));
        const item = String(data.get("item"));
        const total = Number(data.get("total"));`,
        explain: "nameを鍵にFormDataから読み、金額だけNumberで数値へ変換します。",
        hints: ["FormDataへformを渡します。", "getには各入力のnameを指定します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `customer: 田中 / item: 机 / total: 12000`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、固定フォームへ入力済みの値からFormDataを作り、customer、item、totalを取り出してください。",
      },
      {
        id: "js-dom-form-q3",
        slide: 2,
        prompt: "空白だけのcustomerを不正とし、messageへ案内を出す検証処理を書いてください。",
        lead: "この課題では `顧客名を入力してください` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `valid === false && document.querySelector("#message").textContent === "顧客名を入力してください"`,
        starter: `const customer = "   ";
        const message = document.querySelector("#message");
        let valid = true;`,
        answer: `const customer = "   ";
        const message = document.querySelector("#message");
        let valid = true;
        if (!customer.trim()) {
          valid = false;
          message.textContent = "顧客名を入力してください";
        }`,
        explain: "trim後が空文字なら無効として、利用者が直せる案内を表示します。",
        hints: ["空白を除いてから判定します。", "不正時にvalidと表示の両方を変えます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `valid が false になる`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、空白だけのcustomerを不正とし、messageへ案内を出す検証処理を書いてください。",
      },
      {
        id: "js-dom-form-q4",
        slide: 3,
        prompt: "正しいフォーム送信でunpaidの注文をordersへ追加し、件数表示を更新してください。",
        lead: "この課題では `event`、`data`、`submit`、`#order-count` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); return Boolean(orders.length === 1 && orders[0].status === "unpaid" && document.querySelector("#order-count").textContent === "1"); })()`,
        starter: `const orders = [];
        const form = document.querySelector("#order-form");
        form.elements.customer.value = "佐藤";
        form.elements.item.value = "椅子";
        form.elements.total.value = "8000";`,
        answer: `const orders = [];
        const form = document.querySelector("#order-form");
        form.elements.customer.value = "佐藤";
        form.elements.item.value = "椅子";
        form.elements.total.value = "8000";
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(form);
          const customer = String(data.get("customer") ?? "").trim();
          const item = String(data.get("item") ?? "").trim();
          const total = Number(data.get("total"));
          if (!customer || !item || !Number.isFinite(total) || total <= 0) return;
          orders.push({ customer, item, total, status: "unpaid" });
          document.querySelector("#order-count").textContent = String(orders.length);
        });`,
        explain: "入力を検証してから注文を追加し、同じordersのlengthで件数を更新します。",
        hints: ["submit内でFormDataを作ります。", "追加する注文にはstatusも含めます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `orders[0]は佐藤の未払い注文`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、正しいフォーム送信でunpaidの注文をordersへ追加し、件数表示を更新してください。",
      },
    ],
  },
  {
    id: "js-dom-filter",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 29,
    title: "状態から絞り込み表示を作る",
    summary: "state、filter、再描画、イベント委譲を組み合わせる",
    minutes: 22,
    slides: [
      {
        title: "ordersを画面の元データにする",
        lead: "注文配列を画面状態の中心に置きます。追加や支払変更ではまずordersを変え、その結果をrenderへ渡すと、データと表示のずれを減らせます。",
        points: ["配列を正しい状態の置き場にする", "DOMだけを直接直し続けない", "変更後はrenderを呼ぶ"],
        diagram: "dom-render",
        code: `let orders = [
          { id: "o-1", customer: "田中", status: "paid" },
          { id: "o-2", customer: "佐藤", status: "unpaid" },
        ];
        renderOrders(orders);`,
        codeExample: `orders[1].status = "paid";
        renderOrders(orders);`,
        talk: [
          { speaker: "beginner", text: "支払済みにしたとき、DOMの文字だけ書き換えれば足りますか？" },
          { speaker: "engineer", text: "DOMだけ直し続けると、再描画や保存とずれます。まずordersを変え、その結果をrenderへ渡すのが中心です。" },
          { speaker: "beginner", text: "配列を正しい状態の置き場にする、とはどういう意味ですか？" },
          { speaker: "engineer", text: "画面に見えているものが一時的でも、正はordersだという考え方です。変更後は必ずrenderを呼び、表示をデータに合わせます。" },
        ],
      },
      {
        title: "filterで表示対象を選ぶ",
        lead: "status-filterの値がallなら全件、それ以外ならstatusが一致する注文だけを選びます。元のordersは消さず、表示用の新しい配列を作ります。",
        points: ["allは元配列を使う", "paidとunpaidを比較する", "filterは元配列を変更しない"],
        diagram: "dom-render",
        code: `function visibleOrders(orders, status) {
          if (status === "all") return orders;
          return orders.filter((order) => order.status === status);
        }`,
        codeExample: `const shown = visibleOrders(orders, "unpaid");`,
        talk: [
          { speaker: "beginner", text: "未払いだけ見せるとき、ordersから未払い以外を消しますか？" },
          { speaker: "engineer", text: "消すと元データが失われます。filterで表示用の新しい配列を作り、paid/unpaidを比較します。allなら元配列を使います。" },
          { speaker: "beginner", text: "filterは元のordersを書き換えますか？" },
          { speaker: "engineer", text: "書き換えません。選んだ結果の新しい配列が返り、元は残ります。表示と保存用の正本を分けられます。" },
        ],
      },
      {
        title: "changeのたびに再描画する",
        lead: "選択欄のchangeイベントで現在値を読み、絞り込んだ配列をrenderOrdersへ渡します。件数は画面に見えている注文数へ合わせます。",
        points: ["selectのvalueが選択中の値", "changeで絞り込みを実行", "表示件数はfiltered.length"],
        diagram: "dom-event",
        code: `filter.addEventListener("change", () => {
          const shown = visibleOrders(orders, filter.value);
          renderOrders(shown);
        });`,
        codeExample: `count.textContent = String(shown.length);`,
        talk: [
          { speaker: "beginner", text: "絞り込みは、ページを読み直したときだけ実行すればいいですか？" },
          { speaker: "engineer", text: "選択欄のchangeのたびに、現在のvalueで絞り込み、renderOrdersへ渡します。件数はfiltered.lengthに合わせます。" },
          { speaker: "beginner", text: "selectの値はどう読みますか？" },
          { speaker: "engineer", text: "select.valueが選択中の値です。それを条件にfilterし、見えている注文だけを描画します。" },
        ],
      },
      {
        title: "イベント委譲で作り直しに強くする",
        lead: "注文行を再描画すると各ボタンも作り直されます。order-listへ一つだけclickを登録し、closestで操作ボタンを探せば、新しい行も処理できます。",
        points: ["親へ一つのリスナーを置く", "closestで対象ボタンを探す", "datasetのidで状態を更新して再描画する"],
        diagram: "dom-event",
        code: `list.addEventListener("click", (event) => {
          if (!(event.target instanceof Element)) return;
          const button = event.target.closest("[data-order-id]");
          if (!button) return;
          markPaid(button.dataset.orderId);
          renderOrders(visibleOrders(orders, filter.value));
        });`,
        codeExample: `// 再描画後のボタンにも同じ親リスナーが働く`,
        talk: [
          { speaker: "beginner", text: "各支払ボタンへ毎回addEventListenerすれば確実ですか？" },
          { speaker: "engineer", text: "renderで行を作り直すと、古いボタンのリスナーは消えます。order-listなど親へ一つ登録し、closestでボタンを探す委譲が向きます。" },
          { speaker: "beginner", text: "親で受けたあと、どの注文を更新しますか？" },
          { speaker: "engineer", text: "見つかったボタンのdatasetのidでordersを更新し、もう一度renderします。新しい行も同じ親リスナーで処理できます。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "ordersを先に変更し、filterで表示対象を計算してrenderします。作り直される子要素のイベントは、親への委譲でまとめられます。",
        points: ["状態から表示を計算する", "絞り込み後に再描画する", "親でクリックを受ける"],
        diagram: "dom-render",
        code: `function refresh() {
          const shown = visibleOrders(orders, filter.value);
          renderOrders(shown);
          count.textContent = String(shown.length);
        }`,
        codeExample: `filter.addEventListener("change", refresh);`,
        talk: [
          { speaker: "beginner", text: "絞り込み表示の正しい順番は何ですか？" },
          { speaker: "engineer", text: "ordersを先に変更し、filterで表示対象を計算し、renderします。作り直される子のクリックは、親への委譲でまとめます。" },
          { speaker: "beginner", text: "画面に見えている件数と、保存したい全件は同じ配列ですか？" },
          { speaker: "engineer", text: "違うことがあります。正本はorders、画面はfilter後です。件数表示も、今見えている配列のlengthに合わせます。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-filter-q1",
        slide: 0,
        prompt: "ordersの2件目をpaidへ変更し、表示用のrenderOrdersへ渡してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `orders[1].status === "paid" && rendered === orders`,
        starter: `const orders = [
          { id: "o-1", status: "paid" },
          { id: "o-2", status: "unpaid" },
        ];
        let rendered = []; function renderOrders(value) { rendered = value; }`,
        answer: `const orders = [
          { id: "o-1", status: "paid" },
          { id: "o-2", status: "unpaid" },
        ];
        let rendered = []; function renderOrders(value) { rendered = value; }
        orders[1].status = "paid";
        renderOrders(orders);`,
        explain: "画面だけでなく配列の注文を変更してから、配列全体をrenderへ渡します。",
        hints: ["対象はordersの2件目です。", "変更後にrenderOrdersを呼びます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `2件ともstatusがpaid`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersの2件目をpaidへ変更し、表示用のrenderOrdersへ渡してください。",
      },
      {
        id: "js-dom-filter-q2",
        slide: 1,
        prompt: "ordersからunpaidだけを新しい配列unpaidOrdersへ取り出してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `unpaidOrders.length === 1 && unpaidOrders[0].id === "o-2" && orders.length === 2`,
        starter: `const orders = [
          { id: "o-1", status: "paid" },
          { id: "o-2", status: "unpaid" },
        ];`,
        answer: `const orders = [
          { id: "o-1", status: "paid" },
          { id: "o-2", status: "unpaid" },
        ];
        const unpaidOrders = orders.filter((order) => order.status === "unpaid");`,
        explain: "filterの条件でstatusを比較すると、元配列を保ったまま対象だけを得られます。",
        hints: ["各orderのstatusを調べます。", "元配列を直接削除しません。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `unpaidOrders[0].id が "o-2" になる`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersからunpaidだけを新しい配列unpaidOrdersへ取り出してください。",
      },
      {
        id: "js-dom-filter-q3",
        slide: 2,
        prompt: "status-filterの変更時に、選んだ状態の注文だけをorder-listへ再描画してください。",
        lead: "この課題では `renderOrders`、`values`、`row`、`shown`、`change`、`all` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { filter.value = "unpaid"; filter.dispatchEvent(new Event("change")); return Boolean(document.querySelectorAll("#order-list li").length === 1 && list.textContent === "佐藤"); })()`,
        starter: `const orders = [
          { customer: "田中", status: "paid" },
          { customer: "佐藤", status: "unpaid" },
        ];
        const filter = document.querySelector("#status-filter");
        const list = document.querySelector("#order-list");`,
        answer: `const orders = [
          { customer: "田中", status: "paid" },
          { customer: "佐藤", status: "unpaid" },
        ];
        const filter = document.querySelector("#status-filter");
        const list = document.querySelector("#order-list");
        function renderOrders(values) {
          list.replaceChildren();
          values.forEach((order) => {
            const row = document.createElement("li");
            row.textContent = order.customer;
            list.append(row);
          });
        }
        filter.addEventListener("change", () => {
          const shown = filter.value === "all"
            ? orders
            : orders.filter((order) => order.status === filter.value);
          renderOrders(shown);
        });`,
        explain: "change時のvalueで配列を絞り、その結果だけを再描画します。",
        hints: ["allだけは全件を使います。", "表示前に古い子要素を消します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `unpaid選択時は佐藤だけ表示`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、status-filterの変更時に、選んだ状態の注文だけをorder-listへ再描画してください。",
      },
      {
        id: "js-dom-filter-q4",
        slide: 3,
        prompt: "order-listへイベント委譲し、data-order-idがo-1のボタン操作で対応注文をpaidへ更新してください。",
        lead: "この課題では `event`、`action`、`item`、`click`、`[data-order-id]` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `(() => { button.querySelector("span").click(); return Boolean(orders[0].status === "paid"); })()`,
        starter: `const orders = [{ id: "o-1", status: "unpaid" }];
        const list = document.querySelector("#order-list");
        const button = document.createElement("button");
        button.dataset.orderId = "o-1";
        const label = document.createElement("span");
        label.textContent = "支払済みにする";
        button.append(label);
        list.append(button);`,
        answer: `const orders = [{ id: "o-1", status: "unpaid" }];
        const list = document.querySelector("#order-list");
        const button = document.createElement("button");
        button.dataset.orderId = "o-1";
        const label = document.createElement("span");
        label.textContent = "支払済みにする";
        button.append(label);
        list.append(button);
        list.addEventListener("click", (event) => {
          if (!(event.target instanceof Element)) return;
          const action = event.target.closest("[data-order-id]");
          if (!action) return;
          const order = orders.find((item) => item.id === action.dataset.orderId);
          if (order) order.status = "paid";
        });`,
        explain: "子のspanが押されてもclosestでdata属性を持つボタンへ上がり、注文を識別します。",
        hints: ["リスナーはlistへ登録します。", "targetからclosestで操作要素を探します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `内側のspanクリックでも注文が更新される`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、order-listへイベント委譲し、data-order-idがo-1のボタン操作で対応注文をpaidへ更新してください。",
      },
    ],
  },
  {
    id: "js-dom-storage",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 30,
    title: "注文をブラウザへ保存する",
    summary: "JSONとlocalStorageで保存・復元し、壊れた値へ備える",
    minutes: 20,
    slides: [
      {
        title: "JSONで配列を文字列にする",
        lead: "localStorageが保存できるのは文字列です。JSON.stringifyでordersを文字列へ変換し、JSON.parseで配列へ戻します。",
        points: ["stringifyは値から文字列へ変換", "parseはJSON文字列を値へ復元", "保存前後で注文の形を保つ"],
        diagram: "dom-storage",
        code: `const orders = [{ customer: "田中", status: "paid" }];
        const text = JSON.stringify(orders);
        const restored = JSON.parse(text);`,
        codeExample: `console.log(restored[0].customer); // 田中`,
        talk: [
          { speaker: "beginner", text: "orders配列を、そのままlocalStorageへ渡せますか？" },
          { speaker: "engineer", text: "localStorageが保存できるのは文字列です。JSON.stringifyで文字列へ変換し、戻すときはJSON.parseを使います。" },
          { speaker: "beginner", text: "stringifyとparseで、注文の形は保てますか？" },
          { speaker: "engineer", text: "通常のオブジェクトや配列なら保てます。保存前後で同じ欄があるか確認し、表示や集計に使える形を維持します。" },
        ],
      },
      {
        title: "localStorageへ名前を付けて保存する",
        lead: "setItemは鍵と文字列を保存します。注文管理ではordersという固定鍵にJSON文字列を入れ、変更のたびに同じ場所を更新します。",
        points: ["setItemの値は文字列", "鍵は一貫した名前にする", "注文変更後に保存する"],
        diagram: "dom-storage",
        code: `function saveOrders(orders) {
          localStorage.setItem("orders", JSON.stringify(orders));
        }`,
        codeExample: `saveOrders([{ id: "o-1", status: "unpaid" }]);`,
        talk: [
          { speaker: "beginner", text: "保存する場所はどう決めますか？" },
          { speaker: "engineer", text: "setItemの第1引数が鍵です。注文管理ではordersなど一貫した名前にJSON文字列を入れ、変更のたびに同じ鍵を更新します。" },
          { speaker: "beginner", text: "いつsetItemを呼べばいいですか？" },
          { speaker: "engineer", text: "注文の追加や状態変更など、ordersが変わった直後です。値は必ず文字列なので、先にstringifyします。" },
        ],
      },
      {
        title: "起動時に保存済み注文を戻す",
        lead: "getItemでordersを読み、値がなければ空配列を使います。復元した配列をrenderOrdersへ渡すと、再読み込み後も注文画面を戻せます。",
        points: ["getItemは未保存ならnull", "値がある場合だけparseする", "復元後にrenderする"],
        diagram: "dom-storage",
        code: `const saved = localStorage.getItem("orders");
        const orders = saved ? JSON.parse(saved) : [];
        renderOrders(orders);`,
        codeExample: `document.querySelector("#order-count").textContent =
          String(orders.length);`,
        talk: [
          { speaker: "beginner", text: "ページを開いた直後、いつも空の一覧から始まりますか？" },
          { speaker: "engineer", text: "getItemで鍵を読めば、以前の注文を戻せます。値がなければnullなので、そのときは空配列を使います。" },
          { speaker: "beginner", text: "復元したあとは何をしますか？" },
          { speaker: "engineer", text: "値がある場合だけparseし、配列をordersへ入れたらrenderOrdersを呼びます。再読み込み後も同じ画面に戻せます。" },
        ],
      },
      {
        title: "壊れた保存値は空配列へ戻す",
        lead: "保存文字列が途中で壊れているとJSON.parseは例外を投げます。try/catchで読み込みを囲み、配列でない値も拒否して安全な初期状態へ戻します。",
        points: ["parseの失敗をcatchする", "Array.isArrayで形を確認する", "失敗時は案内して空配列を使う"],
        diagram: "dom-storage",
        code: `function loadOrders() {
          try {
            const value = JSON.parse(localStorage.getItem("orders") ?? "[]");
            return Array.isArray(value) ? value : [];
          } catch {
            return [];
          }
        }`,
        codeExample: `const orders = loadOrders();
        renderOrders(orders);`,
        callouts: [
          {
            label: "parseの失敗をcatchする",
            line: 4,
            token: "catch",
            target: "code",
            style: "brace",
          },
        ],
        talk: [
          { speaker: "beginner", text: "保存文字列が壊れていたら、parseはそのまま成功しますか？" },
          { speaker: "engineer", text: "壊れていると例外になります。try/catchで囲み、失敗時は案内を出して空配列へ戻します。" },
          { speaker: "beginner", text: "parseできても配列でない値だったら？" },
          { speaker: "engineer", text: "Array.isArrayで形を確認します。配列でなければ拒否し、安全な初期状態へ戻すのが基本です。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "ordersはJSON文字列へ変換してlocalStorageへ保存します。読み込み時は未保存、壊れたJSON、配列でない値を考え、安全な空配列へ戻します。",
        points: ["stringifyして保存", "parseして復元", "try/catchと形の確認で代替する"],
        diagram: "dom-storage",
        code: `saveOrders(orders);
        const restored = loadOrders();
        renderOrders(restored);`,
        codeExample: `localStorage.getItem("orders");`,
        talk: [
          { speaker: "beginner", text: "ブラウザ保存の流れを短くまとめてください。" },
          { speaker: "engineer", text: "stringifyしてlocalStorageへ保存し、起動時はparseして復元します。未保存・壊れたJSON・配列でない値は、空配列へ代替します。" },
          { speaker: "beginner", text: "失敗した読み込みを、黙って無視してよいですか？" },
          { speaker: "engineer", text: "利用者へ案内を出し、空の一覧として再出発できる状態にした方が安全です。try/catchと形の確認がセットです。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-storage-q1",
        slide: 0,
        prompt: "ordersをJSON文字列へ変換し、復元した配列をrestoredへ代入してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `typeof json === "string" && Array.isArray(restored) && restored[0].item === "机"`,
        starter: `const orders = [{ customer: "田中", item: "机", status: "paid" }];`,
        answer: `const orders = [{ customer: "田中", item: "机", status: "paid" }];
        const json = JSON.stringify(orders);
        const restored = JSON.parse(json);`,
        explain: "stringifyの結果をparseすると、注文を持つ配列へ戻せます。",
        hints: ["先に文字列へ変換します。", "その文字列をJSONとして解析します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `restored[0].status が "paid" になる`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersをJSON文字列へ変換し、復元した配列をrestoredへ代入してください。",
      },
      {
        id: "js-dom-storage-q2",
        slide: 1,
        prompt: "ordersをJSONへ変換し、localStorageのordersという鍵へ保存してください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `JSON.parse(localStorage.getItem("orders"))[0].id === "o-1"`,
        starter: `const orders = [{ id: "o-1", status: "unpaid" }];`,
        answer: `const orders = [{ id: "o-1", status: "unpaid" }];
        localStorage.setItem("orders", JSON.stringify(orders));`,
        explain: "配列を直接渡さず、JSON文字列へ変換して固定鍵へ保存します。",
        hints: ["保存の鍵はordersです。", "第2引数をstringifyします。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `localStorageにはJSON文字列が残る`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、ordersをJSONへ変換し、localStorageのordersという鍵へ保存してください。",
      },
      {
        id: "js-dom-storage-q3",
        slide: 2,
        prompt: "保存済み注文を読み、未保存なら空配列をordersへ代入してください。",
        lead: "この課題では `saved` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `Array.isArray(orders) && orders.length === 1 && orders[0].id === "o-2"`,
        starter: `localStorage.setItem("orders", JSON.stringify([{ id: "o-2", status: "paid" }]));`,
        answer: `localStorage.setItem("orders", JSON.stringify([{ id: "o-2", status: "paid" }]));
        const saved = localStorage.getItem("orders");
        const orders = saved ? JSON.parse(saved) : [];`,
        explain: "getItemの結果がある場合だけparseし、nullなら空配列を選びます。",
        hints: ["読み込み結果を一度変数へ置きます。", "条件演算子で未保存時を分けられます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `orders.length が 1 になる`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、保存済み注文を読み、未保存なら空配列をordersへ代入してください。",
      },
      {
        id: "js-dom-storage-q4",
        slide: 3,
        prompt: "壊れたJSONでも例外を外へ出さず、空配列を返してmessageへ案内するloadOrdersを作ってください。",
        lead: "この課題では `value`、`[]`、`保存した注文を読み込めませんでした` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `Array.isArray(orders) && orders.length === 0 && document.querySelector("#message").textContent === "保存した注文を読み込めませんでした"`,
        starter: `localStorage.setItem("orders", "{broken");
        const message = document.querySelector("#message");`,
        answer: `localStorage.setItem("orders", "{broken");
        const message = document.querySelector("#message");
        function loadOrders() {
          try {
            const value = JSON.parse(localStorage.getItem("orders") ?? "[]");
            return Array.isArray(value) ? value : [];
          } catch {
            message.textContent = "保存した注文を読み込めませんでした";
            return [];
          }
        }
        const orders = loadOrders();`,
        explain: "parseをtry/catchで囲み、失敗時の画面案内と安全な空配列を用意します。",
        hints: ["例外が起こる処理をtryへ入れます。", "catchでは案内して空配列を返します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `壊れた保存値でも画面を起動できる`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、壊れたJSONでも例外を外へ出さず、空配列を返してmessageへ案内するloadOrdersを作ってください。",
      },
    ],
  },
  {
    id: "js-dom-fetch",
    track: "js",
    level: "advanced",
    chapter: "js-dom",
    order: 31,
    title: "APIから注文を読み込む",
    summary: "fetchの待機・失敗・描画を統合して注文画面を完成させる",
    minutes: 24,
    slides: [
      {
        title: "fetchで注文APIへ要求する",
        lead: "fetchはURLへ要求し、ResponseをPromiseで返します。デモでは外部通信を使わず、同じアプリの/api/demo-ordersから注文を取得します。",
        points: ["fetchはすぐに最終データを返さない", "awaitでResponseを待つ", "response.jsonもawaitする"],
        diagram: "dom-fetch",
        code: `async function loadOrders() {
          const response = await fetch("/api/demo-orders");
          const orders = await response.json();
          return orders;
        }`,
        codeExample: `loadOrders().then((orders) => console.log(orders.length));`,
        talk: [
          { speaker: "beginner", text: "fetchを呼んだ瞬間に、注文配列が返ってきますか？" },
          { speaker: "engineer", text: "すぐには最終データは来ません。ResponseのPromiseが返るので、awaitでResponseを待ち、続けてresponse.jsonもawaitします。" },
          { speaker: "beginner", text: "この講座のデモは、本当に外部サイトへ取りに行きますか？" },
          { speaker: "engineer", text: "外部通信ではなく、同じアプリの/api/demo-ordersから取得する想定です。流れは本番のfetchと同じです。" },
        ],
      },
      {
        title: "読み込み中を先に表示する",
        lead: "通信中に何も表示しないと、止まったように見えます。fetchより前にmessageを「読み込み中...」へ変え、操作の結果を待っていることを知らせます。",
        points: ["要求前にloading表示", "完了後に案内を更新", "同じmessage要素を状態表示に使う"],
        diagram: "dom-fetch",
        code: `message.textContent = "読み込み中...";
        const response = await fetch("/api/demo-orders");
        message.textContent = "注文を読み込みました";`,
        codeExample: `document.querySelector("#order-count").textContent =
          String(orders.length);`,
        talk: [
          { speaker: "beginner", text: "通信が終わるまで、画面は何も変えなくていいですか？" },
          { speaker: "engineer", text: "止まって見えるので、fetchより前にmessageを「読み込み中...」へ変えます。完了後に案内を更新します。" },
          { speaker: "beginner", text: "成功と失敗で、別の要素を用意する必要がありますか？" },
          { speaker: "engineer", text: "同じmessage要素を状態表示に使えば足ります。loading・成功・errorを、同じ場所の文言で切り替えます。" },
        ],
      },
      {
        title: "HTTP失敗をokで確認する",
        lead: "fetchは404や500でもResponseを返すため、response.okを自分で確認します。失敗なら例外を投げ、catchで利用者向けの案内を表示します。",
        points: ["okがfalseなら成功データとして扱わない", "throwでcatchへ移す", "失敗時は一覧を安全な状態にする"],
        diagram: "dom-fetch",
        code: `try {
          const response = await fetch("/api/demo-orders");
          if (!response.ok) throw new Error("注文APIエラー");
        } catch {
          message.textContent = "注文を読み込めませんでした";
        }`,
        codeExample: `list.replaceChildren();`,
        talk: [
          { speaker: "beginner", text: "fetchが例外を投げなければ、中身は成功データですか？" },
          { speaker: "engineer", text: "404や500でもResponseは返ることがあります。response.okがfalseなら成功として扱わず、throwしてcatchへ移します。" },
          { speaker: "beginner", text: "失敗したとき、一覧はどうしますか？" },
          { speaker: "engineer", text: "利用者向けの案内を出し、一覧は安全な状態（空や直前の正本）に保ちます。ok確認を飛ばさないのが要点です。" },
        ],
      },
      {
        title: "取得したordersをrenderへ渡す",
        lead: "APIのJSONをordersへ保存し、renderOrdersで一覧と件数をまとめて更新します。通信処理とDOM生成を分けると、保存済み注文にも同じrenderを再利用できます。",
        points: ["取得結果をorders状態へ代入", "描画はrenderOrdersへ任せる", "成功と失敗でmessageを分ける"],
        diagram: "dom-render",
        code: `let orders = [];
        async function refreshOrders() {
          const response = await fetch("/api/demo-orders");
          if (!response.ok) throw new Error("load failed");
          orders = await response.json();
          renderOrders(orders);
        }`,
        codeExample: `document.querySelector("#order-count").textContent =
          String(orders.length);`,
        talk: [
          { speaker: "beginner", text: "APIのJSONを、その場でDOMへ直接書き込みますか？" },
          { speaker: "engineer", text: "まずorders状態へ代入し、描画はrenderOrdersへ任せます。通信とDOM生成を分けると、保存済み注文にも同じrenderを使えます。" },
          { speaker: "beginner", text: "成功と失敗でmessageはどう分けますか？" },
          { speaker: "engineer", text: "成功なら件数や完了の案内、失敗なら理由です。どちらも、一覧更新の方針とセットで決めます。" },
        ],
      },
      {
        title: "この講義の要点",
        lead: "完成した注文画面は、読み込み中を示し、APIの成否を確認し、取得したordersを安全なrenderへ渡します。失敗しても理由を表示して画面を保ちます。",
        points: ["fetchとjsonをawaitする", "loading・成功・errorを表示する", "ordersを一つのrenderへ渡す"],
        diagram: "dom-fetch",
        code: `async function start() {
          message.textContent = "読み込み中...";
          try {
            orders = await fetchOrders();
            renderOrders(orders);
          } catch {
            message.textContent = "注文を読み込めませんでした";
          }
        }`,
        codeExample: `start(); // 注文管理画面の入口`,
        callouts: [
          {
            label: "fetchとjsonをawaitする",
            line: 3,
            token: "await",
            target: "code",
            style: "brace",
          },
        ],
        talk: [
          { speaker: "beginner", text: "APIから注文を読む完成形の手順は？" },
          { speaker: "engineer", text: "読み込み中を示し、fetchとjsonをawaitし、okで成否を確認し、成功したordersをrenderへ渡します。" },
          { speaker: "beginner", text: "失敗しても画面を保つ、とは具体的に何ですか？" },
          { speaker: "engineer", text: "理由をmessageへ出し、壊れたデータで描画を続けないことです。loading・成功・errorをはっきり切り替えます。" },
        ],
      },
    ],
    questions: [
      {
        id: "js-dom-fetch-q1",
        slide: 0,
        prompt: "fetch('/api/demo-orders')のResponseを待ち、JSONの注文をloadedへ代入する非同期関数を作ってください。",
        lead: "この課題では `loadOrders` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `Array.isArray(loaded)`,
        starter: `let loaded = [];
        // fetchは実行環境が用意します`,
        answer: `let loaded = [];
        async function loadOrders() {
          const response = await fetch("/api/demo-orders");
          loaded = await response.json();
        }
        await loadOrders();`,
        explain: "fetchとjsonの二段階をawaitし、受け取った注文配列をloadedへ保存します。",
        hints: ["関数へasyncを付けます。", "Responseとjsonの両方を待ちます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `loadedはAPIが返す注文配列`,
        exerciseKind: "worked",
        scaffoldLevel: "worked",
        projectRole: "build",
        scenario: "注文管理画面の実装で、fetch('/api/demo-orders')のResponseを待ち、JSONの注文をloadedへ代入する非同期関数を作ってください。",
      },
      {
        id: "js-dom-fetch-q2",
        slide: 1,
        prompt: "API要求を始める前にmessageへ「読み込み中...」を表示し、要求を実行してください。",
        lead: "この課題では `startLoading` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `requested === true && document.querySelector("#message").textContent === "読み込み中..."`,
        starter: `const message = document.querySelector("#message");
        let requested = false;
        const request = async () => { requested = true; };`,
        answer: `const message = document.querySelector("#message");
        let requested = false;
        const request = async () => { requested = true; };
        async function startLoading() {
          message.textContent = "読み込み中...";
          await request();
        }
        await startLoading();`,
        explain: "待ち始める直前に状態表示を変えると、利用者は処理中だと分かります。",
        hints: ["表示更新をawaitより前へ置きます。", "非同期関数からrequestを呼びます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `要求中のmessage: 読み込み中...`,
        exerciseKind: "faded",
        scaffoldLevel: "guided",
        projectRole: "build",
        scenario: "注文管理画面の実装で、API要求を始める前にmessageへ「読み込み中...」を表示し、要求を実行してください。",
      },
      {
        id: "js-dom-fetch-q3",
        slide: 2,
        prompt: "okがfalseのResponseを成功扱いせず、catchでmessageへ読込失敗を表示してください。",
        lead: "この課題では `loadOrders`、`注文APIエラー`、`注文を読み込めませんでした` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `document.querySelector("#message").textContent === "注文を読み込めませんでした"`,
        starter: `const message = document.querySelector("#message");
        const getResponse = async () => ({ ok: false });`,
        answer: `const message = document.querySelector("#message");
        const getResponse = async () => ({ ok: false });
        async function loadOrders() {
          try {
            const response = await getResponse();
            if (!response.ok) throw new Error("注文APIエラー");
          } catch {
            message.textContent = "注文を読み込めませんでした";
          }
        }
        await loadOrders();`,
        explain: "response.okを確認して例外へ変換すると、通信例外と同じcatchで案内できます。",
        hints: ["okをifで確認します。", "falseならthrowしてcatchへ進めます。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `失敗時も空白ではなく理由が見える`,
        exerciseKind: "faded",
        scaffoldLevel: "faded",
        projectRole: "build",
        scenario: "注文管理画面の実装で、okがfalseのResponseを成功扱いせず、catchでmessageへ読込失敗を表示してください。",
      },
      {
        id: "js-dom-fetch-q4",
        slide: 3,
        prompt: "注文画面を完成させてください。fetch('/api/demo-orders')中はloading、失敗時はerrorを表示し、成功時は受け取ったordersを安全に行へ描画して件数も更新します。",
        lead: "この課題では `renderOrders`、`values`、`row`、`loadOrders`、`response`、`読み込み中...`、`注文APIエラー`、`注文を読み込みました`、`注文を読み込めませんでした` を仕様で決めた名前・固定値として使います。これらをどのDOM操作へ組み込むか考えてください。",
        kind: "code",
        runtime: "dom",
        fixtureHtml: `<main>
  <p id="message"></p>
  <p>件数: <span id="order-count">0</span></p>
  <select id="status-filter">
    <option value="all">すべて</option>
    <option value="paid">支払済み</option>
    <option value="unpaid">未払い</option>
  </select>
  <form id="order-form">
    <input name="customer" />
    <input name="item" />
    <input name="total" type="number" />
    <button type="submit">追加</button>
  </form>
  <ul id="order-list"></ul>
</main>`,
        domProbe: `list.querySelectorAll("li").length === orders.length && count.textContent === String(orders.length) && (message.textContent === "注文を読み込みました" || message.textContent === "注文を読み込めませんでした")`,
        starter: `let orders = [];
        const list = document.querySelector("#order-list");
        const count = document.querySelector("#order-count");
        const message = document.querySelector("#message");
        // 実行環境のfake fetchがデモ注文を返します`,
        answer: `let orders = [];
        const list = document.querySelector("#order-list");
        const count = document.querySelector("#order-count");
        const message = document.querySelector("#message");
        function renderOrders(values) {
          list.replaceChildren();
          values.forEach((order) => {
            const row = document.createElement("li");
            row.textContent = \`\${order.customer}: \${order.item} (\${order.total}円) \${order.status}\`;
            row.dataset.status = order.status;
            list.append(row);
          });
          count.textContent = String(values.length);
        }
        async function loadOrders() {
          message.textContent = "読み込み中...";
          try {
            const response = await fetch("/api/demo-orders");
            if (!response.ok) throw new Error("注文APIエラー");
            orders = await response.json();
            renderOrders(orders);
            message.textContent = "注文を読み込みました";
          } catch {
            orders = [];
            renderOrders(orders);
            message.textContent = "注文を読み込めませんでした";
          }
        }
        await loadOrders();`,
        explain: "loadingを先に示し、ok確認、JSON取得、orders更新、renderを順に行います。catchでも安全な空配列を描画します。",
        hints: ["fetchのURLは固定の/api/demo-ordersです。", "利用者の値はtextContentへ入れます。", "成功時と失敗時の両方で画面状態を確定します。"],
        steps: [
          "安定したセレクターで対象を特定する",
          "必要なデータ変更またはDOM操作を実装する",
          "操作後の表示と状態を検証する",
        ],
        sample: `成功時はデモ注文一覧と件数、失敗時は0件と案内`,
        exerciseKind: "independent",
        scaffoldLevel: "independent",
        projectRole: "build",
        scenario: "注文管理画面の実装で、注文画面を完成させてください。fetch('/api/demo-orders')中はloading、失敗時はerrorを表示し、成功時は受け取ったordersを安全に行へ描画して件数も更新します。",
      },
    ],
  },
];
