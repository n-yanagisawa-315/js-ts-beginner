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
  ["forEach", "配列が先頭から値を1個ずつ取り出し、渡された関数を各要素につき1回呼ぶ処理"],
  ["for...of", "配列などから値を1個ずつ受け取り、途中終了もできる繰り返し文"],
  ["イベントループ", "実行する仕事を種類ごとの待ち列から選び、JavaScriptへ渡す仕組み"],
  ["ジェネリクス", "使うときまで具体的な型を決めず、型どうしの関係を保つ書き方"],
  ["コールバック", "今すぐ自分で呼ばず、必要な時に呼んでもらうため相手へ渡す関数"],
  ["クロージャ", "関数と、その関数が作られた場所の変数へのつながりが一緒に残る仕組み"],
  ["イテレーター", "配列などから、次の値を1個ずつ順番に渡す係"],
  ["型推論", "書かれた値や使われ方から、TypeScriptが値の種類を自動で判断すること"],
  ["巻き上げ", "宣言行より前から名前があるように見える現象。varでは値はまだundefined"],
  ["実行領域", "1回の関数呼び出しで使う引数や局所変数を置く、一時的な作業場所"],
  ["ストリーム", "大きなデータを全部待たず、小さなまとまりで順番に受け渡す仕組み"],
  ["ランタイム", "書いたプログラムを実際に読み、動かす実行環境"],
  ["プリミティブ", "数値・文字列・真偽値などの基本的な値の総称"],
  ["モジュール", "外へ見せる名前を選び、コードをファイル単位で分ける仕組み"],
  ["スコープ", "コードのある場所から、どの名前を読み書きできるかという範囲"],
  ["Promise", "今は未確定でも、後で成功値か失敗理由が決まることを表す値"],
  ["continue", "今の1周だけ残りを飛ばし、次の周へ進む命令"],
  ["break", "繰り返し全体をその場で終え、その次の処理へ進む命令"],
  ["while", "条件がtrueの間、同じ処理を繰り返す文"],
  ["const", "宣言した名前を、あとから別の値へ再代入できないようにする言葉"],
  ["let", "あとから別の値へ再代入できる名前を宣言する言葉"],
  ["var", "関数全体を名前の見える範囲にする、古い変数宣言の言葉"],
  ["for", "開始時の準備・続ける条件・1周後の更新をまとめて書く繰り返し文"],
  ["非同期", "処理の完了をその場で待ち切らず、待っている間に別の仕事を進める動き"],
  ["プロセス", "OS上で動いている、メモリや終了状態を持つプログラムの1実行単位"],
  ["リテラル", "コードへ直接書いた3や\"Aya\"のように、その場で値を表す書き方"],
  ["参照", "オブジェクトそのものではなく、その置き場所をたどるための情報"],
  ["再代入", "すでに値と結び付いた名前を、別の値へ更新する操作"],
  ["仮引数", "関数が呼ばれたとき、渡された値を関数内で受け取る一時的な名前"],
  ["戻り値", "関数の処理が終わるとき、呼び出した場所へ返す値"],
  ["関数", "必要なときに呼び出せる手順を、1つの値としてまとめたもの"],
  ["評価", "式を実際に計算し、その式が表す1つの値を決めること"],
  ["代入", "右側で決めた値を、左側の名前へ結び付ける操作"],
  ["宣言", "この名前をこれから使うとJavaScriptへ知らせること"],
  ["変数", "値をあとから読み書きするために付ける名前"],
] as const;

