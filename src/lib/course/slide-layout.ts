import type {
  ConversationPage,
  Lesson,
  Question,
  Slide,
  TalkLine,
} from "@/lib/course/types";

type SlideListing = {
  readonly code: string;
};

export type SlideLayout = "talk" | "explain";

export function slideLayout(slide: Slide): SlideLayout {
  void slide;
  return "talk";
}

export function isSummarySlide(slide: Slide): boolean {
  return slide.title.includes("要点");
}

const POINT_QUESTIONS = [
  "まず何を覚えればよいですか？",
  "実際には、どのように動きますか？",
  "書くときの判断基準はありますか？",
  "もう一つ大事な点はありますか？",
];

const TERM_DEFINITIONS = [
  ["forEach", "配列の先頭から値を1個ずつ取り出し、渡した関数を各要素で1回ずつ呼ぶ処理"],
  ["for...of", "配列などから値を1個ずつ受け取り、途中でやめられる繰り返し"],
  ["イベントループ", "待ち行列から次の仕事を選び、JavaScriptに渡して動かす係"],
  ["ジェネリクス", "使うときまで具体的な型を決めず、型どうしの関係だけ先に決めておく書き方"],
  ["コールバック", "自分ではすぐ呼ばず、必要なタイミングで相手に呼んでもらうために渡す関数"],
  ["クロージャ", "関数と、その関数が作られた場所の変数へのつながりがセットで残る仕組み"],
  ["イテレーター", "配列などから、次の値を1個ずつ順番に渡す係"],
  ["型推論", "書いた値や使い方から、TypeScriptが値の種類を自動で判断すること"],
  ["巻き上げ", "宣言した行より上でも、その名前があるように見える動き。varでは中身はまだundefined"],
  ["実行領域", "関数を1回呼ぶたびに用意される、引数やその場だけの変数を置く作業スペース"],
  ["ストリーム", "大きなデータを一度に持たず、小さなまとまりで順番に受け渡す仕組み"],
  ["ランタイム", "書いたプログラムを実際に読み、動かす実行環境"],
  ["プリミティブ", "数値・文字列・真偽値などの、これ以上割れない基本的な値"],
  ["モジュール", "外へ見せる名前を選び、コードをファイル単位で分ける仕組み"],
  ["スコープ", "いまいる場所から、どの名前を読み書きできるかという見える範囲"],
  ["Promise", "今はまだ決まっていないが、あとで成功の値か失敗の理由が決まることを表す値"],
  ["continue", "今の1周だけ残りを飛ばし、次の周へ進む命令"],
  ["break", "繰り返し全体をそこで終えて、その下の処理へ進む命令"],
  ["while", "条件がtrueのあいだ、同じ処理を繰り返す文"],
  ["const", "あとから別の値へ付け替えできない名前を作る言葉"],
  ["let", "あとから別の値へ付け替えできる名前を作る言葉"],
  ["var", "関数全体で名前が見える、古い変数の宣言の仕方"],
  ["for", "始める準備・続ける条件・1周ごとの更新をまとめて書く繰り返し"],
  ["非同期", "完了をその場で待ち切らず、待っているあいだに別の仕事も進める動き"],
  ["プロセス", "OS上で動いている、メモリや終了状態を持つプログラムの1実行単位"],
  ["リテラル", "3や\"Aya\"のように、コードへ直接書いてその場で値を表す書き方"],
  ["参照", "物そのものではなく、その置き場所をたどる矢印の情報"],
  ["再代入", "すでに値と結び付いた名前を、別の値へ付け替えること"],
  ["仮引数", "関数を呼び出したとき、外から渡した値を中で受け取るための受け皿の名前"],
  ["戻り値", "関数が終わったときに、呼び出した場所へ渡す答えの値"],
  ["関数", "必要なときに呼び出せる手順を、ひとまとまりにした値"],
  ["評価", "式を計算して、その式が表す1つの値を決めること"],
  ["代入", "右側で決めた値を、左側の名前へ結び付けること"],
  ["宣言", "この名前をこれから使うと、JavaScriptへ知らせること"],
  ["変数", "値をあとから読み書きするために付ける名前"],
  ["falsy", "ifに入れるとオフ扱いになり、中の処理へ進まない値"],
  ["truthy", "ifに入れるとオン扱いになり、中の処理へ進む値"],
] as const;

