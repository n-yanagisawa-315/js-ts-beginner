import type { Track } from "@/lib/course";

export type TrackMeta = {
  name: string;
  heading: string;
  shortDescription: string;
  description: string;
  outcome: string;
  badge: string;
  accent: string;
  soft: string;
};

export const TRACK_META: Record<Track, TrackMeta> = {
  js: {
    name: "JavaScript",
    heading: "画面を動かす",
    shortDescription:
      "値・関数・配列からDOMまで、注文管理画面を動かしながら基礎を固めます。",
    description:
      "JavaScriptは、ブラウザ上の画面やデータへ動きを加える言語です。コードが上からどう実行され、値がどう変わるかを図で追い、注文一覧の追加・絞り込み・保存まで組み立てます。",
    outcome: "注文管理画面を操作できる",
    badge: "基礎〜DOM",
    accent: "var(--js)",
    soft: "#e8f6fb",
  },
  ts: {
    name: "TypeScript",
    heading: "データを守る",
    shortDescription:
      "JavaScriptへ型の約束を足し、注文データの取り違えを実行前に見つけます。",
    description:
      "TypeScriptはJavaScriptへ型検査を加える言語です。注文番号、金額、支払状態の形を先に決め、推論・絞り込み・ジェネリクスまで段階的に学びます。",
    outcome: "注文データへ安全な型を付ける",
    badge: "型の基礎〜応用",
    accent: "var(--ts)",
    soft: "#e6f1f6",
  },
  node: {
    name: "Node.js",
    heading: "APIへつなぐ",
    shortDescription:
      "JavaScriptをブラウザの外で動かし、注文を読み書きするAPIを作ります。",
    description:
      "Node.jsはJavaScriptをサーバーや開発マシンで動かす実行環境です。ファイル、HTTP、非同期処理、エラー処理をつなぎ、注文APIを安全に起動・停止できるところまで進みます。",
    outcome: "注文APIを起動して運用できる",
    badge: "実行環境〜運用",
    accent: "var(--node)",
    soft: "#eaf8ef",
  },
};
