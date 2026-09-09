export const TRACK_ORDER = ["js", "ts", "node", "sql", "github"] as const;
export type Track = (typeof TRACK_ORDER)[number];

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
  sql: "SQL",
  github: "GitHub",
};

export const TRACK_ACCENT: Record<Track, string> = {
  js: "var(--js)",
  ts: "var(--ts)",
  node: "var(--node)",
  sql: "var(--sql)",
  github: "var(--github)",
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
  | "node-prod"
  | "dom-tree"
  | "dom-query"
  | "dom-update"
  | "dom-create"
  | "dom-event"
  | "dom-form"
  | "dom-render"
  | "dom-storage"
  | "dom-fetch"
  | "sql-table"
  | "sql-filter"
  | "sql-sort"
  | "sql-group"
  | "sql-join"
  | "sql-write"
  | "sql-transaction"
  | "git-repository"
  | "git-staging"
  | "git-history"
  | "git-branch"
  | "git-remote"
  | "git-pr"
  | "git-conflict"
  | "git-actions";

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
export type ProjectRole = "drill" | "build" | "transfer";

export type Question = {
  id: string;
  slide?: number;
  prompt: string;
  lead?: string;
  code?: string;
  kind: "choice" | "input" | "code" | "shell" | "order" | "sql" | "git";
  options?: string[];
  fragments?: string[];
  starter?: string;
  fileName?: string;
  cwd?: string;
  aliases?: string[];
  termOutput?: TermLine[];
  termAlive?: boolean;
  runtime?: "console" | "dom" | "node" | "sql" | "git";
  fixtureHtml?: string;
  domProbe?: string;
  sqlSchema?: string;
  sqlSeed?: string;
  sqlExpectedRows?: Array<Record<string, string | number | null>>;
  sqlExpectedTable?: string;
  gitInitialState?: GitRepositoryState;
  gitAssertions?: GitAssertion[];
  behaviorCases?: BehaviorCase[];
  typeTests?: string;
  reviewVariants?: QuestionVariant[];
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
  projectRole?: ProjectRole;
  misconceptionId?: string;
  feedbackByAnswer?: Record<string, string>;
  misconceptionByAnswer?: Record<
    string,
    { id: string; feedback: string; nextCheck: string }
  >;
  hints?: string[];
};

export type BehaviorCase = {
  args?: unknown[];
  expected?: unknown;
  expectedLogs?: string[];
};

export type GitRepositoryState = {
  files?: Record<string, string>;
  branch?: string;
  branches?: string[];
  remote?: string;
  initialized?: boolean;
};

export type GitAssertion =
  | { kind: "staged"; path: string }
  | { kind: "commit-count"; count: number }
  | { kind: "branch"; name: string }
  | { kind: "remote"; name: string }
  | { kind: "pushed"; branch: string }
  | { kind: "pr-open"; base: string; head: string }
  | { kind: "clean" }
  | { kind: "remote-tracked"; remote: string; branch: string }
  | { kind: "merged"; branch: string }
  | { kind: "initialized" };

export type QuestionVariant = {
  id: string;
  prompt?: string;
  sqlSchema?: string;
  sqlSeed?: string;
  sqlExpectedRows?: Array<Record<string, string | number | null>>;
  gitInitialState?: GitRepositoryState;
  gitAssertions?: GitAssertion[];
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
  | "js-dom"
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
  | "node-prod"
  | "js-challenge"
  | "ts-challenge"
  | "node-challenge"
  | "sql-select"
  | "sql-filter"
  | "sql-sort"
  | "sql-group"
  | "sql-join"
  | "sql-write"
  | "sql-transaction"
  | "github-repository"
  | "github-commit"
  | "github-branch"
  | "github-remote"
  | "github-pr"
  | "github-conflict"
  | "github-automation";

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
