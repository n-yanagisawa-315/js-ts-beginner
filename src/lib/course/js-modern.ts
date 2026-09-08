import type { Lesson } from "@/lib/course/types";

export const jsModern: Lesson[] = [
  {
    id: "js-optional",
    track: "js",
    level: "middle",
    chapter: "js-modern",
    order: 15,
    title: "途中が空でも止まらない",
    summary: "?. でたどり、?? で空のときだけ代わる",
    minutes: 14,
    slides: [
      {
        title: "?. は途中が空ならそこでやめる",
        lead: "user.address.city は、address が無いとエラーです。空の引き出しは開けない、という以前の話です。user.address?.city は、address が null か undefined ならそこでやめ、undefined を返します。深い束を読むいまの書き方です。",
        points: [
          "?. の左が null か undefined のときだけ止まる",
          "0 や \"\" は空ではないので、そのまま進む",
          "関数なら user.fn?.()。無い機械のボタンを押さない",
        ],
        talk: [
          { speaker: "beginner", text: "address が無い利用者だけ、読み取りで落ちるのを防げますか？" },
          { speaker: "engineer", text: "無い可能性がある段の直後に ?. を置けば、そこで undefined にして止められます。" },
          { speaker: "beginner", text: "先頭に一度付ければ、その後の深い階層も全部安全になりますよね？" },
          { speaker: "engineer", text: "守るのは直前の値だけです。コードは各ドットの左が nullish になり得るかを順に見ます。" },
        ],
        diagram: "object",
        code: `const user = { name: "Aya" };
user.address?.city; // undefined。エラーにならない`,
        codeCaption: "無い引き出しは開けない",
        codeExample: `const user = { address: { city: "Tokyo" } };
console.log(user.address?.city); // "Tokyo"`,
        watch: "user?.address.city だと、user だけ守り、address の中は守りません。段ごとに ? が要ります。",
      },
      {
        title: "?? は null と undefined のときだけ代わる",
        lead: "左が null または undefined のときだけ、右を使います。|| は 0 や \"\" や false も「無い」とみなすので、件数 0 をデフォルト 10 に潰してしまいがちです。空かどうかは ??、真偽は ||、と分けます。",
        points: [
          "null ?? \"名無し\" は \"名無し\"",
          "0 ?? 10 は 0。0 || 10 は 10",
          '"" ?? "空" は ""。空文字も「値がある」',
        ],
        talk: [
          { speaker: "beginner", text: "件数が 0 のときだけ初期値にしたくないのですが、|| ではだめですか？" },
          { speaker: "engineer", text: "0 を有効な値として残すなら ?? を使います。" },
          { speaker: "beginner", text: "false や空文字も、そのまま残るんですか？" },
          { speaker: "engineer", text: "残ります。左辺が null か undefined かだけを見る演算子だと覚えると判断できます。" },
        ],
        diagram: "values",
        code: `const n = 0;
n || 10; // 10。0 を無いとみなす
n ?? 10; // 0。0 は残る`,
        codeCaption: "0 を残すなら ??",
        codeExample: `console.log(0 || 10);
console.log(0 ?? 10);`,
      },
      {
        title: "?. と ?? はよく組む",
        lead: "深い欄が無いときの表示名は、user.profile?.name ?? \"名無し\" です。途中で止まって undefined になったあと、?? が代わりの文字を置きます。|| でつなぐと、名前が空文字の人も名無しになってしまいます。",
        points: [
          "たどるのは ?.",
          "空のときの代わりは ??",
          "両方とも、左から右へ読む",
        ],
        talk: [
          { speaker: "beginner", text: "プロフィールが無い場合に表示名を出すには、どちらを先に使うんですか？" },
          { speaker: "engineer", text: "まず ?. で安全に読み、その結果が無ければ ?? で代替します。" },
          { speaker: "beginner", text: "名前が空文字でも代替名にしたい、という意味にはなりませんか？" },
          { speaker: "engineer", text: "なりません。空文字まで置き換える要件なら別の判定です。式を『読む処理、補う処理』の順で追いましょう。" },
        ],
        diagram: "object",
        code: `const user = {};
user.profile?.name ?? "名無し"; // "名無し"`,
        codeCaption: "無い欄のあとに、代わりの文字",
        codeExample: `const user = { profile: { name: "Aya" } };
console.log(user.profile?.name ?? "名無し");`,
      },
      {
        title: "??= は空のときだけ書き込む",
        lead: "a ??= 1 は、a が null か undefined のときだけ 1 を入れます。すでに 0 なら触りません。設定の抜けだけ埋めるときに使います。||= は 0 も埋めてしまうので、件数には向きません。",
        points: [
          " ??= は「まだ無いなら入れる」",
          "すでにある 0 や false は残る",
          "右辺は、実際に入れるときだけ評価される",
        ],
        talk: [
          { speaker: "beginner", text: "設定値が未入力のときだけ、既定値をオブジェクトへ保存できますか？" },
          { speaker: "engineer", text: "??= なら nullish な欄だけを書き換えます。" },
          { speaker: "beginner", text: "0 が入っていたら、未設定として上書きされませんか？" },
          { speaker: "engineer", text: "0 は残ります。さらに右辺も必要な場合だけ動くので、重い初期化を置くときにも意味があります。" },
        ],
        diagram: "rewrite",
        code: `const a = { n: 0 };
a.n ??= 10;
a.n; // 0。0 は空ではない
a.city ??= "Tokyo";
a.city; // "Tokyo"`,
        codeCaption: "空の欄だけ埋める",
        codeExample: `const a = { n: 0 };
a.n ??= 10;
console.log(a.n);`,
      },
      {
        title: "この講義の要点",
        lead: "?. は途中が空なら止まる。?? は null / undefined のときだけ代わる。0 や空文字は値。次は壊さない配列と ES2026 の道具です。",
        points: ["深い束は ?.", "デフォルトは ??", "0 を潰すなら || だと気づく"],
        talk: [
          { speaker: "beginner", text: "?. は安全に途中まで読み、?? は本当に値が無い場合だけ代わりを選ぶ、と分けられました。" },
          { speaker: "engineer", text: "その理解でよいです。ただし ?. は一度書けば全階層を守るわけではありません。" },
          { speaker: "beginner", text: "各段の左側を確認し、0 や空文字まで未設定扱いしないかも考えます。" },
          { speaker: "engineer", text: "その値の扱いを意識したまま、次は元を壊さず操作できる新しいメソッドを見ましょう。" },
        ],
        diagram: "object",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "会員情報 `user` には住所が未登録の場合があります。`address` がなくても停止しないように `city` を読み取り、その結果を表示してください。",
        lead:
          "入力として、名前だけを持つ `user` が用意されています。住所欄の先を安全に参照し、未登録なら例外ではなく `undefined` が表示されれば完了です。",
        kind: "code",
        starter: 'const user = { name: "Aya" };\n// 途中が空でも止まらない読み方\n',
        fileName: "script.js",
        steps: [
          "`address` が存在しない可能性を考慮して、その先の `city` を参照する",
          "読み取り結果を表示し、例外が発生しないことを確認する",
        ],
        hint:
          "存在しない可能性がある中間プロパティの直後で、オプショナルチェーンを使います。",
        sample: "undefined",
        answer: `const user = { name: "Aya" };
console.log(user.address?.city);`,
        explain:
          "?. は途中が空ならそこでやめます。無い欄を無理に開けません。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "在庫数 `n` は現在 0 件で、未登録時の初期表示は 10 件です。論理 OR と Null 合体演算子で初期値を指定した結果を、この順に表示してください。",
        lead:
          "入力には有効な在庫数として `0` が用意されています。2つの演算子で同じ代替値 `10` を指定し、0件を未登録扱いする場合と保持する場合の違いを確認します。`10`、`0` の順に表示されれば完了です。",
        kind: "code",
        starter: "const n = 0;\n// || と ?? を順に表示\n",
        fileName: "script.js",
        steps: [
          "最初に、0を偽とみなす演算子で代替値を指定し、結果を表示する",
          "次に、nullish な値だけを対象にする演算子で同じ代替値を指定し、結果を表示する",
          "2つの結果の違いを確認する",
        ],
        hint:
          "左側はどちらも `n`、代替値も同じです。違うのは、0を代替対象として扱うかどうかです。",
        sample: "10\n0",
        answer: `const n = 0;
console.log(n || 10);
console.log(n ?? 10);`,
        explain: "|| は 0 を潰し、?? は 0 を残します。件数のデフォルトは ?? です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "`profile` が存在しない `user` から名前を安全に読み、値がない場合は「名無し」を表示してください。",
        lead:
          "まずオプショナルチェーンで途中のプロパティを安全にたどり、その結果が `null` または `undefined` の場合だけ代替の表示名を使います。エラーを起こさず「名無し」が表示されれば完了です。",
        kind: "code",
        starter: "const user = {};\n// 無い欄のあとに、代わりの文字\n",
        fileName: "script.js",
        steps: [
          "存在しない可能性がある `profile` を考慮して `name` を読み取る",
          "読み取り結果が nullish の場合にだけ代替名を選ぶ",
          "最終的な表示名を出力する",
        ],
        hint:
          "安全なプロパティ参照と、nullish な場合の代替値指定という2つの役割を組み合わせます。空文字まで置き換える演算子は使いません。",
        sample: "名無し",
        answer: `const user = {};
console.log(user.profile?.name ?? "名無し");`,
        explain: "?. で止まり、?? が代わりの文字を置きます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "検索条件 `a` では件数 `n` の 0 は残し、未設定の地域 `city` だけに既定値 `Tokyo` を保存します。Null 合体代入を使い、`n` と `city` を順に表示してください。",
        lead:
          "入力には `{ n: 0 }` があり、`city` はまだ存在しません。`n` の代替値は `10`、地域の既定値は `Tokyo` とし、0件を上書きせず不足項目だけを追加します。`0`、`Tokyo` の順になれば完了です。",
        kind: "code",
        starter: "const a = { n: 0 };\n// 空のときだけ埋める\n",
        fileName: "script.js",
        steps: [
          "`n` に nullish の場合だけ代替値を代入する処理を行う",
          "`city` に同じ種類の代入で都市名を設定する",
          "2つのプロパティを指定順に表示し、0が保持されたことを確認する",
        ],
        hint:
          "0を未設定として扱わない代入演算子を使います。論理 OR を使う代入では0も置き換わるため、この問題の目的に合いません。",
        sample: "0\nTokyo",
        answer: `const a = { n: 0 };
a.n ??= 10;
a.city ??= "Tokyo";
console.log(a.n);
console.log(a.city);`,
        explain: "0 は残し、無い欄だけ埋めます。??= は空のときだけの代入です。",
      },
    ],
  },
  {
    id: "js-es2026",
    track: "js",
    level: "middle",
    chapter: "js-modern",
    order: 16,
    title: "壊さない配列と ES2026 の道具",
    summary: "at / toSorted / groupBy / Set / Error.isError",
    minutes: 16,
    slides: [
      {
        title: "at(-1) は最後の号車",
        lead: "xs[xs.length - 1] の代わりに xs.at(-1) と書けます。負の号車は末尾から数えます。範囲外は undefined で、エラーにはなりません。先頭はこれまでどおり 0 号車でも、at(0) でも同じです。",
        points: [
          "at(-1) が最後、at(-2) がその前",
          "xs[ -1 ] はキー \"-1\" を探すので別物",
          "無い号車は undefined",
        ],
        talk: [
          { speaker: "beginner", text: "配列の末尾を読むたびに length から1を引くのが面倒です。" },
          { speaker: "engineer", text: "at に負の位置を渡すと、後ろから数えられます。" },
          { speaker: "beginner", text: "角括弧でも負の数を書けば同じですよね？" },
          { speaker: "engineer", text: "角括弧では負数が位置ではなく文字列のキーになります。at の呼び出しかどうかを見分けてください。" },
        ],
        diagram: "array",
        code: `const xs = [80, 90, 70];
xs.at(-1); // 70
xs.at(0); // 80`,
        codeCaption: "負の号車は後ろから",
        codeExample: `const xs = [80, 90, 70];
console.log(xs.at(-1));`,
      },
      {
        title: "toSorted は写真を並べる",
        lead: "sort は今ある配列そのものを変えます。toSorted は新しい配列を返し、元は触りません。数字の昇順は (a, b) => a - b です。いまの JavaScript では、残したい列には toSorted / toReversed / toSpliced / with を使います。",
        points: [
          "toSorted は元を変えない",
          "比較関数の意味は sort と同じ",
          "toReversed も写真。reverse は本体",
        ],
        talk: [
          { speaker: "beginner", text: "画面表示用に並べ替えたいのですが、元データの順番は残せますか？" },
          { speaker: "engineer", text: "toSorted や toReversed なら、新しい配列を受け取れます。" },
          { speaker: "beginner", text: "const の配列なら sort でも元は変わらないのでは？" },
          { speaker: "engineer", text: "const が止めるのは変数の付け替えです。メソッド名の先頭が to かを見て、非破壊の版を選びます。" },
        ],
        diagram: "array",
        code: `const xs = [1, 2, 3];
xs.toSorted((a, b) => b - a); // [3, 2, 1]
xs.toReversed(); // [3, 2, 1]
// xs は [1, 2, 3] のまま`,
        codeCaption: "並べた写真、逆にした写真",
        codeExample: `const xs = [1, 2, 3];
console.log(xs.toReversed());
console.log(xs);`,
        watch: "sort は本体を変えます。const でも中身は並び替わります。",
      },
      {
        title: "Object.groupBy は鍵ごとに箱へ",
        lead: "同じ種類の値を箱に分ける作業です。Object.groupBy(配列, 要素 => 鍵) は、鍵ごとの配列を持つオブジェクトを返します。reduce で手書きしなくてよくなりました。元の要素は同じ束への参照です。",
        points: [
          "コールバックの戻りがキー（文字列になる）",
          "各キーの値は、その組の配列",
          "Map.groupBy はキーにオブジェクトも置ける",
        ],
        talk: [
          { speaker: "beginner", text: "偶数と奇数を分けるなら、filter を2回呼べば十分ですか？" },
          { speaker: "engineer", text: "二組だけなら可能ですが、groupBy は各要素を一度分類して箱を作れます。" },
          { speaker: "beginner", text: "コールバックは、残すかどうかの true を返すんですよね？" },
          { speaker: "engineer", text: "ここでは所属先のキーを返します。結果はキーごとの配列なので、filter との戻り値の違いを見ます。" },
        ],
        diagram: "map",
        code: `const nums = [1, 2, 3, 4];
Object.groupBy(nums, (n) => (n % 2 === 0 ? "even" : "odd"));
// { odd: [1, 3], even: [2, 4] }`,
        codeCaption: "偶数と奇数の箱",
        codeExample: `const nums = [1, 2, 3, 4];
const g = Object.groupBy(nums, (n) =>
  n % 2 === 0 ? "even" : "odd",
);
console.log(g.even);`,
      },
      {
        title: "Set は和・積・差がメソッドになった",
        lead: "ES2025 から、集合の和 union、積 intersection、差 difference が Set のメソッドです。配列に直して表示するときはスプレッドします。重複を除いた集まりを、手でループしなくてよくなりました。",
        points: [
          "a.union(b) はどちらかにあるもの全部",
          "a.intersection(b) は両方にあるもの",
          "a.difference(b) は a だけにあるもの",
        ],
        talk: [
          { speaker: "beginner", text: "重複を除いた2つの一覧を合体するには、またループを書きますか？" },
          { speaker: "engineer", text: "Set にして union を使えば、和集合を直接表せます。" },
          { speaker: "beginner", text: "intersection と difference は、どちらも片方を除く操作に見えます。" },
          { speaker: "engineer", text: "intersection は共通部分、difference は左側だけです。式の左が基準になる操作かを確認します。" },
        ],
        diagram: "array",
        code: `const a = new Set([1, 2]);
const b = new Set([2, 3]);
[...a.union(b)]; // [1, 2, 3]`,
        codeCaption: "和集合を配列にして見る",
        codeExample: `const a = new Set([1, 2]);
const b = new Set([2, 3]);
console.log([...a.union(b)]);`,
      },
      {
        title: "ES2026 の小さい道具",
        lead: "Ecma が 2026 年に入れた道具のうち、初級〜中級で触るものは次です。Error.isError は Error かどうかをブランドで見る（見た目の { message } は false）。Map の getOrInsert は「無ければ入れてから取る」。Math.sumPrecise は大きな数と小数を足してもずれにくい合計です。",
        points: [
          "Error.isError(new Error(\"x\")) は true。ただのオブジェクトは false",
          'map.getOrInsert("n", 0) は、無ければ 0 を入れてその値を返す',
          "非同期の列から配列を作るのは Array.fromAsync。並行の全部待ちは Promise.all",
        ],
        talk: [
          { speaker: "beginner", text: "message があるオブジェクトなら、Error として扱ってよいですか？" },
          { speaker: "engineer", text: "見た目ではなく Error として作られた値かを専用メソッドで調べます。" },
          { speaker: "beginner", text: "Map の初期値は、get して無ければ set する二段階が必要ですか？" },
          { speaker: "engineer", text: "getOrInsert なら登録と取得を一つの意図で書けます。新しいAPIは実行環境の対応状況も確認しましょう。" },
        ],
        diagram: "values",
        code: `Error.isError(new Error("x")); // true
const m = new Map();
m.getOrInsert("n", 0); // 0`,
        codeCaption: "検査・upsert・精密な合計",
        codeExample: `console.log(Error.isError(new Error("x")));
console.log(Error.isError({ message: "x" }));`,
      },
      {
        title: "この講義の要点",
        lead: "最後は at(-1)。並べ替えは toSorted。箱分けは groupBy。集合は Set のメソッド。ES2026 は Error.isError と getOrInsert。次は参照とコピーです。",
        points: [
          "本体を変えないメソッドを先に覚える",
          "古い sort / reverse は破壊的、と区別する",
        ],
        talk: [
          { speaker: "beginner", text: "新しい道具は短く書くためだけでなく、元を残す意図や分類の意図を表せるんですね。" },
          { speaker: "engineer", text: "はい。ただし似た名前でも破壊的な旧メソッドがあるので、戻り値と元の状態を区別します。" },
          { speaker: "beginner", text: "新しいAPIを使うときは、実行環境が対応しているかも確認します。" },
          { speaker: "engineer", text: "よい注意です。次は、作った新しい配列やオブジェクトが本当に独立しているか、参照から考えます。" },
        ],
        diagram: "array",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "直近3回のテスト得点が `xs` に古い順で入っています。`at` を使って最新の得点を取得し、表示してください。",
        lead:
          "入力は `[80, 90, 70]` で、最新値は配列の末尾です。配列の長さを計算せず後ろから位置を指定し、`70` が表示されれば完了です。",
        kind: "code",
        starter: "const xs = [80, 90, 70];\n// 最後の号車\n",
        fileName: "script.js",
        steps: [
          "末尾から1番目を表す負の位置を `at` に指定する",
          "取得した値を表示して確認する",
        ],
        hint:
          "通常の角括弧による参照では負の数を末尾からの位置として扱いません。`at` の負数対応を利用しましょう。",
        sample: "70",
        answer: `const xs = [80, 90, 70];
console.log(xs.at(-1));`,
        explain: "at(-1) が最後の号車です。範囲外は undefined です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "投稿ID `xs` は古い順で保存されています。新しい順の表示用配列を作って表示し、続けて保存順の `xs` も表示してください。",
        lead:
          "入力の `[1, 2, 3]` は保存データなので変更できません。元を保つ逆順操作を使い、表示用が `[3,2,1]`、保存用が `[1,2,3]` になれば完了です。",
        kind: "code",
        starter: "const xs = [1, 2, 3];\n// 元を変えない逆順\n",
        fileName: "script.js",
        steps: [
          "元の配列を変更しない方法で、逆順の新しい配列を作って表示する",
          "その後に元の配列を表示し、順序が保たれていることを確認する",
        ],
        hint:
          "破壊的な `reverse` ではなく、新しい配列を返すメソッドを使います。戻り値と元の配列は別々に確認しましょう。",
        sample: "[3,2,1]\n[1,2,3]",
        answer: `const xs = [1, 2, 3];
console.log(xs.toReversed());
console.log(xs);`,
        explain: "toReversed は新しい配列を返します。元の xs は [1, 2, 3] のままです。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "受付番号 `nums` を、偶数窓口の `even` と奇数窓口の `odd` に振り分けます。`Object.groupBy` で分類し、`even` の番号だけを表示してください。",
        lead:
          "入力は `[1, 2, 3, 4]` で、各番号をどちらか一方のグループ名へ対応させます。分類結果を保存し、偶数窓口の配列として `[2,4]` が表示されれば完了です。",
        kind: "code",
        starter: "const nums = [1, 2, 3, 4];\n// 鍵ごとに箱へ\n",
        fileName: "script.js",
        steps: [
          "各数値が偶数か奇数かを判定し、対応するグループ名を返す",
          "分類結果を変数に保存する",
          "分類結果から偶数グループだけを取り出して表示する",
        ],
        hint:
          "2で割った余りが0なら偶数です。コールバックは真偽値ではなく、所属先のグループ名を返します。",
        sample: "[2,4]",
        answer: `const nums = [1, 2, 3, 4];
const g = Object.groupBy(nums, (n) =>
  n % 2 === 0 ? "even" : "odd",
);
console.log(g.even);`,
        explain: "groupBy の戻りは鍵ごとの配列です。even は [2, 4] です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "午前の参加者ID `a` と午後の参加者ID `b` から、1度でも参加したIDの一覧を作ります。2つの `Set` の和集合を配列へ変換して表示してください。",
        lead:
          "入力は `a` が `[1, 2]`、`b` が `[2, 3]` で、ID 2 は両方に含まれます。重複を残さず全参加者をまとめ、配列 `[1,2,3]` が表示されれば完了です。",
        kind: "code",
        starter:
          "const a = new Set([1, 2]);\nconst b = new Set([2, 3]);\n// 和集合\n",
        fileName: "script.js",
        steps: [
          "`a` を基準に `b` との和集合を作る",
          "得られた集合の全要素を新しい配列へ展開する",
          "配列として表示し、重複がないことを確認する",
        ],
        hint:
          "両方に共通する要素だけではなく、どちらかに含まれる全要素を返す集合メソッドを選びます。",
        sample: "[1,2,3]",
        answer: `const a = new Set([1, 2]);
const b = new Set([2, 3]);
console.log([...a.union(b)]);`,
        explain: "union が和集合です。配列にするのは表示のためです。",
      },
      {
        id: "q5",
        slide: 4,
        prompt:
          "例外として捕まえた値が、見た目だけのオブジェクトではなく本物の `Error` かを判定する `isRealError` 関数を作ってください。",
        lead:
          "外部から来た値は `message` を持つだけでは信頼できません。ES2026 のブランド検査を関数へまとめ、本物と見た目だけの値で `true`、`false` が表示されれば完了です。",
        kind: "code",
        starter:
          'const err = new Error("x");\nconst fake = { message: "x" };\n// isRealError を作り、2つの値で確認する\n',
        fileName: "script.js",
        steps: [
          "受け取った値をvalueとし、ES2026 の専用機能で検査する関数を作る",
          "実際に作られたエラーを渡した結果を表示する",
          "同じプロパティを持つ通常オブジェクトも渡し、判定の違いを確認する",
        ],
        hint:
          "`instanceof` やプロパティの有無ではなく、このスライドで扱った `Error` 自身のブランド検査を使います。",
        sample: "true\nfalse",
        answer: `const err = new Error("x");
const fake = { message: "x" };
function isRealError(value) {
  return Error.isError(value);
}
console.log(isRealError(err));
console.log(isRealError(fake));`,
        explain:
          "Error.isError はプロパティの形ではなく、Error として作られた値かを検査します。",
      },
    ],
  },
];
