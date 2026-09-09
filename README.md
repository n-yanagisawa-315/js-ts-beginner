# JS / TS / Node しくみ講座

JavaScript、TypeScript、Node.jsを、コード・会話・図解・演習で学ぶ初心者向けWeb教材です。49講義、262スライド、213問を収録しています。

公開サイト: [https://js-ts-beginner.vercel.app](https://js-ts-beginner.vercel.app)

## 特徴

- 初心者とエンジニアの会話で、専門用語を日常語から説明
- 注文管理画面から型安全な設計、注文APIへ続く実務ストーリー
- コード行と実行状態を対応させた図解
- 予想、完成例、1行穴埋め、行並べ替え、独力問題、転移問題
- 誤答選択肢に応じたフィードバックと自己説明
- 期限後の無支援初回正答だけを進級に使う復習キュー
- 保持率、概念別習熟、自信度と正答のずれを表示

学習方法の根拠と採用しない主張は [EVIDENCE.md](./EVIDENCE.md) に記録しています。

## 講座構成

- JavaScript 25講義: 実行順、値、関数、配列、非同期、モジュール、npm
- TypeScript 12講義: 型注釈、オブジェクト、ユニオン、関数型、unknown、ジェネリクス、条件型
- Node.js 12講義: ランタイム、CLI、CJS/ESM、process、fs、HTTP、ストリーム、libuv、本番運用

学習履歴はブラウザの `localStorage` に保存されます。アカウント登録や健康情報の収集はありません。

## ローカル実行

必要環境: Node.js 20以降、npm

```bash
git clone git@github.com:n-yanagisawa-315/js-ts-beginner.git
cd js-ts-beginner
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

## 品質確認

```bash
npm run lint
npm run build
npm run audit:questions
npm run audit:clarity
npm run audit:dialogues
npm run audit:granularity
npm run audit:grading
npm run audit:learning
npm run audit:learning-engine
```

## Vercelへデプロイ

Vercel CLIを使う場合:

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

GitHubリポジトリをVercelへ接続すると、production branchへのpushから自動デプロイできます。Next.jsの標準設定で動作し、環境変数は不要です。

## 設計資料

- [MISSION.md](./MISSION.md): 到達目標
- [EVIDENCE.md](./EVIDENCE.md): 学習設計の根拠・限界・非採用事項
- [RESOURCES.md](./RESOURCES.md): 公式資料と参考文献
- [NOTES.md](./NOTES.md): 教え方とUIの継続方針
- [JavaScript早見表](./reference/javascript-core.html)
- [TypeScript早見表](./reference/typescript-core.html)
- [Node.js早見表](./reference/node-core.html)