function vocabularyLines(slide: Slide): TalkLine[] | undefined {
  if (slide.title === "名前は値への付箋") {
    return [
      { speaker: "beginner", text: "本題の前に、そもそも「変数」とは何ですか？" },
      {
        speaker: "engineer",
        text: "変数は、値をあとから読み書きするために付ける名前です。まずは「値へ付けた付箋」と考えてください。",
      },
      { speaker: "beginner", text: "説明に出てくる「宣言」と「評価」も知りたいです。" },
      {
        speaker: "engineer",
        text: "宣言は「この名前を使う」と知らせること、評価は式を計算して1つの値を決めることです。言葉の意味を押さえてから、let name = \"Aya\"を追いましょう。",
      },
    ];
  }
  if (slide.title === "{ } が名前の部屋になる") {
    return [
      { speaker: "beginner", text: "本題の前に「スコープ」と「ブロック」の意味を知りたいです。" },
      {
        speaker: "engineer",
        text: "スコープは名前を読み書きできる範囲、ブロックは波括弧{ }で囲んだコードのまとまりです。letとconstでは、ブロックが名前の見える境界になります。",
      },
    ];
  }
  const titleTerms = TERM_DEFINITIONS.filter(
    ([term]) =>
      slide.title.includes(term) &&
      !(term === "for" && (slide.title.includes("forEach") || slide.title.includes("for...of"))),
  )
    .sort(([termA], [termB]) => slide.title.indexOf(termA) - slide.title.indexOf(termB))
    .slice(0, 2);
  const leadTerms =
    titleTerms.length > 0
      ? []
      : TERM_DEFINITIONS.filter(([term]) => {
          if (["関数", "変数", "宣言", "評価", "代入", "再代入"].includes(term)) return false;
          if (!slide.lead.includes(term)) return false;
          return ![
            `${term}は`,
            `${term} は`,
            `${term}とは`,
            `${term} とは`,
            `${term}と呼`,
            `${term} と呼`,
          ].some((pattern) => slide.lead.includes(pattern));
        }).slice(0, 1);
  const terms = titleTerms.length > 0 ? titleTerms : leadTerms;
  if (terms.length === 0) return undefined;

  return terms.flatMap(([term, definition]) => [
    {
      speaker: "beginner" as const,
      text: `本題の前に「${term}」という言葉の意味を知りたいです。`,
    },
    {
      speaker: "engineer" as const,
      text: `${term}は「${definition}」です。まずこの日常語の意味を押さえてから、コード上の動きを見ましょう。`,
    },
  ]);
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
      { speaker: "beginner", text: "「代入」と「再代入」は何が違うのですか？" },
      {
        speaker: "engineer",
        text: "代入は名前へ値を結び付ける操作です。すでに値を指しているletの名前を別の値へ更新することを、特に再代入と呼びます。どちらも右側の計算を完了してから左側を更新します。",
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
      { speaker: "beginner", text: "letとconstは、どちらも変数を作る言葉ですか？" },
      {
        speaker: "engineer",
        text: "どちらも名前を宣言する言葉です。letは後から再代入でき、constは同じ名前への再代入を禁止します。constは値全体を凍らせる命令ではありません。",
      },
    ];
  }
  if (slide.title === "数値や文字列は、コピー後に独立する") {
    return [
      { speaker: "beginner", text: "ここでいう「プリミティブ」とは何ですか？" },
      {
        speaker: "engineer",
        text: "数値・文字列・真偽値など、それ以上プロパティの集まりとして扱わない基本的な値の総称です。まずは「数や文字を別の名前へ代入すると、その時点の値が渡る」と理解してください。",
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
        { speaker: "beginner", text: "「スコープ」という言葉は、何を表しているのですか？" },
        {
          speaker: "engineer",
          text: "コードのある場所から、どの名前を読めるかという範囲です。この「名前が見える範囲」をスコープと呼びます。現在の波括弧内から探し、無ければ外側へ順に探します。",
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
        { speaker: "beginner", text: "continueとbreakの後は、実行位置がそれぞれどこへ移りますか？" },
        {
          speaker: "engineer",
          text: "continueは今の周の残りを捨て、forの更新処理から次の条件へ進みます。breakは更新も次の条件も行わず、ループの直後へ移ります。どちらも基本は一番内側のループだけが対象です。",
        },
      ];
    case "for-of-loop":
      return [
        { speaker: "beginner", text: "for...ofは、番号を使わずどうやって次の値を取得しますか？" },
        {
          speaker: "engineer",
          text: "配列には「次の値を順番に渡す係」があります。この仕組みを正式にはイテレーターと呼びます。for...ofはそこから値を1個受け取り、本体を実行し、値が尽きるまで繰り返します。",
        },
      ];
    case "foreach-loop":
      return [
        { speaker: "beginner", text: "forEachは内部で、渡した関数をどのように呼んでいますか？" },
        {
          speaker: "engineer",
          text: "配列の先頭から要素を1個取り、その要素を処理するために渡された関数を呼びます。このように、相手に呼んでもらう関数をコールバックと呼びます。第1引数へ値、第2引数へ番号、第3引数へ元の配列を渡します。",
        },
        { speaker: "beginner", text: "コールバックでreturnした値は、新しい配列になるのでしょうか？" },
        {
          speaker: "engineer",
          text: "forEachはreturn値を集めず捨てるため、forEach全体の戻り値はundefinedです。変換結果が必要ならmap、途中終了が必要ならforやfor...ofを選びます。",
        },
      ];
    case "var-hoist":
      return [
        { speaker: "beginner", text: "varを宣言する行より前なのに、なぜ名前だけ読めるのですか？" },
        {
          speaker: "engineer",
          text: "関数の実行準備でvarの名前だけが先に登録され、値はundefinedになるからです。このため宣言が上にあるように見える現象を「巻き上げ」と呼びます。代入は元の行で行われます。",
        },
        { speaker: "beginner", text: "ifやforの波括弧ごとに、別のvarが作られるのでしょうか？" },
        {
          speaker: "engineer",
          text: "作られません。varの名前が見える範囲は関数全体です。これを「関数スコープ」と呼びます。同じ関数内では同じ名前と値の結び付きを共有するため、新しいコードではletとconstを基本にします。",
        },
      ];
    case "loop":
      return [
        { speaker: "beginner", text: "ループ中にcontinueやbreakへ到達すると、次はどこへ進みますか？" },
        {
          speaker: "engineer",
          text: "continueは今の周の残りを飛ばして、forなら更新処理を経て次の条件判定へ進みます。breakは条件判定へ戻らず、ループ全体の次の行へ進みます。",
        },
      ];
    default:
      return undefined;
  }
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

  return synchronizeConversationPages(slide, pages, listing);
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

  return synchronizeConversationPages(slide, [
    ...(vocabulary ? [{ lines: vocabulary, focus: "vocabulary" as const }] : []),
    ...pages,
  ], listing);
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