/** 日本語の専門語は、初心者が先に言わず、場面の疑問から入る。 */
const VOCABULARY_SITUATIONS: Record<string, { ask: string; tell: string }> = {
  仮引数: {
    ask: "関数に値を渡したとき、中ではどうやって受け取るんですか？",
    tell: "外から渡された値を、関数の中で受け取るための受け皿の名前です。これを「仮引数」と呼びます。",
  },
  戻り値: {
    ask: "関数の処理が終わったあと、呼び出した側には何が戻ってくるんですか？",
    tell: "関数が終わったときに、呼び出した場所へ渡す答えの値です。これを「戻り値」と呼びます。",
  },
  コールバック: {
    ask: "関数を渡すときって、その場ですぐ動くんですか？",
    tell: "すぐ動かさず、必要なタイミングで相手に呼んでもらうために渡す関数です。これを「コールバック」と呼びます。",
  },
  スコープ: {
    ask: "場所によって、同じ名前が見えたり見えなくなったりするんですか？",
    tell: "いまいる場所から、どの名前を読み書きできるかという見える範囲です。これを「スコープ」と呼びます。",
  },
  巻き上げ: {
    ask: "宣言より上の行でも、その名前を使えるように見えることがあるんですか？",
    tell: "宣言した行より上でも名前があるように見える動きです。これを「巻き上げ」と呼びます。varでは中身はまだundefinedです。",
  },
  クロージャ: {
    ask: "内側の関数って、外側で使っていた名前をあとからでも覚えてるんですか？",
    tell: "関数と、その関数が作られた場所の変数へのつながりがセットで残る仕組みです。これを「クロージャ」と呼びます。",
  },
  実行領域: {
    ask: "同じ関数を何度も呼ぶと、前回の途中の値と混ざったりしませんか？",
    tell: "関数を1回呼ぶたびに、引数やその場だけの変数を置く作業スペースが新しく作られます。これを「実行領域」と呼びます。",
  },
  参照: {
    ask: "オブジェクトを別の名前に入れると、中身のコピーができるんですか？",
    tell: "渡るのは物そのものではなく、置き場所をたどる矢印です。その矢印を「参照」と呼びます。",
  },
  代入: {
    ask: "名前の横に値を書くと、何が起きるんですか？",
    tell: "右側で決めた値を、左側の名前へ結び付けることです。これを「代入」と呼びます。",
  },
  再代入: {
    ask: "一度決めた名前の値って、あとから別の値に付け替えられるんですか？",
    tell: "すでに値と結び付いた名前を、別の値へ付け替えることです。これを「再代入」と呼びます。",
  },
  宣言: {
    ask: "新しい名前を使い始めるとき、何をすればいいんですか？",
    tell: "この名前をこれから使うと、JavaScriptへ知らせることです。これを「宣言」と呼びます。",
  },
  評価: {
    ask: "式を書いたら、いつ値が決まるんですか？",
    tell: "式を計算して、その式が表す1つの値を決めることです。これを「評価」と呼びます。",
  },
  変数: {
    ask: "本題の前に、そもそも名前を付けるって何のためですか？",
    tell: "値をあとから読み書きするために付ける名前です。これを「変数」と呼びます。まずは値へ付けた付箋だと考えてください。",
  },
  関数: {
    ask: "同じ手順を何度も書く代わりに、まとめたりできるんですか？",
    tell: "必要なときに呼び出せる手順を、ひとまとまりにした値です。これを「関数」と呼びます。",
  },
  falsy: {
    ask: "ifの条件って、どんな値だと中に入らないんですか？",
    tell: "ifに入れるとオフ扱いになり、中の処理へ進まない値です。これを falsy と呼びます。",
  },
  truthy: {
    ask: "ifの条件って、どんな値だと中に進むんですか？",
    tell: "ifに入れるとオン扱いになり、中の処理へ進む値です。これを truthy と呼びます。",
  },
  非同期: {
    ask: "終わるまで待っているあいだ、ほかの処理は止まってしまうんですか？",
    tell: "完了をその場で待ち切らず、待っているあいだに別の仕事も進める動きです。これを「非同期」と呼びます。",
  },
  モジュール: {
    ask: "ファイルを分けたとき、中の名前は全部外から見えるんですか？",
    tell: "外へ見せる名前を選び、コードをファイル単位で分ける仕組みです。これを「モジュール」と呼びます。",
  },
  リテラル: {
    ask: "3や文字をコードに直接書くのと、名前経由で読むのって違うんですか？",
    tell: "3や\"Aya\"のように、コードへ直接書いてその場で値を表す書き方です。これを「リテラル」と呼びます。",
  },
  プリミティブ: {
    ask: "数値や文字列って、オブジェクトと同じ扱いなんですか？",
    tell: "数値・文字列・真偽値などの、これ以上割れない基本的な値です。これを「プリミティブ」と呼びます。",
  },
};

