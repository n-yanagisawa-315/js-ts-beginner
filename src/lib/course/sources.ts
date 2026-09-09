import type { DiagramId } from "@/lib/course/types";

export type CourseSource = {
  title: string;
  url: string;
  publisher: string;
};

const MDN_GUIDE: CourseSource = {
  title: "JavaScript Guide",
  url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  publisher: "MDN",
};

const TYPESCRIPT_HANDBOOK: CourseSource = {
  title: "The TypeScript Handbook",
  url: "https://www.typescriptlang.org/docs/handbook/intro.html",
  publisher: "TypeScript",
};

const NODE_API: CourseSource = {
  title: "Node.js API documentation",
  url: "https://nodejs.org/api/documentation.html",
  publisher: "Node.js",
};

const NPM_DOCS: CourseSource = {
  title: "npm Docs",
  url: "https://docs.npmjs.com/",
  publisher: "npm",
};

const SQLITE_DOCS: CourseSource = {
  title: "SQLite Language Reference",
  url: "https://www.sqlite.org/lang.html",
  publisher: "SQLite",
};

const GITHUB_DOCS: CourseSource = {
  title: "GitHub CLI manual",
  url: "https://cli.github.com/manual/",
  publisher: "GitHub",
};

const TOPIC_SOURCES: Partial<Record<DiagramId, CourseSource>> = {
  "fn-box": {
    title: "Functions",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
    publisher: "MDN",
  },
  "callback-flow": {
    title: "Callback function",
    url: "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function",
    publisher: "MDN",
  },
  "for-loop": {
    title: "for statement",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for",
    publisher: "MDN",
  },
  "while-loop": {
    title: "while statement",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while",
    publisher: "MDN",
  },
  "loop-control": {
    title: "Loops and iteration",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
    publisher: "MDN",
  },
  "for-of-loop": {
    title: "for...of statement",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of",
    publisher: "MDN",
  },
  "foreach-loop": {
    title: "Array.prototype.forEach()",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach",
    publisher: "MDN",
  },
  "var-hoist": {
    title: "var statement",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var",
    publisher: "MDN",
  },
  object: {
    title: "Working with objects",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
    publisher: "MDN",
  },
  array: {
    title: "Indexed collections",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
    publisher: "MDN",
  },
  scope: {
    title: "Closures and lexical scoping",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
    publisher: "MDN",
  },
  closure: {
    title: "Closures",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
    publisher: "MDN",
  },
  promise: {
    title: "Using promises",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
    publisher: "MDN",
  },
  "async-await": {
    title: "async function",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
    publisher: "MDN",
  },
  "event-loop": {
    title: "JavaScript execution model",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
    publisher: "MDN",
  },
  modules: {
    title: "JavaScript modules",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
    publisher: "MDN",
  },
  "class-instance": {
    title: "Using classes",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes",
    publisher: "MDN",
  },
  "dom-tree": {
    title: "Introduction to the DOM",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
    publisher: "MDN",
  },
  "dom-query": {
    title: "Document.querySelector()",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector",
    publisher: "MDN",
  },
  "dom-update": {
    title: "Node.textContent",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
    publisher: "MDN",
  },
  "dom-create": {
    title: "Document.createElement()",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement",
    publisher: "MDN",
  },
  "dom-event": {
    title: "EventTarget.addEventListener()",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
    publisher: "MDN",
  },
  "dom-form": {
    title: "FormData",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/FormData",
    publisher: "MDN",
  },
  "dom-render": {
    title: "Element: replaceChildren()",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren",
    publisher: "MDN",
  },
  "dom-storage": {
    title: "Window.localStorage",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
    publisher: "MDN",
  },
  "dom-fetch": {
    title: "Using the Fetch API",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
    publisher: "MDN",
  },
  narrow: {
    title: "Narrowing",
    url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
    publisher: "TypeScript",
  },
  generic: {
    title: "Generics",
    url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
    publisher: "TypeScript",
  },
  utility: {
    title: "Utility Types",
    url: "https://www.typescriptlang.org/docs/handbook/utility-types.html",
    publisher: "TypeScript",
  },
  conditional: {
    title: "Conditional Types",
    url: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html",
    publisher: "TypeScript",
  },
  "fn-type": {
    title: "More on Functions",
    url: "https://www.typescriptlang.org/docs/handbook/2/functions.html",
    publisher: "TypeScript",
  },
  "node-cli": {
    title: "Command-line API",
    url: "https://nodejs.org/api/cli.html",
    publisher: "Node.js",
  },
  "node-cjs-esm": {
    title: "Modules",
    url: "https://nodejs.org/api/modules.html",
    publisher: "Node.js",
  },
  "node-process": {
    title: "Process",
    url: "https://nodejs.org/api/process.html",
    publisher: "Node.js",
  },
  "node-fs": {
    title: "File system",
    url: "https://nodejs.org/api/fs.html",
    publisher: "Node.js",
  },
  "node-path": {
    title: "Path",
    url: "https://nodejs.org/api/path.html",
    publisher: "Node.js",
  },
  "node-http": {
    title: "HTTP",
    url: "https://nodejs.org/api/http.html",
    publisher: "Node.js",
  },
  "node-stream": {
    title: "Stream",
    url: "https://nodejs.org/api/stream.html",
    publisher: "Node.js",
  },
  "node-libuv": {
    title: "The Node.js event loop",
    url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    publisher: "Node.js",
  },
};

const TYPESCRIPT_DIAGRAMS = new Set<DiagramId>([
  "contract",
  "annotate",
  "shape",
  "union",
  "fn-type",
  "narrow",
  "unknown",
  "generic",
  "utility",
  "conditional",
]);

export function sourcesForDiagram(id: DiagramId): CourseSource[] {
  const topic = TOPIC_SOURCES[id];
  if (id.startsWith("sql-")) return [SQLITE_DOCS];
  if (id.startsWith("git-")) return [GITHUB_DOCS];
  if (id === "node-npm") return [NPM_DOCS, NODE_API];
  if (id.startsWith("node-")) return topic ? [topic, NODE_API] : [NODE_API];
  if (TYPESCRIPT_DIAGRAMS.has(id)) {
    return topic ? [topic, TYPESCRIPT_HANDBOOK] : [TYPESCRIPT_HANDBOOK];
  }
  return topic ? [topic, MDN_GUIDE] : [MDN_GUIDE];
}
