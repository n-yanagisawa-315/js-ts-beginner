"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnswerDialog } from "@/components/answer-dialog";
import { CopyableText } from "@/components/copyable-text";
import { ConfidenceScale } from "@/components/confidence-scale";
import { GradeToast } from "@/components/grade-toast";
import { HighlightEditor } from "@/components/highlight-editor";
import { IconEye, IconFile, IconPlay, IconReset } from "@/components/icons";
import { SelfExplanation } from "@/components/self-explanation";
import {
  NodeTermChrome,
  NodeTermInput,
  NodeTermLines,
  NodeTermPrompt,
} from "@/components/node-terminal";
import { gradeShell, mismatchLines } from "@/lib/grade";
import { runStudentJs, syntaxLine } from "@/lib/run-js";
import type { Question, TermLine, Track } from "@/lib/course";

export function CodeLab(props: {
  track: Track;
  question: Question;
  index: number;
  total: number;
  correctCount: number;
  typed: string;
  checked: boolean;
  failReason: string | null;
  failTick: number;
  onTyped: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDismissFail: () => void;
  onNext: () => void;
  nextLabel?: string;
  onOpenSlide?: (trigger: HTMLButtonElement) => void;
  onHintUsed?: (level: number) => void;
  onAnswerViewed?: () => void;
  confidence: number | null;
  onConfidence: (value: number) => void;
  attempted: boolean;
  reflection: string;
  onReflection: (value: string) => void;
}) {
  return <CodeLabInner key={props.question.id} {...props} />;
}