function vocabularyLines(slide: Slide): TalkLine[] | undefined {
  if (slide.title === "名前は値への付箋") {
    return [
      { speaker: "beginner", text: "本題の前に、そもそも名前を付けるって何のためですか？" },
      {
        speaker: "engineer",
        text: "値をあとから読み書きするために付ける名前です。これを変数と呼びます。まずは「値へ付けた付箋」と考えてください。",
      },
      { speaker: "beginner", text: "説明に出てくる、名前を作る操作と、式の値を決める操作も知りたいです。" },
      {
        speaker: "engineer",
        text: "名前を使えるように知らせるのが宣言、式を計算して1つの値を決めるのが評価です。言葉の意味を押さえてから、let name = \"Aya\"を追いましょう。",
      },
    ];
  }
  if (slide.title === "{ } が名前の部屋になる") {
    return [
      {
        speaker: "beginner",
        text: "波括弧の中と外で、同じ名前が見えたり見えなくなったりするんですか？",
      },
      {
        speaker: "engineer",
        text: "名前を読み書きできる範囲をスコープ、波括弧{ }で囲んだまとまりをブロックと呼びます。letとconstでは、ブロックが名前の見える境界になります。",
      },
    ];
  }
  if (slide.title === "オブジェクトの代入は「同じ束への矢印」をコピーする") {
    return [
      {
        speaker: "beginner",
        text: "オブジェクトを別の名前に入れると、中身のコピーができるんですか？",
      },
      {
        speaker: "engineer",
        text: "いいえ。渡るのは束そのものではなく、置き場所をたどる矢印です。その矢印を参照と呼びます。名前は2つでも、束は1つです。",
      },
    ];
  }
  if (slide.title === "列の後ろに並ぶのが push") {
    return [
      {
        speaker: "beginner",
        text: "列の後ろに人を足すのと、列の写真を撮るのは、同じ種類の操作ですか？",
      },
      {
        speaker: "engineer",
        text: "違います。後ろに人を足す操作を push といい、今ある配列そのものを変えます。列の写真を撮る操作を slice といい、元の列は動きません。",
      },
    ];
  }
  const skipAutoTerms = new Set([
    "関数",
    "変数",
    "宣言",
    "評価",
    "代入",
    "再代入",
    "const",
    "let",
    "var",
    "参照",
  ]);
  const beginnerTalk = (slide.talk ?? [])
    .filter((line) => line.speaker === "beginner")
    .map((line) => line.text)
    .join("\n");
  const beginnerAlreadyUses = (term: string) => {
    if (!beginnerTalk) return false;
    if (/^[A-Za-z.]/.test(term)) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[^A-Za-z.])${escaped}(?:[^A-Za-z.]|$)`).test(beginnerTalk);
    }
    return beginnerTalk.includes(term);
  };
  const alreadyDefined = (term: string, source: string) =>
    [
      `${term}は`,
      `${term} は`,
      `${term}とは`,
      `${term} とは`,
      `${term}と呼`,
      `${term} と呼`,
    ].some((pattern) => source.includes(pattern));
  const titleTerms = TERM_DEFINITIONS.filter(
    ([term]) =>
      slide.title.includes(term) &&
      !skipAutoTerms.has(term) &&
      !alreadyDefined(term, slide.title) &&
      !beginnerAlreadyUses(term) &&
      !(term === "for" && (slide.title.includes("forEach") || slide.title.includes("for...of"))),
  )
    .sort(([termA], [termB]) => slide.title.indexOf(termA) - slide.title.indexOf(termB))
    .slice(0, 2);
  const leadTerms =
    titleTerms.length > 0
      ? []
      : TERM_DEFINITIONS.filter(([term]) => {
          if (skipAutoTerms.has(term)) return false;
          if (!slide.lead.includes(term)) return false;
          if (beginnerAlreadyUses(term)) return false;
          return !alreadyDefined(term, slide.lead);
        }).slice(0, 1);
  const terms = titleTerms.length > 0 ? titleTerms : leadTerms;
  if (terms.length === 0) return undefined;

  return terms.flatMap(([term, definition]) => vocabularyPrompt(term, definition));
}

function vocabularyPrompt(term: string, definition: string): TalkLine[] {
  if (/^[A-Za-z.]/.test(term)) {
    return [
      {
        speaker: "beginner",
        text: `コードに「${term}」と出てきます。これは何をするものですか？`,
      },
      {
        speaker: "engineer",
        text: `${definition}。これを ${term} といいます。動きを押さえてから、例を見ましょう。`,
      },
    ];
  }

  const situation = VOCABULARY_SITUATIONS[term];
  if (situation) {
    return [
      { speaker: "beginner", text: situation.ask },
      {
        speaker: "engineer",
        text: `${situation.tell}動きを押さえてから、例を見ましょう。`,
      },
    ];
  }

  return [
    {
      speaker: "beginner",
      text: "コードを追う前に、いま何をしているのかを先に知りたいです。",
    },
    {
      speaker: "engineer",
      text: `${definition}。これを「${term}」といいます。動きを押さえてから、例を見ましょう。`,
    },
  ];
}

const SYNC_STOP_WORDS = new Set([
  "JavaScript",
  "TypeScript",
  "Node",
  "true",
  "false",
  "const",
  "let",
  "function",
  "return",
]);

function synchronizeConversationPages(
  slide: Slide,
  pages: ConversationPage[],
  listing: SlideListing,
): ConversationPage[] {
  const code = slide.code ?? listing.code;
  const codeLines = code.split("\n");
  return pages.map((page) => {
    if (page.focus === "story" || page.focus === "vocabulary" || page.focus === "summary") {
      return page;
    }
    const point =
      page.pointIndex === undefined ? "" : (slide.points?.[page.pointIndex] ?? "");
    const spoken = `${page.lines.map((line) => line.text).join(" ")} ${point}`;
    const terms = [
      ...new Set(
        (spoken.match(/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/g) ?? [])
          .filter((term) => term.length > 1 && !SYNC_STOP_WORDS.has(term)),
      ),
    ];
    const scores = codeLines.map((line) =>
      terms.reduce((score, term) => score + (line.includes(term) ? term.length : 0), 0),
    );
    const maxScore = Math.max(0, ...scores);
    const executableLines = codeLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.trim() && !line.trim().startsWith("//"))
      .map(({ index }) => index);
    const activeCodeLines =
      maxScore > 0
        ? scores
            .map((score, index) => ({ score, index }))
            .filter(({ score }) => score === maxScore)
            .slice(0, 2)
            .map(({ index }) => index)
        : page.focus === "point" && page.pointIndex !== undefined
          ? [executableLines[Math.min(page.pointIndex, executableLines.length - 1)]]
              .filter((index): index is number => index !== undefined)
          : [];
    if (activeCodeLines.length === 0) return page;
    return {
      ...page,
      activeCodeLines,
      diagramStep: page.pointIndex ?? activeCodeLines[0],
    };
  });
}

function mechanismLines(slide: Slide): TalkLine[] | undefined {
  if (slide.title === "代入 = は数学の等式ではない") {
    return [
      { speaker: "beginner", text: "名前に値をつけることと、あとから付け替えることは何が違うのですか？" },
      {
        speaker: "engineer",
        text: "名前へ値を結び付ける操作を代入と呼びます。すでに値を指している let の名前を別の値へ更新することを、特に再代入と呼びます。どちらも右側の計算を完了してから左側を更新します。",
      },
      { speaker: "beginner", text: "age = age + 1では、同じageを同時に読んだり書いたりするのですか？" },
      {
        speaker: "engineer",
        text: "同時ではありません。最初に右側のageから今の値20を読み、1を足して21を作ります。最後に左側のageを21へ更新します。この順番で1段ずつ追えば混乱しません。",
      },
    ];
  }
  if (slide.title === "let は付け替え可、const は不可") {
    return [
      { speaker: "beginner", text: "letとconstは、どちらも名前を作る言葉ですか？" },
      {
        speaker: "engineer",
        text: "どちらも名前を宣言する言葉です。letは後から再代入でき、constは同じ名前への再代入を禁止します。constは値全体を凍らせる命令ではありません。",
      },
    ];
  }
  if (slide.title === "数値や文字列は、コピー後に独立する") {
    return [
      { speaker: "beginner", text: "数値や文字列って、オブジェクトと同じ扱いなんですか？" },
      {
        speaker: "engineer",
        text: "数値・文字列・真偽値などは、それ以上プロパティの集まりとして扱わない基本的な値です。これをプリミティブと呼びます。まずは「数や文字を別の名前へ代入すると、その時点の値が渡る」と理解してください。",
      },
    ];
  }
  switch (slide.diagram) {
    case "fn-box":
      return undefined;
    case "callback-flow":
      return [
        { speaker: "beginner", text: "関数を実行せず、別の処理へ渡すこともできるのですか？" },
        {
          speaker: "engineer",
          text: "できます。あとで呼んでもらうために渡す関数を「コールバック」と呼びます。()なしで渡す段階では動かず、受け取った側が、いつ・何回・どの引数で呼ぶかを決めます。",
        },
      ];
    case "scope":
      return [
        { speaker: "beginner", text: "場所によって、同じ名前が見えたり見えなくなったりするんですか？" },
        {
          speaker: "engineer",
          text: "いまいる場所から、どの名前を読めるかという範囲です。この「名前が見える範囲」をスコープと呼びます。現在の波括弧内から探し、無ければ外側へ順に探します。",
        },
      ];
    case "closure":
      return [
        { speaker: "beginner", text: "外側の関数が終わったのに、なぜcountは消えないのですか？" },
        {
          speaker: "engineer",
          text: "返された内側の関数がcountを参照し続けているためです。関数本体と、その関数が生まれた環境への参照が一組で残る仕組みをクロージャと呼びます。",
        },
      ];
    case "fn-type":
      return [
        { speaker: "beginner", text: "関数の型を書くと、どの部分が検査されますか？" },
        {
          speaker: "engineer",
          text: "渡す引数の個数・順番・型と、returnする値の型を1つの契約として検査します。関数を変数へ入れたり別の関数へ渡したりしても、この契約が受け渡されます。",
        },
      ];
    case "for-loop":
      return [
        { speaker: "beginner", text: "forの括弧にある3つは、どの順番で何回実行されますか？" },
        {
          speaker: "engineer",
          text: "初期化は開始時に1回だけです。その後は「条件を計算してtrueかfalseを決める→trueなら本体→更新」の順を繰り返します。このように式の値を決めることを評価と呼びます。",
        },
        { speaker: "beginner", text: "条件がfalseになった周でも、本体や更新は動きますか？" },
        {
          speaker: "engineer",
          text: "動きません。条件がfalseになった時点でループを抜け、for文の次の行へ進みます。回数は初期値・比較演算子・更新量の3つを一緒に追って判断します。",
        },
      ];
    case "while-loop":
      return [
        { speaker: "beginner", text: "whileは、条件がtrueなら何回分まとめて実行するのですか？" },
        {
          speaker: "engineer",
          text: "1回分の本体を実行するたびに先頭へ戻り、条件をもう一度計算してtrueかfalseを決めます。条件に使う値は自動では変わらないため、本体か外部処理が状態を変えなければ終了しません。",
        },
      ];
    case "loop-control":
      return [
        { speaker: "beginner", text: "途中で飛ばすのと、そこでやめるのでは、次に進む場所が違いますか？" },
        {
          speaker: "engineer",
          text: "今の周だけ飛ばすのが continue で、forなら更新から次の条件へ進みます。そこで全体をやめるのが break で、更新も次の条件もせずループの直後へ移ります。どちらも基本は一番内側のループだけが対象です。",
        },
      ];
    case "for-of-loop":
      return [
        { speaker: "beginner", text: "番号を使わずに、配列の値を1個ずつ受け取るにはどうするのですか？" },
        {
          speaker: "engineer",
          text: "配列には「次の値を順番に渡す係」があります。この仕組みを正式にはイテレーターと呼びます。for...ofはそこから値を1個受け取り、本体を実行し、値が尽きるまで繰り返します。",
        },
      ];
    case "foreach-loop":
      return [
        { speaker: "beginner", text: "配列の各要素に対して、渡した関数はどのように呼ばれるのですか？" },
        {
          speaker: "engineer",
          text: "配列の先頭から要素を1個取り、その要素を処理するために渡された関数を呼びます。このように、相手に呼んでもらう関数をコールバックと呼びます。第1引数へ値、第2引数へ番号、第3引数へ元の配列を渡します。",
        },
        { speaker: "beginner", text: "渡した関数が返した値は、新しい配列になりますか？" },
        {
          speaker: "engineer",
          text: "forEachはreturn値を集めず捨てるため、forEach全体の戻り値はundefinedです。変換結果が必要ならmap、途中終了が必要ならforやfor...ofを選びます。",
        },
      ];
    case "var-hoist":
      return [
        { speaker: "beginner", text: "名前を書いた行より前なのに、なぜその名前だけ読めるのですか？" },
        {
          speaker: "engineer",
          text: "関数の実行準備で var の名前だけが先に登録され、値はundefinedになるからです。このため宣言が上にあるように見える現象を「巻き上げ」と呼びます。代入は元の行で行われます。",
        },
        { speaker: "beginner", text: "ifやforの波括弧ごとに、別の名前が作られるのでしょうか？" },
        {
          speaker: "engineer",
          text: "作られません。varの名前が見える範囲は関数全体です。これを「関数スコープ」と呼びます。同じ関数内では同じ名前と値の結び付きを共有するため、新しいコードではletとconstを基本にします。",
        },
      ];
    case "loop":
      return [
        { speaker: "beginner", text: "繰り返しの途中で飛ばしたりやめたりすると、次はどこへ進みますか？" },
        {
          speaker: "engineer",
          text: "今の周だけ飛ばす continue は、forなら更新を経て次の条件判定へ進みます。そこでやめる break は条件判定へ戻らず、ループ全体の次の行へ進みます。",
        },
      ];
    default:
      return undefined;
  }
}

function withStoryTalk(
  slide: Slide,
  pages: ConversationPage[],
): ConversationPage[] {
  if (!slide.storyTalk?.length) return pages;
  return [{ lines: slide.storyTalk, focus: "story" }, ...pages];
}

function pagesFromExplicitTalk(
  slide: Slide,
  lines: TalkLine[],
  listing: SlideListing,
): ConversationPage[] {
  const pages: ConversationPage[] = [];
  const vocabulary = vocabularyLines(slide);
  if (vocabulary) {
    pages.push({ lines: vocabulary, focus: "vocabulary" });
  }
  for (let index = 0; index < lines.length; index += 4) {
    const pointCount = slide.points?.length ?? 0;
    pages.push({
      lines: lines.slice(index, index + 4),
      focus: pointCount > 0 ? "point" : "intro",
      pointIndex:
        pointCount > 0 ? Math.min(Math.floor(index / 4), pointCount - 1) : undefined,
    });
  }

  const mechanics = mechanismLines(slide);
  if (mechanics) {
    pages.push({ lines: mechanics, focus: "point" });
  }

  if (slide.watch || slide.note) {
    const cautionLines: TalkLine[] = [];
    if (slide.watch) {
      cautionLines.push(
        { speaker: "beginner", text: "実際に書くとき、間違えやすい点はありますか？" },
        { speaker: "engineer", text: slide.watch },
      );
    }
    if (slide.note) {
      cautionLines.push(
        { speaker: "beginner", text: "最後に、覚えておく補足はありますか？" },
        { speaker: "engineer", text: slide.note },
      );
    }
    pages.push({
      lines: cautionLines,
      focus: slide.watch ? "watch" : "note",
    });
  }

  return synchronizeConversationPages(slide, withStoryTalk(slide, pages), listing);
}

export function talkPages(
  slide: Slide,
  listing: SlideListing,
): ConversationPage[] {
  if (isSummarySlide(slide)) {
    const lines: TalkLine[] =
      slide.talk && slide.talk.length > 0
        ? slide.talk
        : [
            { speaker: "beginner", text: "最後に、今回の内容を整理したいです。" },
            { speaker: "engineer", text: slide.lead },
            { speaker: "beginner", text: "覚えておくことを確認してもいいですか？" },
            { speaker: "engineer", text: slide.points?.join("。") ?? slide.lead },
          ];
    return synchronizeConversationPages(
      slide,
      [{ lines, focus: "summary" }],
      listing,
    );
  }

  if (slide.talk && slide.talk.length > 0) {
    return pagesFromExplicitTalk(slide, slide.talk, listing);
  }

  const vocabulary = vocabularyLines(slide);
  const pages: ConversationPage[] = [
    {
      lines: [
        {
          speaker: "beginner",
          text: `「${slide.title}」って、どういうことですか？`,
        },
        { speaker: "engineer", text: slide.lead },
      ],
      focus: "intro",
    },
  ];

  slide.points?.forEach((point, index) => {
    pages.push({
      lines: [
        {
          speaker: "beginner",
          text: POINT_QUESTIONS[index] ?? "ほかにも大事な点はありますか？",
        },
        { speaker: "engineer", text: point },
      ],
      focus: "point",
      pointIndex: index,
    });
  });

  const mechanics = mechanismLines(slide);
  if (mechanics) {
    pages.push({ lines: mechanics, focus: "point" });
  }

  if (slide.watch) {
    pages.push({
      lines: [
        { speaker: "beginner", text: "間違えやすいところはありますか？" },
        { speaker: "engineer", text: slide.watch },
      ],
      focus: "watch",
    });
  }

  if (slide.note) {
    pages.push({
      lines: [
        { speaker: "beginner", text: "補足も知っておきたいです。" },
        { speaker: "engineer", text: slide.note },
      ],
      focus: "note",
    });
  }

  return synchronizeConversationPages(
    slide,
    withStoryTalk(slide, [
      ...(vocabulary ? [{ lines: vocabulary, focus: "vocabulary" as const }] : []),
      ...pages,
    ]),
    listing,
  );
}

export function talkLines(slide: Slide, listing: SlideListing): TalkLine[] {
  return talkPages(slide, listing).flatMap((page) => page.lines);
}

export function teachingSlideEntries(lesson: Lesson) {
  return lesson.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => !isSummarySlide(slide));
}

export function questionForSlide(
  lesson: Lesson,
  slideIndex: number,
): Question | undefined {
  const tagged = lesson.questions.find((item) => item.slide === slideIndex);
  if (tagged) return tagged;
  const unit = teachingSlideEntries(lesson).findIndex(
    (entry) => entry.index === slideIndex,
  );
  return unit >= 0 ? lesson.questions[unit] : undefined;
}

export function nextSlideIndex(
  lesson: Lesson,
  from: number,
): number | undefined {
  if (from + 1 < lesson.slides.length) return from + 1;
  return undefined;
}

export function quizUnitIndex(lesson: Lesson, slideIndex: number): number {
  const unit = teachingSlideEntries(lesson).findIndex(
    (entry) => entry.index === slideIndex,
  );
  return unit < 0 ? 0 : unit;
}
