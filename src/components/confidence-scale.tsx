"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

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
    <fieldset className={`confidence-scale is-${tone}`}>
      <legend>答える前の自信は？</legend>
      <p>
        {disabled
          ? "回答前に選んだ値です。成績には影響しません。"
          : "今の感覚に一番近いものを選びます。成績には影響しません。"}
      </p>
      <ToggleGroup
        type="single"
        value={value === null ? "" : String(value)}
        onValueChange={(next) => {
          if (next) onChange(Number(next));
        }}
        disabled={disabled}
        aria-label="答える前の自信"
        className="confidence-options"
      >
        {LEVELS.map((level) => (
          <ToggleGroupItem key={level.value} value={String(level.value)}>
            <span>{level.label}</span>
            <small>{level.value}%</small>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {feedback && value !== null && result !== null ? (
        <p className="confidence-feedback" role="status">
          自信 {value}% ／ 結果 {result ? "正解" : "不正解"}。{feedback}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ConfidenceDialog({
  open,
  value,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  value: number | null;
  onChange: (value: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent
        className="confidence-dialog"
        onOpenAutoFocus={() => {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogHeader>
          <p className="confidence-dialog-step">解答する前の確認</p>
          <DialogTitle>今の自信はどのくらい？</DialogTitle>
          <DialogDescription>
            正解を見た後ではなく、今の感覚を残します。成績には影響しません。
          </DialogDescription>
        </DialogHeader>
        <ConfidenceScale value={value} onChange={onChange} />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            戻る
          </Button>
          <Button disabled={value === null} onClick={onConfirm}>
            この自信で解答する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
