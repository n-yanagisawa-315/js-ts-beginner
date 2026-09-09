"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CopyableText } from "@/components/copyable-text";
import { ConfidenceScale } from "@/components/confidence-scale";
import { GradeToast } from "@/components/grade-toast";
import { IconCopy, IconReset } from "@/components/icons";
import { SelfExplanation } from "@/components/self-explanation";
import type { Question } from "@/lib/course";

export function QuizChallenge({
  question,
  index,
  total,
  correctCount,
  choice,
  typed,
  checked,
  failReason,
  failTick,
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
}: {
  question: Question;
  index: number;
  total: number;
  correctCount: number;
  choice: string | null;
  typed: string;
  checked: boolean;
  isCorrect: boolean;
  failReason: string | null;
  failTick: number;
  onChoice: (value: string) => void;
  onTyped: (value: string) => void;
  onSubmit: () => void;
  onDismissFail: () => void;
  onNext: () => void;
  nextLabel?: string;
  onHintUsed?: (level: number) => void;
  confidence: number | null;
  onConfidence: (value: number) => void;
  attempted: boolean;
  reflection: string;
  onReflection: (value: string) => void;
}) {
  const inputId = useId();
  const explainId = useId();
  const hintId = useId();
  const explainRef = useRef<HTMLParagraphElement>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [selectedFragmentIndexes, setSelectedFragmentIndexes] = useState<number[]>([]);
  const requiresExplanation = question.exerciseKind === "transfer";
  const hints = question.hints?.length ? question.hints : question.hint ? [question.hint] : [];
  const canSubmit =
    !checked &&
    confidence !== null &&
    (question.kind === "choice"
      ? Boolean(choice)
      : question.kind === "order"
        ? selectedFragmentIndexes.length === (question.fragments?.length ?? 0)
        : typed.trim() !== "");

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
    <article className="relative flex min-h-0 flex-1 flex-col bg-paper">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10">
        <p className="font-mono text-xs tracking-[0.16em] text-mute">
          問題 {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
        </p>
        {question.scenario ? (
          <p className="mt-3 max-w-2xl border-l-2 border-studio pl-3 text-sm leading-6 text-mute">
            {question.exerciseKind === "transfer"
              ? "応用課題: "
              : question.exerciseKind === "worked"
                ? "完成例の確認: "
                : "今回の場面: "}
            {question.scenario}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-2xl font-serif text-3xl font-medium leading-snug">
          <CopyableText text={question.prompt} />
        </h1>
        {question.lead ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink">
            <CopyableText text={question.lead} />
          </p>
        ) : null}
        {question.code ? <Snippet code={question.code} /> : null}

        {question.kind === "choice" && question.options ? (
          <ul className="mt-8 flex max-w-xl flex-col gap-2">
            {question.options.map((option, optionIndex) => {
              const selected = choice === option;
              const mark = String.fromCharCode(65 + optionIndex);
              let border = "border-line";
              if (checked && option === question.answer) border = "border-ok";
              else if (failReason && selected) border = "border-ng";
              else if (selected) border = "border-ink";
              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={checked}
                    aria-pressed={selected}
                    onClick={() => onChoice(option)}
                    className={`neo-card flex min-h-11 w-full items-start gap-3 px-4 py-3 text-left transition-transform duration-200 ${border} ${
                      checked ? "" : "hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="mt-0.5 w-6 shrink-0 font-mono text-sm text-mute">
                      {mark}
                    </span>
                    <span>{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>
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
                <button
                  type="button"
                  className="btn btn-line"
                  onClick={() => {
                    setSelectedFragmentIndexes([]);
                    onTyped("");
                  }}
                >
                  並べ直す
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {question.kind === "input" ? (
          <div className="mt-8 max-w-xl">
            <label htmlFor={inputId} className="block text-sm text-mute">
              答え
            </label>
            <input
              id={inputId}
              value={typed}
              onChange={(event) => onTyped(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSubmit();
              }}
              disabled={checked}
              aria-describedby={checked ? explainId : undefined}
              className="mt-2 w-full border-b-2 border-ink bg-transparent py-2 font-mono"
            />
          </div>
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

        <div className="mt-6 max-w-xl">
          <ConfidenceScale
            value={confidence}
            onChange={onConfidence}
            disabled={attempted}
            result={attempted ? checked : null}
          />
        </div>

        {hints.length > 0 ? (
          <div className="mt-6 max-w-xl">
            <button
              type="button"
              className="btn btn-hint"
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
            </button>
            {hintLevel > 0 ? (
              <ol id={hintId} className="mt-2 space-y-2 px-3 py-2 text-sm leading-6 text-mute">
                {hints.slice(0, hintLevel).map((hint, index) => (
                  <li key={hint}>
                    <span className="mr-2 font-mono">{index + 1}.</span>
                    <CopyableText text={hint} />
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
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
        {failReason && choice && question.feedbackByAnswer?.[choice] ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-ng">
            {question.feedbackByAnswer[choice]}
          </p>
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

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-10">
        <p className="text-sm text-mute">
          ここまでの正解 {correctCount} / {total}
        </p>
        {checked ? (
          <button
            type="button"
            onClick={onNext}
            disabled={requiresExplanation && reflection.trim().length < 10}
            className="btn btn-primary disabled:bg-line disabled:text-mute"
          >
            {nextLabel}
          </button>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {failReason ? (
              <button
                type="button"
                onClick={onNext}
                disabled={reflection.trim().length < 10}
                className="btn btn-line disabled:opacity-40"
              >
                あとで解き直す
              </button>
            ) : null}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={`${
                question.kind === "code" ? "btn btn-ok" : "btn btn-primary"
              } disabled:bg-line disabled:text-mute`}
            >
              {failReason ? "もう一度確かめる" : question.kind === "code" ? "できた！" : "解答する"}
            </button>
          </div>
        )}
      </div>
      {failReason ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-20 px-5 pb-2 sm:px-10">
          <div className="pointer-events-auto mx-auto max-w-xl">
            <GradeToast
              key={failTick}
              message={failReason}
              tone="light"
              onClose={onDismissFail}
            />
          </div>
        </div>
      ) : null}
    </article>
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
      <button
        type="button"
        className="quiz-copy btn btn-ghost h-11 w-11 min-h-11 p-0 text-paper hover:bg-white/10"
        aria-label={copied ? "コピーしました" : "コードをコピー"}
        onClick={() => void copy()}
      >
        <IconCopy className="h-4 w-4" />
      </button>
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
        <button
          type="button"
          className="btn btn-ghost h-11 min-h-11 px-3 text-sm text-paper hover:bg-white/10"
          aria-label="エディタをリセット"
          disabled={disabled}
          onClick={onReset}
        >
          <IconReset className="h-4 w-4" />
          リセット
        </button>
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
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          disabled={disabled}
          aria-describedby={describedBy}
          spellCheck={false}
          className="min-h-[16rem] w-full resize-y bg-transparent py-3 pr-4 pl-12 font-mono text-sm leading-7 text-paper"
        />
      </div>
    </div>
  );
}
