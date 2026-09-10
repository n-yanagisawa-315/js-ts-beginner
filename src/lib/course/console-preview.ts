/**
 * console.log の引数がリテラルまたは単純な加減算だけなら、静的に出力を推定する。
 * 変数・関数呼び出し・複雑な式は推定しない。
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

  // "a" + "b" または 12 + 3 / 12 - 3（左右ともリテラル）を先に判定
  // （全体が "…" で囲まれているように見える連結式を誤って1文字列としない）
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

function extractLogArg(line: string): string | undefined {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*")) return undefined;
  const match = trimmed.match(/^console\.log\((.*)\)\s*;?\s*(?:\/\/.*)?$/);
  if (!match) return undefined;
  const inner = match[1]!.trim();
  // 複数引数は推定しない
  if (/,(?![^"'`]*["'`])/.test(inner) && !/^[^,]+$/.test(inner)) {
    // 簡易: 文字列内カンマ以外のカンマがあれば複数引数
    let depth = 0;
    let inStr: '"' | "'" | "`" | null = null;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i]!;
      if (inStr) {
        if (ch === "\\" ) {
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
      if (ch === "," && depth === 0) return undefined;
    }
  }
  return inner;
}

export function previewConsoleOutput(code: string): string[] | undefined {
  const lines = code.split("\n");
  const outputs: string[] = [];
  let sawLog = false;

  for (const line of lines) {
    const arg = extractLogArg(line);
    if (arg === undefined) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*") &&
        !trimmed.endsWith("*/")
      ) {
        // 実行可能な非 log 行があると推定を諦める（順序・副作用が読めない）
        if (/^(?:const|let|var|function|class|if|for|while|return|import|export)\b/.test(trimmed)) {
          return undefined;
        }
        if (!/^console\.log\b/.test(trimmed) && /[;=({]/.test(trimmed)) {
          return undefined;
        }
      }
      continue;
    }
    sawLog = true;
    const value = evalSimpleExpr(arg);
    if (value === undefined) return undefined;
    outputs.push(value);
  }

  return sawLog && outputs.length > 0 ? outputs : undefined;
}

export function resolveConsoleOutput(
  explicit: string[] | undefined,
  code: string | undefined,
): string[] | undefined {
  if (explicit && explicit.length > 0) return explicit;
  if (!code) return undefined;
  return previewConsoleOutput(code);
}
