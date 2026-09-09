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
  disabled = false,
  result = null,
}: {
  value: number | null;
  onChange: (value: number) => void;
  tone?: "light" | "dark";
  disabled?: boolean;
  result?: boolean | null;
}) {
  const noteId = useId();
  const feedbackId = useId();
  const gap =
    value === null || result === null
      ? null
      : Math.abs(value / 100 - (result ? 1 : 0));
  const feedback =
    gap === null
      ? null
      : gap <= 0.25
        ? "感覚と結果は近いです。"
        : result
          ? "正解でした。なぜ合っていたかを説明すると、次は自信を持って判断できます。"
          : "予想と結果に差がありました。解説と自分の考えの違いを1つ確認しましょう。";

  return (
    <fieldset
      className={`confidence-scale is-${tone}`}
      aria-describedby={`${noteId}${feedback ? ` ${feedbackId}` : ""}`}
    >
      <legend>答える前の自信は？</legend>
      <p id={noteId}>
        {disabled
          ? "回答前に選んだ値です。成績には影響しません。"
          : "自信を選ぶと解答できます。成績には影響しません。"}
      </p>
      <div>
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            aria-pressed={value === level.value}
            disabled={disabled}
            onClick={() => onChange(level.value)}
          >
            <span>{level.label}</span>
            <small>{level.value}%</small>
          </button>
        ))}
      </div>
      {feedback && value !== null && result !== null ? (
        <p id={feedbackId} className="confidence-feedback" role="status">
          自信 {value}% ／ 結果 {result ? "正解" : "不正解"}。{feedback}
        </p>
      ) : null}
    </fieldset>
  );
}
