import type { Lesson } from "@/lib/course/types";

export const nodeStart: Lesson[] = [
  {
    id: "node-runtime",
    track: "node",
    level: "start",
    chapter: "node-runtime",
    order: 1,
    title: "Node はブラウザの外で動く JS",
    summary: "同じ言語、違うホスト。window は無い",
    minutes: 12,
    slides: [
      {
        title: "変数や関数の書き方は同じ",
        lead: "ブラウザで動くJavaScriptも、Node.jsで動くJavaScriptも、変数・条件分岐・関数などの言語の決まりは同じです。Node.jsは別のプログラミング言語ではありません。まず、これまでのJavaScript文法をそのまま使えると整理します。",
        talk: [
          { speaker: "beginner", text: "Node.jsを始めるには、新しい言語の文法を最初から覚え直しますか？" },
          { speaker: "engineer", text: "いいえ。let、const、if、functionなどは同じJavaScriptの文法です。" },
          { speaker: "beginner", text: "ブラウザで書いた計算用の関数も、そのまま使えますか？" },
          { speaker: "engineer", text: "言語だけで完結する関数なら使えます。実行場所が提供する機能の違いは、次の一枚で分けて見ます。" },
        ],
        points: [
          "Node.jsでもJavaScriptの変数・関数・配列を使う",
          "新しく学ぶ中心は、Node.jsが追加で提供する機能",
        ],
        diagram: "node-vs-browser",
        code: `const double = (n) => n * 2;
console.log(double(3)); // ブラウザでもNode.jsでも6`,
      },
      {
        title: "実行場所によって、使える機能が違う",
        lead: "JavaScriptを動かす場所は、言語に追加の機能を渡します。ブラウザはWebページを表すdocumentを、Node.jsはファイル操作などを提供します。この実行場所が提供する機能をホストAPIと呼びます。",
        talk: [
          { speaker: "beginner", text: "JavaScriptなら、Node.jsでもdocumentで画面を触れますか？" },
          { speaker: "engineer", text: "Node.jsにはWebページがないため、documentは提供されません。" },
          { speaker: "beginner", text: "documentでエラーになったら、JavaScriptの文法が間違っているのですか？" },
          { speaker: "engineer", text: "文法ではなく、実行場所にそのAPIがない可能性があります。言語の機能と、場所が提供する機能を分けて調べます。" },
        ],
        points: [
          "ブラウザ: documentなど、Webページを扱うAPI",
          "Node.js: ファイル・ネットワーク・プロセスを扱うAPI",
          "API: 目的の操作を呼び出すために用意された機能",
        ],
        diagram: "node-vs-browser",
        code: `document.body; // ブラウザにはある。Node.jsにはない
console.log("hello"); // どちらでも使える`,
        watch: "最初からNode.jsのモジュール名を暗記せず、まず「その機能を誰が提供するか」を区別します。",
      },
      {
        title: "何のために使うか",
        lead: "CLI、API サーバー、ビルドツール、定期バッチ、Electron のメインプロセス。共通点は「ページの中」ではなく「マシンの上」で動くことです。stdin / ファイル / ポートを扱えます。",
        talk: [
          { speaker: "beginner", text: "画面を作らないJavaScriptは、何に使うのですか？" },
          { speaker: "engineer", text: "コマンド、サーバー、ビルド、定期処理などをマシン上で動かします。" },
          { speaker: "beginner", text: "最初からExpressの使い方だけ覚えれば十分ですか？" },
          { speaker: "engineer", text: "先にstdin、ファイル、ポート、プロセスを知ると、フレームワークの裏で何が起きたか判断できます。" },
        ],
        points: [
          "npm で配られるツールの多くは Node で書かれている",
          "サーバーはリクエストを受け、ファイルや DB に触れる",
          "同じマシンで複数プロセスを立てられる",
        ],
        diagram: "node-vs-browser",
        note: "この講座は仕組みです。フレームワーク（Express 等）の前に、ランタイムそのものを見ます。",
      },
      {
        title: "バージョンは LTS を基準にする",
        lead: "node -v で今の実行ファイルの版が出ます。言語機能（トップレベル await など）は版で違います。チームでは LTS（長期サポート）に揃えるのが安全です。npx は、その場の Node でパッケージの bin を走らせます。",
        talk: [
          { speaker: "beginner", text: "同じコードなのに、自分のPCだけ動かないのはなぜですか？" },
          { speaker: "engineer", text: "まず実際に使われたNodeの版を確認してください。" },
          { speaker: "beginner", text: "新しい版なら、チームと違っても問題ないですよね？" },
          { speaker: "engineer", text: "版によって使える構文やAPIが違います。表示されたv付き番号を比べ、チームではLTSとenginesの指定に揃えます。" },
        ],
        points: [
          "どの Node で走ったかが、動くコードを決める",
          "engines フィールドは「想定版」の宣言",
        ],
        diagram: "node-cli",
        code: `node -v
which node`,
      },
      {
        title: "グローバルは window ではなく globalThis",
        lead: "ブラウザでは window がグローバルオブジェクトです。Node では歴史的に global があり、今は標準の globalThis が共通です。console と setTimeout は両方にあります。alert はブラウザ専用です。",
        talk: [
          { speaker: "beginner", text: "Nodeでwindowに値を置けば、どこからでも読めますか？" },
          { speaker: "engineer", text: "Nodeにはwindowがないので、共通の入口にはglobalThisを使います。" },
          { speaker: "beginner", text: "consoleが動くなら、alertも共通だと思っていました。" },
          { speaker: "engineer", text: "consoleやタイマーは両方にありますが、alertはブラウザ側です。名前ごとに提供元を確かめましょう。" },
        ],
        points: [
          "globalThis.console はどちらでも使える入口",
          "window を前提にしたライブラリは Node で落ちる",
        ],
        diagram: "node-vs-browser",
      },
      {
        title: "この講義の要点",
        lead: "言語は JS。ホストがファイルとネット。DOM は無い。版を揃える。次は実行の仕方です。",
        talk: [
          { speaker: "beginner", text: "Nodeを学ぶときは、別のJavaScriptを覚える感覚ですか？" },
          { speaker: "engineer", text: "言語は同じで、ホストが渡す機能を追加で学ぶ感覚です。" },
          { speaker: "beginner", text: "動かなければ、すぐコードを書き直せばよいですか？" },
          { speaker: "engineer", text: "先にAPIがその環境にあるか、実行中の版が揃っているかを確認すると原因を絞れます。" },
        ],
        points: ["動かないときは「無い API」を疑う", "LTS を基準にする"],
        diagram: "node-vs-browser",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "ブラウザとNode.jsの両方で同じように使えるJavaScriptの言語機能を1つ選んでください。",
        lead:
          "実行場所が追加するAPIではなく、JavaScriptそのものの基本的な書き方を選びます。",
        kind: "choice",
        options: ["functionによる関数定義", "document.body", "window.alert", "location.href"],
        answer: "functionによる関数定義",
        steps: [
          "JavaScriptの文法と、ブラウザが提供するAPIを分ける",
          "実行場所によらない言語機能を選ぶ",
        ],
        hint:
          "Webページやブラウザ画面を表す名前ではないものを探します。",
        explain:
          "変数・条件分岐・関数などのJavaScript文法は、ブラウザとNode.jsで共通です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "Node.jsで実行すると、提供されていないため問題になる行を1つ選んでください。",
        lead:
          "JavaScriptの文法エラーではなく、ブラウザだけが提供するWebページ操作のAPIを見分けます。",
        kind: "choice",
        options: [
          "documentによるページ操作",
          "constによる変数宣言",
          "functionによる関数定義",
          "consoleによる文字表示",
        ],
        answer: "documentによるページ操作",
        steps: [
          "各行がJavaScriptの言語だけで動くか確認する",
          "Webページを必要とするAPIを選ぶ",
        ],
        hint: "Node.jsにはWebページを表すDOMがありません。",
        explain: "documentはブラウザが提供するDOM APIです。Node.jsには標準では存在しません。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "社内用コマンドと、ブラウザからの要求に応答するAPIをJavaScriptで作ります。Node.jsの利用場面として適切な組み合わせを1つ選んでください。",
        lead:
          "どちらもWebページ内のDOMを操作する仕事ではなく、ターミナルやサーバーマシン上で動く処理です。2つの用途をともに実現できる選択肢を選びます。",
        kind: "choice",
        options: [
          "CLI と API サーバー",
          "ブラウザの DOM 操作だけ",
          "Excel のマクロだけ",
          "CSS のレイアウトだけ",
        ],
        answer: "CLI と API サーバー",
        steps: [
          "各候補がJavaScriptの実行環境を必要とする仕事か確認する",
          "Node.jsが広く使われる、画面外の用途を含む組み合わせを選ぶ",
        ],
        hint:
          "Webページの見た目だけを整える用途ではなく、コマンド処理や通信の受付に注目してください。",
        explain:
          "CLI や API サーバーなど、ページの外でマシンの上の仕事をします。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "ターミナルで、現在使われているNode.jsランタイムのバージョンを確認してください。",
        lead:
          "使える言語機能やAPIはランタイムの版によって変わります。実行ファイルそのものに版情報を問い合わせ、vで始まる番号が表示されれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "ランタイム自身のバージョン情報を表示する操作を入力する",
          "出力がvで始まるバージョン番号になっているか確認する",
        ],
        hint:
          "パッケージの版ではなく、JavaScriptを実行している本体の版を問い合わせます。",
        aliases: ["node --version"],
        termOutput: [{ text: "v22.21.0", tone: "out" }],
        answer: "node -v",
        explain:
          "node -v が今の実行ファイルの版です。学習では LTS に揃えます。",
      },
      {
        id: "q5",
        slide: 4,
        prompt:
          "ブラウザとNode.jsの両方で使える、グローバルオブジェクトへの標準の入口を1つ選んでください。",
        lead:
          "ブラウザ固有の入口はNode.jsには存在しません。実行環境に依存せず、現在のグローバル領域を参照できる標準名を選びます。",
        kind: "choice",
        options: ["globalThis", "document", "alert", "location"],
        answer: "globalThis",
        steps: [
          "ブラウザ専用のAPIを候補から除外する",
          "複数のJavaScript実行環境で共通して使える入口を選ぶ",
        ],
        hint:
          "特定のWebページや現在地を表す名前ではなく、標準化されたグローバル参照を探してください。",
        explain: "Node に window は無く、共通の入口は globalThis です。",
      },
    ],
  },
  {
    id: "node-cli",
    track: "node",
    level: "start",
    chapter: "node-runtime",
    order: 2,
    title: "node コマンドでファイルを実行する",
    summary: "REPL とスクリプト、終了コード",
    minutes: 12,
    slides: [
      {
        title: "REPL は対話、ファイルは一括",
        lead: "引数なしの node は REPL です。1行ずつ評価し、結果をその場で見ます。node app.js はそのファイルを上から実行し、待ち（サーバーやタイマー）が無ければプロセスが終わります。",
        talk: [
          { speaker: "beginner", text: "少しだけ式を試すたびに、ファイルを作る必要がありますか？" },
          { speaker: "engineer", text: "短い確認はREPL、まとまった処理はファイル実行が向いています。" },
          { speaker: "beginner", text: "ファイルの最後に式を書けば、REPLのように結果が出ますか？" },
          { speaker: "engineer", text: "ファイルでは自動表示されません。必要な値はconsole.logで出し、REPLは終了操作で抜けます。" },
        ],
        points: [
          "学習の確認は REPL、成果物はファイル",
          "Ctrl+C 二回、または .exit で REPL を抜ける",
          "ファイル内の最後の式は、REPL と違って自動表示されない。console.log が必要",
        ],
        diagram: "node-cli",
        code: `node
> 1 + 1
2
> .exit

node app.js`,
      },
      {
        title: "カレントディレクトリが相対パスの基準",
        lead: "node ./src/app.js の相対パスは、多くの場合「いまシェルがいる場所」が基準です。ファイルの場所ではありません。間違ったディレクトリで走らせると、設定ファイルが見つからない事故になります。",
        talk: [
          { speaker: "beginner", text: "app.jsの隣に設定ファイルがあるのに、見つからないと言われました。" },
          { speaker: "engineer", text: "相対パスは、まずシェルの現在地を基準に疑ってください。" },
          { speaker: "beginner", text: "実行するファイルの場所が、いつも基準ではないのですか？" },
          { speaker: "engineer", text: "実行場所とモジュール自身の場所は別です。現在地を表示し、package.jsonのある場所から動かしたか確認します。" },
        ],
        points: [
          "pwd で今どこにいるかを見る",
          "npm scripts は package.json のあるディレクトリを基準にしやすい",
        ],
        diagram: "node-cli",
        watch:
          "相対パスの基準は「実行した場所」と「モジュールの URL」で別です。後の path 講義で切り分けます。",
      },
      {
        title: "終了コード 0 が成功",
        lead: "プロセスが終わるとき、OS に小さな整数を返します。0 は成功、それ以外は失敗、という慣習です。シェルの $? で見られます。未捕捉の例外は 1 になりがちです。",
        talk: [
          { speaker: "beginner", text: "画面にエラー文がなければ、コマンドは成功ですか？" },
          { speaker: "engineer", text: "自動化では終了コードが0かどうかで判断します。" },
          { speaker: "beginner", text: "失敗時はすぐ強制終了すれば確実ですよね？" },
          { speaker: "engineer", text: "非0を返すのは大切ですが、急なexitは未出力のログを失うことがあります。片付け後に終了状態を伝えます。" },
        ],
        points: [
          "process.exit(1) は明示的な失敗",
          "exit を急ぐと、まだ書いていないログが消えることがある",
        ],
        diagram: "node-error",
        code: `process.exitCode = 1;
// または
process.exit(1);`,
      },
      {
        title: "標準入出力は3本",
        lead: "stdout が通常の出力、stderr が診断、stdin が入力です。console.log は stdout、console.error は stderr へ行きます。パイプで次のコマンドに渡せるのは主に stdout です。",
        talk: [
          { speaker: "beginner", text: "結果も警告もconsole.logに出してはいけませんか？" },
          { speaker: "engineer", text: "結果はstdout、診断はstderrに分けると扱いやすくなります。" },
          { speaker: "beginner", text: "人が読めれば、どちらに出ても同じに見えます。" },
          { speaker: "engineer", text: "パイプやCIは出力先を区別します。入力はstdin、通常結果はlog、警告はerrorという役割で考えましょう。" },
        ],
        points: [
          "ログと結果を分けたいなら error に診断を出す",
          "CI は終了コードと stderr を見る",
        ],
        diagram: "node-cli",
        code: `console.log("結果");
console.error("警告");`,
      },
      {
        title: "この講義の要点",
        lead: "REPL は対話、ファイルは一括。相対パスは実行場所。0 が成功。stdout/stderr を分ける。次はモジュールです。",
        talk: [
          { speaker: "beginner", text: "ターミナルでNodeを使うとき、最初に見るものは何ですか？" },
          { speaker: "engineer", text: "実行方法、現在地、出力、終了コードの順で確認すると整理できます。" },
          { speaker: "beginner", text: "何も表示されないなら、処理も走っていないのでしょうか？" },
          { speaker: "engineer", text: "ファイルの式は自動表示されません。必要なログを書き、成功か失敗かは終了コードでも確かめます。" },
        ],
        points: ["見えないなら log を書く", "失敗は 0 以外"],
        diagram: "node-cli",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "ターミナルから、現在の作業ディレクトリにあるapp.jsをNode.jsで一括実行してください。",
        lead:
          "対話モードではなく、指定したスクリプトファイルを先頭から実行します。実行後にhelloと表示され、待機する処理がなければ終了することが達成条件です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "JavaScriptランタイムに対象ファイルを渡して実行する",
          "出力がhelloの1行になっているか確認する",
        ],
        hint:
          "対話モードを開始するのではなく、実行対象のファイル名をランタイムへ渡します。",
        termOutput: [{ text: "hello", tone: "out" }],
        answer: "node app.js",
        aliases: ["node ./app.js"],
        explain:
          "引数なしの node は REPL、node app.js はファイルの一括実行です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "ターミナルで、シェルの現在の作業ディレクトリを表示してください。",
        lead:
          "相対パスの基準を確かめるため、現在地を問い合わせます。出力が絶対パス /home/app になれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "シェルの現在地を表示する操作を入力する",
          "出力が /home/app になっているか確認する",
        ],
        hint:
          "ファイル一覧ではなく、working directoryそのものを表示する標準的な操作を使います。",
        termOutput: [{ text: "/home/app", tone: "out" }],
        answer: "pwd",
        explain: "相対パスは、多くの場合いまシェルがいる場所が基準です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "データ変換CLIが全ファイルを処理し終えました。CIへ成功を伝えるため、プロセスがOSへ返す終了コードを1つ選んでください。",
        lead:
          "入力ファイルの読み取りも出力ファイルの作成も完了しており、エラーはありません。HTTPステータスではなく、コマンドの正常終了を表す慣習上の値を選びます。",
        kind: "choice",
        options: ["0", "1", "-1", "255"],
        answer: "0",
        steps: [
          "終了コードがHTTPステータスなどとは別物だと確認する",
          "正常終了を表す慣習上の値を選ぶ",
        ],
        hint:
          "成功時はエラー番号を持たない、という考え方に対応する最小の非負整数です。",
        explain: "終了コード 0 が成功、それ以外は失敗という慣習です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "app.jsから通常の標準出力へ「結果」と1行だけ表示してください。",
        lead:
          "通常の処理結果は標準出力、警告や診断は標準エラー出力へ分けます。今回は診断用の出力を使わず、指定された文字列がsampleと同じ1行になるようにします。",
        kind: "code",
        starter: "// console.log は stdout\n",
        fileName: "app.js",
        cwd: "app",
        steps: [
          "通常のログ出力を使って指定された文字列を出す",
          "標準エラー出力ではなく、sampleと同じ1行になるか確認する",
        ],
        hint:
          "consoleには通常結果用と診断用の出力方法があります。今回は通常結果用を選びます。",
        sample: "結果",
        answer: 'console.log("結果")',
        explain: "console.log は stdout、診断は stderr へ分けます。",
      },
    ],
  },
  {
    id: "node-modules",
    track: "node",
    level: "start",
    chapter: "node-runtime",
    order: 3,
    title: "CJS と ESM は読み込み方が違う",
    summary: "require と import、__dirname の有無",
    minutes: 14,
    slides: [
      {
        title: "ファイルがモジュール、公開面だけ外へ",
        lead: "Node ではファイルが部屋です。外に出すものは module.exports か export。取り込むのは require か import。同じファイルを何度 import しても、評価はプロセス内で一度、というキャッシュがあります。",
        talk: [
          { speaker: "beginner", text: "別ファイルの関数は、名前さえ分かれば呼べますか？" },
          { speaker: "engineer", text: "外へ公開し、読み込み側で取り込んだものだけ使えます。" },
          { speaker: "beginner", text: "何度importしたら、そのたびに初期化も走りますよね？" },
          { speaker: "engineer", text: "通常はプロセス内で一度評価されてキャッシュされます。副作用や循環参照があると、この順序が問題になります。" },
        ],
        points: [
          "循環参照は未初期化の export で死にやすい",
          "副作用だけの読み込みは追いにくい",
        ],
        diagram: "node-cjs-esm",
        code: `// ESM
export function add(a, b) {
  return a + b;
}
import { add } from "./math.js";`,
      },
      {
        title: "CommonJS は require / module.exports",
        lead: "長いあいだ Node の既定でした。require は同期でファイルを読み、module.exports が戻り値です。__dirname と __filename がそのファイルの場所です。今も大量のパッケージが CJS です。",
        talk: [
          { speaker: "beginner", text: "古いパッケージのrequireは、もう書き換えないと動きませんか？" },
          { speaker: "engineer", text: "CommonJSは今も多く使われ、requireとmodule.exportsで動きます。" },
          { speaker: "beginner", text: "exportsへ代入すれば、いつでも丸ごと公開できますか？" },
          { speaker: "engineer", text: "プロパティ追加とmodule.exports自体の置換は意味が違います。ファイル位置には__dirnameも使えます。" },
        ],
        points: [
          "exports.foo = は module.exports のプロパティ",
          "module.exports = fn で丸ごと置き換えられる",
          "require のパス解決は node_modules を上へ探索する",
        ],
        diagram: "node-cjs-esm",
        code: `const fs = require("fs");
module.exports = { ping: () => "ok" };`,
      },
      {
        title: "ESM は import、既定になりつつある",
        lead: 'package.json の "type": "module" か、拡張子 .mjs で ESM になります。import は静的解析向き。__dirname は無く、import.meta.url から作ります。トップレベル await が使えます。',
        talk: [
          { speaker: "beginner", text: "importを書いたのに、モジュールとして扱われないのはなぜですか？" },
          { speaker: "engineer", text: "package.jsonのtypeか拡張子で、ESMだとNodeへ伝える必要があります。" },
          { speaker: "beginner", text: "CommonJSの__dirnameも、そのまま使えますよね？" },
          { speaker: "engineer", text: "ESMにはありません。import.meta.urlから作り、拡張子やCJSとの境界も明示的に扱います。" },
        ],
        points: [
          "拡張子を書く必要が CJS より厳しいことが多い",
          "node:fs のように node: プレフィックスが推奨",
        ],
        diagram: "node-cjs-esm",
        code: `import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));`,
        watch:
          "CJS から ESM を require できない組み合わせがあります。境界ではどちらかに寄せます。",
      },
      {
        title: "node_modules は名前で解決される",
        lead: 'import "pg" は相対パスではなく、近い node_modules/pg を探します。入れ子の依存もそれぞれ自分の版を持てます。これが「同じライブラリが二重になる」理由です。',
        talk: [
          { speaker: "beginner", text: "importの先頭に記号がないと、どこを探すのですか？" },
          { speaker: "engineer", text: "パッケージ名として近くのnode_modulesを探索します。" },
          { speaker: "beginner", text: "同じ名前なら、プロジェクト全体で必ず一つの版ですよね？" },
          { speaker: "engineer", text: "依存ごとに別の版が入れ子になることがあります。自作ファイルは相対指定にして区別します。" },
        ],
        points: [
          "自分のコードは ./ か ../ で始める",
          "パッケージ名は node_modules 探索",
        ],
        diagram: "node-npm",
      },
      {
        title: "この講義の要点",
        lead: "CJS は require と __dirname。ESM は import と import.meta.url。キャッシュは一度。次は process です。",
        talk: [
          { speaker: "beginner", text: "読み込みエラーでは、まず何を確認すればよいですか？" },
          { speaker: "engineer", text: "そのプロジェクトがCommonJSかESMかを先に確認します。" },
          { speaker: "beginner", text: "形式が混ざっていても、Nodeが自動で合わせてくれますか？" },
          { speaker: "engineer", text: "組み合わせによっては読み込めません。組み込みはnode:で明示し、境界は一方の形式へ寄せます。" },
        ],
        points: [
          "プロジェクトの type を先に確認する",
          "組み込みは node: を付ける",
        ],
        diagram: "node-cjs-esm",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "料金計算を共通化するため、math.jsのadd関数をcheckout.jsから名前付きimportできるようにします。math.js側に置く宣言を1つ選んでください。",
        lead:
          "現在のadd関数はmath.jsの中だけで使える状態です。関数名と処理は変えず、ES Modulesとして外部へ公開し、checkout.jsから同じ名前で取り込める形にします。",
        kind: "choice",
        options: [
          "export function add(a, b) { return a + b; }",
          "public function add(a, b) { return a + b; }",
          "expose function add(a, b) { return a + b; }",
          "global function add(a, b) { return a + b; }",
        ],
        answer: "export function add(a, b) { return a + b; }",
        steps: [
          "関数定義だけの候補と、外部へ公開する候補を区別する",
          "ES Modulesの名前付き公開に使う宣言を選ぶ",
        ],
        hint:
          "CommonJSやブラウザのグローバルではなく、ES Modulesの公開を表すキーワードに注目します。",
        explain:
          "ESMではexportした名前だけを、別ファイルから名前付きimportできます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "古いCommonJS製の設定モジュールから、接続設定を別ファイルへ公開します。読み込み側が受け取る値を設定するものを1つ選んでください。",
        lead:
          "現在の設定値はモジュール内にあるだけで、requireした側へ返す公開値が未設定です。ES Modulesやブラウザの仕組みではなく、CommonJSのモジュールが外へ返す場所を選びます。",
        kind: "choice",
        options: [
          "module.exports",
          "import.meta.url",
          "window.exports",
          "document.exports",
        ],
        answer: "module.exports",
        steps: [
          "CommonJSとES Modulesの仕組みを区別する",
          "読み込み元へ返される公開値を表す候補を選ぶ",
        ],
        hint:
          "モジュール本体が持つ、外部公開専用のプロパティに注目してください。",
        explain: "CJS は require で読み、module.exports が戻り値です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "ES Modulesで書いた設定ローダーから、Node.js標準のファイルAPIを読み込みます。外部パッケージと区別できる推奨モジュール指定を1つ選んでください。",
        lead:
          "config.jsonを読むための機能はNode.jsに組み込まれており、追加インストールは不要です。ローカルのJavaScriptファイルやブラウザAPIではなく、組み込み機能だと明示できる指定を選びます。",
        kind: "choice",
        options: ["node:fs", "fs.js", "document", "require"],
        answer: "node:fs",
        steps: [
          "Node.jsの組み込み機能と外部ファイル名を区別する",
          "標準機能だと明示できる指定を選ぶ",
        ],
        hint:
          "ファイルAPIの短い名前に、Node.js標準であることを示す接頭辞が付いた候補です。",
        explain:
          "ESM では import を使い、組み込みは node: を付けるのが推奨です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "invoice.jsから、同じディレクトリに置かれたmath.jsを読み込みます。ローカルファイルを指す相対指定を1つ選んでください。",
        lead:
          "対象はnode_modules内のパッケージでもNode.jsの組み込み機能でもありません。現在のモジュール位置を基準にmath.jsへ到達し、拡張子まで含めて指定します。",
        kind: "choice",
        options: ["./math.js", "math.js", "node:math", "npm:math"],
        answer: "./math.js",
        steps: [
          "パッケージ名とローカルファイルの指定を区別する",
          "現在のディレクトリを基準にmath.jsを指す候補を選ぶ",
        ],
        hint:
          "現在位置を表す記号から始まり、対象の拡張子まで含む候補です。",
        explain:
          "自分のコードは ./ か ../ で始め、パッケージ名は node_modules 探索です。",
      },
    ],
  },
  {
    id: "node-process",
    track: "node",
    level: "start",
    chapter: "node-runtime",
    order: 4,
    title: "process は今のプロセスそのもの",
    summary: "argv、env、cwd、シグナル",
    minutes: 13,
    slides: [
      {
        title: "argv は起動時の言葉の列",
        lead: "process.argv は文字列の配列です。[0] が node のパス、[1] がスクリプト、[2] 以降があなたが付けた引数です。CLI の材料になります。パースは自分でするか、util.parseArgs やライブラリに任せます。",
        talk: [
          { speaker: "beginner", text: "コマンドの後ろに書いた値は、どこから読めますか？" },
          { speaker: "engineer", text: "process.argvの3要素目以降がユーザーの引数です。" },
          { speaker: "beginner", text: "数字を渡せば、配列にも数値で入りますよね？" },
          { speaker: "engineer", text: "すべて文字列です。シェルが引用符を処理した後に届くので、型変換や引数解析が必要です。" },
        ],
        points: [
          "数値も文字列で入る。必要なら Number する",
          "引用符の扱いはシェルが先に決める",
        ],
        diagram: "node-process",
        code: `// node app.js --port 3000
process.argv;
// [node, app.js, --port, 3000]`,
      },
      {
        title: "env は環境変数の辞書",
        lead: "process.env.NODE_ENV のように、OS から渡された名前付きの値です。秘密（API キー）はコードに書かず、環境変数や .env（dotenv）に置きます。.env を git に入れないのが原則です。",
        talk: [
          { speaker: "beginner", text: "APIキーをソースに書かず、どうやってNodeへ渡しますか？" },
          { speaker: "engineer", text: "環境変数として渡し、process.envから読みます。" },
          { speaker: "beginner", text: "設定確認のため、env全体をログに出してもよいですか？" },
          { speaker: "engineer", text: "秘密まで漏れるので危険です。必要なキーだけを確認し、値は文字列か未定義だと覚えてください。" },
        ],
        points: [
          "無いキーは undefined。空文字と混同しない",
          '全部文字列。true も "true"',
        ],
        diagram: "node-process",
        code: `const port = Number(process.env.PORT ?? 3000);`,
        watch:
          "本番の秘密をログに出さない。console.log(process.env) は危険です。",
      },
      {
        title: "cwd は作業ディレクトリ",
        lead: 'process.cwd() は「このプロセスが今いるディレクトリ」です。相対パスの fs.readFile("./x") の基準になります。process.chdir で変えられますが、グローバルに効くので慎重にします。',
        talk: [
          { speaker: "beginner", text: "process.cwd()は、実行中のJavaScriptファイルの場所ですか？" },
          { speaker: "engineer", text: "いいえ、プロセスの現在の作業ディレクトリです。" },
          { speaker: "beginner", text: "テスト中だけchdirで合わせれば、どこでも安定しますよね？" },
          { speaker: "engineer", text: "変更はプロセス全体へ効きます。相対ファイル操作の基準とモジュール位置を混同しない設計が安全です。" },
        ],
        points: [
          "モジュールの場所（import.meta.url）とは別",
          "テストで cwd に依存すると壊れやすい",
        ],
        diagram: "node-process",
      },
      {
        title: "シグナルと終了",
        lead: 'Ctrl+C は SIGINT です。サーバーは listen したまま生きるので、シグナルで閉じ、接続を落とし、exit します。process.on("SIGINT", ...) で片付けを書けます。',
        talk: [
          { speaker: "beginner", text: "サーバーでCtrl+Cを押すと、何がNodeへ届くのですか？" },
          { speaker: "engineer", text: "割り込みを表すSIGINTが届きます。" },
          { speaker: "beginner", text: "受け取った瞬間に終了すれば十分ですか？" },
          { speaker: "engineer", text: "接続やファイルを閉じてから終えます。運用ではSIGTERMも使い、OSごとの差にも注意します。" },
        ],
        points: ["kill はデフォルト SIGTERM", "Windows はシグナルの一部が違う"],
        diagram: "node-error",
        code: `process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});`,
      },
      {
        title: "この講義の要点",
        lead: "argv は引数、env は秘密と設定、cwd は相対パスの基準、シグナルは片付け。次はファイル I/O です。",
        talk: [
          { speaker: "beginner", text: "processには、どんな実行情報が集まっていますか？" },
          { speaker: "engineer", text: "起動引数、環境変数、作業場所、終了に関わる情報です。" },
          { speaker: "beginner", text: "どれも普通の値として気軽に書き換えてよいですか？" },
          { speaker: "engineer", text: "envは文字列、cwd変更は全体へ影響し、終了前には片付けが要ります。用途ごとの副作用を意識します。" },
        ],
        points: ["env は文字列", "cwd とファイル位置を混ぜない"],
        diagram: "node-process",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "現在の作業ディレクトリにあるapp.jsへユーザー引数fooを渡し、Node.jsで実行してください。",
        lead:
          "スクリプト名の後ろに利用者から渡す値を置いて起動します。アプリが起動引数からその値を読み、fooの1行を表示すれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "JavaScriptランタイムへ実行対象のファイルを渡す",
          "ファイル名より後ろへユーザー引数を1つ追加する",
          "出力がfooの1行になることを確認する",
        ],
        hint:
          "ランタイムやファイル名の情報ではなく、スクリプトの後ろに置いた値がユーザー引数として届きます。",
        aliases: ["node ./app.js foo"],
        termOutput: [{ text: "foo", tone: "out" }],
        answer: "node app.js foo",
        explain: "0 が node、1 がスクリプト、2 からが付けた引数です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "開発サーバーの待受ポートをprocess.env.PORTから読み、数値へ変換する前の型を確認します。正しいものを1つ選んでください。",
        lead:
          "シェルではPORTに3000が設定されていますが、環境変数はOSから文字の並びとして渡されます。計算やポート指定に使う前の値が、Node.jsでどの型になるかを選びます。",
        kind: "choice",
        options: ["string", "number", "boolean", "bigint"],
        answer: "string",
        steps: [
          "環境変数がシェルから文字の並びとして渡されることを確認する",
          "数値として使う前の型を選ぶ",
        ],
        hint:
          "ポート計算に使う場合は、読み取ったあと明示的な型変換が必要です。",
        explain:
          "envの値は文字列で、未設定ならundefinedです。数値として使うなら変換します。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "Node.jsのプロセスが現在使っている作業ディレクトリを、ターミナルから確認してください。",
        lead:
          "短いJavaScript式をファイルへ保存せず実行し、相対パス解決の基準となる絶対パスが表示されれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "ランタイムに短い式を直接評価させる",
          "現在のプロセスの作業場所を返すAPIを評価する",
          "出力が /home/app になっているか確認する",
        ],
        hint:
          "モジュールの場所ではなく、processが持つ現在地を返す関数を短い式として評価します。",
        aliases: [
          "node -e \"console.log(process.cwd())\"",
          "node -p 'process.cwd()'",
          "node -e 'console.log(process.cwd())'",
        ],
        termOutput: [{ text: "/home/app", tone: "out" }],
        answer: 'node -p "process.cwd()"',
        explain: "cwd は相対パスの基準で、モジュールの場所とは別です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "ローカルの開発サーバーをターミナルで停止し、接続を閉じる処理を始めたい場面です。Ctrl+Cでプロセスへ送られるシグナルを1つ選んでください。",
        lead:
          "サーバーはポートで待機中で、キーボードから割り込み操作を行います。運用環境からの終了要求や強制終了ではなく、この入力に対応するシグナルを選びます。",
        kind: "choice",
        options: ["SIGINT", "SIGTERM", "SIGHUP", "SIGKILL"],
        answer: "SIGINT",
        steps: [
          "Ctrl+Cがキーボードからの割り込み操作だと確認する",
          "割り込みを表すシグナルを選ぶ",
        ],
        hint:
          "シグナル名の末尾が、interruptの略になっている候補です。",
        explain: "SIGINT を受けたら接続を閉じてから終了します。",
      },
    ],
  },
  {
    id: "node-fs",
    track: "node",
    level: "basic",
    chapter: "node-fs",
    order: 5,
    title: "fs はディスクへの窓口",
    summary: "読む・書く。同期と Promise",
    minutes: 14,
    slides: [
      {
        title: "ファイルはバイトの並び",
        lead: 'fs.readFile は中身を取ります。encoding を "utf8" にすると文字列、省略すると Buffer です。存在しないパスは例外（Promise なら reject）です。権限が無いときも失敗します。',
        talk: [
          { speaker: "beginner", text: "readFileの結果が文字列にならないのはなぜですか？" },
          { speaker: "engineer", text: "文字コードを指定しない場合はBufferで返るからです。" },
          { speaker: "beginner", text: "大きなファイルも同じ方法で全部読めば簡単ですよね？" },
          { speaker: "engineer", text: "全体がメモリに載ります。大きい場合はストリームを使い、パス不存在や権限エラーも扱います。" },
        ],
        points: [
          "大きなファイルを全部メモリに載せるのは危ない。ストリームへ",
          "パスは絶対パスか、cwd 基準の相対",
        ],
        diagram: "node-fs",
        code: `import { readFile } from "node:fs/promises";
const text = await readFile("./notes.txt", "utf8");`,
      },
      {
        title: "writeFile は置き換え、appendFile は追記",
        lead: "writeFile はファイル全体をその内容にします。無ければ作ります。appendFile は末尾に足します。同時に複数プロセスが同じファイルを書くと壊れ得ます。",
        talk: [
          { speaker: "beginner", text: "既存ログへ1行足すのにwriteFileを使えますか？" },
          { speaker: "engineer", text: "writeFileは全体を置き換えるので、追記ならappendFileです。" },
          { speaker: "beginner", text: "複数の処理が同時に書いても、順番に保存されますよね？" },
          { speaker: "engineer", text: "競合して壊れる可能性があります。ディレクトリ作成や、一時ファイルからの置換も含めて更新手順を設計します。" },
        ],
        points: [
          "ディレクトリが無いと失敗する。mkdir が先",
          "atomic に更新したいなら一時ファイルへ書いてリネーム",
        ],
        diagram: "node-fs",
        code: `import { writeFile } from "node:fs/promises";
await writeFile("./out.txt", "hello\n", "utf8");`,
      },
      {
        title: "Sync は簡単だがイベントループを止める",
        lead: "readFileSync は終わるまで次の JS が動きません。小さな CLI なら許されがちです。サーバーのリクエスト処理の中で Sync を使うと、他の接続も待たされます。本番の I/O は非同期（Promise か stream）が基本です。",
        talk: [
          { speaker: "beginner", text: "同期APIの方がコードが短いので、サーバーでも使ってよいですか？" },
          { speaker: "engineer", text: "頻繁なリクエスト処理では非同期を基本にします。" },
          { speaker: "beginner", text: "自分の読み込みが動くなら、利用者には影響しませんよね？" },
          { speaker: "engineer", text: "完了までイベントループが止まり、他の接続も待ちます。起動時の小さな設定読み込みとは分けて判断します。" },
        ],
        points: [
          "起動時に一度だけ読む設定ファイルは Sync でも議論の余地がある",
          "ホットパスでは避ける",
        ],
        diagram: "node-libuv",
        watch: "「動く」と「他のリクエストを止めない」は別です。",
      },
      {
        title: "exists より、開いて失敗を扱う",
        lead: "先に exists してから read すると、その隙間で消える競合があります。read して ENOENT を捉える方が素直です。stat はサイズや更新時刻が欲しいときに使います。",
        talk: [
          { speaker: "beginner", text: "読む前に存在確認すれば、ファイルなしの失敗を防げますか？" },
          { speaker: "engineer", text: "確認後に消えることがあるので、読み取りの失敗を直接扱います。" },
          { speaker: "beginner", text: "失敗は全部、ファイルがない扱いでよいですか？" },
          { speaker: "engineer", text: "見つからない場合と権限不足はコードが違います。必要ならstatでサイズや時刻を調べ、想定外は再送出します。" },
        ],
        points: [
          'エラーコード err.code === "ENOENT" が「無い」',
          "EACCES は権限",
        ],
        diagram: "node-fs",
        code: `try {
  await readFile(p, "utf8");
} catch (err) {
  if (err.code === "ENOENT") return null;
  throw err;
}`,
      },
      {
        title: "この講義の要点",
        lead: "utf8 で文字、省略で Buffer。write は置き換え。Sync はループを止める。無いファイルは例外。次は path です。",
        talk: [
          { speaker: "beginner", text: "ファイル操作で最低限決めることは何ですか？" },
          { speaker: "engineer", text: "文字かバイトか、置換か追記か、同期か非同期かを決めます。" },
          { speaker: "beginner", text: "成功する前提で書いて、失敗時はまとめて終了でもよいですか？" },
          { speaker: "engineer", text: "不存在と権限不足などをコードで分けます。サーバーではメモリ量とイベントループ停止にも注意します。" },
        ],
        points: ["サーバーでは Promise / stream", "エラーコードを見る"],
        diagram: "node-fs",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "config.txtをUTF-8の文字列として読む処理になるよう、3つのコード断片を並べてください。",
        lead:
          "Promise版のreadFileを読み込み、完了を待ってtextへ保存します。encodingを省略するとBufferになるため、文字列として受け取る指定も必要です。",
        kind: "order",
        fragments: [
          'console.log(text);',
          'const text = await readFile("./config.txt", "utf8");',
          'import { readFile } from "node:fs/promises";',
        ],
        answer: `import { readFile } from "node:fs/promises";
const text = await readFile("./config.txt", "utf8");
console.log(text);`,
        steps: [
          "最初にreadFileを読み込む",
          "awaitで読み取り完了を待ち、結果をtextへ入れる",
          "最後に読み取った文字列を表示する",
        ],
        hint:
          "機能の読み込み、ファイルの読み取り、結果の利用という順です。",
        explain:
          "readFileへutf8を渡すと、Bufferではなく文字列を受け取れます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "out.txtをhelloという内容へ置き換える処理になるよう、2つのコード断片を並べてください。",
        lead:
          "Promise版のwriteFileを読み込んだあと、書き込み完了を待ちます。今回は追記ではなく、ファイル全体を指定内容にします。",
        kind: "order",
        fragments: [
          'await writeFile("./out.txt", "hello\\n", "utf8");',
          'import { writeFile } from "node:fs/promises";',
        ],
        answer: `import { writeFile } from "node:fs/promises";
await writeFile("./out.txt", "hello\n", "utf8");`,
        steps: [
          "最初にwriteFileを読み込む",
          "次にawaitで書き込み完了を待つ",
        ],
        hint:
          "機能は利用する前に読み込みます。",
        explain:
          "writeFileは通常、ファイル全体を指定内容へ置き換えます。追記にはappendFileを使います。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "サーバーのリクエスト処理で同期的なファイル読み込みを避ける主な理由を1つ選んでください。",
        lead:
          "Node.jsのJavaScript処理は基本的に1本のイベントループで進みます。同期I/Oの完了を待っている間に、別の要求を処理できるかどうかを考えてください。",
        kind: "choice",
        options: [
          "非同期なので他の接続も進む",
          "イベントループを止めて他接続も待つ",
          "文字コード指定だけが無効になる",
          "Windows だけ処理が止まる",
        ],
        steps: [
          "同期処理がイベントループへ与える影響を考える",
          "文法や文字コードではなく、同時処理への影響を説明する候補を選ぶ",
        ],
        hint:
          "同期API自体は実行できます。問題は、完了までJavaScriptの次の仕事へ進めない点です。",
        answer: "イベントループを止めて他接続も待つ",
        explain:
          "同期 I/O は JS スレッドを占有します。本番は Promise か stream です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "任意設定のconfig.local.jsonを読み、ファイルがない場合だけ既定値へ戻します。対象が存在しないときのエラーコードを1つ選んでください。",
        lead:
          "読み取り失敗のうち、ファイル不存在だけは想定内ですが、権限不足などは処理を続けられません。catchしたエラーのcodeを調べ、対象が見つからない場合だけを判別できる候補を選びます。",
        kind: "choice",
        options: ["ENOENT", "EACCES", "EADDRINUSE", "EPERM"],
        answer: "ENOENT",
        steps: [
          "各候補が表す失敗の種類を区別する",
          "パスの対象が存在しない状態に対応するものを選ぶ",
        ],
        hint:
          "英語の「そのような項目がない」という意味に由来するコードです。",
        explain: "先に exists せず、読んで ENOENT を捉える方が素直です。",
      },
    ],
  },
  {
    id: "node-path",
    track: "node",
    level: "basic",
    chapter: "node-fs",
    order: 6,
    title: "path は結合のルール",
    summary: "区切り文字と、ファイル位置と cwd の違い",
    minutes: 12,
    slides: [
      {
        title: "文字列連結でパスを足すと壊れる",
        lead: '"dir" + "/" + name は、すでに / が付いていると二重になり、Windows では区切りが違います。path.join("dir", name) がホストのルールで結合します。path.posix / path.win32 で意図的に一方に固定できます。',
        talk: [
          { speaker: "beginner", text: "フォルダ名とファイル名は、スラッシュで足せば十分ですか？" },
          { speaker: "engineer", text: "通常はpath.joinでOSの規則に沿って結合します。" },
          { speaker: "beginner", text: "自分のMacで動けば、CIでも同じですよね？" },
          { speaker: "engineer", text: "区切りや絶対パスの形が違います。joinの正規化とresolveの絶対化も使い分けます。" },
        ],
        points: [
          "join は .. を正規化することがある",
          "resolve は絶対パスにする",
        ],
        diagram: "node-path",
        code: `import path from "node:path";
path.join("/var", "log", "app.log");`,
      },
      {
        title: "モジュールの隣のファイルは import.meta から",
        lead: "設定を「この JS と同じフォルダの config.json」に置きたいなら、cwd ではなくモジュール URL が基準です。fileURLToPath(import.meta.url) から dirname を取り、join します。",
        talk: [
          { speaker: "beginner", text: "ライブラリ付属の設定は、process.cwd()から探せばよいですか？" },
          { speaker: "engineer", text: "モジュールの隣ならimport.meta.urlを基準にします。" },
          { speaker: "beginner", text: "開発中はcwdでも見つかるので、そのままで平気では？" },
          { speaker: "engineer", text: "呼び出し元の場所が変わると壊れます。URLをファイルパスへ変換し、dirnameとjoinで組み立てます。" },
        ],
        points: [
          "CLI の相対パスは cwd 向き",
          "ライブラリ内部の資産はモジュール向き",
        ],
        diagram: "node-path",
        code: `import { fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const conf = path.join(here, "config.json");`,
      },
      {
        title: "拡張子と名前",
        lead: "path.basename(p) は最後の要素、extname は拡張子、parse は root/dir/base/ext/name に分解します。URL のパスとファイルパスは似て非なるものです。file: URL は pathToFileURL で行き来します。",
        talk: [
          { speaker: "beginner", text: "パスからファイル名だけを取りたいとき、文字列を分割しますか？" },
          { speaker: "engineer", text: "basenameやextname、parseを目的に合わせて使います。" },
          { speaker: "beginner", text: "URLのpathnameも同じ文字列なので、そのまま渡せますよね？" },
          { speaker: "engineer", text: "URLとファイルパスは規則が違います。file URLとの変換には専用関数を使います。" },
        ],
        points: ["Windows のドライブ文字は URL と相性が悪い。変換関数を使う"],
        diagram: "node-path",
      },
      {
        title: "ユーザー入力のパスはディレクトリトラバーサルに注意",
        lead: "join(root, userInput) で userInput が ../../etc/passwd だと、root の外へ出ることがあります。公開ディレクトリに閉じるなら、resolve したあと startsWith(root) を確認します。",
        talk: [
          { speaker: "beginner", text: "利用者が送ったファイル名をrootへ結合すれば、安全ですか？" },
          { speaker: "engineer", text: "親ディレクトリ指定でrootの外へ出られるため、そのまま渡せません。" },
          { speaker: "beginner", text: "危険な文字だけ削除すれば十分でしょうか？" },
          { speaker: "engineer", text: "正規化して絶対化した後、許可した境界内か確認します。信頼できない入力を直接fsへ渡さないでください。" },
        ],
        points: [
          "静的ファイルサーバーの定番バグ",
          "正規化してから境界チェック",
        ],
        diagram: "node-path",
        watch: "信頼できない文字列をそのまま fs に渡さない。",
      },
      {
        title: "この講義の要点",
        lead: "join/resolve を使う。資産はモジュール位置、CLI は cwd。入力パスは外に出さない。次は HTTP です。",
        talk: [
          { speaker: "beginner", text: "パスは結局、文字列として扱えばよいのですか？" },
          { speaker: "engineer", text: "見た目は文字列でも、OSやURLの規則に合う専用APIを使います。" },
          { speaker: "beginner", text: "基準はいつも一つに統一できますか？" },
          { speaker: "engineer", text: "CLI入力はcwd、同梱資産はモジュール位置が自然です。外部入力は正規化後に境界も検証します。" },
        ],
        points: ["+ で繋がない", "URL と path を混ぜない"],
        diagram: "node-path",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "logsフォルダとapp.logからOSに合うパスを作る処理になるよう、2つのコード断片を並べてください。",
        lead:
          "区切り文字を文字列で足さず、Node.jsのpathモジュールを読み込んでjoinを使います。",
        kind: "order",
        fragments: [
          'const logPath = path.join("logs", "app.log");',
          'import path from "node:path";',
        ],
        answer: `import path from "node:path";
const logPath = path.join("logs", "app.log");`,
        steps: [
          "最初にpathモジュールを読み込む",
          "joinへフォルダ名とファイル名を順に渡す",
        ],
        hint:
          "機能を読み込んでから、その機能のjoinメソッドを呼びます。",
        explain: "文字列 + ではなく path.join がホストの区切りで結合します。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "ES Modulesで、ライブラリ自身と同じフォルダにあるconfig.jsonを探す基準として適切なものを1つ選んでください。",
        lead:
          "ライブラリは利用者がどのディレクトリから実行するかを制御できません。同梱した資産はプロセスの現在地ではなく、モジュール自身のURLから位置を求めます。",
        kind: "choice",
        options: [
          "import.meta.url",
          "process.cwd()",
          "process.argv[2]",
          "process.env.HOME",
        ],
        answer: "import.meta.url",
        steps: [
          "呼び出し元が決める作業ディレクトリとモジュール位置を区別する",
          "ES Modulesで現在のファイル位置を表す候補を選ぶ",
        ],
        hint:
          "その値はファイルパスではなくURLなので、実際の結合前に専用関数で変換します。",
        explain:
          "ライブラリ内部の資産は cwd ではなくモジュール位置が基準です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "アップロードされたファイルの保存パスから、画面表示用に最後のファイル名だけを取り出します。Windowsを含む各OSで使えるAPIを1つ選んでください。",
        lead:
          "入力はディレクトリを含むファイルパスで、期待結果は拡張子を含む最後の名前です。区切り文字で手動分割せず、pathモジュールから目的に合う機能を選びます。",
        kind: "choice",
        options: ["path.basename", "path.extname", "path.dirname", "URL.pathname"],
        answer: "path.basename",
        steps: [
          "ファイル名、拡張子、親ディレクトリを取得するAPIを区別する",
          "最後のパス要素を返す機能を選ぶ",
        ],
        hint:
          "拡張子だけではなく、拡張子を含む最後の名前全体が必要です。",
        explain: "path.basename が最後の要素、extname が拡張子です。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "静的ファイルサーバーで、URLから受け取ったパスを公開ディレクトリ内のファイル検索に使います。検証せずそのままファイルAPIへ渡す場合の評価を1つ選んでください。",
        lead:
          "入力には親ディレクトリへ移動する表現が含まれる可能性があり、期待するアクセス範囲は公開用ルートの内側だけです。正規化後のパスを検証しない場合に起こる危険を選びます。",
        kind: "choice",
        options: [
          "安全なパス指定として推奨される",
          "ディレクトリトラバーサルの危険",
          "常に最短経路となり高速になる",
          "ESM でだけ許される指定になる",
        ],
        steps: [
          "ユーザー入力が信頼できない値であることを確認する",
          "速度やモジュール形式ではなく、公開範囲を越える危険を示す候補を選ぶ",
        ],
        hint:
          "正規化したパスが許可されたルート内に残るか確認しないと、意図しない場所へ到達できます。",
        answer: "ディレクトリトラバーサルの危険",
        explain: "resolve したあと root の外に出ていないかを確認します。",
      },
    ],
  },
];
