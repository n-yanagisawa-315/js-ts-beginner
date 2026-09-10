export type CopyPiece =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string; display: string };

type CopyToken = {
  match: string;
  value: string;
  display: string;
  identifier: boolean;
  index: number;
};

const TOKEN =
  /(`[^`]+`)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\b(?:\([^)]*\))?|\b[A-Za-z_$][\w$]*\([^)]*\))|(\b(?:const|let|var|typeof|return|if|else|for|while|switch|case|break|continue|function|class|new|async|await|import|export|from)\b)/g;

const SYNTAX_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "return",
  "if",
  "else",
  "for",
  "while",
  "switch",
  "case",
  "function",
  "class",
  "new",
  "async",
  "await",
  "import",
  "export",
  "from",
]);

/** これからエディタへ書く対象になる制御語。構文キーワードでもチップに出す。 */
const WRITABLE_STATEMENT_KEYWORDS = new Set(["break", "continue"]);

const VALUE_KEYWORDS = new Set(["true", "false", "null", "undefined"]);

const SKIP_INPUT_IDENTIFIERS = new Set(["console", "console.log", "log"]);

const NUMBER_LIKE = /^\d+(?:\.\d+)?$/;

const COUNTER_AFTER_NUMBER =
  /^(?:つ|個|人|匹|本|枚|台|回|円|歳|年|月|日|時|分|秒|行|桁|件|名|冊|問|章|節|頁|番|目|種類|通り|文字|箇所|か所|ステップ|ページ|度)/;

const JP_CHAR = /[\u3040-\u30ff\u4e00-\u9fff]/;

function isProseContext(source: string, index: number, length: number) {
  const before = source[index - 1] ?? "";
  const after = source.slice(index + length);
  const afterChar = after[0] ?? "";
  if (/^[([.\]})]/.test(afterChar) || before === "(" || before === ".") {
    return false;
  }
  if (COUNTER_AFTER_NUMBER.test(after)) return true;
  if (JP_CHAR.test(afterChar) || afterChar === "、" || afterChar === "。") {
    return true;
  }
  if (JP_CHAR.test(before)) return true;
  return false;
}

function withoutComments(code: string): string {
  const saved: string[] = [];
  const withPlaceholders = code.replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g,
    (value) => {
      saved.push(value);
      return `\u0000${saved.length - 1}\u0000`;
    },
  );
  const stripped = withPlaceholders
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, "");
  return stripped.replace(/\u0000(\d+)\u0000/g, (_, index) => saved[Number(index)] ?? "");
}

function isNumberToken(token: CopyToken): boolean {
  return (
    !token.identifier &&
    NUMBER_LIKE.test(token.match) &&
    !/^['"]/.test(token.display)
  );
}

export function codeLearnerTypes(starter = "", answer = ""): string {
  const given = new Set(
    starter
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("/*")),
  );
  return answer
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return Boolean(trimmed) && !given.has(trimmed);
    })
    .join("\n");
}

function addTemplateStaticTokens(
  source: string,
  add: (token: Omit<CopyToken, "index">, index: number) => void,
) {
  for (const match of source.matchAll(/`(?:\\.|[^`\\])*`/g)) {
    const inner = match[0].slice(1, -1);
    let offset = (match.index ?? 0) + 1;
    for (const part of inner.split(/(\$\{[\s\S]*?\})/g)) {
      if (part.startsWith("${") && part.endsWith("}")) {
        offset += part.length;
        continue;
      }
      const trimmed = part.trim();
      if (trimmed) {
        add(
          {
            match: trimmed,
            value: trimmed,
            display: trimmed,
            identifier: false,
          },
          offset + part.indexOf(trimmed),
        );
      }
      offset += part.length;
    }
  }
}

function maskQuotedAndStaticTemplates(source: string): string {
  const maskQuotes = source.replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (value) => " ".repeat(value.length),
  );
  return maskQuotes.replace(/`(?:\\.|[^`\\])*`/g, (raw) =>
    raw.replace(/\$\{[\s\S]*?\}|(?:\\.|[^$`\\])+/g, (part) =>
      part.startsWith("${") ? part : " ".repeat(part.length),
    ),
  );
}

