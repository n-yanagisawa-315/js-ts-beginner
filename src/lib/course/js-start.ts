import type { Lesson } from "@/lib/course/types";

export const jsStart: Lesson[] = [
  {
    id: "js-run",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 1,
    title: "プログラムは上から1行ずつ動く",
    summary: "JavaScript とは何か、書いた順に動く、という一番下",
    minutes: 20,
    slides: [
      {
        title: "JavaScript は、手順を機械にやってもらう言葉",
        lead: "プログラムは、人の代わりに「これをやって」と書いた手順書です。JavaScript（略して JS）は、その書き方のひとつです。今この講座の画面も、ブラウザの中で JavaScript が動いて作られています。最初は英単語に見えますが、今覚える命令はまだ少しです。料理のレシピと同じで、単語の意味が分かれば読めます。",
        points: [
          "手順書を保存しただけでは何も起きない。実行すると、機械が上から読む",
          "この講座の右の窓が、いま動いている結果です。別のアプリを開かなくてよい",
          "最初に使うのは「画面に出す」「名前を付ける」「計算する」。それ以外は後回しでよい",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "JavaScriptって、最初からたくさん英単語を覚えないと動かせませんか？"
          },
          {
            "speaker": "engineer",
            "text": "大丈夫。まずは少ない命令で、機械に手順を頼めれば十分です。"
          },
          {
            "speaker": "beginner",
            "text": "この画面に文字を出すのも、ファイルへ書いただけで勝手に始まるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "書いたものはレシピと同じで、実行して初めて上から読まれます。ここでは右の結果欄で動きを見られます。Javaとは別の言語なので、名前だけで混同しなくていいですよ。"
          }
        ],
        diagram: "sequence",
        code: `console.log("はじめます");
// この1行が「画面に、はじめます と出せ」というお願い`,
        codeCaption: "最初のお願い。画面に出す",
        codeExample: `console.log("はじめます");`,
        note: "Java と JavaScript は名前が似ているだけで、別の言語です。ここでは JavaScript だけを扱います。",
      },
      {
        title: "1行が、機械へのひとつのお願い",
        lead: "コードは横に長い作文ではなく、縦に並んだ短いお願いです。1行がだいたい1つの作業です。英単語は命令の名前、そのあとの括弧 ( ) は「何を対象にするか」を入れる皿です。今は console.log だけ覚えれば進めます。console は作業場の窓、log は「記録して見せる」くらいのイメージで十分です。",
        points: [
          "console.log(...) は「括弧の中身を画面に出せ」",
          "大文字と小文字は別物。Console.log や CONSOLE.LOG では動かない",
          "行末の ; は句点。この講座では付けても付けなくても、同じように動くことが多い",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "console.log の点や括弧まで、全部意味があるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "あります。今は全体を「括弧の中身を見せる命令」と読めばOKです。"
          },
          {
            "speaker": "beginner",
            "text": "Console.log と書いたり、日本語の全角括弧を使ったりしても見た目は近いですよね？"
          },
          {
            "speaker": "engineer",
            "text": "JavaScriptは大文字小文字と半角記号を区別します。括弧は渡す値の置き場、行末のセミコロンは句点のようなものです。この講座では付けても付けなくても動く場面が多いです。"
          }
        ],
        diagram: "sequence",
        code: `console.log("1行です");
console.log("次の行です");`,
        codeCaption: "1行、1お願い。上から順",
        codeExample: `console.log("1行です");`,
        watch:
          "全角の括弧（）や引用符「」は使えません。キーボードの半角 ( ) と \" \" です。",
      },
      {
        title: "コードはレシピ、実行は調理",
        lead: "JavaScript のファイルは、まだ動いていない料理のレシピです。冷蔵庫にレシピを貼っただけでは、ご飯はできません。「実行する」が、料理人にレシピを渡す操作です。この講座では提出や実行ボタンがそれに当たります。エンジン（料理人）が上から1行ずつ読んで、その行の作業をその場で行います。2行目は、1行目が終わるまで始まりません。映画のフィルムを上から順に見るのと同じです。",
        points: [
          "保存しただけでは何も起きない。実行ボタンを押した瞬間に上から始まる",
          "1行は「命令」。料理の1手順。終わってから次へ",
          "途中の手順を入れ替えると、出来上がりの順番も変わる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "3行書いたら、JavaScriptが効率のよい順に並べ替えてくれるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "基本は、書いた上から順番に1行ずつ進みます。"
          },
          {
            "speaker": "beginner",
            "text": "じゃあ「さん」を先に書いても、意味を読んで「いち」から表示してくれるわけではない？"
          },
          {
            "speaker": "engineer",
            "text": "その通り。先に置いた表示が先に動き、終わってから次へ進みます。順番を変えたいならコードの位置を変えますし、保存だけでなく実行する操作も必要です。"
          }
        ],
        diagram: "sequence",
        code: `console.log("いち");
console.log("に");
console.log("さん");
// 画面には いち → に → さん の順で出る`,
        codeCaption: "書いた順に実行。レシピどおり",
        codeExample: `console.log("さん");
console.log("いち");
// 先に書いた行が先。並びを変えると表示順も変わる`,
        watch:
          "あとから書いた行が先に動く、ということは通常ありません。順番を入れ替えたいなら、コードの位置を変えます。",
      },
      {
        title: "console.log は「窓から見せる」命令",
        lead: "console.log は、プログラムが扱っている値を確認用の窓へ表示する命令です。英語のlogは記録、consoleは操作盤という意味です。ブラウザでは開発者ツール、Node.jsではターミナルへ表示されます。",
        points: [
          "括弧の中が「何を見せるか」。外の console.log が「見せるという行為」",
          "ブラウザなら開発者ツールの Console、Node ならターミナルに出る",
          "表示された内容が、自動で次の命令の入力になるわけではない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "console.logは、利用者向けの画面を作る命令ですか？"
          },
          {
            "speaker": "engineer",
            "text": "主に開発中の確認用です。ブラウザなら開発者ツールのConsoleへ表示します。"
          },
          {
            "speaker": "beginner",
            "text": "一度表示した内容は、次の行が自動で受け取りますか？"
          },
          {
            "speaker": "engineer",
            "text": "受け取りません。console.logは指定した値を確認場所へ見せる操作です。値の保存や変数への代入は、後の講義で別に扱います。"
          }
        ],
        diagram: "sequence",
        code: `console.log("確認中");
console.log(3);`,
        codeCaption: "括弧の中の値を確認場所へ表示",
        codeExample: `console.log("開始");
console.log("終了");`,
        note: "この段階では、console.logは「括弧の中を表示する命令」とだけ覚えれば十分です。",
      },
      {
        title: "引用符と括弧はセットで使う",
        lead: '初めて見る記号の役目を固定します。" " は「これは言葉です」という名札。console.log の ( ) は「この中を渡す」皿です。名札を付け忘れると、エンジンはそれを命令の名前だと誤解します。',
        points: [
          "こんにちは だけでは、そんな名前の変数を探せ、になる",
          '"こんにちは" は文字の列という値',
          "括弧の開き ( には、必ず閉じ ) がいる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "日本語の「こんにちは」は、そのまま括弧へ入れても文字だと分かりませんか？"
          },
          {
            "speaker": "engineer",
            "text": "分かりません。文字列には引用符という名札が必要です。"
          },
          {
            "speaker": "beginner",
            "text": "数の3にも同じ名札を付けた方が安全ですか？"
          },
          {
            "speaker": "engineer",
            "text": "数値の3には不要で、付けると文字の「3」という別の値になります。開いた半角括弧は閉じ、引用符も左右をそろえてください。引用符なしの単語は変数名として探されます。"
          }
        ],
        diagram: "sequence",
        code: `console.log("こんにちは");
console.log(3);
// 言葉は引用符。数はそのまま`,
        codeCaption: "名札（引用符）と皿（括弧）",
        codeExample: `// console.log(こんにちは); // エラー。名札が無い
console.log("こんにちは"); // 動く`,
        watch:
          "日本語も英語も、言葉なら引用符で囲みます。数の 3 には引用符は不要です。",
      },
      {
        title: "コメントはレシピの余白メモ",
        lead: "料理人が読むのは手順だけです。余白に書いた「塩は後で足す」は実行されません。// から行末、および /* */ で囲んだ部分はエンジンが飛ばします。人のためのメモで、動かしたいコードと説明を同じファイルに置けます。",
        points: [
          "// は「この行のここから無視」。付箋を貼った行",
          "/* と */ の間は複数行まとめて無視。ページを折った部分",
          "コメントアウトすると、その命令は無かったことになる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "試しに止めたい行は、毎回削除するしかないですか？"
          },
          {
            "speaker": "engineer",
            "text": "削除せず、コメントにすれば実行対象から外せます。"
          },
          {
            "speaker": "beginner",
            "text": "行頭に // を置いたら、その行の命令は残っていても動かないんですね？"
          },
          {
            "speaker": "engineer",
            "text": "はい。// から行末までは人向けのメモで、複数行なら /* と */ で囲めます。あとで戻す可能性がある処理を一時的にコメントアウトするのにも使えます。"
          }
        ],
        diagram: "sequence",
        code: `console.log("動く");
// console.log("動かない");
/* ここも無視 */`,
        codeCaption: "メモは調理しない",
        codeExample: `console.log("A");
// console.log("B");
console.log("C");
// 表示は A と C。B は余白メモ`,
        note: "しばらく動かしたくない行は消さず、先頭に // を付けて残します。",
      },
      {
        title: "エラーは電車が止まる",
        lead: "存在しない名前や、括弧の閉じ忘れはエラーです。途中駅で線路が切れると、その先の駅には着きません。赤い文字や英語のメッセージが出たら「どこで止まったか」を見ます。エラーの行より下は原則走りません。すでに通った駅（上の行）の結果は残っています。最初はメッセージを全部理解しなくてよいです。止まった行を直す、で十分です。",
        points: [
          "構文エラー（括弧不足など）は、発車前に点検で止まることもある",
          "実行時エラーは、そこに来るまで上の行は成功している",
          "直すときは「最初のエラー」から。後続は連鎖しやすい",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "赤いエラーが何個も出たら、下から直した方が新しい問題ですよね？"
          },
          {
            "speaker": "engineer",
            "text": "まず最初に出たエラーから直すのが近道です。"
          },
          {
            "speaker": "beginner",
            "text": "途中で名前を間違えた場合、その上で表示済みの内容まで消えますか？"
          },
          {
            "speaker": "engineer",
            "text": "実行時エラーなら上の成功分は残り、止まった行より下は進みません。括弧不足などの構文エラーは開始前に止まることもあります。何も出ないときは、目的の行より上を確認しましょう。"
          }
        ],
        diagram: "sequence",
        code: `console.log("ここまでは出る");
unknownName; // ここで止まる
console.log("ここは出ない");`,
        codeCaption: "止まった駅より先には行かない",
        codeExample: `console.log("ここまでは出る");
console.log("ここも出る");
// 止まらなければ、下の行まで進む`,
        watch:
          "画面に何も出ないときは、もっと上の行で止まっていないかを先に疑います。",
      },
      {
        title: "この講義の要点",
        lead: "JS は手順の言葉。1行が1お願い。実行は上から下。console.log は窓。言葉は引用符。コメントは無視。エラーで以降が止まる。次の講義から「値」（個数・言葉・スイッチ）を見ます。",
        points: [
          "順番を変えたいなら、行の位置を変える",
          "見えないなら、まず log で途中経過を出す",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "まずは命令を上から並べて、文字には引用符を付ければ、動きを追えそうです。",
          },
          {
            "speaker": "engineer",
            "text": "いい振り返りです。実行して初めて動くことと、console.logは値を変えず確認するだけ、という点も押さえておきましょう。",
          },
          {
            "speaker": "beginner",
            "text": "何も表示されなければ、logの書き方だけを何度も直せばいいんですよね？",
          },
          {
            "speaker": "engineer",
            "text": "その行より前のエラーで止まっている場合もあります。最初のエラーと実行順を確認できたら、次は表示している値の種類を見ていきましょう。",
          },
        ],
        diagram: "sequence",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "「はじめます」という文字を1行だけ表示してください。",
        lead: "最初の練習では、指定された言葉を確認用の出力欄に表示します。文字として扱うための記号と、値を表示する命令が必要です。実行後に余計な文字が付かず、「はじめます」だけが見えれば達成です。",
        kind: "code",
        starter: "// 最初の1行。画面に出してみる\n",
        fileName: "script.js",
        steps: [
          "指定された言葉を文字列として扱う",
          "確認用の出力欄に1回だけ表示する",
          "表示が指定どおりか確認する",
        ],
        hint: "文字には文字列であることを示す囲みが必要です。表示用の命令に、その文字列を渡す考え方で組み立てましょう。",
        sample: "はじめます",
        answer: 'console.log("はじめます")',
        explain:
          "console.log は画面に出すお願いです。この1行が、機械への最初の手順です。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "JavaScriptとして実行できる表示命令を選んでください。",
        lead: "命令名の大文字・小文字や記号が少し違うだけで、機械は別の命令として扱います。見た目ではなく、JavaScriptが読める1行を見分けます。",
        kind: "choice",
        options: [
          'Console.log("1行です");',
          'console.log("1行です");',
          'console.log（"1行です"）;',
        ],
        steps: [
          "命令名が学んだ表記と一致している",
          "括弧と引用符が半角で左右そろっている",
          "指定した文字列を1回渡す形になっている",
        ],
        hint: "JavaScriptは命令名の大文字・小文字を区別し、コードの記号には半角文字を使います。",
        answer: 'console.log("1行です");',
        explain: "命令名は小文字の console.log、括弧と引用符は半角です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "「いち」「に」「さん」を、この順番で1つずつ改行して表示してください。",
        lead: "JavaScriptは通常、上にある命令から順に実行します。3つの文字列をそれぞれ別の表示として出し、実行結果が上から「いち」「に」「さん」と並ぶようにしてください。",
        kind: "code",
        starter: "// 書いた順に実行されます\n",
        fileName: "script.js",
        steps: [
          "3つの言葉をそれぞれ文字列として扱う",
          "表示処理を期待する順番に並べる",
          "3行の順序と内容を確認する",
        ],
        hint: "1回の表示で1つの言葉を出すと、改行された結果を確認しやすくなります。処理の並びが出力順になります。",
        sample: "いち\nに\nさん",
        answer: `console.log("いち");
console.log("に");
console.log("さん");`,
        explain: "上から1行ずつ実行されるので、書いた順に表示されます。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "console.logで表示した内容について、正しい説明を1つ選んでください。",
        lead: "確認用の窓へ「開始」と表示しました。表示する操作と、値を保存したり次の処理へ渡したりする操作を区別します。",
        kind: "choice",
        options: [
          "確認場所へ表示される",
          "次の行へ自動で渡される",
          "変数として自動保存される",
          "利用者画面へ必ず表示される",
        ],
        steps: [
          "console.logの目的を思い出す",
          "表示と保存を区別する",
        ],
        hint: "console.logは、開発中に値を目で確認するための命令です。",
        answer: "確認場所へ表示される",
        explain: "console.logは値をConsoleやターミナルへ表示します。保存や受け渡しは別の操作です。",
      },
      {
        id: "q5",
        slide: 4,
        scenario: "注文受付の最初の確認として、customer と order-count を順に表示できるようにする。",
        projectRole: "build",
        prompt: "注文受付結果として、customer「Aya」と order-count の3を、この順で1行ずつ表示してください。",
        lead: "customerは文字列、order-countは計算にも使える数値として用意します。実行後に「Aya」と3が別々の行へ表示されれば完成です。",
        kind: "code",
        starter: "// customer は引用符、order-count は数値のまま\n",
        fileName: "script.js",
        steps: [
          "1つ目を文字列として表示する",
          "2つ目を数値として表示する",
          "行の順番と値の種類を確認する",
        ],
        hint: "言葉には文字列の印が必要ですが、数値には付けません。同じ表示命令へ、種類の異なる値を順に渡します。",
        sample: "Aya\n3",
        answer: `console.log("Aya");
console.log(3);`,
        explain:
          "引用符は「これは言葉です」という名札です。数はそのまま渡せます。",
      },
      {
        id: "q6",
        slide: 5,
        prompt: "AとCだけを順に表示し、Bを表示する処理は削除せず実行対象から外してください。",
        lead: "コメントを使うと、コードを残したまま特定の行を実行させないようにできます。A、B、Cを表示する処理を並べたうえで、Bの処理だけをコメントにしてください。実行結果はAとCの2行です。",
        kind: "code",
        starter: "// B は動かないようにしてください\n",
        fileName: "script.js",
        steps: [
          "A・B・Cの表示処理を順番に用意する",
          "Bの処理だけをコメントとして扱う",
          "AとCだけが表示されることを確認する",
        ],
        hint: "1行だけ無効にするコメント記号は、その行の先頭側に置きます。Bの処理自体は消さずに残してください。",
        sample: "A\nC",
        answer: `console.log("A");
// console.log("B");
console.log("C");`,
        explain: "// の行はレシピの余白メモです。エンジンは飛ばします。",
      },
      {
        id: "q7",
        slide: 6,
        prompt: "このコードを実行したときの動きを選んでください。",
        lead: "実行時エラーでは、停止位置までに終わった処理と、その後に残された処理を区別する必要があります。エラーの行を境に実行順を追います。",
        code: `console.log("A");
unknownName;
console.log("B");`,
        kind: "choice",
        options: [
          "Aの前で停止し、何も表示されない",
          "Aを表示したあと停止し、Bは表示されない",
          "AとBを表示したあと最後に停止する",
        ],
        steps: [
          "各行を上から順に追えている",
          "存在しない名前へ到達する前の処理を判断できている",
          "停止位置より後の行が実行されるか判断できている",
        ],
        hint: "括弧不足のような構文エラーではなく、2行目へ到達した時点で起きるエラーです。",
        answer: "Aを表示したあと停止し、Bは表示されない",
        explain:
          "1行目はすでに実行済みです。2行目の実行時エラーで止まり、3行目には進みません。",
      },
    ],
  },
  {
    id: "js-values",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 2,
    title: "値には種類がある",
    summary: "数値・文字列・真偽など、値そのものの顔",
    minutes: 16,
    slides: [
      {
        title: "プログラムが動かす単位が「値」",
        lead: '値（あたい）は、プログラムが扱う「もの」そのものです。画面に出すのも、足し算するのも、全部この「もの」を動かしています。スーパーの品物と同じで、見た目が違うと扱いも違います。3 は個数、"Aya" は名札、true はスイッチ。種類の英語名（number など）は、今は「個数・言葉・スイッチ」と日本語で覚えてください。種類が違うと、同じ記号 + でも意味が変わります。',
        points: [
          "number（ナンバー）：3, 0, -1.5。個数や点数。足し算できる",
          'string（ストリング）："hello" のように引用符で囲んだ文字の列。名札や文章',
          "boolean（ブーリアン）：true か false。オン／オフのスイッチ。あとで「もし〜なら」に使う",
        ],
        note: "型という言葉が出てきたら「値の種類」と読み替えてください。今は3種類だけで十分です。",
        talk: [
          {
            "speaker": "beginner",
            "text": "3もAyaもtrueも、JavaScriptから見れば全部同じデータですか？"
          },
          {
            "speaker": "engineer",
            "text": "全部「値」ですが、number・string・booleanという種類が違います。"
          },
          {
            "speaker": "beginner",
            "text": "見た目を出すだけなら、種類を気にしなくてもよさそうですが？"
          },
          {
            "speaker": "engineer",
            "text": "種類で計算や条件の扱いが変わります。3は個数、引用符で囲んだAyaは文字列、true/falseはスイッチです。「型」と出たら値の種類と読み替えれば十分です。"
          }
        ],
        diagram: "values",
        code: `3
"Aya"
true`,
        codeCaption: "個数・名札・スイッチ。どれも値",
        codeExample: `console.log(3 + 2); // 5。個数どうし
console.log("Aya" + "さん"); // "Ayaさん"。名札のつなぎ`,
      },
      {
        title: "引用符の有無が種類を分ける",
        lead: '棚に並んだ 3個のりんごと、「3」と書いた札は別物です。3 は数値。"3" は文字のスリー。見た目が似ていても、足し算できるか、長さを持つかが違います。初心者の混乱の大半はここにあります。',
        points: [
          "数値どうしの + は足し算。3 + 1 は 4",
          '文字列が混ざった + は文字の連結。"3" + 1 は "31"',
          "typeof で、今の値の種類の名前を文字列として見られる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "画面に3と出たら、数値の3か文字の「3」か見分けられますか？"
          },
          {
            "speaker": "engineer",
            "text": "表示だけでは難しいので、typeofで種類を確かめます。"
          },
          {
            "speaker": "beginner",
            "text": "どちらも3なら、1を足した結果も4になりますよね？"
          },
          {
            "speaker": "engineer",
            "text": "数値なら4ですが、文字列が混ざると「31」とつながります。文字列には文字数もあり、見た目が同じでも用途が違うと覚えてください。"
          }
        ],
        diagram: "values",
        code: `typeof 3 // "number"
typeof "3" // "string"
typeof true // "boolean"`,
        codeCaption: "見た目が似ても種類は違う",
        codeExample: `console.log(3 + 1); // 4
console.log("3" + 1); // "31"
console.log("3".length); // 1。文字の個数`,
        watch:
          "画面に 3 と出ても、それが number なのか string なのかは typeof か計算の結果で確認します。",
      },
      {
        title: "boolean はオン／オフのスイッチ",
        lead: "true は「はい・オン」、false は「いいえ・オフ」です。電気のスイッチと同じで、途中の値はありません。あとで if が「スイッチがオンなら中へ」と読むので、今は2値だと覚えてください。",
        points: [
          "true / false は引用符を付けない。命令の名前ではない",
          '"true" は文字列。スイッチではなく、true と書いた札',
          "比較の結果も boolean。3 > 1 は true",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "trueとfalseは、引用符で囲む決まりですか？"
          },
          {
            "speaker": "engineer",
            "text": "囲みません。そのままで真偽値のオンとオフです。"
          },
          {
            "speaker": "beginner",
            "text": "でも \"true\" も表示すると同じtrueに見えますよね？"
          },
          {
            "speaker": "engineer",
            "text": "見た目は近くても、そちらは文字列の札です。比較式の答えもbooleanになり、あとでifがtrueのときだけ処理する材料になります。"
          }
        ],
        diagram: "values",
        code: `console.log(true);
console.log(false);
console.log(3 > 1); // true。比較の答えもスイッチ`,
        codeCaption: "オンかオフか、の2値",
        codeExample: `console.log(typeof true); // "boolean"
console.log(typeof "true"); // "string"。札はスイッチではない`,
        watch: '画面に true と出ても、引用符つきの "true" とは種類が違います。',
      },
      {
        title: "無いことを表す null と undefined",
        lead: "席が2種類あります。undefined は「まだ誰も座っていない／予約していない」。null は「この席は空だと札を出した」。どちらも値です。無い、という事実もプログラムは値として持ちます。",
        points: [
          "宣言しただけの let x; の x は undefined。空席",
          "return しない関数の戻り値も undefined",
          "null は自分で代入して「空」を表す。予約なしの札",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "値が無いなら、nullとundefinedを分ける必要はありますか？"
          },
          {
            "speaker": "engineer",
            "text": "あります。未設定なのか、意図して空にしたのかを表し分けられます。"
          },
          {
            "speaker": "beginner",
            "text": "letで名前だけ作った直後は、どちらになるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "その時点はundefinedです。戻り値を書かない関数も同じです。自分で「空にした」と示したい場面ではnullを代入します。"
          }
        ],
        diagram: "values",
        code: `let x;
console.log(x); // undefined
x = null;
console.log(x); // null`,
        codeCaption: "空席と、空だと書いた札",
        codeExample: `let seat;
console.log(seat); // undefined。まだ何もしていない
seat = null;
console.log(seat); // null。意図して空`,
      },
      {
        title: "オブジェクトは値を束ねた値",
        lead: "引き出し1つに、名札と年齢をまとめて入れるイメージです。複数の値を1つの塊にしたものも、やはり値です。配列もオブジェクトの仲間。関数も値。後の講義で詳しく扱いますが、「全部値」という感覚が土台になります。",
        points: [
          '{ name: "Aya" } はオブジェクトという値。名刺1枚',
          "[1, 2] は配列という値。番号つきの列",
          "function で作った関数も、変数に入れられる値",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "複数の値をまとめたら、それはもう値ではなく入れ物ですか？"
          },
          {
            "speaker": "engineer",
            "text": "まとめた塊も、JavaScriptでは1つの値です。"
          },
          {
            "speaker": "beginner",
            "text": "名前と年齢の束、番号の列、関数まで同じ扱いなんでしょうか？"
          },
          {
            "speaker": "engineer",
            "text": "大きな分類は違いますが、どれも変数へ付けたり渡したりできます。オブジェクトは名前付きの欄、配列は順番付きの列で、関数も値として扱えます。今は「塊も値」で十分です。"
          }
        ],
        diagram: "object",
        code: `const user = { name: "Aya" };
const scores = [1, 2];
function add(a, b) { return a + b; }
// 塊も、関数も、すべて値`,
        codeCaption: "引き出し・列・手順も、みな値",
        codeExample: `const user = { name: "Aya", age: 20 };
console.log(user.name); // "Aya"。束から1つ取り出す`,
        note: "今は「塊も値」とだけ押さえておけば十分です。",
      },
      {
        title: "この講義の要点",
        lead: "値には種類がある。個数と名札は別。スイッチは true/false。無いことも値。塊も値。次は名前（変数）の付け方です。",
        points: ["種類が違うと演算の意味が変わる", "迷ったら typeof を見る"],
        talk: [
          {
            "speaker": "beginner",
            "text": "画面では同じように見えても、数、文字、オン・オフでは使い方が変わるんですね。",
          },
          {
            "speaker": "engineer",
            "text": "その理解で合っています。特に引用符の有無で、計算できる数値か文字列かが変わります。",
          },
          {
            "speaker": "beginner",
            "text": "値が無いときは全部undefinedで、配列や関数は値とは別枠だと思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "意図した空はnullで表せますし、オブジェクトや配列、関数も値です。種類に迷ったらtypeofなどで確かめ、次は値へ名前を付ける方法へ進みましょう。",
          },
        ],
        diagram: "values",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "数値の3、文字列のAya、真偽値のオンを表す値を、この順で1行ずつ表示してください。",
        lead: "数値・文字列・真偽値という3種類の値を区別する練習です。1行目は個数、2行目は名前、3行目はオン状態として扱います。表示結果は3、Aya、trueの順になります。",
        kind: "code",
        starter: "// 個数・名札・スイッチをそのまま表示\n",
        fileName: "script.js",
        steps: [
          "3を数値として表示する",
          "Ayaを文字列として表示する",
          "オン状態を真偽値として表示する",
          "3行の順番を確認する",
        ],
        hint: "文字列だけに文字列を示す囲みを付けます。数値と真偽値は、それぞれの値として直接扱います。",
        sample: "3\nAya\ntrue",
        answer: `console.log(3);
console.log("Aya");
console.log(true);`,
        explain: '3 は個数、"Aya" は名札、true はスイッチ。どれも値です。',
      },
      {
        id: "q2",
        slide: 1,
        prompt: "数値の3と、文字列の「3」について、値の種類をこの順で表示してください。",
        lead: "見た目が同じ3でも、数値と文字列では種類が異なります。値の種類を調べる演算子をそれぞれに使い、その結果を2行で表示してください。1行目は数値の種類名、2行目は文字列の種類名になります。",
        kind: "code",
        starter: "// 引用符の有無で種類が分かれます\n",
        fileName: "script.js",
        steps: [
          "囲みのない3の種類を調べる",
          "文字列として囲んだ3の種類を調べる",
          "調査結果を順番に表示する",
        ],
        hint: "値の種類を調べる演算子は、調べたい値の手前で使います。引用符の有無を変えて比較しましょう。",
        sample: "number\nstring",
        answer: `console.log(typeof 3);
console.log(typeof "3");`,
        explain:
          '3 は個数（number）、"3" は札（string）です。見た目が似ても別物です。',
      },
      {
        id: "q3",
        slide: 2,
        prompt: "真偽値のオンを表す値と、「3は1より大きい」という比較結果を、この順で表示してください。",
        lead: "真偽値は、条件が成り立つかどうかを表します。まずオン状態そのものを表示し、次に2つの数の大小を比較した結果を表示してください。どちらも同じ真偽値になることを確認します。",
        kind: "code",
        starter: "// boolean はオン／オフ\n",
        fileName: "script.js",
        steps: [
          "オン状態の真偽値を表示する",
          "3と1の大小関係を比較する",
          "比較結果を2行目に表示する",
        ],
        hint: "真偽値は文字列ではありません。大小比較も真偽値を返すので、その結果を表示用の命令に渡せます。",
        sample: "true\ntrue",
        answer: `console.log(true);
console.log(3 > 1);`,
        explain:
          "true はスイッチのオン。3 > 1 の答えも true というスイッチです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "宣言しただけのxを表示したあと、意図的な空を表す値をxに設定し、もう一度表示してください。",
        lead: "値がまだ決まっていない状態と、意図して空にした状態の違いを確認します。starterですでにxは宣言済みです。変更前と変更後を順に表示し、2種類の「無い」を見比べてください。",
        kind: "code",
        starter: "let x;\n// 代入前と、null を入れたあと\n",
        fileName: "script.js",
        steps: [
          "初期値のないxを表示する",
          "xを意図的な空の状態へ変更する",
          "変更後のxを表示する",
          "2行の違いを確認する",
        ],
        hint: "宣言直後の値は自動的に未定義の状態です。その後、自分で空を表す専用の値へ付け替えます。",
        sample: "undefined\nnull",
        answer: `let x;
console.log(x);
x = null;
console.log(x);`,
        explain: "undefined はまだ空席、null は空だと書いた札です。",
      },
      {
        id: "q5",
        slide: 4,
        scenario: "最初の order レコードを作り、customer フィールドを読み取る。",
        projectRole: "build",
        prompt: "customer欄にAyaを持つorderオブジェクトを作り、そのcustomer欄の値だけを表示してください。",
        lead: "関連する値を名前付きの欄にまとめるのがオブジェクトです。orderという名前で1つのオブジェクトを作り、customer欄には文字列Ayaを持たせます。最後はオブジェクト全体ではなく、customer欄だけを表示してください。",
        kind: "code",
        starter: "// order も1つの値です\n",
        fileName: "script.js",
        steps: [
          "orderというオブジェクトを用意する",
          "customer欄に文字列Ayaを持たせる",
          "customer欄だけを読み取って表示する",
        ],
        hint: "オブジェクトには欄の名前と値の組を持たせます。表示時は、orderから固定名の欄をたどる方法を使います。",
        sample: "Aya",
        answer: `const order = { customer: "Aya" };
console.log(order.customer);`,
        explain:
          "オブジェクトは引き出しにまとめた値です。名刺1枚、と考えると覚えやすいです。",
      },
    ],
  },
  {
    id: "js-henasu",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 3,
    title: "変数は箱ではなくラベル",
    summary: "名前を値にくっつける、という動き",
    minutes: 16,
    slides: [
      {
        title: "名前は値への付箋",
        lead: '変数（へんすう）は、値をあとから読むために付ける名前です。箱に詰める、より「荷物に付箋を貼る」方が正確です。同じ数字 20 を何度も書き写す代わりに、age と書いて値をたどれます。',
        points: [
          "変数は、値そのものではなく値をたどる名前",
          "同じ名前を何度読んでも、値は消えない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "変数って、値をしまう箱だと考えればいいですか？"
          },
          {
            "speaker": "engineer",
            "text": "最初は、値をたどるための付箋だと考える方が動きを追いやすいです。"
          },
          {
            "speaker": "beginner",
            "text": "nameと書いたら、値を一度取り出して消してしまいませんか？"
          },
          {
            "speaker": "engineer",
            "text": "名前から値を読むだけなので消えません。宣言やイコールの詳しい動きは、次の一枚で分けて確認します。"
          }
        ],
        diagram: "label",
        code: `let name = "Aya";
let age = 20;
console.log(name); // 付箋 name をたどって "Aya" を読む`,
        codeCaption: "読むときは、名前から値をたどる",
        codeExample: `let title = "本";
console.log(title);
console.log(title);
// 何回読んでも、荷物は消えない`,
      },
      {
        title: "宣言・初期化・代入は別の操作",
        lead: 'let name = "Aya" には三つの動きがあります。let name が「この名前を使う」という宣言、最初の値を結び付けることが初期化、その後の name = "Ren" が代入です。右側を先に計算して一つの値を決めることを評価と呼びます。',
        points: [
          "宣言: 名前を使えるようにする",
          "初期化: 宣言した名前へ最初の値を結び付ける",
          "代入: すでにある名前へ別の値を結び付ける",
        ],
        talk: [
          {
            speaker: "beginner",
            text: "まず「宣言」は、実際のコードではどの部分ですか？",
          },
          {
            speaker: "engineer",
            text: "let score; が宣言です。JavaScriptへ「scoreという名前をこれから使う」と知らせます。この時点では最初の値を渡していないため、scoreを読むとundefinedです。",
          },
          {
            speaker: "beginner",
            text: "では「初期化」は、どの操作ですか？",
          },
          {
            speaker: "engineer",
            text: "let score = 10; のように、宣言と同時に最初の値10を結び付ける操作です。let score; score = 10; と2行で書く場合も、scoreへ最初の値が入る時点が初期化です。",
          },
          {
            speaker: "beginner",
            text: "最初の値を10から20へ変える場合も、初期化ですか？",
          },
          {
            speaker: "engineer",
            text: "いいえ。すでに10を持つscoreへ score = 20; と別の値を結び付けるのは代入です。特に、値を持つ名前を更新する操作を再代入と呼びます。",
          },
          {
            speaker: "beginner",
            text: "score = score + 1; は、左右のscoreを同時に変更しますか？",
          },
          {
            speaker: "engineer",
            text: "同時ではありません。まず右側のscoreから今の値20を読み、1を足して21を作ります。その後、左側のscoreへ21を再代入します。右側を先、左側を最後の順で追います。",
          },
        ],
        diagram: "label",
        code: `let name = "Aya"; // 宣言 + 初期化
name = "Ren"; // 代入`,
        codeCaption: "最初に付ける操作と、あとで付け替える操作",
        codeExample: `let score;
score = 10;
// 1行目は宣言、2行目は代入`,
      },
      {
        title: "読むだけなら、荷物は動かない",
        lead: "console.log(name) は付箋を見て中身を写すだけです。写真を撮っても本人は動きません。name と書いただけでは付け替えません。付け替えるのは = の左に名前を置いたときだけです。",
        points: [
          "読む: 右辺や log の中。付箋をたどるだけ",
          "書く: 左辺に名前。付箋を別の荷物へ付け替える",
          "読んだ結果を計算しても、書き戻さなければ元のまま",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "n + 1 と書けば、その次からnは増えた値になりますか？"
          },
          {
            "speaker": "engineer",
            "text": "なりません。計算して読んだだけでは、名前の指す先は変わりません。"
          },
          {
            "speaker": "beginner",
            "text": "console.logの中で計算した場合も、表示後のnは元のまま？"
          },
          {
            "speaker": "engineer",
            "text": "その通りです。変更するのは名前を=の左側に置いたときです。増やした結果を残したいなら、計算後の値をnへ書き戻します。"
          }
        ],
        diagram: "label",
        code: `let n = 3;
console.log(n); // 読む。n はまだ 3
console.log(n + 1); // 読んで 1 足して見せる。n はまだ 3`,
        codeCaption: "見せても、付箋は付け替わらない",
        codeExample: `let n = 3;
n + 1;
console.log(n); // まだ 3。左辺に n が無い`,
        watch:
          "n + 1 だけでは n は増えません。増やすなら n = n + 1 と書き戻します。",
      },
      {
        title: "代入 = は数学の等式ではない",
        lead: "age = 21 は「age は 21 である」という証明ではなく、「age の付箋を 21 へ付け替える」命令です。名札を別の荷物に貼り直すイメージです。左が名前、右が新しい値、という向きが決まっています。",
        points: [
          "左辺に計算式は置けない（名前か、後述のプロパティ）",
          "右辺は値なら何でもよい。別の変数名でも、その指す値が使われる",
          "付け替え後、誰も指さない古い値はいずれ回収される",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "age = age + 1 は、数学だと成り立たない式に見えます。"
          },
          {
            "speaker": "engineer",
            "text": "JavaScriptの=は等しいという主張ではなく、右の結果を左へ付け直す命令です。"
          },
          {
            "speaker": "beginner",
            "text": "右側の古いageを読む前に、左側が新しくなって混ざりませんか？"
          },
          {
            "speaker": "engineer",
            "text": "右辺を先に評価し、今の値へ1を足してから左の名前を更新します。左には更新先の名前などを置き、古い値を誰も参照しなくなれば後で回収されます。"
          }
        ],
        diagram: "rewrite",
        code: `let age = 20;
age = 21;
// いま age が指すのは 21。20 ではない`,
        codeCaption: "付箋を別の荷物へ",
        codeExample: `let age = 20;
age = age + 1;
console.log(age); // 21。今の値を読んで1足し、同じ名前へ`,
        watch:
          "age = age + 1 は「今の age を読んで1足し、同じ名前に付け直す」です。等式ではありません。",
      },
      {
        title: "const は最初の値が必要で、再代入できない",
        lead: "let はあとから別の値へ名前を付け直せます。const は「この付箋は剥がさない」という宣言なので、宣言時に最初の値が必要です。const tax; のように値なしでは宣言できず、あとから tax = 0.08 と再代入することもできません。",
        points: [
          "再代入したい名前は let。点数のように変わるもの",
          "付け替えない名前は const。税率のように固定したいもの",
          "const は宣言と初期化を同じ行で行う",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "constも、letと同じように値なしで名前だけ宣言できますか？"
          },
          {
            "speaker": "engineer",
            "text": "できません。あとから付け替えられないので、宣言した行で最初の値を結び付けます。"
          },
          {
            "speaker": "beginner",
            "text": "一度値を付けたあとは、別の値へ変更できないのですね？"
          },
          {
            "speaker": "engineer",
            "text": "はい。名前の指す先を変える再代入が禁止されます。オブジェクトの中身については、次の一枚で別の規則として確認します。"
          }
        ],
        diagram: "rewrite",
        code: `const tax = 0.1;
// const fee; // エラー。最初の値が必要
// tax = 0.08; // エラー。再代入できない`,
        codeCaption: "const は宣言した行で値を結び付ける",
        codeExample: `let score = 10;
score = 20; // OK。let は付け替え可
const tax = 0.1;
console.log(tax); // 読むのはできる`,
      },
      {
        title: "const が固定するのは名前の指す先",
        lead: "const user = { n: 1 } の user は、同じオブジェクトを指し続けます。user = { n: 2 } は別のオブジェクトへの再代入なのでエラーです。一方、user.n = 2 は同じオブジェクトの欄を更新しているため実行できます。",
        points: [
          "禁止: const の名前を別の値へ再代入する",
          "可能: 同じオブジェクトのプロパティを更新する",
          "中身も変更不能にしたい場合は、const とは別の仕組みが必要",
        ],
        talk: [
          {
            speaker: "beginner",
            text: "constで作ったオブジェクトは、中の欄も一切変えられないと思っていました。",
          },
          {
            speaker: "engineer",
            text: "constが固定するのはuserという名前の指す先です。オブジェクト全体を凍らせる機能ではありません。",
          },
          {
            speaker: "beginner",
            text: "user.nを書き換えても、userは同じ物を指したままなのですね？",
          },
          {
            speaker: "engineer",
            text: "その通りです。名前の再代入と、指している物の中身の更新を分けて考えます。参照の共有は後の講義で詳しく扱います。",
          },
        ],
        diagram: "rewrite",
        code: `const user = { n: 1 };
user.n = 2; // OK。同じオブジェクトの欄を更新
// user = { n: 2 }; // エラー。別の物へ再代入`,
        codeCaption: "付箋は固定、引き出しの中は変更できる",
        note: "const はオブジェクトを凍結しません。ここでは「名前」と「中身」を分けられれば十分です。",
      },
      {
        title: "数値や文字列は、コピー後に独立する",
        lead: "数値や文字列を b = a すると、その時点の値が b にも入ります。ノートの数字を別のノートに書き写すイメージです。あとで a のページを書き換えても、b のノートは古い数字のままです。",
        points: [
          "b = a は「a が今指す値」を b も指す",
          "a = 9 は a の付箋だけ付け替え。b のノートは触らない",
          "オブジェクトは同じ荷物を共有する。別講義",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "bにaを代入したら、その後もずっと2つは連動しますか？"
          },
          {
            "speaker": "engineer",
            "text": "数値や文字列では、代入した時点の値が渡り、その後の再代入は別々です。"
          },
          {
            "speaker": "beginner",
            "text": "aを2から9へ変えたら、bも9になると思っていました。"
          },
          {
            "speaker": "engineer",
            "text": "bにはコピー時の2が残ります。aの付箋だけを9へ付け直したからです。ただしオブジェクトは同じ塊を共有するので、そこは別のルールとして後で扱います。"
          }
        ],
        diagram: "rewrite",
        code: `let a = 2;
let b = a;
a = 9;
console.log(b); // 2`,
        codeCaption: "書き写した数字は、あとから独立",
        codeExample: `let a = "Aya";
let b = a;
a = "Ren";
console.log(b); // "Aya"。文字列も同じ`,
      },
      {
        title: "この講義の要点",
        lead: "変数は付箋。読むだけでは動かない。= は付け替え。let 可、const 不可。数値のコピーは独立。次は計算と文字のつなぎです。",
        points: ["読む: 名前 → 値", "書く: 右の値を左の名前へ"],
        talk: [
          {
            "speaker": "beginner",
            "text": "変数は箱というより、今使いたい値をたどる名前だと考えると分かりやすくなりました。",
          },
          {
            "speaker": "engineer",
            "text": "そうですね。名前を読む操作と、右側を計算して名前の指す先を更新する操作を分けて追うのがコツです。",
          },
          {
            "speaker": "beginner",
            "text": "constなら何も変更できず、コピーした変数も元とずっと連動すると思っていました。",
          },
          {
            "speaker": "engineer",
            "text": "constが止めるのは再代入で、オブジェクトの中身は別です。数値や文字列のコピー後はそれぞれ独立します。次は値の種類で計算記号の働きがどう変わるか見ましょう。",
          },
        ],
        diagram: "label",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "ゲームの得点10を変更可能なscoreとして記録し、現在の得点を表示してください。",
        lead: "開始時の得点として数値10が用意されています。scoreという名前を付けたあと、その名前から値を読み、10が表示されれば完成です。",
        kind: "code",
        starter: "// 名前は値への付箋です\n",
        fileName: "script.js",
        steps: [
          "scoreという変更可能な名前を宣言する",
          "その名前を数値10に関連付ける",
          "scoreを読み取って表示する",
        ],
        hint: "宣言では、名前と値を関連付けます。表示時には同じ名前を使うと、関連付けた値を読み取れます。",
        sample: "10",
        answer: `let score = 10;
console.log(score);`,
        explain:
          "右の荷物に左の付箋を貼ります。表示は付箋をたどって読むだけです。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "starterで宣言済みのscoreへ、最初の値10を代入してください。",
        lead: "scoreという名前はすでに宣言されています。宣言をもう一度書かず、右側の数値10を既存の名前へ結び付ければ完成です。",
        kind: "code",
        starter: "let score;\n// ここで最初の値を代入\n",
        fileName: "script.js",
        steps: [
          "scoreは宣言済みだと確認する",
          "宣言キーワードを追加せず、scoreへ10を代入する",
        ],
        hint: "letをもう一度書かず、既存の名前をイコールの左側へ置きます。",
        sample: "",
        answer: `let score;
score = 10;`,
        explain: "1行目が宣言、2行目が代入です。宣言と代入は別の操作です。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "starterの在庫数nについて、現在数と、1個入荷した場合の試算結果を順に表示してください。n自体は変更しません。",
        lead: "nには現在の在庫数3が用意されています。1行目に現在数、2行目に1を加えた試算結果を表示し、3、4の順になれば完成です。",
        kind: "code",
        starter: "let n = 3;\n// 読んでも n は変わりません\n",
        fileName: "script.js",
        steps: [
          "現在のnを表示する",
          "nを変更せずに1増えた値を計算する",
          "計算結果を2行目に表示する",
          "nへの再代入がないことを確認する",
        ],
        hint: "計算結果を表示用の命令へ直接渡せば、nの関連付けは変わりません。左辺にnを置く更新は不要です。",
        sample: "3\n4",
        answer: `let n = 3;
console.log(n);
console.log(n + 1);`,
        explain: "読む・見せるだけでは付箋は付きません。n は 3 のままです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "starterにある会員年齢ageを、誕生日後の21へ更新して表示してください。",
        lead: "ageには更新前の年齢20が用意されています。同じ名前を宣言し直さずに値だけを21へ変更し、更新後の年齢が表示されれば完成です。",
        kind: "code",
        starter: "let age = 20;\n// 付け替えて表示\n",
        fileName: "script.js",
        steps: [
          "既存のageが指す値を21へ更新する",
          "更新後のageを表示する",
          "同じ名前を再宣言していないか確認する",
        ],
        hint: "starterの宣言をそのまま使います。新しい宣言を増やすのではなく、既存の名前へ新しい値を関連付けてください。",
        sample: "21",
        answer: `let age = 20;
age = 21;
console.log(age);`,
        explain: "= は付箋の付け替えです。左が名前、右が新しい荷物です。",
      },
      {
        id: "q5",
        slide: 4,
        scenario: "注文金額 total を再代入しない変数として記録する。",
        projectRole: "build",
        prompt: "確定した注文金額1200を、変更しないtotalとして用意し、その値を表示してください。",
        lead: "注文確定後は金額を変更しない前提です。totalへ数値1200を関連付け、その名前から読み取った1200が表示されれば完成です。",
        kind: "code",
        starter: "// 確定した total は const\n",
        fileName: "script.js",
        steps: [
          "totalを再代入しない名前として宣言する",
          "数値1200を関連付ける",
          "totalの値を表示する",
        ],
        hint: "変更しない名前の宣言方法を使います。宣言後にその名前を読むことは問題なくできます。",
        sample: "1200",
        answer: `const total = 1200;
console.log(total);`,
        explain: "const は付箋を剥がせません。読むのはできます。",
      },
      {
        id: "q6",
        slide: 5,
        prompt: "次のconstで許可される操作を1つ選んでください。",
        lead: "userは同じオブジェクトを指し続けます。名前を別のオブジェクトへ付け替える操作と、同じオブジェクトの欄を更新する操作を区別してください。",
        kind: "choice",
        options: [
          "同じuserのname欄を変更する",
          "userを別オブジェクトへ再代入する",
          "userを値なしのconstで宣言する",
          "userへnullを再代入する",
        ],
        steps: [
          "userという名前の指す先が変わるか確認する",
          "同じオブジェクトのプロパティ更新を選ぶ",
        ],
        hint: "constが禁止するのは、名前を別の値へ再代入する操作です。",
        answer: "同じuserのname欄を変更する",
        explain: "プロパティ更新ではuserの指す先は変わりません。constはオブジェクト自体を凍らせません。",
      },
      {
        id: "q7",
        slide: 6,
        prompt: "starterのaの現在値をbへコピーし、その後aだけを9へ更新して、最後にbを表示してください。",
        lead: "数値を別の変数へコピーすると、その時点の値が渡されます。コピー後に元のaを変更しても、bは影響を受けません。最後の出力が2になることを確かめてください。",
        kind: "code",
        starter: "let a = 2;\n// b にコピーしてから a を付け替え\n",
        fileName: "script.js",
        steps: [
          "aの現在値を新しい名前bへコピーする",
          "aだけを9へ更新する",
          "bを表示してコピー時の値が残ることを確認する",
        ],
        hint: "先にbを作ってからaを更新します。最後に確認する対象は、更新したaではなくコピー先のbです。",
        sample: "2",
        answer: `let a = 2;
let b = a;
a = 9;
console.log(b);`,
        explain:
          "b は書き写した 2 のままです。a の付け替えは b のノートに波及しません。",
      },
    ],
  },
  {
    id: "js-calc",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 4,
    title: "計算と文字のつなぎ",
    summary: "+ が足し算にも連結にもなる理由",
    minutes: 16,
    slides: [
      {
        title: "数値の四則は電卓どおり",
        lead: "個数（number）どうしなら + - * / % は卓上電卓と同じです。記号の名前は演算子（えんざんし）ですが、今は「計算の記号」で十分です。% は余り。小数もあります。割り切れるとは限りません。ここまでは「個数どうしの計算」です。次のスライドで、同じ + が文字をつなぐのりにもなる、という話をします。",
        points: [
          "number どうしの + は足し算。1 + 2 は 3",
          "% は割り算の余り。10 % 3 は 1",
          "0 で割ると Infinity。エラーにはならない",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "JavaScriptの割り算は、整数だけ残して小数を捨てますか？"
          },
          {
            "speaker": "engineer",
            "text": "捨てません。数値どうしなら普通の電卓のように小数も出ます。"
          },
          {
            "speaker": "beginner",
            "text": "%はパーセントを計算する記号ですか？"
          },
          {
            "speaker": "engineer",
            "text": "ここでは割り算の余りです。奇数かどうかを見るときにも使えます。0で割ると例外で止まらずInfinityになる点にも注意してください。"
          }
        ],
        diagram: "calc",
        code: `2 + 3 // 5
10 % 3 // 1
1 / 0 // Infinity`,
        codeCaption: "電卓のキーと同じ",
        codeExample: `console.log(2 * 3); // 6
console.log(7 % 2); // 1。奇数判定にも使う
console.log(10 / 4); // 2.5。整数に切り捨てない`,
      },
      {
        title: "+ はのりにもなる",
        lead: '片方が string だと、+ は電卓ではなくのりです。紙と紙を貼るイメージで、左右を文字としてつなぎます。1 + "2" は 3 ではなく "12"。フォームの入力はたいてい文字なので、気づかず + すると静かに連結になります。',
        points: [
          '1 + "2" は "12"。のり',
          '"Aya" + "さん" は "Ayaさん"',
          '- * / は数値化を試みる。"10" - 1 は 9 になり得る',
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "1 + \"2\" が12になるのは、JavaScriptが数字を読み間違えたからですか？"
          },
          {
            "speaker": "engineer",
            "text": "読み間違いではなく、文字列が混ざると+が連結として働く仕様です。"
          },
          {
            "speaker": "beginner",
            "text": "では \"10\" - 1 も「101」みたいにつながりますか？"
          },
          {
            "speaker": "engineer",
            "text": "-や*や/は数値化を試みるので、引き算なら9になることがあります。+だけは特に連結へ切り替わりやすく、表示が12でも型を確認しないと数値か文字列か分かりません。"
          }
        ],
        diagram: "calc",
        code: `console.log(1 + 2); // 3 電卓
console.log(1 + "2"); // "12" のり
console.log("A" + "B"); // "AB"`,
        codeCaption: "同じ + でも、種類で仕事が変わる",
        codeExample: `console.log("10" - 1); // 9。引き算はのりではない
console.log("10" + 1); // "101"。足し算だけのり`,
        watch:
          "画面に 12 と出ても、それが数の十二なのか文字のいちになのかは typeof で確認します。",
      },
      {
        title: "テンプレートは ${} で値を埋め込む",
        lead: "バッククォート（`）で囲むと、${式} の位置に値を文字として差し込めます。穴あきの文に、付箋の中身をはめ込むイメージです。長い文章と変数を混ぜるときに、+ の連結より読みやすくなります。",
        points: [
          "`Hello ${name}` は name の値を文字列化して埋め込む",
          "中の式は先に評価される。計算も書ける",
          "通常の \" \" や ' ' では ${} はただの文字",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "文章に変数を入れるなら、+で何度もつなぐしかないですか？"
          },
          {
            "speaker": "engineer",
            "text": "バッククォートの文字列なら、${}の穴へ値を埋め込めます。"
          },
          {
            "speaker": "beginner",
            "text": "普通のダブルクォート内に${name}と書いても置き換わりますよね？"
          },
          {
            "speaker": "engineer",
            "text": "そこではただの文字です。バッククォートで囲んだときだけ中の式が先に評価され、変数だけでなく計算結果も読みやすく差し込めます。"
          }
        ],
        diagram: "calc",
        code: `const name = "Aya";
\`Hello \${name}\` // "Hello Aya"`,
        codeCaption: "穴あき文に値をはめる",
        codeExample: `const n = 3;
console.log(\`個数は \${n + 1}\`); // "個数は 4"
console.log("個数は \${n}"); // 穴は開かない`,
      },
      {
        title: "文字の数字は Number() で数にする",
        lead: '入力欄から取った "3" は名札です。電卓にかける前に、数に変えます。Number("3") は 3。Number("3") + 1 は 4。変えないまま + すると "31" になります。',
        points: [
          'Number("10") は 10。文字の十を個数へ',
          'Number("abc") は NaN。数にできない',
          "入力を足し算する前に、まず Number する癖をつける",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "入力欄で3と打ったなら、そのまま1を足して4になりますか？"
          },
          {
            "speaker": "engineer",
            "text": "入力は文字列になりやすいので、先にNumberで数値へ変える必要があります。"
          },
          {
            "speaker": "beginner",
            "text": "数字に見えないabcを変換したら、その場でエラーになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "Number(\"abc\")はNaNになり、処理自体は続きます。また空文字は0になるため、未入力と本当の0を混同しない確認も必要です。"
          }
        ],
        diagram: "calc",
        code: `const raw = "3";
console.log(raw + 1); // "31"。のり
console.log(Number(raw) + 1); // 4。電卓`,
        codeCaption: "札を数にしてから足す",
        codeExample: `console.log(Number("10") + Number("5")); // 15
console.log("10" + "5"); // "105"`,
        watch:
          '空文字 Number("") は 0 になります。入力忘れと 0 を混同しやすいです。',
      },
      {
        title: "比較は === を基本にする",
        lead: '== は型を変換して比べることがあります。=== は型も値も同じかを見ます。1 === "1" は false。意図しない変換を避けるため、まずは === と !== を使います。',
        points: [
          "=== は種類が違う時点で false。個数と札は別",
          '== は "1" と 1 を true にし得る',
          "大小比較 < > は数値化して比べることがある。文字列どうしは辞書順",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "1と文字の「1」は見た目が同じだから、同じと判定してよいですか？"
          },
          {
            "speaker": "engineer",
            "text": "基本は===を使い、値だけでなく種類もそろっているか見ます。"
          },
          {
            "speaker": "beginner",
            "text": "==ならtrueになるなら、そちらの方が便利では？"
          },
          {
            "speaker": "engineer",
            "text": "自動変換が入り、意図しない一致を作りやすいです。違いを見るなら!==も使えます。大小比較は数値化される場合があり、文字列同士では辞書順になる点も覚えておきましょう。"
          }
        ],
        diagram: "dynamic",
        code: `1 === "1" // false
1 == "1" // true（変換が入る）
3 > 2 // true`,
        codeCaption: "同じか見るときは種類も見る",
        codeExample: `console.log(1 !== "1"); // true。種類が違う
console.log(3 >= 3); // true。同じも含む`,
      },
      {
        title: "この講義の要点",
        lead: "number の + は電卓。string が混ざるとのり。埋め込みはテンプレート。入力は Number。比較は ===。次は動的型です。",
        points: [
          "演算の意味は値の種類が決める",
          "入力値は string になりやすい",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "+を見ただけでは足し算とは限らず、左右の値が数か文字かまで見る必要があるんですね。",
          },
          {
            "speaker": "engineer",
            "text": "その通りです。文字列が混ざれば連結になり、入力値は文字列で届きやすいので特に注意します。",
          },
          {
            "speaker": "beginner",
            "text": "数らしく見える入力なら、毎回変換せず==で比べても問題なさそうです。",
          },
          {
            "speaker": "engineer",
            "text": "見た目に頼らず、計算前にNumberでそろえ、比較は===を基本にしましょう。次は型が実行中に変わるJavaScriptの性質を掘り下げます。",
          },
        ],
        diagram: "calc",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "2個と3個の商品をまとめた総数と、10個を3人へ同数ずつ配った余りを、この順で表示してください。",
        lead: "どちらも数値として計算します。1行目に商品の合計5、2行目に配り終えた余り1が表示されれば完成です。",
        kind: "code",
        starter: "// 電卓どおりの四則\n",
        fileName: "script.js",
        steps: [
          "2つの数の合計を計算して表示する",
          "10を3で割った余りを計算して表示する",
          "結果が5と1の順か確認する",
        ],
        hint: "どちらも数値どうしの計算です。通常の加算と、余り専用の演算子をそれぞれ選びます。",
        sample: "5\n1",
        answer: `console.log(2 + 3);
console.log(10 % 3);`,
        explain: "個数どうしの + は電卓です。% は割り算の余りです。",
      },
      {
        id: "q2",
        slide: 1,
        prompt: "数値1と入力欄から届いた文字列「2」をつないだ結果と、コード片AとBをつないだ結果を順に表示してください。",
        lead: "入力値に文字列が混ざると、足し算のつもりでも文字の連結になります。1行目に12、2行目にABを表示し、値の種類で結果が変わることを確認してください。",
        kind: "code",
        starter: "// + がのりになる例\n",
        fileName: "script.js",
        steps: [
          "数値1と文字列2を連結して表示する",
          "文字列Aと文字列Bを連結して表示する",
          "数値の加算ではなく連結になったことを確認する",
        ],
        hint: "文字列が片方にあると、加算に使う記号は連結として働きます。今回は数値への変換を行いません。",
        sample: "12\nAB",
        answer: `console.log(1 + "2");
console.log("A" + "B");`,
        explain:
          '片方が文字だと + はのりです。1 + "2" は 3 ではなく "12" です。',
      },
      {
        id: "q3",
        slide: 2,
        prompt: "ログイン後のあいさつとして、starterの会員名nameを使い「Hello Aya」と表示してください。",
        lead: "nameにはAyaが用意されています。固定のHelloと会員名をテンプレート文字列で1つの文にし、間に半角スペースを入れて表示してください。文字列の連結演算は使いません。",
        kind: "code",
        starter: 'const name = "Aya";\n// バッククォートと ${} を使う\n',
        fileName: "script.js",
        steps: [
          "テンプレート文字列として文章を用意する",
          "指定位置にnameの値を埋め込む",
          "HelloとAyaの間の空白を確認する",
        ],
        hint: "通常の引用符ではなく、値を埋め込める種類の区切りを使います。文章の中に変数を評価するための場所を作りましょう。",
        sample: "Hello Aya",
        answer: `const name = "Aya";
console.log(\`Hello \${name}\`);`,
        explain: "バッククォートの穴 ${} に値が入ります。",
      },
      {
        id: "q4",
        slide: 3,
        scenario: "フォームの文字列から order-count を数値化して更新する。",
        projectRole: "build",
        prompt: "入力欄から届いた注文件数rawOrderCountを数値へ変換し、注文を1件追加したorder-countを表示してください。",
        lead: "starterのrawOrderCountは文字列の「3」です。そのままつながないよう数値へ変換してから1を加え、数値4が表示されれば完成です。rawOrderCount自体は書き換えません。",
        kind: "code",
        starter: 'const rawOrderCount = "3";\n// 数にしてから足す\n',
        fileName: "script.js",
        steps: [
          "rawOrderCountの値を数値へ変換する",
          "変換後の数値に1を加える",
          "計算結果が4か確認する",
        ],
        hint: "先に数値へ変換するための組み込み機能を通し、その戻り値を加算に使います。文字列のまま計算しないようにします。",
        sample: "4",
        answer: `const rawOrderCount = "3";
console.log(Number(rawOrderCount) + 1);`,
        explain:
          '入力の "3" は札です。電卓にかける前に Number で個数へ変えます。',
      },
      {
        id: "q5",
        slide: 4,
        prompt: "保存済みの数値ID 1と、入力欄から届いた文字列ID「1」を、厳密な比較と自動変換を許す比較で順に確かめてください。",
        lead: "見た目が同じIDでも値の種類が異なります。1行目は種類も含めて比較し、2行目は自動変換を許して比較します。false、trueの順に表示されれば完成です。",
        kind: "code",
        starter: "// 厳格比較とゆるい比較\n",
        fileName: "script.js",
        steps: [
          "数値と文字列を種類も含めて比較する",
          "同じ2値を自動変換ありで比較する",
          "2つの結果の違いを確認する",
        ],
        hint: "同値比較には、種類まで確認する方法と自動変換を行う方法があります。1行目ではより厳密な方を選びます。",
        sample: "false\ntrue",
        answer: `console.log(1 === "1");
console.log(1 == "1");`,
        explain:
          "=== は個数と札を別物と見ます。== は変換して true になり得ます。",
      },
    ],
  },
  {
    id: "js-dynamic",
    track: "js",
    level: "start",
    chapter: "js-syntax",
    order: 5,
    title: "型は実行中に決まる",
    summary: "同じ名前が number にも string にもなれる理由",
    minutes: 16,
    slides: [
      {
        title: "同じ引き出しに、あとから別の種類",
        lead: "JavaScript は動的型付けです。難しい言葉に見えますが、意味は「名前（引き出し）の種類は先に固定しない。今入っている荷物の種類が、その瞬間の型」です。値には常に種類があります。ただし let x と書いた時点では、x は個数専用ではありません。あとから言葉を入れても、文法としては通ります。便利ですが、想定外の種類が混ざると、エラーにならずに変な結果が出ます。",
        points: [
          "静的型付け（TypeScript）は「この引き出しは個数専用」と先に約束する",
          "動的型付けは「今の荷物」が種類を連れて歩く",
          "便利だが、想定外の種類が混ざると静かに変な結果になる",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "let xを数値で始めたら、後から文字列を入れると型エラーになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "JavaScriptでは通ります。型は名前に固定されず、その時点の値が持っています。"
          },
          {
            "speaker": "beginner",
            "text": "自由なら、種類を考えず何でも入れた方が楽そうです。"
          },
          {
            "speaker": "engineer",
            "text": "便利な反面、想定外の型でも止まらず変な計算になることがあります。TypeScriptのように名前の用途を先に約束する仕組みとの違いはそこです。"
          }
        ],
        diagram: "dynamic",
        code: `let x = 1; // 今は number
x = "hello"; // 今は string
typeof x // "string"`,
        codeCaption: "引き出しは同じ。中身の種類が変わる",
        codeExample: `let x = 1;
console.log(typeof x); // "number"
x = "hello";
console.log(typeof x); // "string"`,
      },
      {
        title: '1 + "2" は静かに事故る',
        lead: 'エラーにならずに変な結果が出るのが、動的型の落とし穴です。個数の 1 と札の "2" を足すと、エンジンは黙ってのりを使い "12" にします。止まらないので、気づくのが遅れます。種類を揃えてから計算します。',
        points: [
          "1 + 2 は 3。電卓",
          '1 + "2" は "12"。エラーではない',
          "入力を足す前に Number するか、typeof で確認する",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "結果が12と出たなら、正しく十二を計算できたと見ていいですか？"
          },
          {
            "speaker": "engineer",
            "text": "いいえ。数値の十二ではなく、文字をつないだ「12」かもしれません。"
          },
          {
            "speaker": "beginner",
            "text": "エラーが出ないなら、どこで間違えたか気づきにくいですね。"
          },
          {
            "speaker": "engineer",
            "text": "そこが動的型の注意点です。入力をNumberでそろえるか、typeofで種類を確認してから足します。止まらない結果ほど意図と照らして疑いましょう。"
          }
        ],
        diagram: "calc",
        code: `console.log(1 + 2); // 3
console.log(1 + "2"); // "12"。止まらない`,
        codeCaption: "間違えても、電車は止まらない",
        codeExample: `let a = 1;
let b = "2";
console.log(a + b); // "12"
console.log(a + Number(b)); // 3`,
        watch:
          "画面に 12 と出たとき、それが意図した十二なのか、つなぎなのかを疑います。",
      },
      {
        title: "typeof のクセ",
        lead: 'typeof はざっくりした名前を返します。配列も "object" です。null も歴史的経緯で "object" です。関数は "function"。正確な配列判定には Array.isArray を使います。',
        points: [
          'typeof [] は "object"。配列専用ではない',
          'typeof null は "object"。バグではなく残された仕様',
          'typeof undefined は "undefined"',
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "typeofでobjectと出たら、普通のオブジェクトだと断定できますか？"
          },
          {
            "speaker": "engineer",
            "text": "できません。配列もnullもobjectと返るクセがあります。"
          },
          {
            "speaker": "beginner",
            "text": "nullまでobjectなら、空かどうかはどう調べるんですか？"
          },
          {
            "speaker": "engineer",
            "text": "nullは厳密にnullと比較し、配列はArray.isArrayを使います。関数はfunction、undefinedはundefinedと返ります。typeofは粗い分類だと思ってください。"
          }
        ],
        diagram: "dynamic",
        code: `typeof [] // "object"
Array.isArray([]) // true
typeof null // "object"`,
        codeCaption: "引き出しのラベルは粗い",
        codeExample: `console.log(typeof function () {}); // "function"
console.log(typeof null); // "object"。空なのに object`,
        watch: "null チェックは typeof ではなく value === null が確実です。",
      },
      {
        title: "真になる値・偽になる値",
        lead: 'if (value) では、一部の値が false 扱い（falsy）です。スイッチがオフに見える値、と考えるとよいです。0, "", null, undefined, false, NaN。それ以外のよく使う値は true 扱い（truthy）。空配列 [] や空オブジェクト {} は truthy です。',
        points: [
          '空文字 "" は偽。空白 " " は真',
          '数値 0 は偽。文字列 "0" は真。札のゼロは中身がある',
          "[] は真。中身が空でもオブジェクトとしては存在する",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "中身が空の配列なら、ifではfalseになりますか？"
          },
          {
            "speaker": "engineer",
            "text": "いいえ。空配列や空オブジェクトは、存在する値なのでtruthyです。"
          },
          {
            "speaker": "beginner",
            "text": "では0と文字の「0」、空文字と空白1個も同じ判定ですか？"
          },
          {
            "speaker": "engineer",
            "text": "数値0と空文字はfalsyですが、\"0\"や空白入り文字列はtruthyです。ほかにnull、undefined、false、NaNが代表的なfalsyです。"
          }
        ],
        diagram: "branch",
        code: `if (0) { /* 入らない */ }
if ("0") { /* 入る */ }
if ([]) { /* 入る */ }`,
        codeCaption: "オフに見える値は少数",
        codeExample: `console.log(Boolean(0)); // false
console.log(Boolean("0")); // true
console.log(Boolean("")); // false
console.log(Boolean([])); // true`,
      },
      {
        title: "NaN は「数ではない数」",
        lead: '数値化できない演算は NaN になります。壊れた電卓の表示、というイメージです。typeof NaN は "number" です。NaN === NaN は false。判定は Number.isNaN を使います。',
        points: [
          'Number("abc") は NaN。札が数に読めない',
          "NaN は他のどの値とも === で等しくない（自分自身とも）",
          "計算が壊れたとき、結果が NaN になって下流に伝播する",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "NaNはnumberではない、という型名ですよね？"
          },
          {
            "speaker": "engineer",
            "text": "名前に反して、typeof NaNはnumberです。数値計算が壊れた印だと考えてください。"
          },
          {
            "speaker": "beginner",
            "text": "ならNaN === NaNで失敗を確認できますか？"
          },
          {
            "speaker": "engineer",
            "text": "NaNは自分自身とも厳密一致しません。Number.isNaNで判定します。いったん混ざると後の計算にも伝わりやすいので、数値変換の直後で確認すると安全です。"
          }
        ],
        diagram: "dynamic",
        code: `Number("abc") // NaN
Number.isNaN(NaN) // true`,
        codeCaption: "壊れた数も、種類の名前は number",
        codeExample: `console.log(typeof NaN); // "number"
console.log(NaN === NaN); // false
console.log(Number.isNaN(Number("abc"))); // true`,
      },
      {
        title: "この講義の要点",
        lead: '型は値について回る。同じ引き出しでも中身は変わる。1+"2" は止まらない。typeof にはクセ。falsy は少数。NaN は特殊。次はオブジェクトと配列です。',
        points: [
          "同じ名前でも指す値が変われば型も変わる",
          "比較と条件では種類を意識する",
        ],
        talk: [
          {
            "speaker": "beginner",
            "text": "JavaScriptでは名前の型が固定されず、今そこにある値の種類を見て動く、と理解しました。",
          },
          {
            "speaker": "engineer",
            "text": "合っています。その自由さが便利な一方、文字列の混入などがエラーにならず結果へ現れることがあります。",
          },
          {
            "speaker": "beginner",
            "text": "そういうときはtypeofだけ見れば、配列もnullもNaNも正確に判定できますよね？",
          },
          {
            "speaker": "engineer",
            "text": "typeofには例外があるので、配列やNaN、nullには専用の確認方法を使います。truthy・falsyも意識しながら、次はオブジェクトと配列の扱いへ進みましょう。",
          },
        ],
        diagram: "dynamic",
      },
    ],
    questions: [
      {
        id: "q1",
        slide: 0,
        prompt: "starterの一時データxを、数値1から受信メッセージhelloへ変更し、変更後の値の種類を表示してください。",
        lead: "xには最初に数値1が入っていますが、後から文字列を持てることを確認します。xをhelloへ更新したあと、値そのものではなく現在の種類名stringを表示してください。",
        kind: "code",
        starter: "let x = 1;\n// 文字列を入れ、typeof を表示\n",
        fileName: "script.js",
        steps: [
          "xを文字列helloへ更新する",
          "更新後のxの種類を調べる",
          "種類名だけを表示する",
        ],
        hint: "種類は変数名に固定されず、その時点の値で決まります。更新を先に行い、その後で種類を調べます。",
        sample: "string",
        answer: `let x = 1;
x = "hello";
console.log(typeof x);`,
        explain: "同じ引き出しでも、今の荷物の種類が型です。",
      },
      {
        id: "q2",
        slide: 1,
        scenario: "文字列で届く追加件数を数値へ変換し、正しい order-count を計算する。",
        projectRole: "build",
        prompt: "現在のorder-countを表す`orderCount`へ入力欄の追加件数`rawOrderCount`を足し、文字列のままの結果と、数値へ直した合計を順に表示してください。",
        lead: "orderCountは数値1、rawOrderCountは文字列の「2」として用意されています。1行目で型をそろえない結果12を再現し、2行目でrawOrderCountを数値へ変換した正しい合計3を表示してください。",
        kind: "code",
        starter: 'const orderCount = 1;\nconst rawOrderCount = "2";\n',
        fileName: "script.js",
        steps: [
          "1行目で、値の種類をそろえない計算結果が出る",
          "2行目で、入力を数値へ変換した合計が出る",
          "元のrawOrderCountを書き換えずに比較できる",
        ],
        hint: "同じ+でも、文字列が混ざった場合と、変換後の数値だけの場合では仕事が変わります。",
        sample: "12\n3",
        answer: `const orderCount = 1;
const rawOrderCount = "2";
console.log(orderCount + rawOrderCount);
console.log(orderCount + Number(rawOrderCount));`,
        explain:
          "1行目は静かに文字を連結します。入力を数値へ変換すると、2行目では足し算になります。",
      },
      {
        id: "q3",
        slide: 2,
        prompt: "空の配列について、一般的な型名と、配列かどうかの判定結果をこの順で表示してください。",
        lead: "一般的な型調査では、配列はオブジェクトとして報告されます。そこで2行目では、配列専用の判定機能を使います。出力がobjectとtrueになることを確認してください。",
        kind: "code",
        starter: "// typeof のクセを確認\n",
        fileName: "script.js",
        steps: [
          "空の配列の一般的な型名を調べて表示する",
          "空の配列を専用機能で判定して表示する",
          "2つの結果が表す違いを確認する",
        ],
        hint: "1行目は値の種類を調べる演算子、2行目は配列専用の判定機能を使います。同じ空配列を対象に考えましょう。",
        sample: "object\ntrue",
        answer: `console.log(typeof []);
console.log(Array.isArray([]));`,
        explain:
          "配列かどうかは Array.isArray で見ます。typeof は粗いラベルです。",
      },
      {
        id: "q4",
        slide: 3,
        prompt: "在庫数を表す数値0と、入力欄に入った文字列「0」を、それぞれ真偽値として判定して順に表示してください。",
        lead: "在庫数0は偽として扱われますが、文字列は「0」でも中身があるため真になります。両方を明示的に真偽値へ変換し、false、trueの順に表示してください。",
        kind: "code",
        starter: "// falsy と truthy\n",
        fileName: "script.js",
        steps: [
          "数値0を真偽値へ変換して表示する",
          "文字列0を真偽値へ変換して表示する",
          "引用符の有無による結果の違いを確認する",
        ],
        hint: "真偽値へ変換する組み込み機能を使います。文字列は、内容がゼロという文字でも空ではありません。",
        sample: "false\ntrue",
        answer: `console.log(Boolean(0));
console.log(Boolean("0"));`,
        explain: '個数の 0 はオフ。札の "0" は中身があるのでオンです。',
      },
      {
        id: "q5",
        slide: 4,
        prompt: "数量入力として届いた文字列abcを数値へ変換し、変換に失敗した値かどうかを調べて表示してください。",
        lead: "abcは数量として読めないため、数値変換の結果はNaNになります。通常の同値比較ではなく専用の判定機能を使い、trueが表示されれば完成です。",
        kind: "code",
        starter: "// NaN の判定\n",
        fileName: "script.js",
        steps: [
          "abcを数値へ変換して変換失敗の値を得る",
          "その値をNaN専用の機能で判定する",
          "判定結果を表示する",
        ],
        hint: "数値変換の結果を、NaNかどうかだけを調べる機能へ渡します。NaNそのものとの同値比較は使いません。",
        sample: "true",
        answer: `console.log(Number.isNaN(Number("abc")));`,
        explain: "読めない札は壊れた数 NaN になり、Number.isNaN で調べます。",
      },
    ],
  },
];
