import type { Lesson } from "@/lib/course/types";

export const jsMiddle: Lesson[] = [
  {
    id: "js-ref",
    track: "js",
    level: "middle",
    chapter: "js-ref",
    order: 17,
    title: "参照とコピー",
    summary: "オブジェクトは同じ束を指し合う",
    minutes: 14,
    slides: [
      {
        title: "プリミティブは値そのものがコピーされる",
        lead: "number, string, boolean, null, undefined, symbol, bigint は、代入するとその値が独立します。片方を付け替えても、もう片方は変わりません。これが「コピー」に見える動きです。",
        points: [
          "文字列もプリミティブ。長い文字でも代入は独立した値として扱われる",
          "比較 === は中身が同じなら true（同じ文字なら true）",
        ],
        talk: [
          { speaker: "beginner", text: "a を b に入れたあと a を変えたら、b も一緒に変わりませんか？" },
          { speaker: "engineer", text: "文字列などのプリミティブでは、b は代入時の値を持ったままです。" },
          { speaker: "beginner", text: "文字列が長いと、コピーせずに使い回しそうに見えます。" },
          { speaker: "engineer", text: "長さでは決まりません。値の種類を見て、代入後の変数は独立して考えます。" },
        ],
        diagram: "rewrite",
        code: `let a = "hi";
let b = a;
a = "no";
console.log(b); // "hi"`,
      },
      {
        title: "オブジェクトの代入は「同じ束への矢印」をコピーする",
        lead: "const b = a のとき a がオブジェクトなら、コピーされるのは参照（矢印）です。束は一つ。b.n = 5 は、その一つの束の n を変えるので、a.n も 5 です。",
        points: [
          "名前は2つ、オブジェクトは1つ",
          "=== は「同じ束か」。中身が同じ別物は false",
          "配列でも同じ。名前が2つでも、並びの実体は1つ",
        ],
        talk: [
          { speaker: "beginner", text: "名前が2つあるなら、中身も2つあると思っていました。" },
          { speaker: "engineer", text: "名前は2つでも、矢印の先の束は1つです。だから b.n を変えると a.n も変わります。" },
          { speaker: "beginner", text: "では同じ内容のオブジェクト同士なら === も true ですか？" },
          { speaker: "engineer", text: "比較するのは見た目ではなく同一の実体かです。変更が両方から見えるのも、その共有が理由です。" },
        ],
        diagram: "ref",
        code: `const a = { n: 1 };
const b = a;
b.n = 5;
console.log(a.n); // 5
console.log(a === b); // true`,
        watch:
          "{ n: 1 } === { n: 1 } は false です。見た目が同じでも束が違います。",
      },
      {
        title: "浅いコピーは一段目だけ新しい束",
        lead: "const b = { ...a } は、外側だけ新しい束です。中のオブジェクトはまだ同じ矢印を共有します。一段より奥まで別々にするには、別のコピーが必要です。",
        points: [
          "一段目のキーは独立、ネスト先は共有、が浅いコピー",
          "nested.x を変えると、コピー元からも見える",
          "一段より奥までコピーしないと、内側の変更は元からも見える",
        ],
        talk: [
          { speaker: "beginner", text: "スプレッドでコピーすれば、元はどの階層も安全ですよね？" },
          { speaker: "engineer", text: "新しくなるのは外側で、内側のオブジェクトは共有されたままです。" },
          { speaker: "beginner", text: "全部JSON文字列にして戻せば、簡単に深くコピーできませんか？" },
          { speaker: "engineer", text: "失われる型や値があります。必要な深さとデータ型を確認し、適した構造的コピーを選びます。" },
        ],
        diagram: "ref",
        code: `const a = { n: 1, nested: { x: 9 } };
const b = { ...a };
b.n = 2; // a.n は 1 のまま
b.nested.x = 0; // a.nested.x も 0`,
      },
      {
        title: "関数にオブジェクトを渡すのも参照",
        lead: "引数にオブジェクトを渡すと、関数内の仮引数も同じ束を指します。関数が obj.n = 2 すると、呼び出し元のオブジェクトも変わります。意図しない破壊を避けるなら、コピーしてからいじるか、新しいオブジェクトを return します。",
        points: [
          "「関数が引数を壊す」は参照の共有が原因であることが多い",
          "ドキュメントや名前で、破壊的かどうかを示す",
        ],
        talk: [
          { speaker: "beginner", text: "関数の仮引数は別の変数だから、元のオブジェクトは変わらないですよね？" },
          { speaker: "engineer", text: "変数名は別でも、同じ実体への参照を受け取っています。" },
          { speaker: "beginner", text: "仮引数へ別のオブジェクトを代入した場合も、呼び出し元が置き換わりますか？" },
          { speaker: "engineer", text: "変数の付け替えだけなら変わりません。プロパティを更新しているか、新しい値を返しているかを見ます。" },
        ],
        diagram: "ref",
        code: `function bump(obj) {
  obj.n += 1;
}
const x = { n: 1 };
bump(x);
console.log(x.n); // 2`,
      },
      {
        title: "この講義の要点",
        lead: "プリミティブは独立。オブジェクトは矢印のコピー。浅いコピーは一段だけ。関数渡しでも共有。次は分割とスプレッドです。",
        points: ["=== は同一性", "壊したくなければ新しい束を作る"],
        talk: [
          { speaker: "beginner", text: "代入しても、値なら別々、オブジェクトなら同じ実体を見る、と整理できました。" },
          { speaker: "engineer", text: "よい整理です。ただしオブジェクトを展開しても、ネストまで自動で別々にはなりません。" },
          { speaker: "beginner", text: "変更を共有したくない場面では、どの階層を新しくするか考える必要があるんですね。" },
          { speaker: "engineer", text: "その視点を持って、次は束から値を取り出したり、新しい束へ展開したりする構文を見ましょう。" },
        ],
        diagram: "ref",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "文字列が入った `a` の値を新しい変数 `b` にコピーし、その後 `a` だけを文字列「no」に変更してから `b` を表示してください。",
        lead:
          "文字列はプリミティブ値なので、代入した時点の値が別の変数にコピーされます。コピー元をあとから変更しても、コピー先には影響しません。最後に `hi` が表示されれば完了です。",
        kind: "code",
        starter: 'let a = "hi";\n// b にコピーしてから a を付け替え\n',
        fileName: "script.js",
        steps: [
          "変更前の `a` の値を `b` に保存する",
          "`a` だけを別の文字列へ変更する",
          "`b` が元の値を保っていることを表示で確認する",
        ],
        hint:
          "プリミティブ値を代入した変数どうしは独立しています。表示する対象がコピー先であることを確認しましょう。",
        sample: "hi",
        answer: `let a = "hi";
let b = a;
a = "no";
console.log(b);`,
        explain: "文字列はプリミティブなので、b は hi のままです。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "同じ order を参照する別名から total を更新し、変更共有を確認する。",
        projectRole: "build",
        prompt:
          "`alias` 側からプロパティ `total` を 1200 に変更し、続けて `order.total` と、`order` と `alias` が同じオブジェクトかどうかを表示してください。",
        lead:
          "`order` と `alias` は、すでに同じオブジェクトを参照しています。一方からプロパティを変更すると、もう一方から見ても変更後の値になります。1行目が `1200`、2行目が `true` になれば完了です。",
        kind: "code",
        starter: "const order = { total: 1000 };\nconst alias = order;\n// 同じ束を変えて確認\n",
        fileName: "script.js",
        steps: [
          "`alias` が参照するオブジェクトの `total` を変更する",
          "`order` から同じプロパティを読み、変更が共有されたことを確認する",
          "厳密等価比較で2つの変数が同じ参照か確認する",
        ],
        hint:
          "オブジェクトを代入すると、内容ではなく同じオブジェクトへの参照が共有されます。新しいオブジェクトは作りません。",
        sample: "1200\ntrue",
        answer: `const order = { total: 1000 };
const alias = order;
alias.total = 1200;
console.log(order.total);
console.log(order === alias);`,
        explain:
          "名前は2つでもオブジェクトは1つなので、order.total も 1200、=== は true です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "浅くコピーされた `b` の一段目の `n` と、内側にある `nested.x` を変更し、元の `a.n` と `a.nested.x` を順に表示してください。",
        lead:
          "スプレッドで作った浅いコピーでは、外側は別のオブジェクトですが、ネストしたオブジェクトは共有されたままです。元の一段目は `1` を保ち、共有された内側は `0` になれば完了です。",
        kind: "code",
        starter:
          "const a = { n: 1, nested: { x: 9 } };\nconst b = { ...a };\n// b 側を変えて a を表示\n",
        fileName: "script.js",
        steps: [
          "コピー先の一段目にある値だけを変更する",
          "コピー先からネストしたオブジェクトの値を変更する",
          "コピー元の2つの値を表示し、独立部分と共有部分の違いを確認する",
        ],
        hint:
          "浅いコピーで新しくなるのは外側だけです。内側のオブジェクトはコピー元とコピー先で同じ参照を持ちます。",
        sample: "1\n0",
        answer: `const a = { n: 1, nested: { x: 9 } };
const b = { ...a };
b.n = 2;
b.nested.x = 0;
console.log(a.n);
console.log(a.nested.x);`,
        explain:
          "浅いコピーは一段目だけ新しい束です。nested は共有されるので x も 0 になります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "関数 `bump` の中で、受け取ったオブジェクトの `n` を 1 増やしてください。用意された呼び出し後の表示が `2` になれば完了です。",
        lead:
          "オブジェクトを関数へ渡すと、仮引数も呼び出し元と同じオブジェクトを参照します。関数内でそのプロパティを更新すると、呼び出し元から見える値も変わります。",
        kind: "code",
        starter:
          "function bump(obj) {\n // obj.n を 1 増やす\n}\nconst x = { n: 1 };\nbump(x);\nconsole.log(x.n);\n",
        fileName: "script.js",
        steps: [
          "仮引数が参照するオブジェクトの `n` を現在値から1増やす",
          "呼び出し元のオブジェクトにも変更が反映されたことを確認する",
        ],
        hint:
          "仮引数そのものを別のオブジェクトへ置き換えるのではなく、仮引数が参照しているオブジェクトのプロパティを更新します。",
        sample: "2",
        answer: `function bump(obj) {
  obj.n += 1;
}
const x = { n: 1 };
bump(x);
console.log(x.n);`,
        explain:
          "関数内の仮引数も同じ束を指すので、呼び出し元の x.n も 2 になります。",
      },
    ],
  },
  {
    id: "js-spread",
    track: "js",
    level: "middle",
    chapter: "js-ref",
    order: 18,
    title: "分割代入とスプレッド",
    summary: "束をほどき、また束ねる構文",
    minutes: 12,
    slides: [
      {
        title: "分割は「束から名前へ一気に出す」",
        lead: "const { name, age } = user は user.name と user.age を同名の変数にします。配列は位置で const [first, second] = xs。右側はオブジェクト／配列である必要があります。",
        points: [
          '無いキーは undefined。デフォルトは { name = "客" } = user',
          "別名は { name: userName } = user",
          "ネストも { address: { city } } = user と書ける",
        ],
        talk: [
          { speaker: "beginner", text: "分割代入は、元のオブジェクトからプロパティを削除して取り出すんですか？" },
          { speaker: "engineer", text: "元は変えず、必要な値を変数へ読み出す構文です。" },
          { speaker: "beginner", text: "配列も要素名を指定して取り出すのでしょうか？" },
          { speaker: "engineer", text: "オブジェクトはキー、配列は位置で対応します。左側の括弧の種類から読み分けます。" },
        ],
        diagram: "spread",
        code: `const user = { name: "Aya", age: 20 };
const { name, age } = user;
const [a, b] = [10, 20]; // a=10 b=20`,
      },
      {
        title: "関数の引数でも分割できる",
        lead: "function f({ title, done }) は、渡されたオブジェクトからその場で取り出します。オプションが多い関数で、順番より名前で渡せるようになります。",
        points: [
          '呼び出しは f({ title: "x", done: true })',
          "順番を気にしなくてよい",
          "必須値が無いと undefined になるので、デフォルトや早期 return を置く",
        ],
        talk: [
          { speaker: "beginner", text: "引数が増えたら、順番を全部覚えて呼ぶしかないですか？" },
          { speaker: "engineer", text: "一つのオブジェクトで渡し、仮引数側で必要な名前を取り出せます。" },
          { speaker: "beginner", text: "書かなかったプロパティは、自動でエラーになりますか？" },
          { speaker: "engineer", text: "通常は undefined です。必須なら検査し、省略可能なら既定値を用意します。" },
        ],
        diagram: "spread",
        code: `function label({ name, age }) {
  return name + age;
}`,
      },
      {
        title: "... は「中身をそこに展開する」",
        lead: "配列の [ ...xs, 3 ] は xs の要素を並べて末尾に 3。オブジェクトの { ...user, age: 21 } はコピーして age を上書き。同じキーは後勝ちです。",
        points: [
          "先頭や途中にも展開できる [0, ...xs]",
          "関数呼び出し math.max(...nums) は引数リストへ展開",
          "rest の const [head, ...rest] = xs は残りを配列にまとめる",
        ],
        talk: [
          { speaker: "beginner", text: "... はコピーする記号ですか、それとも中身を取り出す記号ですか？" },
          { speaker: "engineer", text: "この位置では、中身を新しい配列やオブジェクトへ展開します。" },
          { speaker: "beginner", text: "同じキーを後ろにも書いたら、エラーになりそうです。" },
          { speaker: "engineer", text: "後ろの値が残ります。オブジェクト更新では展開と上書きの順番を左から確認します。" },
        ],
        diagram: "spread",
        code: `const xs = [1, 2];
[...xs, 3]; // [1, 2, 3]
const user = { name: "Aya", age: 20 };
{ ...user, age: 21 }; // age だけ 21`,
      },
      {
        title: "rest パラメータは「残りの引数を配列に」",
        lead: "function f(a, ...rest) の rest は 2 番目以降の引数の配列です。可変長引数を自分で扱うときに使います。arguments オブジェクトより意図が明確です。",
        points: [
          "rest は最後の仮引数にしか置けない",
          "1件も無ければ空配列。undefined ではない",
        ],
        talk: [
          { speaker: "beginner", text: "引数の個数が決まらない関数は、どう受け取ればいいですか？" },
          { speaker: "engineer", text: "rest パラメータなら、残りを一つの配列として扱えます。" },
          { speaker: "beginner", text: "引数が無いと nums は undefined になりますか？" },
          { speaker: "engineer", text: "空配列になります。配列メソッドを使える一方、rest は仮引数の最後にだけ置けます。" },
        ],
        diagram: "spread",
        code: `function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6`,
      },
      {
        title: "この講義の要点",
        lead: "分割は取り出し、スプレッドは展開、rest はまとめ。後勝ちで上書き。次は this です。",
        points: [
          "コピーしつつ一部だけ変えるのが { ...obj, key: next }",
          "配列の rest は残り全部",
        ],
        talk: [
          { speaker: "beginner", text: "分割は必要な値を取り出し、スプレッドは中身を広げ、rest は余りをまとめるものですね。" },
          { speaker: "engineer", text: "合っています。同じ ... でも、置かれた場所によって展開か収集かが変わります。" },
          { speaker: "beginner", text: "オブジェクト更新では、後ろに書いたキーが残る順番も確認します。" },
          { speaker: "engineer", text: "その読み方ができれば十分です。次は、書いた場所より呼び方が重要になる this へ進みます。" },
        ],
        diagram: "spread",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "会員カードの `user` から `name` と `age` を、直近2回の得点 `[10, 20]` から `a` と `b` を取り出し、この順に表示してください。",
        lead:
          "入力には、名前と年齢を持つ会員オブジェクトと、古い順に並ぶ得点配列があります。オブジェクトは項目名、配列は位置に対応させて4つの変数を用意し、`Aya`、`20`、`10`、`20` が1行ずつ表示されれば完了です。",
        kind: "code",
        starter: 'const user = { name: "Aya", age: 20 };\n// 分割して4つ表示\n',
        fileName: "script.js",
        steps: [
          "オブジェクトから指定された2つのプロパティを同名の変数へ取り出す",
          "配列の先頭と2番目を、それぞれ指定された変数へ取り出す",
          "4つの値が指定された順番で表示されることを確認する",
        ],
        hint:
          "オブジェクトには波括弧を使って名前で、配列には角括弧を使って位置で分割する、という違いを意識しましょう。",
        sample: "Aya\n20\n10\n20",
        answer: `const user = { name: "Aya", age: 20 };
const { name, age } = user;
const [a, b] = [10, 20];
console.log(name);
console.log(age);
console.log(a);
console.log(b);`,
        explain:
          "分割は束から名前へ一気に出します。無いキーは undefined です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "利用者オブジェクトを1つ受け取り、引数の位置で `name` と `age` を取り出す `label` 関数を作ってください。2つの値を空白なしでつないだ結果を表示します。",
        lead:
          "項目が増える関数では、値を順番で渡すより、名前付きのオブジェクトで渡す方が意図を読みやすくできます。必要な項目を受け取り口で取り出し、`Aya20` が表示されれば完了です。",
        kind: "code",
        starter: '// 利用者オブジェクトを名前で受け取る label を作る\n',
        fileName: "script.js",
        steps: [
          "1つのオブジェクトから必要な2項目を、関数の受け取り口で取り出す",
          "取り出した値から空白のない戻り値を作る",
          "名前と年齢を持つ利用者を渡し、戻り値を表示する",
        ],
        hint:
          "呼び出し側は1つのオブジェクトを渡します。関数内で何度もプロパティ参照するのではなく、仮引数の構文で必要な名前を用意します。",
        sample: "Aya20",
        answer: `function label({ name, age }) {
  return name + age;
}
console.log(label({ name: "Aya", age: 20 }));`,
        explain:
          "関数の引数でも、渡されたオブジェクトからその場で取り出せます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "`xs` の末尾に 3 を追加した新しい配列と、`user` の `age` だけを 21 に変更した新しいオブジェクトを、この順に表示してください。",
        lead:
          "スプレッド構文は、元の配列やオブジェクトの内容を新しい入れ物へ展開できます。元の値は変更せず、新しい値をそれぞれ作ります。配列は `[1,2,3]`、オブジェクトは名前を保ったまま年齢が 21 になれば完了です。",
        kind: "code",
        starter:
          'const xs = [1, 2];\nconst user = { name: "Aya", age: 20 };\n// ... で展開して表示\n',
        fileName: "script.js",
        steps: [
          "元の配列を展開し、末尾に新しい要素を加えた配列を作って表示する",
          "元のオブジェクトを展開し、年齢だけを新しい値にしたオブジェクトを作って表示する",
        ],
        hint:
          "オブジェクトで同じプロパティが複数回現れる場合は、後に指定された値が残ります。展開と上書きの順序を考えましょう。",
        sample: '[1,2,3]\n{"name":"Aya","age":21}',
        answer: `const xs = [1, 2];
const user = { name: "Aya", age: 20 };
console.log([...xs, 3]);
console.log({ ...user, age: 21 });`,
        explain:
          "... は中身をそこに展開します。オブジェクトはコピーして age だけ上書きできます。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "明細金額を可変長引数で受け、order.total を計算する関数を作る。",
        projectRole: "build",
        prompt:
          "明細数が毎回異なる注文の total を計算するため、個数の決まっていない数値を残余引数 `itemTotals` で受け取る `calculateTotal` 関数を作ってください。",
        lead:
          "入力は別々の引数として渡される `1`、`2`、`3` です。集計値を `acc`、現在値を `n` として0から合計し、引数がない注文でも計算できるようにします。表示が `6` になれば完了です。",
        kind: "code",
        starter: "// 可変個の数値を受け取る calculateTotal を作る\n",
        fileName: "script.js",
        steps: [
          "個数の決まっていない引数を、関数内で配列として扱える形で受け取る",
          "受け取ったすべての数値を1つの値へ集計する",
          "合計の開始値を0にし、空の配列でも安全に処理できるようにする",
          "1、2、3を別々の引数として渡し、結果を表示する",
        ],
        hint:
          "通常の配列を引数に渡す設計ではありません。仮引数側で「残りをまとめる」構文を使い、できた配列を初期値から集計します。",
        sample: "6",
        answer: `function calculateTotal(...itemTotals) {
  return itemTotals.reduce((acc, n) => acc + n, 0);
}
console.log(calculateTotal(1, 2, 3));`,
        explain:
          "...itemTotals は残りの引数の配列です。1件も無ければ空配列になります。",
      },
    ],
  },
  {
    id: "js-array-methods",
    track: "js",
    level: "middle",
    chapter: "js-array-fn",
    order: 14,
    title: "map と filter と reduce",
    summary: "配列を変換・選別・畳み込む",
    minutes: 18,
    slides: [
      {
        title: "map は同じ長さの新しい配列を返す",
        lead: "xs.map(n => n * 2) は、各要素を関数に通し、戻り値を同じ順番で並べた新しい配列です。元の配列は変わりません。長さは必ず同じです。",
        points: [
          "コールバックの引数は (要素, インデックス, 配列)",
          "return を忘れると undefined が並ぶ",
          "副作用（log だけ）なら forEach。変換なら map",
        ],
        talk: [
          { speaker: "beginner", text: "各要素を2倍したいなら、元の配列を書き換える処理ですか？" },
          { speaker: "engineer", text: "map は各戻り値を並べた、同じ長さの新しい配列を作ります。" },
          { speaker: "beginner", text: "コールバック内で計算すれば、return は省いてもよいですよね？" },
          { speaker: "engineer", text: "波括弧を使うなら明示して返します。返し忘れは undefined の列になるので出口を見ます。" },
        ],
        diagram: "map",
        code: `[1, 2, 3].map((n) => n * 2);
// [2, 4, 6]`,
        codeCaption: "同じ長さの新しい列",
        codeExample: `[1, 2, 3].forEach((n) => n * 2);
// 戻り値は undefined。変換したいなら map`,
      },
      {
        title: "filter は条件が真の要素だけ残す",
        lead: "xs.filter(n => n > 1) は、コールバックが truthy を返した要素だけを、元の順で新しい配列にします。長さは短くなり得ます。元は変わりません。",
        points: [
          "残すかどうかなので、戻り値は boolean が分かりやすい",
          "map のあと filter、filter のあと map とつなげる",
        ],
        talk: [
          { speaker: "beginner", text: "条件に合う要素を true に変換したいとき、filter を使いますか？" },
          { speaker: "engineer", text: "filter は要素自体を残すか除くかを決めます。" },
          { speaker: "beginner", text: "戻り値が数値でも動くのはなぜですか？" },
          { speaker: "engineer", text: "truthy として判定されるためです。ただ、意図が伝わる真偽の条件を書く方が読みやすいです。" },
        ],
        diagram: "map",
        code: `[1, 2, 3].filter((n) => n > 1);
// [2, 3]`,
        codeCaption: "条件が真のものだけ残す",
        codeExample: `[1, 2, 3].map((n) => n > 1);
// [false, true, true]。残すのではなく、真偽の列になる`,
      },
      {
        title: "find / some / every は配列ではなく1値",
        lead: "find は最初に条件を満たす要素そのもの（無ければ undefined）。some は1つでも真なら true。every は全部真なら true。空配列の every は true です（「偽の反例が無い」）。",
        points: [
          "「あるか」は some、「全部か」は every、「取り出す」は find",
          "index が要るなら findIndex。無ければ -1",
        ],
        talk: [
          { speaker: "beginner", text: "条件に合うものがあるか調べるなら、find の結果を true として使えば十分ですか？" },
          { speaker: "engineer", text: "有無だけなら some が真偽値を返し、意図も明確です。" },
          { speaker: "beginner", text: "every は空配列なら、調べる要素がないので false ですか？" },
          { speaker: "engineer", text: "反例が一つもないため true です。欲しいのが要素、位置、真偽のどれかで選びます。" },
        ],
        diagram: "map",
        code: `[1, 2, 3].some((n) => n > 2); // true
[1, 2, 3].find((n) => n > 2); // 3`,
      },
      {
        title: "reduce は1つの値に畳む",
        lead: "xs.reduce((acc, n) => acc + n, 0) は、初期値 0 から始め、各要素で acc を更新します。合計・グループ化・マップ作成など、配列から別形への変換の汎用形です。最初は sum から覚えると安全です。",
        points: [
          "第2引数の初期値を省略すると先頭要素が初期値になり、空配列でエラー",
          "acc に配列やオブジェクトを足していく書き方もできるが、読みにくくなりがち",
        ],
        talk: [
          { speaker: "beginner", text: "reduce の acc は、配列の前の要素を指すんですか？" },
          { speaker: "engineer", text: "前回のコールバックが返した集計途中の値です。" },
          { speaker: "beginner", text: "合計なら初期値を省いても同じなので、不要ですよね？" },
          { speaker: "engineer", text: "空配列で失敗し、型も読みにくくなります。何から畳み始めるかを第2引数で明示します。" },
        ],
        diagram: "map",
        code: `[1, 2, 3].reduce((acc, n) => acc + n, 0);
// 6`,
        codeCaption: "初期値から、1個ずつ足していく",
        codeExample: `[1, 2, 3].reduce((acc, n) => acc + n);
// 6。初期値なしだと先頭が初期値。空配列ではエラー`,
      },
      {
        title: "includes と join は「あるか」「つなぐか」",
        lead: "変換ではなく、調べる・文字にする操作もあります。includes は値が入っているか。join は要素を文字列でつなぎます。コールバックは使いません。",
        points: [
          "includes(2) は 2 があれば true。=== で比べる",
          'join(",") は "1,2,3"。区切りを自分で決める',
          "文字列の includes もあるが、配列のとは別",
        ],
        talk: [
          { speaker: "beginner", text: "includes と find は、どちらも要素を探して返すんですか？" },
          { speaker: "engineer", text: "includes は指定した値の有無を真偽で返し、条件関数は取りません。" },
          { speaker: "beginner", text: "join は配列そのものを文字列へ変えてしまいますか？" },
          { speaker: "engineer", text: "元は配列のまま、新しい文字列を返します。区切り文字が結果へ入る点を確認します。" },
        ],
        diagram: "array",
        code: `[1, 2, 3].includes(2); // true
[1, 2, 3].join("-"); // "1-2-3"`,
        codeCaption: "入っているか、文字でつなぐか",
        codeExample: `["Aya", "Ren"].includes("Aya"); // true
["Aya", "Ren"].join("と"); // "AyaとRen"`,
      },
      {
        title: "toSorted は写真を並べる",
        lead: "sort は今ある配列そのものを変えます（破壊的）。いまの JavaScript では toSorted が先です。新しい配列を返し、元は触りません。数字の大小で並べたいときは比較関数 (a, b) => a - b を渡します。渡さないと文字として並ぶので、[10, 2, 1] が [1, 10, 2] になり得ます。",
        points: [
          "残したい列には toSorted。本体を変えてよいときだけ sort",
          "(a, b) => a - b が昇順。b - a が降順",
          "文字列どうしは localeCompare。toReversed も写真",
        ],
        talk: [
          { speaker: "beginner", text: "数値を並べるだけなら、比較関数なしでも小さい順になりますか？" },
          { speaker: "engineer", text: "既定では文字列として比べるため、桁数が違う数値で期待を外れます。" },
          { speaker: "beginner", text: "sort の結果を別変数へ入れれば、元は保てますよね？" },
          { speaker: "engineer", text: "sort は先に元を変えます。残すなら toSorted と数値用の比較関数を組み合わせます。" },
        ],
        diagram: "array",
        code: `const xs = [10, 2, 1];
xs.toSorted((a, b) => a - b); // [1, 2, 10]
// xs は [10, 2, 1] のまま`,
        codeCaption: "並べた写真。本人は動かない",
        codeExample: `const xs = [10, 2, 1];
xs.sort((a, b) => a - b);
// xs 自体が [1, 2, 10] になる`,
        watch: "sort は元の配列を変えます。const でも中身は並び替わります。",
      },
      {
        title: "この講義の要点",
        lead: "map は変換、filter は選別、reduce は畳み込み。includes は所属、join は文字、並べ替えは toSorted。次はいまでの JavaScript です。",
        points: [
          "長さが同じなら map",
          "間引くなら filter",
          "1つにまとめるなら reduce",
        ],
        talk: [
          { speaker: "beginner", text: "欲しい結果が変換後の配列か、選んだ配列か、一つの集計値かでメソッドを選べそうです。" },
          { speaker: "engineer", text: "その判断軸が大切です。探すだけなら some や find、文字化なら join の方が意図に合う場合もあります。" },
          { speaker: "beginner", text: "並べ替えでは、元を残すかと数値用の比較方法も忘れないようにします。" },
          { speaker: "engineer", text: "目的と戻り値を先に決める習慣を、次の新しいJavaScriptの道具にもつなげましょう。" },
        ],
        diagram: "map",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "商品ごとの税抜価格 `nums` から、各価格を2倍したセット商品の価格一覧を作って表示してください。元の価格一覧は変更しないでください。",
        lead:
          "入力は `[1, 2, 3]` で、すべての商品に同じ変換を適用します。変換後も元と同じ順序・件数を保つ新しい配列を作り、`[2,4,6]` が表示されれば完了です。",
        kind: "code",
        starter: "const nums = [1, 2, 3];\n// map して表示\n",
        fileName: "script.js",
        steps: [
          "各要素から2倍の値を返す変換を配列全体に適用する",
          "変換で得た新しい配列を表示し、要素数と順序を確認する",
        ],
        hint:
          "繰り返すだけの処理ではなく、コールバックの戻り値から新しい配列を作るメソッドを選びましょう。",
        sample: "[2,4,6]",
        answer: `const nums = [1, 2, 3];
console.log(nums.map((n) => n * 2));`,
        explain: "map は同じ長さの新しい配列を返します。長さは必ず同じです。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "在庫数 `nums` から、残りが1個より多い商品の数だけを新しい一覧に残して表示してください。",
        lead:
          "入力は `[1, 2, 3]` で、元の順序は変えません。各在庫数を残すか除くか判定し、条件を満たす `[2,3]` が表示されれば完了です。",
        kind: "code",
        starter: "const nums = [1, 2, 3];\n// filter して表示\n",
        fileName: "script.js",
        steps: [
          "各要素が1より大きいかを判定する条件を用意する",
          "条件を満たす要素だけの新しい配列を表示する",
        ],
        hint:
          "要素を別の値へ変換するのではなく、各要素を残すか除くかを真偽値で決めるメソッドを使います。",
        sample: "[2,3]",
        answer: `const nums = [1, 2, 3];
console.log(nums.filter((n) => n > 1));`,
        explain: "filter は条件が真の要素だけを、元の順で新しい配列にします。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "待ち時間 `nums` に2分を超える値があるかを表示し、続けて最初に見つかる該当値を表示してください。",
        lead:
          "入力は `[1, 2, 3]` です。まず該当データの有無を真偽値で確認し、次に同じ条件で値そのものを取得します。`true` と `3` がこの順に表示されれば完了です。",
        kind: "code",
        starter: "const nums = [1, 2, 3];\n// some と find を表示\n",
        fileName: "script.js",
        steps: [
          "同じ条件を使い、条件を満たす要素が1つでもあるか確認する",
          "条件を満たす最初の要素を取得して表示する",
          "真偽値と要素そのものの違いを確認する",
        ],
        hint:
          "有無の確認と要素の取得では戻り値の種類が異なります。それぞれの目的に合う配列メソッドを選びましょう。",
        sample: "true\n3",
        answer: `const nums = [1, 2, 3];
console.log(nums.some((n) => n > 2));
console.log(nums.find((n) => n > 2));`,
        explain:
          "some は true、find は要素そのもの 3 を返します。無ければ find は undefined です。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "orders の各 total を reduce し、order-count が0でも安全な請求合計を作る。",
        projectRole: "build",
        prompt:
          "3件の `orders` にある `total` から請求合計を求めます。`reduce` を使って全注文を合計し、結果を表示してください。",
        lead:
          "入力は `[{ total: 100 }, { total: 200 }, { total: 300 }]` で、空の明細でも合計0として扱える必要があります。初期値から各金額を順に加え、請求額 `600` が表示されれば完了です。",
        kind: "code",
        starter: "const orders = [{ total: 100 }, { total: 200 }, { total: 300 }];\n// 初期値 0 から足していく\n",
        fileName: "script.js",
        steps: [
          "合計の初期値を決める",
          "これまでの合計accへ現在の注文orderを加える集計を全注文に適用する",
          "最終的な集計結果を表示する",
        ],
        hint:
          "空配列でも安全に合計できるよう、加算を始める値を `reduce` に明示しましょう。",
        sample: "600",
        answer: `const orders = [{ total: 100 }, { total: 200 }, { total: 300 }];
console.log(orders.reduce((acc, order) => acc + order.total, 0));`,
        explain: "0+100+200+300 で 600 です。reduce は配列を1つの値に畳みます。",
      },
      {
        id: "q5",
        slide: 4,
        prompt:
          "選択済みの商品ID `nums` にID 2が含まれるかを表示し、続けてURL用に全IDをハイフンでつないで表示してください。",
        lead:
          "入力は `[1, 2, 3]` です。最初にIDの有無を真偽値で確認し、次に順序を保った1つの文字列へ変換します。`true` と `1-2-3` がこの順に表示されれば完了です。",
        kind: "code",
        starter: "const nums = [1, 2, 3];\n// includes と join\n",
        fileName: "script.js",
        steps: [
          "配列に目的の数値が含まれるか確認して表示する",
          "ハイフンを区切り文字にして配列を文字列化し、表示する",
        ],
        hint:
          "`includes` には探す値を、`join` には要素間に入れたい区切り文字を渡します。どちらもコールバックは使いません。",
        sample: "true\n1-2-3",
        answer: `const nums = [1, 2, 3];
console.log(nums.includes(2));
console.log(nums.join("-"));`,
        explain:
          "includes は所属、join は文字の列にします。コールバックは使いません。",
      },
      {
        id: "q6",
        slide: 5,
        prompt:
          "登録順で保存された価格一覧 `xs` を、表示用に安い順へ並べた新しい配列を作って表示してください。保存中の配列は変更しないでください。",
        lead:
          "入力は `[10, 2, 1]` で、元の登録順を後でも利用します。数値の大小で昇順に比較し、元を保ったまま `[1,2,10]` が表示されれば完了です。",
        kind: "code",
        starter: "const xs = [10, 2, 1];\n// 元を変えない並べ替え\n",
        fileName: "script.js",
        steps: [
          "元の配列を変更しない並べ替え方法を選ぶ",
          "比較する2つの数値をaとbで受け、大小を昇順として判定する関数を渡す",
          "返された新しい配列を表示する",
        ],
        hint:
          "数値の昇順では、比較する2値の差が負・0・正のどれになるかを返す考え方を使います。比較関数を省略すると文字列として並びます。",
        sample: "[1,2,10]",
        answer: `const xs = [10, 2, 1];
console.log(xs.toSorted((a, b) => a - b));`,
        explain: "比較関数 a - b が昇順です。toSorted は新しい配列を返し、元は変わりません。",
      },
    ],
  },
  {
    id: "js-closure",
    track: "js",
    level: "middle",
    chapter: "js-callback",
    order: 13,
    title: "クロージャは外側の部屋を覚えている",
    summary: "関数が、生まれた場所の変数を持ち続ける",
    minutes: 14,
    slides: [
      {
        title: "内側の関数は、外側の名前を読める",
        lead: "関数の中で関数を定義すると、内側は書かれた場所の外側にある変数を読めます。「呼ばれた場所」ではなく「書かれた場所」で名前の見える範囲が決まる規則を、字句スコープと呼びます。内側があとで呼ばれても、その変数へのつながりは残ります。",
        points: [
          "返された関数が、外側の count を指し続ける",
          "呼び出し元の一時変数なのに、関数が生きていると回収されない",
        ],
        talk: [
          { speaker: "beginner", text: "外側の関数が return したら、count も消えるのでは？" },
          { speaker: "engineer", text: "返された内側の関数が参照している間、その環境は残ります。外側の実行が終わっても、countの置き場はすぐ回収されません。" },
          { speaker: "beginner", text: "関数の中に値がコピーされて保存されるんですか？" },
          { speaker: "engineer", text: "値の写真ではなく変数への生きた参照です。呼ぶたび同じcountを読み書きでき、makeCounterを別に呼べば別のcountになります。" },
        ],
        diagram: "closure",
        code: `function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}
const c = makeCounter();
c(); // 1
c(); // 2`,
        codeCaption: "c が生きているあいだ、count も生きる",
      },
      {
        title: "作るたびに別の部屋",
        lead: "makeCounter() を2回呼ぶと、count は2つできます。c1 と c2 は独立です。クロージャは「その関数が作られたときの環境」のスナップショットではなく、生きた参照です。",
        points: [
          "同じ関数定義でも、呼び出しが違えば環境が違う",
          "共有したいなら、同じ外側の変数を閉じ込める",
        ],
        talk: [
          { speaker: "beginner", text: "同じ makeCounter から作るなら、カウンターの値も共有されますか？" },
          { speaker: "engineer", text: "外側を呼ぶたびに、新しい count の環境が作られます。" },
          { speaker: "beginner", text: "同じ設計の関数なのに、別状態を持てるのが不思議です。" },
          { speaker: "engineer", text: "関数定義ではなく、どの呼び出しで生まれた環境を閉じているかを見ます。" },
        ],
        diagram: "closure",
        code: `const c1 = makeCounter();
const c2 = makeCounter();
c1(); // 1
c2(); // 1 別の count`,
      },
      {
        title: "ループと let / var でクロージャが変わる",
        lead: "var と遅れて呼ばれる関数を組み合わせると、全員がループ終了後の同じiを見てしまいがちです。letは繰り返しごとに、別の名前と値の結び付きを作ります。この結び付きを技術資料では束縛と呼びます。今はletを使い、必要ならその周の値を引数で渡します。",
        points: [
          "setTimeout の中で i を読む典型バグは、var の関数スコープが原因だった",
          "let なら周ごとに i が違う",
        ],
        talk: [
          { speaker: "beginner", text: "ループ後に関数を呼ぶと、どれも最後の i を返すことがあります。" },
          { speaker: "engineer", text: "varでは、あとで呼ばれる全関数が同じiとの結び付きを見るために起きます。" },
          { speaker: "beginner", text: "let は単にブロックの外から見えないだけでは？" },
          { speaker: "engineer", text: "letを使うforでは、繰り返しごとに別のiとの結び付きも作ります。遅れて読む関数との差がそこに出ます。" },
        ],
        diagram: "closure",
        code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2（let の場合）`,
      },
      {
        title: "何に使うか",
        lead: "データと操作を一組にして外に出さない（カプセル化）、イベントハンドラが作られたときの値を覚える、部分適用。モジュールの内部状態も、クロージャの親戚です。",
        points: [
          "外から count を直接書き換えられない",
          "公開するのは増やす関数だけ、という設計ができる",
        ],
        talk: [
          { speaker: "beginner", text: "状態をオブジェクトのプロパティにせず隠す利点は何ですか？" },
          { speaker: "engineer", text: "許可した関数だけが変更でき、外から不正な値を直接入れにくくなります。" },
          { speaker: "beginner", text: "では大きなデータも全部閉じ込めておけば安全ですね？" },
          { speaker: "engineer", text: "参照が残る間は回収されません。長寿命のハンドラが不要な巨大データを捕まえていないか注意します。" },
        ],
        diagram: "closure",
        note: "メモリに残り続ける点は、巨大なオブジェクトを閉じ込めたままハンドラを捨てないとリークの原因になります。",
      },
      {
        title: "この講義の要点",
        lead: "内側の関数は外側の変数への参照を保持する。作るたびに環境は別。let のループは周ごとに別。次は配列メソッドです。",
        points: [
          "残るのは値のコピーではなく参照",
          "独立させたいなら工場関数を呼び直す",
        ],
        talk: [
          { speaker: "beginner", text: "クロージャは昔の値を保存する箱ではなく、生まれた環境の変数を見続ける関数なんですね。" },
          { speaker: "engineer", text: "その通りです。同じ工場関数でも、呼び出すたびに環境は別に作られます。" },
          { speaker: "beginner", text: "状態を隠せる反面、不要な大きい値まで長く残さないよう注意します。" },
          { speaker: "engineer", text: "よい視点です。次は、このようなコールバックを配列処理でどう使うかを整理します。" },
        ],
        diagram: "closure",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "order-count を外部から直接触れないクロージャに保持する。",
        projectRole: "build",
        prompt:
          "登録済みのorder-countを記録する`makeCounter`を完成させ、返された関数を呼ぶたびに`orderCount`を1増やして返してください。",
        lead:
          "入力には初期値0と、同じカウンターを2回呼ぶ表示処理があります。関数を呼び終えた後も前回の回数を保持し、`1`、`2` と表示されれば完了です。",
        kind: "code",
        starter:
          "function makeCounter() {\n let orderCount = 0;\n return function () {\n // orderCount を増やして返す\n };\n}\nconst c = makeCounter();\nconsole.log(c());\nconsole.log(c());\n",
        fileName: "script.js",
        steps: [
          "内側の関数で、外側の `orderCount` を現在値から1増やす",
          "更新後の値を呼び出し元へ返す",
          "2回目の呼び出しが1回目の状態を引き継ぐことを確認する",
        ],
        hint:
          "`orderCount` の初期化は外側に置いたままにします。内側で初期化し直すと、呼び出すたびに状態が失われます。",
        sample: "1\n2",
        answer: `function makeCounter() {
  let orderCount = 0;
  return function () {
    orderCount += 1;
    return orderCount;
  };
}
const c = makeCounter();
console.log(c());
console.log(c());`,
        explain:
          "c が生きているあいだ orderCount も生きるので、2回目は 2 になります。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "記事Aと記事Bの閲覧回数を別々に数えるため、`makeCounter` から `c1` と `c2` を作り、それぞれを1回ずつ実行して表示してください。",
        lead:
          "入力の工場関数は、呼び出すたびに初期値0の新しい `count` を用意します。同じカウンターを使い回さず、記事ごとの状態を独立させて `1` が2行表示されれば完了です。",
        kind: "code",
        starter:
          "function makeCounter() {\n let count = 0;\n return function () {\n count += 1;\n return count;\n };\n}\n// c1 と c2 は別の部屋\n",
        fileName: "script.js",
        steps: [
          "工場関数を2回呼び、戻ってきた関数を別々の変数へ保存する",
          "各関数を1回ずつ実行し、それぞれの戻り値を表示する",
          "2つの状態が独立していることを結果から確認する",
        ],
        hint:
          "同じカウンターを2回使うのではなく、工場関数から独立したカウンターを2つ作ることがポイントです。",
        sample: "1\n1",
        answer: `function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
console.log(c1());
console.log(c2());`,
        explain:
          "同じ関数定義でも、呼び出しが違えば環境が違います。c1 と c2 は独立です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "3つのタブ用に、押されたとき自分の位置 `i` を返す関数をループで作り、`fns` に1つずつ追加してください。",
        lead:
          "入力では `let` のループが0から2まで進み、ループ後に3つの関数を順番に呼びます。各関数が作られた回の位置を保持し、`0`、`1`、`2` と表示されれば完了です。",
        kind: "code",
        starter:
          "const fns = [];\nfor (let i = 0; i < 3; i++) {\n // この周の i を返す関数を入れる\n}\nconsole.log(fns[0]());\nconsole.log(fns[1]());\nconsole.log(fns[2]());\n",
        fileName: "script.js",
        steps: [
          "各ループで、現在の `i` をあとから返せる関数を作る",
          "作った関数を順番に配列へ追加する",
          "用意された呼び出しで各回の値が保持されていることを確認する",
        ],
        hint:
          "配列へ追加するのは数値そのものではなく、あとで数値を返す関数です。`let` が繰り返しごとに別の値を保持します。",
        sample: "0\n1\n2",
        answer: `const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns[0]());
console.log(fns[1]());
console.log(fns[2]());`,
        explain: "let なら周ごとに i が違うので、あとから呼んでも 0 1 2 です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "`makeSecret` 内の非公開な `count` を、公開された `inc` メソッドが1増やして返すようにしてください。表示結果が `1` と `undefined` になれば完了です。",
        lead:
          "クロージャを使うと、状態を外側から直接変更できない場所に置き、操作だけを公開できます。`count` は返すオブジェクトのプロパティにはせず、`inc` だけがアクセスできる状態にします。",
        kind: "code",
        starter:
          "function makeSecret() {\n let count = 0;\n return {\n inc() {\n // count を増やして返す\n },\n };\n}\nconst box = makeSecret();\nconsole.log(box.inc());\nconsole.log(box.count);\n",
        fileName: "script.js",
        steps: [
          "`inc` の中から外側の `count` を1増やす",
          "更新後の値をメソッドの戻り値にする",
          "`count` が返されたオブジェクトから直接読めないことも確認する",
        ],
        hint:
          "状態は外側のローカル変数に置いたままにし、返すオブジェクトには状態そのものではなく操作だけを含めます。",
        sample: "1\nundefined",
        answer: `function makeSecret() {
  let count = 0;
  return {
    inc() {
      count += 1;
      return count;
    },
  };
}
const box = makeSecret();
console.log(box.inc());
console.log(box.count);`,
        explain:
          "count はクロージャの中にあり、外からは undefined です。操作だけ公開できます。",
      },
    ],
  },
  {
    id: "js-this",
    track: "js",
    level: "middle",
    chapter: "js-class",
    order: 19,
    title: "this は呼び出し方が決める",
    summary: "誰がその関数を呼んだかで指し先が変わる",
    minutes: 14,
    slides: [
      {
        title: "this は定義場所ではなく呼び出し方",
        lead: "function キーワードの関数では、this は「どう呼ばれたか」で決まります。obj.method() なら this は obj。素の f() なら、モジュール／厳格モードでは undefined、緩いスクリプトではグローバルになり得ます。",
        points: [
          "メソッドとして呼ぶと、ドットの左が this",
          "取り外して const f = obj.method; f() だと左が消える",
          "コールバックに渡すと、メソッド呼び出しではなくなることが多い",
        ],
        talk: [
          { speaker: "beginner", text: "メソッド内の this は、書いたオブジェクトに固定されていますか？" },
          { speaker: "engineer", text: "通常関数では、呼び出したときのドットの左側で決まります。" },
          { speaker: "beginner", text: "同じ関数を変数へ取り出しても、中身は同じだから動きますよね？" },
          { speaker: "engineer", text: "関数は同じでも呼び方が変わり、左側を失います。定義より呼び出し式を確認します。" },
        ],
        diagram: "this-call",
        code: `const user = {
  name: "Aya",
  hello() {
    return this.name;
  },
};
user.hello(); // "Aya"
const f = user.hello;
f(); // this が user ではない`,
        watch:
          "取り外した瞬間に this が壊れます。意図して bind するか、アローを使います。",
      },
      {
        title: "call / apply / bind は this を明示する",
        lead: "f.call(obj, a, b) は this を obj にして呼びます。apply は引数を配列で。bind は this を固定した新しい関数を返します（今はまだ呼ばない）。",
        points: [
          "bind は一度固定すると、あとから call しても基本は変わらない",
          "イベントリスナに method を渡すときは bind かアロー",
        ],
        talk: [
          { speaker: "beginner", text: "取り外したメソッドへ、元の this をあとから戻せますか？" },
          { speaker: "engineer", text: "call は指定して今呼び、bind は固定した新しい関数を作ります。" },
          { speaker: "beginner", text: "bind を実行した時点で、元の関数も一度動くんですか？" },
          { speaker: "engineer", text: "まだ動きません。戻り値が実行結果か関数かを区別すると、call との違いが分かります。" },
        ],
        diagram: "this-call",
        code: `function greet() {
  return this.name;
}
greet.call({ name: "Ken" }); // "Ken"
const g = greet.bind({ name: "Aya" });
g(); // "Aya"`,
        callouts: [
          {
            label: "bind は一度固定すると、あとから call しても基本は変わらない",
            line: 4,
            token: ".bind",
            target: "code",
            style: "brace",
          },
        ],
      },
      {
        title: "アロー関数の this は外側をそのまま使う",
        lead: "() => は自分の this を持ちません。書かれた場所の this を使います。メソッド本体をアローにすると、obj.method() でも this が obj にならないことがあります。逆に、メソッド内のコールバックではアローが外側の this を保てます。",
        points: [
          "オブジェクトリテラルのメソッドは短縮 hello() {} か function",
          "setTimeout の中で this.x したいならアローが向く",
        ],
        talk: [
          { speaker: "beginner", text: "this がずれるのを避けるなら、いつも短い関数の書き方にすればよいですか？" },
          { speaker: "engineer", text: "その短い書き方（アロー関数）は、自分の this を作らず外側のものを使います。" },
          { speaker: "beginner", text: "オブジェクトのメソッド本体にも向いていそうです。" },
          { speaker: "engineer", text: "そこでは obj を this にしたいので通常メソッドが適します。内側のコールバックではアローが便利です。" },
        ],
        diagram: "this-call",
        code: `const user = {
  name: "Aya",
  wait() {
    setTimeout(() => {
      console.log(this.name); // "Aya"
    }, 0);
  },
};`,
      },
      {
        title: "次の class でも、this の決まりは同じ",
        lead: "次の講義の class でも、中の通常メソッドは呼び出し方が this を決めます。コンストラクタは new されたインスタンスが this です。フィールドの handler = () => this.save() は、作られたときのインスタンスを閉じ込める定番です。",
        points: [
          "new を付け忘れると this が壊れる（class はエラーになることが多い）",
          "React などのクラスコンポーネントでも同じ話だった",
        ],
        talk: [
          { speaker: "beginner", text: "次に学ぶ class の中なら、メソッドの this はインスタンスに固定されますか？" },
          { speaker: "engineer", text: "通常メソッドなので、やはり呼び出し方で決まります。class だから特別、ではありません。" },
          { speaker: "beginner", text: "イベントへ method だけ渡すと、インスタンス情報を保てないことがあるんですね。" },
          { speaker: "engineer", text: "はい。ドットの左を失うなら bind するか、インスタンスを閉じるアローフィールドを使います。次の講義で class の書き方と合わせて使います。" },
        ],
        diagram: "this-call",
        note: "迷ったら「ドットの左は誰か」「アローか function か」の2点だけ見る。",
      },
      {
        title: "この講義の要点",
        lead: "function の this は呼び出し方。アローは外側の this。bind で固定。次は class です。",
        points: [
          "メソッドを引き剥がすと this が消える",
          "コールバックはアローか bind",
        ],
        talk: [
          { speaker: "beginner", text: "通常関数の this は関数の持ち主ではなく、呼び出し時のドットの左を見る、と分かりました。" },
          { speaker: "engineer", text: "はい。ただしアローはそのルールで新しい this を作らず、外側のものを使います。" },
          { speaker: "beginner", text: "メソッドをコールバックへ渡すときは、左側が消えないかを確認します。" },
          { speaker: "engineer", text: "その確認ができれば、次の class でもインスタンスとメソッドの関係を正しく追えます。" },
        ],
        diagram: "this-call",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "order メソッドから this.customer を読み、伝票の顧客名を表示する。",
        projectRole: "build",
        prompt:
          "`order` の customer を伝票へ出すため、`getCustomer` を注文自身のメソッドとして呼び、戻り値を表示してください。",
        lead:
          "入力の `getCustomer` は `this.customer` を返し、`order` には customer `Aya` が保存されています。メソッドを切り離さず注文を呼び出し元にして、`Aya` が表示されれば完了です。",
        kind: "code",
        starter:
          'const order = {\n customer: "Aya",\n getCustomer() {\n return this.customer;\n },\n};\n// メソッドとして呼び出す\n',
        fileName: "script.js",
        steps: [
          "`order` を呼び出し元として保ったまま `getCustomer` を実行する",
          "メソッドの戻り値を表示し、`this` が正しく決まったことを確認する",
        ],
        hint:
          "メソッドを別の変数へ取り外すと、呼び出し元の情報が失われます。ドットの左側を残してください。",
        sample: "Aya",
        answer: `const order = {
  customer: "Aya",
  getCustomer() {
    return this.customer;
  },
};
console.log(order.getCustomer());`,
        explain:
          "order.getCustomer() なので this は order です。定義場所ではなく呼び出し方が決めます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "共通のあいさつ関数 `greet` を、最初は一度だけ Ken のプロフィールで実行し、次は Aya 専用の関数として保存してから実行してください。",
        lead:
          "入力の `greet` は呼び出し元の `name` を返します。`call` では名前が `Ken` のオブジェクトをその場で使い、`bind` では名前が `Aya` のオブジェクトへ固定した関数を作って後から呼びます。`Ken`、`Aya` の順に表示されれば完了です。",
        kind: "code",
        starter:
          "function greet() {\n return this.name;\n}\n// call と bind で this を明示\n",
        fileName: "script.js",
        steps: [
          "`call` で1つ目のオブジェクトを `this` に指定し、実行結果を表示する",
          "`bind` で2つ目のオブジェクトに固定した新しい関数を保存する",
          "保存した関数を実行し、その結果を表示する",
        ],
        hint:
          "`call` の戻り値は実行結果です。一方、`bind` の戻り値はあとで実行できる新しい関数です。",
        sample: "Ken\nAya",
        answer: `function greet() {
  return this.name;
}
console.log(greet.call({ name: "Ken" }));
const g = greet.bind({ name: "Aya" });
console.log(g());`,
        explain:
          "call は今すぐ this を指定して呼びます。bind は固定した関数を後で呼べます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "会員 `user` の遅延通知を表す `wait` で、内側のアロー関数から会員名を表示してください。",
        lead:
          "入力には名前 `Aya` と、`later` を作って呼び出す `wait` メソッドがあります。内側から外側のメソッドと同じ `this` の名前を読み、`Aya` が表示されれば完了です。",
        kind: "code",
        starter:
          'const user = {\n name: "Aya",\n wait() {\n const later = () => {\n // this.name を表示\n };\n later();\n },\n};\nuser.wait();\n',
        fileName: "script.js",
        steps: [
          "内側のアロー関数で、外側から引き継いだ `this` の名前を表示する",
          "用意された呼び出しを使い、期待する名前が表示されることを確認する",
        ],
        hint:
          "通常の関数へ書き換えず、アロー関数が外側の `this` を引き継ぐ性質を利用します。",
        sample: "Aya",
        answer: `const user = {
  name: "Aya",
  wait() {
    const later = () => {
      console.log(this.name);
    };
    later();
  },
};
user.wait();`,
        explain:
          "アローは外側の this をそのまま使うので、wait の this（user）が残ります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "`User` の `handler` をインスタンスから取り外して呼んでも、保存された名前を表示できるようにしてください。",
        lead:
          "クラスの通常メソッドも、単独のコールバックとして渡すと呼び出し元を失います。インスタンスを作った時点の `this` を保つハンドラーにし、取り外した関数から `Aya` が表示されれば完了です。",
        kind: "code",
        starter:
          "class User {\n constructor(name) {\n this.name = name;\n }\n // handler を定義する\n}\nconst user = new User(\"Aya\");\nconst detached = user.handler;\nconsole.log(detached());\n",
        fileName: "script.js",
        steps: [
          "インスタンスの `this` を作成時の外側から引き継ぐハンドラーを定義する",
          "ハンドラーから、そのインスタンスに保存された名前を返す",
          "用意された単独呼び出しでも名前を取得できることを確認する",
        ],
        hint:
          "通常メソッドの短縮構文では、取り外した呼び出しでドットの左側が消えます。独自の `this` を作らない関数をインスタンスのフィールドに持たせます。",
        sample: "Aya",
        answer: `class User {
  constructor(name) {
    this.name = name;
  }
  handler = () => this.name;
}
const user = new User("Aya");
const detached = user.handler;
console.log(detached());`,
        explain:
          "アローフィールドは作成時のインスタンスを閉じ込めるため、取り外しても this を失いません。",
      },
    ],
  },
  {
    id: "js-class",
    track: "js",
    level: "middle",
    chapter: "js-class",
    order: 20,
    title: "class は同じ形の個体を量産する",
    summary: "コンストラクタとインスタンスとプロトタイプ",
    minutes: 14,
    slides: [
      {
        title: "new すると、空の個体に this が入り中身が付く",
        lead: 'class User { constructor(name) { this.name = name; } } に対し new User("Aya") は、新しいオブジェクトを作り、constructor 内の this がその個体を指します。return しなくても、その個体が式の値になります。',
        points: [
          "同じ設計図から、名前の違う個体を何個でも",
          "個体ごとのデータは this.xxx に置く",
          "new を忘れると、class は TypeError になる",
        ],
        talk: [
          { speaker: "beginner", text: "constructor でオブジェクトを return しなくても、何が返るんですか？" },
          { speaker: "engineer", text: "new が作ったインスタンスが結果になります。" },
          { speaker: "beginner", text: "this はクラスそのものを指していると思っていました。" },
          { speaker: "engineer", text: "constructor 内では今作っている個体です。this.xxx は個体ごとのデータとして読みます。" },
        ],
        diagram: "class-instance",
        code: `class User {
  constructor(name) {
    this.name = name;
  }
  hello() {
    return "hi " + this.name;
  }
}
const a = new User("Aya");
a.hello(); // "hi Aya"`,
      },
      {
        title: "メソッドは個体ごとではなく設計図側に1つ",
        lead: "hello は各インスタンスにコピーされるのではなく、プロトタイプに1つあります。a.hello を探すと、個体に無く、User.prototype.hello が見つかります。だから個体はデータ中心で、振る舞いを共有できます。",
        points: [
          "a.hello === b.hello は通常 true（同じ関数）",
          "個体に同名を代入すると、そちらが隠す",
        ],
        talk: [
          { speaker: "beginner", text: "インスタンスを100個作ると、hello 関数も100個コピーされますか？" },
          { speaker: "engineer", text: "通常メソッドはプロトタイプ上の一つを共有します。" },
          { speaker: "beginner", text: "a に hello が見えるなら、a 自身が持っているように見えます。" },
          { speaker: "engineer", text: "自分に無ければプロトタイプを上へ探します。所有場所と参照できることは別です。" },
        ],
        diagram: "class-instance",
        note: "これは「プロトタイプチェーン」の入口です。上級で深く扱います。",
      },
      {
        title: "extends は設計図を伸ばす",
        lead: "class Admin extends User は User の個体＋追加を作れます。constructor では super(...) を先に呼び、親の this 初期化を終わらせます。メソッド上書き後、super.hello() で親版を呼べます。",
        points: [
          "子の constructor で this を触る前に super が必要",
          "instanceof Admin も instanceof User も true になり得る",
        ],
        talk: [
          { speaker: "beginner", text: "子クラスの constructor で、追加分だけ this に入れればよいですか？" },
          { speaker: "engineer", text: "先に super で親の初期化を終える必要があります。" },
          { speaker: "beginner", text: "親と同じメソッド名を書いたら、親の機能は完全に使えなくなりますか？" },
          { speaker: "engineer", text: "子の版が優先されますが、必要なら super から親の版を呼べます。" },
        ],
        diagram: "class-instance",
        code: `class Admin extends User {
  constructor(name, role) {
    super(name);
    this.role = role;
  }
}`,
      },
      {
        title: "static は個体ではなく設計図に付く",
        lead: "static create() は User.create() で呼びます。個体 a.create ではありません。工場メソッドや定数に使います。",
        points: [
          "static の中の this はクラス側",
          "個体データには触れない（触るなら引数で個体を渡す）",
        ],
        talk: [
          { speaker: "beginner", text: "全ユーザー共通の値も、各インスタンスへ持たせるんですか？" },
          { speaker: "engineer", text: "クラス側に属する値や工場処理なら static で表せます。" },
          { speaker: "beginner", text: "インスタンスからも同じ名前で読めそうです。" },
          { speaker: "engineer", text: "static はクラス名から参照します。個体のデータと設計図側の機能を呼び出し元で見分けます。" },
        ],
        diagram: "class-instance",
        code: `class User {
  static kind = "user";
}
User.kind; // "user"`,
      },
      {
        title: "この講義の要点",
        lead: "new が個体。メソッドは prototype で共有。extends は super から。static はクラス呼び。次は非同期です。",
        points: ["データは this、振る舞いの実体は共有", "new を付けて作る"],
        talk: [
          { speaker: "beginner", text: "new で個体を作り、個体ごとの値は this に入り、通常メソッドは共有されるんですね。" },
          { speaker: "engineer", text: "よくまとまっています。static だけは個体ではなくクラス側から使う点を分けてください。" },
          { speaker: "beginner", text: "継承では、子の初期化より先に親を super で整えることも覚えました。" },
          { speaker: "engineer", text: "そこまで押さえれば十分です。次は、すぐには結果が決まらない非同期処理へ進みます。" },
        ],
        diagram: "class-instance",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "Order クラスから customer を持つ注文インスタンスを生成する。",
        projectRole: "build",
        prompt:
          "`Order` クラスから customer が Aya のインスタンスを作り、`receipt` メソッドの結果を表示してください。",
        lead:
          "クラスは同じ構造を持つオブジェクトを作る設計図です。コンストラクタへ customerを渡してインスタンスを作り、そのインスタンスのメソッドを使います。`customer Aya` が表示されれば完了です。",
        kind: "code",
        starter:
          'class Order {\n constructor(customer) {\n this.customer = customer;\n }\n receipt() {\n return "customer " + this.customer;\n }\n}\n// 個体を作って receipt する\n',
        fileName: "script.js",
        steps: [
          "クラスへ名前を渡して新しいインスタンスを作る",
          "そのインスタンスの `receipt` メソッドを呼び、戻り値を表示する",
        ],
        hint:
          "クラスからオブジェクトを作るときは `new` が必要です。コンストラクタ自身にインスタンスを返す処理を足す必要はありません。",
        sample: "hi Aya",
        answer: `class Order {
  constructor(customer) {
    this.customer = customer;
  }
  receipt() {
    return "customer " + this.customer;
  }
}
const a = new Order("Aya");
console.log(a.receipt());`,
        explain:
          "new すると空の個体に this が入り、constructor が customer を付けます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "多数の会員を作っても `hello` が会員ごとに複製されていないことを確かめます。インスタンス `a` と `b` が参照するメソッドを厳密等価比較して表示してください。",
        lead:
          "入力には同じ `User` クラスから作った2つのインスタンスがあります。あいさつ結果ではなく関数そのものの参照を比較し、共有されていることを示す `true` が表示されれば完了です。",
        kind: "code",
        starter:
          'class User {\n hello() {\n return "hi";\n }\n}\nconst a = new User();\nconst b = new User();\n// メソッドが共有されているか表示\n',
        fileName: "script.js",
        steps: [
          "それぞれのインスタンスからメソッドそのものを参照する",
          "2つの参照を厳密等価比較し、その真偽値を表示する",
        ],
        hint:
          "メソッドを呼び出すと戻り値の比較になります。この問題では、実行前の関数オブジェクトどうしを比較します。",
        sample: "true",
        answer: `class User {
  hello() {
    return "hi";
  }
}
const a = new User();
const b = new User();
console.log(a.hello === b.hello);`,
        explain:
          "hello は User.prototype に1つなので、a.hello === b.hello は true です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "`Admin` のコンストラクタを完成させ、名前が Aya、役割が owner のインスタンスを作って、`name` と `role` を順に表示してください。",
        lead:
          "子クラスのコンストラクタでは、まず親クラスの初期化を行ってから、子クラス固有のプロパティを設定します。`Aya` と `owner` が1行ずつ表示されれば完了です。",
        kind: "code",
        starter:
          "class User {\n constructor(name) {\n this.name = name;\n }\n}\nclass Admin extends User {\n constructor(name, role) {\n // 親を先に初期化してから role を付ける\n }\n}\n",
        fileName: "script.js",
        steps: [
          "子クラスのコンストラクタで、受け取った名前を使って親の初期化を行う",
          "親の初期化後に、役割をインスタンスへ保存する",
          "子クラスのインスタンスを作り、2つのプロパティを指定順に表示する",
        ],
        hint:
          "派生クラスでは、`this` を使う前に `super` で親クラスのコンストラクタを呼ぶ必要があります。",
        sample: "Aya\nowner",
        answer: `class User {
  constructor(name) {
    this.name = name;
  }
}
class Admin extends User {
  constructor(name, role) {
    super(name);
    this.role = role;
  }
}
const a = new Admin("Aya", "owner");
console.log(a.name);
console.log(a.role);`,
        explain:
          "super(name) で親の初期化を終わらせてから、子の role を足します。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "全利用者に共通する種類 `kind` を、インスタンスを作らずに読み取って表示してください。",
        lead:
          "個体ごとの名前とは違い、種類のような共通情報は設計図側に置けます。starterのクラスから、新しい個体を作らずに共通の種類を読んでください。",
        kind: "code",
        starter: `class User {
  static kind = "member";
  constructor(name) {
    this.name = name;
  }
}
// 共通の種類を表示
`,
        fileName: "script.js",
        steps: [
          "静的な値がインスタンスとクラスのどちらに属するか整理する",
          "新しい個体を作らずに参照する",
          "読み取った値を表示する",
        ],
        hint:
          "通常のインスタンスプロパティやプロトタイプ上のメソッドとは、所有者が異なります。",
        sample: "member",
        answer: `class User {
  static kind = "member";
  constructor(name) {
    this.name = name;
  }
}
console.log(User.kind);`,
        explain:
          "static は個体ではなく設計図に付きます。工場メソッドや定数に使います。",
      },
    ],
  },
];
