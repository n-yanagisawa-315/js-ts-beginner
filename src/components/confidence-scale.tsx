"use client";

import { useId } from "react";

const LEVELS = [
  { value: 25, label: "まだ迷う" },
  { value: 50, label: "半分くらい" },
  { value: 75, label: "かなり自信" },
  { value: 100, label: "説明できる" },
] as const;

export function ConfidenceScale({
  value,
  onChange,
  tone = "light",
}: {
  value: number | null;
  onChange: (value: number) => void;
  tone?: "light" | "dark";
}) {
  const noteId = useId();
  return (
    <fieldset
      className={`confidence-scale is-${tone}`}
      aria-describedby={noteId}
    >
      <legend>答える前の自信は？</legend>
      <p id={noteId}>成績には影響しません。理解した感覚と実際の結果を比べます。</p>
      <div>
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            aria-pressed={value === level.value}
            onClick={() => onChange(level.value)}
          >
            <span>{level.label}</span>
            <small>{level.value}%</small>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
