import type { Lesson } from "@/lib/course/types";

export const jsBasic: Lesson[] = [
  {
    id: "js-function",
    track: "js",
    level: "basic",
    chapter: "js-fn",
    order: 9,
    title: "関数は手順をまとめた値",
    summary: "引数を受け取り、戻り値を返す流れ",
    minutes: 18,
    slides: [
      {
        title: "関数の定義は、手順に名前を付ける",
        lead: "関数は、あとで使う手順をひとまとまりにしたものです。自動販売機を設置する場面を想像してください。function add(a, b) { ... } の行へ来ても、中の計算はまだ始まりません。まずaddという名前で手順を呼べるようにします。",
        points: [
          "function は関数を定義する合図",
          "add は関数名。あとでこの名前を使う",
          "{ } の中が、呼ばれたときに実行する手順",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "関数を書いた行まで来たら、中の計算もすぐ始まりますか？"
          },
          {
            "speaker": "engineer",
            "text": "定義しただけでは動かず、名前に()を付けて呼んだときに始まります。"
          },
          {
            "speaker": "beginner",
            "text": "function、add、丸括弧、波括弧にはそれぞれ役割があるのですね？"
          },
          {
            "speaker": "engineer",
            "text": "そうです。functionは定義、addは名前、丸括弧は入力用の名前を書く場所、波括弧は手順です。まずは定義しただけでは中が動かないと覚えましょう。"
          }
        ],
        diagram: "fn-box",
        code: `function add(a, b) {
  return a + b;
}
// ここでは定義しただけ。中はまだ動かない`,
        codeCaption: "販売機を設置した段階",
        codeExample: `function add(a, b) {
  return a + b;
}
// add という手順を用意した`,
      },
      {
        title: "関数名の後ろの () で呼び出す",
        lead: "定義した関数を実際に動かす操作を、呼び出しといいます。add(2, 3) のように関数名の後ろへ丸括弧を付けると、波括弧の中が上から実行されます。add と名前だけを書く場合は、関数そのものを指すだけで実行しません。",
        points: [
          "add は関数そのものを指す",
          "add() は関数を今ここで実行する",
          "丸括弧の中には、関数へ渡す値を書く",
        ],
        talk: [
          {
            speaker: "beginner",
            text: "関数名を書くだけで、中の手順が始まるのではないのですか？",
          },
          {
            speaker: "engineer",
            text: "名前だけなら関数そのものを指します。後ろへ丸括弧を付けたときが呼び出しです。",
          },
          {
            speaker: "beginner",
            text: "addとadd()は、同じ意味ではないのですね？",
          },
          {
            speaker: "engineer",
            text: "addは機械そのもの、add()はボタンを押して動かす操作です。値を渡す場合は丸括弧の中へ書きます。",
          },
        ],
        diagram: "fn-box",
        code: `function hello() {
  console.log("hello");
}
hello;   // 実行しない
hello(); // ここで "hello" を表示`,
        codeCaption: "() が実行ボタン",
      },
      {
        title: "同じ機械は、何度でも呼べる",
        lead: "販売機は1回使ったら壊れません。add(2, 3) のあと add(10, 1) もできます。毎回、新しい入力で中が最初から走ります。前回の計算の途中経過は残りません。残したい結果は、戻り値を変数に付けます。",
        points: [
          "呼び出すたびに、中の手順が最初から実行される",
          "違う入力なら、違う缶が出る",
          "同じ入力なら、同じ缶が出る（中が乱数などでなければ）",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "一度計算した関数には、前回の途中結果が残っていますか？"
          },
          {
            "speaker": "engineer",
            "text": "通常の局所的な計算は、呼ぶたび最初から始まります。"
          },
          {
            "speaker": "beginner",
            "text": "同じ入力で2回呼ぶと、前回の答えを再利用するわけではない？"
          },
          {
            "speaker": "engineer",
            "text": "中の手順を毎回実行します。乱数などがなければ同じ入力から同じ結果になりますが、後で使いたい結果は戻り値を変数へ結び付けて残します。"
          }
        ],
        diagram: "fn-box",
        code: `function add(a, b) {
  return a + b;
}
console.log(add(2, 3)); // 5
console.log(add(10, 1)); // 11`,
        codeCaption: "設置は1回。ボタンは何度でも",
        codeExample: `function double(n) {
  return n * 2;
}
console.log(double(3));
console.log(double(3));
// どちらも 6。機械は消耗しない`,
      },
      {
        title: "仮引数は受け取り口、実引数は渡す値",
        lead: "function greet(name) の name は、関数側が用意する受け取り口で、仮引数と呼びます。greet(\"Aya\") の \"Aya\" は、呼び出し側が実際に渡す値で、実引数と呼びます。呼び出すと、実引数が対応する仮引数へ結び付きます。",
        points: [
          "仮引数: 定義側の受け取り口 name",
          '実引数: 呼び出し側が渡す値 "Aya"',
          "仮引数は呼び出している間だけ使う一時的な名前",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "関数のaやbは、外に同じ名前の変数があればそれを使うんですか？"
          },
          {
            "speaker": "engineer",
            "text": "仮引数は、呼び出し時に渡された値へ一時的に付く別の名前です。"
          },
          {
            "speaker": "beginner",
            "text": "仮引数と実引数は、どちらも同じ引数という意味ですか？"
          },
          {
            "speaker": "engineer",
            "text": "関数を定義する側の名前が仮引数、呼び出す側が渡す値が実引数です。Ayaを渡した呼び出し中だけ、nameがその値を指します。"
          }
        ],
        diagram: "fn-box",
        code: `function greet(name) { // name が仮引数
  return "hi " + name;
}
greet("Aya"); // "Aya" が実引数`,
        codeCaption: "渡した値が受け取り口へ入る",
        codeExample: `function greet(name) {
  return "hi " + name;
}
console.log(greet("Aya")); // "hi Aya"`,
      },
      {
        title: "省略した実引数は undefined になる",
        lead: "greet() のように値を渡さないと、対応する仮引数nameはundefinedになります。省略を許したい場合は function greet(name = \"客\") のように既定値を書きます。実引数がundefinedのときだけ、既定値が使われます。",
        points: [
          "足りない実引数に対応する仮引数は undefined",
          "仮引数 = 値 で、省略時の既定値を用意できる",
          "多すぎる実引数は、通常は対応する受け取り口がなく無視される",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "必要な実引数を入れ忘れたら、すぐ文法エラーになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "JavaScriptでは呼び出せますが、不足した受け取り口はundefinedになります。"
          },
          {
            "speaker": "beginner",
            "text": "名前を省略しても自然な挨拶にしたい場合はどうしますか？"
          },
          {
            "speaker": "engineer",
            "text": "仮引数へ既定値を書きます。greet()なら客、greet(\"Aya\")なら渡したAyaが使われます。"
          }
        ],
        diagram: "fn-box",
        code: `function greet(name = "客") {
  return "hi " + name;
}
greet(); // "hi 客"
greet("Aya"); // "hi Aya"`,
        codeCaption: "空の受け取り口へ既定値を入れる",
      },
      {
        title: "return は値を呼び出し元へ渡す",
        lead: "returnの後ろへ書いた値が、その関数の戻り値です。呼び出し式は、返された値に置き換わったように考えられます。関数内のconsole.logは表示するだけで、値を呼び出し元へ渡す操作ではありません。",
        points: [
          "return: 後の計算で使える値を返す",
          "console.log: 画面へ表示する",
          "return が無い関数の戻り値は undefined",
        ],
        talk: [
          {
            speaker: "beginner",
            text: "関数の中で6を表示できたら、呼び出し結果も6ですよね？",
          },
          {
            speaker: "engineer",
            text: "表示と戻り値は別です。後の計算へ渡す値はreturnで返します。",
          },
          {
            speaker: "beginner",
            text: "returnがない関数を変数へ代入すると、何が入りますか？",
          },
          {
            speaker: "engineer",
            text: "undefinedが入ります。画面に表示された値が自動で戻り値になることはありません。",
          },
        ],
        diagram: "fn-box",
        code: `function double(n) {
  return n * 2;
}
function shout(n) {
  console.log(n * 2);
}`,
        codeCaption: "log は音、return は取出口",
        codeExample: `const result = double(3); // 6
const noResult = shout(3); // undefined`,
      },
      {
        title: "return へ到達すると関数はその場で終わる",
        lead: "returnは値を返すだけでなく、その関数の実行をそこで終了します。returnより後ろにある同じ呼び出し内の行は動きません。条件に合わないとき先にreturnする書き方を、早期returnと呼びます。",
        points: [
          "return より後ろの行は、その呼び出しでは実行されない",
          "return; と値なしで書くと undefined を返して終了する",
          "条件に合わない場合を先に終えると、残りの処理を読みやすくできる",
        ],
        talk: [
          {
            speaker: "beginner",
            text: "returnのあとも、波括弧の最後までは実行されますか？",
          },
          {
            speaker: "engineer",
            text: "いいえ。returnへ到達した時点で、その関数呼び出しは終了します。",
          },
          {
            speaker: "beginner",
            text: "条件に合わない場合だけ先に終わらせることもできますか？",
          },
          {
            speaker: "engineer",
            text: "できます。早期returnを使うと、正常な処理を深いifの中へ入れずに済みます。",
          },
        ],
        diagram: "fn-box",
        code: `function label(score) {
  if (score < 0) return "invalid";
  return "ok";
  console.log("ここは動かない");
}`,
        codeCaption: "return が関数の出口",
      },
      {
        title: "アロー関数は短い手順の書き方",
        lead: "const add = (a, b) => a + b は、右辺が式だけのとき return を省略できます。小さな販売機を1行で置く書き方です。波括弧を付けた場合は return が必要です。this の扱いが function と違う点は、中級の this の講義で扱います。",
        points: [
          "引数が1つなら括弧を省略できる (n) => でも n => でも可",
          "本文が { } なら、値を返すには return",
          "関数を値として渡すとき、短く書ける",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "=>を使えば、どんな関数でもreturnを書かなくていいですか？"
          },
          {
            "speaker": "engineer",
            "text": "本文が式1つなら省略できますが、波括弧を付けたらreturnが必要です。"
          },
          {
            "speaker": "beginner",
            "text": "引数が1つのとき、括弧がある例とない例は別の意味ですか？"
          },
          {
            "speaker": "engineer",
            "text": "どちらでも同じです。短い関数を値として渡す場面で便利です。functionとのthisの違いはありますが、それは中級で扱います。"
          }
        ],
        diagram: "fn-box",
        code: `const add = (a, b) => a + b;
const add2 = (a, b) => {
  return a + b;
};`,
        codeCaption: "式だけなら return を省略できる",
        codeExample: `const double = (n) => n * 2;
console.log(double(3)); // 6
const double2 = (n) => {
  return n * 2;
};`,
      },
      {
        title: "この講義の要点",
        lead: "関数は自動販売機。() でボタン。引数は投入、return は取出口。log は音であって缶ではない。何度でも呼べる。次は名前の見える範囲です。",
        points: [
          "定義と呼び出しを分けて考える",
          "戻り値が次の計算の材料になる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "関数は、必要なときに入力を渡して動かせる、再利用可能な手順なんですね。",
          },
          {
            "speaker": "engineer",
            "text": "その通りです。定義しただけの状態と、括弧を付けて呼び出した状態を区別できています。",
          },
          {
            "speaker": "beginner",
            "text": "関数内で結果を表示できれば、その値は呼び出し元でも続けて使えると思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "表示と返却は別なので、材料として渡すならreturnが必要です。次は関数内外で、どの名前が見えるのかを確認しましょう。",
          },
        ],
        diagram: "fn-box",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "関数を定義した直後の状態として正しい説明を1つ選んでください。",
        lead: "function hello() { console.log(\"hello\"); } の行へ到達しましたが、hello()はまだ書かれていません。定義と実行を分けて考えてください。",
        kind: "choice",
        options: [
          "手順だけ用意され、まだ動かない",
          "手順が自動で1回だけ動く",
          "表示だけが先に1回動く",
          "関数名をまだ利用できない",
        ],
        steps: [
          "定義と呼び出しを区別する",
          "丸括弧付きの呼び出しがあるか確認する",
        ],
        hint: "関数名の後ろに実行ボタンの丸括弧はまだありません。",
        answer: "手順だけ用意され、まだ動かない",
        explain: "function文は手順を定義します。中身はhello()と呼び出したときに実行されます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "定義済みのhello関数を1回実行してください。",
        lead: "starterにはhelloの定義があります。関数本体を書き直さず、関数名の後ろへ実行を表す記号を付けて1回呼び出します。",
        kind: "code",
        starter: 'function hello() {\n  console.log("hello");\n}\n// ここで1回呼び出す\n',
        fileName: "script.js",
        steps: [
          "定義済みの関数名を確認する",
          "関数名の後ろへ丸括弧を付けて呼び出す",
        ],
        hint: "名前だけを書くのではなく、実行ボタンに当たる丸括弧を続けます。",
        sample: "hello",
        answer: `function hello() {
  console.log("hello");
}
hello();`,
        explain: "helloは関数そのもの、hello()は関数を実行する呼び出しです。",
      },
      {
        id: "q3",
        slide: 2,
        scenario: "複数明細の金額を再利用可能な calculateTotal 関数で合計する。",
        projectRole: "build",
        prompt: "用意済みのcalculateTotal関数で、明細金額2と3、10と1の注文合計をそれぞれ表示してください。",
        lead: "calculateTotalは2つの明細金額を受け取って合計を返します。関数本体は変更せず、2組の入力で順に呼び出し、5と11が別々の行へ表示されれば完成です。",
        kind: "code",
        starter: "function calculateTotal(a, b) {\n  return a + b;\n}\n// 2件の注文合計を計算する\n",
        fileName: "script.js",
        steps: [
          "最初の2値をcalculateTotalへ渡して結果を表示する",
          "次の2値でもcalculateTotalを呼び出して結果を表示する",
          "2行の順番と値を確認する",
        ],
        hint: "関数の定義はすでに完成しています。同じ関数名に、呼び出すたび異なる引数を渡します。",
        sample: "5\n11",
        answer: `function calculateTotal(a, b) {
  return a + b;
}
console.log(calculateTotal(2, 3));
console.log(calculateTotal(10, 1));`,
        explain: "呼び出すたびに別の実行領域が作られます。1回目はa=2・b=3から5を返して終了します。2回目は新しくa=10・b=1から始まるため、前回の途中状態は混ざりません。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "function greet(name)とgreet(\"Aya\")について、仮引数と実引数の組み合わせを選んでください。",
        lead: "定義側の受け取り口と、呼び出し側が実際に渡す値を区別します。",
        kind: "choice",
        options: [
          'nameが仮引数、"Aya"が実引数',
          '"Aya"が仮引数、nameが実引数',
          'nameも"Aya"も仮引数',
          'nameも"Aya"も実引数',
        ],
        steps: [
          "関数定義の丸括弧内を確認する",
          "関数呼び出しの丸括弧内を確認する",
        ],
        hint: "仮引数は受け取り口の名前、実引数は呼び出すときに渡す値です。",
        answer: 'nameが仮引数、"Aya"が実引数',
        explain: "定義側のnameが仮引数、呼び出し側の\"Aya\"が実引数です。",
      },
      {
        id: "q5",
        slide: 4,
        prompt: "省略時は客、名前を渡したときはその名前を使って挨拶文を返すgreet関数を完成させてください。",
        lead: "starterには既定値付きの仮引数と、引数なし・引数ありの2回の呼び出しがあります。関数内ではhi、半角スペース、nameの値を1つの文字列にして返してください。表示は外側ですでに行われます。",
        kind: "code",
        starter:
          'function greet(name = "客") {\n // ここに書いてください\n}\nconsole.log(greet());\nconsole.log(greet("Aya"));\n',
        fileName: "script.js",
        steps: [
          "hiとnameから挨拶文を作る",
          "作った文字列を戻り値として返す",
          "省略時と指定時の2行を確認する",
        ],
        hint: "仮引数の既定値はstarterにあります。関数内では、固定部分とnameの値をつないだ文字列を返します。",
        sample: "hi 客\nhi Aya",
        answer: `function greet(name = "客") {
  return "hi " + name;
}
console.log(greet());
console.log(greet("Aya"));`,
        explain:
          "greet()では引数がundefinedなので既定値「客」がnameへ入ります。greet(\"Aya\")では渡した値が優先されます。どちらも呼び出し中だけnameが存在し、returnした文字列が外側のconsole.logへ渡ります。",
      },
      {
        id: "q6",
        slide: 5,
        prompt: "価格を2倍にして後の計算へ渡すdoubleと、確認用に2倍の値を表示するだけのshoutを完成させてください。",
        lead: "starterには2つの関数と、入力3で戻り値を確認する処理があります。doubleは計算結果を返し、shoutは関数内で表示するだけにしてください。実行結果が6、6、undefinedの3行になれば完成です。",
        kind: "code",
        starter:
          "function double(n) {\n // 2倍を返す\n}\nfunction shout(n) {\n // 2倍を表示するだけ\n}\nconsole.log(double(3));\nconsole.log(shout(3));\n",
        fileName: "script.js",
        steps: [
          "doubleで2倍の値を計算して返す",
          "shoutで2倍の値を関数内から表示する",
          "shoutには戻り値を追加しない",
          "3行の出力順を確認する",
        ],
        hint: "値を後で使えるようにするのが戻り値です。表示だけの関数では、明示的に返さなければ戻り値は未定義になります。",
        sample: "6\n6\nundefined",
        answer: `function double(n) {
  return n * 2;
}
function shout(n) {
  console.log(n * 2);
}
console.log(double(3));
console.log(shout(3));`,
        explain:
          "doubleはreturnで6を呼び出し元へ渡します。shoutは内部のconsole.logで6を表示しますが、returnがないため呼び出し式の値はundefinedです。内部表示の6と外側表示のundefinedは別の結果です。",
      },
      {
        id: "q7",
        slide: 6,
        prompt: "負の数ならinvalidを返して終了し、それ以外ならokを返すcheck関数を完成させてください。",
        lead: "負の数の場合は最初のreturnで関数を終了します。その条件に当てはまらない場合だけ、次のreturnへ進みます。",
        kind: "code",
        starter: 'function check(n) {\n  if (n < 0) {\n    // invalidを返して終了\n  }\n  return "ok";\n}\nconsole.log(check(-1));\nconsole.log(check(1));\n',
        fileName: "script.js",
        steps: [
          "負の数を判定するifの中でinvalidを返す",
          "それ以外では既存のreturnまで進む",
          "2行の出力を確認する",
        ],
        hint: "表示ではなく、ifの中から値を返して関数を終了します。",
        sample: "invalid\nok",
        answer: `function check(n) {
  if (n < 0) {
    return "invalid";
  }
  return "ok";
}
console.log(check(-1));
console.log(check(1));`,
        explain: "nが負なら最初のreturnで終了するため、後ろのreturn \"ok\"へは進みません。",
      },
      {
        id: "q8",
        slide: 7,
        prompt: "2種類の商品の個数をaとbとして受け取るaddを、式だけの短いアロー関数として用意し、2と3の合計を表示してください。",
        lead: "addは2つの個数を受け取り、合計値を返す役目です。今回は波括弧を持つ本文や明示的なreturnを使わずに定義し、呼び出し結果として5が表示されれば完成です。",
        kind: "code",
        starter: "// 右辺が式だけのアロー関数を書いてください\n",
        fileName: "script.js",
        steps: [
          "2つの仮引数を受け取るアロー関数を作る",
          "本文を合計を求める1つの式にする",
          "2と3を渡した戻り値を表示する",
        ],
        hint: "式だけのアロー関数では、その式の結果が戻り値です。ブロック本文に切り替えないことが確認点です。",
        sample: "5",
        answer: `const add = (a, b) => a + b;
console.log(add(2, 3));`,
        explain: "式だけのアロー関数では、=>の右側を評価した結果が暗黙にreturnされます。add(2, 3)ではaとbが2と3へ結び付けられ、a + bの5が呼び出し式の値になります。波括弧を付けた場合は明示的なreturnが必要です。",
      },
    ],
  },
  {
    id: "js-object",
    track: "js",
    level: "basic",
    chapter: "js-data",
    order: 6,
    title: "オブジェクトは名前付きの束",
    summary: "関連する値をキーでまとめてたどる",
    minutes: 16,
    slides: [
      {
        title: "名刺1枚に、名前と年齢を書く",
        lead: 'オブジェクトは { キー: 値 } の集まりです。人の名刺と同じで、名前欄と年齢欄が1枚にまとまっています。取り出すときは user.name か user["name"] です。一緒に動くデータを1つの付箋で指せます。',
        points: [
          "キーは欄の名前。識別子ならドットで書ける",
          "値は何でもよい。ネストもできる",
          "存在しないキーを読むと undefined。欄が空なだけ。エラーにはならない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "関連する値は、別々の変数よりオブジェクトにした方がいいんですか？"
          },
          {
            "speaker": "engineer",
            "text": "一緒に扱う情報なら、名前付きの欄として1つにまとめるとたどりやすいです。"
          },
          {
            "speaker": "beginner",
            "text": "存在しないcity欄を読んだら、名刺が壊れてエラーになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "読むだけならundefinedです。固定の欄はドット、文字列の欄名は角括弧で取れます。欄の値には別のオブジェクトなど、どんな値でも置けます。"
          }
        ],
        diagram: "object",
        code: `const user = { name: "Aya", age: 20 };
user.name; // "Aya"
user["age"]; // 20
user.city; // undefined`,
        codeCaption: "1枚の名刺から、欄の名前で読む",
        codeExample: `const book = { title: "入門", pages: 200 };
console.log(book.title);
console.log(book.author); // undefined。著者欄は無い`,
      },
      {
        title: "ネストは引き出しの中の引き出し",
        lead: "値のところに、さらにオブジェクトを置けます。大きな引き出しの中に、住所用の小さい引き出しがあるイメージです。たどるときは user.address.city と、ドットを重ねます。",
        points: [
          "束の中に束を入れられる",
          "途中のキーが無いと undefined。undefined.city はエラー",
          "深くしすぎると読みづらい。2〜3段までが目安",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "住所のcityは、user.cityと書けば内側まで探してくれますか？"
          },
          {
            "speaker": "engineer",
            "text": "自動では探しません。外側からuser.address.cityの順にたどります。"
          },
          {
            "speaker": "beginner",
            "text": "addressが無い場合、最後のcityだけundefinedになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "addressを読んだ時点でundefinedになり、さらに.cityを読もうとするとエラーです。?.なら途中で止められますが後で扱います。深すぎる構造は読みづらいので2〜3段を目安にします。"
          }
        ],
        diagram: "object",
        code: `const user = {
  name: "Aya",
  address: { city: "Tokyo" },
};
console.log(user.address.city); // "Tokyo"`,
        codeCaption: "外側の束から、内側の束へ",
        codeExample: `const user = { name: "Aya" };
console.log(user.address); // undefined
// user.address.city はエラー。空の引き出しは開けない`,
        watch:
          "無い欄のさらに中を読むと、そこで止まります。いまの書き方では user.address?.city と途中でやめられます。?. はあとの講義です。",
      },
      {
        title: "ドットと括弧の使い分け",
        lead: "ドットは欄の名前がコードに書いてあるとき。括弧は欄の名前が変数や、スペースを含むとき。括弧の中は式なので、文字列を計算してからアクセスできます。",
        points: [
          'const key = "name"; user[key] は user.name と同じ',
          'user.key はキーが "key" という文字を探す。変数 key ではない',
          "この取り違えは非常によくある",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "key変数に\"age\"が入っているなら、user.keyでage欄を読めますか？"
          },
          {
            "speaker": "engineer",
            "text": "読めません。ドットの後ろは文字どおりkeyという欄名です。"
          },
          {
            "speaker": "beginner",
            "text": "変数の中身を欄名にしたいときだけ、user[key]にするんですね？"
          },
          {
            "speaker": "engineer",
            "text": "その通りです。角括弧の中は式として評価されるので、動的な欄名やスペースを含むキーに使います。固定名ならドットが読みやすいです。"
          }
        ],
        diagram: "object",
        code: `const key = "age";
user.key; // undefined（"key" というキーを探す）
user[key]; // 20`,
        codeCaption: "動く名前は []、固定の名前はドット",
        codeExample: `const user = { age: 20 };
const key = "age";
console.log(user.key); // undefined
console.log(user[key]); // 20`,
        watch: "動的にキーを選ぶなら必ず [] です。",
      },
      {
        title: "中身の変更と、名前の付け替えは別",
        lead: "const user でも user.age = 21 はできます。名刺の欄を書き換えるだけで、名刺そのものを別の束に付け替えてはいません。const が禁じるのは user = 別物 という付箋の付け替えです。",
        points: [
          "user.age = 21 は名刺の欄の更新",
          "user = {} は const ならエラー。別の名刺へ貼り替え",
          "delete user.age でキーを消せる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "const userなのにageを書き換えられるのは、constが効いていないからですか？"
          },
          {
            "speaker": "engineer",
            "text": "効いています。固定されるのはuserが指す名刺そのものです。"
          },
          {
            "speaker": "beginner",
            "text": "欄の更新や追加、削除は別の名刺へ替える操作ではない？"
          },
          {
            "speaker": "engineer",
            "text": "はい。同じオブジェクトのage更新やcity追加、deleteによる欄の削除はできます。一方、userへ別のオブジェクトを再代入するとエラーです。"
          }
        ],
        diagram: "object",
        code: `const user = { age: 20 };
user.age = 21; // OK
// user = { age: 30 }; // const ならエラー`,
        codeCaption: "欄は書ける。名刺の貼り替えは不可",
        codeExample: `const user = { age: 20 };
user.city = "Tokyo";
console.log(user.city); // "Tokyo"。欄の追加も中身の変更`,
      },
      {
        title: "省略記法と分割（予告）",
        lead: 'const name = "Aya"; const user = { name } は { name: name } と同じです。取り出す側の const { name } = user は分割代入で、中級講義で深掘りします。今は「束から名前で出す」と覚えてください。',
        points: [
          "作るとき: 変数名とキーが同じなら短縮できる",
          "読むとき: 分割代入で複数キーを一度に名前へできる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "変数nameからname欄を作るとき、同じ単語を2回書く必要がありますか？"
          },
          {
            "speaker": "engineer",
            "text": "キー名と変数名が同じなら、{ name }と短縮できます。"
          },
          {
            "speaker": "beginner",
            "text": "取り出す側の波括弧も、オブジェクトを作る記号ですか？"
          },
          {
            "speaker": "engineer",
            "text": "代入の左側なら分割代入で、束の欄から名前を作る書き方です。別名も付けられますが、今は作る側の短縮と読む側の分割を区別できれば十分です。"
          }
        ],
        diagram: "object",
        code: `const name = "Aya";
const user = { name };
const { name: n } = user; // n は "Aya"`,
        codeCaption: "同じ名前なら、欄を短く書ける",
        codeExample: `const age = 20;
const user = { name: "Aya", age };
console.log(user.age); // 20`,
      },
      {
        title: "この講義の要点",
        lead: "オブジェクトは名刺。ネストは引き出しの中。ドットは固定キー、括弧は計算キー。const でも欄は変えられる。次は配列です。",
        points: [
          "無いキーは undefined",
          "名前の付け替えと中身の更新を混ぜない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "オブジェクトなら、関連する情報を欄ごとに名前を付けて一緒に扱えるんですね。",
          },
          {
            "speaker": "engineer",
            "text": "はい。固定の欄はドット、変数で選ぶ欄は角括弧、と読み方も使い分けられます。",
          },
          {
            "speaker": "beginner",
            "text": "存在しない欄のさらに内側もundefinedになるだけで、constなら欄の更新はできないと思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "undefinedの内側を読むとエラーになり、constでも同じオブジェクトの欄は更新できます。次は名前ではなく順番で値を束ねる配列へ進みましょう。",
          },
        ],
        diagram: "object",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "customer と total を持つ order オブジェクトを作り、未設定 status も確認する。",
        projectRole: "build",
        prompt: "注文情報としてcustomer欄がAya、total欄が1200のorderを作り、customer、total、未登録のstatusを順に表示してください。",
        lead: "1件分の注文情報を、名前付きの欄を持つオブジェクトにまとめます。customerとtotalは欄の名前で読み、最後に存在しないstatusを確認してください。",
        kind: "code",
        starter: "// オブジェクト order を作ってください\n",
        fileName: "script.js",
        steps: [
          "customerとtotalの欄を持つorderを作る",
          "customerを読み表示する",
          "totalを読み表示する",
          "無いstatusを読み、未定義になることを確認する",
        ],
        hint: "欄を作るときはキーと値を対応させます。固定の欄名はドットで読めます。存在しない欄を読むだけなら停止せず、未定義の値が返ります。",
        sample: "Aya\n1200\nundefined",
        answer: `const order = { customer: "Aya", total: 1200 };
console.log(order.customer);
console.log(order.total);
console.log(order.status);`,
        explain: "名刺の欄をドットや括弧で読みます。無い欄は undefined です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "会員userの住所情報へTokyoを登録し、city欄の値だけを表示してください。",
        lead: "starterにはuserの中にaddress、その中に空のcity欄が用意されています。cityを文字列Tokyoへ更新し、userから内側の欄をたどってTokyoだけが表示されれば完成です。変更箇所は空の値と表示対象の2か所です。",
        kind: "code",
        starter: `const user = {
  name: "Aya",
  address: {
    city: "", // TODO 1: "Tokyo"に書き換える
  },
};

// TODO 2: 括弧内にcityまでたどる式を入れる
console.log();`,
        fileName: "script.js",
        steps: [
          "city: \"\" の空文字を city: \"Tokyo\" に書き換える",
          "console.log() の括弧内で、user → address → city の順に欄をたどる",
        ],
        hint: "userの直下はaddress、その中にcityがあります。ドット記法を2回使って内側へ進みます。",
        sample: "Tokyo",
        answer: `const user = {
  name: "Aya",
  address: { city: "Tokyo" },
};
console.log(user.address.city);`,
        explain:
          "束の中の束は、ドットを重ねてたどります。外側から address、その中の city です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "表示する会員欄が変数keyで指定される場合に、固定のkey欄と、keyが示すage欄を順に読んでください。",
        lead: "starterのuserにはageが20、keyには文字列ageが用意されています。文字どおりkeyという欄を読む結果と、変数の内容で欄を選ぶ結果を表示し、undefined、20の順になれば完成です。",
        kind: "code",
        starter:
          'const user = { age: 20 };\nconst key = "age";\n// ドットと括弧の違いを表示\n',
        fileName: "script.js",
        steps: [
          "文字どおりkey欄を読む方法で表示する",
          "変数keyの値を欄名として使い表示する",
          "undefinedと20の順になることを確認する",
        ],
        hint: "欄名が固定ならドット、変数の内容で変わるなら角括弧という使い分けです。引用符付きのkeyと変数keyも区別してください。",
        sample: "undefined\n20",
        answer: `const user = { age: 20 };
const key = "age";
console.log(user.key);
console.log(user[key]);`,
        explain:
          "動的に欄を選ぶなら必ず [] です。ドットは文字どおり key を探します。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "starterの会員userについて、誕生日後のage欄だけを21へ更新し、更新後の年齢を表示してください。",
        lead: "userはconstで用意されていますが、同じ会員オブジェクトの欄は更新できます。新しいuserを作ったり名前を付け替えたりせず、ageだけを書き換えて21を表示してください。",
        kind: "code",
        starter: "const user = { age: 20 };\n// 中身を変えて表示\n",
        fileName: "script.js",
        steps: [
          "既存オブジェクトのage欄を21へ更新する",
          "更新した欄を読み取って表示する",
          "user自体を再宣言・再代入していないか確認する",
        ],
        hint: "名前の付け替えと、参照先オブジェクトの欄の更新は別です。今回は欄を指定して新しい値を設定します。",
        sample: "21",
        answer: `const user = { age: 20 };
user.age = 21;
console.log(user.age);`,
        explain:
          "const でも名刺の欄は書き換えられます。付箋の付け替えではありません。",
      },
      {
        id: "q5",
        slide: 4,
        prompt: "starterのnameを使う短縮記法でuserを作り、name欄をnという名前へ分割代入して表示してください。",
        lead: "オブジェクトを作るとき、欄名と変数名が同じなら短く書けます。その後、分割代入でname欄の値に別名nを付け、nを表示してください。結果はAyaです。",
        kind: "code",
        starter: 'const name = "Aya";\n// 短縮で作り、分割で取り出す\n',
        fileName: "script.js",
        steps: [
          "nameを短縮記法でuserの欄にする",
          "userのname欄を分割代入で取り出す",
          "取り出した値にnという別名を付ける",
          "nを表示する",
        ],
        hint: "作成側では同名のキーと変数を省略できます。取り出す側では、元の欄名と新しく付ける名前を区別します。",
        sample: "Aya",
        answer: `const name = "Aya";
const user = { name };
const { name: n } = user;
console.log(n);`,
        explain: "作るときは短縮、読むときは分割で、束と名前を行き来できます。",
      },
    ],
  },
  {
    id: "js-array",
    track: "js",
    level: "basic",
    chapter: "js-data",
    order: 7,
    title: "配列は順番の束",
    summary: "0 から始まる番号で値を並べる",
    minutes: 16,
    slides: [
      {
        title: "先頭は 0 号車",
        lead: "配列は同じ種類の値を、電車の車両のように並べます。先頭は 0 号車です。1 号車から数えたくなるので、最初はここでつまずきます。length は車両の台数であり、最後の号車は length - 1 です。",
        points: [
          "scores[0] が先頭。0 号車",
          "3両なら号車は 0, 1, 2。scores[3] は範囲外で undefined",
          "最後は length - 1。負の号車 at(-1) はあとの講義",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "3個ある配列の最後は、3番目だから添字3ですよね？"
          },
          {
            "speaker": "engineer",
            "text": "添字は0からなので、3個なら最後は2です。"
          },
          {
            "speaker": "beginner",
            "text": "lengthが3なのに、scores[3]がundefinedなのは変に感じます。"
          },
          {
            "speaker": "engineer",
            "text": "lengthは個数で、添字は0・1・2だからです。末尾を読む位置はlength - 1になります。範囲外を読んでも通常はundefinedです。"
          }
        ],
        diagram: "array",
        code: `const scores = [80, 90, 70];
scores[0]; // 80
scores[2]; // 70
scores.length; // 3`,
        codeCaption: "号車は 0 から。台数は 3",
        codeExample: `const cars = ["先頭", "真ん中", "最後"];
console.log(cars[0]); // "先頭"
console.log(cars[cars.length - 1]); // "最後"`,
      },
      {
        title: "列の後ろに並ぶのが push",
        lead: "push は列のいちばん後ろに並ぶことです。pop は列の最後の人が抜けること。今ある配列そのものを変えます。slice は列の写真を撮るだけで、本人たちは動きません。const でも push はできます（名前の付け替えではないため）。",
        points: [
          "後ろに並ぶと、今ある列そのものが伸びる",
          "末尾の人が抜けると、その人が戻り値になる",
          "写真を撮っても、列に並んでいる本人は動かない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "const の配列なのに、後ろへ人を足せるのは不思議です。"
          },
          {
            "speaker": "engineer",
            "text": "名前の付け替えではないからです。push は新しい length を返し、pop は末尾を外してその値を返します。"
          },
          {
            "speaker": "beginner",
            "text": "写真を撮るとき、終了位置の号車も写りますか？"
          },
          {
            "speaker": "engineer",
            "text": "slice の終了位置は含みません。似た名前の splice は本体を切るので、混同に注意してください。"
          }
        ],
        diagram: "array",
        code: `const xs = [1, 2];
xs.push(3); // xs は [1, 2, 3]
xs.slice(0, 2); // [1, 2] を新たに返す。xs はそのまま`,
        codeCaption: "後ろに並ぶ / 写真を撮る",
        codeExample: `const line = ["Aya"];
line.push("Ren");
console.log(line); // ["Aya", "Ren"]
console.log(line.slice(0, 1)); // ["Aya"]。列はそのまま`,
        watch:
          "slice と splice は名前が似て動きが正反対に近いです。切ってコピーが slice、本体を切るのが splice。",
      },
      {
        title: "for...of で中身を順に取る",
        lead: "車両を先頭から見て回るのが for...of です。番号が要らなければ for (const x of xs) が読みやすいです。号車番号も要るなら通常の for。for...in はキー列挙用で、配列には向きません。",
        points: [
          "of は値（乗客）、in はキー（号車番号の文字列）",
          "途中で抜けるのは break、スキップは continue",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "配列を回すならfor...inでも、inだから中身が取れそうです。"
          },
          {
            "speaker": "engineer",
            "text": "配列の値を順に取るならfor...ofです。"
          },
          {
            "speaker": "beginner",
            "text": "番号も必要な場合や、途中を飛ばしたい場合はどうしますか？"
          },
          {
            "speaker": "engineer",
            "text": "番号が要るなら通常のforが向きます。for...ofでもbreakで終了、continueで次の要素へ進めます。for...inはキーを文字列として列挙するため、配列の中身には不向きです。"
          }
        ],
        diagram: "for-of-loop",
        code: `const xs = ["a", "b"];
for (const x of xs) {
  console.log(x);
}`,
        codeCaption: "先頭から、中身だけ順に",
        codeExample: `const xs = ["a", "b"];
for (const x of xs) {
  console.log(x);
}
for (const i in xs) {
  console.log(i); // "0" "1"。号車名の文字列
}`,
      },
      {
        title: "配列もオブジェクトの一種",
        lead: "typeof [] は object です。順番と length という約束が付いたオブジェクト、と考えると、参照の共有（後の講義）と同じルールが見えます。今は「並び」として使います。",
        points: [
          "Array.isArray で配列かどうかを見る",
          "オブジェクトに数字キーを足しても、配列のメソッドは来ない。電車に見せかけた名刺",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "数字のキーを持つオブジェクトなら、配列と同じですよね？"
          },
          {
            "speaker": "engineer",
            "text": "見た目が近くても、配列としての仕組みは持ちません。"
          },
          {
            "speaker": "beginner",
            "text": "typeofはどちらもobjectなので、区別できないのでは？"
          },
          {
            "speaker": "engineer",
            "text": "Array.isArrayを使えば区別できます。配列は順序やlength、専用メソッドを持つオブジェクトですが、数字キーを足しただけの通常オブジェクトは配列ではありません。"
          }
        ],
        diagram: "array",
        code: `Array.isArray([1, 2]); // true
Array.isArray({ 0: 1 }); // false`,
        codeCaption: "号車に見せかけても、電車ではない",
        codeExample: `console.log(typeof [1, 2]); // "object"
console.log(Array.isArray([1, 2])); // true
console.log(Array.isArray({ 0: 1 })); // false`,
      },
      {
        title: "この講義の要点",
        lead: "先頭は 0 号車。length は台数。push は列の後ろ。slice は写真。次は if と for の使い方です。",
        points: ["最後の添字は length - 1", "for...of は値を取る"],
        talk: [
          {
            "speaker": "beginner",
            "text": "配列では個数と位置番号を分けて考えて、最初の値は0番から読むんですね。",
          },
          {
            "speaker": "engineer",
            "text": "そうです。要素が3個なら有効な位置は0から2までで、末尾は要素数から1を引いた位置です。",
          },
          {
            "speaker": "beginner",
            "text": "pushもsliceも元の並びを変える操作で、値を順に取るならfor...inを使うと覚えていました。",
          },
          {
            "speaker": "engineer",
            "text": "pushは元を変えますがsliceはコピーを返します。配列の値ならfor...ofです。次は条件による分岐と、繰り返しを自分で制御する方法を見ましょう。",
          },
        ],
        diagram: "array",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "starterのscoresについて、先頭の値、末尾の値、要素数をこの順で表示してください。",
        lead: "配列の位置は0から数えます。先頭は最初の添字で読み、末尾は要素数から位置を求めて読みます。最後に配列の長さを表示し、80、70、3の順になることを確認してください。",
        kind: "code",
        starter: "const scores = [80, 90, 70];\n// 先頭・末尾・個数を表示\n",
        fileName: "script.js",
        steps: [
          "先頭要素を位置で読み表示する",
          "配列の長さから末尾位置を求めて表示する",
          "要素数を表示する",
          "3行の順番を確認する",
        ],
        hint: "先頭の位置は0です。末尾の位置は、要素数そのものではなく、そこから1つ戻った位置になります。",
        sample: "80\n70\n3",
        answer: `const scores = [80, 90, 70];
console.log(scores[0]);
console.log(scores[scores.length - 1]);
console.log(scores.length);`,
        explain: "先頭は 0 号車です。length は車両の台数なので 3 です。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "order-list に新しい orderId を追加し、一覧と先頭2件を確認する。",
        projectRole: "build",
        prompt: "orderId の order-list `orders`へ新しい番号3を末尾追加し、全一覧と先頭2件の控えを順に表示してください。",
        lead: "starterには orderId 1、2 の `orders`があります。元の一覧へ3を追加したあと全体を表示し、続けて先頭2要素だけを新しい配列として切り出してください。[1,2,3]と[1,2]の順に表示されれば完成です。",
        kind: "code",
        starter: "const orders = [1, 2];\n// push してから、本体と slice を表示\n",
        fileName: "script.js",
        steps: [
          "ordersの末尾へ数値3を追加する",
          "変更後のorders全体を表示する",
          "開始位置0から終了位置2の直前までを、新しい配列として得る",
          "切り出した配列を表示する",
        ],
        hint: "末尾追加のメソッドと、元を変更しない切り出しメソッドを順に使います。切り出しの終了位置は範囲に含まれません。",
        sample: "[1,2,3]\n[1,2]",
        answer: `const orders = [1, 2];
orders.push(3);
console.log(orders);
console.log(orders.slice(0, 2));`,
        explain:
          "push は列の後ろに並びます。slice は写真なので、列そのものは変わりません。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "starterのxsをfor...ofで先頭から走査し、各要素を1行ずつ表示してください。",
        lead: "for...ofは、配列の位置番号ではなく値そのものを順に受け取ります。aとbを順番に取り出し、ループの各回で表示してください。",
        kind: "code",
        starter: 'const xs = ["a", "b"];\n// for...of で中身を表示\n',
        fileName: "script.js",
        steps: [
          "xsの各値をfor...ofで順に受け取る",
          "受け取った現在の値を毎回表示する",
          "aとbの2行になることを確認する",
        ],
        hint: "必要なのは要素の値だけです。キーを列挙する方法や、自分で番号を増やす方法は使いません。",
        sample: "a\nb",
        answer: `const xs = ["a", "b"];
for (const x of xs) {
  console.log(x);
}`,
        explain: "of は値、in はキーです。配列の中身を取るなら for...of です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "角括弧で作った値と、数値キーだけの通常オブジェクトについて、`Array.isArray` の結果を順に表示してください。",
        lead: "数値キーとlengthがあっても、通常のオブジェクトに配列の仕組みは付きません。見た目ではなく、配列として作られた値かを判定して表示します。",
        kind: "code",
        starter:
          "const xs = [1, 2];\nconst fake = { 0: 1, length: 1 };\n// それぞれが配列かどうかを順に表示\n",
        fileName: "script.js",
        steps: [
          "角括弧で作った値を判定して表示する",
          "数値キーだけの通常オブジェクトを判定して表示する",
        ],
        hint: "通常のオブジェクトへ数字の欄を足しても、配列には変わりません。",
        sample: "true\nfalse",
        answer: `const xs = [1, 2];
const fake = { 0: 1, length: 1 };
console.log(Array.isArray(xs));
console.log(Array.isArray(fake));`,
        explain:
          "角括弧で作った値だけが配列です。数字キーやlengthを持つ通常オブジェクトは、配列専用の仕組みを持ちません。",
      },
    ],
  },
  {
    id: "js-control",
    track: "js",
    level: "basic",
    chapter: "js-loop",
    order: 8,
    title: "条件と繰り返し",
    summary: "if で分かれ、for と while で同じ作業を回す",
    minutes: 20,
    slides: [
      {
        title: "if は「もし true なら、この中だけ動く」",
        lead: "プログラムは普通、上から全部動きます。if は踏切です。「この質問が yes のときだけ」遮断機の内側（中の行）を実行します。質問は true か false で答えます。波括弧 { } が「内側」の範囲です。",
        points: [
          "括弧の中が質問。中が true のときだけ { } に入る",
          "false なら、踏切の内側はまるごと飛ばす",
          "1行でも { } を付ける。後から行を足しても壊れない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "ifを書いたら、それより下のコード全部が条件付きになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "条件付きになるのは、続く波括弧の中だけです。"
          },
          {
            "speaker": "beginner",
            "text": "1行だけなら波括弧を省いて、ifの後ろにセミコロンを付けても同じ？"
          },
          {
            "speaker": "engineer",
            "text": "波括弧は付ける方が安全です。if直後のセミコロンは空の文を終え、次のブロックが常に動く事故になります。条件がfalseなら中だけ飛ばし、その後へ進みます。"
          }
        ],
        diagram: "branch",
        code: `const n = 5;
if (n > 0) {
  console.log("正の数");
}
console.log("ここはいつも出る");`,
        codeCaption: "n が 0 より大きいときだけ中へ",
        codeExample: `const n = -2;
if (n > 0) {
  console.log("正の数");
}
// 何も出ない。条件が false だから`,
        watch:
          "if のあとに ; を付けると、空の文で終わったことになり、次の { } はいつも動きます。",
      },
      {
        title: "else は「そうでなければ」",
        lead: "if に入らなかったとき用の道が else です。交差点の「左へ／右へ」と同じで、必ずどちらか一方だけが動きます。両方動くことはありません。",
        points: [
          "条件が true → if の中。false → else の中",
          "どちらの道でも、else のあとの行は続く",
          "「合格 / 不合格」のように2択のときに使う",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "ifがtrueでも、念のためelseの処理も続けて実行されますか？"
          },
          {
            "speaker": "engineer",
            "text": "実行されるのは必ずどちらか片方です。"
          },
          {
            "speaker": "beginner",
            "text": "合格を表示した後に、不合格側も確認するわけではないんですね？"
          },
          {
            "speaker": "engineer",
            "text": "はい。trueならif、falseならelseへ進み、選ばれなかった道は飛ばします。分岐の後にある共通の行には、どちらからも合流します。"
          }
        ],
        diagram: "branch",
        code: `const n = 3;
if (n >= 0) {
  console.log("0以上");
} else {
  console.log("マイナス");
}`,
        codeCaption: "2つの道のうち、必ず1つ",
        codeExample: `const n = -1;
if (n >= 0) {
  console.log("0以上");
} else {
  console.log("マイナス");
}
// 表示は「マイナス」`,
      },
      {
        title: "else if は上から最初の1つだけ",
        lead: "道が3つ以上なら else if を並べます。案内板を上から読むイメージです。最初に true になった塊だけが動きます。その下の案内は見ません。",
        points: [
          "80 以上 → 合格。次に 50 以上 → 補習。残り → 再挑戦",
          "順番が大事。ゆるい条件を上に置くと、下まで届かない",
          "最後の else は「どれにも当たらなかったとき」",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "80点は80以上でも50以上でもあるから、合格と補習が両方出ますか？"
          },
          {
            "speaker": "engineer",
            "text": "出ません。上から見て最初にtrueになった道だけ動きます。"
          },
          {
            "speaker": "beginner",
            "text": "では50以上を先に書いても、80点なら賢く合格を選びますよね？"
          },
          {
            "speaker": "engineer",
            "text": "その順だと先に補習へ入って終わります。厳しい条件を上へ置き、最後のelseでどれにも当たらない値を受けるのが大切です。"
          }
        ],
        diagram: "branch",
        code: `const score = 80;
if (score >= 80) {
  console.log("合格");
} else if (score >= 50) {
  console.log("補習");
} else {
  console.log("再挑戦");
}`,
        codeCaption: "80 は最初の条件に当たる",
        codeExample: `const score = 50;
if (score >= 80) {
  console.log("合格");
} else if (score >= 50) {
  console.log("補習");
} else {
  console.log("再挑戦");
}
// 表示は「補習」`,
      },
      {
        title: "比較は === と大小。== は使わない",
        lead: "if の質問は、よく比較で作ります。同じかどうかは ===。違うかは !==。大きい・小さいは > < >= <=。イコール2つ == は型を勝手に変換するので、最初は使いません。",
        points: [
          '3 === 3 は true。3 === "3" は false（種類が違う）',
          "score >= 80 は「80 も含む」。> 80 は含まない",
          "複数条件は &&（かつ）と ||（または）",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "境界の80点を含めたいなら、> 80でいいですか？"
          },
          {
            "speaker": "engineer",
            "text": "80も含むなら>= 80です。"
          },
          {
            "speaker": "beginner",
            "text": "同じ値の比較は==の方が記号が少なくてよさそうですが？"
          },
          {
            "speaker": "engineer",
            "text": "==は型を変換するため、基本は===と!==を使います。複数条件は&&が両方、||がどちらか一方を満たすかを見る、と読めます。"
          }
        ],
        diagram: "calc",
        code: `console.log(3 === 3); // true
console.log(3 === "3"); // false
const n = 5;
console.log(n > 0 && n < 10); // true。かつ`,
        codeCaption: "同じか・いくつ以上か",
        codeExample: `console.log(80 >= 80); // true。同じも含む
console.log(3 === 3 || 3 === 4); // true。または`,
        watch: "&& は両方が true のとき true。|| はどちらかが true なら true。",
      },
      {
        title: "for は「始める・続ける・更新」の3段",
        lead: "同じ作業を決まった回数だけ繰り返すのがforです。実行順は、初期化を最初に1回だけ行い、その後「条件を確認→trueなら本体→更新→もう一度条件」を回します。条件がfalseになった瞬間、本体と更新を飛ばしてforの次の行へ進みます。",
        points: [
          "let i = 0 がスタート。カウンタ i を用意する",
          "i < 3 が続ける条件。false になったら終わり",
          "i++ は「1増やす」。周のあとで動く",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "i < 3なら、3も含めて4回くらい動きますか？"
          },
          {
            "speaker": "engineer",
            "text": "0から始めるなら、動くのは0・1・2の3回です。"
          },
          {
            "speaker": "beginner",
            "text": "括弧の3つは、毎回左から全部実行されるんでしょうか？"
          },
          {
            "speaker": "engineer",
            "text": "初期化は最初に1回、条件は各周の前、更新は各周の後です。<=にすると境界も含むので回数が変わります。迷ったらiの値を指折りで追いましょう。"
          }
        ],
        diagram: "for-loop",
        code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}
