import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(ROOT, "src");
const CLIENT_DIRECTIVE = /^\s*["']use client["'];/;
const FORBIDDEN_IMPORT =
  /(?:from\s+|import\s*\()\s*["']@\/lib\/course(?:\/server)?["']/g;

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [fullPath] : [];
  });
}

const violations = [];
for (const file of sourceFiles(SRC)) {
  const source = fs.readFileSync(file, "utf8");
  if (!CLIENT_DIRECTIVE.test(source)) continue;
  const imports = [...source.matchAll(FORBIDDEN_IMPORT)];
  if (imports.length > 0) {
    violations.push(
      `${path.relative(ROOT, file)}: Client Componentから教材server/barrelを参照`,
    );
  }
}

assert.deepEqual(violations, [], violations.join("\n"));

const serverSource = fs.readFileSync(
  path.join(SRC, "lib/course/server.ts"),
  "utf8",
);
assert.match(
  serverSource,
  /^\s*import\s+["']server-only["'];/,
  "教材カタログにserver-only境界が必要です",
);

const chunksDirectory = path.join(ROOT, ".next/static/chunks");
if (fs.existsSync(chunksDirectory)) {
  const chunkFiles = sourceFiles(chunksDirectory).filter((file) =>
    file.endsWith(".js"),
  );
  const leaked = chunkFiles.filter((file) =>
    fs.readFileSync(file, "utf8").includes("値には種類がある"),
  );
  assert.deepEqual(
    leaked.map((file) => path.relative(ROOT, file)),
    [],
    "教材本文が静的Client Chunkへ混入しています",
  );
}

console.log(
  "Client Componentの教材server境界と静的チャンクへの教材本文混入がないことを確認しました。",
);
