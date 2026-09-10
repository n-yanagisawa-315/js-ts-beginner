import type { Lesson } from "@/lib/course/types";

export const jsNpm: Lesson[] = [
  {
    id: "js-npm",
    track: "js",
    level: "advanced",
    chapter: "js-npm",
    order: 34,
    title: "パッケージは借りた道具箱",
    summary: "package.json に書き、install し、名前で import する",
    minutes: 16,
    slides: [
      {
        title: "全部自分で書かない",
        lead: "日付の計算や、色の変換まで自作すると、講座が終わりません。npm のパッケージは、誰かが書いた道具箱です。自分のコードは「何をしたいか」、道具箱は「その部品」です。借りるときは、名前と版を買い物リストに書きます。",
        points: [
          "自分のファイルは ./math.js のように相対パス",
          '借りた道具は "date-fns" のようにパッケージ名',
          "同じ道具を、プロジェクトの誰もが同じ版で使えるようにする",
        ],
        talk: [
          { speaker: "beginner", text: "便利そうでも、短い処理なら自分で書いた方が早くないですか？" },
          { speaker: "engineer", text: "短さだけでなく、仕様の多さや保守まで含めて借りる価値を考えます。" },
          { speaker: "beginner", text: "日付の月末処理みたいに、見た目より例外が多いものは任せる感じですか？" },
          { speaker: "engineer", text: "その通りです。コードでは import 元の名前を見て、自作の相対パスか外部の道具かを区別します。" },
        ],
        diagram: "modules",
        code: `// 自分の部屋
import { add } from "./math.js";
// 借りた道具箱（名前だけ）
import { format } from "date-fns";`,
        codeCaption: "./ が自分、名前だけがパッケージ",
        codeExample: `import { add } from "./math.js";
console.log(add(2, 3));
// パッケージも、使う側の書き方は import で同じ`,
      },
      {
        title: "package.json は買い物リスト",
        lead: "プロジェクトの根元にある JSON が名札です。dependencies に「この道具のこの版」を書きます。scripts は、よく使うコマンドに短い名前を付ける欄です。npm run start は、その欄を実行します。",
        points: [
          "name と version は、このプロジェクト自身の名札",
          "dependencies は本番で使う道具",
          "devDependencies は開発中だけ（テストやbundler）",
        ],
        talk: [
          { speaker: "beginner", text: "package.json にプログラム本体が入っているんですか？" },
          { speaker: "engineer", text: "本体ではなく、プロジェクトの説明と依存関係、実行方法をまとめた設定です。" },
          { speaker: "beginner", text: "scripts の start は、npm に最初から用意された命令ですか？" },
          { speaker: "engineer", text: "名前に対応する文字列をこのプロジェクトが決めています。読むときは scripts の内側までたどります。" },
        ],
        diagram: "node-npm",
        code: `{
  "name": "app",
  "scripts": { "start": "node app.js" },
  "dependencies": { "date-fns": "^3.0.0" }
}`,
        codeCaption: "リストに名前と版を書く",
        codeExample: `const pkg = {
  scripts: { start: "node app.js" },
};
console.log(pkg.scripts.start);
// npm run start が読む欄`,
      },
      {
        title: "install すると、実体がフォルダに並ぶ",
        lead: "npm install はリストを見て、道具の実体を node_modules に置きます。冷蔵庫に材料を入れる作業です。リストだけあっても、入れ忘れたら import は失敗します。git には普通、リストは入れ、実体の山は入れません。",
        points: [
          "node_modules は解決の結果。消して入れ直せる",
          'import "date-fns" はこの山を名前で探す',
          "チームでは、同じリストから同じ山を再現する",
        ],
        talk: [
          { speaker: "beginner", text: "node_modules が消えたら、プロジェクトも壊れたことになりますか？" },
          { speaker: "engineer", text: "設定と lock が残っていれば、install で再構築できます。" },
          { speaker: "beginner", text: "では不具合を直すために、中のファイルを直接書き換えてもいいですか？" },
          { speaker: "engineer", text: "再インストールで消えるので避けます。自分のコードか依存する版を直し、実体の山は生成物として扱います。" },
        ],
        diagram: "node-npm",
        code: `const installed = ["date-fns", "left-pad"];
console.log(installed.includes("date-fns")); // true`,
        codeCaption: "山の中に、名前があるか",
        codeExample: `const mods = { "date-fns": { format: true } };
console.log(Object.keys(mods));
// 入っている道具の名前`,
        watch:
          "node_modules を手で編集しても、次の install で消えます。直すなら自分のコードか、版の指定です。",
      },
      {
        title: "import の2系統を取り違えない",
        lead: '"pg" や "date-fns" はレジストリ上の名前です。"./util.js" は隣のファイルです。先頭が . か / なら自分のプロジェクト、それ以外はパッケージ、と覚えると迷いません。',
        points: [
          "パッケージ名に ./ は付けない",
          "自分のファイルに拡張子を書くことが多い（環境による）",
          "同じ名前のファイルがあっても、パッケージ名とは別物",
        ],
        talk: [
          { speaker: "beginner", text: "import の文字列は、どちらもファイル名を表しているように見えます。" },
          { speaker: "engineer", text: "先頭の形で探す場所が変わります。相対指定は手元、名前だけならパッケージです。" },
          { speaker: "beginner", text: "同じ階層に date-fns.js があれば、名前だけでもそれを読みますか？" },
          { speaker: "engineer", text: "読みません。手元のファイルなら ./ を明示します。文字列を左から見ると取り違えにくいです。" },
        ],
        diagram: "modules",
        code: `function kind(spec) {
  if (spec.startsWith(".") || spec.startsWith("/")) return "file";
  return "package";
}
kind("date-fns"); // "package"
kind("./math.js"); // "file"`,
        codeCaption: "名前の形で、探し先が分かれる",
        codeExample: `console.log("date-fns"); // パッケージ
console.log("./math.js"); // 自分のファイル`,
      },
      {
        title: "^ は範囲、lock はピン止め",
        lead: "^3.0.0 は「3 系なら新しいパッチやマイナーを許す」という範囲です。昨日と今日で微妙に違う実体が入ると、動かなくなることがあります。正確な木は package-lock.json が覚えます。揃えるときは npm ci が向きます。",
        points: [
          "リストは希望の範囲、lock は実際に入れた版",
          "npm install は lock を更新し得る",
          "npm ci は lock どおり。無ければ失敗",
        ],
        talk: [
          { speaker: "beginner", text: "package.json に版が書いてあるのに、lock も必要なんですか？" },
          { speaker: "engineer", text: "前者は許容範囲、後者は依存の依存まで含む実際の組み合わせを記録します。" },
          { speaker: "beginner", text: "同じ範囲なら、少し新しい版が入っても必ず同じ動作ですよね？" },
          { speaker: "engineer", text: "互換性の約束があっても差は起こり得ます。チームやCIでは lock をコミットし、再現性を優先します。" },
        ],
        diagram: "node-npm",
        code: `const range = "^3.0.0";
const locked = "3.6.2";
console.log(range);
console.log(locked);`,
        codeCaption: "希望と、実際に入った版",
        codeExample: `console.log("npm ci");
// チームと CI は lock どおりに入れる`,
        watch: "秘密情報（APIキー）は package.json に書かず、環境変数へ。",
      },
      {
        title: "この講義の要点",
        lead: "パッケージは借りた道具。リストが package.json、実体が node_modules、名前で import。版は lock で揃える。Node の講義で、入れ方とサーバーを深掘りします。",
        points: [
          "./ は自分のファイル",
          "名前だけはパッケージ",
          "lock をコミットする",
        ],
        talk: [
          { speaker: "beginner", text: "外部パッケージは、名前と許容する版を記録し、install してから名前で読み込むんですね。" },
          { speaker: "engineer", text: "その通りです。ただし実際の組み合わせを再現するには lock も一緒に管理します。" },
          { speaker: "beginner", text: "node_modules は手で直す場所ではなく、設定から作り直せる実体の集まりだと分かりました。" },
          { speaker: "engineer", text: "よい整理です。Node の講義では、実際の導入手順やサーバーでの使い方へつなげます。" },
        ],
        diagram: "node-npm",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        scenario: "注文日を扱うため、自作の total 計算と外部の日付パッケージを使い分ける。",
        projectRole: "build",
        prompt:
          "注文管理では、自作の `order-total.js` と導入済みの日付パッケージ `date-fns` を使います。それぞれを正しい読み込み元で指定した組み合わせを選んでください。",
        lead:
          "入力候補には、相対パスとパッケージ名を入れ替えた指定も含まれます。手元のorder.total計算ファイルは現在位置からたどり、外部の日付機能はインストール名で探す組み合わせを選べば完了です。",
        kind: "choice",
        options: [
          '自作: "./order-total.js" / 外部: "date-fns"',
          '自作: "./date-fns" / 外部: "order-total.js"',
          '自作: "order-total.js" / 外部: "./date-fns"',
          '自作: "/order-total.js" / 外部: "../date-fns"',
        ],
        steps: [
          "プロジェクト内のファイルを示す指定の特徴を確認する",
          "レジストリから導入する道具を示す指定の特徴を確認する",
          "両方の探し先が正しい組み合わせを選ぶ",
        ],
        hint:
          "手元のファイルは現在位置との関係を示します。外部の道具は、インストール時に使った名前で探します。",
        answer: '自作: "./order-total.js" / 外部: "date-fns"',
        explain: "相対パスが自分の部屋、名前だけが借りた道具箱です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "開発者が `npm run start` でアプリを起動できるよう、`package.json` の設定名 `start` と実際に実行される処理の正しい対応を選んでください。",
        lead:
          "入力候補はすべて同じ scripts 設定を示しています。`start` は npm 固定の処理ではなく、プロジェクトが `node app.js` に付けた短い入口です。キーではなく右側の実行内容を選べば完了です。",
        kind: "choice",
        options: [
          '設定: { "scripts": { "start": "node app.js" } } → 実行: node app.js',
          '設定: { "scripts": { "start": "node app.js" } } → 実行: start app.js',
          '設定: { "scripts": { "start": "node app.js" } } → 実行: scripts.start',
          '設定: { "scripts": { "start": "node app.js" } } → 実行: package.json',
        ],
        steps: [
          "設定内でスクリプト名に対応する値を探す",
          "キー名ではなく、実際に実行される処理を選ぶ",
        ],
        hint:
          "`scripts` は短い名前と実行内容の対応表です。コマンド名の右側に設定された文字列を確認します。",
        answer:
          '設定: { "scripts": { "start": "node app.js" } } → 実行: node app.js',
        explain:
          "npm run start は、買い物リストの scripts.start を実行します。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "`node_modules` を削除したあと、依存関係を復元するために必要な対応を選んでください。",
        lead:
          "`node_modules` は依存関係の実体を並べた生成物です。設定と lock が残っている前提で、チームの環境を作り直す方法を判断します。",
        kind: "choice",
        options: [
          "依存関係のインストールを実行して再生成する",
          "空の node_modules を保存して戻す",
          "package.json を消して実体を作る",
          "各依存ファイルを手作業で一つずつ戻す",
        ],
        steps: [
          "設定ファイルとインストール結果の役割を分ける",
          "生成物を設定から再構築する方法を選ぶ",
        ],
        hint:
          "依存の実体は手で編集する保存元ではありません。プロジェクトに記録された一覧から作れます。",
        answer: "依存関係のインストールを実行して再生成する",
        explain: "install のあと、実体は node_modules に名前で並びます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "プロジェクト直下に `date-fns.js` があるとき、外部パッケージではなくそのファイルを読む指定を選んでください。",
        lead:
          "同じ名前のローカルファイルがあっても、名前だけの指定はパッケージを探します。探し先を明示できている読み込み元を見分けます。",
        kind: "choice",
        options: [
          '"./date-fns.js"',
          '"../date-fns.js"',
          '"date-fns.js"',
          '"/date-fns.js"',
        ],
        steps: [
          "読みたい対象がプロジェクト内のファイルであることを確認する",
          "現在位置からの相対指定になっている選択肢を選ぶ",
        ],
        hint:
          "パッケージ名と区別するには、現在の場所からたどる印とファイル名を含めます。",
        answer: '"./date-fns.js"',
        explain: "./ で始まるのが自分のファイル、名前だけがパッケージです。",
      },
      {
        id: "q5",
        slide: 4,
        prompt:
          "CIで lock ファイルどおりの依存関係を再現し、内容の不一致時には失敗させるコマンドを選んでください。",
        lead:
          "許容範囲だけでは、導入される依存の組み合わせが環境ごとにずれる可能性があります。自動環境で再現性を優先する実行方法を判断します。",
        kind: "choice",
        options: ["npm ci", "npm update", "npm init", "npm publish"],
        steps: [
          "バージョン範囲と実際に解決された組み合わせの違いを整理する",
          "lock を更新するのではなく、その内容を厳密に再現する選択肢を選ぶ",
        ],
        hint:
          "チームや自動テストでは、新しい版を探すより、記録済みの依存木をそのまま入れることが目的です。",
        answer: "npm ci",
        explain: "^ は範囲、lock はピン止めです。揃えるなら npm ci です。",
      },
    ],
  },
];
