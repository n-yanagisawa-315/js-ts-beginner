export type Track = "js" | "ts" | "node";

export type Level = "start" | "basic" | "middle" | "advanced";

export const LEVEL_LABEL: Record<Level, string> = {
  start: "はじめて",
  basic: "基礎",
  middle: "中級",
  advanced: "上級",
};

export const TRACK_LABEL: Record<Track, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  node: "Node.js",
};

export const TRACK_ACCENT: Record<Track, string> = {
  js: "var(--js)",
  ts: "var(--ts)",
  node: "var(--node)",
};

export type DiagramId =
  | "sequence"
  | "values"
  | "label"
  | "rewrite"
  | "calc"
  | "dynamic"
  | "fn-box"
  | "callback-flow"
  | "object"
  | "array"
  | "branch"
  | "loop"
  | "for-loop"
  | "while-loop"
  | "loop-control"
  | "for-of-loop"
  | "foreach-loop"
  | "scope"
  | "var-hoist"
  | "ref"
  | "spread"
  | "map"
  | "closure"
  | "this-call"
  | "class-instance"
  | "promise"
  | "async-await"
  | "event-loop"
  | "modules"
  | "contract"
  | "annotate"
  | "shape"
  | "union"
  | "fn-type"
  | "narrow"
  | "unknown"
  | "generic"
  | "utility"
  | "conditional"
  | "node-vs-browser"
  | "node-cli"
  | "node-cjs-esm"
  | "node-process"
  | "node-fs"
  | "node-path"
  | "node-http"
  | "node-npm"
  | "node-stream"
  | "node-libuv"
  | "node-error"
  | "node-prod";

export type TalkLine = {
  speaker: "engineer" | "beginner";
  text: string;
};

export type ConversationPage = {
  lines: TalkLine[];
  focus: "vocabulary" | "story" | "predict" | "intro" | "point" | "watch" | "note" | "summary";
  pointIndex?: number;
  activeCodeLines?: number[];
  diagramStep?: number;
};

export type StoryBeat = "problem" | "prediction" | "trace" | "resolution" | "transfer";

export type Slide = {
  title: string;
  lead: string;
  points?: string[];
  watch?: string;
  diagram: DiagramId;
  code?: string;
  codeExample?: string;
  codeCaption?: string;
  note?: string;
  talk?: TalkLine[];
  objectiveId?: string;
  conceptIds?: string[];
  storyBeat?: StoryBeat;
  storyContext?: string;
};

export type TermTone = "out" | "meta" | "ok" | "warn" | "err";

export type TermLine = {
  text: string;
  tone?: TermTone;
};

export type ExerciseKind =
  | "prequestion"
  | "trace"
  | "worked"
  | "faded"
  | "independent"
  | "self-explain"
  | "debug"
  | "transfer"
  | "exit-recall";

export type ScaffoldLevel = "worked" | "guided" | "faded" | "independent";
export type TransferLevel = "same" | "near" | "far";

export type Question = {
  id: string;
  slide?: number;
  prompt: string;
  lead?: string;
  code?: string;
  kind: "choice" | "input" | "code" | "shell" | "order";
  options?: string[];
  fragments?: string[];
  starter?: string;
  fileName?: string;
  cwd?: string;
  aliases?: string[];
  termOutput?: TermLine[];
  termAlive?: boolean;
  steps?: string[];
  hint?: string;
  sample?: string;
  answer: string;
  explain: string;
  objectiveId?: string;
  conceptIds?: string[];
  variantId?: string;
  scenario?: string;
  exerciseKind?: ExerciseKind;
  scaffoldLevel?: ScaffoldLevel;
  contrastGroup?: string;
  transferLevel?: TransferLevel;
  misconceptionId?: string;
  feedbackByAnswer?: Record<string, string>;
  misconceptionByAnswer?: Record<
    string,
    { id: string; feedback: string; nextCheck: string }
  >;
  hints?: string[];
};

export type ChapterId =
  | "js-syntax"
  | "js-data"
  | "js-loop"
  | "js-fn"
  | "js-callback"
  | "js-array-fn"
  | "js-modern"
  | "js-ref"
  | "js-class"
  | "js-async"
  | "js-module"
  | "js-npm"
  | "ts-intro"
  | "ts-shape"
  | "ts-guard"
  | "ts-generic"
  | "ts-advanced"
  | "node-runtime"
  | "node-fs"
  | "node-http"
  | "node-npm"
  | "node-async"
  | "node-prod";

export type Chapter = {
  id: ChapterId;
  track: Track;
  order: number;
  title: string;
  summary: string;
};

export type Lesson = {
  id: string;
  track: Track;
  level: Level;
  chapter: ChapterId;
  order: number;
  title: string;
  summary: string;
  minutes: number;
  slides: Slide[];
  questions: Question[];
  story?: {
    project: string;
    incident: string;
    outcome: string;
  };
  objectives?: {
    id: string;
    label: string;
    conceptIds: string[];
    prerequisites?: string[];
  }[];
};