function CodeLabInner({
  track,
  question,
  index,
  total,
  correctCount,
  typed,
  checked,
  failReason,
  failTick,
  onTyped,
  onSubmit,
  onDismissFail,
  onNext,
  nextLabel = "次の問題",
  onOpenSlide,
  onHintUsed,
  onAnswerViewed,
  confidence,
  onConfidence,
  attempted,
  reflection,
  onReflection,
}: {
  track: Track;
  question: Question;
  index: number;
  total: number;
  correctCount: number;
  typed: string;
  checked: boolean;
  failReason: string | null;
  failTick: number;
  onTyped: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDismissFail: () => void;
  onNext: () => void;
  nextLabel?: string;
  onOpenSlide?: (trigger: HTMLButtonElement) => void;
  onHintUsed?: (level: number) => void;
  onAnswerViewed?: () => void;
  confidence: number | null;
  onConfidence: (value: number) => void;
  attempted: boolean;
  reflection: string;
  onReflection: (value: string) => void;
}) {
  const editorId = useId();
  const explainId = useId();
  const explainRef = useRef<HTMLParagraphElement>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [termTab, setTermTab] = useState<1 | 2>(1);
  const [pane, setPane] = useState<"file" | "term">("file");
  const [shellLog, setShellLog] = useState<TermLine[]>([]);
  const [typeErrors, setTypeErrors] = useState<string[]>([]);
  const fileName = question.fileName ?? (track === "ts" ? "script.ts" : "script.js");
  const isNode = track === "node";
  const isShell = question.kind === "shell";
  const cwd = question.cwd ?? "app";
  const canRun = track !== "ts";
  const canSubmit = !checked && typed.trim() !== "" && confidence !== null;
  const requiresExplanation = question.exerciseKind === "transfer";
  const hints = question.hints?.length
    ? question.hints
    : question.hint
      ? [question.hint]
      : [];
  const errorLines = useMemo(() => {
    if (!failReason || isShell) return [];
    const lines = mismatchLines(typed, question.answer);
    if (!canRun) return lines;
    const syntax = syntaxLine(typed);
    if (syntax) lines.push(syntax - 1);
    return [...new Set(lines)];
  }, [canRun, failReason, isShell, question.answer, typed]);

  useEffect(() => {
    if (checked) explainRef.current?.focus();
  }, [checked]);

  async function runJs() {
    if (!canRun) {
      setLogs([]);
      setRunError("TypeScript の問題は提出で採点します。右の見本は期待する表示です。");
      return;
    }
    const result = await runStudentJs(typed);
    setLogs(result.logs);
    setRunError(result.error ?? null);
  }

  function replayShell(command: string) {
    const ok = gradeShell(question, command);
    const next: TermLine[] = [
      ...shellLog,
      { text: `${cwd} $ ${command}`, tone: "meta" },
    ];
    if (ok) {
      next.push(...(question.termOutput ?? []));
    } else if (command.trim()) {
      const name = command.trim().split(/\s+/)[0] ?? command;
      next.push({
        text: `${name}: command not found`,
        tone: "err",
      });
    }
    setShellLog(next);
  }

  async function run() {
    if (isShell) {
      replayShell(typed);
      return;
    }
    await runJs();
    if (isNode) setPane("term");
  }

  async function submit() {
    if (!typed.trim()) return;
    if (track === "ts" && typeErrors.length > 0) {
      setRunError(`TypeScript: ${typeErrors[0]}`);
      return;
    }
    await run();
    await onSubmit();
  }

  const toolbar = (
    <LabToolbar
      checked={checked}
      canSubmit={canSubmit}
      canAdvance={Boolean(failReason) && reflection.trim().length >= 10}
      canFinish={!requiresExplanation || reflection.trim().length >= 10}
      correctCount={correctCount}
      total={total}
      nextLabel={nextLabel}
      onReset={() => {
        onTyped(question.starter ?? "");
        setLogs([]);
        setRunError(null);
        setShellLog([]);
        setTypeErrors([]);
        setPane("file");
      }}
      onAnswer={() => {
        setAnswerOpen(true);
        onAnswerViewed?.();
      }}
      onNext={onNext}
      onSubmit={submit}
    />
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#10141c] text-[var(--cream)]">
      <div className={`lab-grid min-h-0 flex-1${isNode ? " is-node" : ""}`}>
        <aside className="flex min-h-0 flex-col overflow-y-auto border-b border-line bg-desk text-ink lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="btn btn-ghost min-h-11 px-3 text-sm text-mute hover:text-ink"
            >
              講座一覧
            </Link>
            <p className="font-mono text-xs tracking-widest text-mute">
              {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
            </p>
          </div>
          <header className="px-5 pb-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-studio">
              演習
            </p>
            <h1 className="mt-2 font-serif text-xl font-medium leading-8">
              <CopyableText text={question.prompt} />
            </h1>
          </header>
          <QuestionGuide
            question={question}
            track={track}
            fileName={fileName}
            isShell={isShell}
          />
          <div className="px-4 pb-4">
            <ConfidenceScale
              value={confidence}
              onChange={onConfidence}
              tone="light"
              disabled={attempted}
              result={attempted ? checked : null}
            />
          </div>
          {failReason || (checked && requiresExplanation) ? (
            <div className="px-4 pb-4">
              <SelfExplanation
                question={question}
                value={reflection}
                onChange={onReflection}
                mode={checked ? "reasoning" : "correction"}
              />
            </div>
          ) : null}
          <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
            {hints.length > 0 ? (
              <button
                type="button"
                className="btn btn-hint w-full"
                aria-expanded={hintLevel > 0}
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
            ) : null}
            {hintLevel > 0 ? (
              <ol className="space-y-2 bg-paper px-3 py-2 text-sm leading-6 text-mute">
                {hints.slice(0, hintLevel).map((hint, index) => (
                  <li key={hint}>
                    <span className="mr-2 font-mono">{index + 1}.</span>
                    <CopyableText text={hint} />
                  </li>
                ))}
              </ol>
            ) : null}
            {onOpenSlide ? (
              <button
                type="button"
                className="btn btn-studio w-full"
                onClick={(event) => onOpenSlide(event.currentTarget)}
              >
                スライドで確認
              </button>
            ) : null}
          </div>
        </aside>

        {isNode && isShell ? (
          <NodeTermChrome
            active={termTab}
            onSelect={setTermTab}
            footer={
              <>
                {checked ? (
                  <p
                    ref={explainRef}
                    id={explainId}
                    role="status"
                    tabIndex={-1}
                    className="editor-note"
                  >
                    正解。 {question.explain}
                  </p>
                ) : null}
                {toolbar}
                {failReason ? (
                  <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
                ) : null}
              </>
            }
          >
            {termTab === 1 ? (
              <>
                <NodeTermLines lines={shellLog} />
                {checked && question.termAlive ? null : checked ? (
                  <p className="node-term-row">
                    <NodeTermPrompt cwd={cwd} />
                    <span className="term-cursor" aria-hidden="true" />
                  </p>
                ) : (
                  <NodeTermInput
                    cwd={cwd}
                    value={typed}
                    disabled={checked}
                    onChange={onTyped}
                    onSubmit={submit}
                  />
                )}
              </>
            ) : (
              <p className="node-term-row">
                <NodeTermPrompt cwd={cwd} />
                <span className="term-cursor" aria-hidden="true" />
              </p>
            )}
          </NodeTermChrome>
        ) : isNode ? (
          <section className="editor-shell is-term">
            <div className="node-term-tabs">
              <button
                type="button"
                className={`node-term-tab${pane === "file" ? " is-on" : ""}`}
                onClick={() => setPane("file")}
              >
                <IconFile className="h-3.5 w-3.5" />
                {fileName}
              </button>
              <button
                type="button"
                className={`node-term-tab${pane === "term" ? " is-on" : ""}`}
                onClick={() => setPane("term")}
              >
                <span className="node-term-glyph" aria-hidden="true">
                  &gt;_
                </span>
                ターミナル
              </button>
            </div>
            {pane === "file" ? (
              <HighlightEditor
                id={editorId}
                value={typed}
                language="javascript"
                disabled={checked}
                describedBy={checked ? explainId : undefined}
                errorLines={errorLines}
                onChange={onTyped}
                onValidate={setTypeErrors}
              />
            ) : (
              <div className="node-term-body">
                {logs.length > 0 || runError ? (
                  <>
                    <p className="node-term-line is-meta">
                      {cwd} $ node {fileName}
                    </p>
                    {runError ? (
                      <p className="node-term-line is-err">{runError}</p>
                    ) : (
                      logs.map((line, lineIndex) => (
                        <p key={`${lineIndex}-${line}`} className="node-term-line is-out">
                          {line || "\u00a0"}
                        </p>
                      ))
                    )}
                    <p className="node-term-row">
                      <NodeTermPrompt cwd={cwd} />
                      <span className="term-cursor" aria-hidden="true" />
                    </p>
                  </>
                ) : (
                  <p className="node-term-row">
                    <NodeTermPrompt cwd={cwd} />
                    <span className="term-cursor" aria-hidden="true" />
                  </p>
                )}
              </div>
            )}
            {checked ? (
              <p
                ref={explainRef}
                id={explainId}
                role="status"
                tabIndex={-1}
                className="editor-note"
              >
                正解。 {question.explain}
              </p>
            ) : null}
            {toolbar}
            {failReason ? (
              <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
            ) : null}
          </section>
        ) : (
          <>
            <section className="editor-shell">
              <div className="editor-tabbar">
                <span className="editor-tab">
                  <IconFile className="h-3.5 w-3.5" />
                  {fileName}
                </span>
              </div>
              <HighlightEditor
                id={editorId}
                value={typed}
                language={track === "ts" ? "typescript" : "javascript"}
                disabled={checked}
                describedBy={checked ? explainId : undefined}
                errorLines={errorLines}
                onChange={onTyped}
                onValidate={setTypeErrors}
              />
              {checked ? (
                <p
                  ref={explainRef}
                  id={explainId}
                  role="status"
                  tabIndex={-1}
                  className="editor-note"
                >
                  正解。 {question.explain}
                </p>
              ) : null}
              {toolbar}
              {failReason ? (
                <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
              ) : null}
            </section>
            <aside className="console-stack min-h-[16rem] border-t border-[#c5c9d0] lg:border-t-0 lg:border-l">
              <OutputPane title="コンソール" onPlay={run}>
                {runError ? (
                  <p className="text-[#fca5a5]">{runError}</p>
                ) : logs.length > 0 ? (
                  logs.map((line, lineIndex) => (
                    <p key={`${lineIndex}-${line}`}>{line}</p>
                  ))
                ) : (
                  <p className="text-white/35">実行結果がここに出ます</p>
                )}
              </OutputPane>
              <OutputPane title="見本">
                <pre className="whitespace-pre-wrap">
                  {question.sample ?? "（この問題の見本はありません）"}
                </pre>
              </OutputPane>
            </aside>
          </>
        )}
      </div>
      <AnswerDialog
        open={answerOpen}
        fileName={isShell ? `${cwd} $` : fileName}
        code={question.answer}
        mine={typed}
        language={track === "ts" ? "typescript" : "javascript"}
        terminal={isNode}
        shell={isShell}
        cwd={cwd}
        termOutput={question.termOutput}
        termAlive={question.termAlive}
        onClose={() => setAnswerOpen(false)}
      />
    </div>
  );
}

function QuestionGuide({
  question,
  track,
  fileName,
  isShell,
}: {
  question: Question;
  track: Track;
  fileName: string;
  isShell: boolean;
}) {
  const allSteps = question.steps ?? [];
  const steps =
    question.scaffoldLevel === "independent"
      ? []
      : question.scaffoldLevel === "faded"
        ? allSteps.slice(0, 1)
        : allSteps;
  const result =
    question.sample?.trim()
      ? question.sample
      : track === "ts"
        ? "型エラーなしでチェックを通過"
        : isShell
          ? "指定されたコマンドが実行される"
          : "指定された処理が完成する";

  return (
    <section className="question-guide" aria-label="問題の進め方">
      <p className="question-guide-label">
        {question.exerciseKind === "transfer"
          ? "別の場面へ応用"
          : question.scaffoldLevel === "worked"
            ? "完成例を追って理解する"
          : question.scaffoldLevel === "independent"
            ? "手順なしで思い出す"
            : question.scaffoldLevel === "faded"
              ? "最初の一歩だけ案内"
              : "手順を見ながら練習"}
      </p>
      {question.lead ? (
        <div className="question-guide-block">
          <p className="question-guide-label">イメージ</p>
          <p className="question-guide-copy">
            <CopyableText text={question.lead} />
          </p>
        </div>
      ) : null}

      <div className="question-goal">
        <div>
          <p className="question-guide-label">完成すると</p>
          <pre>{result}</pre>
        </div>
        <p className="question-material">
          <span>{isShell ? "入力場所" : "用意済み"}</span>
          <strong>{isShell ? "ターミナル" : fileName}</strong>
          {question.starter ? <small>書き始めるコードあり</small> : null}
        </p>
      </div>

      {steps.length > 0 ? (
        <div className="question-guide-block">
          <p className="question-guide-label">進め方</p>
          <ol className="question-steps">
            {steps.map((step, stepIndex) => (
              <li key={step}>
                <span>{stepIndex + 1}</span>
                <p>
                  <CopyableText text={step} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function LabToolbar({
  checked,
  canSubmit,
  canAdvance,
  canFinish,
  correctCount,
  total,
  nextLabel,
  onReset,
  onAnswer,
  onNext,
  onSubmit,
}: {
  checked: boolean;
  canSubmit: boolean;
  canAdvance: boolean;
  canFinish: boolean;
  correctCount: number;
  total: number;
  nextLabel: string;
  onReset: () => void;
  onAnswer: () => void;
  onNext: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <div className="editor-toolbar">
      <button type="button" className="editor-tool" disabled={checked} onClick={onReset}>
        <IconReset className="h-4 w-4" />
        リセット
      </button>
      <button type="button" className="editor-tool" disabled={checked} onClick={onAnswer}>
        <IconEye className="h-4 w-4" />
        答えを見る
      </button>
      <span className="editor-score">
        正解 {correctCount} / {total}
      </span>
      {checked ? (
        <button
          type="button"
          className="btn btn-go"
          disabled={!canFinish}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canAdvance ? (
            <button type="button" className="btn btn-line" onClick={onNext}>
              あとで解き直す
            </button>
          ) : null}
          <button type="button" className="btn btn-go" disabled={!canSubmit} onClick={onSubmit}>
            {canAdvance ? "もう一度確かめる" : "できた！"}
          </button>
        </div>
      )}
    </div>
  );
}

function FailDock({
  tick,
  message,
  onClose,
}: {
  tick: number;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[3.75rem] z-20 px-3 pb-2">
      <div className="pointer-events-auto mx-auto max-w-xl">
        <GradeToast key={tick} message={message} tone="dark" onClose={onClose} />
      </div>
    </div>
  );
}

function OutputPane({
  title,
  onPlay,
  children,
}: {
  title: string;
  onPlay?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="console-window">
      <header className="console-window-bar">
        <p className="console-window-title">
          <span className="console-window-prompt" aria-hidden="true">
            &gt;<span className="console-window-prompt-cursor">_</span>
          </span>
          {title}
        </p>
        {onPlay ? (
          <button
            type="button"
            className="console-window-play"
            aria-label="実行"
            onClick={onPlay}
          >
            <IconPlay className="h-3 w-3" />
          </button>
        ) : (
          <span className="console-window-play" aria-hidden="true">
            <IconPlay className="h-3 w-3" />
          </span>
        )}
      </header>
      <div className="console-window-body">{children}</div>
    </section>
  );
}
