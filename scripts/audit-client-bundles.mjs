import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const NEXT = path.join(ROOT, ".next");
const BUDGET_FILE = path.join(ROOT, "scripts/client-bundle-budgets.json");

const REQUIRED_BUILD_FILES = [
  "BUILD_ID",
  "build-manifest.json",
  "routes-manifest.json",
  "prerender-manifest.json",
];
const ROUTES = {
  home: "index",
  review: "review",
  track: "track/js",
  lesson: "lesson/js-run",
};
const CLIENT_MANIFESTS = [
  "server/app/page_client-reference-manifest.js",
  "server/app/review/page_client-reference-manifest.js",
  "server/app/track/[track]/page_client-reference-manifest.js",
  "server/app/lesson/[id]/page_client-reference-manifest.js",
];
const LAZY_GROUPS = {
  "review-code-lab": "components/review-session.tsx -> @/components/code-lab",
  "review-quiz": "components/review-session.tsx -> @/components/quiz-challenge",
  "lesson-code-lab": "components/lesson-studio.tsx -> @/components/code-lab",
  "sql-console": "components/code-lab.tsx -> @/components/sql-console",
  "git-terminal": "components/code-lab.tsx -> @/components/git-terminal",
  monaco: "components/highlight-editor.tsx -> @monaco-editor/react",
};
const TURBOPACK_LOADABLE_MANIFESTS = [
  "server/app/review/page/react-loadable-manifest.json",
  "server/app/lesson/[id]/page/react-loadable-manifest.json",
];
const FORBIDDEN_MODULE_PATHS = [
  "/src/lib/course/server.ts",
  "/src/lib/course/index.ts",
  "/src/lib/course/js-start.ts",
  "/src/lib/course/js-basic.ts",
  "/src/lib/course/js-lessons.ts",
  "/src/lib/course/ts-lessons.ts",
  "/src/lib/course/node-lessons.ts",
  "/src/lib/course/sql-start.ts",
  "/src/lib/course/github-start.ts",
  "/src/lib/course/diagram-listings.ts",
  "/src/lib/course/sources.ts",
];
const CATALOG_SENTINELS = [
  "すべての行を同時に動かす",
  "注文表をのぞいてみよう",
  "GitとGitHubを分けて、記録を始める",
  "TypeScriptチャレンジ",
  "Node.jsはJavaScriptをブラウザの外で動かす",
  "表示は いち → に → さん",
  "https://www.sqlite.org/lang.html",
];
const REVIEW_DTO_KEYS = [
  "answer",
  "explain",
  "fixtureHtml",
  "typeTests",
  "sqlExpectedRows",
  "gitAssertions",
];
const REVIEW_ANSWER_SENTINELS = [
  'console.log("はじめます")',
  "SELECT * FROM orders;",
  "git init -b main",
  "Git（手元の履歴管理）",
];

const failures = [];
const requireFile = (relativePath) => {
  const file = path.join(NEXT, relativePath);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    failures.push(`ビルド成果物がありません: .next/${relativePath}`);
    return null;
  }
  return file;
};

for (const file of REQUIRED_BUILD_FILES) requireFile(file);
for (const file of CLIENT_MANIFESTS) requireFile(file);
if (failures.length > 0) finish();

const staticChunks = listFiles(path.join(NEXT, "static/chunks")).filter((file) =>
  file.endsWith(".js"),
);
if (staticChunks.length === 0) {
  failures.push(".next/static/chunks にJavaScript chunkがありません");
  finish();
}

for (const relativePath of CLIENT_MANIFESTS) {
  const source = fs.readFileSync(path.join(NEXT, relativePath), "utf8");
  for (const forbidden of FORBIDDEN_MODULE_PATHS) {
    if (source.includes(forbidden)) {
      failures.push(`${relativePath} がClient参照に${forbidden}を含みます`);
    }
  }
}

for (const file of staticChunks) {
  const source = fs.readFileSync(file, "utf8");
  for (const sentinel of CATALOG_SENTINELS) {
    if (source.includes(sentinel)) {
      failures.push(
        `${path.relative(ROOT, file)} に教材/catalog sentinel「${sentinel}」が混入しています`,
      );
    }
  }
}

const measurements = { routes: {}, lazy: {}, documents: {} };
for (const [name, routeFile] of Object.entries(ROUTES)) {
  const htmlFile = requireFile(`server/app/${routeFile}.html`);
  const rscFile = requireFile(`server/app/${routeFile}.rsc`);
  if (!htmlFile || !rscFile) continue;
  const html = fs.readFileSync(htmlFile, "utf8");
  const scripts = [
    ...html.matchAll(/<script[^>]+src=["']\/_next\/([^"']+\.js)["']/g),
  ].map((match) => path.join(NEXT, match[1]));
  const existingScripts = [...new Set(scripts)].filter(fs.existsSync);
  measurements.routes[name] = measureFiles(existingScripts);
  measurements.documents[`${name}.html`] = measureFiles([htmlFile]);
  measurements.documents[`${name}.rsc`] = measureFiles([rscFile]);
}

