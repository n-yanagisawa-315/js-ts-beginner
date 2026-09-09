import type { Lesson } from "@/lib/course/types";

export const tsModern: Lesson[] = [
  {
    id: "ts-seven",
    track: "ts",
    level: "start",
    chapter: "ts-intro",
    order: 2,
    title: "検査係は、動かす前に見てくれる",
    summary: "赤い波線は実行前。ラベルは消える",
    minutes: 16,
    slides: [
      {
        title: "TypeScript 7 は、いまの検査係",
        lead: "TypeScript と書いて提出すると、まず検査係がラベルを見ます。今の最新が TypeScript 7 です。7 は検査が以前より速くなりました。ただし速くなったのは「赤い波線を出す係」であって、ブラウザで動く JavaScript が速くなるわけではありません。あなたが書く約束（: number など）の意味は、前の版と同じです。",
        points: [
          "検査係の名前が tsc です。この講座では、提出がその検査の代わりです",
          "動く本体は JavaScript。ラベルは検査が終わると消える",
          "今は「7＝いまの検査係」とだけ覚えれば十分です。中の仕組みは後回しでよい",
        ],
        talk: [
          { speaker: "beginner", text: "7になったら、ブラウザで動く処理も速くなるんですか？" },
          { speaker: "engineer", text: "短く言うと、速くなる中心は型を調べる側です。画面で走る本体は今までどおりJavaScriptですよ。" },
          { speaker: "beginner", text: "では、数字だと書いたラベルは実行中も値を見張っていますか？" },
          { speaker: "engineer", text: "そこはよくある勘違いです。提出前にtscが食い違いを探し、実行用に直した後はラベルが消えます。検査係の実装方式まで今覚える必要はありません。" },
        ],
        diagram: "contract",
        code: `let age: number = 20;
// この : number を見るのが検査係。実行ファイルには残らない`,
        codeCaption: "ラベルは検査用。実行には残らない",
        note: "ネイティブや Go といった言葉は、検査係の作り方の話です。書き方を覚える必要はありません。",
      },
      {
        title: "赤い波線は、まだ走っていない",
        lead: "age に言葉の「二十」を入れると、実行ボタンを押す前に赤くなります。JavaScript だけだと、動かすまで気づかないことがあります。TypeScript の問題では、画面に数字が出なくても「検査が通る書き方」ができていれば正解です。右の見本が空なのは、出すものが無いからです。",
        points: [
          "赤線＝文法や約束が食い違っている。先にそこを直す",
          "通ったあと、残るのはラベルの無い JavaScript",
          "だから「一度動かしてから型を足す」ではなく、書くときに約束する",
        ],
        talk: [
          { speaker: "beginner", text: "画面に何も出ないのに、赤い波線だけで失敗と分かるんですか？" },
          { speaker: "engineer", text: "はい。この課題では、実行前の型検査を通すこと自体がゴールになる場合があります。" },
          { speaker: "beginner", text: "ageが数字のはずなのに引用符つきの値を入れたら、動かすまで待たずに止まるということですね。" },
          { speaker: "engineer", text: "その理解で大丈夫です。赤線は値の種類が約束と違う合図です。英語を全部訳すより、まず代入した値の種類を確かめると切り分けやすいですよ。" },
        ],
        diagram: "contract",
        code: `let age: number = 20;
age = "二十"; // ここで赤線。実行しなくても分かる`,
        watch: "赤い波線の英語は、最初は全部読まなくてよいです。「種類が違う」と出ていれば、右の値を疑います。",
      },
      {
        title: "きびしさのスイッチは、最初からオン",
        lead: "設定のまとまりを tsconfig と呼びます。今はファイルを作らなくてよいです。TypeScript 7 では、きびしい検査（strict）が最初からオンです。空（null や undefined）を数字の引き出しに入れられない、種類を書いていない引数を放置できない、などです。オンにする作業ではなく、「最初から付いている」と覚えます。",
        points: [
          "true はオン、false はオフ。boolean という種類の値です",
          "緩く切ると、何でもあり（any）が増えて、検査の意味が薄れる",
          "細かい項目名は、困ったときに調べればよい",
        ],
        talk: [
          { speaker: "beginner", text: "strictは難しそうなので、最初だけオフにしてもいいですか？" },
          { speaker: "engineer", text: "結論は、最初からオンの前提で慣れるのがおすすめです。空の値や種類不明の引数を早めに見つけられます。" },
          { speaker: "beginner", text: "設定を書かなければ、検査もされないと思っていました。" },
          { speaker: "engineer", text: "TypeScript 7では既定で厳しく調べる、という教材上の前提です。これは実行時の安全装置ではなく提出前の検査で、緩めるとanyが紛れやすくなる点に注意しましょう。" },
        ],
        diagram: "contract",
        code: `{
  "compilerOptions": {
    "strict": true
  }
}`,
        codeCaption: "書いてもよい。省略しても 7 ではオン",
      },
      {
        title: "書く順は、名前・種類・値",
        lead: "let age: number = 20 は、左から「名前 age」「種類は数字」「値は 20」です。コロン : の左が名前、右が種類。イコール = の右が実際の値です。種類と値が食い違うと赤線です。引用符つきの \"20\" は言葉なので、number とは食い違います。",
        points: [
          "名前の直後の : 種類 が検査用ラベル（型注釈）",
          "値は今までどおりの JavaScript。ラベルは変換しない",
          "次の講義で、string や boolean、書かなくても察してくれる場合を見ます",
        ],
        talk: [
          { speaker: "beginner", text: "コロンの右にnumberと書けば、引用符つきの「20」も数字へ変わりますか？" },
          { speaker: "engineer", text: "変わりません。型注釈は変換命令ではなく、入れてよい種類を検査する札です。" },
          { speaker: "beginner", text: "名前、型、実際の値を別々に読むとよさそうですね。" },
          { speaker: "engineer", text: "そうです。検査時には型と値の一致を見ますが、実行時に残るのはJavaScriptの値だけです。文字列には引用符が要る、というJSの規則もそのままですよ。" },
        ],
        diagram: "annotate",
        code: `let age: number = 20;
let title: string = "講座";
let ok: boolean = true;`,
        codeCaption: "名前 : 種類 = 値",
      },
      {
        title: "この講義の要点",
        lead: "7 はいまの検査係。赤い波線は実行前。ラベルは消える。きびしさは最初からオン。書く順は 名前 : 種類 = 値。次は基本の注釈です。",
        points: ["検査と実行は別", "画面に出なくても、通れば正解の問題がある"],
        talk: [
          { speaker: "beginner", text: "型は、値を変える命令ではなく、動かす前に約束違反を見つける札だと分かりました。" },
          { speaker: "engineer", text: "その振り返りで大丈夫です。赤線が消えても、実行中に型の見張り役が残るわけではありません。" },
          { speaker: "beginner", text: "画面表示がない課題でも、名前・種類・値を正しく書いて検査を通せばよいんですね。" },
          { speaker: "engineer", text: "はい。次は基本の型注釈と推論を見て、どこへ型を書き、どこを検査係に任せるかを覚えましょう。" },
        ],
        diagram: "contract",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "注文画面の開発で TypeScript 7 に更新したとき、主に速くなる処理を選んでください。",
        lead:
          "編集時の型エラー確認と、利用者のブラウザで動く注文処理は別のものです。更新によって待ち時間が短くなる「検査係」の仕事を判断してください。",
        kind: "choice",
        options: [
          "型の食い違いを調べる処理",
          "ブラウザで画面を描画する処理",
          "ネットワークで値を送る処理",
          "JSで計算を実行する処理",
        ],
        steps: [
          "TypeScript が実行前に担当する処理を考える",
          "実行時の JavaScript の処理と区別する",
          "説明に合うものを1つ選ぶ",
        ],
        hint:
          "型のラベルは、ブラウザがプログラムを動かす前に使われます。",
        answer: "型の食い違いを調べる処理",
        explain:
          "速くなった中心は型検査です。実行される JavaScript が自動で高速化されるわけではありません。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "年齢フォームの値を数値型へ代入したとき、文字列との食い違いに気づく時点を選んでください。",
        lead:
          "年齢を数値として計算する前に、文字列が混ざる事故を止めたい場面です。TypeScript が処理の実行を待たずに不一致を知らせる時点を選んでください。",
        kind: "choice",
        options: [
          "型検査をしたとき",
          "ブラウザで実行したとき",
          "画面へ値を表示したとき",
          "型が違っても問題にならない",
        ],
        steps: [
          "赤い波線が出る段階を思い出す",
          "型検査と JavaScript の実行を分けて考える",
          "最も早く不一致が分かる時点を選ぶ",
        ],
        hint:
          "この講義では、プログラムをまだ動かしていない段階の検査を扱っています。",
        answer: "型検査をしたとき",
        explain: "型の不一致は実行前の検査で分かります。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "会員データを扱う TypeScript 7 プロジェクトで、strict について正しい説明を選んでください。",
        lead:
          "未入力項目の null や、種類が不明な引数を見逃すと画面表示で事故につながります。こうした曖昧さを実行前に見つける検査の既定状態を判断してください。",
        kind: "choice",
        options: [
          "設定を省略しても既定で有効",
          "設定を省略すると型検査がすべて無効",
          "実行中の値を毎回自動で検証する",
          "JSの実行速度を自動で上げる",
        ],
        steps: [
          "strict が検査時と実行時のどちらに働くか考える",
          "この版での既定状態を思い出す",
          "両方に合う説明を1つ選ぶ",
        ],
        hint:
          "オンにする設定作業ではなく、最初からどうなっているかを問う問題です。",
        answer: "設定を省略しても既定で有効",
        explain:
          "この教材で扱う TypeScript 7 では strict は既定で有効です。実行時の検証機能ではありません。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "変更可能な変数 courseName に、文字列だけを入れられる約束と初期値「入門」を設定してください。",
        lead:
          "名前・種類・値を読み分ける練習です。画面への表示は不要で、指定した文字列を持つ変数が型検査に合格すれば完成です。",
        kind: "code",
        starter: "// courseName をここで宣言する\n",
        fileName: "script.ts",
        steps: [
          "あとから変更できる変数として宣言する",
          "文字列だけを受け入れる型を明示する",
          "指定された初期値を文字列として設定し、型検査を通す",
        ],
        hint:
          "変数名の直後に種類、代入記号の右側に実際の値を置きます。",
        sample: "",
        answer: 'let courseName: string = "入門"',
        explain: "コロンの左が名前、右が種類。イコールの右が値です。",
      },
    ],
  },
  {
    id: "ts-satisfies",
    track: "ts",
    level: "basic",
    chapter: "ts-shape",
    order: 5,
    title: "satisfies は形だけ検査する",
    summary: "推論した型を使いながら、契約を満たすか見る",
    minutes: 13,
    slides: [
      {
        title: "型注釈は、変数を契約の型として扱う",
        lead: 'const config: { url: string; retry: number } = { url: "/api", retry: 3 } と書くと、configは左側に書いた契約の型として扱われます。urlは任意の文字列を許すstringです。まずは、注釈が変数の読み書きに使う型を決めると理解してください。',
        points: [
          "注釈の形に足りないキーや、値の型違いはエラー",
          "注釈後は、変数をその契約の型として読み書きする",
        ],
        talk: [
          { speaker: "beginner", text: "urlに\"/api\"を入れたなら、型もその文字だけを覚えますか？" },
          { speaker: "engineer", text: "url: stringと注釈したので、config.urlは任意の文字列を許すstringとして扱われます。" },
          { speaker: "beginner", text: "型を書けば書くほど詳しくなる、とは限らないんですね。" },
          { speaker: "engineer", text: "はい。注釈は契約違反を検査し、その変数を契約の型として扱います。実行時のオブジェクト自体は注釈で変化しません。" },
        ],
        diagram: "shape",
        code: `const config: { url: string; retry: number } = {
  url: "/api",
  retry: 3,
};
config.url; // string`,
      },
      {
        title: "satisfies は適合を検査し、式から推論した型を使う",
        lead: "satisfiesは、左側の値が右側の契約を満たすか検査します。通常の型注釈と違い、変数の型を契約そのものへ置き換えず、左側の式から推論した型を使い続けます。ただし通常のオブジェクトの文字列プロパティは、もともとstringへ広がります。",
        points: [
          "足りないキーや型の不一致はエラー",
          "検査後も、左側の式から推論された型を使う",
          "satisfiesだけで、すべての値がリテラル型になるわけではない",
        ],
        talk: [
          { speaker: "beginner", text: "satisfiesを付けると、すべての値が\"/api\"のようなリテラル型になりますか？" },
          { speaker: "engineer", text: "いいえ。satisfiesは推論結果を保ちますが、通常のオブジェクトのurlは最初からstringと推論されます。" },
          { speaker: "beginner", text: "では、何が型注釈と違うのですか？" },
          { speaker: "engineer", text: "契約への適合を検査しつつ、左側の式が持つキーや、文字列と配列のようなプロパティごとの差を保てます。" },
        ],
        diagram: "shape",
        code: `type Config = { url: string; retry: number };
const config = {
  url: "/api",
  retry: 3,
} satisfies Config;
config.url; // string。"/api"ではない`,
        codeCaption: "契約を検査し、式から推論した型を使う",
      },
      {
        title: "as const と satisfies を重ねる",
        lead: "オブジェクトのキーと値を特定のリテラル型として保ちたい場合は、値の後ろへas constを付けます。その結果へsatisfiesを続けると、細かな型を保ちながら契約も検査できます。as constは実行時にオブジェクトを凍らせる処理ではありません。",
        points: [
          "書く順は 値 as const satisfies 形",
          "satisfies の右は、満たしてほしい契約",
          "実行時の値は変わらない。全部消えるラベル",
        ],
        talk: [
          { speaker: "beginner", text: "値を固定することと、辞書の形を検査することは一度にできますか？" },
          { speaker: "engineer", text: "できます。先にas constでリテラルとして保ち、その結果が契約を満たすかsatisfiesで確かめます。" },
          { speaker: "beginner", text: "固定と聞くと、実行中に書き換え不能になる処理が追加されそうです。" },
          { speaker: "engineer", text: "ここでの固定は型検査上の扱いです。実行時に凍結する処理ではありません。順番を逆にして広い注釈を先に付けると、細かな型を失いやすい点にも気をつけてください。" },
        ],
        diagram: "annotate",
        code: `const status = {
  ok: "ok",
  ng: "ng",
} as const satisfies { ok: string; ng: string };`,
      },
      {
        title: "as は検査を飛ばす",
        lead: "value as User は「User だと思え」です。形が足りなくても通ります。satisfies は足りないと赤線です。JSON.parse の結果など、本当に不明な値には unknown と絞り込みを使い、日常のオブジェクトリテラルには satisfies を使います。",
        points: [
          "as は非常口。satisfies は通常の検査",
          "as any は TS を書いていないのと同じ",
        ],
        talk: [
          { speaker: "beginner", text: "文字の「1」をnumberだと言い切れば、足し算でも数として動きますか？" },
          { speaker: "engineer", text: "いいえ。asは検査係への申告で、実行中の文字列を数値へ変換しません。" },
          { speaker: "beginner", text: "二段階でアサーションできるなら、安全確認も二重になるのかと思いました。" },
          { speaker: "engineer", text: "むしろ検査を強引に通す非常口です。外部データはunknownで受けて実際の値を確認し、普通のオブジェクトはsatisfiesで不足を検査するのが安全です。" },
        ],
        diagram: "unknown",
        code: `const n = "1" as unknown as number; // 実行時は文字列のまま`,
        watch: "アサーションは実行時の変換ではありません。",
      },
      {
        title: "この講義の要点",
        lead: "注釈は変数を契約の型として扱う。satisfiesは契約を検査し、式から推論した型を使う。細かなリテラル型も保つならas constと組み合わせる。asによる強制は最後の手段です。",
        points: ["設定オブジェクトは satisfies", "as は最後の手段"],
        talk: [
          { speaker: "beginner", text: "値の詳しい型を残して形だけ確かめたいならsatisfies、型の見方を強制するasは最後の手段ですね。" },
          { speaker: "engineer", text: "よく整理できています。ただしsatisfiesも実行時に値を検証したり、as constが値を凍結したりする機能ではありません。" },
          { speaker: "beginner", text: "つまり、どれも検査時の役割を選ぶもので、実際の変換処理とは分けて考えます。" },
          { speaker: "engineer", text: "その区別が大切です。次はユニオンへ進み、値の候補を型でどう表すか見ていきましょう。" },
        ],
        diagram: "shape",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "型注釈したあとの config.url の型を選んでください。",
        lead:
          "configを`{ url: string; retry: number }`として注釈し、urlに`/api`を入れた場面です。変数が契約の型としてどう扱われるか確認します。",
        kind: "choice",
        options: [
          "任意の文字列を許す型",
          '"/api"',
          "number",
          "unknown",
        ],
        steps: [
          "urlへ書いた型注釈を確認する",
          "実際の値と、変数を扱うときの型を区別する",
          "config.urlの型を1つ選ぶ",
        ],
        hint:
          "広い型注釈は、個別の文字列リテラルより広い型として値を扱うことがあります。",
        answer: "任意の文字列を許す型",
        explain:
          "url: stringという注釈により、config.urlは任意の文字列を許すstringとして扱われます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "urlが「/api」、retryが3のapiConfigを作り、指定された形を満たすかsatisfiesで検査してください。",
        lead:
          "通常の型注釈ではなく、完成したオブジェクトがurlはstring、retryはnumberという契約を満たすか検査します。表示は不要です。",
        kind: "code",
        starter: "// apiConfig の値を定義し、契約を検査する\n",
        fileName: "script.ts",
        steps: [
          "apiConfigにurlとretryを設定する",
          "完成した値の直後へ適合検査を加える",
          "urlとretryの型を指定した契約で検査を通す",
        ],
        hint:
          "オブジェクトを先に作り、その直後にsatisfiesと必要な2項目の型を続けます。",
        sample: "",
        answer:
          'const apiConfig = { url: "/api", retry: 3 } satisfies { url: string; retry: number }',
        explain:
          "satisfiesは契約への適合を検査し、変数には左側の式から推論した型を使います。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "2つの画面パスをリテラルのまま保つ routes を作ってください。",
        lead:
          "home と settings のパスを固定しつつ、必要な2項目が文字列である契約も確認します。画面への表示は不要で、型検査が通れば完成です。",
        kind: "code",
        starter: "// routes をここで定義する\n",
        fileName: "script.ts",
        steps: [
          "home に `/`、settings に `/settings` を設定する",
          "キーと値をリテラルとして保つ指定を値に加える",
          "その結果がhomeとsettingsを持つ契約を満たすか検査する",
        ],
        hint:
          "値を固定する指定を先に置き、契約への適合検査を後ろへ続けます。",
        sample: "",
        answer: `const routes = {
  home: "/",
  settings: "/settings",
} as const satisfies { home: string; settings: string };`,
        explain:
          "as const がパスのリテラル型を保ち、satisfies が辞書の契約を検査します。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "APIから届いた数量の文字列「1」を数値へ二段階アサーションした結果を選んでください。",
        lead:
          "数量を number と言い切っても、本当に数値へ変換されなければ合計計算の事故につながります。unknown 経由の申告が、実行時の値を変えるか判断してください。",
        kind: "choice",
        options: [
          "実行時の値は文字列のまま",
          "実行時の値が数値へ変換される",
          "実行時に型が違うため例外になる",
          "実行時にも型の適合検査が行われる",
        ],
        steps: [
          "型アサーションが生成する実行時処理を考える",
          "型検査上の申告と値の変換を区別する",
          "実際に保持される値の説明を選ぶ",
        ],
        hint:
          "アサーションは JavaScript の変換関数ではなく、検査係への申告です。",
        answer: "実行時の値は文字列のまま",
        explain:
          "as は実行時の値を変えません。二段階にしても安全確認は追加されません。",
      },
    ],
  },
];
