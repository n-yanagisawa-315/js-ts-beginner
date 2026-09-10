/**
 * スライド左右対比用に console 出力を静的推定する。
 *
 * 付ける: console.log があり、リテラル／行末コメント／単純な束縛から結果が分かるとき
 * 付けない: 推定不能・実行結果を見せる必要がないコード（SQL/Git の構文例など）
 */

function unquote(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
    if (/\$\{/.test(trimmed)) return undefined;
    return trimmed.slice(1, -1);
  }
  return undefined;
}

function evalSimpleExpr(expr: string): string | undefined {
  const trimmed = expr.trim();
  if (!trimmed) return undefined;

  const concat = trimmed.match(
    /^((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|-?\d+(?:\.\d+)?))\s*([+-])\s*((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|-?\d+(?:\.\d+)?))$/,
  );
  if (concat) {
    const leftRaw = concat[1]!;
    const op = concat[2]!;
    const rightRaw = concat[3]!;
    const leftStr = unquote(leftRaw);
    const rightStr = unquote(rightRaw);
    const leftNum = /^-?\d+(?:\.\d+)?$/.test(leftRaw) ? Number(leftRaw) : undefined;
    const rightNum = /^-?\d+(?:\.\d+)?$/.test(rightRaw) ? Number(rightRaw) : undefined;

    if (leftStr !== undefined && rightStr !== undefined && op === "+") {
      return leftStr + rightStr;
    }
    if (leftNum !== undefined && rightNum !== undefined) {
      return String(op === "+" ? leftNum + rightNum : leftNum - rightNum);
    }
    if (op === "+" && leftNum !== undefined && rightStr !== undefined) {
      return String(leftNum) + rightStr;
    }
    if (op === "+" && leftStr !== undefined && rightNum !== undefined) {
      return leftStr + String(rightNum);
    }
    return undefined;
  }

  const asString = unquote(trimmed);
  if (asString !== undefined) return asString;

  if (/^(?:true|false|null|undefined)$/.test(trimmed)) {
    return trimmed;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

function splitTopLevelArgs(inner: string): string[] | undefined {
  const args: string[] = [];
  let depth = 0;
  let inStr: '"' | "'" | "`" | null = null;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!;
    if (inStr) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      args.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(inner.slice(start).trim());
  const cleaned = args.filter((arg) => arg.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
}

function extractLogArgs(line: string): string[] | undefined {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*")) return undefined;
  const match = trimmed.match(/^console\.log\((.*)\)\s*;?\s*(?:\/\/.*)?$/);
  if (!match) return undefined;
  return splitTopLevelArgs(match[1]!.trim());
}

/** 行末の `// 結果` を拾う。説明文は除外する。 */
export function trailingCommentResult(line: string): string | undefined {
  const match = line.match(/\/\/\s*(?:=>\s*)?(.+)$/);
  if (!match) return undefined;
  let raw = match[1]!.trim();
  const quoted = raw.match(/^(["'`])([^"'`]*)\1/);
  if (quoted) return quoted[2];
  raw = raw.split(/[。／]/)[0]!.trim();
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return raw;
  if (/^(?:true|false|null|undefined|NaN|Infinity)$/.test(raw)) return raw;
  if (/^(?:表示|出力|結果|入る|同じ|始める|復習|ここ)/.test(raw)) return undefined;
  if (/[→←]/.test(raw) && raw.length > 12) return undefined;
  if (raw.length > 0 && raw.length <= 28 && !/\s{2,}/.test(raw)) {
    return raw.replace(/^["']|["']$/g, "");
  }
  return undefined;
}

function isSkippableLine(trimmed: string): boolean {
  return (
    !trimmed ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.endsWith("*/")
  );
}

/** 複数行の `{ ... }` / `[ ... ]` を1行に潰して束縛解析しやすくする */
function flattenMultilineLiterals(code: string): string {
  const lines = code.split("\n");
  const out: string[] = [];
  let buffer = "";
  let depth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      depth === 0 &&
      /^(?:const|let|var)\b/.test(trimmed) &&
      /[{\[]\s*$/.test(trimmed)
    ) {
      buffer = trimmed;
      depth =
        (trimmed.match(/[{\[]/g)?.length ?? 0) -
        (trimmed.match(/[}\]]/g)?.length ?? 0);
      continue;
    }
    if (depth > 0) {
      buffer += ` ${trimmed}`;
      depth +=
        (trimmed.match(/[{\[]/g)?.length ?? 0) -
        (trimmed.match(/[}\]]/g)?.length ?? 0);
      if (depth <= 0) {
        out.push(buffer);
        buffer = "";
        depth = 0;
      }
      continue;
    }
    out.push(line);
  }
  if (buffer) out.push(buffer);
  return out.join("\n");
}

type EnvValue =
  | { kind: "prim"; value: string }
  | {
      kind: "obj";
      fields: Record<string, string>;
      nested?: Record<string, EnvValue>;
    }
  | { kind: "arr"; items: string[] };

function parseBindingRhs(rhs: string): EnvValue | undefined {
  const cleaned = rhs.replace(/;?\s*(?:\/\/.*)?$/, "").trim();
  const prim = evalSimpleExpr(cleaned);
  if (prim !== undefined) return { kind: "prim", value: prim };

  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    const body = cleaned.slice(1, -1).trim();
    if (!body) return { kind: "obj", fields: {} };
    const parts = splitTopLevelArgs(body);
    if (!parts) return undefined;
    const fields: Record<string, string> = {};
    const nested: Record<string, EnvValue> = {};
    for (const part of parts) {
      const m = part.match(/^(\w+)\s*:\s*(.+)$/);
      if (!m) return undefined;
      const value = parseBindingRhs(m[2]!);
      if (!value) return undefined;
      if (value.kind === "prim") fields[m[1]!] = value.value;
      else nested[m[1]!] = value;
    }
    if (Object.keys(nested).length === 0) return { kind: "obj", fields };
    return { kind: "obj", fields, nested };
  }

  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    const body = cleaned.slice(1, -1).trim();
    if (!body) return { kind: "arr", items: [] };
    const parts = splitTopLevelArgs(body);
    if (!parts) return undefined;
    const items: string[] = [];
    for (const part of parts) {
      const value = evalSimpleExpr(part);
      if (value === undefined) return undefined;
      items.push(value);
    }
    return { kind: "arr", items };
  }

  return undefined;
}

function evalWithEnv(expr: string, env: Map<string, EnvValue>): string | undefined {
  const trimmed = expr.trim();
  const direct = evalSimpleExpr(trimmed);
  if (direct !== undefined) return direct;

  const typeofMatch = trimmed.match(/^typeof\s+(\w+)$/);
  if (typeofMatch) {
    const value = env.get(typeofMatch[1]!);
    if (!value) return undefined;
    if (value.kind === "prim") {
      if (value.value === "true" || value.value === "false") return "boolean";
      if (value.value === "null") return "object";
      if (value.value === "undefined") return "undefined";
      if (/^-?\d+(?:\.\d+)?$/.test(value.value)) return "number";
      return "string";
    }
    return "object";
  }

  const indexMatch = trimmed.match(/^(\w+)\s*\[\s*(\d+)\s*\]$/);
  if (indexMatch) {
    const value = env.get(indexMatch[1]!);
    if (value?.kind === "arr") return value.items[Number(indexMatch[2])];
    return undefined;
  }

  if (/^\w+(?:\.\w+)+$/.test(trimmed)) {
    const parts = trimmed.split(".");
    let current: EnvValue | undefined = env.get(parts[0]!);
    for (let i = 1; i < parts.length; i++) {
      if (!current || current.kind !== "obj") return undefined;
      const key = parts[i]!;
      if (i === parts.length - 1) {
        return current.fields[key];
      }
      current = current.nested?.[key];
    }
  }

  const id = trimmed.match(/^(\w+)$/);
  if (id) {
    const value = env.get(id[1]!);
    if (value?.kind === "prim") return value.value;
  }

  const pathJoin = trimmed.match(/^path\.join\((.*)\)$/);
  if (pathJoin) {
    const parts = splitTopLevelArgs(pathJoin[1]!);
    if (!parts) return undefined;
    const values = parts.map((part) => evalSimpleExpr(part));
    if (values.every((value) => value !== undefined)) {
      return values.join("/");
    }
  }

  return undefined;
}

function applyAssignment(line: string, env: Map<string, EnvValue>): void {
  const trimmed = line.trim();
  const declEmpty = trimmed.match(
    /^(?:const|let|var)\s+(\w+)\s*(?::\s*[^=;]+)?\s*;?\s*(?:\/\/.*)?$/,
  );
  if (declEmpty && !/=/.test(trimmed)) {
    env.set(declEmpty[1]!, { kind: "prim", value: "undefined" });
    return;
  }
  const decl = trimmed.match(
    /^(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(.+)$/,
  );
  if (decl) {
    const rhs = decl[2]!.replace(/;?\s*(?:\/\/.*)?$/, "").trim();
    const value =
      parseBindingRhs(rhs) ??
      (() => {
        const evaluated = evalWithEnv(rhs, env);
        return evaluated !== undefined
          ? ({ kind: "prim", value: evaluated } as const)
          : undefined;
      })();
    if (value) env.set(decl[1]!, value);
    return;
  }
  const assign = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
  if (assign) {
    const rhs = assign[2]!.replace(/;?\s*(?:\/\/.*)?$/, "").trim();
    const value =
      parseBindingRhs(rhs) ??
      (() => {
        const evaluated = evalWithEnv(rhs, env);
        return evaluated !== undefined
          ? ({ kind: "prim", value: evaluated } as const)
          : undefined;
      })();
    if (value) env.set(assign[1]!, value);
  }
}

function parseTeachingResultComment(rawInput: string): string[] | undefined {
  let raw = rawInput.trim();
  if (!raw) return undefined;
  raw = raw.split(/[。／]/)[0]!.trim();
  raw = raw.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();

  const quotedLead = raw.match(/^(["'`])([^"'`]*)\1/);
  if (quotedLead && /と出る|が出る|が表示|が出力/.test(raw)) {
    return [quotedLead[2]!];
  }

  const times = raw.match(/^(.+?)\s*が\s*(\d+)\s*回/);
  if (times) {
    const token = times[1]!.replace(/^["'`]|["'`]$/g, "").trim();
    const n = Number(times[2]);
    if (token && n > 0 && n <= 5) return Array.from({ length: n }, () => token);
  }

  const andPair = raw.match(/^(.+?)\s*と\s*(.+)$/);
  if (andPair && !/出る|場合|同じ|押した/.test(raw)) {
    const left = andPair[1]!.replace(/^["'`]|["'`]$/g, "").trim();
    const right = andPair[2]!.replace(/^["'`]|["'`]$/g, "").trim();
    if (left.length <= 12 && right.length <= 12) return [left, right];
  }

  if (/^-?\d+(?:\s*,\s*\s*-?\d+)+$/.test(raw)) {
    return raw.split(/\s*,\s*/).map((part) => part.trim());
  }
  if (/^-?\d+(?:\s+-?\d+)+$/.test(raw)) {
    return raw.split(/\s+/);
  }

  const quoted = raw.match(/^(["'`])([^"'`]*)\1$/);
  if (quoted) return [quoted[2]!];

  if (/^-?\d+(?:\.\d+)?$/.test(raw) || /^(?:true|false|null|undefined)$/.test(raw)) {
    return [raw];
  }

  if (
    raw.length > 0 &&
    raw.length <= 24 &&
    !/[→←]/.test(raw) &&
    !/\s{2,}/.test(raw) &&
    !/^(?:入る|同じ|始める|復習|for |while |if |1つの|name |型が)/i.test(raw)
  ) {
    return [raw.replace(/^["']|["']$/g, "")];
  }
  return undefined;
}

/** コード末尾の `// 0` `// 1` や `// hi が2回` を出力行として拾う */
function extractTrailingBlockResults(lines: string[]): string[] | undefined {
  let lastCode = -1;
  for (let i = 0; i < lines.length; i++) {
    if (!isSkippableLine(lines[i]!.trim())) lastCode = i;
  }
  if (lastCode < 0 || lastCode >= lines.length - 1) return undefined;

  const results: string[] = [];
  for (let i = lastCode + 1; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) continue;
    if (!trimmed.startsWith("//")) return undefined;
    const parsed = parseTeachingResultComment(trimmed.slice(2));
    if (parsed) results.push(...parsed);
  }
  return results.length > 0 ? results : undefined;
}

function tryUnrollSimpleFor(
  lines: string[],
  env: Map<string, EnvValue>,
): string[] | undefined {
  const joined = lines.map((line) => line.trim()).join("\n");
  const match = joined.match(
    /for\s*\(\s*let\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{\s*console\.log\((\w+)\);\s*\}/,
  );
  if (!match) return undefined;
  const start = Number(match[2]);
  const end = Number(match[3]);
  const logged = match[4]!;
  if (logged !== match[1]) return undefined;
  if (end - start > 8 || end <= start) return undefined;
  const outputs: string[] = [];
  for (let i = start; i < end; i++) outputs.push(String(i));
  // seed env for any later use
  env.set(match[1]!, { kind: "prim", value: String(end) });
  return outputs;
}

/**
 * console.log があるコードだけ結果を推定する。
 * 推定できない場合は undefined（左右対比は出さない）。
 */
export function previewConsoleOutput(code: string): string[] | undefined {
  if (!/console\.log\s*\(/.test(code)) return undefined;

  const lines = flattenMultilineLiterals(code).split("\n");
  const env = new Map<string, EnvValue>();

  const unrolled = tryUnrollSimpleFor(lines, env);
  if (unrolled) {
    const blockResults = extractTrailingBlockResults(lines);
    return blockResults && blockResults.length > 0 ? blockResults : unrolled;
  }

  const outputs: string[] = [];
  let logCount = 0;
  let unresolved = 0;
  let stoppedByError = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (isSkippableLine(trimmed)) continue;

    // 未定義参照っぽい単独識別子は、その後の log を実行されない扱いにする
    if (
      /^[A-Za-z_$][\w$]*\s*;?\s*(?:\/\/.*)?$/.test(trimmed) &&
      !/^(?:true|false|null|undefined|const|let|var|function|return|if|else|for|while|break|continue|class|import|export|typeof|new|throw|try|catch)\b/.test(
        trimmed,
      ) &&
      !env.has(trimmed.replace(/;?\s*(?:\/\/.*)?$/, ""))
    ) {
      const name = trimmed.replace(/;?\s*(?:\/\/.*)?$/, "");
      if (!/^(?:console)$/.test(name)) {
        stoppedByError = true;
        continue;
      }
    }

    applyAssignment(line, env);

    const args = extractLogArgs(line);
    if (!args) continue;
    logCount++;
    if (stoppedByError) {
      unresolved++;
      continue;
    }

    const fromComment = trailingCommentResult(line);
    if (fromComment !== undefined) {
      outputs.push(fromComment);
      continue;
    }

    const parts = args.map((arg) => evalWithEnv(arg, env));
    if (parts.every((part) => part !== undefined)) {
      outputs.push(parts.join(" "));
      continue;
    }
    unresolved++;
  }

  // ネストした console.log やコールバックは行単位では拾えないので末尾コメントを使う
  const blockResults = extractTrailingBlockResults(lines);
  if (blockResults && blockResults.length > 0) {
    if (logCount === 0 || unresolved > 0 || outputs.length === 0) {
      return blockResults;
    }
  }

  if (logCount === 0) return undefined;

  if (outputs.length > 0 && unresolved === 0) {
    return outputs;
  }

  if (stoppedByError && outputs.length > 0) {
    return outputs;
  }

  return undefined;
}

/** 左右対比＋実行矢印を出すか（明示結果 or 推定可能な console.log） */
export function shouldShowResultPanel(
  explicit: string[] | undefined,
  code: string | undefined,
): boolean {
  if (explicit && explicit.length > 0) return true;
  if (!code) return false;
  return previewConsoleOutput(code) !== undefined;
}

export function resolveConsoleOutput(
  explicit: string[] | undefined,
  code: string | undefined,
): string[] | undefined {
  if (explicit && explicit.length > 0) return explicit;
  if (!code) return undefined;
  return previewConsoleOutput(code);
}