const webpackLoadableManifest = path.join(NEXT, "react-loadable-manifest.json");
const isTurbopackBuild = !fs.existsSync(webpackLoadableManifest);
if (!isTurbopackBuild) {
  const loadable = JSON.parse(fs.readFileSync(webpackLoadableManifest, "utf8"));
  for (const [name, manifestKey] of Object.entries(LAZY_GROUPS)) {
    const files = loadable[manifestKey]?.files;
    if (!Array.isArray(files) || files.length === 0) {
      failures.push(`lazy chunk manifest entryがありません: ${manifestKey}`);
      continue;
    }
    measurements.lazy[name] = measureFiles(
      [...new Set(files)]
        .filter((file) => file.endsWith(".js"))
        .map((file) => path.join(NEXT, file)),
    );
  }
} else {
  const lazyFiles = new Set();
  for (const relativePath of TURBOPACK_LOADABLE_MANIFESTS) {
    const manifestFile = requireFile(relativePath);
    if (!manifestFile) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    for (const entry of Object.values(manifest)) {
      for (const file of entry.files ?? []) {
        if (file.endsWith(".js")) lazyFiles.add(file);
      }
    }
  }
  if (lazyFiles.size === 0) {
    failures.push("Turbopackのlazy chunk manifestが空です");
  }
  for (const file of lazyFiles) requireFile(file);
}

const reviewPayload = [
  fs.readFileSync(path.join(NEXT, "server/app/review.html"), "utf8"),
  fs.readFileSync(path.join(NEXT, "server/app/review.rsc"), "utf8"),
  fs.readFileSync(path.join(NEXT, "server/app/review.segments/review/__PAGE__.segment.rsc"), "utf8"),
].join("\n");
const normalizedReviewPayload = reviewPayload.replaceAll('\\"', '"');
for (const key of REVIEW_DTO_KEYS) {
  if (
    normalizedReviewPayload.includes(`"${key}":`) ||
    normalizedReviewPayload.includes(`"${key}",`)
  ) {
    failures.push(`/review初期payloadに秘密DTO key「${key}」があります`);
  }
}
for (const answer of REVIEW_ANSWER_SENTINELS) {
  if (normalizedReviewPayload.includes(answer)) {
    failures.push(`/review初期payloadに既知解答「${answer}」があります`);
  }
}

const configuredBudgets = JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8"));
const budgets = isTurbopackBuild
  ? configuredBudgets.turbopack
  : configuredBudgets;
if (!budgets) failures.push("現在のbundler用の予算が未定義です");
for (const category of ["routes", "lazy", "documents"]) {
  for (const [name, measurement] of Object.entries(measurements[category])) {
    const budget = budgets[category]?.[name];
    if (!budget) {
      failures.push(`予算が未定義です: ${category}.${name}`);
      continue;
    }
    if (measurement.raw <= 0 || measurement.gzip <= 0) {
      failures.push(
        `${category}.${name}: 計測対象が空です (raw=${measurement.raw}, gzip=${measurement.gzip})`,
      );
      continue;
    }
    for (const metric of ["raw", "gzip"]) {
      if (measurement[metric] > budget[metric]) {
        failures.push(
          `${category}.${name}.${metric}: ${formatBytes(measurement[metric])} > 予算 ${formatBytes(budget[metric])}`,
        );
      }
    }
  }
}

console.log(JSON.stringify(measurements, null, 2));
finish();

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function measureFiles(files) {
  const unique = [...new Set(files)];
  return unique.reduce(
    (total, file) => {
      const bytes = fs.readFileSync(file);
      total.raw += bytes.length;
      total.gzip += gzipSync(bytes, { level: 9 }).length;
      return total;
    },
    { raw: 0, gzip: 0 },
  );
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function finish() {
  if (failures.length > 0) {
    console.error(failures.map((failure) => `- ${failure}`).join("\n"));
    process.exit(1);
  }
  console.log(
    !isTurbopackBuild
      ? "Client参照、catalog混入、初期JS、lazy chunk、HTML/RSC予算を確認しました。"
      : "Client参照、catalog混入、初期JS、Turbopack lazy manifest、HTML/RSC予算を確認しました。",
  );
  process.exit(0);
}
