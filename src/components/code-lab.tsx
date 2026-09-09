"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnswerDialog } from "@/components/answer-dialog";
import { CopyableText } from "@/components/copyable-text";
import {
  ConfidenceDialog,
  ConfidenceScale,
} from "@/components/confidence-scale";
import { HighlightEditor } from "@/components/highlight-editor";
import type { GitTerminalProps } from "@/components/git-terminal";
import { IconEye, IconFile, IconPlay, IconReset } from "@/components/icons";
import type { OrderProjectPreviewProps } from "@/components/order-project-preview";
import type { SqlConsoleProps } from "@/components/sql-console";
import type { SqlRunResult } from "@/lib/sql/sql-runner";
import { SelfExplanation } from "@/components/self-explanation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { RuntimeEvidence } from "@/lib/grade-question";
import {
  createDomDocument,
  runDomQuestion,
  type DomRunResult,
} from "@/lib/run-dom";
import {
  runStudentJs,
  syntaxLine,
  type StudentRunResult,
} from "@/lib/run-js";
import type { Question, TermLine, Track } from "@/lib/course/types";

const loadGitTerminal = () => import("@/components/git-terminal");
const loadOrderProjectPreview = () =>
  import("@/components/order-project-preview");
const loadSqlConsole = () => import("@/components/sql-console");

const GitTerminal = dynamic<GitTerminalProps>(
  () => loadGitTerminal().then((module) => module.GitTerminal),
  {
    loading: () => <LabBranchLoading label="Git ターミナルを準備中…" />,
  },
);

const OrderProjectPreview = dynamic<OrderProjectPreviewProps>(
  () => loadOrderProjectPreview().then((module) => module.OrderProjectPreview),
  {
    loading: () => <LabBranchLoading label="注文画面を準備中…" />,
  },
);

const SqlConsole = dynamic<SqlConsoleProps>(
  () => loadSqlConsole().then((module) => module.SqlConsole),
  {
    loading: () => <LabBranchLoading label="SQL コンソールを準備中…" />,
  },
);

export function preloadCodeLabDependencies(
  question: Question,
  projectPreview = false,
) {
  if (question.kind === "sql") void loadSqlConsole();
  if (question.kind === "git") void loadGitTerminal();
  if (projectPreview) void loadOrderProjectPreview();
}

export type CodeLabProps = {
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
  onSubmit: (
    correctOverride?: boolean,
    evidence?: RuntimeEvidence,
  ) => void | Promise<void>;
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
};