// 0
// 1
// 2`,
        codeCaption: "i は 0, 1, 2 の3回",
        codeExample: `for (let i = 1; i <= 3; i++) {
  console.log(i);
}
// 1 2 3。始める数と < か <= かで回数が変わる`,
        watch: "i < 3 は3回、i <= 3 は4回です。境界は指折りで確認します。",
      },
      {
        title: "while は「まだ true のあいだ」",
        lead: "回数が先に分からないときは while です。「まだ燃料があるあいだ」走り続けます。条件を見て、true なら中を実行し、また条件を見ます。中で条件が変わる値を更新しないと、終わりません（無限ループ）。",
        points: [
          "for は回数がはっきりしているときに向く",
          "while は「この値がこうなるまで」に向く",
          "中でカウンタを増やし忘れると止まらない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "whileはforの短い書き方で、決まった回数専用ですか？"
          },
          {
            "speaker": "engineer",
            "text": "むしろ、終わるまでの回数が先に分からない処理に向きます。"
          },
          {
            "speaker": "beginner",
            "text": "条件だけ書けば、JavaScriptが中の値を自動で増やしてくれますよね？"
          },
          {
            "speaker": "engineer",
            "text": "自動では変わりません。中で条件に関わる値を更新しないと無限ループになります。回数が明確ならfor、「この状態になるまで」ならwhileが読みやすいです。"
          }
        ],
        diagram: "while-loop",
        code: `let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}
// 0 1 2。for と同じ結果`,
        codeCaption: "条件が true のあいだ繰り返す",
        codeExample: `let n = 3;
while (n > 0) {
  console.log(n);
  n--;
}
// 3 2 1。0 になったら終わる`,
      },
      {
        title: "break は中断、continue は次の周へ",
        lead: "繰り返しの途中でやめたいときは break（コースから降りる）。この周の残りを飛ばして次の周に行きたいときは continue（この周はパス）。両方とも、一番内側のループに効きます。",
        points: [
          "break: ループ全体を抜けて、その下の行へ",
          "continue: 残りの行を飛ばし、更新と条件へ戻る",
          "探し物が見つかったら break、特定の値だけ飛ばすなら continue",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "continueしたら、そのループ自体がそこで終了しますか？"
          },
          {
            "speaker": "engineer",
            "text": "continueは今の周の残りだけを飛ばし、次の周へ進みます。"
          },
          {
            "speaker": "beginner",
            "text": "breakは次の周へ、continueはループの外へ、だと思っていました。"
          },
          {
            "speaker": "engineer",
            "text": "逆です。breakは一番内側のループ全体から降り、下の行へ進みます。探し物が見つかったらbreak、特定の値だけ処理しないならcontinueが合います。"
          }
        ],
        diagram: "loop-control",
        code: `for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  if (i === 4) break;
  console.log(i);
}
// 0 1 3。2 は飛ばし、4 の前で終わる`,
        codeCaption: "2 を飛ばし、4 で抜ける",
        codeExample: `for (let i = 0; i < 4; i++) {
  if (i === 1) continue;
  console.log(i);
}
// 0 2 3。1 の周だけパス`,
        watch:
          "continue はこの周の残りを飛ばすだけ。break はコースから降りる。",
      },
      {
        title: "この講義の要点",
        lead: "if は true のときだけ。else / else if で道を足す。for は回数、while は終わる条件。次は配列を1個ずつ処理します。",
        points: ["比較は ===。== は使わない", "i < 3 と i <= 3 で回数が違う"],
        talk: [
          {
            "speaker": "beginner",
            "text": "条件は上から判定し、繰り返しは続ける条件がfalseになるまで回る、と整理できました。",
          },
          {
            "speaker": "engineer",
            "text": "いいですね。分岐では最初に成立した道だけが動き、比較の境界を含むかどうかも結果を左右します。",
          },
          {
            "speaker": "beginner",
            "text": "forとwhileは書き方が違うだけで、更新を忘れても適当なところで止まりますよね？",
          },
          {
            "speaker": "engineer",
            "text": "条件が変わらなければ止まりません。回数が明確ならfor、終了状態を待つならwhileを選びます。次は配列の各要素へ繰り返しを適用しましょう。",
          },
        ],
        diagram: "loop",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "order.total が正なら、集計対象の注文として分岐する。",
        projectRole: "build",
        prompt: "starterの注文金額totalが0より大きい場合だけ、「集計対象」と表示してください。",
        lead: "totalには注文金額1200が用意されています。0より大きいときだけ指定文を表示し、0円や負の値なら何も表示しない構造にしてください。現在の入力では1行表示されれば完成です。",
        kind: "code",
        starter: "const total = 1200;\n// if で判定して表示\n",
        fileName: "script.js",
        steps: [
          "totalが0より大きいかを条件として評価する",
          "条件が成り立つ範囲内だけで指定文を表示する",
          "不要な別経路を追加していないか確認する",
        ],
        hint: "条件が真のときだけ動くブロックを作ります。今回は条件が偽の場合の処理は必要ありません。",
        sample: "集計対象",
        answer: `const total = 1200;
if (total > 0) {
  console.log("集計対象");
}`,
        explain:
          "条件が true のときだけ { } の中が動きます。total は 1200 なので表示されます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "在庫差分nが0以上なら「0以上」、不足なら「マイナス」と表示する2通りの分岐を作ってください。",
        lead: "starterのnは在庫差分-1です。0以上の場合と、それ以外の場合の両方を用意し、現在の入力では「マイナス」だけが表示されるようにしてください。「0以上」を表示する経路も必要です。",
        kind: "code",
        starter: "const n = -1;\n// if と else で2択\n",
        fileName: "script.js",
        steps: [
          "nが0以上かを判定する",
          "真の場合に0以上と表示する経路を作る",
          "偽の場合にマイナスと表示する経路を作る",
          "どちらか一方だけが動くことを確認する",
        ],
        hint: "最初の条件に入らなかったときの処理は、対になる別経路へ置きます。2つの表示処理はそれぞれ別のブロックに必要です。",
        sample: "マイナス",
        answer: `const n = -1;
if (n >= 0) {
  console.log("0以上");
} else {
  console.log("マイナス");
}`,
        explain:
          "-1 は 0 以上ではないので else だけが動きます。if の中の「0以上」は今回の画面には出ませんが、0 以上のときの道として必要です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "scoreが80以上なら「合格」、50以上80未満なら「補習」、それ未満なら「再挑戦」と表示する3通りの分岐を作ってください。",
        lead: "複数の条件は上から順に調べ、最初に成り立った経路だけを実行します。starterのscoreは80なので表示は「合格」だけですが、残り2つの経路も必ず用意してください。",
        kind: "code",
        starter: "const score = 80;\n// if / else if / else で分岐\n",
        fileName: "script.js",
        steps: [
          "最も高い基準を最初に判定する",
          "次の基準を2番目の経路として判定する",
          "どちらにも該当しない経路を用意する",
          "各経路に対応する文を表示する",
        ],
        hint: "80以上の値は50以上でもあるため、厳しい基準を先に置きます。最後の経路には追加の条件は要りません。",
        sample: "合格",
        answer: `const score = 80;
if (score >= 80) {
  console.log("合格");
} else if (score >= 50) {
  console.log("補習");
} else {
  console.log("再挑戦");
}`,
        explain:
          "80 >= 80 は true なので、最初の if だけが動きます。「補習」と「再挑戦」は今回出ませんが、残りの案内として必要です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "用意された3つの値について、数値（typeof が \"number\"）かつ80以上なら true、そうでなければ false を順に表示してください。",
        lead: "境界の80は含めつつ、入力ミスで混ざった文字列は合格にしたくありません。値の種類と範囲の両方を確かめる式を、各行で書いてください。",
        kind: "code",
        starter:
          'const scoreA = 80;\nconst scoreB = 79;\nconst scoreC = "80";\n// typeof が "number" かつ 80以上かを、A・B・Cの順に表示\n',
        fileName: "script.js",
        steps: [
          '値が typeof で "number" かどうかを確かめる',
          "80以上かどうかを確かめる",
          "両方を満たすときだけ true になる式を表示する",
        ],
        hint: '以上の比較だけでは自動変換が起こる場合があります。先に typeof で "number" かを確かめます。',
        sample: "true\nfalse\nfalse",
        answer: `const scoreA = 80;
const scoreB = 79;
const scoreC = "80";
console.log(typeof scoreA === "number" && scoreA >= 80);
console.log(typeof scoreB === "number" && scoreB >= 80);
console.log(typeof scoreC === "number" && scoreC >= 80);`,
        explain:
          "種類を厳密に確認してから、境界を含む比較を行うため、数値の80以上だけが true になります。",
      },
      {
        id: "q5",
        slide: 4,
        prompt: "3件の画面項目に付ける0始まりの番号を、カウンタiで1行ずつ表示してください。",
        lead: "対象は3件なので、番号は0、1、2です。iを0から始め、3へ到達する前まで1ずつ増やしながら表示してください。3行が順番どおりなら完成です。",
        kind: "code",
        starter: "// for の3段: 初期化・続ける条件・更新\n",
        fileName: "script.js",
        steps: [
          "カウンタの初期値を0にする",
          "2までが処理対象になる終了条件を決める",
          "各周のカウンタを表示する",
          "1周ごとにカウンタを1増やす",
        ],
        hint: "forの制御部分には、開始・継続条件・更新の3つの役割があります。境界値3を表示しない条件を考えてください。",
        sample: "0\n1\n2",
        answer: `for (let i = 0; i < 3; i++) {
  console.log(i);
}`,
        explain: "始める前に i=0、毎周の前に条件を見て、周のあと i++ します。",
      },
      {
        id: "q6",
        slide: 5,
        prompt:
          "3件のデータを順に確認する番号として、最初から入っている i を0から2まで表示してください。",
        lead:
          "iは0で用意されています。3未満のあいだ繰り返し、いまの番号を表示してから i を1増やしてください。増やし忘れると終わりません。0、1、2が出て止まれば完成です。",
        kind: "code",
        starter: "let i = 0;\n// while で 0, 1, 2 と出す（表示のあとで i を増やす）\n",
        fileName: "script.js",
        steps: [
          "iが3未満かを継続条件にする",
          "各周で現在のiを先に表示する",
          "表示後にiを1増やす",
          "3でループが終了することを確認する",
        ],
        hint: "while (i < 3) の中で console.log(i) のあと、必ず i++（または i = i + 1）を書いてください。更新がないとタイムアウトします。",
        sample: "0\n1\n2",
        answer: `let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}`,
        explain:
          "while は条件が true のあいだ繰り返します。更新を忘れると終わりません。",
      },
      {
        id: "q7",
        slide: 6,
        prompt: "データ番号0から順に確認し、欠番2は飛ばし、終了印の4に達したら確認を打ち切ってください。",
        lead: "カウンタは0から始め、5未満の範囲を対象にします。0と1は表示し、2はその回だけ飛ばし、3は表示、4では表示前にループ全体を終了してください。出力が0、1、3なら完成です。",
        kind: "code",
        starter: "// continue で飛ばし、break で抜ける\n",
        fileName: "script.js",
        steps: [
          "0から4までを対象にした繰り返しを作る",
          "`continue` で、2の回だけ残りの処理を飛ばす",
          "`break` で、4に達した時点でループ全体を終了する",
          "それ以外の値を表示する",
        ],
        hint: "表示より前に、飛ばす条件と終了する条件を確認します。continue は今の周だけ、break はループ全体です。",
        sample: "0\n1\n3",
        answer: `for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  if (i === 4) break;
  console.log(i);
}`,
        explain:
          "2 は continue で飛ばし、4 は break でループを抜けます。表示は 0, 1, 3 です。",
      },
    ],
  },
  {
    id: "js-foreach",
    track: "js",
    level: "basic",
    chapter: "js-callback",
    order: 12,
    title: "配列を1個ずつ処理する",
    summary: "for、forEach、for...of で中身を順に見る",
    minutes: 16,
    slides: [
      {
        title: "番号で配列を取り出す for",
        lead: "配列用のforでも実行順は同じです。最初にiを0へ初期化し、各周の前にiがlength未満か確認し、trueならxs[i]を読み、本体の後でiを1増やします。lengthと同じ番号は存在しないため、その時点で条件がfalseになり終了します。",
        points: [
          "i は 0 から。xs[0] が先頭",
          "i < xs.length で、範囲外に出ない",
          "番号も欲しいとき（何番目か表示する）に向く",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "配列を全部読む条件は、i <= xs.lengthで末尾まで含めますか？"
          },
          {
            "speaker": "engineer",
            "text": "i < xs.lengthです。lengthと同じ添字は範囲外です。"
          },
          {
            "speaker": "beginner",
            "text": "値だけ欲しいのに、わざわざ番号を使う利点はありますか？"
          },
          {
            "speaker": "engineer",
            "text": "何番目かも必要な処理では便利です。iを0から増やし、各周でxs[i]を読めば、先頭から範囲外へ出ずに処理できます。"
          }
        ],
        diagram: "for-loop",
        code: `const xs = ["りんご", "みかん"];
for (let i = 0; i < xs.length; i++) {
  console.log(xs[i]);
}
// りんご
// みかん`,
        codeCaption: "i が番号、xs[i] が中身",
        codeExample: `const xs = ["りんご", "みかん"];
for (let i = 0; i < xs.length; i++) {
  console.log(i, xs[i]);
}
// 0 りんご
// 1 みかん`,
      },
      {
        title: "forEach は「各要素に関数を渡す」",
        lead: "forEachは、配列が先頭から要素を1個ずつ取り出し、渡された関数を各要素につき1回呼ぶ処理です。このように「相手に呼んでもらうため渡す関数」をコールバック関数と呼びます。各呼び出しには現在の値・0始まりの番号・元の配列が渡されます。関数が返した値は集めず、forEach全体もundefinedを返します。",
        points: [
          "配列要素ごとに callback(value, index, array) を同期的に呼ぶ",
          "コールバックのreturn値は使われず、forEach自体はundefinedを返す",
          "空配列なら0回。breakによる途中終了はできない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "forEachは、配列そのものを1回だけ関数へ渡すんですか？"
          },
          {
            "speaker": "engineer",
            "text": "配列の各要素について、渡した関数を1回ずつ呼びます。"
          },
          {
            "speaker": "beginner",
            "text": "それなら自分でiを増やして、今の要素を探す必要がありますよね？"
          },
          {
            "speaker": "engineer",
            "text": "その管理はforEach側が行い、コールバックの第1引数へ現在の要素を渡します。全部に同じ処理をするとき、カウンタなしで読みやすく書けます。"
          }
        ],
        diagram: "foreach-loop",
        code: `const xs = ["りんご", "みかん"];
xs.forEach((x) => {
  console.log(x);
});
// りんご
// みかん`,
        codeCaption: "x が今の要素",
        codeExample: `function show(x) {
  console.log(x);
}
["りんご", "みかん"].forEach(show);
// 名前のある関数も渡せる`,
        watch:
          "コールバック内のreturnは、その1回の関数呼び出しを終えるだけです。forEach全体の中断や、結果配列の作成にはなりません。",
      },
      {
        title: "第2引数は番号、第3引数は配列そのもの",
        lead: "forEachは各周でコールバックを呼ぶとき、現在の値・0始まりの番号・処理中の配列を、この順番で渡します。引数名は自由ですが位置の意味は変わりません。後ろの不要な引数は省略できますが、第2引数だけを第1位置へずらすことはできません。",
        points: [
          "1つ目: 今の値",
          "2つ目: 0 始まりの番号",
          "3つ目: 回している配列全体（あまり使わない）",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "forEachの関数で番号だけ欲しいなら、最初の引数にiと書けばいいですか？"
          },
          {
            "speaker": "engineer",
            "text": "最初は必ず要素で、番号は2番目の引数です。"
          },
          {
            "speaker": "beginner",
            "text": "使わない要素の引数を省いて、番号を1番目にずらせませんか？"
          },
          {
            "speaker": "engineer",
            "text": "位置の約束は変わりません。要素、0始まりの番号、配列全体の順です。後ろは不要なら省略できますが、番号を受けるなら前の引数も置きます。"
          }
        ],
        diagram: "foreach-loop",
        code: `const xs = ["りんご", "みかん"];
xs.forEach((x, i) => {
  console.log(i + "番は" + x);
});
// 0番はりんご
// 1番はみかん`,
        codeCaption: "品物と号車番号を同時に使う",
        codeExample: `["Aya", "Ren"].forEach((name, i) => {
  console.log(i + "号車は" + name);
});
// 0号車はAya
// 1号車はRen`,
      },
      {
        title: "for...of は値だけ。break できる",
        lead: "for (const x of xs) も1個ずつ値を取ります。ベルトを途中で止められるのが for...of、最後まで流し切るのが forEach です。全部やるなら forEach、途中でやめたい・番号も要るなら for、値だけでよいなら for...of が向きです。",
        points: [
          "forEach の中では break できない（関数の中だから）",
          "for...of は値、for...in はキー。配列の中身は of",
          "先に見つかったら終わり、は for か for...of",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "forEachの途中で目的の値を見つけたら、breakできますか？"
          },
          {
            "speaker": "engineer",
            "text": "できません。途中終了したいならforかfor...ofを選びます。"
          },
          {
            "speaker": "beginner",
            "text": "値だけならfor...inでも短く書けそうですが？"
          },
          {
            "speaker": "engineer",
            "text": "for...inが返すのは文字列のキーです。値ならfor...of、全件へ同じ処理ならforEach、番号や細かな制御が必要なら通常のfor、と目的で使い分けます。"
          }
        ],
        diagram: "for-of-loop",
        code: `const xs = ["a", "b", "c"];
for (const x of xs) {
  if (x === "b") break;
  console.log(x);
}
// a だけ。b で抜ける`,
        codeCaption: "見つかったら break",
        codeExample: `const xs = ["a", "b", "c"];
xs.forEach((x) => {
  console.log(x);
});
// a b c 全部。forEach は途中で止められない`,
        watch:
          '配列に for...in を使うと "0" "1" という文字列キーが来ます。中身を取るなら of か forEach です。',
      },
      {
        title: "この講義の要点",
        lead: "番号が要るなら for。全部同じ処理なら forEach。途中で抜けるなら for...of。次はクロージャです。",
        points: ["i < xs.length を守る", "forEach の第一引数が今の要素"],
        talk: [
          {
            "speaker": "beginner",
            "text": "配列を回す方法は、番号が必要か、全部処理するか、途中で止めるかで選べるんですね。",
          },
          {
            "speaker": "engineer",
            "text": "その選び方で大丈夫です。通常のforでは範囲外へ出ない条件も忘れないようにします。",
          },
          {
            "speaker": "beginner",
            "text": "forEachの関数には番号が最初に渡り、必要ならbreakも使えると思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "最初に来るのは現在の要素で、途中終了にはforやfor...ofを使います。関数とコールバックの基礎を使って、次は外側の変数を覚えるクロージャへ進みます。",
          },
        ],
        diagram: "foreach-loop",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "order-list を先頭から走査し、各 orderId を表示する。",
        projectRole: "build",
        prompt: "order-listを番号付きforループで確認し、order-1、order-2の順に1行ずつ表示してください。",
        lead: "starterには2つの orderIdが順に用意されています。添字を0から始め、要素数に達する前まで繰り返して、各位置のorderIdを表示してください。",
        kind: "code",
        starter:
          'const orders = ["order-1", "order-2"];\n// i を 0 から length 未満まで\n',
        fileName: "script.js",
        steps: [
          "添字を0から開始する",
          "配列の範囲内だけ繰り返す条件を作る",
          "現在位置の要素を表示する",
          "各周で添字を1増やす",
        ],
        hint: "配列の長さと同じ位置は範囲外です。現在の添字を角括弧で配列に渡すと、その位置の値を読めます。",
        sample: "りんご\nみかん",
        answer: `const orders = ["order-1", "order-2"];
for (let i = 0; i < orders.length; i++) {
  console.log(orders[i]);
}`,
        explain:
          "番号 i で orders[i] を取ります。終わる条件は i < orders.length です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "買い物リストの各商品をforEachで確認し、りんご、みかんの順に1行ずつ表示してください。",
        lead: "starterには2つの商品名が入った配列があります。各要素について関数を1回ずつ動かし、受け取った商品名を表示してください。自分で添字を更新する処理は不要です。",
        kind: "code",
        starter: 'const xs = ["りんご", "みかん"];\n// forEach に関数を渡す\n',
        fileName: "script.js",
        steps: [
          "配列の各要素へ行う関数を用意する",
          "現在の要素を引数として受け取る",
          "受け取った値を表示する",
          "2要素とも処理されたか確認する",
        ],
        hint: "配列のforEachメソッドへ、1要素分の処理を関数として渡します。カウンタの管理はforEach側が行います。",
        sample: "りんご\nみかん",
        answer: `const xs = ["りんご", "みかん"];
xs.forEach((x) => {
  console.log(x);
});`,
        explain:
          "forEach は要素1個ごとに関数を呼びます。第一引数が今の値です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "買い物リストの各商品を、0始まりの番号とともに「0番はりんご」の形式で表示してください。",
        lead: "starterの配列にはりんごとみかんが入っています。forEachから現在の商品をx、位置番号をiとして受け取り、各行に番号と商品名を組み合わせて表示してください。",
        kind: "code",
        starter: 'const xs = ["りんご", "みかん"];\n// 第2引数が番号\n',
        fileName: "script.js",
        steps: [
          "現在の要素と0始まりの番号を受け取る",
          "番号・固定文・要素を1つの表示内容にする",
          "各回で作った内容を表示する",
          "2行の形式を確認する",
        ],
        hint: "コールバックが受け取る値には順序があります。最初が要素、次が番号です。文字列は連結または埋め込みで組み立てられます。",
        sample: "0番はりんご\n1番はみかん",
        answer: `const xs = ["りんご", "みかん"];
xs.forEach((x, i) => {
  console.log(i + "番は" + x);
});`,
        explain: "第1引数が要素、第2引数が番号です。番号は 0 から始まります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "starterの配列をfor...ofで順に見て、値がbになった時点で終了し、それより前の値だけ表示してください。",
        lead: "for...ofなら配列の値を直接受け取り、途中でループを終了できます。各値を表示する前に終了条件を確認することで、aだけが表示され、bとcは表示されません。",
        kind: "code",
        starter: 'const xs = ["a", "b", "c"];\n// b が来たら break\n',
        fileName: "script.js",
        steps: [
          "配列の値をfor...ofで順に受け取る",
          "現在値がbかを表示前に判定する",
          "bならループ全体を終了する",
          "終了前の値だけを表示する",
        ],
        hint: "途中終了できるループを使います。終了判定を表示より先に行うことが、bを出さないための確認点です。",
        sample: "a",
        answer: `const xs = ["a", "b", "c"];
for (const x of xs) {
  if (x === "b") break;
  console.log(x);
}`,
        explain:
          "for...of は値を取り、途中で break できます。b の前の a だけ表示されます。",
      },
    ],
  },
  {
    id: "js-scope",
    track: "js",
    level: "basic",
    chapter: "js-fn",
    order: 10,
    title: "スコープは名前の見える範囲",
    summary: "ブロックの内側と外側で付箋が違う",
    minutes: 16,
    slides: [
      {
        title: "{ } が名前の部屋になる",
        lead: "let と const は、一番近い波括弧（ブロック）の中だけで有効です。家の部屋のドアだと思ってください。リビングの名前は、書斎の中からも見えます。書斎だけで宣言した名前は、リビングからは見えません。if や for の中で宣言した変数は、その外では使えません。",
        points: [
          "同じファイルの一番外側は家全体（モジュール／スクリプト）",
          "内側の部屋から、外側の名前は読める（隠さない限り）",
          "外側の部屋から、内側の名前は読めない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "ifの中で作った名前は、その後の行でも使えますか？"
          },
          {
            "speaker": "engineer",
            "text": "letとconstの名前は、基本的に作った波括弧の内側だけで見えます。"
          },
          {
            "speaker": "beginner",
            "text": "逆に、外側で作った名前も内側へ入ると見えなくなりますか？"
          },
          {
            "speaker": "engineer",
            "text": "内側から外側は読めますが、外側から内側は読めません。同じファイルの外側を家全体、ブロックを部屋と考えると、名前の見える方向を追いやすいです。"
          }
        ],
        diagram: "scope",
        code: `let outer = 1;
{
  let inner = 2;
  console.log(outer); // 1 見える
}
// console.log(inner); // エラー`,
        codeCaption: "書斎からリビングは見える。逆は不可",
        codeExample: `let living = "ソファ";
{
  let study = "机";
  console.log(living); // 見える
}
// console.log(study); // 部屋の外。エラー`,
      },
      {
        title: "内側の同名は外側を隠す",
        lead: "内側で let x すると、その部屋では外側の x は見えなくなります（シャドーイング）。同じ表札の別部屋、と考えるとよいです。ドアを出ると、外側の x がまた見えます。意図せず同じ名前を使うと、別の付箋をいじっていることがあります。",
        points: [
          "見た目が同じ x でも、部屋が違えば別のラベル",
          "デバッグ中は「どの部屋の x か」を先に確認する",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "内側でもxと宣言したら、外側のxを書き換えたことになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "新しく宣言したなら、同名でも別の変数です。"
          },
          {
            "speaker": "beginner",
            "text": "部屋の中ではどちらのxを読んでいるか分からなくなりませんか？"
          },
          {
            "speaker": "engineer",
            "text": "最も近い部屋のxが外側を隠します。ブロックを出ると外側のxがまた見えます。デバッグでは名前だけでなく、どのスコープで宣言されたかを確認しましょう。"
          }
        ],
        diagram: "scope",
        code: `let x = 1;
{
  let x = 2;
  console.log(x); // 2
}
console.log(x); // 1`,
        codeCaption: "書斎の x は、リビングの x を隠す",
        codeExample: `let count = 10;
{
  let count = 1;
  console.log(count); // 1。この部屋の count
}
console.log(count); // 10。家全体の count`,
      },
      {
        title: "var は関数スコープで、巻き上げがある",
        lead: "varは、名前を関数全体から見えるようにする古い宣言方法です。関数が始まる前の準備で名前だけが登録され、値はundefinedになります。この「宣言が上にあるように見える現象」を巻き上げと呼びます。代入は元の行へ到達したときです。ifやforの波括弧では区切られず、同じ関数内で同じ名前と値の結び付きを共有します。",
        points: [
          "巻き上げで先に用意されるのは名前。代入まで先に実行されるわけではない",
          "varの境界は関数。if・for・単独の波括弧では閉じない",
          "同じ関数内でvarを再宣言しても、別の変数ではなく同じ名前と値の結び付きを使う",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "varもletも変数宣言なら、使える範囲は同じですか？"
          },
          {
            "speaker": "engineer",
            "text": "違います。varはブロックを越えて関数全体へ漏れることがあります。"
          },
          {
            "speaker": "beginner",
            "text": "宣言前に読めてundefinedになるなら、エラーより便利では？"
          },
          {
            "speaker": "engineer",
            "text": "処理順の誤りを見逃しやすくなります。letは宣言前に触るとエラーになる期間があり、範囲も狭いので、新しいコードではletかconstを選ぶのが基本です。"
          }
        ],
        diagram: "var-hoist",
        code: `console.log(a); // undefined（var の巻き上げ）
var a = 1;
// console.log(b); // エラー
let b = 2;`,
        codeCaption: "var はドアの前から名前だけ見える",
        codeExample: `{
  var leaked = 1;
}
console.log(leaked); // 1。部屋の外に漏れる`,
        watch: "既存コードのvarを機械的にletへ変える前に、ループ後も名前を読む処理や、あとで呼ばれる関数が同じ値を共有していないか確認します。新規コードではletまたはconstを基本にします。",
      },
      {
        title: "関数は呼ぶたびに新しい部屋",
        lead: "関数の中の let は、呼び出しごとに新しい部屋です。前回泊まった人の荷物は残っていません。ホテルの同じ号室でも、宿泊が違えば中は空、というイメージです。残したいなら、戻り値で渡すか、外側の変数（クロージャ、中級）を使います。",
        points: [
          "局所変数は、その滞在（呼び出し）の寿命",
          "関数の引数も、その呼び出しの部屋の名前",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "関数内のnを1増やしたら、次の呼び出しはその続きから始まりますか？"
          },
          {
            "speaker": "engineer",
            "text": "関数内で毎回宣言する局所変数なら、呼ぶたび新しく作られます。"
          },
          {
            "speaker": "beginner",
            "text": "同じ関数名だから、同じ部屋を使い回すと思っていました。"
          },
          {
            "speaker": "engineer",
            "text": "同じ設計の部屋でも滞在ごとに別です。引数もその呼び出し専用の名前です。状態を残したいなら、戻り値で外へ渡すか外側の変数を使う仕組みが必要です。"
          }
        ],
        diagram: "scope",
        code: `function f() {
  let n = 0;
  n++;
  return n;
}
f(); // 1
f(); // 1 もう一度 0 から`,
        codeCaption: "泊まるたびに、部屋は空から",
        codeExample: `function f(tag) {
  let n = 0;
  n++;
  return tag + n;
}
console.log(f("A")); // "A1"
console.log(f("B")); // "B1"。前回の n は無い`,
      },
      {
        title: "この講義の要点",
        lead: "let/const はブロックが部屋。内側は外側を隠せる。var は使わない。関数は呼ぶたびに新しい部屋。次はコールバックです。",
        points: [
          "エラー「is not defined」は、その部屋に名前が無い",
          "見える範囲を狭めるほど事故が減る",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "名前はどこからでも読めるのではなく、宣言したブロックを基準に見える範囲が決まるんですね。",
          },
          {
            "speaker": "engineer",
            "text": "そうです。内側から外側は見えても逆は見えず、同名の内側変数が外側を隠す場合もあります。",
          },
          {
            "speaker": "beginner",
            "text": "関数を何度呼んでも局所変数は残り、varもletと同じ部屋に収まると思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "局所変数は呼び出しごとに新しく、varはブロックから漏れやすいので新規コードでは避けます。次は関数を別の処理へ渡すコールバックにつなげましょう。",
          },
        ],
        diagram: "scope",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "地点A・Bから見える名前の組み合わせを選んでください。",
        lead: "ブロックの内側から外側は見えますが、外側から内側へは戻れません。コードを書く前に、名前が有効な範囲を追います。",
        code: `const outer = 1;
{
  const inner = 2;
  // 地点A
}
// 地点B`,
        kind: "choice",
        options: [
          "A: innerのみ ／ B: outerとinner",
          "A: outerのみ ／ B: innerのみ",
          "A: outerとinner ／ B: outerのみ",
        ],
        steps: [
          "地点Aでは現在のブロック内を確認している",
          "地点Aから外側の名前も探している",
          "地点Bでは終了したブロック内の名前を除外している",
        ],
        hint: "内側の部屋からリビングは見えます。部屋を出たあと、その部屋だけの名前は見えません。",
        answer: "A: outerとinner ／ B: outerのみ",
        explain: "内側の部屋から、外側のリビングの名前は見えます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "ブロック内で外側と同名のxを新しく宣言して2を持たせ、内側と外側の値を順に表示してください。",
        lead: "内側で同じ名前を宣言すると、そのブロック内では外側の名前が隠れます。ブロック内では2、ブロックを出た後は元の1が表示されるようにし、外側のx自体は変更しないでください。",
        kind: "code",
        starter: "let x = 1;\n{\n  // 内側の x を書いて、中と外で表示\n}\n",
        fileName: "script.js",
        steps: [
          "ブロック内に別のxを宣言して2を持たせる",
          "ブロック内でそのxを表示する",
          "ブロック外で外側のxを表示する",
          "結果が2と1の順か確認する",
        ],
        hint: "単なる代入では外側の値を変更してしまいます。内側のスコープに、同名の新しい変数を作ることが要点です。",
        sample: "2\n1",
        answer: `let x = 1;
{
  let x = 2;
  console.log(x);
}
console.log(x);`,
        explain:
          "同じ表札でも部屋が違えば別の付箋です。ドアを出ると、外側の 1 がまた見えます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "このコードの表示結果を選んでください。",
        lead: "varは宣言より前に名前だけが見え、ブロックの外にも漏れます。letとの違いを、実行順と見える範囲から判断します。",
        code: `console.log(a);
var a = 1;
{
  var leaked = 2;
}
console.log(leaked);`,
        kind: "choice",
        options: [
          "undefined、2の順に表示される",
          "最初の行でエラーになり、何も表示されない",
          "1、2の順に問題なく表示される",
        ],
        steps: [
          "代入前のaが持つ値を判断できている",
          "波括弧がvarの有効範囲を作るか判断できている",
          "2つの表示を実行順に並べている",
        ],
        hint: "varは名前の用意と値の代入が同時ではありません。また、関数ではない波括弧を越えます。",
        answer: "undefined、2の順に表示される",
        explain:
          "aは名前だけ巻き上がるため最初はundefinedです。leakedはvarなのでブロック外からも読めます。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "注文ごとの処理回数をローカル変数に保ち、別の注文へ持ち越さない。",
        projectRole: "build",
        prompt: "1件の注文内の処理回数だけを数える processOrderを完成させ、2回呼んでも毎回1から始まることを確認してください。",
        lead: "processOrderの中には局所変数orderCountを0で用意し、その呼び出し中に1増やして返します。starterはprocessOrderを2回呼んで結果を表示します。前回の状態を持ち越さず、どちらも1になれば完成です。",
        kind: "code",
        starter:
          "function processOrder() {\n // 局所変数 n を 0 から 1 増やす\n}\nconsole.log(processOrder());\nconsole.log(processOrder());\n",
        fileName: "script.js",
        steps: [
          "関数内に0から始まる局所変数nを作る",
          "nを1増やす",
          "増やした値を戻り値として返す",
          "2回とも同じ結果になることを確認する",
        ],
        hint: "nを関数の外へ出すと状態が残ります。今回は関数の内側で毎回作り直されるスコープを使います。",
        sample: "1\n1",
        answer: `function processOrder() {
  let orderCount = 0;
  n++;
  return orderCount;
}
console.log(processOrder());
console.log(processOrder());`,
        explain:
          "前回の滞在の荷物は残りません。残したいなら戻り値で渡すか、外側の変数を使います。",
      },
    ],
  },
];
