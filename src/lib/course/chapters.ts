import type { Chapter, ChapterId, Lesson, Track } from "@/lib/course/types";

export const CHAPTERS: Chapter[] = [
  {
    id: "js-syntax",
    track: "js",
    order: 1,
    title: "基礎文法編",
    summary: "実行順、値の種類、名前、計算。単語の意味から固定します",
  },
  {
    id: "js-data",
    track: "js",
    order: 2,
    title: "オブジェクトと配列編",
    summary: "名刺と電車。名前付きの束と、0 始まりの列",
  },
  {
    id: "js-loop",
    track: "js",
    order: 3,
    title: "繰り返し処理編",
    summary: "if で分かれ、for / while で同じ作業を繰り返す",
  },
  {
    id: "js-fn",
    track: "js",
    order: 4,
    title: "関数編",
    summary: "手順をまとめ、引数を受け、戻り値を返す。見える範囲もここで",
  },
  {
    id: "js-callback",
    track: "js",
    order: 5,
    title: "コールバック関数編",
    summary: "関数を渡して呼んでもらい、forEachで配列の各要素を処理する",
  },
  {
    id: "js-array-fn",
    track: "js",
    order: 6,
    title: "配列メソッド編",
    summary: "map / filter / toSorted。列を変換・選別・壊さず並べる",
  },
  {
    id: "js-modern",
    track: "js",
    order: 7,
    title: "いまの JavaScript編",
    summary: "?. と ??、toSorted、ES2026 の道具",
  },
  {
    id: "js-ref",
    track: "js",
    order: 8,
    title: "参照と構文編",
    summary: "同じ束を指す矢印、分割、スプレッド",
  },
  {
    id: "js-class",
    track: "js",
    order: 9,
    title: "クラス基礎編",
    summary: "this の指し先と、同じ形の個体を量産する class",
  },
  {
    id: "js-async",
    track: "js",
    order: 10,
    title: "非同期処理編",
    summary: "Promise、async/await、イベントループの順番",
  },
  {
    id: "js-dom",
    track: "js",
    order: 11,
    title: "注文管理DOM編",
    summary: "HTMLを取得・更新し、注文一覧の追加、絞り込み、保存、API接続まで組み立てる",
  },
  {
    id: "js-module",
    track: "js",
    order: 12,
    title: "モジュール編",
    summary: "ファイルを部屋にし、export した名前だけ外へ出す",
  },
  {
    id: "js-npm",
    track: "js",
    order: 13,
    title: "npmパッケージ編",
    summary: "他人のコードを借りる。package.json と import",
  },
  {
    id: "ts-intro",
    track: "ts",
    order: 1,
    title: "TypeScript入門編",
    summary: "なぜ型を先に書くか、7 の検査器、基本の注釈",
  },
  {
    id: "ts-shape",
    track: "ts",
    order: 2,
    title: "型の組み立て編",
    summary: "オブジェクト、satisfies、ユニオン、関数の契約",
  },
  {
    id: "ts-guard",
    track: "ts",
    order: 3,
    title: "型の絞り込み編",
    summary: "if で狭める。unknown と any の違い",
  },
  {
    id: "ts-generic",
    track: "ts",
    order: 4,
    title: "ジェネリクス編",
    summary: "型の引数 T を呼び出し側から渡す",
  },
  {
    id: "ts-advanced",
    track: "ts",
    order: 5,
    title: "上級の型編",
    summary: "ユーティリティ型、条件型、infer",
  },
  {
    id: "node-runtime",
    track: "node",
    order: 1,
    title: "実行環境編",
    summary: "ブラウザとの違い、CLI、モジュール、process",
  },
  {
    id: "node-fs",
    track: "node",
    order: 2,
    title: "ファイル編",
    summary: "fs と path。ディスク上の読み書き",
  },
  {
    id: "node-http",
    track: "node",
    order: 3,
    title: "HTTP編",
    summary: "リクエストを受け、レスポンスで返す",
  },
  {
    id: "node-npm",
    track: "node",
    order: 4,
    title: "npm運用編",
    summary: "lock、ci、scripts。再現できる入れ方",
  },
  {
    id: "node-async",
    track: "node",
    order: 5,
    title: "ストリームとイベント編",
    summary: "stream と libuv。I/O の待ち方",
  },
  {
    id: "node-prod",
    track: "node",
    order: 6,
    title: "本番運用編",
    summary: "エラーの扱いと、止め方",
  },
  {
    id: "js-challenge",
    track: "js",
    order: 14,
    title: "JavaScriptチャレンジ編",
    summary: "境界値・非破壊更新・クロージャ・非同期を実戦形式で解く",
  },
  {
    id: "ts-challenge",
    track: "ts",
    order: 6,
    title: "TypeScriptチャレンジ編",
    summary: "型の変換・絞り込み・ジェネリクス・条件型を型テストで解く",
  },
  {
    id: "node-challenge",
    track: "node",
    order: 7,
    title: "Node.jsチャレンジ編",
    summary: "CLI・ファイル・非同期I/O・HTTPを実戦形式で解く",
  },
  ...[
    ["sql-select", 1, "SELECT入門編", "テーブル・行・列を知り、必要な列を読む"],
    ["sql-filter", 2, "絞り込み編", "WHERE・比較・NULLで必要な注文を選ぶ"],
    ["sql-sort", 3, "並べ替え編", "ORDER BYとLIMITで表示順と件数を決める"],
    ["sql-group", 4, "集計編", "COUNT・SUM・GROUP BYで注文を集計する"],
    ["sql-join", 5, "JOIN編", "複数テーブルをキーで結び付ける"],
    ["sql-write", 6, "データ更新編", "INSERT・UPDATE・DELETEで注文を変更する"],
    ["sql-transaction", 7, "制約と取引編", "主キー・制約・トランザクションで整合性を守る"],
  ].map(([id, order, title, summary]) => ({
    id: id as ChapterId,
    track: "sql" as const,
    order: order as number,
    title: title as string,
    summary: summary as string,
  })),
  ...[
    ["github-repository", 1, "リポジトリ入門編", "GitとGitHubの役割を分け、履歴管理を始める"],
    ["github-commit", 2, "記録編", "status・add・commitで変更を安全に記録する"],
    ["github-branch", 3, "ブランチ編", "branch・switch・mergeで作業を分ける"],
    ["github-remote", 4, "共有編", "remote・push・pullで履歴を共有する"],
    ["github-pr", 5, "Pull Request編", "ghコマンドで提案・確認・統合を進める"],
    ["github-conflict", 6, "競合解消編", "衝突の原因を読み、安全に解決する"],
    ["github-automation", 7, "共同開発運用編", "Issue・Actions・保護ルールで運用を整える"],
  ].map(([id, order, title, summary]) => ({
    id: id as ChapterId,
    track: "github" as const,
    order: order as number,
    title: title as string,
    summary: summary as string,
  })),
];

export function getChapter(id: ChapterId): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.id === id);
}

export function chaptersByTrack(track: Track): Chapter[] {
  return CHAPTERS.filter((chapter) => chapter.track === track).sort(
    (a, b) => a.order - b.order,
  );
}

export function lessonsByChapter(lessons: Lesson[]) {
  const grouped = new Map<ChapterId, Lesson[]>();
  for (const lesson of lessons) {
    const list = grouped.get(lesson.chapter) ?? [];
    list.push(lesson);
    grouped.set(lesson.chapter, list);
  }
  const track = lessons[0]?.track;
  const chapters = track ? chaptersByTrack(track) : CHAPTERS;
  return chapters
    .map((chapter) => ({
      chapter,
      lessons: (grouped.get(chapter.id) ?? []).sort(
        (a, b) => a.order - b.order,
      ),
    }))
    .filter((group) => group.lessons.length > 0);
}
