"use client";

import { useId, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";
import {
  inputTokenPieces,
  piecesOf,
  stepPieces,
} from "@/lib/copyable-tokens";

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function CopyableText({
  text = "",
  className,
  code,
  copyValues,
  tokensOnly = false,
  stepsOnly = false,
}: {
  text?: string;
  className?: string;
  code?: string;
  copyValues?: string[];
  tokensOnly?: boolean;
  stepsOnly?: boolean;
}) {
  const liveId = useId();
  const [copied, setCopied] = useState<string | null>(null);
  const pieces = tokensOnly
    ? inputTokenPieces(code ?? "", copyValues ?? [])
    : stepsOnly
      ? stepPieces(text)
      : piecesOf(
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
