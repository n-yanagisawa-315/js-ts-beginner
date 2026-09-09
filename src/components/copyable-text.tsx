"use client";

import { useId, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";

const TOKEN =
  /(`[^`]+`)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\b(?:\([^)]*\))?|\b[A-Za-z_$][\w$]*\([^)]*\))|(\b(?:const|let|var|typeof|return|if|else|for|while|switch|case|break|continue|function|class|new|async|await|import|export|from|true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)/g;

type Piece =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string; display: string };

type CopyToken = {
  match: string;
  value: string;
  display: string;
  identifier: boolean;
};

function tokensFromCode(code: string): CopyToken[] {
  const tokens: CopyToken[] = [];
  const seen = new Set<string>();
  const add = (token: CopyToken) => {
    const key = `${token.match}\u0000${token.value}`;
    if (!token.match || seen.has(key)) return;
    seen.add(key);
    tokens.push(token);
  };

  for (const match of code.matchAll(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
  )) {
    const raw = match[0];
    const inner = raw.slice(1, -1);
    add({ match: inner, value: raw, display: raw, identifier: false });
  }
  for (const match of code.matchAll(/\b\d+(?:\.\d+)?\b/g)) {
    add({
      match: match[0],
      value: match[0],
      display: match[0],
      identifier: false,
    });
  }
  for (const match of code.matchAll(
    /\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\b/g,
  )) {
    const value = match[0];
    if (
      [
        "const",
        "let",
        "var",
        "typeof",
        "return",
        "if",
        "else",
        "for",
        "while",
        "function",
        "class",
        "new",
        "async",
        "await",
        "true",
        "false",
        "null",
        "undefined",
      ].includes(value)
    ) {
      continue;
    }
    add({ match: value, value, display: value, identifier: true });
  }
  return tokens.sort((a, b) => b.match.length - a.match.length);
}

function findToken(source: string, token: CopyToken) {
  const wrapped = `「${token.match}」`;
  const wrappedIndex = source.indexOf(wrapped);
  if (wrappedIndex >= 0) {
    return { index: wrappedIndex, length: wrapped.length };
  }

  let index = source.indexOf(token.match);
  while (index >= 0) {
    if (!token.identifier) return { index, length: token.match.length };
    const before = source[index - 1] ?? "";
    const after = source[index + token.match.length] ?? "";
    if (!/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$]/.test(after)) {
      return { index, length: token.match.length };
    }
    index = source.indexOf(token.match, index + token.match.length);
  }
  return null;
}

function addDerivedTokens(piece: Piece, tokens: CopyToken[]): Piece[] {
  if (piece.kind === "code" || tokens.length === 0) return [piece];
  const result: Piece[] = [];
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

function piecesOf(
  text: string,
  code = "",
  copyValues: string[] = [],
): Piece[] {
  const pieces: Piece[] = [];
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
    })),
  ];
  return pieces.flatMap((piece) => addDerivedTokens(piece, derived));
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function CopyableText({
  text,
  className,
  code,
  copyValues,
}: {
  text: string;
  className?: string;
  code?: string;
  copyValues?: string[];
}) {
  const liveId = useId();
  const [copied, setCopied] = useState<string | null>(null);
  const pieces = piecesOf(
    text.replaceAll("starter", "最初から入っているコード"),
    code,
    copyValues,
  );

  async function copy(value: string) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <span className={className}>
      {pieces.map((piece, index) =>
        piece.kind === "code" ? (
          <span key={`${piece.value}-${index}`} className="copy-chip-wrap">
            <button
              type="button"
              className={`copy-chip${copied === piece.value ? " is-copied" : ""}`}
              aria-label={`${piece.display} をクリックしてコピー`}
              onClick={() => void copy(piece.value)}
            >
              <span className="copy-chip-text">{piece.display}</span>
              <span className="copy-chip-action" aria-hidden="true">
                {copied === piece.value ? <IconCheck /> : <IconCopy />}
              </span>
            </button>
            <span className="copy-tip" aria-hidden="true">
              {copied === piece.value ? "コピーしました" : "クリックしてコピー"}
            </span>
          </span>
        ) : (
          <span key={`t-${index}`}>{piece.value}</span>
        ),
      )}
      <span id={liveId} className="sr-only" aria-live="polite">
        {copied ? `${copied} をコピーしました` : ""}
      </span>
    </span>
  );
}
