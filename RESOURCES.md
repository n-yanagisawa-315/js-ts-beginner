# JavaScript / TypeScript / Node.js Resources

## Learning science

- [Learning design evidence](./EVIDENCE.md)
  この教材で採用する検索練習、分散学習、足場除去、自己説明、物語・図解、習熟判定の根拠と限界。機能を追加するときは、対応する根拠と適用条件を先に更新する。
- [Retrieval and distributed practice systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11078833/)
  想起と間隔を空けた練習の教育現場での効果をまとめたレビュー。唯一の最適間隔があるとは扱わない。
- [Multimedia design meta-meta-analysis](https://doi.org/10.3102/00346543211052329)
  図・文章・強調・分割を組み合わせる条件の統合研究。装飾ではなく、同じ情報を近接・同期させる判断に使う。
- [Neuromyths systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7835631/)
  学習スタイル、右脳・左脳など「脳科学風」の主張を教材へ入れないための確認資料。

## Knowledge

- [MDN: JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
  言語機能を章立てで学ぶための Mozilla の解説。使いどころ: 構文や概念を初めて学び、動く例とともに全体像をつかむとき。
- [MDN: JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
  組み込みオブジェクト、演算子、文、関数のリファレンス。使いどころ: API の引数、戻り値、例外、ブラウザー対応を確認するとき。
- [ECMAScript Language Specification](https://tc39.es/ecma262/)
  JavaScript の規範となる TC39 の仕様。使いどころ: 暗黙の型変換、評価順序、言語機能の厳密な挙動を MDN より深く検証するとき。
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  TypeScript チームによる公式ハンドブック。使いどころ: 型推論、絞り込み、関数、オブジェクト型など、日常的な型付けの考え方を調べるとき。
- [TypeScript Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
  バージョンごとの追加機能と変更点の公式記録。使いどころ: 使用中の TypeScript バージョンで構文や型検査がどう変わったか確認するとき。
- [Node.js Learn](https://nodejs.org/learn)
  Node.js 公式の段階的な学習資料。使いどころ: ランタイム、非同期処理、ファイル操作、HTTP などを概念から学ぶとき。
- [Node.js API Documentation](https://nodejs.org/api/)
  Node.js 組み込みモジュールと実行環境の公式 API リファレンス。使いどころ: `fs`、`path`、`process`、`http` などの正確な契約とバージョン差を確認するとき。
- [npm Docs](https://docs.npmjs.com/)
  npm CLI、`package.json`、依存関係、公開手順の公式資料。使いどころ: コマンドの意味、設定、パッケージ管理の挙動を検証するとき。

## Wisdom (Communities)

- [Stack Overflow: javascript](https://stackoverflow.com/questions/tagged/javascript)
  JavaScript の具体的な不具合を検索・質問する場。最小で再現可能な例、期待結果、実際の結果、実行環境を示し、回答は必ず上の一次資料と手元の実行で再検証する。
- [Stack Overflow: typescript](https://stackoverflow.com/questions/tagged/typescript)
  型エラーや型設計の具体例を比較する場。TypeScript バージョン、`tsconfig`、最小コードを添え、型アサーションだけで隠す回答には特に注意する。
- [Stack Overflow: node.js](https://stackoverflow.com/questions/tagged/node.js)
  Node.js の実行時エラーや API 利用例を探す場。Node.js バージョン、OS、実行コマンド、完全なエラーを示し、古い API の回答は現行 API 資料で確認する。
- [Node.js: Get Involved](https://nodejs.org/en/about/get-involved)
  Node.js 公式の参加導線。使いどころ: 公式 GitHub、議論、イベントなど、プロジェクトに近い場所で現行の運用や判断を確かめるとき。
- [TC39 on GitHub](https://github.com/tc39)
  ECMAScript を標準化する TC39 の公式組織。使いどころ: proposal の段階、仕様議論、会議記録を確認するとき。提案中の機能と標準化済み機能を混同しない。
- [TypeScript Community](https://www.typescriptlang.org/community/)
  TypeScript 公式サイトが案内するコミュニティ導線。使いどころ: 利用者やメンテナーとの交流先を選ぶとき。回答は Handbook、release notes、再現コードで検証する。
