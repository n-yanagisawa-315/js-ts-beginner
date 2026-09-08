# Learning design evidence

この教材は「脳科学らしく聞こえること」ではなく、実際の学習成果を扱ったメタ分析・系統的レビューを優先します。効果量は対象、課題、保持期間で変わるため、固定された万能手順や最適間隔は主張しません。

## 採用する方法

### 検索練習と分散学習

- **使い方**: 説明を読んだ直後だけでなく、時間を空けて、資料を閉じた状態から答えを取り出す。
- **実装**: 学習前の予想、出口想起、期限後の別問題、無支援初回正答だけを復習間隔の進級に使う。
- **限界**: 唯一の最適間隔は確認されていない。期限、保持目標、誤答履歴に応じて調整する。
- **根拠**:
  - [Distributed and retrieval practice systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11078833/)
  - [Distributed practice in classroom learning meta-analysis](https://doi.org/10.3390/bs15060771)
  - [Retrieval practice in schools systematic review](https://doi.org/10.1007/s10648-021-09595-9)

### Worked example と段階的な足場除去

- **使い方**: 初学者はいきなり白紙から書かず、完成例を追い、一部を補い、最後に独力で作る。
- **実装**: `worked → faded → independent → transfer` の順で starter・手順・ヒントを減らす。コード学習では行並べ替えと穴埋めも使う。
- **限界**: 支援を長く残すと独力生成を妨げるため、習熟に応じて外す。
- **根拠**:
  - [Worked examples meta-analysis](https://doi.org/10.1007/s10648-022-09651-2)
  - [Faded Parsons problems for programming](https://doi.org/10.1145/3411764.3445228)

### 説明付きフィードバック

- **使い方**: 正誤だけでなく、どの考え方が違い、どこを見直し、次に何を試すかを返す。
- **実装**: 誤概念ID別の説明、段階ヒント、答え閲覧後の別問題を用意する。
- **限界**: 即時・遅延の優劣は課題に依存する。初学者のコード練習では誤りを固定しないよう、その場で具体的に返す。
- **根拠**:
  - [Feedback meta-analysis](https://doi.org/10.3389/fpsyg.2019.03087)
  - [Computer-based elaborated feedback meta-analysis](https://doi.org/10.3102/0034654314564881)

### 自己説明とコードトレース

- **使い方**: コードを日本語へ言い換え、値と実行位置がなぜ変わったかを説明する。
- **実装**: 中心概念、誤答後、章末に短い説明課題を置く。最初は文の骨組みを提示し、後で自由記述へ移す。
- **限界**: 毎画面で自由記述を要求すると認知負荷が増えるため、重要箇所に限定する。
- **根拠**:
  - [Inducing self-explanation meta-analysis](https://doi.org/10.1007/s10648-018-9434-x)
  - [Scaffolded self-explanations for code comprehension](https://par.nsf.gov/servlets/purl/10447589)

### 似た概念の交互学習

- **使い方**: 学習直後は概念ごとに練習し、基本を得た後で、似た方法から適切なものを選ぶ。
- **実装**: `let / var`、`for / forEach / map`、`type / interface` などを contrast group として混ぜる。
- **限界**: 無関係な話題をランダムに混ぜることは目的にしない。文章や単語では逆効果の報告もある。
- **根拠**:
  - [Interleaved learning meta-analysis](https://doi.org/10.1037/bul0000209)
  - [Spacing and interleaving systematic review](https://doi.org/10.1007/s10648-021-09613-w)

### 物語、図解、チャンク化

- **使い方**: 仕事上の問題、原因、コードの実行、解決を短い因果でつなぐ。文章と図は同じ変数・同じ瞬間を近くに置く。
- **実装**: 1チャンク1中心目標、自己ペースの会話、実行順の強調、JSからTS、Nodeへ続く注文管理の物語を使う。
- **限界**: 面白いだけで目標と無関係な詳細は転移を妨げる。飾りの画像、重複文章、強制アニメーションは加えない。
- **根拠**:
  - [Narrative versus expository text meta-analysis](https://doi.org/10.3758/s13423-020-01853-1)
  - [Multimedia design meta-meta-analysis](https://doi.org/10.3102/00346543211052329)

### 習熟学習とメタ認知

- **使い方**: その場で正解したことと、時間後にも独力で使えることを分ける。答えを見る前に自信度を記録し、理解した感覚と実際の結果のずれを見せる。
- **実装**: 閲覧完了、練習中、保持、転移、習熟を別状態にし、遅延後の無支援想起と転移で習熟を判定する。
- **限界**: 万能な合格率はない。閾値は教材上の運用値として明示し、実データで見直す。
- **根拠**:
  - [Mastery learning meta-analysis](https://doi.org/10.3102/00346543060002265)
  - [Metacomprehension interventions meta-analysis](https://doi.org/10.3102/00346543221094083)

## 補助的に扱う方法

- **事前質問**: 質問された内容の学習には有効だが、質問されていない内容への一般化はほぼない。各講義の中心目標を予想させる用途に限定する。[Meta-analysis](https://doi.org/10.3758/s13423-023-02353-8)
- **睡眠**: 十分な睡眠は学習・想起・固定に重要。ただし「寝る前30分」を一律の最適条件にしない。睡眠時刻や健康情報は記録しない。[Harvard Sleep and Memory](https://sleep.hms.harvard.edu/education-training/public-education/sleep-and-health-education-program/sleep-health-education-88)
- **覚醒時休息**: 実験室での記憶課題には効果がある一方、教室への移行研究は混在する。任意の休憩案内に留める。[Meta-analysis](https://doi.org/10.3758/s13423-025-02665-x)
- **成長マインドセット**: 単独介入の学業効果は非常に小さく、質の高い研究に限定すると確認できない。才能を褒める代わりに、具体的な学習方略を案内する。

## 採用しない主張

- 視覚型・聴覚型などへ教材を一致させれば成績が上がる
- 右脳型・左脳型に合わせる
- 脳の一部しか使っていない、脳トレだけで一般能力が上がる
- 特定の睡眠時刻、休憩分数、復習間隔が全員に最適
- ゲーム化、連続日数、意気込みだけで長期保持が高まる

これらは学習画面のコピー、進捗指標、通知理由として使用しません。
