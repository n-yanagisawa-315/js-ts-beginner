import type { Lesson } from "@/lib/course/types";

export const jsAdvanced: Lesson[] = [
  {
    id: "js-promise",
    track: "js",
    level: "advanced",
    chapter: "js-async",
    order: 21,
    title: "Promise は「後で決まる値」",
    summary: "成功と失敗を then / catch でつなぐ",
    minutes: 15,
    slides: [
      {
        title: "同期は今終わり、非同期は後で終わる",
        lead: "通常の行は、次の行の前に結果が出ます。ネットワークやタイマーは、待っているあいだに他の行を進めたいので、完了を後回しにします。`Promise` はその完了を表すオブジェクトです。状態は `pending` → `fulfilled` か `rejected` です。",
        points: [
          "一度 fulfilled か rejected になると、それ以上変わらない",
          "値（または理由）は1つ",
          "同じ Promise に then を何本でも付けられる",
        ],
        talk: [
          { speaker: "beginner", text: "fetch の結果を変数に入れた直後なら、もう本文を読めますか？" },
          { speaker: "engineer", text: "その変数は未来の完了を表す Promise で、確定した値とは別です。" },
          { speaker: "beginner", text: "待っている間は JavaScript 全体が止まるんでしょうか？" },
          { speaker: "engineer", text: "他の処理を進め、完了後に登録した処理へ渡します。状態は成功か失敗へ一度だけ進みます。" },
        ],
        diagram: "promise",
        code: `// fetch の戻り値は Promise
const p = fetch("/api");
// いまは pending（本文はまだ無い）
p.then((res) => res.json()); // 成功後は fulfilled`,
        callouts: [
          {
            label: "p は Promise。一度 fulfilled / rejected になると変わらない",
            line: 1,
            token: "fetch",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "then は成功した値を次へ渡す",
        lead: "`p.then(onOk, onNg)` の `onOk` は `fulfilled` の値を受けます。`onOk` が値を `return` すると、`then` が返す新しい `Promise` はその値で `fulfilled` です。`return` が `Promise` なら、それが終わるまで次は待ちます。これが連鎖です。",
        points: [
          "then は必ず新しい Promise を返す",
          "中で throw すると、その連鎖は rejected になる",
          "値を return し忘れると次は undefined を受け取る",
        ],
        talk: [
          { speaker: "beginner", text: "then を並べれば、前の計算結果が自動で次へ入りますか？" },
          { speaker: "engineer", text: "前のコールバックが返した値が、次の入力になります。" },
          { speaker: "beginner", text: "中で計算しただけでも、その値を覚えてくれそうです。" },
          { speaker: "engineer", text: "return が無ければ次は undefined です。連鎖では各 then の出口を確認します。" },
        ],
        diagram: "promise",
        code: `Promise.resolve(1)
  .then((n) => n + 1)
  .then((n) => n * 2);
// 最終的に 4`,
        callouts: [
          {
            label: "then は必ず新しい Promise を返す",
            line: 1,
            token: ".then",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "catch は途中の失敗を拾う",
        lead: "`rejected` は、一番近い onNg / `catch` まで飛びます。途中の `then` はスキップされます。`catch` が値を `return` すると、その先は再び `fulfilled` になり得ます（回復）。握りつぶすと、後続が成功扱いになって見えなくなるので注意します。",
        points: [
          "1つの catch で、それより上の失敗をまとめて扱える",
          "finally は成功・失敗の両方のあと（値は基本そのまま通過）",
        ],
        talk: [
          { speaker: "beginner", text: "途中の then で失敗したら、残りの then も順番に動きますか？" },
          { speaker: "engineer", text: "成功用の処理は飛ばされ、近い catch まで進みます。" },
          { speaker: "beginner", text: "catch でログを出せば、その後も失敗状態のままですよね？" },
          { speaker: "engineer", text: "値を返すと回復した成功扱いになります。再通知したいなら投げ直す必要があります。" },
        ],
        diagram: "promise",
        code: `Promise.reject(new Error("ng"))
.then(() => console.log("ok"))
.catch((e) => console.log(e.message));
// "ng" と出る。ok の行は飛ばされる`,
        callouts: [
          {
            label: "1つの catch で、それより上の失敗をまとめて扱える",
            line: 2,
            token: ".catch",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "並行は Promise.all / allSettled / race",
        lead: "`Promise.all` は全部成功したら配列。1つでも失敗すると全体が失敗。`allSettled` は全部終わるまで待ち、成功失敗を並べる。`race` は最初に決着した1つ。待ち時間の上限は `race` と timeout の組み合わせでも作れます。",
        points: [
          "独立した待ちは直列 then より all の方が短い",
          "失敗を個別に見たいなら allSettled",
        ],
        talk: [
          { speaker: "beginner", text: "独立したAPIを二つ呼ぶときも、一つずつ待つ方が安全ですか？" },
          { speaker: "engineer", text: "互いの結果を使わないなら、同時に始めてまとめて待てます。" },
          { speaker: "beginner", text: "一件失敗しても、成功した結果だけ受け取れるのが all ですか？" },
          { speaker: "engineer", text: "all は全体が失敗します。全件の成否を調べたい場合は allSettled を選びます。" },
        ],
        diagram: "promise",
        code: `await Promise.all([fetch(a), fetch(b)]);`,
        callouts: [
          {
            label: "独立した待ちは直列 then より all の方が短い",
            line: 0,
            token: "Promise",
            target: "code",
            style: "brace",
          },
        ],
        note: "`await` は次の講義で詳しく扱います。意味は「この `Promise` が決まるまで一時停止」。",
      },
      {
        title: "この講義の要点",
        lead: "`Promise` は後で決まる値。`then` は連鎖、`catch` は失敗のジャンプ。`all` は並行。次は async/await です。",
        points: ["状態は一方向（pending → fulfilled / rejected）", "then の戻り値が次の入力"],
        talk: [
          { speaker: "beginner", text: "Promise は結果そのものではなく、あとで成功か失敗に決まるものを表す、と理解しました。" },
          { speaker: "engineer", text: "合っています。then の連鎖では、前の処理が何を返すかまで追う必要があります。" },
          { speaker: "beginner", text: "独立した待ちはまとめられますが、失敗を個別に見たい場合は方法を選び分けます。" },
          { speaker: "engineer", text: "その非同期の流れを、次は async/await でもう少し順番に読みやすく書いてみましょう。" },
        ],
        diagram: "promise",
        code: `const p = Promise.resolve("ok");
p.then((value) => {
  console.log(value); // "ok"
});
console.log("先に出る");`,
        callouts: [
          {
            label: "状態は一方向（pending → fulfilled / rejected）",
            line: 0,
            token: "Promise",
            target: "code",
            style: "brace",
          },
        ],
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "バックアップ処理の完了通知を表す `p` から、あとで確定する結果を受け取って表示してください。",
        lead: "入力として、成功時に「完了」と決まる Promise が用意されています。Promise 自体ではなく、処理成功後に渡される値を `value` として受け取り、「完了」が表示されれば完成です。",
        kind: "code",
        starter:
          '// この時点ではまだ決まっていない、に見立てる\nconst p = Promise.resolve("完了");\n',
        fileName: "script.js",
        steps: [
          "用意された Promise に、成功後の処理を登録する",
          "成功後の値をvalueとして受け取り、表示結果を確認する",
        ],
        hint: "成功時の値は、Promise に成功後の処理を登録すると受け取れます。Promise 自体をそのまま表示しないようにしましょう。",
        sample: "完了",
        answer: `const p = Promise.resolve("完了");
p.then((value) => {
  console.log(value);
});`,
        explain:
          "then を付けると、fulfilled になった値を受け取れます。同じ Promise に何本でも付けられます。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "非同期に届く追加件数を then でつなぎ、order-count を更新する。",
        projectRole: "build",
        prompt: "order-count の初期値1へ追加注文1件を足し、その値を確認処理で2倍して、最終 order-countだけを表示してください。",
        lead: "入力は数値 1 で成功する Promise です。最初の成功処理の計算結果を次へ渡し、そこで2倍してから表示します。途中値は表示せず、`4` だけが出れば完了です。",
        kind: "code",
        starter: "Promise.resolve(1)\n// then を2つつないで、最後に表示\n",
        fileName: "script.js",
        steps: [
          "最初の処理で1回目の計算を行い、その結果を次へ渡す",
          "次の処理で2回目の計算を行い、最終結果を表示する",
          "表示が期待される数値だけになっているか確認する",
        ],
        hint: "次の処理へ値を渡すには、前の処理が計算結果を返す必要があります。表示だけで終えると値は引き継がれません。",
        sample: "4",
        answer: `Promise.resolve(1)
.then((n) => n + 1)
.then((n) => n * 2)
.then((n) => {
  console.log(n);
});`,
        explain:
          "1 に 1 を足して 2、それを 2 倍して 4 です。連鎖の各 then が次の入力になります。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "データ送信が失敗したとき、成功時の表示を飛ばして、失敗理由に含まれるメッセージを表示してください。",
        lead: "入力はメッセージ `ng` を持つ Error で失敗する Promise で、成功時に `ok` を表示する処理も用意されています。その行は残したまま失敗を受け取り、画面には `ng` だけが表示されれば完了です。",
        kind: "code",
        starter:
          'Promise.reject(new Error("ng"))\n .then(() => console.log("ok"))\n // 失敗を処理する\n',
        fileName: "script.js",
        steps: [
          "既存の成功時の処理を残し、その処理が実行されないことを確かめる",
          "失敗を扱う処理を追加し、受け取った理由からメッセージを表示する",
        ],
        hint: "失敗専用の処理ではエラー情報を受け取れます。画面に必要なのは、エラー全体ではなく、その中のメッセージです。",
        sample: "ng",
        answer: `Promise.reject(new Error("ng"))
.then(() => console.log("ok"))
.catch((e) => console.log(e.message));`,
        explain:
          "失敗は catch までジャンプするので、ok の行は走りません。ng と出ます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "利用者情報 `first` と商品情報 `second` の取得結果をまとめて待ち、そろった値の配列を表示してください。",
        lead: "入力として、互いに依存しない2つの Promise が用意され、それぞれ `A` と `B` で成功します。両方を同時に待つ処理を追加し、結果を `values` として受け取って `['A','B']` の順で表示できれば完了です。",
        kind: "code",
        starter:
          'const first = Promise.resolve("A");\nconst second = Promise.resolve("B");\n// 2つをまとめて待つ\n',
        fileName: "script.js",
        steps: [
          "用意された2つの Promise を同時にまとめる",
          "両方が成功した後の処理を登録する",
          "受け取った結果をvaluesとして受け取り、分解せず配列全体を表示する",
        ],
        hint: "すべてが成功したときに受け取る値は、元の並び順を保った配列です。要素を1つだけ取り出さないようにしましょう。",
        sample: '["A","B"]',
        answer: `const first = Promise.resolve("A");
const second = Promise.resolve("B");
Promise.all([first, second]).then((values) => {
  console.log(values);
});`,
        explain:
          "独立した待ちは all で重ねられます。全部成功すると [A, B] の配列になります。",
      },
    ],
  },
  {
    id: "js-async",
    track: "js",
    level: "advanced",
    chapter: "js-async",
    order: 22,
    title: "async/await は Promise を順に書く",
    summary: "一時停止に見えるが、関数は Promise を返す",
    minutes: 14,
    slides: [
      {
        title: "async 関数は必ず Promise を返す",
        lead: "`async function f() { return 1 }` の `f()` は 1 ではなく、1 で `fulfilled` する `Promise` です。`throw` すると `rejected` の `Promise` になります。呼び出し側は `then` でも `await` でも待てます。",
        points: [
          "return の値が Promise なら、それがそのまま繋がる",
          "async を付けた瞬間、戻り値の型は Promise",
        ],
        talk: [
          { speaker: "beginner", text: "async 関数の中で普通の数値を返したら、呼び出し側も数値を受け取りますか？" },
          { speaker: "engineer", text: "呼び出し側が受け取るのは、その数値で成功する Promise です。" },
          { speaker: "beginner", text: "では throw は、その場で呼び出し元を同期的に止めるんですか？" },
          { speaker: "engineer", text: "async 内の throw は失敗した Promise になります。関数名の async を見たら戻り値の包みを意識します。" },
        ],
        diagram: "async-await",
        code: `async function f() {
  return 1;
}
f().then(console.log); // 1`,
      },
      {
        title: "await は「決まるまでこの関数内で待つ」",
        lead: "`const x = await p` は、`p` が `fulfilled` なら `x` はその値、`rejected` ならその場で `throw` 相当（関数が `rejected`）です。`await` の下の行は、決まるまで実行されません。ただし、関数の外の同期コードは先に進みます。",
        points: [
          "await は async 関数（とモジュールのトップ）の中だけ",
          "待っているあいだ、他のタスクは動ける（後述のイベントループ）",
          "失敗は try/catch で同期と同じ見た目に書ける",
        ],
        talk: [
          { speaker: "beginner", text: "await を書くと、アプリ全体が結果を待って停止しますか？" },
          { speaker: "engineer", text: "止まるように見えるのは、その async 関数の続きだけです。" },
          { speaker: "beginner", text: "失敗した Promise も、変数にエラーが入って先へ進みますか？" },
          { speaker: "engineer", text: "その地点で throw と同じ流れになります。必要なら await を try の範囲に入れます。" },
        ],
        diagram: "async-await",
        code: `async function load() {
  try {
    const res = await fetch("/api");
    return await res.json();
  } catch (e) {
    console.log("失敗", e);
  }
}`,
        callouts: [
          {
            label: "await は async 関数（とモジュールのトップ）の中だけ",
            line: 2,
            token: "await",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "直列 await は合計時間が足し算",
        lead: "await a(); await b(); は a が終わってから b が始まります。独立なら const pa = a(); const pb = b(); await pa; await pb; または Promise.all で重ねます。遅く見える非同期の多くは、不要な直列です。",
        points: [
          "依存がある（b が a の結果を使う）なら直列が正しい",
          "独立なら先に両方起動する",
        ],
        talk: [
          { speaker: "beginner", text: "await を二行並べる書き方は読みやすいので、いつでもそれでよいですか？" },
          { speaker: "engineer", text: "二つ目が一つ目を必要とするなら正しいですが、独立なら待ち時間が足されます。" },
          { speaker: "beginner", text: "Promise.all を書いた瞬間に処理が始まるんですか？" },
          { speaker: "engineer", text: "多くは Promise を作る関数を呼んだ時点で始まります。開始位置と待つ位置を分けて読みます。" },
        ],
        diagram: "async-await",
        code: `const pa = fetch(urlA);
const pb = fetch(urlB);
const [a, b] = await Promise.all([pa, pb]);`,
      },
      {
        title: "for の中の await も直列",
        lead: '`for (const x of xs) { await job(x) }` は1件ずつです。並列にしたいなら `xs.map(job)` を `Promise.all` します。ただし同時接続数やレート制限には上限を付ける必要があります。',
        points: [
          "map のコールバックを async にすると、map 自体は Promise の配列をすぐ返す",
          "forEach に async を渡しても、forEach は待たない。完了待ちには向かない",
        ],
        talk: [
          { speaker: "beginner", text: "配列の全件処理なら、forEach の中に await を書けば完了まで待てますか？" },
          { speaker: "engineer", text: "forEach 自体はコールバックの Promise を待ちません。" },
          { speaker: "beginner", text: "では全部 map して Promise.all にすれば最速ですね？" },
          { speaker: "engineer", text: "同時実行数が増えすぎる場合があります。順序、依存、APIの上限を見て直列か制限付き並行を選びます。" },
        ],
        diagram: "async-await",
        code: `for (const x of xs) {
  await job(x); // 1件ずつ
}
// 並列にしたいとき
await Promise.all(xs.map((x) => job(x)));`,
        callouts: [
          {
            label: "map のコールバックを async にすると、map 自体は Promise の配列をすぐ返す",
            line: 4,
            token: ".map",
            target: "code",
            style: "brace",
          },
        ],
        watch: "`forEach` + `async` は「全部終わるまで待つ」には使えません。",
      },
      {
        title: "この講義の要点",
        lead: "`async` は `Promise` を返す糖衣。`await` は関数内の一時停止。失敗は `try`/`catch`。独立なら重ねる。次はイベントループです。",
        points: [
          "見た目は同期、実体は Promise",
          "forEach で await 完了を待たない",
        ],
        talk: [
          { speaker: "beginner", text: "await は全体を止める命令ではなく、その async 関数の続きだけを待たせるんですね。" },
          { speaker: "engineer", text: "その通りです。そして async 関数の呼び出し側には、常に Promise が返ります。" },
          { speaker: "beginner", text: "独立処理は先に始め、件数が多いときは無制限な並行にも注意します。" },
          { speaker: "engineer", text: "よい整理です。次は、待っている間にどの処理が先へ進むのかをイベントループで確かめます。" },
        ],
        diagram: "async-await",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "未読通知数を非同期に取得する想定で、数値 1 を返す非同期関数 `f` を作り、呼び出し側で確定後の値を表示してください。",
        lead: "関数内で返す未読数は通常の数値ですが、呼び出し側には Promise として届きます。成功後の値を `n` として受け取り、`1` が表示されれば完了です。",
        kind: "code",
        starter:
          "// f を定義し、確定した値を呼び出し側で受け取る\n",
        fileName: "script.js",
        steps: [
          "呼び出し結果が Promise になる関数を定義する",
          "関数内では指定された数値を戻り値にする",
          "呼び出し側で成功後の値をnとして受け取り、表示する",
        ],
        hint: "関数の中では通常の戻り値として返せますが、呼び出し側には Promise として届きます。",
        sample: "1",
        answer: `async function f() {
  return 1;
}
f().then((n) => {
  console.log(n);
});`,
        explain:
          "async 関数は必ず Promise を返します。中の 1 は fulfilled の値です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "設定データの読み込みを想定し、成功する Promise の値を待って表示してください。読み込み失敗時には用意された表示へ進める形を保ちます。",
        lead: "入力には `try` と `catch` を持つ `load` 関数があり、成功値は `ok` です。成功側で確定を待って値を `v` として表示し、失敗側の「失敗」表示はそのまま残してください。",
        kind: "code",
        starter:
          'async function load() {\n try {\n // 成功する処理を待つ\n } catch (e) {\n console.log("失敗");\n }\n}\nload();\n',
        fileName: "script.js",
        steps: [
          "成功時の範囲で Promise の完了を待ち、確定した値をvとして受け取る",
          "受け取った値を表示し、失敗時の処理は残す",
        ],
        hint: "待機は非同期関数の中で行います。確定前の Promise ではなく、待機後に得られる値を表示しましょう。",
        sample: "ok",
        answer: `async function load() {
  try {
    const v = await Promise.resolve("ok");
    console.log(v);
  } catch (e) {
    console.log("失敗");
  }
}
load();`,
        explain:
          "await は async 関数の中で、Promise が決まるまで一時停止します。",
      },
      {
        id: "q3",
        slide: 2,
        scenario: "customer と item のAPI取得を並行し、注文作成に必要な値をそろえる。",
        projectRole: "build",
        prompt: "customer `pa` と item `pb` を同時に取得する想定で、注文作成に必要な2つの Promise をまとめて待ち、結果を順番に表示してください。",
        lead: "入力の2処理はすでに開始されており、互いの結果を必要としません。両方の完了を一度に待って `a` と `b` へ対応させ、`A`、`B` を1行ずつ表示すれば完了です。",
        kind: "code",
        starter:
          'async function main() {\n const pa = Promise.resolve("A");\n const pb = Promise.resolve("B");\n // 独立した処理をまとめて待つ\n}\nmain();\n',
        fileName: "script.js",
        steps: [
          "注文作成に必要な2つの Promise をまとめて待ち、両方の結果を受け取る",
          "1つ目と2つ目の結果を、期待される順番で個別に表示する",
        ],
        hint: "複数の独立した処理には、すべての完了をまとめて待つ仕組みを使います。結果の並びは渡した順番に対応します。",
        sample: "A\nB",
        answer: `async function main() {
  const pa = Promise.resolve("A");
  const pb = Promise.resolve("B");
  const [a, b] = await Promise.all([pa, pb]);
  console.log(a);
  console.log(b);
}
main();`,
        explain:
          "依存が無ければ先に両方起動します。直列 await より短い待ちになります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "送信順を守る必要があるメッセージID `xs` を、先頭から1件ずつ完了を待って表示してください。",
        lead: "入力は `[1, 2]` で、後の処理を先に進めない直列実行が要件です。各IDを `x` として取り出し、確定した値を `v` として待ってから表示します。`1`、`2` の順になれば完了です。",
        kind: "code",
        starter:
          "async function main() {\n const xs = [1, 2];\n // 1件ずつ待って表示\n}\nmain();\n",
        fileName: "script.js",
        steps: [
          "配列を先頭から順番に取り出し、各値をxとして扱う繰り返しを選ぶ",
          "各回で確定した値をvとして受け取り、待ってから表示する",
          "表示順が配列と同じになっているか確認する",
        ],
        hint: "繰り返し自体が待機を扱える方法を使います。待機を考慮しない配列メソッドは、この問題の目的に合いません。",
        sample: "1\n2",
        answer: `async function main() {
  const xs = [1, 2];
  for (const x of xs) {
    const v = await Promise.resolve(x);
    console.log(v);
  }
}
main();`,
        explain:
          "for の中の await は直列です。並列にしたいなら map して all します。",
      },
    ],
  },
  {
    id: "js-event-loop",
    track: "js",
    level: "advanced",
    chapter: "js-async",
    order: 23,
    title: "イベントループとタスクの順番",
    summary: "同期が全部終わってから、待ち行列を消化する",
    minutes: 15,
    slides: [
      {
        title: "JavaScript は基本1本のコールスタック",
        lead: "今実行中の関数がスタックに積まれ、return で降り、次の同期の行へ進みます。重い計算を同期で回すと、描画もクリックも止まります。非同期の完了通知は、今のスタックが空になってから処理されます。",
        points: [
          "スタックが空 = 今の同期タスクが終了",
          "UI が固まるのは、長い同期がスタックを占有しているとき",
        ],
        talk: [
          { speaker: "beginner", text: "タイマーを0ミリ秒にしたのに、すぐ実行されないのは遅いPCだからですか？" },
          { speaker: "engineer", text: "現在の同期処理がスタックを空けるまで、予約した処理は入れません。" },
          { speaker: "beginner", text: "重いループ中でも、クリック処理だけ割り込めませんか？" },
          { speaker: "engineer", text: "基本は割り込みません。長い同期処理を分割しない限り、描画や入力も待たされます。" },
        ],
        diagram: "event-loop",
        code: `console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
// A C B`,
        codeCaption: "0ms でも B は同期の A,C のあと",
      },
      {
        title: "マクロタスクとマイクロタスク",
        lead: "setTimeout / setInterval / I/O 完了はマクロタスク（タスクキュー）。Promise の then / catch / queueMicrotask はマイクロタスクです。1つのマクロのあと、次のマクロの前に、マイクロを全部消化します。",
        points: [
          "Promise.resolve().then は setTimeout(0) より先",
          "then の中でまた then すると、同じマイクロの波が続く",
        ],
        talk: [
          { speaker: "beginner", text: "then と0ミリ秒タイマーは、先に書いた方から動きますか？" },
          { speaker: "engineer", text: "同期処理の後は、マイクロタスクの then がタイマーより先です。" },
          { speaker: "beginner", text: "予約した順番だけ見ればよいと思っていました。" },
          { speaker: "engineer", text: "まず同期、次にマイクロ、次にマクロという列の種類を見て、その中で順番を追います。" },
        ],
        diagram: "event-loop",
        code: `setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("then"));
console.log("sync");
// sync → then → timeout`,
      },
      {
        title: "await の「続き」はマイクロタスク",
        lead: "await の直後の行は、待っていた Promise が決まってからマイクロタスクとして再開します。そのため、await の前後で同期コードより後に回ります。",
        points: [
          "async 関数は、最初の await まで同期で走る",
          "最初の await で一旦抜け、続きは後で",
        ],
        talk: [
          { speaker: "beginner", text: "async 関数を呼んだら、最初の行から全部あと回しですか？" },
          { speaker: "engineer", text: "最初の await に着くまでは、その場で同期的に進みます。" },
          { speaker: "beginner", text: "すでに決まった値を await しても、続きはすぐ同じ流れで動きますよね？" },
          { speaker: "engineer", text: "続きはマイクロタスクへ回ります。await の前後を境に、外側の同期コードが先へ進めます。" },
        ],
        diagram: "event-loop",
        code: `async function f() {
  console.log("1");
  await null;
  console.log("2");
}
f();
console.log("3");
// 1 3 2`,
        callouts: [
          {
            label: "async 関数は、最初の await まで同期で走る",
            line: 2,
            token: "await",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "なぜこの順番を知る必要があるか",
        lead: "「0ms なのに後」はバグではなく仕様です。ローディング表示を先に出してから重い処理、状態更新のバッチ、テストの待ち、など、順番の直観がずれる場面でこの模型が効きます。",
        points: [
          "描画は多くの環境でマクロの区切りに入る",
          "無限にマイクロを生やすと、マクロ（描画）に到達しない",
        ],
        talk: [
          { speaker: "beginner", text: "順番さえ合えば、イベントループを意識しなくても困らないですか？" },
          { speaker: "engineer", text: "画面が描画されない、テストが早く確認しすぎる、といった原因の切り分けに必要です。" },
          { speaker: "beginner", text: "Promise に分ければ、重い計算でも画面は必ず滑らかになりますか？" },
          { speaker: "engineer", text: "マイクロタスクを増やし続けても描画へ戻れません。どの列へ譲るかまで考えます。" },
        ],
        diagram: "event-loop",
        watch:
          "while(true) の同期ループはキューを永遠に見ません。待たせたいなら非同期に切る。",
      },
      {
        title: "この講義の要点",
        lead: "同期が先。マイクロ（Promise）がマクロ（timeout）より先。await の続きは後回し。最後はモジュールです。",
        points: ["スタックが空いてからキュー", "then は timeout(0) より早い"],
        talk: [
          { speaker: "beginner", text: "まず今の同期処理を終え、その後は Promise 系、タイマー系の順に見ると整理できました。" },
          { speaker: "engineer", text: "基本模型としては十分です。ただし長い同期処理は、どのキューにも順番を譲りません。" },
          { speaker: "beginner", text: "await の後ろもマイクロタスクなので、書いた位置だけで実行順を決めつけないようにします。" },
          { speaker: "engineer", text: "その順番の見方を持って、次はファイル間の依存と読み込みを扱うモジュールへ進みましょう。" },
        ],
        diagram: "event-loop",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "注文受付ログを同期出力し、保存完了通知だけを次のタスクへ送る。",
        projectRole: "build",
        prompt: "注文受付開始ログ `A` と order 保存受付ログ `C` はすぐ出し、保存完了通知 `B` だけを0ミリ秒タイマーで後から表示してください。",
        lead: "3つのログは `A`、`B`、`C` の順にコードへ置きますが、タイマーの処理は現在の同期処理後に実行されます。表示順が `A`、`C`、`B` になれば完了です。",
        kind: "code",
        starter: "// 0ms でも B は同期の A, C のあと\n",
        fileName: "script.js",
        steps: [
          "最初の文字を同期処理で表示する",
          "中央の文字だけを待ち時間0のタイマーに登録する",
          "最後の文字を同期処理で表示し、実行順を確認する",
        ],
        hint: "タイマーに登録した処理は、待ち時間が0でも現在の同期処理よりあとに回ります。",
        sample: "A\nC\nB",
        answer: `console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");`,
        explain:
          "同期の A と C が先です。0ms でも B はスタックが空いてからです。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "初期化ログ `sync`、データ確定ログ `then`、タイマー通知 `timeout` を予約したとき、実際の表示順を選んでください。",
        lead: "初期化ログは現在の処理で、データ確定は Promise、通知は0ミリ秒タイマーで実行されます。記述順だけでなく、同期・マイクロタスク・マクロタスクの優先関係から並びを判断します。",
        kind: "choice",
        options: [
          "sync → then → timeout",
          "timeout → then → sync",
          "sync → timeout → then",
          "then → sync → timeout",
        ],
        steps: [
          "現在のコールスタックで実行される処理を先に特定する",
          "マイクロタスクとマクロタスクの優先関係を整理する",
          "3種類が並ぶ選択肢を選ぶ",
        ],
        hint: "現在のスタックが空いた後、次のタイマーへ進む前に消化されるキューがあります。",
        answer: "sync → then → timeout",
        explain:
          "同期 sync のあと、マイクロの then、最後にマクロの timeout です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "読み込み関数 `f` で開始ログ `1` を出したあと一度待機し、外側のログ `3` より後に完了ログ `2` を表示してください。",
        lead: "入力には、関数内の `1` と関数外の `3` の表示が用意されています。待機地点と再開後の表示を追加し、実行順が `1`、`3`、`2` になれば完了です。",
        kind: "code",
        starter:
          'async function f() {\n console.log("1");\n // await してから 2 を出す\n}\nf();\nconsole.log("3");\n',
        fileName: "script.js",
        steps: [
          "関数内の最初の表示のあとに、一度処理を中断する地点を作る",
          "再開後に次の値を表示する",
          "関数外の表示が再開後の表示より先になるか確認する",
        ],
        hint: "待機地点を通ると、関数の続きは現在の同期処理が終わったあとに再開されます。",
        sample: "1\n3\n2",
        answer: `async function f() {
  console.log("1");
  await null;
  console.log("2");
}
f();
console.log("3");`,
        explain:
          "最初の await で一旦抜け、外の 3 が先、続きの 2 は後回しです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "長い計算中に描画やタイマーへ実行機会を渡す改善として、最も適切なものを選んでください。",
        lead: "処理を Promise の連鎖に置き換えるだけでは、マイクロタスクを連続して作り、描画を待たせることがあります。どの待ち行列へ制御を戻すかが重要です。",
        kind: "choice",
        options: [
          "計算を小さく分け、区切りごとにタイマーへ制御を譲る",
          "計算全体を1つの同期ループとして最後まで続ける",
          "各計算を終わりなく続くマイクロタスクへ追加する",
          "タイマーの待ち時間を負の値にして即時実行させる",
        ],
        steps: [
          "描画や入力が進まない原因を、長い同期処理とキューの関係から考える",
          "マイクロタスクを増やし続けない方法を探す",
          "処理を分割して別のタスクへ実行機会を返す選択肢を選ぶ",
        ],
        hint: "現在のスタックを空けるだけでなく、描画が入れるマクロタスクの区切りまで進める必要があります。",
        answer: "計算を小さく分け、区切りごとにタイマーへ制御を譲る",
        explain:
          "長い同期処理を分割してタイマーへ譲ると、タスクの区切りで描画や入力を処理できます。",
      },
    ],
  },
  {
    id: "js-module",
    track: "js",
    level: "advanced",
    chapter: "js-module",
    order: 33,
    title: "モジュールはファイルが部屋",
    summary: "export した名前だけが外に出る",
    minutes: 13,
    slides: [
      {
        title: "ファイルごとにスコープが分かれる",
        lead: "ES モジュールでは、ファイルのトップレベルの let は他ファイルから見えません。見せたいものだけ export します。import は依存の宣言であり、実行順はグラフが決めます。",
        points: [
          "同じモジュールは実行中1回だけ評価される（シングルトンに近い）",
          "互いにimportする循環では、初期値が決まる前の名前を読みやすい",
        ],
        talk: [
          { speaker: "beginner", text: "別ファイルに書いた変数は、同じプロジェクトなら自動で使えますか？" },
          { speaker: "engineer", text: "モジュールごとに部屋が分かれ、export した名前だけを import できます。" },
          { speaker: "beginner", text: "import の記述順に、上からファイルが実行されるんですよね？" },
          { speaker: "engineer", text: "依存グラフを先にたどって評価します。互いに読み合う循環では初期化前の値に注意します。" },
        ],
        diagram: "modules",
        code: `export function add(a, b) {
  return a + b;
}`,
        codeExample: `import { add } from "./math.js";`,
        codeCaption: "script.js",
      },
      {
        title: "named と default は別物",
        lead: "export function add は名前付き。import { add } で受けます。export default はファイルに1つの主たる値。import X from で名前は受け側が決めます。混ぜると読み手が迷うので、プロジェクトで寄せます。",
        points: [
          "名前付きはリネーム import { add as plus }",
          "default は { } が付かない",
          "export { add } は既にある名前の再エクスポート",
        ],
        talk: [
          { speaker: "beginner", text: "import の波括弧は、分割代入と同じ意味ですか？" },
          { speaker: "engineer", text: "見た目は似ていますが、名前付き export を指定するモジュール構文です。" },
          { speaker: "beginner", text: "default でも、公開側の関数名と同じ名前で受ける必要がありますか？" },
          { speaker: "engineer", text: "受け側が名前を決められます。波括弧の有無と公開方法を一組で確認します。" },
        ],
        diagram: "modules",
        code: `export default function main() {}
import main from "./app.js";`,
      },
      {
        title: "import は静的。動的 import() は Promise",
        lead: '通常の import はファイル先頭に置き、バンドラが依存を解析します。import("./heavy.js") は実行時に読み、モジュール名前空間の Promise を返します。条件付きロードや分割に使います。',
        points: [
          "静的 import のパスは原則として文字列リテラル",
          'await import("./x.js") は { default, ...named }',
          'JSON などは import data from "./data.json" with { type: "json" }。assert は使わない',
        ],
        talk: [
          { speaker: "beginner", text: "機能を使う画面だけで、大きなモジュールを読み込めますか？" },
          { speaker: "engineer", text: "動的 import() なら実行時に読み込み、結果を Promise で受け取れます。" },
          { speaker: "beginner", text: "通常の import も関数なので、条件文の中へ移せますよね？" },
          { speaker: "engineer", text: "通常の import は静的な宣言です。丸括弧のある動的版との違いをコード上で見ます。" },
        ],
        diagram: "modules",
        code: `const { add } = await import("./math.js");`,
      },
      {
        title: "副作用だけの import もある",
        lead: 'import "./polyfill.js" は値を受け取らず、そのファイルを評価します。グローバルの拡張や CSS 側の入口に使われますが、依存が隠れやすいので乱用しません。',
        points: [
          "誰が何を変えたか追いにくい",
          "テストや SSR では評価タイミングが問題になる",
        ],
        talk: [
          { speaker: "beginner", text: "受け取る名前が無い import は、読み込んでも何も起きないのでは？" },
          { speaker: "engineer", text: "ファイルのトップレベルは評価されるので、登録や環境変更などの副作用が起きます。" },
          { speaker: "beginner", text: "便利なら初期設定を全部その形にしてよさそうです。" },
          { speaker: "engineer", text: "変更元が見えにくく、テストやSSRで時期も問題になります。副作用が目的だと分かる場所に限定します。" },
        ],
        diagram: "modules",
      },
      {
        title: "この講義の要点",
        lead: "ファイルがスコープ。export したものだけ外へ。named と default を混同しない。動的 import は Promise。次は npm パッケージです。",
        points: ["公開面を小さくする", "循環参照を避ける"],
        talk: [
          { speaker: "beginner", text: "モジュールはファイルごとに部屋を分け、必要な名前だけ外へ出す仕組みなんですね。" },
          { speaker: "engineer", text: "はい。名前付きと default は受け取り方が違い、動的 import は Promise を返します。" },
          { speaker: "beginner", text: "読み込みは単なる上から順ではなく、依存関係や副作用、循環にも気を配ります。" },
          { speaker: "engineer", text: "その公開と依存の考え方を、次は外部の道具箱である npm パッケージへ広げます。" },
        ],
        diagram: "modules",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "別ファイルの足し算機能だけを公開し、利用側から読み込める組み合わせを選んでください。",
        lead: "モジュールではファイル内の名前は自動公開されません。必要な機能だけを公開面に出し、利用側が依存を明示している組み合わせを見分けます。",
        kind: "choice",
        options: [
          "名前付き公開 add ／ 名前付き読み込み add",
          "非公開の add ／ 名前付き読み込み add",
          "既定公開 add ／ 名前付き読み込み add",
          "名前付き公開 add ／ 別ファイルから読み込み",
        ],
        steps: [
          "公開側で外へ出す宣言があるか確認する",
          "利用側が相対パスで依存を宣言しているか確認する",
          "公開名と受け取る名前が対応する組み合わせを選ぶ",
        ],
        hint: "同じプロジェクトの別ファイルは相対パスで指定し、公開側と利用側の両方にモジュール構文が必要です。",
        answer: "名前付き公開 add ／ 名前付き読み込み add",
        explain:
          "ファイルのトップレベルも部屋です。外に出す名前だけが公開面になります。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "order.total計算用モジュールからcalculateTotalを名前付きimportする。",
        projectRole: "build",
        prompt: "注文計算モジュール `order-total.js` が名前付きで公開した `calculateTotal` を、注文金額の計算ファイルで受け取る方法を選んでください。",
        lead: "入力側では公開名 `calculateTotal` をそのまま利用する必要があります。主な値を任意名で受け取る default import ではなく、名前付き公開に対応する読み込み方を見分けてください。",
        kind: "choice",
        options: [
          'import default calculateTotal from "./order-total.js"',
          'import { calculateTotal } from "./order-total.js"',
          'const { calculateTotal } = require("./order-total.js")',
          'import { calculateTotal } from "../order-total.js"',
        ],
        steps: [
          "問題が名前付きの公開について尋ねていることを確認する",
          "公開された名前を指定して受け取る選択肢を選ぶ",
        ],
        hint: "名前付きの公開では、受け取り側でも公開された名前を明示します。主な値を1つ受け取る方法とは記号の使い方が異なります。",
        answer: 'import { calculateTotal } from "./order-total.js"',
        explain:
          "named は波括弧で受けます。default は波括弧なしで、受け側が名前を決めます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "機能が必要になった時点でモジュールを読み込み、完了を待つ式を選んでください。",
        lead: "初期表示に不要な大きな機能は、実行時まで読み込みを遅らせられます。静的な宣言と、Promise を返す動的な式を区別します。",
        kind: "choice",
        options: [
          'const mod = await import("./math.js")',
          'const mod = await import "./math.js"',
          'const mod = require await "./math.js"',
          'const mod = export from "./math.js"',
        ],
        steps: [
          "実行時に評価できる読み込み構文を特定する",
          "読み込み結果が Promise であることを踏まえ、完了を待っている式を選ぶ",
        ],
        hint: "通常の読み込み宣言には丸括弧がありません。条件付きで使える方は関数のような形で、非同期に結果を返します。",
        answer: 'const mod = await import("./math.js")',
        explain:
          "実行時に読む読み込みは Promise です。決まったら named の関数を使えます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "公開値を受け取らず、初期化コードの実行だけを目的に読み込む構文を選んでください。",
        lead: "ポリフィルや登録処理は、値ではなくファイルの評価そのものが目的になる場合があります。受け取り変数を作らない読み込み方を見分けます。",
        kind: "choice",
        options: [
          'import "./polyfill.js"',
          'require "./polyfill.js"',
          'include "./polyfill.js"',
          'export "./polyfill.js"',
        ],
        steps: [
          "値や名前を受け取っていない選択肢を探す",
          "対象ファイルを評価するモジュール構文になっているか確認する",
        ],
        hint: "代入や受け取り名があると、公開値を利用する読み込みです。ここではパスだけを指定します。",
        answer: 'import "./polyfill.js"',
        explain:
          "副作用だけの読み込みは、値ではなく「実行そのもの」が目的です。乱用すると追いにくくなります。",
      },
    ],
  },
];
