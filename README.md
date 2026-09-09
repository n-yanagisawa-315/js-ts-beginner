# JS / TS / Node / SQL / GitHub しくみ講座

JavaScript、TypeScript、Node.js、SQL、GitHubを、コード・会話・図解・演習で学ぶ初心者向けWeb教材です。97講義、429スライド、372問を収録しています。

公開サイト: [https://js-ts-beginner.vercel.app](https://js-ts-beginner.vercel.app)

## 特徴

- 初心者とエンジニアの会話で、専門用語を日常語から説明
- 注文管理画面から型安全な設計、注文APIへ続く実務ストーリー
- Worker内SQLiteとメモリ内Git/GitHubで、実環境を変更せずに操作を練習
- JavaScript・TypeScript・Node.jsに各12問の厳選チャレンジ
- 最初に触れる完成見本と、隔離された画面プレビューで進めるDOM実習
- コード行と実行状態を対応させた図解
- 予想、完成例、1行穴埋め、行並べ替え、独力問題、転移問題
- 誤答選択肢に応じたフィードバックと自己説明
- 質問内容を外部へ送信しない、段階的ヒント型のAI質問機能
- 期限後の無支援初回正答だけを進級に使う復習キュー
- 保持率、概念別習熟、自信度と正答のずれを表示

学習方法の根拠と採用しない主張は [EVIDENCE.md](./EVIDENCE.md) に記録しています。

## 講座構成

- JavaScript 37講義: 実行順、値、関数、配列、非同期、DOM、モジュール、npm、チャレンジ
- TypeScript 16講義: 型注釈、オブジェクト、ユニオン、unknown、ジェネリクス、条件型、チャレンジ
- Node.js 16講義: ランタイム、CLI、process、fs、HTTP、非同期I/O、本番運用、チャレンジ
- SQL 14講義: SELECT、WHERE、並べ替え、集計、JOIN、更新、制約、トランザクション
- GitHub 14講義: commit、branch、remote、Pull Request、競合、Issue、Actions、保護ルール

アカウント登録は不要です。個人情報は収集しません。

## 開発と検証

Node.js 22.6以降を使用します。

```bash
npm install
npm run dev
```

変更後の一括検証は `npm run verify` で実行します。lint、型検査、静的監査、
古い `.next` を削除した本番ビルド、Client bundle/HTML/RSC予算監査、
Chromium上のVercel Labs agent-browser E2Eをこの順番で実行します。

```bash
npm run e2e:install       # 初回のみChromiumをインストール
npm run verify:static       # ブラウザE2Eを除く検証
npm run e2e                 # クリーンビルド後に全E2E
npm run e2e:learning        # 学習・復習フローだけ
npm run e2e:catalog         # 講座カタログだけ
npm run e2e:extensions      # SQL・GitHubだけ
npm run e2e:ui              # responsive・keyboardだけ
npm run e2e:review          # 復習データフローだけ
```

E2Eは `scripts/e2e-agent-browser.mjs` が `127.0.0.1:3100` の本番サーバーと
suiteごとのagent-browser sessionを管理します。既にポートが使われている場合は
既存プロセスを停止せず失敗します。失敗時のスクリーンショットは
`test-results/agent-browser/` に保存します。
通常の画面エラーはE2E対象で、ルート/global errorは本番専用の失敗hookを追加せず
静的監査でfallbackと再試行ボタンの構造を確認します。

ビルドはWebpackを明示しています。Client reference manifestと
`react-loadable-manifest.json`を安定した入力として、route初期JSと遅延chunkを
ハッシュ名に依存せず監査するためです。

## 設計資料

- [MISSION.md](./MISSION.md): 到達目標
- [EVIDENCE.md](./EVIDENCE.md): 学習設計の根拠・限界・非採用事項
- [RESOURCES.md](./RESOURCES.md): 公式資料と参考文献
- [NOTES.md](./NOTES.md): 教え方とUIの継続方針
- [JavaScript早見表](./reference/javascript-core.html)
- [TypeScript早見表](./reference/typescript-core.html)
- [Node.js早見表](./reference/node-core.html)
- [SQL早見表](./reference/sql-core.html)
- [Git・GitHub早見表](./reference/github-core.html)

## ライセンスと帰属

TypeScriptチャレンジの構成検討ではMITライセンスの
[type-challenges](https://github.com/type-challenges/type-challenges)を参考にしています。
問題文・注文管理ストーリー・テストケースは本教材向けに独自作成しており、
原典の問題文は複製していません。