export function CodeLab(props: CodeLabProps) {
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
  reflection,
  onReflection,
  assistant,
  projectPreview = false,
}: CodeLabProps) {
  const editorId = useId();
  const explainId = useId();
  const explainRef = useRef<HTMLParagraphElement>(null);
  const domPreviewRef = useRef<HTMLIFrameElement>(null);
  const submittingRef = useRef(false);
  const sqlEvidenceRef = useRef<{
    questionId: string;
    source: string;
    result: SqlRunResult;
  } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
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
  const initialDomDocument = useMemo(
    () =>
      question.runtime === "dom"
        ? createDomDocument({
            source: "",
            fixtureHtml: question.fixtureHtml ?? "",
          })
        : "",
    [question.fixtureHtml, question.runtime],
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

  async function runJs(): Promise<StudentRunResult> {
    if (!canRun) {
      const result = {
        logs: [],
        error: "TypeScript の問題は提出で採点します。右の見本は期待する表示です。",
      };
      setLogs([]);
      setRunError(result.error);
      return result;
    }
    const result = await runStudentJs(typed);
    setLogs(result.logs);
    setRunError(result.error ?? null);
    return result;
  }

  async function runDom(): Promise<DomRunResult> {
    const iframe = domPreviewRef.current;
    if (!iframe) {
      const result = {
        passed: false,
        html: "",
        logs: [],
        error: "DOMプレビューを準備できませんでした。",
      };
      setLogs(result.logs);
      setRunError(result.error);
      return result;
    }
    const result = await runDomQuestion(question, typed, { iframe });
    setLogs(result.logs);
    setRunError(result.error ?? null);
    return result;
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
        await runDom();
        return;
      }
      await runJs();
      if (isNode) setPane("term");
    } finally {
      setIsRunning(false);
    }
  }

  async function submit() {
    if (!typed.trim() || isRunning || isSubmitting || submittingRef.current) return;
    if (confidence === null) {
      setConfidenceOpen(true);
      return;
    }
    if (track === "ts" && typeErrors.length > 0) {
      setRunError(`TypeScript: ${typeErrors[0]}`);
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      let evidence: RuntimeEvidence | undefined;
      if (isShell) {
        replayShell(typed);
      } else if (isDom) {
        const result = await runDom();
        evidence = { runtime: "dom", source: typed, result };
      } else if (isSql) {
        const cached = sqlEvidenceRef.current;
        if (cached?.questionId === question.id && cached.source === typed) {
          evidence = { runtime: "sql", source: typed, result: cached.result };
        }
      } else if (!isSql && !isGit) {
        const result = await runJs();
        evidence = { runtime: "js", source: typed, result };
        if (isNode) setPane("term");
      }
      await onSubmit(
        track === "ts" && question.typeTests
          ? typeErrors.length === 0
          : undefined,
        evidence,
      );
      setReviewOpen(true);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function showAnswer() {
    setAnswerOpen(true);
    onAnswerViewed?.();
  }

  const toolbar = (
    <LabToolbar
      checked={checked}
      canSubmit={canSubmit && !isRunning && !isSubmitting}
      canAdvance={Boolean(failReason) && reflection.trim().length >= 10}
      correctCount={correctCount}
      total={total}
      onReset={() => {
        sqlEvidenceRef.current = null;
        onTyped(question.starter ?? "");
        setConfidenceOpen(false);
        setLogs([]);
        setRunError(null);
        setShellLog([]);
        setTypeErrors([]);
        setTypeValidationReady(false);
        setTerminalRevision((revision) => revision + 1);
        if (isDom && domPreviewRef.current) {
          domPreviewRef.current.srcdoc = initialDomDocument;
        }
        setPane("file");
      }}
      onAnswer={showAnswer}
      onNext={onNext}
      onSubmit={submit}
      pending={isSubmitting}
    />
  );
  const successDock = checked ? (
    <SuccessDock
      canContinue={!requiresExplanation || reflection.trim().length >= 10}
      nextLabel={nextLabel}
      onAnswer={showAnswer}
      onNext={onNext}
    />
  ) : null;

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#10141c] text-[var(--cream)] lg:overflow-hidden"
    >
      <div className={`lab-grid min-h-0 flex-1${isNode ? " is-node" : ""}`}>
        <aside
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
              {question.prompt.replaceAll(
                "starter",
                "最初から入っているコード",
              )}
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
                        {hint.replaceAll(
                          "starter",
                          "最初から入っているコード",
                        )}
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
                {failReason ? (
                  <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
                ) : null}
                {successDock ?? toolbar}
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
              onChange={(source) => {
                sqlEvidenceRef.current = null;
                onTyped(source);
              }}
              onSubmit={(result) => {
                sqlEvidenceRef.current = {
                  questionId: question.id,
                  source: typed,
                  result,
                };
              }}
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
            {failReason ? (
              <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
            ) : null}
            {successDock ?? toolbar}
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
            {failReason ? (
              <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
            ) : null}
            {successDock ?? toolbar}
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
            {failReason ? (
              <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
            ) : null}
            {successDock ?? toolbar}
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
              {failReason ? (
                <FailDock tick={failTick} message={failReason} onClose={onDismissFail} />
              ) : null}
              {successDock ?? toolbar}
            </section>
            <aside className="console-stack min-h-[16rem] border-t border-[#c5c9d0] lg:border-t-0 lg:border-l">
              {isDom ? (
                <OutputPane title="画面プレビュー" onPlay={run} pending={isRunning}>
                  <iframe
                    ref={domPreviewRef}
                    className="dom-preview-frame"
                    title="注文管理画面の実行結果"
                    sandbox="allow-scripts"
                    srcDoc={initialDomDocument}
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
      <AnswerReviewDialog
        open={reviewOpen}
        question={question}
        confidence={confidence}
        correct={checked}
        showExplanation={Boolean(failReason) || (checked && requiresExplanation)}
        reflection={reflection}
        onReflection={onReflection}
        onClose={() => setReviewOpen(false)}
      />
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

function LabBranchLoading({ label }: { label: string }) {
  return (
    <div className="editor-loading min-h-32" role="status" aria-live="polite">
      <Spinner />
      <span>{label}</span>
    </div>
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
          <p className="question-guide-copy">{question.lead}</p>
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
  correctCount,
  total,
  onReset,
  onAnswer,
  onNext,
  onSubmit,
  pending,
}: {
  checked: boolean;
  canSubmit: boolean;
  canAdvance: boolean;
  correctCount: number;
  total: number;
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
      {!checked ? (
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
      ) : null}
    </div>
  );
}

function AnswerReviewDialog({
  open,
  question,
  confidence,
  correct,
  showExplanation,
  reflection,
  onReflection,
  onClose,
}: {
  open: boolean;
  question: Question;
  confidence: number | null;
  correct: boolean;
  showExplanation: boolean;
  reflection: string;
  onReflection: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="answer-review-dialog">
        <DialogHeader>
          <DialogTitle>回答を振り返る</DialogTitle>
          <DialogDescription>
            回答前の自信と実際の結果を比べ、次の回答に活かします。
          </DialogDescription>
        </DialogHeader>
        <ConfidenceScale
          value={confidence}
          onChange={() => undefined}
          disabled
          result={correct}
        />
        {showExplanation ? (
          <SelfExplanation
            question={question}
            value={reflection}
            onChange={onReflection}
            mode={correct ? "reasoning" : "correction"}
          />
        ) : null}
        <DialogFooter>
          <Button onClick={onClose}>演習に戻る</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuccessDock({
  canContinue,
  nextLabel,
  onAnswer,
  onNext,
}: {
  canContinue: boolean;
  nextLabel: string;
  onAnswer: () => void;
  onNext: () => void;
}) {
  const titleId = useId();
  const actionLabel = nextLabel === "結果を見る" ? nextLabel : "次に進む";

  return (
    <section className="success-dock" aria-labelledby={titleId}>
      <div>
        <h2 id={titleId}>Congratulations!</h2>
        <p role="status">
          {canContinue
            ? `正解です！「${actionLabel}」を押して先へ進みましょう。`
            : "正解です！振り返りを10文字以上入力すると次に進めます。"}
        </p>
      </div>
      <div className="success-dock-actions">
        <Button
          variant="secondary"
          className="bg-[#e3e8ec] text-[#536476] hover:bg-[#d4dce2] hover:text-[#344754]"
          onClick={onAnswer}
        >
          解答を見る
        </Button>
        <Button disabled={!canContinue} onClick={onNext}>
          {actionLabel}
        </Button>
      </div>
    </section>
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