function tokensFromCode(code: string, appearanceOrder = false): CopyToken[] {
  const source = withoutComments(code);
  const unquoted = maskQuotedAndStaticTemplates(source);
  const tokens: CopyToken[] = [];
  const seen = new Set<string>();
  const add = (token: Omit<CopyToken, "index">, index: number) => {
    const key = `${token.match}\u0000${token.value}`;
    if (!token.match || seen.has(key)) return;
    seen.add(key);
    tokens.push({ ...token, index });
  };

  for (const match of source.matchAll(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
  )) {
    const raw = match[0];
    add(
      { match: raw.slice(1, -1), value: raw, display: raw, identifier: false },
      match.index ?? 0,
    );
  }
  addTemplateStaticTokens(source, add);
  for (const match of unquoted.matchAll(/\b\d+(?:\.\d+)?\b/g)) {
    const index = match.index ?? 0;
    if (isProseContext(unquoted, index, match[0].length)) continue;
    add(
      {
        match: match[0],
        value: match[0],
        display: match[0],
        identifier: false,
      },
      index,
    );
  }
  for (const match of unquoted.matchAll(/\[\s*\]|\{\s*\}/g)) {
    const value = match[0].replace(/\s+/g, "");
    add(
      {
        match: match[0],
        value,
        display: value,
        identifier: false,
      },
      match.index ?? 0,
    );
  }
  for (const match of unquoted.matchAll(/\b(?:true|false|null|undefined)\b/g)) {
    const index = match.index ?? 0;
    if (isProseContext(unquoted, index, match[0].length)) continue;
    add(
      {
        match: match[0],
        value: match[0],
        display: match[0],
        identifier: false,
      },
      index,
    );
  }
  for (const match of unquoted.matchAll(
    /\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\b/g,
  )) {
    const value = match[0];
    const index = match.index ?? 0;
    if (
      (SYNTAX_KEYWORDS.has(value) && !WRITABLE_STATEMENT_KEYWORDS.has(value)) ||
      VALUE_KEYWORDS.has(value)
    ) {
      continue;
    }
    if (isProseContext(unquoted, index, value.length)) continue;
    add({ match: value, value, display: value, identifier: true }, index);
  }

  return tokens.sort((a, b) =>
    appearanceOrder
      ? a.index - b.index || b.match.length - a.match.length
      : b.match.length - a.match.length,
  );
}

function isQuotedStringToken(token: CopyToken) {
  return !token.identifier && /^['"]/.test(token.display);
}

function findToken(source: string, token: CopyToken) {
  if (!isNumberToken(token)) {
    const wrapped = `「${token.match}」`;
    const wrappedIndex = source.indexOf(wrapped);
    if (wrappedIndex >= 0) {
      return { index: wrappedIndex, length: wrapped.length };
    }
  }
  if (isQuotedStringToken(token)) {
    for (const quoted of [`"${token.match}"`, `'${token.match}'`]) {
      const index = source.indexOf(quoted);
      if (index >= 0) return { index, length: quoted.length };
    }
    if (NUMBER_LIKE.test(token.match)) return null;
  }

  let index = source.indexOf(token.match);
  while (index >= 0) {
    const before = source[index - 1] ?? "";
    const after = source.slice(index + token.match.length);
    const afterChar = after[0] ?? "";
    if (isNumberToken(token)) {
      if (
        /\d/.test(before) ||
        /\d/.test(afterChar) ||
        COUNTER_AFTER_NUMBER.test(after) ||
        (before === "「" && after.startsWith("」"))
      ) {
        index = source.indexOf(token.match, index + token.match.length);
        continue;
      }
      return { index, length: token.match.length };
    }
    if (!token.identifier) return { index, length: token.match.length };
    if (!/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$]/.test(afterChar)) {
      return { index, length: token.match.length };
    }
    index = source.indexOf(token.match, index + token.match.length);
  }
  return null;
}

function addDerivedTokens(piece: CopyPiece, tokens: CopyToken[]): CopyPiece[] {
  if (piece.kind === "code" || tokens.length === 0) return [piece];
  const result: CopyPiece[] = [];
  let rest = piece.value;

  while (rest) {
    const found = tokens
      .map((token) => ({ token, location: findToken(rest, token) }))
      .filter(
        (
          item,
        ): item is {
          token: CopyToken;
          location: { index: number; length: number };
        } => item.location !== null,
      )
      .sort(
        (a, b) =>
          a.location.index - b.location.index ||
          b.location.length - a.location.length,
      )[0];
    if (!found) {
      result.push({ kind: "text", value: rest });
      break;
    }
    if (found.location.index > 0) {
      result.push({
        kind: "text",
        value: rest.slice(0, found.location.index),
      });
    }
    result.push({
      kind: "code",
      value: found.token.value,
      display: found.token.display,
    });
    rest = rest.slice(found.location.index + found.location.length);
  }
  return result;
}

export function piecesOf(
  text: string,
  code = "",
  copyValues: string[] = [],
): CopyPiece[] {
  const pieces: CopyPiece[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) {
      pieces.push({ kind: "text", value: text.slice(last, index) });
    }
    const raw = match[0];
    const quoted = raw.startsWith("`") && raw.endsWith("`");
    const display = quoted ? raw.slice(1, -1) : raw;
    pieces.push({ kind: "code", value: display, display });
    last = index + raw.length;
  }
  if (last < text.length) {
    pieces.push({ kind: "text", value: text.slice(last) });
  }
  const derived = [
    ...tokensFromCode(code),
    ...copyValues.map((value) => ({
      match: value,
      value,
      display: value,
      identifier: false,
      index: 0,
    })),
  ];
  return pieces.flatMap((piece) => addDerivedTokens(piece, derived));
}

export function inputTokenPieces(
  code: string,
  copyValues: string[] = [],
): CopyPiece[] {
  const seen = new Set<string>();
  const pieces: CopyPiece[] = [];
  const add = (value: string, display: string) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    pieces.push({ kind: "code", value, display });
  };

  for (const token of tokensFromCode(code, true)) {
    if (token.identifier && SKIP_INPUT_IDENTIFIERS.has(token.value)) continue;
    add(token.value, token.display);
  }
  for (const value of copyValues) add(value, value);
  return pieces;
}
