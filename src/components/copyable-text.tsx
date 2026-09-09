"use client";

import { useId, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";

const TOKEN =
  /(`[^`]+`)|(\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\b(?:\([^)]*\))?|\b[A-Za-z_$][\w$]*\([^)]*\))/g;

type Piece =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string; display: string };

function piecesOf(text: string): Piece[] {
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
  return pieces;
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
}: {
  text: string;
  className?: string;
}) {
  const liveId = useId();
  const [copied, setCopied] = useState<string | null>(null);
  const pieces = piecesOf(
    text.replaceAll("starter", "最初から入っているコード"),
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
