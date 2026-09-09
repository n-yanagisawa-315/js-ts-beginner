"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnswerDialog } from "@/components/answer-dialog";
import { CopyableText } from "@/components/copyable-text";
import {
  ConfidenceDialog,
  ConfidenceScale,
} from "@/components/confidence-scale";
import { HighlightEditor } from "@/components/highlight-editor";
import { GitTerminal } from "@/components/git-terminal";
import { IconEye, IconFile, IconPlay, IconReset } from "@/components/icons";
import { OrderProjectPreview } from "@/components/order-project-preview";
import { SqlConsole } from "@/components/sql-console";
import { SelfExplanation } from "@/components/self-explanation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  NodeTermChrome,
  NodeTermInput,
  NodeTermLines,
  NodeTermPrompt,
} from "@/components/node-terminal";
import { gradeShell, mismatchLines } from "@/lib/grade";
import { createDomDocument, runDomQuestion } from "@/lib/run-dom";
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
  onSubmit: (correctOverride?: boolean) => void | Promise<void>;
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
  assistant?: ReactNode;
  projectPreview?: boolean;
}) {
  return (
    <CodeLabInner
      key={`${props.question.id}-${props.question.variantId ?? "base"}`}
      {...props}
    />
  );
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
  assistant,
  projectPreview = false,
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
  onSubmit: (correctOverride?: boolean) => void | Promise<void>;
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
  assistant?: ReactNode;
  projectPreview?: boolean;
}) {
  const editorId = useId();
  const explainId = useId();
  const explainRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLElement>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [termTab, setTermTab] = useState<1 | 2>(1);
  const [pane, setPane] = useState<"file" | "term">("file");
  const [shellLog, setShellLog] = useState<TermLine[]>([]);
  const [typeErrors, setTypeErrors] = useState<string[]>([]);
  const [typeValidationReady, setTypeValidationReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalRevision, setTerminalRevision] = useState(0);
  const [domDocument, setDomDocument] = useState(() =>
    question.runtime === "dom"
      ? createDomDocument({
          source: "",
          fixtureHtml: question.fixtureHtml ?? "",
        })
      : "",
  );
  const isSql = question.kind === "sql";
  const isGit = question.kind === "git";
  const fileName =
    question.fileName ??
    (isSql ? "query.sql" : track === "ts" ? "script.ts" : "script.js");
  const isNode = track === "node";
  const isShell = question.kind === "shell";
  const isDom = question.runtime === "dom";
  const cwd = question.cwd ?? "app";
  const canRun = track !== "ts" && !isSql && !isGit;
  const hasOutputSample = Boolean(question.sample?.trim());
  const expectedResult = hasOutputSample
    ? question.sample
    : track === "ts"
      ? "型エラーがなく、指定された型の約束を満たせば完了です。"
      : "この問題は表示結果ではなく、指定されたコードの形と動作を採点します。";
  const canSubmit =
    !checked &&
    typed.trim() !== "" &&
    (!question.typeTests || typeValidationReady);
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

  useEffect(() => {
    if (!failReason) return;
    requestAnimationFrame(() => {
      guideRef.current?.scrollTo({
        top: guideRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [failReason, failTick]);

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
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    try {
      if (isShell) {
        replayShell(typed);
        return;
      }
      if (isDom) {
        setDomDocument(
          createDomDocument({
            source: typed,
            fixtureHtml: question.fixtureHtml ?? "",
          }),
        );
        const result = await runDomQuestion(question, typed);
        setLogs(result.logs);
        setRunError(result.error ?? null);
        return;
      }
      await runJs();
      if (isNode) setPane("term");
    } finally {
      setIsRunning(false);
    }
  }

  async function submit() {
    if (!typed.trim() || isRunning || isSubmitting) return;
    if (confidence === null) {
      setConfidenceOpen(true);
      return;
    }
    if (track === "ts" && typeErrors.length > 0) {
      setRunError(`TypeScript: ${typeErrors[0]}`);
      return;
    }
    setIsSubmitting(true);
    try {
      if (isShell) {
        replayShell(typed);
      } else if (isDom) {
        setDomDocument(
          createDomDocument({
            source: typed,
            fixtureHtml: question.fixtureHtml ?? "",
          }),
        );
        const result = await runDomQuestion(question, typed);
        setLogs(result.logs);
        setRunError(result.error ?? null);
      } else if (!isSql && !isGit) {
        await runJs();
        if (isNode) setPane("term");
      }
      await onSubmit(
        track === "ts" && question.typeTests
          ? typeErrors.length === 0
          : undefined,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const toolbar = (
    <LabToolbar
      checked={checked}
      canSubmit={canSubmit && !isRunning && !isSubmitting}
      canAdvance={Boolean(failReason) && reflection.trim().length >= 10}
      canFinish={!requiresExplanation || reflection.trim().length >= 10}
      correctCount={correctCount}
      total={total}
      nextLabel={nextLabel}
      onReset={() => {
        onTyped(question.starter ?? "");
        setConfidenceOpen(false);
        setLogs([]);
        setRunError(null);
        setShellLog([]);
        setTypeErrors([]);
        setTypeValidationReady(false);
        setTerminalRevision((revision) => revision + 1);
        if (isDom) {
          setDomDocument(
            createDomDocument({
              source: "",
              fixtureHtml: question.fixtureHtml ?? "",
            }),
          );
        }
        setPane("file");
      }}
      onAnswer={() => {
        setAnswerOpen(true);
        onAnswerViewed?.();
      }}
      onNext={onNext}
      onSubmit={submit}
      pending={isSubmitting}
    />
  );

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#10141c] text-[var(--cream)] lg:overflow-hidden"
    >
      <div className={`lab-grid min-h-0 flex-1${isNode ? " is-node" : ""}`}>
        <aside
          ref={guideRef}
          className="flex min-h-0 touch-pan-y flex-col overflow-y-auto border-b border-line bg-desk text-ink lg:border-b-0 lg:border-r"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-mono text-xs font-semibold text-studio">コード演習</p>
            <p className="font-mono text-xs tracking-widest text-mute">
              {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
            </p>
          </div>
          <header className="px-5 pb-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-studio">
              演習
            </p>
            <h1 className="mt-2 font-serif text-xl font-medium leading-8">
              <CopyableText
                text={question.prompt}
                code={question.answer}
                copyValues={
                  isShell
                    ? [question.answer, ...(question.aliases ?? [])]
                    : undefined
                }
              />
            </h1>
            {question.scenario ? (
              <p className="mt-3 border-l-2 border-studio pl-3 text-sm leading-6 text-mute">
                {question.projectRole === "transfer"
                  ? "別の場面へ応用: "
                  : question.projectRole === "build"
                    ? "注文画面を作る: "
                    : "基礎練習: "}
                {question.scenario}
              </p>
            ) : null}
          </header>
          {projectPreview ? (
            <div className="px-4 pb-4">
              <OrderProjectPreview compact />
            </div>
          ) : null}
          <QuestionGuide
            question={question}
            fileName={fileName}
            isShell={isShell}
          />
          {attempted ? (
          <div className="px-4 pb-4">
            <ConfidenceScale
              value={confidence}
              onChange={onConfidence}
              tone="light"
              disabled
              result={checked}
            />
          </div>
          ) : null}
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
            {assistant}
            {hints.length > 0 ? (
              <Button
                variant="secondary"
                className="w-full border border-[#73bfb1] bg-[#d5f0ea] text-[#075f56] hover:border-[#4fa897] hover:bg-[#c2e8df] hover:text-[#054d46]"
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
              </Button>
            ) : null}
            {hintLevel > 0 ? (
              <Alert role="status">
                <AlertTitle>ヒント {hintLevel}/{hints.length}</AlertTitle>
                <AlertDescription>
                  <ol className="flex flex-col gap-2">
                    {hints.slice(0, hintLevel).map((hint, index) => (
                      <li key={hint}>
                        <span className="mr-2 font-mono">{index + 1}.</span>
                        <CopyableText
                          text={hint}
                          code={question.answer}
                          copyValues={
                            isShell
                              ? [question.answer, ...(question.aliases ?? [])]
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ol>
                </AlertDescription>
              </Alert>
            ) : null}
            {onOpenSlide ? (
              <Button
                className="w-full"
                onClick={(event) => onOpenSlide(event.currentTarget)}
              >
                スライドで確認
              </Button>
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
        ) : isSql ? (
          <section className="editor-shell overflow-y-auto bg-background text-foreground">
            <SqlConsole
              source={typed}
              question={question}
              disabled={checked || isSubmitting}
              onChange={onTyped}
              onError={(error) => setRunError(error.message)}
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
        ) : isGit ? (
          <section className="editor-shell overflow-y-auto bg-[#10141c]">
            <GitTerminal
              key={`${question.id}-${terminalRevision}`}
              initialState={question.gitInitialState}
              assertions={question.gitAssertions}
              disabled={checked || isSubmitting}
              onCommand={(command) =>
                onTyped([typed, command].filter(Boolean).join("\n"))
              }
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
        ) : isNode ? (
          <section className="editor-shell is-term">
            <Tabs
              value={pane}
              onValueChange={(value) => setPane(value as "file" | "term")}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="node-term-tabs">
                <TabsTrigger value="file" className="node-term-tab">
                  <IconFile aria-hidden="true" />
                  {fileName}
                </TabsTrigger>
                <TabsTrigger value="term" className="node-term-tab">
                  <span className="node-term-glyph" aria-hidden="true">
                    &gt;_
                  </span>
                  ターミナル
                </TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-0 min-h-0 flex-1">
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
              </TabsContent>
              <TabsContent value="term" className="node-term-body mt-0">
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
              </TabsContent>
            </Tabs>
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
                onValidate={(errors) => {
                  setTypeErrors(errors);
                  setTypeValidationReady(true);
                }}
                typeTests={question.typeTests}
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
              {isDom ? (
                <OutputPane title="画面プレビュー" onPlay={run} pending={isRunning}>
                  <iframe
                    className="dom-preview-frame"
                    title="注文管理画面の実行結果"
                    sandbox="allow-scripts"
                    srcDoc={domDocument}
                  />
                  {runError ? (
                    <p className="mt-2 text-[#fca5a5]">{runError}</p>
                  ) : null}
                </OutputPane>
              ) : (
                <OutputPane title="コンソール" onPlay={run} pending={isRunning}>
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
              )}
              <OutputPane title={hasOutputSample ? "出力見本" : "達成条件"}>
                <pre className="whitespace-pre-wrap">
                  {expectedResult}
                </pre>
              </OutputPane>
            </aside>
          </>
        )}
      </div>
      <ConfidenceDialog
        open={confidenceOpen}
        value={confidence}
        onChange={onConfidence}
        onCancel={() => setConfidenceOpen(false)}
        onConfirm={() => {
          setConfidenceOpen(false);
          void submit();
        }}
      />
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
    </main>
  );
}

function QuestionGuide({
  question,
  fileName,
  isShell,
}: {
  question: Question;
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

  return (
    <section className="question-guide" aria-label="問題の進め方">
      <p className="question-guide-label">
        {question.exerciseKind === "transfer"
          ? "別の場面へ応用"
          : question.scaffoldLevel === "worked"
            ? "完成例を手がかりに再現する"
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
            <CopyableText
              text={question.lead}
              code={question.answer}
              copyValues={
                isShell
                  ? [question.answer, ...(question.aliases ?? [])]
                  : undefined
              }
            />
          </p>
        </div>
      ) : null}

      <div className="question-goal">
        <p className="question-material">
          <span>{isShell ? "入力場所" : "用意済み"}</span>
          <strong>{isShell ? "ターミナル" : fileName}</strong>
          {question.starter ? (
            <small>最初から入っているコードがあります</small>
          ) : null}
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
                  <CopyableText
                    text={step}
                    code={question.answer}
                    copyValues={
                      isShell
                        ? [question.answer, ...(question.aliases ?? [])]
                        : undefined
                    }
                  />
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
  pending,
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
  pending: boolean;
}) {
  return (
    <div className="editor-toolbar">
      <button type="button" className="editor-tool" disabled={checked || pending} onClick={onReset}>
        <IconReset className="h-4 w-4" />
        リセット
      </button>
      <button type="button" className="editor-tool" disabled={checked || pending} onClick={onAnswer}>
        <IconEye className="h-4 w-4" />
        答えを見る
      </button>
      <span className="editor-score">
        正解 {correctCount} / {total}
      </span>
      {checked ? (
        <Button
          disabled={!canFinish}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canAdvance ? (
            <Button variant="outline" onClick={onNext}>
              あとで解き直す
            </Button>
          ) : null}
          <Button disabled={!canSubmit || pending} onClick={onSubmit}>
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                採点中…
              </>
            ) : canAdvance ? (
              "もう一度確かめる"
            ) : (
              "できた！"
            )}
          </Button>
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
    <Alert key={tick} variant="destructive" className="editor-fail-alert">
      <AlertTitle>まだ一致していません</AlertTitle>
      <AlertDescription className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <Button variant="ghost" size="sm" onClick={onClose}>
          閉じる
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function OutputPane({
  title,
  onPlay,
  pending = false,
  children,
}: {
  title: string;
  onPlay?: () => void;
  pending?: boolean;
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
            aria-label={pending ? "実行中" : "実行"}
            disabled={pending}
            onClick={onPlay}
          >
            {pending ? <Spinner /> : <IconPlay className="h-3 w-3" />}
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
