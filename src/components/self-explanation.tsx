"use client";

import { useId } from "react";
import type { Question } from "@/lib/course";

export function SelfExplanation({
  question,
  value,
  onChange,
  dark = false,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
}) {
  const id = useId();
  return (
    <section className={`self-explanation${dark ? " is-dark" : ""}`}>
      <label htmlFor={id}>次へ進む前に、考え方の違いを1文で説明する</label>
      <p>
        「最初は ___ と思った。実際は ___ の順で動く」の形で、答えではなく理由を書きます。
      </p>
      <textarea
        id={id}
        name={`self-explanation-${question.id}`}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="最初は同時に動くと思った。実際は右側を計算してから左側を更新する…"
      />
      {value.trim().length < 10 ? (
        <small>10文字以上書くと「あとで解き直す」を選べます。</small>
      ) : (
        <small>説明を記録できます。</small>
      )}
    </section>
  );
}
