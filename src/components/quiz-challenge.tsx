"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ConfidenceDialog,
  ConfidenceScale,
} from "@/components/confidence-scale";
import { IconCopy, IconReset } from "@/components/icons";
import { SelfExplanation } from "@/components/self-explanation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import type { Question } from "@/lib/course/types";
import { exerciseSceneLabel } from "@/lib/course/client-dtos";

export type QuizChallengeProps = {
  question: Question;
  index: number;
  total: number;
  correctCount: number;
  choice: string | null;
  typed: string;
  checked: boolean;
  isCorrect: boolean;
  failReason: string | null;
  onChoice: (value: string) => void;
  onTyped: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDismissFail: () => void;
  onNext: () => void;
  nextLabel?: string;
  onHintUsed?: (level: number) => void;
  confidence: number | null;
  onConfidence: (value: number) => void;
  attempted: boolean;
  reflection: string;
  onReflection: (value: string) => void;
  assistant?: ReactNode;
};

export function QuizChallenge({
  question,
  index,
  total,
  correctCount,
  choice,
  typed,
  checked,
  failReason,
  onChoice,
  onTyped,
  onSubmit,
  onDismissFail,
  onNext,
  nextLabel = "次のスライド",
  onHintUsed,
  confidence,
  onConfidence,
  attempted,
  reflection,
  onReflection,
  assistant,
}: QuizChallengeProps) {
  const inputId = useId();
  const explainId = useId();
  const hintId = useId();
  const explainRef = useRef<HTMLParagraphElement>(null);
  const submittingRef = useRef(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFragmentIndexes, setSelectedFragmentIndexes] = useState<number[]>([]);
  const requiresExplanation = question.exerciseKind === "transfer";
  const hints = question.hints?.length ? question.hints : question.hint ? [question.hint] : [];
  const canSubmit =
    !checked &&
    !isSubmitting &&
    (question.kind === "choice"
      ? Boolean(choice)
      : question.kind === "order"
        ? selectedFragmentIndexes.length === (question.fragments?.length ?? 0)
        : typed.trim() !== "");

  async function submitAnswer() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function requestSubmit() {
    if (!canSubmit) return;
    if (confidence === null) {
      setConfidenceOpen(true);
      return;
    }
    void submitAnswer();
  }

  function selectFragment(fragmentIndex: number) {
    if (selectedFragmentIndexes.includes(fragmentIndex)) return;
    const next = [...selectedFragmentIndexes, fragmentIndex];
    setSelectedFragmentIndexes(next);
    onTyped(
      next
        .map((index) => question.fragments?.[index] ?? "")
        .join("\n"),
    );
  }

  useEffect(() => {
    if (checked) explainRef.current?.focus();
  }, [checked]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-0 flex-1 flex-col bg-paper"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10">
        <p className="font-mono text-xs tracking-[0.16em] text-mute">
          問題 {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
        </p>
        {question.scenario ? (
          <p className="mt-3 max-w-2xl border-l-2 border-studio pl-3 text-sm leading-6 text-mute">
            {exerciseSceneLabel(question)}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-2xl font-serif text-3xl font-medium leading-snug">
          {question.prompt.replaceAll(
            "starter",
            "最初から入っているコード",
          )}
        </h1>
        {question.lead ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink">
            {question.lead.replaceAll(
              "starter",
              "最初から入っているコード",
            )}
          </p>
        ) : null}
        {question.code ? <Snippet code={question.code} /> : null}

        {question.kind === "choice" && question.options ? (
          <RadioGroup
            className="mt-8 max-w-xl"
            value={choice ?? ""}
            onValueChange={onChoice}
            disabled={checked}
            aria-label="回答の選択肢"
          >
            {question.options.map((option, optionIndex) => {
              const selected = choice === option;
              const mark = String.fromCharCode(65 + optionIndex);
              const correctOption = checked && option === question.answer;
              const incorrectOption = Boolean(failReason && selected);
              return (
                <FieldLabel
                  key={option}
                  className="quiz-choice-field"
                  data-correct={correctOption || undefined}
                  data-incorrect={incorrectOption || undefined}
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id={`${inputId}-${optionIndex}`}
                      value={option}
                    />
                    <span className="quiz-choice-mark">{mark}</span>
                    <FieldContent>
                      <FieldTitle>{option}</FieldTitle>
                    </FieldContent>
                    {selected && !checked ? (
                      <small className="quiz-choice-selected">選択中</small>
                    ) : null}
                  </Field>
                </FieldLabel>
              );
            })}
          </RadioGroup>
        ) : null}

        {question.kind === "order" && question.fragments ? (
          <section className="order-exercise" aria-label="コード断片の並べ替え">
            <div>
              <p>使えるコード断片</p>
              {question.fragments.map((fragment, fragmentIndex) => (
                <button
                  key={`${fragmentIndex}-${fragment}`}
                  type="button"
                  disabled={checked || selectedFragmentIndexes.includes(fragmentIndex)}
                  onClick={() => selectFragment(fragmentIndex)}
                >
                  <code>{fragment}</code>
                </button>
              ))}
            </div>
            <div>
              <p>現在の実行順</p>
              {selectedFragmentIndexes.length > 0 ? (
                <ol>
                  {selectedFragmentIndexes.map((fragmentIndex) => (
                    <li key={fragmentIndex}>
                      <span>{selectedFragmentIndexes.indexOf(fragmentIndex) + 1}</span>
                      <code>{question.fragments?.[fragmentIndex]}</code>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>左の断片を、最初に実行するものから選びます。</p>
              )}
              {!checked && selectedFragmentIndexes.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFragmentIndexes([]);
                    onTyped("");
                  }}
                >
                  並べ直す
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {question.kind === "input" ? (
          <Field className="mt-8 max-w-xl">
            <FieldLabel htmlFor={inputId}>答え</FieldLabel>
            <Input
              id={inputId}
              name="quiz-answer"
              autoComplete="off"
              value={typed}
              onChange={(event) => onTyped(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") requestSubmit();
              }}
              disabled={checked}
              aria-describedby={checked ? explainId : undefined}
              className="font-mono"
            />
          </Field>
        ) : null}

        {question.kind === "code" ? (
          <CodeEditor
            id={inputId}
            fileName={question.fileName ?? "script.js"}
            value={typed}
            disabled={checked}
            describedBy={checked ? explainId : undefined}
            onChange={onTyped}
            onReset={() => onTyped(question.starter ?? "")}
          />
        ) : null}

        {attempted ? (
        <div className="mt-6 max-w-xl">
          <ConfidenceScale
            value={confidence}
            onChange={onConfidence}
            disabled
            result={checked}
          />
        </div>
        ) : null}

        {hints.length > 0 ? (
          <Collapsible open={hintLevel > 0} className="mt-6 max-w-xl">
            <Button
              variant="secondary"
              className="border border-[#73bfb1] bg-[#d5f0ea] text-[#075f56] hover:border-[#4fa897] hover:bg-[#c2e8df] hover:text-[#054d46]"
              aria-expanded={hintLevel > 0}
              aria-controls={hintId}
              onClick={() => {
                const next = Math.min(hintLevel + 1, hints.length);
                setHintLevel(next);
                onHintUsed?.(next);
              }}
            >
              {hintLevel === 0
                ? "ヒントを1段だけ見る"
                : hintLevel < hints.length
                  ? "次のヒントを見る"
                  : "ヒントを確認済み"}
            </Button>
            <CollapsibleContent id={hintId}>
              <Alert className="mt-2" role="status">
                <AlertTitle>ヒント {hintLevel}/{hints.length}</AlertTitle>
                <AlertDescription>
                  <ol className="flex flex-col gap-2">
                    {hints.slice(0, hintLevel).map((hint, index) => (
                      <li key={hint}>
                        <span className="mr-2 font-mono">{index + 1}.</span>
                        {hint.replaceAll(
                          "starter",
                          "最初から入っているコード",
                        )}
                      </li>
                    ))}
                  </ol>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        {checked ? (
          <p
            ref={explainRef}
            id={explainId}
            role="status"
            tabIndex={-1}
            className="mt-6 max-w-xl text-sm leading-6 text-ok"
          >
            正解。 {question.explain}
          </p>
        ) : null}
        {failReason ? (
          <Alert variant="destructive" className="mt-5 max-w-xl">
            <AlertTitle>まだ一致していません</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>
                {choice && question.feedbackByAnswer?.[choice]
                  ? question.feedbackByAnswer[choice]
                  : failReason}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={onDismissFail}
              >
                閉じる
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        {failReason || (checked && requiresExplanation) ? (
          <div className="mt-5 max-w-xl">
            <SelfExplanation
              question={question}
              value={reflection}
              onChange={onReflection}
              mode={checked ? "reasoning" : "correction"}
            />
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-10">
        <div className="flex flex-wrap items-center gap-3">
          {assistant}
          <p className="text-sm text-mute">
            ここまでの正解 {correctCount} / {total}
          </p>
        </div>
        {checked ? (
          <Button
            onClick={onNext}
            disabled={requiresExplanation && reflection.trim().length < 10}
          >
            {nextLabel}
          </Button>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {failReason ? (
              <Button
                variant="outline"
                onClick={onNext}
                disabled={reflection.trim().length < 10}
              >
                あとで解き直す
              </Button>
            ) : null}
            <Button onClick={requestSubmit} disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  採点中…
                </>
              ) : failReason ? (
                "もう一度確かめる"
              ) : question.kind === "code" ? (
                "できた！"
              ) : (
                "解答する"
              )}
            </Button>
          </div>
        )}
      </footer>
      <ConfidenceDialog
        open={confidenceOpen}
        value={confidence}
        onChange={onConfidence}
        onCancel={() => setConfidenceOpen(false)}
        onConfirm={() => {
          setConfidenceOpen(false);
          void submitAnswer();
        }}
      />
    </main>
  );
}

function Snippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="quiz-code mt-6 max-w-2xl">
      <Button
        variant="ghost"
        size="icon"
        className="quiz-copy text-paper hover:bg-white/10"
        aria-label={copied ? "コピーしました" : "コードをコピー"}
        onClick={() => void copy()}
      >
        <IconCopy aria-hidden="true" />
      </Button>
      <pre>{code}</pre>
      <span className="sr-only" aria-live="polite">
        {copied ? "コピーしました" : ""}
      </span>
    </div>
  );
}

function CodeEditor({
  id,
  fileName,
  value,
  disabled,
  describedBy,
  onChange,
  onReset,
}: {
  id: string;
  fileName: string;
  value: string;
  disabled: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  const lines = Math.max(value.split("\n").length, 8);
  return (
    <div className="mt-6 max-w-3xl overflow-hidden bg-editor text-paper">
      <div className="flex h-11 items-center justify-between border-b border-white/10 px-3">
        <span className="bg-white/10 px-3 py-1 font-mono text-xs">{fileName}</span>
        <Button
          variant="ghost"
          className="text-paper hover:bg-white/10"
          aria-label="エディタをリセット"
          disabled={disabled}
          onClick={onReset}
        >
          <IconReset aria-hidden="true" />
          リセット
        </Button>
      </div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          コード
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 pt-3 text-right font-mono text-sm leading-7 text-white/35">
          {Array.from({ length: lines }, (_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <textarea
          id={id}
          name="code-answer"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          disabled={disabled}
          aria-describedby={describedBy}
          className="min-h-[16rem] w-full resize-y bg-transparent py-3 pr-4 pl-12 font-mono text-sm leading-7 text-paper"
        />
      </div>
    </div>
  );
}
