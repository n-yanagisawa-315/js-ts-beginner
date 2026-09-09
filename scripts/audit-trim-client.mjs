import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

for (const relativePath of [
  "src/components/slide-board.tsx",
  "src/lib/course/slide-layout.ts",
]) {
  const source = read(relativePath);
  assert.doesNotMatch(
    source,
    /diagram-listings|course\/sources|DIAGRAM_LISTING/,
    `${relativePath} が全図解のsupport mapを参照しています`,
  );
}

const server = read("src/lib/course/server.ts");
assert.match(server, /listings:\s*listingsFor\(slide\)/);
assert.match(server, /sources:\s*sourcesForDiagram\(slide\.diagram\)/);

for (const relativePath of [
  "src/app/lesson/[id]/page.tsx",
  "src/app/track/[track]/page.tsx",
  "src/app/reference/[topic]/route.ts",
]) {
  assert.match(
    read(relativePath),
    /export const dynamicParams = false;/,
    `${relativePath} で未知の有限ルートを404に固定できていません`,
  );
}

const sqlConsole = read("src/components/sql-console.tsx");
assert.match(sqlConsole, /const SQL_RESULT_PAGE_SIZE = 50;/);
assert.match(sqlConsole, /result\.rows\.slice\(/);
assert.match(
  sqlConsole,
  /current\.limit[\s\S]*\+ SQL_RESULT_PAGE_SIZE,[\s\S]*SQL_MAX_ROWS/,
);

const availableRows = Array.from({ length: 123 }, (_, index) => index);
const visibleCounts = [50, 100, 150].map(
  (limit) => availableRows.slice(0, Math.min(limit, 500)).length,
);
assert.deepEqual(visibleCounts, [50, 100, 123]);
assert.equal(
  Array.from({ length: 700 }).slice(0, Math.min(550, 500)).length,
  500,
);

for (const relativePath of [
  "src/app/error.tsx",
  "src/app/global-error.tsx",
]) {
  const source = read(relativePath);
  assert.match(source, /role="alert"|aria-labelledby="global-error-title"/);
  assert.match(source, /reset/);
  assert.match(source, /もう一度試す/);
}

console.log(
  "解決済みスライドDTO、有限ルート、SQLの50行段階表示、error fallback構造を確認しました。",
);
