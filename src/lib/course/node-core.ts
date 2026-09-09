import type { Lesson } from "@/lib/course/types";

export const nodeCore: Lesson[] = [
  {
    id: "node-http",
    track: "node",
    level: "basic",
    chapter: "node-http",
    order: 7,
    title: "http サーバーはリクエストの関数",
    summary: "listen して、来た req に res で返す",
    minutes: 14,
    slides: [
      {
        title: "createServer の引数が1リクエスト",
        lead: "http.createServer((req, res) => { ... }) は、接続のたびにこの関数が呼ばれます。req が入力（method, url, headers, body ストリーム）、res が出力です。listen(port) で受け付けを始め、プロセスは待ち続けます。",
        talk: [
          { speaker: "beginner", text: "サーバーは、リクエストごとに新しいプログラムを起動するのですか？" },
          { speaker: "engineer", text: "一つのプロセスで、届くたびにハンドラ関数が呼ばれます。" },
          { speaker: "beginner", text: "本文を書けば、応答は自動で完了しますよね？" },
          { speaker: "engineer", text: "res.endまで呼ばないと相手は待ち続けます。listen後は複数の要求を受ける状態が続きます。" },
        ],
        points: [
          "終わらせるには res.end(...) が必要。忘れるとクライアントが待ち続ける",
          "同じ関数が同時に何本も動き得る（イベントループ上の別ターン）",
        ],
        diagram: "node-http",
        code: `import http from "node:http";
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("ok");
});
server.listen(3000);`,
      },
      {
        title: "url と method で分岐する",
        lead: "req.url はパスとクエリを含む文字列です。req.method は GET や POST。フレームワークはこれをルーターにしますが、生の http では自分で分けます。ヘッダ名は小文字化されて届くことが多いです。",
        talk: [
          { speaker: "beginner", text: "同じURLなら、GETもPOSTも同じ処理でよいですか？" },
          { speaker: "engineer", text: "methodとurlの両方を見て処理を分けます。" },
          { speaker: "beginner", text: "POSTの本文は、req.bodyですぐ読めますよね？" },
          { speaker: "engineer", text: "生のhttpではreqがストリームです。チャンクを受け取り、該当しない経路には404などを返してendします。" },
        ],
        points: [
          "GET は本文が無い（無視される）のが普通",
          "POST の本文は req を data イベントで読む",
        ],
        diagram: "node-http",
        code: `if (req.method === "GET" && req.url === "/health") {
  res.end("ok");
  return;
}
res.statusCode = 404;
res.end("not found");`,
      },
      {
        title: "本文は一度に来ない",
        lead: '大きな POST はチャンクに分かれます。req.on("data", chunk => ...) で足し、req.on("end", () => ...) で完成です。制限サイズを超えたら切らないと、メモリを食われます。',
        talk: [
          { speaker: "beginner", text: "dataイベントが一回来たら、本文は完成ですか？" },
          { speaker: "engineer", text: "複数チャンクになるので、endまで集めて完成させます。" },
          { speaker: "beginner", text: "全部つなげてからJSON.parseすれば、サイズは気にしなくてよいですか？" },
          { speaker: "engineer", text: "上限なしではメモリを使い切られます。文字コードを決め、制限を設け、解析失敗は400として扱います。" },
        ],
        points: [
          "chunk は Buffer になりやすい。文字列化は encoding を決めてから",
          "JSON なら end のあと JSON.parse。失敗は 400",
        ],
        diagram: "node-stream",
      },
      {
        title: "エラーはサーバーも落とせる",
        lead: "ハンドラ内の未捕捉例外は、版や設定によってはプロセスごと落ちます。listen の error（EADDRINUSE）はポートが埋まっているときです。本番ではプロセスマネージャと合わせて再起動します。",
        talk: [
          { speaker: "beginner", text: "一件のリクエストで例外が出ても、その利用者だけの問題ですか？" },
          { speaker: "engineer", text: "捕捉されなければ、サーバープロセス全体が落ちることがあります。" },
          { speaker: "beginner", text: "開発中に一度成功したので、同時アクセスも大丈夫ですよね？" },
          { speaker: "engineer", text: "共有状態は複数要求で競合します。Promiseの拒否やポート使用中のエラーも扱い、再起動だけに頼らないでください。" },
        ],
        points: [
          "async ハンドラの reject を握らない",
          "keep-alive の接続は end してもすぐ切れるとは限らない",
        ],
        diagram: "node-http",
        watch:
          "開発の「動いた」は1リクエストです。同時に2本来ても壊れないかを次に見ます。",
      },
      {
        title: "この講義の要点",
        lead: "1リクエスト1コールバック。end で閉じる。本文はストリーム。ポート衝突は EADDRINUSE。次は npm です。",
        talk: [
          { speaker: "beginner", text: "最小のHTTPサーバーで忘れやすい点は何ですか？" },
          { speaker: "engineer", text: "methodとurlで分け、必ず応答を終了することです。" },
          { speaker: "beginner", text: "本文も普通の文字列として一度に扱えますか？" },
          { speaker: "engineer", text: "入力はストリームなので上限付きで集めます。待受失敗ではアドレス使用中などのエラーコードを見ます。" },
        ],
        points: ["res.end を忘れない", "url と method で分岐"],
        diagram: "node-http",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "最小のHTTPサーバーを起動する処理になるよう、5つのコード断片を並べてください。",
        lead:
          "httpモジュールを読み込み、createServerへ関数を渡し、res.endでokを返してから3000番ポートで待ち受けます。",
        kind: "order",
        fragments: [
          "});",
          '  res.end("ok");',
          'import http from "node:http";',
          "server.listen(3000);",
          "const server = http.createServer((req, res) => {",
        ],
        steps: [
          "最初にhttpモジュールを読み込む",
          "createServerへリクエストごとに呼ばれる関数を渡す",
          "関数内でres.endを呼ぶ",
          "サーバー作成後にlistenで待ち受ける",
        ],
        hint:
          "読み込み → サーバー作成 → 応答終了 → 関数を閉じる → 待ち受け、の順です。",
        answer: `import http from "node:http";
const server = http.createServer((req, res) => {
  res.end("ok");
});
server.listen(3000);`,
        explain:
          "createServerへ関数を渡し、各リクエストでres.endを呼びます。listenはサーバーを作ったあとに実行します。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "starterのreqについて、methodがGETかつurlが/healthの場合だけokを1行表示してください。",
        lead:
          "Node.jsの基本HTTPサーバーでは、リクエストのメソッドとURLを両方調べて処理を分けます。今回は2つの条件が同時に成立した場合だけ、ヘルスチェック成功の出力を行います。",
        kind: "code",
        starter:
          'const req = { method: "GET", url: "/health" };\n// method と url で分岐\n',
        fileName: "app.js",
        steps: [
          "reqのmethodとurlをそれぞれ指定値と比較する",
          "2つの比較が両方成立する場合だけ表示処理を行う",
          "sampleと同じ1行が出るか確認する",
        ],
        hint:
          "片方だけでは別のリクエストも通ります。値を書き換える操作ではなく、2条件の一致を確認してください。",
        sample: "ok",
        answer: `const req = { method: "GET", url: "/health" };
if (req.method === "GET" && req.url === "/health") {
  console.log("ok");
}`,
        explain: "生の http では req.method と req.url で自分で分けます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "プロフィール更新APIで、POSTされたJSON本文を受け取ってオブジェクトへ変換します。JSON.parseを実行するタイミングとして適切なものを1つ選んでください。",
        lead:
          "現在の入力は複数チャンクに分かれて届く可能性があり、途中の断片だけでは正しいJSONとは限りません。サイズ上限を確認しながら本文を集め、全データがそろった時点で解析します。",
        kind: "choice",
        options: [
          "endイベントで全チャンクがそろったあと",
          "最初のdataイベントを受け取る直前",
          "listenで待受を開始した直後",
          "各dataイベントのチャンクごと",
        ],
        answer: "endイベントで全チャンクがそろったあと",
        steps: [
          "本文が複数チャンクに分かれる可能性を確認する",
          "完全な本文を解析できるタイミングを選ぶ",
        ],
        hint:
          "受信完了前の断片は、単独では正しいJSONにならないことがあります。",
        explain:
          "本文はendまで上限付きで集め、その後にJSON.parseします。解析失敗は400として扱います。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "開発サーバーを起動したところ、同じポートで別のサーバーがすでに待機していました。このときのエラーコードを1つ選んでください。",
        lead:
          "現在の失敗は設定ファイルの不足ではなく、待受アドレスとポートの重複です。ログから原因を判別し、先に動いているプロセスの停止やポート変更につなげられるコードを選びます。",
        kind: "choice",
        options: ["EADDRINUSE", "ENOENT", "EACCES", "ECONNRESET"],
        answer: "EADDRINUSE",
        steps: [
          "失敗の対象がファイルではなく待受アドレスだと確認する",
          "アドレスが使用中である状態を表す候補を選ぶ",
        ],
        hint:
          "コード名の中に、addressと使用中という意味が含まれるものを探してください。",
        explain: "EADDRINUSE はポートが埋まっているときです。",
      },
    ],
  },
  {
    id: "node-npm",
    track: "node",
    level: "basic",
    chapter: "node-npm",
    order: 8,
    title: "npm は依存の地図",
    summary: "package.json、lock、node_modules",
    minutes: 13,
    slides: [
      {
        title: "package.json がプロジェクトの名札",
        lead: "name, version, scripts, dependencies が中心です。npm run dev は scripts.dev をシェルで走らせます。bin はコマンド名の公開。main / exports は「このパッケージの入り口」です。",
        talk: [
          { speaker: "beginner", text: "package.jsonには、依存一覧だけを書けばよいですか？" },
          { speaker: "engineer", text: "名前、版、スクリプト、依存、公開入口などを宣言します。" },
          { speaker: "beginner", text: "scriptsからツールを呼ぶには、グローバル導入が必要ですよね？" },
          { speaker: "engineer", text: "ローカルの実行ファイルはscripts内のPATHに入ります。チームで同じ版を使う助けになります。" },
        ],
        points: [
          "dependencies は本番、devDependencies は開発専用",
          "scripts の node_modules/.bin は PATH に入る",
        ],
        diagram: "node-npm",
        code: `{
  "name": "app",
  "scripts": { "start": "node app.js" },
  "dependencies": { "pg": "^8.0.0" }
}`,
      },
      {
        title: "semver の ^ は範囲",
        lead: "^8.0.0 は 8 系の新しいパッチ／マイナーを許す、という意味合いです（メジャーは上げない）。正確な木は package-lock.json が固定します。チームでは lock をコミットし、CI は npm ci が再現しやすいです。",
        talk: [
          { speaker: "beginner", text: "package.jsonに版を書けば、全員が完全に同じ依存になりますか？" },
          { speaker: "engineer", text: "範囲指定だけでは揺れるので、正確な依存木はlockが固定します。" },
          { speaker: "beginner", text: "CIでも普段どおり導入すれば、lockは変わりませんよね？" },
          { speaker: "engineer", text: "通常の導入はlockを更新し得ます。CI向けのクリーン導入を使い、lockを無視して昨日との差を作らないようにします。" },
        ],
        points: [
          "npm install は lock を更新し得る",
          "npm ci は lock どおり。無ければ失敗",
        ],
        diagram: "node-npm",
        watch: "lock を無視すると、昨日まで動いたものが今日壊れます。",
      },
      {
        title: "node_modules は解決の結果",
        lead: 'インストールすると実体が並びます。git に通常は入れません。同じパッケージの複数版がネストすることがあります。import "pg" はこの木を探索します。',
        talk: [
          { speaker: "beginner", text: "node_modulesもGitへ入れれば、再現が確実ではないですか？" },
          { speaker: "engineer", text: "通常はlockを共有し、依存の実体は各環境で復元します。" },
          { speaker: "beginner", text: "壊れたらlockも一緒に消すのが早いですよね？" },
          { speaker: "engineer", text: "lockを残してクリーンに入れ直す方が原因を増やしません。複数版の入れ子もあり得ます。" },
        ],
        points: [
          "消して入れ直すなら lock を残して npm ci",
          "グローバル install はプロジェクトの再現性を下げる",
        ],
        diagram: "node-npm",
      },
      {
        title: "npx は一時的に bin を走る",
        lead: "npx pkg はローカルの .bin か、取得して実行します。バージョンを固定したい作業は devDependencies に入れて scripts から呼ぶ方が安全です。",
        talk: [
          { speaker: "beginner", text: "一度だけ試すCLIも、必ず依存へ追加しますか？" },
          { speaker: "engineer", text: "一時的な実行ならnpxが便利です。" },
          { speaker: "beginner", text: "本番ビルドも毎回その場で取得すれば最新で安心ですよね？" },
          { speaker: "engineer", text: "取得版が変わると再現できません。継続利用するものは開発依存へ固定し、scriptsから実行します。" },
        ],
        points: ["学習用の一度きりには便利", "本番ビルドは scripts に書く"],
        diagram: "node-cli",
      },
      {
        title: "この講義の要点",
        lead: "package.json が宣言、lock が再現、node_modules が実体。ci で揃える。次はストリームです。",
        talk: [
          { speaker: "beginner", text: "依存関係では、三つのファイルや場所をどう区別しますか？" },
          { speaker: "engineer", text: "package.jsonは希望、lockは確定した木、node_modulesは復元された実体です。" },
          { speaker: "beginner", text: "版の範囲だけ共有すれば、チームでも十分ですか？" },
          { speaker: "engineer", text: "lockをコミットし、CIではそこから再現します。秘密情報は宣言ファイルへ書かないでください。" },
        ],
        points: ["^ は範囲、lock はピン", "秘密は package.json に書かない"],
        diagram: "node-npm",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "package.jsonに登録済みのstart処理を使って、ファイル変更を監視する開発サーバーを起動してください。",
        lead:
          "現在の作業ディレクトリにはpackage.jsonがあり、startにはnodemonでapp.jsを動かす処理が定義されています。登録内容を直接書き直さずに実行し、監視開始メッセージが表示されて待機状態になれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "パッケージのスクリプト実行機能でstartという登録名を指定する",
          "監視ツールがアプリを起動したことを出力で確認する",
        ],
        hint:
          "依存関係をインストールする操作ではなく、package.jsonのscriptsから指定名を起動します。",
        aliases: ["npm run start"],
        termOutput: [
          { text: "> beginner@0.1.0 start", tone: "out" },
          { text: "> nodemon ./app.js", tone: "out" },
          { text: "[nodemon] 3.1.10", tone: "warn" },
          { text: "[nodemon] to restart at any time, enter `rs`", tone: "warn" },
          { text: "[nodemon] watching path(s): *.*", tone: "warn" },
          { text: "[nodemon] watching extensions: js,json", tone: "warn" },
          { text: "[nodemon] starting `node ./app.js`", tone: "ok" },
        ],
        termAlive: true,
        answer: "npm start",
        explain:
          "npm start は package.json の scripts.start を走らせます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "CIの新しい実行環境へ、package-lock.jsonに固定された依存パッケージを同じ構成でクリーンインストールしてください。",
        lead:
          "現在のリポジトリにはpackage.jsonとpackage-lock.jsonがあり、過去の開発環境と同じ依存ツリーを再現する必要があります。lockファイルを更新せず、不一致なら失敗するCI向けの導入方法を使います。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "パッケージ管理ツールのCI向けクリーン導入機能を実行する",
          "lockファイルどおりにパッケージが追加された出力を確認する",
        ],
        hint:
          "通常の依存追加ではなく、継続的インテグレーションで再現性を優先する専用操作を使います。",
        termOutput: [
          { text: "added 128 packages in 4s", tone: "out" },
        ],
        answer: "npm ci",
        explain: "正確な木は lock が固定し、CI は npm ci が再現しやすいです。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "依存更新前の確認として、このプロジェクトが直接導入しているパッケージとバージョンを一覧表示してください。入れ子の依存は表示しません。",
        lead:
          "現在のnode_modulesには直接依存とその内部依存が混在しています。ファイル一覧を読むのではなくパッケージ管理ツールへ問い合わせ、トップレベルのnodemonと版番号だけを確認できれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "パッケージ管理ツールの依存一覧機能を使う",
          "表示する依存の深さをトップレベルだけに制限する",
          "直接依存の名前とバージョンを確認する",
        ],
        hint:
          "ファイル一覧ではなく、インストール済みパッケージのツリーを調べます。深さは数値で指定できます。",
        termOutput: [
          { text: "beginner@0.1.0 /home/app", tone: "out" },
          { text: "└── nodemon@3.1.10", tone: "out" },
        ],
        aliases: ["npm list --depth=0"],
        answer: "npm ls --depth=0",
        explain:
          "node_modulesは依存解決の結果です。npm lsで導入済みの依存ツリーを確認できます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "開発環境の差を調べるため、プロジェクトに導入済みのnodemonをパッケージ実行ツール経由で起動し、バージョンを表示してください。",
        lead:
          "現在確認したいのはグローバル版ではなく、このプロジェクトが固定しているローカルCLIです。サーバーの監視は始めず、版番号3.1.10だけが表示されれば完了です。",
        kind: "shell",
        cwd: "app",
        starter: "",
        steps: [
          "パッケージ内の実行ファイルを起動する補助ツールを使う",
          "対象として導入済みの監視CLIを指定する",
          "通常起動ではなく版情報を表示するオプションを渡す",
        ],
        hint:
          "補助ツール自身ではなく、その後ろに指定したローカルCLIの版を問い合わせます。",
        aliases: ["npx nodemon -v"],
        termOutput: [{ text: "3.1.10", tone: "out" }],
        answer: "npx nodemon --version",
        explain:
          "npxはローカルの実行ファイルを探します。継続利用するCLIはdevDependenciesへ固定します。",
      },
    ],
  },
  {
    id: "node-stream",
    track: "node",
    level: "middle",
    chapter: "node-async",
    order: 9,
    title: "ストリームは少しずつ流す",
    summary: "全部メモリに載せない I/O",
    minutes: 14,
    slides: [
      {
        title: "読みは Readable、書きは Writable",
        lead: "巨大ファイルや HTTP 本文は、チャンクの列です。createReadStream は Readable、createWriteStream は Writable。pipe でつなぐと、背圧（早い読みを遅い書きに合わせる）をある程度見てくれます。",
        talk: [
          { speaker: "beginner", text: "巨大ファイルもreadFileで読めるなら、ストリームは不要ですか？" },
          { speaker: "engineer", text: "メモリへ全部載せず、ReadableからWritableへ少しずつ流します。" },
          { speaker: "beginner", text: "dataイベントで受けた分を、そのまま書き続ければ十分ですよね？" },
          { speaker: "engineer", text: "書き込みが遅い場合は背圧が必要です。pipeや非同期反復を使い、各ストリームのエラーも扱います。" },
        ],
        points: [
          "data イベントは旧スタイル。今は for await (const chunk of stream)",
          "エラーは stream ごとに listen しないと unnoticed で落ちることがある",
        ],
        diagram: "node-stream",
        code: `import { createReadStream, createWriteStream } from "node:fs";
createReadStream("big.txt").pipe(createWriteStream("copy.txt"));`,
      },
      {
        title: "EventEmitter がイベントの土台",
        lead: '多くの Node オブジェクトは on("event", fn) です。同じ名前に複数リスナ。once は一回。off / removeListener で外します。忘れずに外さないと、クロージャごと残ってリークします。',
        talk: [
          { speaker: "beginner", text: "onで登録した処理は、イベント後に自動で消えますか？" },
          { speaker: "engineer", text: "通常は残るので、一回だけならonce、不要になればoffします。" },
          { speaker: "beginner", text: "小さな関数なら残しても、メモリには影響しませんよね？" },
          { speaker: "engineer", text: "クロージャが周囲の値も保持します。解除漏れとerrorイベント未処理は長期稼働で問題になります。" },
        ],
        points: [
          "error イベントを扱わない Emitter は throw し得る",
          "自分で作るなら new EventEmitter()",
        ],
        diagram: "node-stream",
        code: `import { EventEmitter } from "node:events";
const bus = new EventEmitter();
bus.on("tick", () => console.log("t"));
bus.emit("tick");`,
      },
      {
        title: "Transform は途中の加工",
        lead: "gzip や行分割は Transform ストリームです。pipeline（stream/promises）はつなぎとエラー伝播をまとめてくれます。pipe だけだとエラー処理が漏れやすいです。",
        talk: [
          { speaker: "beginner", text: "読みながら圧縮する処理は、どこへ書けばよいですか？" },
          { speaker: "engineer", text: "途中の加工をTransformとして流れに挟みます。" },
          { speaker: "beginner", text: "pipeを何本かつなげれば、失敗時の処理も自動ですよね？" },
          { speaker: "engineer", text: "漏れやすいのでpipelineで接続とエラー伝播をまとめます。失敗時は全体を閉じる方向で扱われます。" },
        ],
        points: [
          "pipeline は失敗したら全部壊す／閉じる方向",
          "objectMode はオブジェクトをチャンクにする",
        ],
        diagram: "node-stream",
        code: `import { pipeline } from "node:stream/promises";
await pipeline(src, gzip, dest);`,
      },
      {
        title: "背圧を無視するとメモリが膨らむ",
        lead: "読みが速く書きが遅いとき、中間バッファが増えます。write が false を返したら drain を待つ、というのが Writable の契約です。pipe / pipeline はこれをある程度肩代わりします。自分で data を足し続けると簡単に壊れます。",
        talk: [
          { speaker: "beginner", text: "読み込みが速いほど、コピーも速く終わりますか？" },
          { speaker: "engineer", text: "書き込みが追いつかなければ、中間データがたまるだけです。" },
          { speaker: "beginner", text: "writeの戻り値は無視しても、最後には書けますよね？" },
          { speaker: "engineer", text: "falseならdrainを待つ契約です。無視するとメモリが膨らむので、通常はpipeやpipelineへ任せます。" },
        ],
        points: ["全部 toString して結合、は大きなファイルで負けやすい"],
        diagram: "node-stream",
      },
      {
        title: "この講義の要点",
        lead: "チャンクで流す。pipe/pipeline。error を聞く。Emitter は着脱。次は libuv です。",
        talk: [
          { speaker: "beginner", text: "ストリームを使う一番の目的は何ですか？" },
          { speaker: "engineer", text: "大きなデータをチャンクで扱い、メモリ使用量を抑えることです。" },
          { speaker: "beginner", text: "接続できたら、後は流れに任せてよいですか？" },
          { speaker: "engineer", text: "背圧とエラー処理が必要です。イベントのリスナも、不要になったら外してリークを防ぎます。" },
        ],
        points: ["巨大データは readFile しない", "error リスナを付ける"],
        diagram: "node-stream",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "数GBのアクセスログを1行ずつ集計するため、Readableから届くチャンクをすべてメモリへためずに処理します。適切な現代的構文を1つ選んでください。",
        lead:
          "現在の入力はメモリに収まるとは限らない大きなファイルです。Readableの次のチャンクを待ちながら順番に扱い、全体を結合せず処理できる方法を選びます。",
        kind: "choice",
        options: [
          "for await...of",
          "JSON.stringify",
          "Array.join",
          "readFileSync",
        ],
        answer: "for await...of",
        steps: [
          "Readableが非同期にチャンクを届けることを確認する",
          "次の値を待ちながら反復できる構文を選ぶ",
        ],
        hint:
          "通常の同期反復に、非同期の値を待つためのキーワードを加えた構文です。",
        explain:
          "Readableはfor await...ofで、全部をメモリへ載せずチャンクごとに処理できます。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "接続完了イベントを1回だけ処理し、実行後はリスナを自動解除したいときに使う登録方法を1つ選んでください。",
        lead:
          "通常のイベントリスナは発火後も残ります。一度だけ必要な初期化処理で、解除忘れによる重複実行や保持を避ける方法を選びます。",
        kind: "choice",
        options: [
          "1回だけ登録する once",
          "何度も繰り返し登録する on",
          "イベントを発火する emit",
          "登録数の listenerCount",
        ],
        answer: "1回だけ登録する once",
        steps: [
          "繰り返し受け取る登録と一度だけ受け取る登録を区別する",
          "発火後に自動解除される方法を選ぶ",
        ],
        hint:
          "手動でoffを呼ばなくても、最初の発火後に役目を終える登録方法です。",
        explain:
          "一度だけ必要なイベントはonceを使うと、実行後にリスナが自動解除されます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "大きなバックアップを読み取り、gzip圧縮して保存する3段のストリーム処理を作ります。接続と途中のエラー伝播をまとめて扱うAPIを1つ選んでください。",
        lead:
          "現在の処理には読み取り、変換、書き込みがあり、どの段階でも失敗する可能性があります。成功時は保存まで完了し、失敗時は一連の流れを閉じてエラーを受け取れる上位APIを選びます。",
        kind: "choice",
        options: ["pipeline", "pipe", "concat", "buffer"],
        answer: "pipeline",
        steps: [
          "単純に2本を接続する機能と、一連の処理を管理する機能を区別する",
          "エラー伝播までまとめる候補を選ぶ",
        ],
        hint:
          "複数段の流れ全体を1本の処理として扱い、失敗時の後片付けも支援するAPIです。",
        explain: "pipeline はつなぎとエラー伝播をまとめてくれます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "高速なディスクから読み、低速なネットワークへ送るストリーム処理で背圧を無視しました。中間バッファに起こりやすい変化を1つ選んでください。",
        lead:
          "読み取りは送信より速く、出口が処理できないデータも入口から届き続けています。未送信データがどこに残り、長時間動かしたときメモリへどう影響するかを選びます。",
        kind: "choice",
        options: [
          "必ず空のまま",
          "増えてメモリが膨らむ",
          "型が消える",
          "DOM が使える",
        ],
        steps: [
          "入力速度が出力速度を上回る状況を考える",
          "未処理データの蓄積とメモリ使用量を説明する候補を選ぶ",
        ],
        hint:
          "書き込みが追いつくまで待たなければ、処理待ちのデータを保持する場所が必要になります。",
        answer: "増えてメモリが膨らむ",
        explain:
          "write が false なら drain を待ちます。pipe / pipeline が背圧を肩代わりします。",
      },
    ],
  },
  {
    id: "node-libuv",
    track: "node",
    level: "middle",
    chapter: "node-async",
    order: 10,
    title: "ノンブロッキングは JS が待たないこと",
    summary: "libuv が I/O を受け持ち、JS はコールバックで再開",
    minutes: 15,
    slides: [
      {
        title: "JS は1スレッド、I/O は裏で進む",
        lead: "Node の JS 実行は基本1本です。readFile を呼ぶと、仕事は libuv（と OS）に渡り、JS は次の行へ進みます。終わったらキューにコールバックが載り、スタックが空いてから動きます。ブラウザのイベントループと同族ですが、ファイルとソケットが主役です。",
        talk: [
          { speaker: "beginner", text: "JavaScriptが1本なら、ファイル待ちの間は全部止まりますか？" },
          { speaker: "engineer", text: "非同期I/Oを依頼した後は、別のJavaScript処理へ進めます。" },
          { speaker: "beginner", text: "ではI/Oのコールバックも、裏の別スレッドで動くのですか？" },
          { speaker: "engineer", text: "完了後にキューへ入り、JSのスタックが空いてから実行されます。重い同期計算はその再開を止めます。" },
        ],
        points: [
          "待っているあいだに他のリクエストの JS を処理できる",
          "CPU を食う同期ループは、I/O があっても画面（他接続）を止める",
        ],
        diagram: "node-libuv",
        code: `import { readFile } from "node:fs/promises";
const p = readFile("a.txt", "utf8"); // 依頼しただけ
console.log("先にここ");
await p;`,
      },
      {
        title: "スレッドプールは一部の I/O 用",
        lead: "DNS や一部のファイル操作、crypto の重い計算はスレッドプールに行きます。ソケットの多くは OS のノンブロッキングです。全部が別スレッドになるわけではありません。UV_THREADPOOL_SIZE は上級のチューニングです。",
        talk: [
          { speaker: "beginner", text: "非同期APIは、全部スレッドプールで動くのですか？" },
          { speaker: "engineer", text: "一部はプールですが、ソケットの多くはOSの仕組みを使います。" },
          { speaker: "beginner", text: "CPU計算も非同期関数にすれば、同じように速くなりますか？" },
          { speaker: "engineer", text: "CPU負荷はJSを占有します。worker_threadsなどへ分け、プールサイズ変更は計測後に検討します。" },
        ],
        points: [
          "CPU バウンドは worker_threads の出番",
          "I/O バウンドは非同期のまま本数が稼げる",
        ],
        diagram: "node-libuv",
      },
      {
        title: "setImmediate / nextTick の位置",
        lead: "process.nextTick は今の操作のあと、イベントループのフェーズより前に寄ります。溜めると I/O に到達しません。setImmediate は poll のあとに近いマクロです。setTimeout(0) と順番が違うことがあります。",
        talk: [
          { speaker: "beginner", text: "できるだけ早く処理したいなら、全部nextTickへ入れますか？" },
          { speaker: "engineer", text: "nextTickは優先度が高く、使い続けるとI/Oを飢えさせます。" },
          { speaker: "beginner", text: "待ち時間がゼロなら、setTimeoutと順番も必ず同じですよね？" },
          { speaker: "engineer", text: "イベントループの位置が違うため順序は固定できません。通常はPromiseやタイマーで十分か検討します。" },
        ],
        points: [
          "nextTick の再帰は飢餓を起こす",
          "通常のアプリは Promise / setTimeout で足りることが多い",
        ],
        diagram: "event-loop",
        watch: "nextTick で「今すぐ」をやりすぎない。",
      },
      {
        title: "ブロッキング API をホットパスから外す",
        lead: "readFileSync、巨大な JSON.parse、同期 zlib、bcrypt の同期版は、その間ループが死にます。計測して、重い仕事は worker か外部サービスへ。",
        talk: [
          { speaker: "beginner", text: "一件だけなら、リクエスト中に同期処理をしても平気ですか？" },
          { speaker: "engineer", text: "頻繁に通る経路では、その一件が他の要求も止めます。" },
          { speaker: "beginner", text: "プロセスを増やせば、同期処理を直さなくてもよいですか？" },
          { speaker: "engineer", text: "緩和はできますが根本の占有は残ります。計測し、非同期API、worker、外部処理へ移します。" },
        ],
        points: ["クラスタや複数プロセスは CPU コアを活かす別手段"],
        diagram: "node-libuv",
      },
      {
        title: "この講義の要点",
        lead: "JS は待たず依頼する。裏で I/O。CPU は別問題。nextTick 乱用禁止。次はエラー処理です。",
        talk: [
          { speaker: "beginner", text: "ノンブロッキングとは、処理が全部並列になる意味ですか？" },
          { speaker: "engineer", text: "JSがI/O完了をその場で待たず、次の仕事へ進める意味です。" },
          { speaker: "beginner", text: "重い計算もI/Oと同じ感覚で書けますか？" },
          { speaker: "engineer", text: "CPU計算は別問題で、同期処理はループを止めます。nextTickの優先実行も乱用しないでください。" },
        ],
        points: ["Sync は止める", "CPU と I/O を分ける"],
        diagram: "node-libuv",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "設定ファイルの非同期読み取りを開始した直後に「先にここ」、読み取り完了時に「完了」をログへ出します。表示順序を1つ選んでください。",
        lead:
          "読み取りはまだ完了していない可能性がありますが、JavaScriptはI/Oを依頼したあと次の同期処理へ進みます。完了後の処理がキューから再開されるタイミングと比較します。",
        kind: "choice",
        options: [
          "先にここ → 完了",
          "完了 → 先にここ",
          "どちらも表示されない",
          "必ず同時に表示される",
        ],
        answer: "先にここ → 完了",
        steps: [
          "I/O依頼後も現在のJavaScript処理が続くことを確認する",
          "完了コールバックがキューから動くタイミングと比較する",
        ],
        hint:
          "現在の呼び出しスタックが空になるまで、完了後の処理は割り込みません。",
        explain:
          "非同期I/Oの完了処理はキューへ入り、現在の同期処理が終わってから再開します。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "APIサーバーのリクエスト処理で、数秒かかる同期ループを実行しました。他の利用者への影響として主な問題を1つ選んでください。",
        lead:
          "計算中も別リクエストのファイル読み取りや通信は完了する可能性がありますが、JavaScriptの実行は1本の同期処理に占有されています。完了済みI/Oのコールバックを再開できるかに注目します。",
        kind: "choice",
        options: [
          "I/O コールバックも進められない",
          "argv の内容が途中で消える",
          "ESM の読み込みが無効になる",
          "port 番号が自動で変わる",
        ],
        steps: [
          "同期計算中のイベントループの状態を考える",
          "他の非同期処理の再開に与える影響を説明する候補を選ぶ",
        ],
        hint:
          "起動引数やモジュール形式ではなく、1本のJavaScript実行が占有される影響です。",
        answer: "I/O コールバックも進められない",
        explain:
          "JS は基本1本です。CPU を食う同期処理は他接続のコールバックも止めます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "サーバーで短い処理を再帰的に予約し続けた結果、受信済みリクエストのI/O処理が始まりません。飢餓の原因になり得る仕組みを1つ選んでください。",
        lead:
          "現在の処理直後に優先されるキューへ、新しい処理が途切れず追加されている状態です。通常のイベントループ段階へ進めなくなる可能性があるNode.js固有の仕組みを選びます。",
        kind: "choice",
        options: ["nextTick", "setTimeout", "Promise", "readFile"],
        answer: "nextTick",
        steps: [
          "各候補がいつ実行される仕組みかを考える",
          "通常のイベントループ段階より前に優先されるものを選ぶ",
        ],
        hint:
          "名前どおり、現在の処理直後へ強く優先されるNode.js固有の仕組みです。",
        explain:
          "nextTick の再帰は飢餓を起こします。通常は Promise で足りることが多いです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "商品APIの全リクエストで設定ファイルを読む処理が、他の応答まで止めています。ブロッキングAPIの代わりに選ぶべき処理方式を1つ選んでください。",
        lead:
          "現在の読み取りは頻繁に通る経路で同期実行され、完了までイベントループを占有します。I/O待ちの間に別のリクエスト処理へ進み、完了後に結果を受け取れる方式を選びます。",
        kind: "choice",
        options: ["async", "Sync", "busy loop", "alert"],
        answer: "async",
        steps: [
          "待ち時間中にイベントループを空けられる方式を考える",
          "同期処理や待ち続けるループではない候補を選ぶ",
        ],
        hint:
          "処理完了をその場で待ち続けず、後で結果を受け取る方式です。",
        explain:
          "readFileSync などのブロッキング API はホットパスから外します。",
      },
    ],
  },
  {
    id: "node-error",
    track: "node",
    level: "advanced",
    chapter: "node-prod",
    order: 11,
    title: "エラーは投げて、コードを残す",
    summary: "Error、errno、未捕捉、終了",
    minutes: 14,
    slides: [
      {
        title: "Error は message と stack",
        lead: 'throw new Error("msg") は、呼び出しの積み重ね（stack）を持った失敗です。Node のシステムエラーは err.code（ENOENT など）と err.syscall が付きます。catch したら、握りつぶさずログし、回復できなければ再 throw かプロセス終了です。',
        talk: [
          { speaker: "beginner", text: "エラーはmessageだけ見れば原因が分かりますか？" },
          { speaker: "engineer", text: "stackで発生経路を、codeやsyscallで種類と操作を確認します。" },
          { speaker: "beginner", text: "catchできたなら、何もせず続けても安全ですよね？" },
          { speaker: "engineer", text: "回復できる場合だけ処理し、それ以外は再送出します。握りつぶすと失敗が成功に見えます。" },
        ],
        points: [
          "if (!x) throw より、Error に状況を載せる",
          "async では throw が Promise reject になる",
        ],
        diagram: "node-error",
        code: `try {
  await readFile(p);
} catch (err) {
  if (err.code === "ENOENT") return null;
  throw err;
}`,
      },
      {
        title: "コールバック時代の err 第一引数",
        lead: "古い Node API は (err, data) => です。err が truthy なら失敗。Promise 化（fs/promises、util.promisify）した方が await / catch に揃います。混ぜると漏れが出ます。",
        talk: [
          { speaker: "beginner", text: "コールバックのdataがあれば、成功として使ってよいですか？" },
          { speaker: "engineer", text: "先に第一引数のerrを確認し、あれば失敗として戻ります。" },
          { speaker: "beginner", text: "Promiseとコールバックを混ぜても、どちらかで捕まりますよね？" },
          { speaker: "engineer", text: "処理経路が分かれて漏れやすくなります。可能ならPromise版やpromisifyへ揃えます。" },
        ],
        points: ["err を無視すると、失敗が成功に見える"],
        diagram: "node-error",
      },
      {
        title: "未捕捉はプロセスを落とす方向",
        lead: "uncaughtException と unhandledRejection は最後の網です。ここで通常運転を続けるのは危険（状態が壊れている）です。ログして exit するのが無難です。予防は async の await 漏れを無くすことです。",
        talk: [
          { speaker: "beginner", text: "未処理エラーをイベントで拾えば、そのまま運転を続けられますか？" },
          { speaker: "engineer", text: "最後の網まで漏れた時点で、状態の安全を保証できません。" },
          { speaker: "beginner", text: "落ちるより、無理にでも応答を続けた方が親切では？" },
          { speaker: "engineer", text: "原因を記録して終了し、監視側に再起動させる方が安全です。普段はリクエスト境界でcatchし、await漏れを防ぎます。" },
        ],
        points: [
          "void promise は rejection を見失う",
          "サーバーならリクエスト単位で catch し、プロセスは残す",
        ],
        diagram: "node-error",
        code: `process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});`,
      },
      {
        title: "終了コードで自動化と会話する",
        lead: "CI や systemd は 0 以外を失敗と見ます。業務エラー（バリデーション）と、プロセスが死ぬべき障害を分けます。前者は HTTP 400 でプロセスは 0 のまま、後者は exit 1 です。",
        talk: [
          { speaker: "beginner", text: "入力ミスが一件あったら、サーバーも失敗終了させますか？" },
          { speaker: "engineer", text: "業務上のエラーは応答で伝え、プロセスは動かし続けます。" },
          { speaker: "beginner", text: "HTTPの400とプロセスの終了コードは同じものですか？" },
          { speaker: "engineer", text: "別の通信です。回復不能な障害だけ非0で終了し、CIや監視へ失敗を伝えます。" },
        ],
        points: [
          "CLI は例外＝非0 が分かりやすい",
          "長期サーバーは死なずにメトリクスへ出すことも多い",
        ],
        diagram: "node-error",
      },
      {
        title: "この講義の要点",
        lead: "code を見る。未捕捉は落とす。業務失敗とプロセス失敗を分ける。最後は本番運用です。",
        talk: [
          { speaker: "beginner", text: "エラー処理では、全部catchすればよいですか？" },
          { speaker: "engineer", text: "種類をcodeで判断し、回復できるものだけ処理します。" },
          { speaker: "beginner", text: "捕まえられない失敗も、ログだけ残して継続できますか？" },
          { speaker: "engineer", text: "未捕捉は安全な継続が難しいため終了方向です。利用者の入力エラーとは分けて扱います。" },
        ],
        points: ["握りつぶさない", "async の漏れを探す"],
        diagram: "node-error",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "starterのrecover関数を完成させてください。対象が見つからないエラーだけnullで回復し、それ以外は同じエラーを再送出します。既存の呼び出しでnullを1行表示してください。",
        lead:
          "Node.jsのシステムエラーはcodeで種類を判別できます。想定済みの不存在だけを処理し、権限不足などの予期しない失敗を成功扱いにしないようにします。",
        kind: "code",
        starter:
          'function recover(err) {\n  // 不存在だけ回復し、ほかは再送出\n}\nconsole.log(recover({ code: "ENOENT" }));\n',
        fileName: "app.js",
        steps: [
          "errのcodeが対象不存在を表すか確認する",
          "想定した不存在の場合だけnullを返す",
          "それ以外は受け取ったエラーを握りつぶさず再送出する",
        ],
        hint:
          "条件に一致した分岐は値を返して終えます。条件を通らなかった場合はthrowで呼び出し元へ失敗を戻します。",
        sample: "null",
        answer: `function recover(err) {
  if (err.code === "ENOENT") return null;
  throw err;
}
console.log(recover({ code: "ENOENT" }));`,
        explain:
          "err.codeで回復可能な種類だけを処理し、想定外のエラーは再送出します。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "starterのcb関数を完成させてください。errがある場合はその内容を表示して処理を終了し、ない場合だけdataを表示します。既存の呼び出しでfailが1行出れば完了です。",
        lead:
          "古いNode.jsのコールバックでは、第一引数が失敗、第二引数が成功時のデータを表します。失敗を先に判定して早期に戻ることで、成功処理を誤って続けないようにします。",
        kind: "code",
        starter:
          'function cb(err, data) {\n // 第一引数が失敗\n}\ncb("fail");\n',
        fileName: "app.js",
        steps: [
          "cb内でerrの有無を最初に判定する",
          "失敗時は内容を表示して、それ以降の成功処理へ進まないようにする",
          "成功時だけdataを表示し、既存の呼び出しは残してsampleと比較する",
        ],
        hint:
          "第一引数が存在する場合を先に処理し、その分岐から早く戻ります。第二引数の表示は失敗がない場合だけです。",
        sample: "fail",
        answer: `function cb(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data);
}
cb("fail");`,
        explain:
          "古い API は (err, data) です。err を無視すると失敗が成功に見えます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "注文サーバーで未処理のPromise拒否を最後のイベントハンドラが検知しました。そのまま新しい注文を受け続ける判断への評価を1つ選んでください。",
        lead:
          "拒否の原因は通常の処理境界で扱われず、注文状態の更新が途中まで進んだ可能性があります。原因を記録しただけで、内部状態の一貫性を保証して運転を続けられるかを判断します。",
        kind: "choice",
        options: [
          "復旧方法として常に推奨される",
          "状態が壊れている可能性があり危険",
          "処理速度が必ず大幅に上がる",
          "型エラーとして安全に停止する",
        ],
        steps: [
          "未処理エラーが最後の安全網まで到達した意味を考える",
          "速度や型ではなく、状態の信頼性を説明する候補を選ぶ",
        ],
        hint:
          "原因を処理せず握りつぶすと、その後も安全に処理できるとは限りません。",
        answer: "状態が壊れている可能性があり危険",
        explain:
          "未捕捉はログして終了するのが無難です。予防は await 漏れを無くすことです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "設定の破損で起動を続けられないCLIが、CIへ失敗を伝えて終了します。一般的に使われる終了コードを1つ選んでください。",
        lead:
          "現在の処理は回復不能で、成果物も作成できていません。HTTP応答番号ではなく、OSやCIがプロセス失敗と判断できる一般的な非ゼロ値を選びます。",
        kind: "choice",
        options: ["1", "0", "200", "404"],
        answer: "1",
        steps: [
          "プロセス終了コードとHTTPステータスを区別する",
          "正常終了ではないことを示す一般的な値を選ぶ",
        ],
        hint:
          "成功を表す値の次にある、最も一般的な非ゼロの整数です。",
        explain: "バリデーション失敗はプロセスを生かし、障害は非0 で終えます。",
      },
    ],
  },
  {
    id: "node-prod",
    track: "node",
    level: "advanced",
    chapter: "node-prod",
    order: 12,
    title: "本番で効くプロセスの話",
    summary: "環境、クラスタ、graceful shutdown",
    minutes: 14,
    slides: [
      {
        title: "NODE_ENV は慣習であり魔法ではない",
        lead: "production だと、ライブラリが最適化やログ抑制をすることがあります。自分のコードもそれで分岐できますが、忘れられた開発フラグが本番に残る事故もあります。明示フラグの方が安全なこともあります。",
        talk: [
          { speaker: "beginner", text: "NODE_ENVをproductionにすれば、自動で全部安全になりますか？" },
          { speaker: "engineer", text: "慣習的な環境名であり、セキュリティを保証する魔法ではありません。" },
          { speaker: "beginner", text: "APIキーも同じ変数へ入れて切り替えれば簡単ですよね？" },
          { speaker: "engineer", text: "秘密は専用の環境変数へ分けます。依存の挙動変化や残った開発フラグも確認してください。" },
        ],
        points: [
          "依存ライブラリの挙動が変わる点に注意",
          "秘密は NODE_ENV ではなく専用の env",
        ],
        diagram: "node-prod",
        code: `if (process.env.NODE_ENV === "production") {
  // 詳細ログを落とす、など
}`,
      },
      {
        title: "1プロセスは1コアの JS",
        lead: "CPU を余らせているなら、cluster や PM2、コンテナのレプリカでプロセスを増やします。メモリ空間は別なので、インメモリのセッションは共有されません。共有は Redis など外へ出します。",
        talk: [
          { speaker: "beginner", text: "CPUが8コアなら、一つのNodeが自動で全部使いますか？" },
          { speaker: "engineer", text: "一つのJS実行は基本1コアなので、必要ならプロセスを増やします。" },
          { speaker: "beginner", text: "プロセスを増やしても、メモリ上のセッションは共有されますよね？" },
          { speaker: "engineer", text: "メモリ空間は別です。共有状態は外部ストアへ置き、WebSocketでは振り分け方にも注意します。" },
        ],
        points: [
          "sticky が必要な接続（WebSocket）はロードバランサの設定が要る",
          "worker_threads は同じプロセス内の CPU 向き",
        ],
        diagram: "node-prod",
      },
      {
        title: "止めるときは新規を断ってから閉じる",
        lead: "SIGTERM で listen を止め（新規拒否）、進行中のリクエストが終わるのを待ち、DB プールを閉じ、exit します。強制 kill までの猶予はオーケストレータの terminationGracePeriod です。",
        talk: [
          { speaker: "beginner", text: "デプロイ時は、古いプロセスをすぐ終了してよいですか？" },
          { speaker: "engineer", text: "新規受付を止め、進行中の処理と接続を閉じてから終了します。" },
          { speaker: "beginner", text: "すべて終わるまで、時間制限なしで待つのが丁寧ですよね？" },
          { speaker: "engineer", text: "無限待ちはデプロイを止めます。readinessを先に落とし、猶予時間内でDBなどを片付けます。" },
        ],
        points: [
          "readiness を先に落とすと、LB が新規を流さなくなる",
          "無限に待つとデプロイが終わらない。上限時間を決める",
        ],
        diagram: "node-prod",
        code: `process.on("SIGTERM", async () => {
  server.close();
  await db.end();
  process.exit(0);
});`,
      },
      {
        title: "ログは構造化し、stdout へ",
        lead: "コンテナはファイルより標準出力を集めます。JSON 1行、request id、所要時間。console.log の生文字列だけだと、あとから検索できません。秘密をログに出さないのは process 講義と同じです。",
        talk: [
          { speaker: "beginner", text: "本番ログは、サーバー内のファイルへ保存すればよいですか？" },
          { speaker: "engineer", text: "コンテナでは標準出力へ出し、基盤側で収集する形が一般的です。" },
          { speaker: "beginner", text: "人が読める文章なら、後から十分探せますよね？" },
          { speaker: "engineer", text: "JSON一行にrequest idや所要時間を持たせると検索できます。秘密は含めず、ヘルスチェックも軽く保ちます。" },
        ],
        points: ["ヘルスチェック /health は軽く、依存を叩きすぎない"],
        diagram: "node-prod",
      },
      {
        title: "この講義の要点",
        lead: "env で環境を分ける。CPU はプロセス増。SIGTERM で優雅に止める。ログは stdout。Node コースはここまでです。",
        talk: [
          { speaker: "beginner", text: "ローカルで動いたNodeを、そのまま本番へ置けば完了ですか？" },
          { speaker: "engineer", text: "環境設定、複数プロセス、停止手順、ログ収集までが運用です。" },
          { speaker: "beginner", text: "状態を各プロセスに持たせても、同じアプリなら共有できますよね？" },
          { speaker: "engineer", text: "状態は外へ出し、終了要求では順序立てて閉じます。標準出力と終了コードで基盤と会話します。" },
        ],
        points: ["状態はプロセスの外へ", "終了は締めの手順がある"],
        diagram: "node-prod",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt:
          "本番デプロイでNODE_ENVをproductionに設定しました。この設定によって実際に期待できることの説明を1つ選んでください。",
        lead:
          "現在の値はライブラリや自分のコードが参照できますが、APIキーや安全な設定が自動生成されるわけではありません。読み取る側が実装した挙動切り替えと、保証されない効果を区別します。",
        kind: "choice",
        options: [
          "コードの挙動切替に使われる慣習",
          "すべての脆弱性を自動修正する機能",
          "APIキーを保存する専用領域",
          "複数プロセスのメモリを共有する機能",
        ],
        answer: "コードの挙動切替に使われる慣習",
        steps: [
          "環境名によって依存や自分のコードが分岐し得ることを確認する",
          "セキュリティや秘密管理を自動化する魔法ではない説明を選ぶ",
        ],
        hint:
          "環境名を読む側が実装して初めて効果があります。秘密は別の設定へ分けます。",
        explain:
          "NODE_ENVは挙動切り替えの慣習です。productionにしても安全性が自動保証されるわけではありません。",
      },
      {
        id: "q2",
        slide: 1,
        prompt:
          "Node.jsサーバーを複数プロセスへ増やした場合、各プロセスのメモリ上にあるセッションについて正しい説明を1つ選んでください。",
        lead:
          "プロセスを増やすと複数のCPUコアを活用できますが、それぞれは独立したメモリ空間を持ちます。利用者の次のリクエストが別プロセスへ届く場面を考えます。",
        kind: "choice",
        options: [
          "自動では共有されないため外部ストアなどが必要",
          "同じアプリ名なら自動的に共有される",
          "環境変数へ入れれば全利用者で安全に共有される",
          "プロセス数を増やすとセッションは不要になる",
        ],
        answer: "自動では共有されないため外部ストアなどが必要",
        steps: [
          "各プロセスが独立したメモリ空間を持つことを確認する",
          "複数プロセスから同じ状態を参照する方法を説明した候補を選ぶ",
        ],
        hint:
          "Redisやデータベースのように、どのプロセスからも参照できる場所へ状態を置く構成を考えます。",
        explain:
          "各プロセスのメモリは独立しています。共有セッションはRedisなど外部へ置きます。",
      },
      {
        id: "q3",
        slide: 2,
        prompt:
          "デプロイなどでプロセスへ通常の終了を依頼し、graceful shutdownを始めるシグナルを1つ選んでください。",
        lead:
          "本番プロセスは終了要求を受けたら、新規受付を止め、進行中の処理と接続の後片付けをしてから終了します。キーボード割り込みや強制終了とは異なる、運用上の標準的な終了要求を選びます。",
        kind: "choice",
        options: ["SIGTERM", "SIGINT", "SIGHUP", "SIGKILL"],
        answer: "SIGTERM",
        steps: [
          "通常の運用で送られる終了要求と強制終了を区別する",
          "後片付けを開始できるシグナルを選ぶ",
        ],
        hint:
          "名前の末尾がterminateの略で、プロセスに終了を依頼するものです。",
        explain: "SIGTERM で新規を断り、進行中を待ってから exit します。",
      },
      {
        id: "q4",
        slide: 3,
        prompt:
          "複数コンテナの注文APIから出る通常ログを、基盤側でまとめて収集・検索します。アプリがログを出す先として適切なものを1つ選んでください。",
        lead:
          "コンテナは入れ替わるため、特定の一時ファイルだけにログを残すと追跡できません。各プロセスから基盤が収集できる、通常出力用の標準ストリームを選びます。",
        kind: "choice",
        options: [
          "標準出力の stdout",
          "localStorage",
          "画面通知の alert",
          "一時保存の /tmp",
        ],
        answer: "標準出力の stdout",
        steps: [
          "コンテナ基盤がプロセスから収集しやすい出力を考える",
          "通常ログ用の標準ストリームを選ぶ",
        ],
        hint:
          "診断用ではなく、プロセスの通常出力としてOSが用意するストリームです。",
        explain:
          "コンテナは stdout / stderr を集めます。秘密はログに出しません。",
      },
    ],
  },
];
