import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(ROOT, "src");
const COURSE = path.join(SRC, "lib/course");
const EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx"];
const CLIENT_SAFE_COURSE_MODULES = new Set([
  path.join(COURSE, "client-dtos.ts"),
  path.join(COURSE, "slide-layout.ts"),
  path.join(COURSE, "types.ts"),
]);

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "node_modules" ? [] : sourceFiles(fullPath);
    }
    return /\.(?:[cm]?ts|tsx|jsx?)$/.test(entry.name) ? [fullPath] : [];
  });
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function resolveSourceModule(fromFile, specifier) {
  let base;
  if (specifier === "@") {
    base = SRC;
  } else if (specifier.startsWith("@/")) {
    base = path.join(SRC, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    base,
    ...EXTENSIONS.map((extension) => `${base}${extension}`),
    ...EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function runtimeSpecifiers(sourceFile) {
  const specifiers = [];
  const add = (node) => {
    if (ts.isStringLiteralLike(node)) specifiers.push(node.text);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause?.isTypeOnly) continue;
      if (
        clause?.namedBindings &&
        ts.isNamedImports(clause.namedBindings) &&
        !clause.name &&
        clause.namedBindings.elements.length > 0 &&
        clause.namedBindings.elements.every((element) => element.isTypeOnly)
      ) {
        continue;
      }
      add(statement.moduleSpecifier);
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly || !statement.moduleSpecifier) continue;
      if (
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.length > 0 &&
        statement.exportClause.elements.every((element) => element.isTypeOnly)
      ) {
        continue;
      }
      add(statement.moduleSpecifier);
    }
  }

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return specifiers;
}

const files = sourceFiles(SRC);
const parsed = new Map(
  files.map((file) => {
    const source = fs.readFileSync(file, "utf8");
    return [
      file,
      {
        sourceFile: ts.createSourceFile(
          file,
          source,
          ts.ScriptTarget.Latest,
          true,
          scriptKind(file),
        ),
        source,
      },
    ];
  }),
);

const graph = new Map();
const serverOnlyModules = new Set();
const clientRoots = [];

for (const [file, { sourceFile }] of parsed) {
  const directives = [];
  for (const statement of sourceFile.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    ) {
      break;
    }
    directives.push(statement.expression.text);
  }
  if (directives.includes("use client")) clientRoots.push(file);

  const dependencies = [];
  for (const specifier of runtimeSpecifiers(sourceFile)) {
    if (specifier === "server-only") {
      serverOnlyModules.add(file);
      continue;
    }
    const resolved = resolveSourceModule(file, specifier);
    if (resolved) dependencies.push(resolved);
  }
  graph.set(file, [...new Set(dependencies)]);
}

const forbiddenCourseModules = new Set(
  files.filter(
    (file) =>
      file.startsWith(`${COURSE}${path.sep}`) &&
      !CLIENT_SAFE_COURSE_MODULES.has(file),
  ),
);
forbiddenCourseModules.add(path.join(COURSE, "index.ts"));
forbiddenCourseModules.add(path.join(COURSE, "server.ts"));

function reasonFor(file) {
  if (serverOnlyModules.has(file)) return "server-onlyをimportするモジュール";
  if (forbiddenCourseModules.has(file)) {
    if (file.endsWith(`${path.sep}server.ts`)) return "教材server";
    if (file.endsWith(`${path.sep}index.ts`)) return "教材server barrel";
    return "教材カタログ/全講義データモジュール";
  }
  return null;
}

const violations = [];
for (const root of clientRoots.sort()) {
  const queue = [[root]];
  const visited = new Set();
  while (queue.length > 0) {
    const dependencyPath = queue.shift();
    const current = dependencyPath.at(-1);
    if (visited.has(current)) continue;
    visited.add(current);

    const reason = current === root ? null : reasonFor(current);
    if (reason) {
      violations.push({ reason, path: dependencyPath });
      continue;
    }
    for (const dependency of graph.get(current) ?? []) {
      queue.push([...dependencyPath, dependency]);
    }
  }
}

if (!serverOnlyModules.has(path.join(COURSE, "server.ts"))) {
  violations.push({
    reason: "course/server.tsにserver-only境界がありません",
    path: [path.join(COURSE, "server.ts")],
  });
}

if (violations.length > 0) {
  console.error("Client Componentからサーバー教材データへの実行時依存を検出しました:");
  for (const violation of violations) {
    console.error(`\n[${violation.reason}]`);
    violation.path.forEach((file, index) => {
      console.error(`${"  ".repeat(index)}${index === 0 ? "" : "↳ "}${path.relative(ROOT, file)}`);
    });
  }
  process.exitCode = 1;
} else {
  console.log(
    `${clientRoots.length}個のClient rootについて、教材server・server-only・全講義データへの推移的依存がないことを確認しました。`,
  );
}
