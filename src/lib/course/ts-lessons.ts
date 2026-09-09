import type { Lesson } from "@/lib/course/types";

export const tsLessons: Lesson[] = [
  {
    id: "ts-why",
    track: "ts",
    level: "start",
    chapter: "ts-intro",
    order: 1,
    title: "TypeScript は約束を先に書く",
    summary: "実行前に変な値を止める検査",
    minutes: 12,
    slides: [
      {
        title: "実行されるのは JavaScript、検査は書くとき",
        lead: "TypeScript（タイプスクリプト、略して TS）は、今まで書いてきた JavaScript に「この名前には数字だけ入れてよい」といった約束を足せる書き方です。約束は検査用のラベルで、完成したプログラムの動きそのものではありません。ブラウザはラベルを見ません。ビルド（提出用の JS に直す作業）のときにラベルは消えます。残るのは、これまでどおりの JavaScript です。",
        points: [
          "目的は、変な値を実行して落ちる前に、編集中の赤い波線で止めること",
          "画面が速くなるために型がある、のではない。ラベルは消える",
          "この講座の TypeScript の問題は、画面に出さず「検査が通る書き方」がゴールのことが多い",
        ],
        talk: [
          { speaker: "beginner", text: "numberと書けば、実行中も数字かどうか毎回調べてくれるんですか？" },
          { speaker: "engineer", text: "結論から言うと、調べるのは主に編集時やビルド時です。型の札は実行用JavaScriptから消えます。" },
          { speaker: "beginner", text: "では、型を付ければ画面が速くなるという理解も違いますね。" },
          { speaker: "engineer", text: "そのとおりです。価値は変な値を走らせる前に止めることです。本番では検査済みの成果物を動かす、という前提を忘れないでください。" },
        ],
        diagram: "contract",
        code: `let age: number = 20;
age = "二十"; // 型エラー。実行ファイルには到達させない`,
        watch:
          "本番の JS に型の検査は残らないので、「検査を通したファイル」を動かす、が前提です。",
      },
      {
        title: "JS だと、動かして初めて気づくミスがある",
        lead: "JavaScript では、同じ名前に数字を入れたあと、言葉を入れても文法としては通ります。その名前に .toFixed（小数の桁を揃える）を呼ぶと、言葉が入っている瞬間に落ちます。TypeScript は「この名前は数字」と先に約束し、言葉を入れた時点で赤い波線にします。失敗の時点が、実行から編集へ前倒しされます。まだ動かしていなくても止まれる、ということです。",
        points: [
          "他人の関数が何を受け取るかも、約束が書いてあれば読める",
          "名前を変えたとき、直し忘れが赤い波線になる",
        ],
        talk: [
          { speaker: "beginner", text: "JavaScriptでも、間違いはエラーになれば気づけるのでは？" },
          { speaker: "engineer", text: "気づけますが、値がその行へ到達した実行時になることがあります。TypeScriptは代入した段階で知らせられます。" },
          { speaker: "beginner", text: "toFixedを呼ぶ場所ではなく、文字列を入れた場所に赤線が出るイメージですか？" },
          { speaker: "engineer", text: "はい。原因に近い場所で直せます。ただし型が見るのは主に値の形なので、金額が負でないかなどの業務ルールには実行時検証やテストも必要です。" },
        ],
        diagram: "contract",
        note: "テストが不要になるわけではありません。型は「形」の検査で、業務ルールの全ては表現しきれません。",
      },
      {
        title: "きびしい検査が、最初から付いている",
        lead: "TypeScript 7 では、設定を書かなくてもきびしい検査（strict）がオンです。空（null）を数字の引き出しに入れない、種類を書いていない引数を放置しない、などです。きびしい＝面倒、ではなく、実行して落ちる前に気づける、です。緩くすると、any（何でもあり）が広がって、結局 JavaScript と同じになります。",
        points: [
          "空を数字に混ぜない（あとで落ちるパターンを先に止める）",
          "引数の種類を書かないままだと怒る。入り口は約束する",
          "設定ファイルの話は次の講義で、もっとやさしく扱います",
        ],
        talk: [
          { speaker: "beginner", text: "strictは、細かな書き方まで全部禁止する機能ですか？" },
          { speaker: "engineer", text: "短く言えば、危ない曖昧さを早めに指摘する検査のまとまりです。空の値や型不明の引数などが対象です。" },
          { speaker: "beginner", text: "面倒な箇所だけanyにすれば、strictのままでも問題ないですよね？" },
          { speaker: "engineer", text: "通りはしますが、そこから検査が効かなくなります。実行時に安全になる設定ではないので、入り口の型を決め、未知なら後で学ぶunknownから確認する方が理由の見えるコードになります。" },
        ],
        diagram: "contract",
        code: `{
  "compilerOptions": { "strict": true }
}`,
      },
      {
        title: "型はドキュメントであり、契約である",
        lead: "コメントに「数字を渡してね」と書いても、古くなって誰も直しません。型は検査係が古くなったら怒ります。人に見せる関数ほど、入り口と出口の種類を書いておく価値があります。中のわかりきった let n = 1 は、書かなくても数字だと察してくれます。",
        points: [
          "内部の自明な let n = 1 は推論に任せてよい",
          "モジュールの export は明示すると読みやすい",
        ],
        talk: [
          { speaker: "beginner", text: "契約なら、すべての変数に型を手書きした方が親切ですか？" },
          { speaker: "engineer", text: "自明な初期値は推論に任せて構いません。外から使われる関数の入口と出口ほど、明示する価値があります。" },
          { speaker: "beginner", text: "コメントに『数字を渡す』と書くのでは足りませんか？" },
          { speaker: "engineer", text: "コメントは実装とずれても検査されません。型なら変更時に食い違いを知らせます。ただし実行時には消えるので、外部入力の確認まで代行するものではありません。" },
        ],
        diagram: "annotate",
      },
      {
        title: "この講義の要点",
        lead: "TS は JS に検査用のラベルを足したもの。ラベルは消える。きびしい検査が最初から付く。次は、いまの TypeScript 7 で「何が検査係か」をゆっくり見ます。",
        points: ["エラーは実行前", "any を広げない"],
        talk: [
          { speaker: "beginner", text: "TypeScriptは、JavaScriptへ型の約束を足して、変な値を動かす前に見つけるものなんですね。" },
          { speaker: "engineer", text: "その理解で合っています。ただし型は実行中の安全装置ではなく、検査後には消えます。" },
          { speaker: "beginner", text: "分からない所を全部anyにすると、その事前検査まで弱くしてしまうと分かりました。" },
          { speaker: "engineer", text: "はい。次は検査係の役割をもう少し具体的に見て、検査と実行をはっきり分けましょう。" },
        ],
        diagram: "contract",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "注文フォームの数量を数値型にしたとき、その型注釈が使われる時点を選んでください。",
        lead:
          "文字列を数量へ誤代入する事故を、注文処理が動く前に見つけたい場面です。TypeScript のコードが JavaScript として実行されるまでの流れから判断してください。",
        kind: "choice",
        options: [
          "実行前の型検査",
          "ブラウザでの実行中だけ",
          "画面へ表示したあと",
          "通信が終わったあと",
        ],
        steps: [
          "型のラベルがいつ参照されるか考える",
          "JavaScript の実行時に型が残るかを思い出す",
          "最も合う時点を1つ選ぶ",
        ],
        hint: "提出用の JavaScript へ直すと、型のラベルは消えます。",
        answer: "実行前の型検査",
        explain:
          "型は実行時の JS からは消えます。検査は書くときとビルドのときです。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "会計処理の価格を数値型にする主な利点を選んでください。",
        lead:
          "価格へ誤って文字列を代入すると、合計を計算するまで問題が見えないことがあります。TypeScript がこの事故の発見をどこへ前倒しするか考えてください。",
        kind: "choice",
        options: [
          "間違った代入の場所で実行前に気づける",
          "実行時に文字列を自動で数値へ変換する",
          "すべての業務ルールを保証できる",
          "ブラウザの処理速度が必ず上がる",
        ],
        steps: [
          "型が値を変換する機能かを確認する",
          "原因に近い場所で分かる利点を考える",
          "型検査で得られる利点を1つ選ぶ",
        ],
        hint:
          "型は実行時の変換や速度向上ではなく、約束の食い違いを早く知らせます。",
        answer: "間違った代入の場所で実行前に気づける",
        explain: "number と約束すると、文字列の代入は実行前に赤線になります。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "会員APIのデータを扱うプロジェクトで strict を無効にしたときの問題を選んでください。",
        lead:
          "会員情報には未入力の項目があり、null や undefined を考慮せず表示すると事故になります。検査を緩めたとき、実行前に得られていた何を失うか判断してください。",
        kind: "choice",
        options: [
          "危険な曖昧さを見逃しやすくなる",
          "JavaScript が実行不能になる",
          "すべての変数が自動で読み取り専用になる",
          "文字列型の値を一切使えなくなる",
        ],
        steps: [
          "strict がまとめて有効にする検査を思い出す",
          "any や未確認の空の値が増えた場合を考える",
          "検査を弱める影響を1つ選ぶ",
        ],
        hint:
          "strict はコードを実行する機能ではなく、実行前に危険な曖昧さを見つける検査です。",
        answer: "危険な曖昧さを見逃しやすくなる",
        explain: "TypeScript 7 では strict が初期値です。true は null や暗黙 any をまとめて厳しくします。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "単価と個数から order.total を返す関数へ入出力型を付ける。",
        projectRole: "build",
        prompt: "単価priceと個数countを数値で受け取り、order.totalを数値で返すcalculateTotal関数を作ってください。",
        lead:
          "外から使われる関数では、入口と出口の型が利用者への契約になります。単価と個数を掛ける処理にその契約を書き、型検査に合格させてください。表示は不要です。",
        kind: "code",
        starter: "// calculateTotal をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "price という引数を1つ受け取る関数を定義する",
          "入口と出口がどちらも数値であることを明示する",
          "受け取った単価と個数を掛けて返す",
        ],
        hint:
          "引数名の後ろが入口、丸括弧の後ろが出口の型です。",
        sample: "",
        answer: `function calculateTotal(price: number, count: number): number {
  return price * count;
}`,
        explain: "公開関数ほど、入り口と出口の型が契約になります。",
      },
    ],
  },
  {
    id: "ts-annotate",
    track: "ts",
    level: "start",
    chapter: "ts-intro",
    order: 3,
    title: "基本の型注釈",
    summary: "number / string / boolean と推論",
    minutes: 12,
    slides: [
      {
        title: "名前のうしろに : 種類",
        lead: "TypeScript では、名前の直後にコロンと種類を書けます。let title: string = \"講座\" は「title という名前には、言葉だけ入れてよい。中身は講座」です。これは実行時に言葉へ変換する操作ではありません。検査用のラベルです。値の書き方は、今までどおりの JavaScript です。",
        points: [
          "コロンの左が名前、右が種類（string は言葉、number は数字）",
          "イコールの右が実際の値。種類と食い違うと赤い波線",
          "ラベルは消えるので、動きが遅くなることは基本的に無い",
        ],
        talk: [
          { speaker: "beginner", text: "コロンの右は、値をその種類へ変える指定でしょうか？" },
          { speaker: "engineer", text: "いいえ。名前に付ける検査用の約束です。実際の値はイコールの右へJavaScriptと同じ書き方で置きます。" },
          { speaker: "beginner", text: "関数では、引数の横と丸括弧の後ろに型があって混乱します。" },
          { speaker: "engineer", text: "引数側は入口、丸括弧の後ろは出口の約束です。どちらも検査時に使われ、実行用コードでは型注釈そのものは残りません。" },
        ],
        diagram: "annotate",
        code: `let title: string = "講座";
let ok: boolean = true;
function size(s: string): number {
  return s.length;
}`,
      },
      {
        title: "推論でも型は付く",
        lead: "let n = 1 と書くと、右が数字なので n は number と察してくれます。このように、明示していない型をコードから決めることを型推論と呼びます。注釈が無くても、あとから言葉を入れるとエラーです。",
        points: [
          "型推論: 初期値などからTypeScriptが型を決める",
          "初期値が数字なら、注釈なしでもnumberとして検査される",
          "右辺から明らかな型を毎回書き直す必要はない",
        ],
        talk: [
          { speaker: "beginner", text: "型を書かなかった変数は、何でも入るanyになりますか？" },
          { speaker: "engineer", text: "初期値があれば、そこから型を推論できることが多いです。数字で始めたletへ文字列を入れると検査で止まります。" },
          { speaker: "beginner", text: "では、let n: number = 1と毎回書かなくても検査は働くのですね？" },
          { speaker: "engineer", text: "はい。右辺から明らかな場所は推論へ任せられます。letとconstで推論の細かさが変わる話は、次の一枚で分けて扱います。" },
        ],
        diagram: "annotate",
        code: `let n = 1;
n = "one"; // エラー。推論で number になっている`,
      },
      {
        title: "let は種類まで、const は一つの値まで覚えることがある",
        lead: 'let status = "ok" はあとで別の文字列へ再代入できるため、型は広いstringになります。const status = "ok" は再代入できないため、TypeScriptは文字列全体ではなく、値"ok"だけを表す型として覚えられます。この一つの値だけを表す型をリテラル型と呼びます。',
        points: [
          "letは再代入を見込み、stringやnumberのような広い型になりやすい",
          "constの数値・文字列は、特定の値だけを表す型になりやすい",
          "これは検査上の違いで、実行時の値を変える機能ではない",
        ],
        talk: [
          { speaker: "beginner", text: "constの型も、文字列なら全部stringではないのですか？" },
          { speaker: "engineer", text: "再代入できない単純な値では、特定の\"ok\"だけを表すリテラル型として覚えられます。" },
          { speaker: "beginner", text: "constなら、オブジェクトの中の文字列も必ずリテラル型ですか？" },
          { speaker: "engineer", text: "通常のオブジェクトはプロパティを更新できるため、中の値はstringへ広がります。オブジェクト全体を細かく保つas constは後で扱います。" },
        ],
        diagram: "annotate",
        code: `let mutableStatus = "ok"; // string
const fixedStatus = "ok"; // "ok"
const item = { status: "ok" }; // item.status は string`,
        watch: "変数自体がconstでも、オブジェクトのプロパティは通常変更できるため、プロパティ値まで必ずリテラル型になるわけではありません。",
      },
      {
        title: "any は検査を外す非常口",
        lead: "any はその値へのほぼ全ての操作を許します。型の恩恵が消えるので、移行中の一時しのぎ以外は使いません。代わりに unknown を次の講義で学びます。",
        points: [
          "as any の連発は、TS を書いていないのと同じ",
          "ライブラリの型が無いときは、まず型定義を探す（DefinitelyTyped）",
        ],
        talk: [
          { speaker: "beginner", text: "エラーの意味が分からないとき、ひとまずanyにすると先へ進めますよね？" },
          { speaker: "engineer", text: "進めますが、その値への検査をほぼ外します。非常口として範囲と期間を限定するものです。" },
          { speaker: "beginner", text: "実行時にanyが危険な値へ変わる、という意味ですか？" },
          { speaker: "engineer", text: "値が変わるのではなく、検査係が危険な操作を止めなくなります。ライブラリなら型定義を探し、外から来た未知の値ならunknownで受ける方が安全です。" },
        ],
        diagram: "annotate",
        code: `let x: any = 1;
x = "ok";
x.foo.bar; // 検査されない`,
      },
      {
        title: "配列は T[] または Array<T>",
        lead: "number[] は数値だけ。混在させたいなら (number | string)[]。空配列 [] は文脈が無いと never[] やエラーになることがあります。注釈を付けるか、as const や満たす値を先に置きます。",
        points: [
          "タプルは [string, number] のように長さと位置の型が固定",
          "通常の配列は長さが可変で、要素型は均一",
        ],
        talk: [
          { speaker: "beginner", text: "配列の角括弧は、値の書き方と型の書き方でどう見分けますか？" },
          { speaker: "engineer", text: "型側のT[]は要素の種類、値側の角括弧は実際の要素です。置かれている位置で役割を読み分けます。" },
          { speaker: "beginner", text: "文字列と数値を混ぜたいなら、配列を2種類のどちらかにすればよいですか？" },
          { speaker: "engineer", text: "各要素をどちらかにする型と、配列全体をどちらか一種類にする型は別です。また空配列は材料がなく推論しにくいので、文脈や注釈を与える点にも注意しましょう。" },
        ],
        diagram: "annotate",
        code: `const xs: number[] = [1, 2];
const pair: [string, number] = ["age", 20];`,
      },
      {
        title: "この講義の要点",
        lead: ": 型 で約束。推論でも固定。any は非常口。配列は T[]。次はオブジェクトの形です。",
        points: ["境界に注釈", "中は推論でよいことが多い"],
        talk: [
          { speaker: "beginner", text: "型注釈は必要な入口に書き、初期値から明らかな所は推論へ任せても型なしにはならないんですね。" },
          { speaker: "engineer", text: "そのとおりです。推論された型も検査に使われますが、注釈も推論結果も実行用コードには残りません。" },
          { speaker: "beginner", text: "anyで逃げず、配列なら要素の種類まで考えるのが大事だと整理できました。" },
          { speaker: "engineer", text: "よい振り返りです。次は要素ではなくオブジェクトのキーと値を、形として約束する方法へ進みます。" },
        ],
        diagram: "annotate",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "customer を string 型で宣言し、注文入力の基本フィールドを固定する。",
        projectRole: "build",
        prompt: "文字列専用の customer を「Mika」で初期化してください。",
        lead:
          "注文の customerへ数値などが混ざらないよう、変更可能な変数に文字列の契約を付けます。表示は不要で、型検査に合格すれば完成です。",
        kind: "code",
        starter: "// customer をここで宣言する\n",
        fileName: "script.ts",
        steps: [
          "変更可能な変数 customer を定義する",
          "文字列用の型を明示し、指定された文字列で初期化する",
          "値が引用符で囲まれているか確認する",
        ],
        hint: "型名と実際の文字列は書き分けます。型名には引用符を付けず、文字列の値には引用符が必要です。",
        sample: "",
        answer: 'let customer: string = "Mika"',
        explain:
          "名前の直後にコロンと型を書きます。実行時の変換ではありません。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "型推論を保ったまま、starter の型エラーを直してください。",
        lead:
          "初期値が数値なら、注釈がなくても変数は数値として検査されます。数値で始めた score に不適切な値を入れている行を取り除き、型検査に合格させてください。表示は不要です。",
        kind: "code",
        starter: 'let score = 10;\nscore = "ten";\n',
        fileName: "script.ts",
        steps: [
          "初期値から score に推論される型を考える",
          "その型と食い違う代入を取り除く",
          "型注釈を追加せずに型検査を通す",
        ],
        hint:
          "変数を作る行だけで数値型は推論されます。エラーの原因となる後続行を残す必要はありません。",
        sample: "",
        answer: "let score = 10",
        explain:
          "注釈がなくても score は number と推論され、文字列の代入は拒否されます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "次のうち、特定の文字列\"ready\"だけを表す型として推論される変数を選んでください。",
        lead: "再代入できるletと、再代入できない単純なconstでは、TypeScriptが覚える型の細かさが異なることがあります。",
        kind: "choice",
        options: [
          "constで宣言したstatus",
          "letで宣言したstatus",
          "constオブジェクトのstatus欄",
          "letオブジェクトのstatus欄",
        ],
        steps: [
          "変数そのものを再代入できるか確認する",
          "オブジェクトのプロパティではなく単純な値を選ぶ",
        ],
        hint: "再代入できない単純な文字列では、その一つの値まで型として覚えられます。",
        answer: "constで宣言したstatus",
        explain: "単純なconstの文字列は\"ready\"というリテラル型になります。通常のオブジェクトのプロパティはstringへ広がります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "APIレスポンスを any で受け取ったとき、失われるものを選んでください。",
        lead:
          "存在しない項目名や使えないメソッドを書いても、any では問題を事前に見つけにくくなります。値そのものではなく、TypeScript のどの助けが外れるか判断してください。",
        kind: "choice",
        options: [
          "危険な操作を止める型検査",
          "コードを実行するための機能",
          "変数へ安全な値を代入する機能",
          "文字列を画面へ表示する機能",
        ],
        steps: [
          "any が実行時の値を変えるか考える",
          "TypeScript が通常提供する助けを思い出す",
          "any によって弱くなるものを1つ選ぶ",
        ],
        hint: "any は「何でもあり」にして、赤い波線を出す判断材料を失わせます。",
        answer: "危険な操作を止める型検査",
        explain: "any は検査を外す非常口です。普段は具体的な型を書きます。",
      },
      {
        id: "q5",
        slide: 4,
        prompt: "点数80と90を持つ数値配列 scores を定義してください。",
        lead:
          "各要素が数値であることを配列の契約として明示します。配列の表示は不要で、指定された2つの点数を持つ状態で型検査を通してください。",
        kind: "code",
        starter: "// scores をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "変更できない変数 scores を定義する",
          "要素が数値である配列型を指定する",
          "初期値に80と90を順番に入れる",
        ],
        hint: "配列全体ではなく、配列の各要素が数値であることを型で表します。",
        sample: "",
        answer: "const scores: number[] = [80, 90]",
        explain: "T[] は要素が全部 T の配列です。",
      },
    ],
  },
  {
    id: "ts-object",
    track: "ts",
    level: "basic",
    chapter: "ts-shape",
    order: 4,
    title: "オブジェクトの形を型にする",
    summary: "キーと型の一覧が契約になる",
    minutes: 13,
    slides: [
      {
        title: "形そのものが型",
        lead: "{ name: string; age: number } は、そのキーをその型で持つオブジェクトだけを許します。足りないキーはエラー、余分なキーも、オブジェクトリテラルを直に渡すと過剰プロパティ検査でエラーになりやすいです。",
        points: [
          "変数に一度入れてから渡すと、過剰プロパティ検査が緩むことがある",
          "必須キーが無いのは常にエラー",
        ],
        talk: [
          { speaker: "beginner", text: "nameとageの型なら、その2つ以外のキーは絶対に持てないんですか？" },
          { speaker: "engineer", text: "必須なのはその形を満たすことです。直書きのオブジェクトには余分なキーを強く調べますが、変数経由では通る場合があります。" },
          { speaker: "beginner", text: "では型が実行中に余分なキーを削ってくれるわけではないんですね。" },
          { speaker: "engineer", text: "削りません。検査時の代入可能性の話です。必要なキーの欠落は止められますが、実行時のオブジェクトの中身はそのままです。" },
        ],
        diagram: "shape",
        code: `const user: { name: string; age: number } = {
  name: "Aya",
  age: 20,
};`,
      },
      {
        title: "type と interface で名前を付ける",
        lead: "同じ形を何度も書くなら別名にします。type User = { ... } は合併やユニオンと相性が良い。interface は宣言マージができます。オブジェクトの形にはどちらも使えます。プロジェクトで一方に寄せます。",
        points: [
          "ユニオンやプリミティブの別名は type だけ",
          "公開 API のオブジェクトは interface という慣習もある",
        ],
        talk: [
          { speaker: "beginner", text: "typeとinterfaceは、どちらが正解なんですか？" },
          { speaker: "engineer", text: "オブジェクトの形なら、多くの場合どちらでも表せます。チームの方針と必要な機能で選びます。" },
          { speaker: "beginner", text: "名前を付けると、実行時にもUserというものが作られますか？" },
          { speaker: "engineer", text: "型の別名やinterfaceは検査用なので消えます。ユニオンなどにも名前を付けたいならtype、宣言の結合が必要ならinterface、という違いはあります。" },
        ],
        diagram: "shape",
        code: `type User = { name: string; age: number };
interface UserI { name: string; age: number }`,
      },
      {
        title: "? はあってもなくてもよいキー",
        lead: "age?: number は、キーが無い、または number、または（strict だと）undefined になり得ます。使う前に存在確認が必要です。? と | undefined は似ていますが、キー自体が無いかどうかが違います。",
        points: [
          "あるなら number。無いなら読むと undefined",
          "厳密に「キーは必ずあるが値は undefined も」なら age: number | undefined",
        ],
        talk: [
          { speaker: "beginner", text: "ageに疑問符を付けたら、ageへ何を入れてもよくなりますか？" },
          { speaker: "engineer", text: "いいえ。キーを省略できるだけで、存在するなら指定した型でなければなりません。" },
          { speaker: "beginner", text: "省略したキーを読むと、自動で0になるのでしょうか？" },
          { speaker: "engineer", text: "実行時にはundefinedです。使う前に存在確認が必要です。キー自体を省略できる形と、キーは必須で値にundefinedを許す形も区別してください。" },
        ],
        diagram: "shape",
        code: `type User = { name: string; age?: number };`,
      },
      {
        title: "readonly は再代入を型で止める",
        lead: "readonly name: string は user.name = をエラーにします。実行時に凍るわけではありません。配列は readonly number[]。意図の文書化と、誤更新の防止です。",
        points: [
          "ネストは一段だけ。中のオブジェクトまで凍らせるなら再帰的な型や as const",
        ],
        talk: [
          { speaker: "beginner", text: "readonlyなら、実行中にプロパティを書き換えようとしても例外になりますか？" },
          { speaker: "engineer", text: "readonlyが止めるのは型検査上の再代入です。実行時にObject.freezeのような処理は追加されません。" },
          { speaker: "beginner", text: "中に別のオブジェクトがあれば、その中も全部守られますか？" },
          { speaker: "engineer", text: "通常は指定した段だけです。深い変更まで防ぎたいなら別の設計が必要です。意図を文書化し、うっかり更新を編集時に止める機能だと考えましょう。" },
        ],
        diagram: "shape",
        code: `type User = { readonly id: string; name: string };`,
      },
      {
        title: "この講義の要点",
        lead: "オブジェクト型はキーの設計図。type/interface で名前。? は任意。readonly は誤更新防止。次は satisfies です。",
        points: ["欠けはエラー", "任意は使う前に絞る"],
        talk: [
          { speaker: "beginner", text: "オブジェクト型は必要なキーの設計図で、疑問符は省略可、readonlyは再代入を止める印ですね。" },
          { speaker: "engineer", text: "はい。ただしreadonlyが実行時に凍結し、任意キーへ既定値を入れてくれるわけではありません。" },
          { speaker: "beginner", text: "型検査で欠けや誤更新を見つけても、実行中のundefinedには自分で備える必要があります。" },
          { speaker: "engineer", text: "その区別ができています。次は値の細かな型を残しながら、形への適合だけを調べるsatisfiesへつなげます。" },
        ],
        diagram: "shape",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "商品名と価格を持つ product オブジェクトを作ってください。",
        lead:
          "オブジェクト型は、必要な項目と各値の種類をまとめた契約です。商品名は「Pen」、価格は120とし、画面へ表示せず型検査に合格させてください。",
        kind: "code",
        starter: "// product をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "再代入しない product を定義する",
          "name は文字列、price は数値という形を明示する",
          "指定された2つの値を持つオブジェクトで型検査を通す",
        ],
        hint:
          "変数名の後ろには項目ごとの型、代入記号の右には実際のオブジェクトを置きます。",
        sample: "",
        answer:
          'const product: { name: string; price: number } = { name: "Pen", price: 120 }',
        explain: "足りないキーはエラーです。形が契約になります。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "Order 型に orderId、customer、item、total、status の形を定義する。",
        projectRole: "build",
        prompt: "orderId、customer、item、total、statusを持つ Order 型を定義してください。",
        lead:
          "同じ形の注文を何度も扱えるよう、オブジェクトの設計図に名前を付けます。値は作らず、型検査に使う型の別名だけを定義してください。",
        kind: "code",
        starter: "// Order の形を定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Order という型名を作る",
          "orderId・customer・itemを文字列、totalを数値、statusをpaidまたはunpaidの必須項目にする",
          "値のオブジェクトを作っていないことを確認する",
        ],
        hint:
          "型名へ、注文に必要な5項目とそれぞれの値の種類を持つ形を割り当てます。",
        sample: "",
        answer:
          'type Order = { orderId: string; customer: string; item: string; total: number; status: "paid" | "unpaid" }',
        explain: "同じ形を何度も書くなら type で別名にします。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "theme は必須、fontSize は省略可能な Settings 型を定義してください。",
        lead:
          "設定には必ず必要な項目と、利用者が指定しなくてもよい項目があります。省略可能にするのは fontSize だけです。",
        kind: "code",
        starter: "// Settings の形を定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Settings 型を定義する",
          "theme を必須の文字列項目にする",
          "fontSize だけを省略可能な数値項目にする",
        ],
        hint:
          "省略を許す印は型名全体ではなく、対象の項目名にだけ付けます。",
        sample: "",
        answer: "type Settings = { theme: string; fontSize?: number }",
        explain: "? はキーが無くてもよく、あるならその型です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "変更できない id と、変更できる email を持つ Account 型を定義してください。",
        lead:
          "発行後に変えてはいけない識別子だけを型検査で保護します。email は更新できるままにし、実行時の凍結ではなく型の契約として表してください。",
        kind: "code",
        starter: "// Account の形を定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Account 型を定義する",
          "id を読み取り専用の文字列プロパティにする",
          "email は読み取り専用にせず、文字列プロパティにする",
        ],
        hint:
          "再代入を止める指定は、保護したい項目の型定義にだけ付けます。",
        sample: "",
        answer: "type Account = { readonly id: string; email: string }",
        explain:
          "readonly は再代入を型で止めます。実行時に凍るわけではありません。",
      },
    ],
  },
  {
    id: "ts-union",
    track: "ts",
    level: "basic",
    chapter: "ts-shape",
    order: 6,
    title: "ユニオンとリテラル",
    summary: "これかあれ、を | で表す",
    minutes: 13,
    slides: [
      {
        title: "A | B はどちらか一方",
        lead: "string | number の値には、両方に共通する操作だけが直にできます。string 専用の .toUpperCase は、絞るまで呼べません。絞りは次の narrowing 講義の主題です。",
        points: [
          "共通操作: 例えば String(id) はどちらでも可",
          "専用操作は if や typeof のあと",
        ],
        talk: [
          { speaker: "beginner", text: "文字列または数値なら、両方のメソッドを自由に呼べますか？" },
          { speaker: "engineer", text: "値がどちらか未確定の間は、両方で安全な操作だけです。専用操作の前に種類を絞ります。" },
          { speaker: "beginner", text: "縦棒を付けると、実行時の値が文字列と数値を同時に持つんですか？" },
          { speaker: "engineer", text: "同時ではなく候補のどちらかです。型検査では候補を追いますが、実行時に存在する値は一つなので、typeofなど実際の判定と結び付けます。" },
        ],
        diagram: "union",
        code: `type Id = string | number;
function show(id: Id) {
  console.log(id);
}`,
      },
      {
        title: "リテラルユニオンは決まった文字列だけ",
        lead: 'type Status = "ok" | "ng" は、その2つ以外の文字列を拒否します。状態機械、タブ、API のディスクリミネータに向きます。enum よりシンプルで、JS に消えたあとも文字列のままです。',
        points: ["typo が型エラーになる", "switch の網羅チェックと相性が良い"],
        talk: [
          { speaker: "beginner", text: "Statusをstringにするだけではだめですか？" },
          { speaker: "engineer", text: "任意の文字列を許すと、打ち間違いや想定外の状態も通ります。候補が決まっているならリテラルユニオンが向いています。" },
          { speaker: "beginner", text: "型に書いた候補は、実行時にenumのような一覧として残りますか？" },
          { speaker: "engineer", text: "型そのものは残りません。実行時には普通の文字列です。だから検査時の網羅性は得られても、外部入力が候補内かは別途確かめる必要があります。" },
        ],
        diagram: "union",
        code: `type Status = "ok" | "ng";
const s: Status = "ok";`,
      },
      {
        title: "交差型 & は両方を満たす",
        lead: "A & B は A でもあり B でもある値です。オブジェクトならキーがマージされます。同じキーで型が衝突すると never になり得ます。ユニオンの反対方向です。",
        points: [
          "HasName & HasAge は両方のキーが必要",
          "ユニオンと交差を混ぜると読みにくい。名前を付ける",
        ],
        talk: [
          { speaker: "beginner", text: "アンパサンドは、AかBの好きな方を選べる記号ですか？" },
          { speaker: "engineer", text: "それは縦棒です。交差型はAの条件もBの条件も満たす値を求めます。" },
          { speaker: "beginner", text: "同じキーが両側で別の型なら、実行時にどちらかへ変換されますか？" },
          { speaker: "engineer", text: "変換はされず、両方を同時に満たせない型としてneverになることがあります。複雑に組むほど意図が読みにくいので、意味のある別名を付けましょう。" },
        ],
        diagram: "union",
        code: `type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;`,
      },
      {
        title: "配列の要素がユニオンのとき",
        lead: "(string | number)[] は各要素がどちらか。string[] | number[] は「全部文字の配列」か「全部数の配列」。括弧の位置で意味がまったく違います。",
        points: ["混在配列は前者", "どちらかの均質配列は後者"],
        talk: [
          { speaker: "beginner", text: "候補に括弧を付けるだけで、配列の意味まで変わるんですか？" },
          { speaker: "engineer", text: "はい。括弧つきなら各要素が候補のどちらか、括弧なしで配列型を並べると配列全体がどちらかです。" },
          { speaker: "beginner", text: "どちらも実行時には普通の配列に見えますよね。" },
          { speaker: "engineer", text: "そのとおりです。違いは検査時の許可範囲で、型は実行時に配列を分けません。混在を許したいのか、均一な二候補なのかを先に決めてください。" },
        ],
        diagram: "union",
        code: `const mixed: (string | number)[] = [1, "a"];
const either: string[] | number[] = ["a"];`,
      },
      {
        title: "この講義の要点",
        lead: "| は候補、リテラルは状態、& は同時、括弧で配列の意味が変わる。次は関数の型です。",
        points: ["専用操作の前に絞る", "状態は文字列リテラルが扱いやすい"],
        talk: [
          { speaker: "beginner", text: "縦棒は候補のどれか、アンパサンドは条件を両方満たす、と区別できました。" },
          { speaker: "engineer", text: "よいですね。型が候補を示しても、実行時の値が自動で判別されるわけではないので、専用操作の前には確認が要ります。" },
          { speaker: "beginner", text: "決まった状態にはリテラルを使い、配列では括弧の範囲にも注意します。" },
          { speaker: "engineer", text: "その考えを次は関数へ広げて、入力候補と戻り値の約束をどう結ぶか見ていきましょう。" },
        ],
        diagram: "union",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "APIごとに形式が異なる orderId を string | number で表す。",
        projectRole: "build",
        prompt: "文字列または数値で受け取る OrderId 型を定義してください。",
        lead:
          "orderIdはシステムによって文字列または数値で届きます。両方を候補にし、それ以外は許さない型を作ってください。",
        kind: "code",
        starter: "// OrderId をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って OrderId という型名を作る",
          "文字列型と数値型を「どちらか」の関係で結ぶ",
          "2種類以外の値を含めていないか確認する",
        ],
        hint: "候補を表すときは、両方を同時に要求する交差型ではなく、「どちらか」を表す記号を使います。",
        sample: "",
        answer: "type OrderId = string | number",
        explain: "ユニオンでは、両方に共通する操作だけが直にできます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "「red」「yellow」「green」だけを許す Signal 型を定義してください。",
        lead:
          "信号の状態を任意の文字列にすると、打ち間違いも通ってしまいます。決められた3つの値だけを受け入れる型にしてください。",
        kind: "code",
        starter: "// Signal をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Signal という型名を作る",
          "3つの文字列リテラルを候補として並べる",
          "大文字小文字と引用符を確認する",
        ],
        hint: "一般的な文字列型ではなく、許可する文字列そのものを型の候補として指定します。",
        sample: "",
        answer: 'type Signal = "red" | "yellow" | "green"',
        explain: "決まった文字列だけを許すので、typo が型エラーになります。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "email と phone の両方を必須にする Contact 型を定義してください。",
        lead:
          "連絡先にはメールの形と電話番号の形をどちらも満たしてほしい場面です。2つのオブジェクト型を同時に要求してください。",
        kind: "code",
        starter: "// Contact をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Contact という型名を作る",
          "email を持つ形と phone を持つ形を別々に考える",
          "2つの形を、両方を満たす関係で結ぶ",
        ],
        hint: "この問題では「どちらか」ではなく「両方」が必要です。2つのオブジェクト型を交差させます。",
        sample: "",
        answer: "type Contact = { email: string } & { phone: string }",
        explain: "& は交差型です。オブジェクトならキーがマージされます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "数値と文字列を混在できる logs を、404と「timeout」で作ってください。",
        lead:
          "ログにはエラー番号とメッセージが同じ配列へ入ります。配列全体をどちらか一方にするのではなく、各要素が2種類のどちらかになる型にしてください。",
        kind: "code",
        starter: "// logs をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "再代入しない logs を定義する",
          "要素型が文字列または数値になる配列型を指定する",
          "指定された数値と文字列を順に入れて初期化する",
        ],
        hint: "まず1要素に許す候補をまとめ、そのまとまりが配列になるように考えます。",
        sample: "",
        answer: 'const logs: (string | number)[] = [404, "timeout"]',
        explain:
          "(string | number)[] は各要素がどちらかです。string[] | number[] とは違います。",
      },
    ],
  },
  {
    id: "ts-fn",
    track: "ts",
    level: "basic",
    chapter: "ts-shape",
    order: 7,
    title: "関数の型",
    summary: "引数と戻り値を契約する",
    minutes: 13,
    slides: [
      {
        title: "入り口と出口を書く",
        lead: "function add(a: number, b: number): number は数値を2つ受けて数値を返す契約です。呼び出し側が文字列を渡すと、実行前にエラーになります。戻り値注釈は、中で別の型を return したときの安全網です。",
        points: [
          "推論だけでも動くが、公開関数は出口を書くと実装のドリフトに気づく",
          "void は「戻り値を使わない」",
          "never は「戻ってこない」（throw や無限ループ）",
        ],
        talk: [
          { speaker: "beginner", text: "引数へ型を書けば、関数の中で文字列が渡されたとき自動変換されますか？" },
          { speaker: "engineer", text: "変換ではなく、呼び出しを実行前に不一致として止めます。戻り値型は実装が別の種類を返す事故も見つけます。" },
          { speaker: "beginner", text: "voidとneverは、どちらも値を返さない意味でしょうか？" },
          { speaker: "engineer", text: "voidは戻り値を使わない契約、neverは正常に戻ってこない処理です。どちらも型の説明であり、実行時の制御そのものは関数本体が決めます。" },
        ],
        diagram: "fn-type",
        code: `function add(a: number, b: number): number {
  return a + b;
}`,
      },
      {
        title: "関数そのものの型は矢印",
        lead: "type Mapper = (n: number) => string は、その形の関数だけを代入できます。コールバックの引数にこれを書くと、渡す関数の形が揃います。",
        points: [
          "引数名は型としては役割ラベル。実装側の名前と一致しなくてよい",
          "省略可能な引数は (n?: number) => void",
        ],
        talk: [
          { speaker: "beginner", text: "関数型の矢印は、実際に関数を実行する記号ですか？" },
          { speaker: "engineer", text: "型の位置では、どんな入力を受けて何を返す関数かを表すだけです。" },
          { speaker: "beginner", text: "型側の引数名と、代入する関数の引数名は揃える必要がありますか？" },
          { speaker: "engineer", text: "型として重要なのは位置と種類で、名前は読み手向けの札です。省略可能と必須の違いは呼び出し方へ影響しますが、型宣言自体は実行時に残りません。" },
        ],
        diagram: "fn-type",
        code: `type Mapper = (n: number) => string;
const f: Mapper = (n) => String(n);`,
      },
      {
        title: "コールバックの引数は文脈で推論されやすい",
        lead: "[1, 2].map(n => n * 2) の n は number と推論されます。map の型が配列の要素型を流しているためです。独自関数でも、引数の型をしっかり書くとコールバックが楽になります。",
        points: [
          "文脈が無いと n は implicit any になり得る",
          "ジェネリクス（後の講義）がこの流れを一般化する",
        ],
        talk: [
          { speaker: "beginner", text: "mapのnにnumberを書かなくても、なぜ検査できるんですか？" },
          { speaker: "engineer", text: "元の配列が数値配列だと分かるので、mapの定義からnへnumberという文脈が流れます。" },
          { speaker: "beginner", text: "名前がnだから数値だと推測しているわけではないんですね。" },
          { speaker: "engineer", text: "名前ではなく周囲の型情報です。文脈のない関数引数は型不明になることがあるので、入口側の契約は明示します。実行時にはこの推論処理は走りません。" },
        ],
        diagram: "fn-type",
        code: `const xs = [1, 2, 3];
xs.map((n) => n * 2);`,
      },
      {
        title: "オーバーロードは呼び出し形が複数あるとき",
        lead: "同じ名前で、引数が string のときと number のときで戻りが違う、という JS の関数は、複数の宣言＋1つの実装で表現できます。実装側は広く受け、宣言側が呼び出しごとの精度を出します。多用すると読みにくいです。",
        points: [
          "実装シグネチャは一番広い型",
          "まずはユニオンで足りないか考える",
        ],
        talk: [
          { speaker: "beginner", text: "入力の種類が二つなら、必ずオーバーロードを書くべきですか？" },
          { speaker: "engineer", text: "処理や戻り値の関係が単純なら、まずユニオンで十分か考えます。呼び出し形ごとに戻り値が変わるときに候補になります。" },
          { speaker: "beginner", text: "宣言を二つ書けば、実行時にも関数が二つ作られますか？" },
          { speaker: "engineer", text: "実装は一つだけです。複数の宣言は検査係へ呼び出し方を教えます。広い実装との整合を保ち、多用して読みにくくしないことが大切です。" },
        ],
        diagram: "fn-type",
        code: `function parse(x: string): number;
function parse(x: number): string;
function parse(x: string | number) {
  return typeof x === "string" ? Number(x) : String(x);
}`,
      },
      {
        title: "この講義の要点",
        lead: "引数と戻り値が契約。関数型は矢印。void と never は出口の種類。次は絞り込みです。",
        points: ["公開関数ほど出口を書く", "コールバックは文脈推論を活かす"],
        talk: [
          { speaker: "beginner", text: "関数は引数が入口、戻り値が出口の契約で、関数そのものの型は矢印で表すんですね。" },
          { speaker: "engineer", text: "その整理で合っています。ただし契約が実行時に引数を変換するわけではなく、不一致を事前に知らせます。" },
          { speaker: "beginner", text: "コールバックは周囲から型が流れるので、何でも注釈せず文脈推論も使えます。" },
          { speaker: "engineer", text: "はい。次はユニオンの値を実際の条件で確かめ、各処理に必要な型へ絞る方法を学びます。" },
        ],
        diagram: "fn-type",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "単価と個数から order.total を返す calculateTotal の型契約を作る。",
        projectRole: "build",
        prompt: "単価と個数を受け取り、order.calculateTotal を返す calculateTotal 関数を作ってください。",
        lead:
          "関数の利用者に、2つの入力と1つの出力がすべて数値だと伝えます。計算結果の表示は不要で、型検査に合格すれば完成です。",
        kind: "code",
        starter: "// calculateTotal をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "price と quantity が数値であることを明示する",
          "戻り値も数値であることを明示する",
          "単価と個数を掛けた結果を返す",
        ],
        hint: "引数ごとに入力の型が必要です。さらに、関数の閉じ括弧のあとで出力の型を示します。",
        sample: "",
        answer: `function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}`,
        explain: "呼び出し側が文字列を渡すと、実行前にエラーになります。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "フォームの有効・無効を表示文へ変える Formatter 型を定義してください。",
        lead:
          "入力は真偽値1つ、出力は画面に使う文字列です。実際の変換関数は作らず、このコールバックへ文字列などの誤った入力が渡るのを防ぐ契約だけを定義してください。",
        kind: "code",
        starter: "// Formatter の関数型を定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Formatter という型名を作る",
          "valueという入力が真偽値1つである関数型を表す",
          "出力が文字列であることを表す",
        ],
        hint: "関数型では入力と出力を矢印で結びます。function 宣言ではなく、型の別名として記述します。",
        sample: "",
        answer: "type Formatter = (value: boolean) => string",
        explain: "関数そのものの型は矢印で書きます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "数値配列xsの各要素を2倍し、新しい数値配列を返す doubled 関数を作ってください。",
        lead: "配列メソッドのコールバック引数は、元の配列型から推論されます。doubled の入力と出力を数値配列として明示し、各要素を2倍した新しい配列を返してください。",
        kind: "code",
        starter: "// map の n は文脈で推論されます\n",
        fileName: "script.ts",
        steps: [
          "数値配列を1つ受け取る doubled 関数を定義する",
          "戻り値が数値配列であることを明示する",
          "配列の変換処理で各要素を2倍し、その結果を返す",
        ],
        hint: "外側の関数で配列の要素型を明示すれば、変換処理の各要素の型は自動で推論されます。",
        sample: "",
        answer: `function doubled(xs: number[]): number[] {
  return xs.map((n) => n * 2);
}`,
        explain:
          "map の型が要素型を流すので、コールバックの n は number と推論されます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "設定値を文字列または数値で読み取る関数で、オーバーロードを検討する場面を選んでください。",
        lead:
          "入力候補が複数あるだけならユニオンで十分なことがあります。呼び出し側で、入力に対応する戻り値の型まで正確に分かる必要があるかを基準に判断してください。",
        kind: "choice",
        options: [
          "入力の型ごとに戻り値の型が変わる",
          "入力の型に関係なく引数名を短くする",
          "入力を受けるたび関数を2回実行する",
          "入力と出力の型注釈をすべて消す",
        ],
        steps: [
          "単純なユニオンで表せるケースを考える",
          "呼び出しごとに保ちたい入力と出力の関係を考える",
          "複数の宣言が有効な場面を1つ選ぶ",
        ],
        hint:
          "候補が複数あることより、入力と戻り値の対応を呼び出し側へ正確に伝えたいかが判断材料です。",
        answer: "入力の型ごとに戻り値の型が変わる",
        explain:
          "呼び出し形ごとに戻り値が変わる場合はオーバーロードが役立ちます。単純ならユニオンを優先します。",
      },
    ],
  },
  {
    id: "ts-narrow",
    track: "ts",
    level: "middle",
    chapter: "ts-guard",
    order: 8,
    title: "型の絞り込み",
    summary: "if と typeof でユニオンを狭める",
    minutes: 14,
    slides: [
      {
        title: "制御フローが型を狭める",
        lead: 'string | number の id に対し typeof id === "string" の中では id は string です。else では number。実行時のチェックが、そのブロック内の型を変えます。これが narrowing です。',
        points: [
          "typeof / instanceof / in / 等価比較がよく使われる",
          "return や throw で早期に切ると、残りが自動で狭まる",
        ],
        talk: [
          { speaker: "beginner", text: "ユニオンの値に文字列専用メソッドを使いたいとき、as stringで通せばよいですか？" },
          { speaker: "engineer", text: "実際の値をtypeofで確かめる方が安全です。その条件内では検査係もstringだと理解します。" },
          { speaker: "beginner", text: "ifは実行時の処理なのに、型検査にも影響するんですね。" },
          { speaker: "engineer", text: "はい。検査係が制御の流れを読み、各枝の候補を狭めます。早期returnで一方を終えると残りも絞れますが、判定自体は実行時にも本当に行われます。" },
        ],
        diagram: "narrow",
        code: `function show(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase();
  }
  return id.toFixed(0);
}`,
      },
      {
        title: "真偽のチェックも狭める",
        lead: "if (value) は falsy を除外します。string | undefined なら、中では string に近づきます（空文字は残る点に注意）。null を外すなら value != null が両方まとめて消せて便利です。",
        points: [
          "!= null は null と undefined を両方除外",
          "!== undefined だけだと null が残る",
        ],
        talk: [
          { speaker: "beginner", text: "ifで値を確認すれば、空文字も安全な文字列として残りますか？" },
          { speaker: "engineer", text: "単純な真偽チェックでは空文字も偽として除かれます。何を除外したいかで条件を選びます。" },
          { speaker: "beginner", text: "nullだけ見れば、undefinedも一緒に消える書き方があるんですね。" },
          { speaker: "engineer", text: "意図して緩い等価比較を使うと両方を除けます。一方だけ比較するともう一方が残ります。型検査の絞り込みと、実行時の条件判定が同じ事実を共有している点が重要です。" },
        ],
        diagram: "narrow",
        code: `function len(s?: string) {
  if (s == null) return 0;
  return s.length;
}`,
      },
      {
        title: "ディスクリミネータでオブジェクトユニオンを分ける",
        lead: "type Ok = { ok: true; data: string }; type Ng = { ok: false; error: string } のように共通キーのリテラルが違うと、if (r.ok) の中で data が見えます。タグ付きユニオンは API 結果の定番です。",
        points: [
          "タグのキー名を揃える",
          "switch (r.ok) で網羅チェックしやすい",
        ],
        talk: [
          { speaker: "beginner", text: "成功と失敗のオブジェクトを混ぜると、dataとerrorの両方を確認する必要がありますか？" },
          { speaker: "engineer", text: "共通のタグを固定値にすれば、その値を見た枝で対応するプロパティだけが使えます。" },
          { speaker: "beginner", text: "okをただのbooleanにしても同じですか？" },
          { speaker: "engineer", text: "各候補でtrueとfalseに固定することが識別の鍵です。検査時は枝を絞れますが、APIから来た実行時データが本当にその形かは別に検証してください。" },
        ],
        diagram: "narrow",
        code: `type Result =
| { ok: true; data: string }
| { ok: false; error: string };`,
      },
      {
        title: "ユーザー定義の型ガード",
        lead: "独自関数が boolean を返すだけだと、TS は狭めません。x is Cat という戻り値注釈（型述語）を付けると、true のとき引数が Cat になります。Array.filter のコールバックにも使えます。",
        points: [
          "述語の実装が嘘だと、型と実行がずれる。責任は書き手",
          "is の右は、実際に保証できる範囲だけにする",
        ],
        talk: [
          { speaker: "beginner", text: "判定関数がbooleanを返せば、呼び出し側も自動で型を絞れますか？" },
          { speaker: "engineer", text: "独自関数では、どの型を保証したかを型述語で伝える必要があります。" },
          { speaker: "beginner", text: "戻り値にisを書けば、関数の中身が雑でも安全になりますか？" },
          { speaker: "engineer", text: "なりません。実行時に行う判定が真実で、述語はその結果を検査係へ説明する約束です。嘘を書くと型だけが先走るので、実際に確認した範囲だけ保証します。" },
        ],
        diagram: "narrow",
        code: `function isString(x: unknown): x is string {
  return typeof x === "string";
}`,
      },
      {
        title: "この講義の要点",
        lead: "チェックが型を狭める。タグ付きユニオンが強い。述語で独自ガード。次は unknown です。",
        points: ["専用メソッドの前に絞る", "早期 return で残りが綺麗になる"],
        talk: [
          { speaker: "beginner", text: "実際の条件分岐を検査係も読み、候補を狭めるから専用の操作が安全に使えるんですね。" },
          { speaker: "engineer", text: "そうです。絞り込みは型だけの言い切りではなく、実行時に本当に行う確認と対応しています。" },
          { speaker: "beginner", text: "早期returnや共通タグを使うと分岐が分かりやすく、独自ガードでは述語の中身を正しく書く必要があります。" },
          { speaker: "engineer", text: "しっかり振り返れています。次はまだ種類の分からない外部の値を、unknownで安全に受け止める方法へ進みましょう。" },
        ],
        diagram: "narrow",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "string | number の orderId を絞り込み、表示用文字列へ変換する。",
        projectRole: "build",
        prompt: "文字列なら大文字、数値なら整数表記を返す formatOrderId を作ってください。",
        lead:
          "orderIdが文字列か数値かを実行時に確かめ、それぞれでだけ使えるメソッドを呼びます。どちらの分岐も文字列を返し、型検査に合格させてください。",
        kind: "code",
        starter: "// formatOrderId をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "文字列または数値の id を受け取る関数を定義する",
          "文字列の枝では大文字へ変換して返す",
          "残る数値の枝では小数点以下0桁の文字列を返す",
        ],
        hint:
          "typeofの結果が文字列を示す \"string\" か確認すると、一方の枝では文字列、残りでは数値として扱えます。",
        sample: "",
        answer: `function formatOrderId(id: string | number): string {
  if (typeof id === "string") return id.toUpperCase();
  return id.toFixed(0);
}`,
        explain:
          "typeof の分岐により、各メソッドを対応する型だけに安全に使えます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "名前が無ければ「guest」、あれば大文字で返す displayName を作ってください。",
        lead:
          "値が無い場合を先に返すと、その後の処理では文字列として安全に扱えます。null と undefined の両方を受け取る関数にしてください。",
        kind: "code",
        starter: "// displayName をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "文字列、null、undefined を受け取る関数を定義する",
          "値が無い2つの状態をまとめて判定し、既定名を返す",
          "残った文字列を大文字にして返す",
        ],
        hint: "先に値が無い場合を除外する早期 return を使うと、残りの処理で型が絞られます。",
        sample: "",
        answer: `function displayName(name: string | null | undefined): string {
  if (name == null) return "guest";
  return name.toUpperCase();
}`,
        explain: "== null は null と undefined をまとめて除外します。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "成功時は data、失敗時は error を持つ Result 型を定義してください。",
        lead: "タグ付きユニオンでは、共通のプロパティに異なる固定値を持たせて候補を区別します。成功の形と失敗の形を作り、どちらか一方になるようにしてください。",
        kind: "code",
        starter: "// タグ付きユニオン\n",
        fileName: "script.ts",
        steps: [
          "成功の形に、成功を示す固定値と文字列データを持たせる",
          "失敗の形に、失敗を示す固定値と文字列エラーを持たせる",
          "2つの形をユニオンとして Result にまとめる",
        ],
        hint: "区別に使う ok は一般的な真偽値型ではなく、各候補で true または false に固定します。",
        sample: "",
        answer:
          "type Result = { ok: true; data: string } | { ok: false; error: string }",
        explain: "共通キーのリテラルが違うと、if (r.ok) で分岐できます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "APIから届いた x が数値か判定する型ガード isNumber を作ってください。",
        lead:
          "外部データは unknown として受け、数値でない値を集計処理へ渡さないようにします。実行時に種類を確認し、判定が成功した枝で x を数値として扱える型述語を付けてください。",
        kind: "code",
        starter: "// isNumber をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "未知の値 x を受け取る isNumber 関数を定義する",
          "成功時に x が数値であることを示す型述語を付ける",
          "実行時の判定でも数値かどうかを調べて返す",
        ],
        hint:
          "戻り値の型で、引数名と true のときに保証する型を結び付けます。",
        sample: "",
        answer: `function isNumber(x: unknown): x is number {
  return typeof x === "number";
}`,
        explain:
          "型述語を付けると、true の枝で引数が number に狭まります。",
      },
    ],
  },
  {
    id: "ts-unknown",
    track: "ts",
    level: "middle",
    chapter: "ts-guard",
    order: 9,
    title: "unknown と any の違い",
    summary: "安全な未知と、検査放棄",
    minutes: 12,
    slides: [
      {
        title: "JSON.parse の結果は実行時には何でもあり得る",
        lead: "外の世界（JSON、ユーザー入力、未知のライブラリ）は、こちらが願った形とは限りません。any で受けると、直後から何でも呼べてしまい、実行時に壊れます。unknown は「まだ絞っていない」という印で、絞るまでプロパティに触れません。",
        points: [
          "unknown は全ての値を代入できる（入力として広い）",
          "unknown を他の型へは、絞るかアサーションするまで渡せない",
        ],
        talk: [
          { speaker: "beginner", text: "JSONを読み込んだら、型にUserと書くだけでUserになりますか？" },
          { speaker: "engineer", text: "外部データは実行時に何でも来ます。まずunknownとして受け、形を確認してから使うのが安全です。" },
          { speaker: "beginner", text: "unknownは、値を入れること自体も禁止する型ですか？" },
          { speaker: "engineer", text: "どんな値でも受け取れますが、未確認のままプロパティへ触れません。型検査が確認を促すだけで、JSON.parse自体が実行時検証を追加するわけではありません。" },
        ],
        diagram: "unknown",
        code: `const raw: unknown = JSON.parse(text);
// raw.foo はエラー
if (typeof raw === "string") {
  raw.toUpperCase();
}`,
      },
      {
        title: "any は代入先にも感染する",
        lead: "any を number の変数に入れるのも、.whatever するのも通ります。unknown は入れられません。感染を止めるなら境界で unknown にし、内側で絞ります。",
        points: [
          "eslint の no-explicit-any がこれを防ぐ",
          "一時的な any には TODO と範囲をコメントする",
        ],
        talk: [
          { speaker: "beginner", text: "anyを数値の変数へ入れられるなら、そこでnumberとして安全になりますか？" },
          { speaker: "engineer", text: "安全にはなりません。検査をすり抜けた値が、数値だと信じる場所まで広がっただけです。" },
          { speaker: "beginner", text: "unknownなら、その広がりを入口で止められるということですね。" },
          { speaker: "engineer", text: "はい。確認なしの代入や操作を検査時に止めます。どうしてもanyが必要なら範囲を狭くし、後で除く印を残します。実行時の値はanyでもunknownでも同じです。" },
        ],
        diagram: "unknown",
      },
      {
        title: "アサーション as は検査ではなく上書き",
        lead: "raw as User はコンパイラへの「信じろ」です。実行時チェックはしません。嘘の as は unknown より危険です。as は、既に自分で検証した直後か、DOM など文脈が確かなときに限ります。",
        points: [
          "as const はリテラルを狭めて固定する別用途",
          "非null の ! も実行時保証は無い",
        ],
        talk: [
          { speaker: "beginner", text: "DOM要素に感嘆符を付ければ、見つからない場合もnullではなくなりますか？" },
          { speaker: "engineer", text: "実際の値は変わりません。検査係へ『nullではない』と申告しているだけです。" },
          { speaker: "beginner", text: "asも同じく、値を確かめてから使う機能ではないんですね。" },
          { speaker: "engineer", text: "そのとおりです。自分で直前に検証したなど根拠がある場面に限ります。型を狭く保つas constは目的が別ですが、どちらも実行時チェックを生成しません。" },
        ],
        diagram: "unknown",
        code: `const el = document.getElementById("x")!;`,
        watch:
          "getElementById は null があり得ます。! は「null ではない」と宣言するだけです。",
      },
      {
        title: "検証関数にまとめる",
        lead: "形を実行時に確認し、x is User を返す関数を境界に置きます。zod などのライブラリも同じ思想です。型だけ書いて parse しないと、外の世界には勝てません。",
        points: ["型は静的、バリデーションは動的。両方必要"],
        talk: [
          { speaker: "beginner", text: "型ガードを一つ作れば、外部データはもう安全だと言えますか？" },
          { speaker: "engineer", text: "その関数が実行時に必要な項目を本当に確認していれば、確認後の範囲では安全に扱えます。" },
          { speaker: "beginner", text: "型だけ詳しく書いて、確認処理を省くのはだめですか？" },
          { speaker: "engineer", text: "型は外のデータを書き換えません。境界で動的に検証し、その結果を型述語で静的検査へ渡します。検証ライブラリもこの役割をまとめています。" },
        ],
        diagram: "unknown",
      },
      {
        title: "この講義の要点",
        lead: "未知は unknown。any は放棄。as は嘘になり得る。境界で検証。次はジェネリクスです。",
        points: ["外の世界を any にしない", "絞ってから中へ"],
        talk: [
          { speaker: "beginner", text: "外から来る値はunknownで受け、実際の形を確認してから内側へ渡す、と理解しました。" },
          { speaker: "engineer", text: "そのとおりです。unknown自体が実行時検証をするのではなく、未確認の操作を型検査で止めてくれます。" },
          { speaker: "beginner", text: "anyや根拠のないasは、値を安全にするのではなく検査を通り抜けるだけなんですね。" },
          { speaker: "engineer", text: "はい。次は安全性を保ったまま複数の型へ同じ処理を使える、ジェネリクスの関係付けを学びます。" },
        ],
        diagram: "unknown",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "unknown の value を受け取り、文字列の場合だけ返す readName 関数を完成させてください。",
        lead: "unknown は、種類を確認するまで安全に操作できない値です。starter の関数内で value の種類を調べ、文字列だと確認できた場合だけ返してください。",
        kind: "code",
        starter: "function readName(value: unknown) {\n  // 絞ってから返す\n}\n",
        fileName: "script.ts",
        steps: [
          "value の実行時の種類を確認する",
          "文字列である条件の中だけで value を返す",
          "型アサーションで検査を回避していないことを確認する",
        ],
        hint: "unknown は、typeofの結果が \"string\" か確認して型を絞ってから使います。型を一方的に上書きする必要はありません。",
        sample: "",
        answer: `function readName(value: unknown) {
  if (typeof value === "string") return value;
}`,
        explain: "unknown は絞るまでメンバーに触れません。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "APIレスポンスを unknown で受ける方が any より安全な理由を選んでください。",
        lead:
          "どちらも実行時には同じ外部データを保持でき、unknown 自体が内容を検証するわけではありません。項目へ触れる前の型検査にどんな違いがあるか判断してください。",
        kind: "choice",
        options: [
          "種類を確認するまで操作を許さない",
          "実行時に値の中身まで自動検証する",
          "確認せず値を必ず文字列へ変換する",
          "種類に関係なくすべての操作を許す",
        ],
        steps: [
          "値を受け取れる範囲と、利用できる操作を分けて考える",
          "実行時の検証が自動追加されるか確認する",
          "未確認の操作に対する違いを1つ選ぶ",
        ],
        hint:
          "unknown は何でも受け取れますが、そのままプロパティやメソッドを使うことはできません。",
        answer: "種類を確認するまで操作を許さない",
        explain: "any は代入先にも感染します。境界では unknown にします。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "プロフィールAPIの応答へ型アサーションを付けたとき、実行時に値の形を検証するか選んでください。",
        lead: "応答に必要な name が無い事故を防げるかを考えます。型アサーションによって、実行時に項目を確認する処理が追加されるか判断してください。",
        kind: "choice",
        options: [
          "実行時にも自動で検証する",
          "実行時には自動検証しない",
          "strict 時だけ自動検証する",
          "unknown 時だけ自動検証する",
        ],
        steps: [
          "型検査と実行時処理の違いを思い出す",
          "型アサーションによって検証コードが追加されるかを考える",
          "説明に合う選択肢を1つ選ぶ",
        ],
        hint: "型情報は通常、JavaScript へ変換すると消えます。実行時の検証には、値を実際に調べる処理が別途必要です。",
        answer: "実行時には自動検証しない",
        explain:
          "アサーションはコンパイラ向けの上書きで、実行時チェックはありません。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "unknown のAPIデータが orderId を持つ Order か型ガードで検査する。",
        projectRole: "build",
        prompt: "orderId を持つオブジェクトか判定する型ガード isOrder を作ってください。",
        lead:
          "外部の値を `{ orderId: string }` として使う前に、値がオブジェクトであり、orderId が文字列であることを実行時に確認します。",
        kind: "code",
        starter: "// isOrder をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "unknown の x を受け取り、成功時のオブジェクト型を型述語で示す",
          "x が null ではないオブジェクトか確認する",
          "orderId の存在と、その値が文字列であることを確認して返す",
        ],
        hint:
          "typeofの結果が \"object\" でnullではないと確認した後、`in` で項目の存在を調べます。",
        sample: "",
        answer: `function isOrder(x: unknown): x is { orderId: string } {
  return typeof x === "object" && x !== null && "orderId" in x && typeof x.orderId === "string";
}`,
        explain:
          "型述語だけでなく、保証する形を実行時の条件で実際に確認します。",
      },
    ],
  },
  {
    id: "ts-generic",
    track: "ts",
    level: "middle",
    chapter: "ts-generic",
    order: 10,
    title: "ジェネリクスは型の引数",
    summary: "中身の型を呼び出し側から渡す",
    minutes: 14,
    slides: [
      {
        title: "Array<T> の T が型引数",
        lead: "配列は「何の配列か」が呼び出しごとに違います。function first<T>(xs: T[]): T | undefined は、渡した配列の要素型が T に入り、戻りもそれに連動します。1つの実装で number にも string にも対応します。",
        points: [
          "T は慣例。複数なら T, U や意味のある名前",
          "呼び出し側は first(nums) と書けば推論されることが多い",
        ],
        talk: [
          { speaker: "beginner", text: "Tは、anyに別の名前を付けただけですか？" },
          { speaker: "engineer", text: "違います。呼び出しごとの具体的な型を受け取り、入力と出力の関係を保つための型引数です。" },
          { speaker: "beginner", text: "数値配列を渡した後、戻り値へ文字列を混ぜても通るわけではないんですね。" },
          { speaker: "engineer", text: "はい。検査係がTを数値として追跡します。実装は一つですが、型情報だけが呼び出しに合わせて変わり、実行時にTという値が渡されるわけではありません。" },
        ],
        diagram: "generic",
        code: `function first<T>(xs: T[]): T | undefined {
  return xs[0];
}
first([1, 2]); // number | undefined`,
      },
      {
        title: "明示するときは first<string>([])",
        lead: "空配列など推論できないとき、型引数を明示します。過剰に明示すると、逆に実値と食い違ってエラーになります。まずは推論に任せ、足りないときだけ書きます。",
        points: ["Promise<T>、Map<K, V>、React の useState<T> も同じ考え"],
        talk: [
          { speaker: "beginner", text: "型引数は、毎回山括弧の中へ書く必要がありますか？" },
          { speaker: "engineer", text: "多くは実引数から推論できるので、まず省略して構いません。材料のない空配列などで明示します。" },
          { speaker: "beginner", text: "明示すれば、実際の値よりそちらが優先されて通りますか？" },
          { speaker: "engineer", text: "食い違えば検査エラーです。型引数は実行時の変換命令ではありません。推論できない情報だけ補う、と考えると過剰指定を避けられます。" },
        ],
        diagram: "generic",
        code: `const xs = first<string>([]);`,
      },
      {
        title: "制約 extends で T の下限を決める",
        lead: "function label<T extends { name: string }>(x: T) は、name を持つオブジェクトだけ T にできます。x.name が安全に読めます。制約が無い T には .name がありません。",
        points: [
          "extends string なら文字列専用の操作ができる",
          "制約が強いほど中は楽、呼び出しは厳しい",
        ],
        talk: [
          { speaker: "beginner", text: "extendsとあるので、クラスの継承が必要ですか？" },
          { speaker: "engineer", text: "ここでは型引数が最低限満たす条件です。例えばnameを持つ値だけ受けられるようにします。" },
          { speaker: "beginner", text: "条件を付けると、Tはその形ぴったりに削られますか？" },
          { speaker: "engineer", text: "元の詳しい型は保ったまま、関数内で必要な操作が合法になります。検査時の制約なので、実行時に不足プロパティを足す処理はありません。" },
        ],
        diagram: "generic",
        code: `function label<T extends { name: string }>(x: T) {
  return x.name;
}`,
      },
      {
        title: "keyof と組み合わせるとキー名を型にする",
        lead: "function pick<T, K extends keyof T>(obj: T, key: K): T[K] は、存在するキーだけを許し、戻り値の型がそのプロパティ型になります。これがジェネリクスの本領です。",
        points: ["keyof T はキーのユニオン", "T[K] はインデックスアクセス型"],
        talk: [
          { speaker: "beginner", text: "keyをstringにしておけば、どのオブジェクトにも使えて便利では？" },
          { speaker: "engineer", text: "存在しないキーまで許してしまいます。keyofで、そのオブジェクトにあるキーへ候補を限定できます。" },
          { speaker: "beginner", text: "選んだキーによって戻り値の型も変わるんですか？" },
          { speaker: "engineer", text: "T[K]がその関係を表します。検査時にはキーと結果が連動しますが、実行時は普通のプロパティ参照なので、外部から来たキーは別途確認が必要です。" },
        ],
        diagram: "generic",
        code: `function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
      },
      {
        title: "この講義の要点",
        lead: "T は型の引数。推論が先。extends で下限。keyof でキーを安全に。次はユーティリティ型です。",
        points: ["実装は1つ、型は連動", "制約で中の操作を合法にする"],
        talk: [
          { speaker: "beginner", text: "ジェネリクスはanyではなく、呼び出しごとの型を保って入力と出力を連動させる仕組みですね。" },
          { speaker: "engineer", text: "よく分かっています。Tが実行時に渡されるのではなく、検査時に具体的な型へ対応付けられます。" },
          { speaker: "beginner", text: "まず推論を使い、必要なら制約を付け、keyofで実在するキーだけに絞れます。" },
          { speaker: "engineer", text: "その関係付けを土台に、次は既存の型を安全に変形する標準のユーティリティ型を見ましょう。" },
        ],
        diagram: "generic",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "配列xsの末尾要素を返す last 関数を作ってください。",
        lead:
          "数値配列でも文字列配列でも、渡した要素型を戻り値まで保つ関数にします。空配列では値が無い可能性も型に含めてください。",
        kind: "code",
        starter: "// last をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "要素型を表す型引数を持つ last 関数を定義する",
          "引数を、その型の要素からなる配列にする",
          "戻り値に要素型と値が無い可能性を含め、末尾を返す",
        ],
        hint: "末尾位置は配列の長さから1を引いた位置です。空配列では値が無いため、戻り値にもその可能性が必要です。",
        sample: "",
        answer: `function last<T>(xs: T[]): T | undefined {
  return xs[xs.length - 1];
}`,
        explain: "渡した配列の要素型が T に入り、戻りもそれに連動します。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "状態管理へ渡された値xを、同じ型のまま返す identity 関数を作ってください。",
        lead: "数値の状態を渡したのに戻り値が文字列として扱われる、といった型の崩れを防ぎます。any は使わず、入力ごとの型を出力まで保つ関係を定義して型検査に通してください。",
        kind: "code",
        starter: "// 型引数を明示するときも同じ実装\n",
        fileName: "script.ts",
        steps: [
          "型引数を1つ持つ identity 関数を定義する",
          "引数と戻り値に同じ型引数を使う",
          "関数内で受け取った値をそのまま返す",
        ],
        hint: "1つの型引数を入力と出力の両方で使うと、呼び出しごとの具体的な型を保てます。",
        sample: "",
        answer: `function identity<T>(x: T): T {
  return x;
}`,
        explain:
          "空配列など推論できないときだけ、呼び出し側で型引数を明示します。",
      },
      {
        id: "q3",
        slide: 2,
        scenario: "customer を持つ任意の Order 派生型から customer を安全に取り出す。",
        projectRole: "build",
        prompt: "customer を持つ注文xだけを受け取り、その customer を返す getCustomer 関数を作ってください。",
        lead:
          "元の詳しい型を保ちながら、関数内で必要な項目だけを最低条件として要求します。画面への表示は不要で、型検査が通れば完成です。",
        kind: "code",
        starter: "// getCustomer をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "型引数に、文字列の customer を持つという制約を付ける",
          "制約された値を引数として受け取る getCustomer 関数を定義する",
          "引数の customer を返す",
        ],
        hint:
          "型引数の後ろへ、関数内で必要な最小限のオブジェクト形を条件として付けます。",
        sample: "",
        answer: `function getCustomer<T extends { customer: string }>(x: T) {
  return x.customer;
}`,
        explain:
          "制約により customer を安全に読め、引数が持つ他の詳しい型も保たれます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "一覧表の行objから、実在する列名keyの値だけを取得する getProperty 関数を作ってください。",
        lead: "存在しない列名による undefined や入力ミスを、型検査で防ぐ場面です。どんなオブジェクトにも使え、選んだキーに応じて戻り値の型も変わるよう2つの型引数を関連付けてください。",
        kind: "code",
        starter: "// getProperty をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "オブジェクト全体を表す型引数を用意する",
          "キーの型引数を、そのオブジェクトのキーだけに制限する",
          "指定されたキーで値を取得し、対応するプロパティ型として返す",
        ],
        hint: "キーを単なる文字列にすると、存在しない名前も許してしまいます。オブジェクトのキー集合を使って制約します。",
        sample: "",
        answer: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
        explain: "keyof T はキーのユニオン、T[K] はそのプロパティ型です。",
      },
    ],
  },
  {
    id: "ts-utility",
    track: "ts",
    level: "advanced",
    chapter: "ts-advanced",
    order: 11,
    title: "ユーティリティ型",
    summary: "既存の型から Partial や Pick を作る",
    minutes: 13,
    slides: [
      {
        title: "組み込みの変換型を使う",
        lead: "TypeScript はよく使う変形を標準で持っています。Partial<T> は全キー任意、Required<T> は全部必須、Readonly<T> は再代入禁止。元の型を複製せず、関係を型で保てます。",
        points: [
          "更新用の入力は Partial<User> がよくある",
          "元が変わると派生も追従する",
        ],
        talk: [
          { speaker: "beginner", text: "更新用の型は、元のUserをコピーして疑問符を付ければ十分ですか？" },
          { speaker: "engineer", text: "動きますが、元へ項目を足したときにコピーが古くなります。Partialなら関係を保ったまま全項目を任意にできます。" },
          { speaker: "beginner", text: "Partialにすると、実行時のオブジェクトから項目が消えるんですか？" },
          { speaker: "engineer", text: "消えません。受け入れる形を検査時に変えるだけです。Readonlyも同様に実行時凍結ではない点へ注意してください。" },
        ],
        diagram: "utility",
        code: `type User = { name: string; age: number };
type Patch = Partial<User>; // どちらも任意`,
      },
      {
        title: "Pick と Omit はキーの部分集合",
        lead: 'Pick<User, "name"> は name だけ。Omit<User, "age"> は age 以外。API の公開面を狭める、フォームの一部だけ、に使います。',
        points: [
          "2つ目の引数はキーのユニオン",
          "存在しないキーを指定するとエラー",
        ],
        talk: [
          { speaker: "beginner", text: "PickとOmitは、実際のオブジェクトから項目を抜き出す関数ですか？" },
          { speaker: "engineer", text: "いいえ。既存の型から別の型を作る道具です。実行時の値を選別する処理は別に書きます。" },
          { speaker: "beginner", text: "残したいキーと消したいキーを取り違えそうです。" },
          { speaker: "engineer", text: "Pickは選ぶ、Omitは除く、と目的で読み分けます。二つ目には実在するキーだけを指定できるので、元の型が変わったときも検査で気づけます。" },
        ],
        diagram: "utility",
        code: `type NameOnly = Pick<User, "name">;
type WithoutAge = Omit<User, "age">;`,
      },
      {
        title: "Record はキー集合からオブジェクトを作る",
        lead: "Record<Status, number> は Status の各リテラルをキーに、値が number のオブジェクトです。マップのような辞書を、キーの網羅つきで書けます。",
        points: [
          "キーを足し忘れるとエラーにできる",
          "Record<string, V> は索引シグネチャに近い",
        ],
        talk: [
          { speaker: "beginner", text: "Recordは、実行時にMapを作ってくれる型ですか？" },
          { speaker: "engineer", text: "作りません。決めたキー集合と値型を持つオブジェクトの契約です。" },
          { speaker: "beginner", text: "状態を一つ追加したら、対応する値の書き忘れも分かりますか？" },
          { speaker: "engineer", text: "有限のキー集合なら検査で不足を指摘できます。ただし任意のstringをキーにすると網羅の意味は弱くなり、実行時にキーが存在する保証も別問題です。" },
        ],
        diagram: "utility",
        code: `type Status = "ok" | "ng";
const counts: Record<Status, number> = { ok: 1, ng: 0 };`,
      },
      {
        title: "ReturnType と Parameters",
        lead: "関数型から戻り値型や引数タプルを取り出せます。ライブラリ関数の型に追従したいときに、手で複製しません。",
        points: [
          "ReturnType<typeof fn>",
          "Parameters<typeof fn>[0] で第一引数",
        ],
        talk: [
          { speaker: "beginner", text: "関数の戻り値型はnumberと手で書いた方が簡単では？" },
          { speaker: "engineer", text: "一度だけなら簡単でも、関数の変更に追従させたいならReturnTypeで型の重複を避けられます。" },
          { speaker: "beginner", text: "typeofを使うと、実行時に関数を呼んで結果を調べますか？" },
          { speaker: "engineer", text: "型の位置のtypeofは関数の型を取得するだけで、呼び出しません。Parametersも同じく検査用の抽出で、副作用は起きません。" },
        ],
        diagram: "utility",
        code: `function add(a: number, b: number) {
  return a + b;
}
type R = ReturnType<typeof add>; // number`,
      },
      {
        title: "この講義の要点",
        lead: "Partial/Pick/Omit/Record/ReturnType は変形の定番。手書き複製より関係を保つ。最後は条件型です。",
        points: [
          "元の型に名前を付けてから変形する",
          "キーのユニオンを間違えない",
        ],
        talk: [
          { speaker: "beginner", text: "ユーティリティ型を使えば、元の型をコピーせず、任意化やキーの選択を関係付きで表せますね。" },
          { speaker: "engineer", text: "その理解で合っています。ただし変形されるのは検査用の型で、実行時のオブジェクトからキーを足したり消したりはしません。" },
          { speaker: "beginner", text: "関数の引数や戻り値も手書きで重複させず、元の定義へ追従させられると分かりました。" },
          { speaker: "engineer", text: "はい。最後は、そのような型の変形を条件に応じて切り替えたり分解したりする条件型へ進みます。" },
        ],
        diagram: "utility",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "Order の一部更新入力を Partial<Order> から OrderPatch として作る。",
        projectRole: "build",
        prompt: "Order の全項目を省略可能にした OrderPatch 型を定義してください。",
        lead:
          "注文の一部だけを更新できる入力型を、元の型との関係を保って作ります。starter は変更せず、型検査に合格させてください。",
        kind: "code",
        starter:
          "type Order = { nickname: string; bio: string };\n// 派生型を追加する\n",
        fileName: "script.ts",
        steps: [
          "starter の Order 型を変更せずに残す",
          "全項目を省略可能にする組み込み型を適用する",
          "変換後の型に OrderPatch という名前を付ける",
        ],
        hint: "各プロパティを手作業で書き直すのではなく、元の型全体を受け取って任意化する組み込み型を使います。",
        sample: "",
        answer: `type Order = { nickname: string; bio: string };
type OrderPatch = Partial<Order>;`,
        explain:
          "Partial<T> が全キーを任意にします。更新用の入力によく使います。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "Article から title だけを残した Preview 型を定義してください。",
        lead:
          "記事一覧に必要な項目だけを公開する型を、元の型から選び出して作ります。starter は変更せず、型検査に合格させてください。",
        kind: "code",
        starter:
          "type Article = { title: string; body: string };\n// 派生型を追加する\n",
        fileName: "script.ts",
        steps: [
          "starter の Article 型をそのまま残す",
          "必要なキーだけを選ぶ組み込み型を使う",
          "title だけを持つ結果に Preview と名前を付ける",
        ],
        hint: "残したいキーを文字列リテラルとして指定します。除外するキーではなく、必要なキーを選ぶ考え方です。",
        sample: "",
        answer: `type Article = { title: string; body: string };
type Preview = Pick<Article, "title">;`,
        explain: "Pick が指定キーだけ残し、Omit は指定キーを除きます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "「ja」と「en」をキーに持ち、各値が文字列になる Labels 型を定義してください。",
        lead:
          "対応言語を増やしたときにラベルの書き忘れを検出できるよう、有限のキー集合から辞書の型を作ります。",
        kind: "code",
        starter: "// Labels をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "type を使って Labels という型名を作る",
          "2つの文字列リテラルをキー集合として指定する",
          "各キーに対応する値型を文字列にする",
        ],
        hint: "任意の文字列ではなく、必要な2つのキーだけを集合として指定すると、キーの不足を検査できます。",
        sample: "",
        answer: 'type Labels = Record<"ja" | "en", string>',
        explain: "Record<K, V> はキー集合からオブジェクト型を作ります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "makeLabel の戻り値型を取り出し、Label 型を定義してください。",
        lead:
          "関数の変更へ派生型を追従させるため、戻り値型を手で複製せずに取り出します。starter は変更しないでください。",
        kind: "code",
        starter:
          'function makeLabel(id: number) {\n return `item-${id}`;\n}\n// 派生型を追加する\n',
        fileName: "script.ts",
        steps: [
          "starter の makeLabel 関数をそのまま残す",
          "値として存在する関数から型を取得する",
          "戻り値型を取り出し、Label と名付ける",
        ],
        hint: "ユーティリティ型が受け取るのは関数の値ではなく型です。まず makeLabel の型を取得してから戻り値型を取り出します。",
        sample: "",
        answer: `function makeLabel(id: number) {
  return \`item-\${id}\`;
}
type Label = ReturnType<typeof makeLabel>;`,
        explain: "関数型から戻り値型を取り出し、手で複製しません。",
      },
    ],
  },
  {
    id: "ts-conditional",
    track: "ts",
    level: "advanced",
    chapter: "ts-advanced",
    order: 12,
    title: "条件型と infer",
    summary: "型レベルで if と分解をする",
    minutes: 14,
    slides: [
      {
        title: "T extends U ? A : B",
        lead: "型の世界の if です。T が U に代入可能なら A、そうでなければ B。Promise をほどく、配列要素を取る、といった変換の土台です。分配（ユニオンを要素ごとに適用）が起きることがあります。",
        points: [
          "string extends string | number は true 側",
          "ユニオンに対する条件型は分配されて結果がユニオンになりやすい",
        ],
        talk: [
          { speaker: "beginner", text: "条件型は、実行時のif文を型の中へ書く機能ですか？" },
          { speaker: "engineer", text: "見た目は似ていますが、型同士の代入可能性で結果の型を選ぶ検査時の仕組みです。" },
          { speaker: "beginner", text: "ユニオンを入れたら、全体を一度だけ判定するんですよね？" },
          { speaker: "engineer", text: "裸の型引数に対する条件型は、候補ごとに分配されることがあります。結果もユニオンになりやすいので、思わぬ広がりを確認しましょう。実行時の分岐コードは生成されません。" },
        ],
        diagram: "conditional",
        code: `type IsString<T> = T extends string ? true : false;
type A = IsString<"a">; // true
type B = IsString<1>; // false`,
      },
      {
        title: "infer はマッチした型を取り出す",
        lead: "T extends Promise<infer U> ? U : T は、Promise なら中身、そうでなければそのまま。ライブラリの Unwrap 系はこれです。infer は extends の真の枝でだけ使えます。",
        points: [
          "配列なら T extends (infer E)[] ? E : never",
          "関数なら (...args: infer A) => infer R",
        ],
        talk: [
          { speaker: "beginner", text: "inferは、値を実行して中身の種類を調べる命令ですか？" },
          { speaker: "engineer", text: "値ではなく、型がある形に一致したとき、その一部分へ仮の名前を付けて取り出します。" },
          { speaker: "beginner", text: "Promiseや配列の中身を、実行時にも開いてくれるわけではないんですね。" },
          { speaker: "engineer", text: "はい。型の分解だけです。また現行版ではテンプレート文字列型の文字分解が絵文字を一文字として扱う変更もあるので、古いUTF-16前提の型処理には注意が要ります。" },
        ],
        diagram: "conditional",
        code: `type Unwrap<T> = T extends Promise<infer U> ? U : T;
type X = Unwrap<Promise<number>>; // number`,
        watch:
          "TypeScript 7 では、テンプレートリテラル型の分解が絵文字を1文字として扱います。以前の UTF-16 の半分ずつではありません。",
      },
      {
        title: "never と網羅",
        lead: "到達しないはずの枝に never を置くと、ユニオンを足したときに実装の switch が型エラーになります。条件型の else が never のとき、「その形は許さない」という意味です。",
        points: ["function assertNever(x: never) で switch の漏れを検出"],
        talk: [
          { speaker: "beginner", text: "neverは、nullやundefinedをまとめた空っぽの値ですか？" },
          { speaker: "engineer", text: "値が存在しない、到達できない型です。分岐を全部処理した後の値がneverになることを利用します。" },
          { speaker: "beginner", text: "新しい状態を足すと、なぜ漏れが分かるんですか？" },
          { speaker: "engineer", text: "未処理の候補が残り、neverを受ける場所へ渡せなくなるからです。検査時に漏れを知らせますが、実行時のthrowも最後の防波堤として意味があります。" },
        ],
        diagram: "conditional",
        code: `function assertNever(x: never) {
  throw new Error("unexpected");
}`,
      },
      {
        title: "読みやすさが上限",
        lead: "条件型を重ねると、エラーメッセージが読めなくなります。2〜3段を超えたら、途中に type 別名を付け、テスト用に型の等式をコメントか dts で残します。上級でも、まず Partial と絞り込みで足りないかを疑います。",
        points: ["型体操は手段。実行時の正しさは別途テスト"],
        talk: [
          { speaker: "beginner", text: "複雑な条件型を書けるほど、実行時のバグも減りますか？" },
          { speaker: "engineer", text: "表現できる関係は増えますが、値の計算や外部データの正しさまでは保証しません。" },
          { speaker: "beginner", text: "一つの型へ全部詰め込む方が再利用しやすいと思っていました。" },
          { speaker: "engineer", text: "深く重ねるとエラーが読みにくくなります。途中へ別名を付け、標準のユーティリティ型で足りないか先に考え、実行時の振る舞いはテストで確かめましょう。" },
        ],
        diagram: "conditional",
      },
      {
        title: "この講義の要点",
        lead: "条件型は型の if。infer は分解。never は網羅。深くしすぎない。TS コースはここまでです。",
        points: ["分配に注意", "別名を付けて段数を減らす"],
        talk: [
          { speaker: "beginner", text: "条件型は型同士の関係で結果を選び、inferで一部を取り出し、neverで分岐漏れも検査できるんですね。" },
          { speaker: "engineer", text: "きれいに整理できています。どれも実行時のifや値の分解を生成するものではなく、型検査の仕組みです。" },
          { speaker: "beginner", text: "複雑にすれば安全とは限らないので、分配に注意し、別名で読みやすくして実行時のテストも残します。" },
          { speaker: "engineer", text: "その判断ができれば十分です。型は事前検査、値の検証と振る舞いは実行時、という軸を今後のコードでも使ってください。" },
        ],
        diagram: "conditional",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "フォーム項目の型 T が数値型かを判定する IsNumber 型を定義してください。",
        lead:
          "数値入力にだけ数値用の設定を適用するため、型が数値なら true、それ以外なら false となる判定が必要です。実行時の値は調べず、型検査で結果を切り替える型の別名を作ってください。",
        kind: "code",
        starter: "// IsNumber をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "型引数を持つ IsNumber という型の別名を作る",
          "T が数値型に当てはまるかを条件にする",
          "条件の成立時と不成立時に異なる真偽値リテラル型を返す",
        ],
        hint: "値に対する if や typeof ではありません。型の世界で「当てはまるか」を調べる条件型を使います。",
        sample: "",
        answer: "type IsNumber<T> = T extends number ? true : false",
        explain: "条件型は型レベルの if です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "API取得関数の型から結果データ型を取り出す ResultOf 型を定義してください。",
        lead:
          "対象 T が関数なら戻り値部分を取り出し、関数でなければ T 自体を結果にします。関数を実行せず、実装の戻り値変更へ追従できる型検査用の変換を作ってください。",
        kind: "code",
        starter: "// ResultOf をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "型引数を持つ ResultOf という型の別名を作る",
          "T がargsという残余引数を持つ関数の形に合うか調べる",
          "一致時は推論した戻り値型、不一致時は T を結果にする",
        ],
        hint:
          "関数型の戻り値の位置に仮の型名を置き、条件が一致した側でその型を使います。",
        sample: "",
        answer: "type ResultOf<T> = T extends (...args: never[]) => infer R ? R : T",
        explain: "infer は extends の真の枝で、マッチした型を取り出します。",
      },
      {
        id: "q3",
        slide: 2,
        scenario: "paid/unpaid の注文状態追加時に分岐漏れを never で検出する。",
        projectRole: "build",
        prompt: "paid/unpaid を扱う注文状態の分岐漏れを検出する assertNever 関数を作ってください。",
        lead: "すべての状態を処理した後に残る、到達しない値だけを受け取ります。新しい状態の処理漏れは型エラーにし、万一実行された場合はメッセージ「unexpected」のエラーを投げて停止してください。",
        kind: "code",
        starter: "// assertNever をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "assertNever の引数を、到達不能を表す型にする",
          "関数内で指定されたメッセージを持つ Error を作る",
          "そのエラーを投げ、通常の戻り値を作らない",
        ],
        hint: "引数を any や unknown にすると、到達不能であるという検査が働きません。専用の never 型を使います。",
        sample: "",
        answer: `function assertNever(x: never) {
  throw new Error("unexpected");
}`,
        explain: "never を置くと、ユニオンの漏れが型エラーになります。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "権限ごとの画面設定を表す条件型が読みにくくなったときの対応を選んでください。",
        lead:
          "権限追加時の型エラーを担当者が追えないと、設定漏れを安全に直せません。実行時テストの役割も残しつつ、型の各段階を保守しやすくする方法を選んでください。",
        kind: "choice",
        options: [
          "途中の型に意味のある別名を付ける",
          "すべて any に置き換える",
          "条件型をさらに一つへ詰め込む",
          "実行時テストを型で完全に置き換える",
        ],
        steps: [
          "読みやすさと再利用性を両立する方法を考える",
          "型検査と実行時テストの役割を分ける",
          "保守しやすくする対応を1つ選ぶ",
        ],
        hint:
          "型の各段階へ役割の分かる名前を付けると、エラーの場所と意図を追いやすくなります。",
        answer: "途中の型に意味のある別名を付ける",
        explain:
          "複雑な条件型は途中に型の別名を置き、実行時の正しさは別途テストします。",
      },
    ],
  },
];
