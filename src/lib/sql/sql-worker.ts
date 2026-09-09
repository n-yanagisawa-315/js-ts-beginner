/// <reference lib="webworker" />

import sqlite3InitModule, {
  type Database,
  type SqlValue,
} from "@sqlite.org/sqlite-wasm";

const MAX_ROWS = 500;

type ExecuteRequest = {
  type: "execute";
  id: string;
  schema: string;
  seed: string;
  source: string;
};

type WorkerResponse =
  | {
      type: "result";
      id: string;
      columns: string[];
      rows: Array<Record<string, SqlValue>>;
      truncated: boolean;
    }
  | {
      type: "error";
      id: string;
      error: {
        name: string;
        message: string;
      };
    };

const SAFE_PRAGMAS = new Set([
  "compile_options",
  "foreign_key_list",
  "function_list",
  "index_info",
  "index_list",
  "index_xinfo",
  "module_list",
  "pragma_list",
  "table_info",
  "table_list",
  "table_xinfo",
]);

const sqlitePromise = sqlite3InitModule();
const workerScope = self as unknown as DedicatedWorkerGlobalScope;

function sqlTokens(source: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (current === "-" && next === "-") {
      index += 2;
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if (current === "/" && next === "*") {
      index += 2;
      while (
        index < source.length &&
        !(source[index] === "*" && source[index + 1] === "/")
      ) {
        index += 1;
      }
      index += 2;
      continue;
    }

    if (current === "'" || current === '"' || current === "`") {
      const quote = current;
      index += 1;
      while (index < source.length) {
        if (source[index] !== quote) {
          index += 1;
          continue;
        }
        if (source[index + 1] === quote) {
          index += 2;
          continue;
        }
        index += 1;
        break;
      }
      continue;
    }

    if (current === "[") {
      index += 1;
      while (index < source.length && source[index] !== "]") index += 1;
      index += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(current)) {
      const start = index;
      index += 1;
      while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) {
        index += 1;
      }
      tokens.push(source.slice(start, index).toLowerCase());
      continue;
    }

    if (current === "." || current === "(" || current === ")") {
      tokens.push(current);
    }
    index += 1;
  }

  return tokens;
}

function assertSafeSql(source: string) {
  const tokens = sqlTokens(source);

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "attach") {
      throw new Error("ATTACH はこのSQL演習では使用できません。");
    }
    if (token === "load_extension") {
      throw new Error("拡張機能の読み込みはこのSQL演習では使用できません。");
    }

    if (token.startsWith("pragma_")) {
      const pragmaName = token.slice("pragma_".length);
      if (!SAFE_PRAGMAS.has(pragmaName)) {
        throw new Error(`危険または未対応の PRAGMA ${pragmaName} は使用できません。`);
      }
    }

    if (token !== "pragma") continue;

    let pragmaIndex = index + 1;
    if (tokens[pragmaIndex + 1] === ".") pragmaIndex += 2;
    const pragmaName = tokens[pragmaIndex];
    if (!pragmaName || !SAFE_PRAGMAS.has(pragmaName)) {
      throw new Error(
        `危険または未対応の PRAGMA${pragmaName ? ` ${pragmaName}` : ""} は使用できません。`,
      );
    }
  }
}

function applyFixture(db: Database, sql: string, label: string) {
  if (!sql.trim()) return;
  try {
    db.exec(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}の適用に失敗しました: ${message}`);
  }
}

async function execute(request: ExecuteRequest): Promise<WorkerResponse> {
  assertSafeSql(request.source);

  const sqlite3 = await sqlitePromise;
  const db = new sqlite3.oo1.DB(":memory:");

  try {
    applyFixture(db, request.schema, "スキーマ");
    applyFixture(db, request.seed, "初期データ");

    const columns: string[] = [];
    const rows: Array<Record<string, SqlValue>> = [];
    let truncated = false;

    db.exec({
      sql: request.source,
      rowMode: "object",
      columnNames: columns,
      callback: (row) => {
        if (rows.length >= MAX_ROWS) {
          truncated = true;
          return false;
        }
        rows.push(row);
      },
    });

    return {
      type: "result",
      id: request.id,
      columns,
      rows,
      truncated,
    };
  } finally {
    db.close();
  }
}

workerScope.onmessage = async (event: MessageEvent<ExecuteRequest>) => {
  const request = event.data;
  if (!request || request.type !== "execute") return;

  try {
    workerScope.postMessage(await execute(request));
  } catch (error) {
    const normalized =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "SQLの実行に失敗しました。");
    workerScope.postMessage({
      type: "error",
      id: request.id,
      error: {
        name: normalized.name,
        message: normalized.message,
      },
    } satisfies WorkerResponse);
  }
};
