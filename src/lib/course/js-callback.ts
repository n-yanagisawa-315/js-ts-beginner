import type { Lesson } from "@/lib/course/types";

export const jsCallback: Lesson[] = [
  {
    id: "js-callback",
    track: "js",
    level: "basic",
    chapter: "js-callback",
    order: 12,
    title: "関数を渡して、あとで呼んでもらう",
    summary: "コールバックは、呼び出し側がタイミングを決める関数",
    minutes: 16,
    slides: [
      {
        title: "関数は荷物。変数に入れられる",
        lead: "関数は値です。自動販売機そのものを、別の付箋に貼れます。const fn = add は、add を実行せず、機械への矢印をコピーします。括弧を付けたときだけ動きます。",
        points: [
          "add は機械。add() がボタン",
          "変数に入れても、中身は同じ手順",
          "渡すときは名前だけ。() を付けると、渡す前に動いてしまう",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "const fn = add() とすれば、fnから同じ関数を呼べますか？"
          },
          {
            "speaker": "engineer",
            "text": "それだとaddを今実行し、戻り値をfnへ入れてしまいます。"
          },
          {
            "speaker": "beginner",
            "text": "関数そのものを別名にしたいなら、括弧を外すんですね？"
          },
          {
            "speaker": "engineer",
            "text": "はい。addは機械への参照、add()はボタンを押して出た結果です。fn = addなら同じ手順を指し、fnへ括弧を付けたときに実行できます。"
          }
        ],
        diagram: "callback-flow",
        code: `function add(a, b) {
  return a + b;
}
const fn = add;
console.log(fn(2, 3)); // 5。fn も同じ機械`,
        codeCaption: "名前は機械、括弧がボタン",
        codeExample: `function add(a, b) {
  return a + b;
}
const wrong = add(2, 3);
console.log(wrong); // 5。もう実行済みの缶`,
        watch:
          "引数に add() と書くと、渡す前に動きます。渡したいなら add です。",
      },
      {
        title: "渡すと「あとで呼んでもらう」",
        lead: "コールバックは、自分では () を付けず、相手に渡す関数です。郵便の「不在票を見たらかけて」と同じで、かけるタイミングは相手が決めます。forEach に渡した関数が、その典型です。",
        points: [
          "渡す側は、中身を今は実行しない",
          "受け取る側が、準備できたら呼ぶ",
          "何回呼ばれるか、何を引数にするかも、受け取る側が決める",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "コールバックは、必ず数秒後に動く関数のことですか？"
          },
          {
            "speaker": "engineer",
            "text": "時間の後とは限らず、呼ぶタイミングを受け取った側に任せる関数です。"
          },
          {
            "speaker": "beginner",
            "text": "forEachへshowを渡すと、showが自分で配列を読みに行くんでしょうか？"
          },
          {
            "speaker": "engineer",
            "text": "forEachが各要素の準備をしてshowを呼びます。渡す側は今実行せず、受け手がいつ、何回、どんな引数で呼ぶかを決めます。"
          }
        ],
        diagram: "callback-flow",
        code: `function show(x) {
  console.log(x);
}
["りんご", "みかん"].forEach(show);
// show は2回、あとから呼ばれる`,
        codeCaption: "show を渡す。呼ぶのは forEach",
        codeExample: `function show(x) {
  console.log(x);
}
show("今すぐ"); // 自分で呼ぶ
["りんご"].forEach(show); // 相手が呼ぶ`,
      },
      {
        title: "受け取る側が、いつ・何回かを決める",
        lead: "自分でコールバックを受け取る関数を書くと、仕組みが見えます。later(fn) は、渡された機械を自分の都合で押します。fn の中身は later には分かりません。約束は「関数を1個受け取ること」だけです。",
        points: [
          "仮引数 fn に、呼び出し側の関数が入る",
          "fn() がその場でボタンを押す",
          "呼ばれ方を変えると、同じ関数でも結果の出方が変わる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "laterが受け取ったfnの中身を解析して、適切な回数を決めるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "中身を知る必要はなく、関数として呼べるという約束だけ使います。"
          },
          {
            "speaker": "beginner",
            "text": "fnと書いた行まで来れば、それだけで実行されますよね？"
          },
          {
            "speaker": "engineer",
            "text": "参照するだけでは動かず、fn()で呼びます。受け手が1回書けば1回、2回書けば2回動くので、同じコールバックでも呼び方は受け手次第です。"
          }
        ],
        diagram: "callback-flow",
        code: `function later(fn) {
  fn();
  fn();
}
later(() => console.log("hi"));
// hi が2回。later が2回押した`,
        codeCaption: "渡された関数を、受け手が押す",
        codeExample: `function once(fn) {
  fn();
}
once(() => console.log("hi"));
// 1回だけ`,
      },
      {
        title: "引数を付けてコールバックを呼ぶ",
        lead: "forEach が (x) => ... を呼ぶとき、今の要素を渡しています。受け手が fn(値) と書くと、渡した関数の仮引数にその値が入ります。作業場に品物を乗せるイメージです。",
        points: [
          "fn(x) は、コールバックへ材料を渡す",
          "受け取る関数は、仮引数でその材料に名前を付ける",
          "何を渡すかは受け手の仕事。渡す側は「来た値を使う」",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "コールバックのxは、渡す側が先に値を決めておくんですか？"
          },
          {
            "speaker": "engineer",
            "text": "何を渡すかは受け手が決め、コールバックは仮引数で受け取ります。"
          },
          {
            "speaker": "beginner",
            "text": "配列を回すeachなら、毎回同じxs全体がxに入るのでしょうか？"
          },
          {
            "speaker": "engineer",
            "text": "受け手がfn(xs[i])と呼べば、その回の要素がxに入ります。必要なら番号も追加で渡せます。配列の有効範囲だけを順に回すことも受け手の責任です。"
          }
        ],
        diagram: "loop",
        code: `function each(xs, fn) {
  for (let i = 0; i < xs.length; i++) {
    fn(xs[i]);
  }
}
each(["a", "b"], (x) => console.log(x));
// a と b`,
        codeCaption: "自作の each。中で fn(要素)",
        codeExample: `function each(xs, fn) {
  for (let i = 0; i < xs.length; i++) {
    fn(xs[i], i);
  }
}
each(["a"], (x, i) => console.log(i + x));
// 0a。番号も渡せる`,
      },
      {
        title: "タイミングが「後」でも、同じ仕組み",
        lead: "画面のクリックや、時間をおいて動く処理も、中身はコールバックです。今はシミュレートして、あとで fn を呼びます。非同期の講義では、本当に「後で」決まる値（Promise）につながります。",
        points: [
          "今すぐ呼ぶ later も、あとで呼ぶ setTimeout も、渡す側の書き方は同じ",
          "渡した関数は、呼ばれるまで中身が動かない",
          "配列メソッドの map も、中はコールバック",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "クリックや時間待ちの処理は、forEachとは別の特別な関数の仕組みですか？"
          },
          {
            "speaker": "engineer",
            "text": "呼ばれる時刻は違っても、関数を渡して受け手が呼ぶ点は同じです。"
          },
          {
            "speaker": "beginner",
            "text": "console.logを渡すときも、結果が必要だからconsole.log()と書きますか？"
          },
          {
            "speaker": "engineer",
            "text": "括弧を付けると先に実行されます。関数そのものを渡し、作業完了時に受け手がメッセージ付きで呼びます。mapや将来学ぶ非同期処理もこの考え方につながります。"
          }
        ],
        diagram: "callback-flow",
        code: `function afterWork(fn) {
  // 作業が終わった体で呼ぶ
  fn("完了");
}
afterWork((msg) => console.log(msg));
// 完了`,
        codeCaption: "終わったら呼ぶ、もコールバック",
        codeExample: `function afterWork(fn) {
  fn("完了");
}
afterWork(console.log);
// 関数をそのまま渡せる`,
        watch:
          "console.log を渡すときは console.log() と書かない。括弧を付けると先に動きます。",
      },
      {
        title: "この講義の要点",
        lead: "関数は値。() なしで渡す。呼ぶタイミングは受け手が決める。引数も受け手が付ける。次はクロージャです。",
        points: [
          "渡すのは機械、動かすのは相手",
          "map や forEach の中身も、この仕組み",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "コールバックは、関数を今動かさず相手へ渡して、必要なときに呼んでもらう仕組みなんですね。",
          },
          {
            "speaker": "engineer",
            "text": "その理解で合っています。呼ぶ時刻だけでなく、回数や渡す引数も受け取った側が決めます。",
          },
          {
            "speaker": "beginner",
            "text": "渡すときに括弧を付けておけば、相手が後でもう一度同じ関数を呼べると思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "括弧を付けると先に実行した結果を渡してしまいます。関数そのものを渡す感覚を保ったまま、次は外側の名前を覚えるクロージャへ進みましょう。",
          },
        ],
        diagram: "callback-flow",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "商品数を合計する `add` 関数を別名 `fn` でも使えるようにし、2個と3個の合計を表示してください。",
        lead:
          "starterには2つの数を合計する `add` が用意されています。代入時には実行結果ではなく関数そのものを `fn` から参照できるようにし、別名へ2と3を渡してください。結果として5が1行表示されれば完成です。",
        kind: "code",
        starter:
          "function add(a, b) {\n return a + b;\n}\n// 機械を別の名前でも押す\n",
        fileName: "script.js",
        steps: [
          "関数を実行せず、関数そのものを新しい変数から参照できるようにする",
          "新しい変数を使って2つの数値を渡し、戻り値が表示されることを確認する",
        ],
        hint:
          "代入する時点では関数を呼び出しません。関数を表す値と、関数を実行して得られる値の違いを意識しましょう。",
        sample: "5",
        answer: `function add(a, b) {
  return a + b;
}
const fn = add;
console.log(fn(2, 3));`,
        explain: "fn は add と同じ機械です。括弧を付けたときだけ動きます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "買い物リストの各商品を表示するため、`show` を配列側に1要素ずつ呼んでもらう書き方を選んでください。",
        lead:
          "starterには商品名の配列と、受け取った商品を表示する `show` が用意されています。選んだ処理によって、りんごとみかんが順に表示される必要があります。渡す時点で `show` を実行せず、関数そのものを配列へ渡す形を選んでください。",
        code: `function show(x) {
  console.log(x);
}
const xs = ["りんご", "みかん"];`,
        kind: "choice",
        options: [
          "xs.forEach(show);",
          "xs.forEach(show());",
          "show(xs[0], xs[1]);",
        ],
        steps: [
          "配列側が要素ごとに呼び出す形になっている",
          "渡す時点でshowを実行していない",
          "showが各回の要素を受け取れる",
        ],
        hint:
          "名前だけなら関数への参照、名前の直後に括弧があればその場での呼び出しです。",
        answer: "xs.forEach(show);",
        explain: "showそのものを渡すと、forEachが各要素を引数にして呼びます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "2回通知する役目の `later` を完成させ、渡された通知処理によって `hi` が2行表示されるようにしてください。",
        lead:
          "starterでは、`later` に `hi` を表示する関数が渡されます。`later` の中から受け取った通知処理を2回動かし、用意済みの呼び出しは変更しないでください。`hi` が合計2回表示されれば完成です。",
        kind: "code",
        starter:
          'function later(fn) {\n // 2回呼ぶ\n}\nlater(() => console.log("hi"));\n',
        fileName: "script.js",
        steps: [
          "`later` の中で、受け取った関数を実行する処理を考える",
          "同じ関数が合計2回実行され、表示も2回になることを確認する",
        ],
        hint:
          "関数を参照するだけでは処理は始まりません。受け取った値を関数として呼び出す必要があります。",
        sample: "hi\nhi",
        answer: `function later(fn) {
  fn();
  fn();
}
later(() => console.log("hi"));`,
        explain: "later が都合で2回押すので、hi が2回出ます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "一覧の各データへ同じ表示処理を適用する `each` を完成させ、`a` と `b` を順に1行ずつ表示してください。",
        lead:
          "starterの `each` は、データの配列と、1件を表示するコールバックを受け取ります。配列を先頭から最後まで見て、その時点の要素をコールバックへ渡してください。要素数と同じ2回呼ばれ、`a`、`b` の順で表示されれば完成です。",
        kind: "code",
        starter:
          'function each(xs, fn) {\n // 各要素で fn を呼ぶ\n}\neach(["a", "b"], (x) => console.log(x));\n',
        fileName: "script.js",
        steps: [
          "カウンタ i を0から始め、配列の有効な範囲だけを先頭から末尾まで繰り返す",
          "各回で現在の要素をコールバックへ渡し、順序と呼び出し回数を確認する",
        ],
        hint:
          "コールバックを呼ぶだけでなく、その回に処理している配列要素を引数として渡します。配列の範囲を越えないことにも注意しましょう。",
        sample: "a\nb",
        answer: `function each(xs, fn) {
  for (let i = 0; i < xs.length; i++) {
    fn(xs[i]);
  }
}
each(["a", "b"], (x) => console.log(x));`,
        explain: "受け手が要素を引数にしてコールバックを呼びます。",
      },
      {
        id: "q5",
        slide: 4,
        prompt:
          "作業終了を知らせる `afterWork` を完成させ、受け取った通知処理へ文字列「完了」を渡してください。",
        lead:
          "starterでは、`afterWork` の外側に、受け取ったメッセージを表示する関数が用意されています。作業が終わった場面として内側からコールバックを実行し、終了情報を引数で渡してください。「完了」が1行表示されれば完成です。",
        kind: "code",
        starter:
          "function afterWork(fn) {\n // 完了を渡して呼ぶ\n}\nafterWork((msg) => console.log(msg));\n",
        fileName: "script.js",
        steps: [
          "`afterWork` の中で、受け取った関数を呼び出す",
          "呼び出す際に完了を表す文字列を渡し、受け取り側で表示されることを確認する",
        ],
        hint:
          "コールバックの仮引数に値が入るよう、呼び出す側から必要なメッセージを引数として渡しましょう。",
        sample: "完了",
        answer: `function afterWork(fn) {
  fn("完了");
}
afterWork((msg) => console.log(msg));`,
        explain: "タイミングが後でも、渡す・呼ぶの形は同じです。",
      },
    ],
  },
];
