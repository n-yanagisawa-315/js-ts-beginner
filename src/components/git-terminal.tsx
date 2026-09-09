"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type {
  GitAssertion,
  GitRepositoryState,
} from "@/lib/course/types";
import {
  executeGitCommand,
  getGitStatus,
  type GitCommandResult,
} from "@/lib/git/git-command";
import {
  createGitState,
  getCurrentBranch,
  gradeGitAssertions,
  type GitGradeResult,
  type GitState,
} from "@/lib/git/git-state";
import { cn } from "@/lib/utils";

type TranscriptEntry = {
  id: number;
  command: string;
  output: string[];
  failed: boolean;
};

export type GitTerminalProps = {
  value?: GitState;
  defaultValue?: GitState;
  initialState?: GitRepositoryState;
  assertions?: ReadonlyArray<GitAssertion>;
  disabled?: boolean;
  className?: string;
  onValueChange?: (state: GitState, result: GitCommandResult) => void;
  onCommand?: (command: string, result: GitCommandResult) => void;
  onGrade?: (result: GitGradeResult) => void;
};

const STATUS_LABELS = {
  added: "追加",
  modified: "変更",
  deleted: "削除",
  untracked: "未追跡",
} as const;

export function GitTerminal({
  value,
  defaultValue,
  initialState,
  assertions = [],
  disabled = false,
  className,
  onValueChange,
  onCommand,
  onGrade,
}: GitTerminalProps) {
  const inputId = useId();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState<GitState>(
    () => defaultValue ?? createGitState(initialState),
  );
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [grade, setGrade] = useState<GitGradeResult | null>(null);
  const state = value ?? internalValue;
  const isControlled = value !== undefined;
  const statuses = getGitStatus(state);
  const currentBranch = getCurrentBranch(state);

  useEffect(() => {
    const element = transcriptRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [transcript]);

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command || disabled) return;

    const result = executeGitCommand(state, command);
    if (!isControlled && result.state !== state) {
      setInternalValue(result.state);
    }
    if (result.state !== state) onValueChange?.(result.state, result);
    onCommand?.(command, result);
    setTranscript((entries) => [
      ...entries,
      {
        id: entries.length + 1,
        command,
        output: result.output,
        failed: result.exitCode !== 0,
      },
    ]);
    setHistory((commands) => [...commands, command]);
    setHistoryIndex(history.length + 1);
    setInput("");
    setGrade(null);
  }

  function navigateHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (event.key === "ArrowUp") {
      const nextIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
      return;
    }
    const nextIndex = Math.min(history.length, historyIndex + 1);
    setHistoryIndex(nextIndex);
    setInput(nextIndex === history.length ? "" : (history[nextIndex] ?? ""));
  }

  function runGrade() {
    const result = gradeGitAssertions(state, assertions);
    setGrade(result);
    onGrade?.(result);
  }

  return (
    <section
      className={cn(
        "grid min-h-[32rem] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-xl lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]",
        className,
      )}
      aria-label="Git・GitHub 模擬ターミナル"
    >
      <div className="flex min-h-0 flex-col border-slate-700 lg:border-r">
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-300" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </span>
            <h2 className="ml-2 text-sm font-semibold">Git terminal</h2>
          </div>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 font-mono text-xs text-cyan-300">
            {currentBranch ?? "detached HEAD"}
          </span>
        </header>

        <div
          ref={transcriptRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-sm"
          aria-live="polite"
        >
          {transcript.length === 0 ? (
            <p className="text-slate-500">
              git status または gh auth status から始められます。
            </p>
          ) : null}
          {transcript.map((entry) => (
            <div key={entry.id} className="mb-4">
              <p>
                <span className="select-none text-emerald-400">$ </span>
                <span>{entry.command}</span>
              </p>
              {entry.output.map((line, index) => (
                <p
                  key={`${entry.id}-${index}`}
                  className={entry.failed ? "whitespace-pre-wrap text-rose-300" : "whitespace-pre-wrap text-slate-300"}
                >
                  {line || "\u00a0"}
                </p>
              ))}
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm"
          onSubmit={submitCommand}
        >
          <label htmlFor={inputId} className="sr-only">
            Gitコマンド
          </label>
          <span className="select-none text-emerald-400" aria-hidden="true">
            $
          </span>
          <input
            id={inputId}
            name="git-command"
            value={input}
            disabled={disabled}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
            placeholder="git status"
            onChange={(event) => {
              setInput(event.currentTarget.value);
              setHistoryIndex(history.length);
            }}
            onKeyDown={navigateHistory}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="rounded-lg bg-cyan-400 px-3 py-1.5 font-sans text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            実行
          </button>
        </form>
      </div>

      <aside className="min-h-0 overflow-y-auto bg-slate-900/60 p-4">
        <div className="space-y-5">
          <DashboardSection title="Status" count={statuses.length}>
            {statuses.length ? (
              <ul className="space-y-2">
                {statuses.map((status) => (
                  <li
                    key={status.path}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  >
                    <p className="truncate font-mono text-xs text-slate-200">
                      {status.path}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {status.index ? (
                        <StatusBadge tone="staged">
                          staged · {STATUS_LABELS[status.index]}
                        </StatusBadge>
                      ) : null}
                      {status.workingTree ? (
                        <StatusBadge tone="working">
                          working · {STATUS_LABELS[status.workingTree]}
                        </StatusBadge>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLabel>working tree clean</EmptyLabel>
            )}
          </DashboardSection>

          <DashboardSection
            title="Branches"
            count={Object.keys(state.branches).length}
          >
            <ul className="space-y-1 font-mono text-xs">
              {Object.entries(state.branches).map(([branch, commitId]) => (
                <li
                  key={branch}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5",
                    branch === currentBranch && "bg-cyan-400/10 text-cyan-300",
                  )}
                >
                  <span>{branch === currentBranch ? `* ${branch}` : branch}</span>
                  <span className="text-slate-500">
                    {commitId?.slice(0, 7) ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardSection>

          <DashboardSection title="Commits" count={state.commits.length}>
            {state.commits.length ? (
              <ol className="space-y-2">
                {[...state.commits].reverse().map((commit) => (
                  <li key={commit.id} className="flex gap-2 text-xs">
                    <code className="text-amber-300">
                      {commit.id.slice(0, 7)}
                    </code>
                    <span className="min-w-0 truncate text-slate-300">
                      {commit.message}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyLabel>コミットはまだありません</EmptyLabel>
            )}
          </DashboardSection>

          <DashboardSection
            title="Pull requests"
            count={state.pullRequests.length}
          >
            {state.pullRequests.length ? (
              <ul className="space-y-2">
                {[...state.pullRequests].reverse().map((pullRequest) => (
                  <li
                    key={pullRequest.number}
                    className="rounded-lg border border-slate-700 p-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-200">
                        #{pullRequest.number} {pullRequest.title}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] uppercase",
                          pullRequest.state === "open"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-violet-400/15 text-violet-300",
                        )}
                      >
                        {pullRequest.state}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-slate-500">
                      {pullRequest.head} → {pullRequest.base}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLabel>オープンなPRはありません</EmptyLabel>
            )}
          </DashboardSection>

          {assertions.length ? (
            <div className="border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={runGrade}
                className="w-full rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                課題を採点
              </button>
              {grade ? (
                <div
                  className={cn(
                    "mt-3 rounded-lg border p-3 text-xs",
                    grade.passed
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-amber-500/40 bg-amber-500/10",
                  )}
                >
                  <p className="font-semibold">
                    {grade.score} / {grade.total} 達成
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    {grade.results.map((result, index) => (
                      <li key={index}>
                        {result.passed ? "✓" : "○"} {result.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

function DashboardSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
        <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          {count}
        </span>
      </h3>
      {children}
    </section>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "staged" | "working";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
        tone === "staged"
          ? "bg-emerald-400/15 text-emerald-300"
          : "bg-amber-400/15 text-amber-300",
      )}
    >
      {children}
    </span>
  );
}

function EmptyLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-xs text-slate-500">
      {children}
    </p>
  );
}
