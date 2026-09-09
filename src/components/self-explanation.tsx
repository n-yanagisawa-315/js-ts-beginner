"use client";

import { useId } from "react";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/lib/course/types";

export function SelfExplanation({
  question,
  value,
  onChange,
  dark = false,
  mode = "correction",
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
  mode?: "correction" | "reasoning";
}) {
  const id = useId();
  const reasoning = mode === "reasoning";
  return (
    <Field className={`self-explanation${dark ? " is-dark" : ""}`}>
      <FieldLabel htmlFor={id}>
        {reasoning
          ? "次へ進む前に、使った判断基準を1文で説明する"
          : "次へ進む前に、考え方の違いを1文で説明する"}
      </FieldLabel>
      <FieldDescription>
        {reasoning
          ? "「まず ___ を確認し、その結果から ___ と判断した」の形で、答えではなく理由を書きます。"
          : "「最初は ___ と思った。実際は ___ の順で動く」の形で、答えではなく理由を書きます。"}
      </FieldDescription>
      <Textarea
        id={id}
        name={`self-explanation-${question.id}`}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={
          reasoning
            ? "まず入力値と実行順を確認し、その結果からこの方法が必要だと判断した…"
            : "最初は同時に動くと思った。実際は右側を計算してから左側を更新する…"
        }
      />
      {value.trim().length < 10 ? (
        <small>
          {reasoning
            ? "10文字以上で判断理由を記録できます。"
            : "10文字以上書くと「あとで解き直す」を選べます。"}
        </small>
      ) : (
        <small>説明を記録できます。</small>
      )}
    </Field>
  );
}
