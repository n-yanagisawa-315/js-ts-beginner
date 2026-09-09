"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { HighlightEditor } from "@/components/highlight-editor";
import { IconPlay } from "@/components/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Question } from "@/lib/course/types";
import {
  runSqlQuestion,
  type SqlCell,
  type SqlRunResult,
} from "@/lib/sql/sql-runner";
import { cn } from "@/lib/utils";

export type SqlConsoleProps = {
  source: string;
  question: Question;
  disabled?: boolean;
  className?: string;
  submitLabel?: string;
  onChange: (source: string) => void;
  onSubmit?: (result: SqlRunResult) => void | Promise<void>;
  onError?: (error: Error) => void;
};

function formatCell(value: SqlCell | undefined) {
  if (value === null) {
    return <span className="italic text-muted-foreground">NULL</span>;
  }
  if (value === undefined) return "";
  if (
    value instanceof Uint8Array ||
    value instanceof Int8Array ||
    value instanceof ArrayBuffer
  ) {
    const bytes =
      value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const preview = Array.from(bytes.slice(0, 32), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    return `0x${preview}${bytes.length > 32 ? "…" : ""}`;
  }
  return String(value);
}

function SqlResults({ result }: { result: SqlRunResult | null }) {
  if (!result) {
    return (
      <p className="text-sm text-muted-foreground">
        SQLを実行すると、ここに結果が表示されます。
      </p>
    );
  }

  if (result.columns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        SQLは正常に実行されました。返された行はありません。
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="overflow-auto rounded-md border">
        <table className="w-full border-collapse text-left font-mono text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={`${index}-${column}`}
                  scope="col"
                  className="whitespace-nowrap border-b px-3 py-2 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.length > 0 ? (
              result.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0">
                  {result.columns.map((column, columnIndex) => (
                    <td
                      key={`${columnIndex}-${column}`}
                      className="whitespace-nowrap px-3 py-2 align-top"
                    >
                      {formatCell(row[column])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={result.columns.length}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  0行
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {result.rows.length}行
        {result.truncated ? "（最大500行まで表示）" : ""}
      </p>
    </div>
  );
}

export function SqlConsole({
  source,
  question,
  disabled = false,
  className,
  submitLabel = "SQLを実行",
  onChange,
  onSubmit,
  onError,
}: SqlConsoleProps) {
  const generatedId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [resultState, setResultState] = useState<{
    questionId: string;
    value: SqlRunResult;
  } | null>(null);
  const [errorState, setErrorState] = useState<{
    questionId: string;
    message: string;
  } | null>(null);
  const pending = pendingQuestionId === question.id;
  const result =
    resultState?.questionId === question.id ? resultState.value : null;
  const error =
    errorState?.questionId === question.id ? errorState.message : null;

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, [question.id]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  function handleChange(nextSource: string) {
    setResultState(null);
    setErrorState(null);
    onChange(nextSource);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || pending || !source.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPendingQuestionId(question.id);
    setErrorState(null);

    try {
      const nextResult = await runSqlQuestion(question, source, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setResultState({ questionId: question.id, value: nextResult });
      await onSubmit?.(nextResult);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      const normalized =
        caught instanceof Error
          ? caught
          : new Error("SQLの実行に失敗しました。");
      setErrorState({
        questionId: question.id,
        message: normalized.message,
      });
      onError?.(normalized);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setPendingQuestionId(null);
      }
    }
  }

  const editorId = `${generatedId}-sql-editor`;
  const resultId = `${generatedId}-sql-result`;

  return (
    <form
      className={cn(
        "grid min-h-[32rem] min-w-0 overflow-hidden rounded-lg border bg-background lg:grid-cols-2",
        className,
      )}
      onSubmit={handleSubmit}
    >
      <section className="editor-shell min-w-0 border-b lg:border-r lg:border-b-0">
        <div className="editor-tabbar">
          <span className="editor-tab">query.sql</span>
        </div>
        <HighlightEditor
          id={editorId}
          value={source}
          language="sql"
          disabled={disabled || pending}
          describedBy={resultId}
          onChange={handleChange}
        />
        <div className="editor-toolbar">
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            disabled={disabled || pending || !source.trim()}
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconPlay data-icon="inline-start" />
            )}
            {pending ? "実行中…" : submitLabel}
          </Button>
        </div>
      </section>

      <section
        id={resultId}
        aria-label="SQL実行結果"
        aria-live="polite"
        aria-busy={pending}
        className="flex min-h-0 min-w-0 flex-col gap-4 bg-card p-4 text-card-foreground"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">実行結果</h2>
          {result ? (
            <span className="font-mono text-xs text-muted-foreground">
              {result.rows.length} rows
            </span>
          ) : null}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>SQLを実行できませんでした</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : pending ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            SQLiteを準備して実行しています…
          </div>
        ) : (
          <SqlResults result={result} />
        )}
      </section>
    </form>
  );
}
