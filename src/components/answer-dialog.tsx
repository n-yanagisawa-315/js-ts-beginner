"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HighlightEditor } from "@/components/highlight-editor";
import { IconCloseCircle, IconFile } from "@/components/icons";
import { NodeTermLines, NodeTermPrompt } from "@/components/node-terminal";
import type { TermLine } from "@/lib/course";

export function AnswerDialog({
  open,
  fileName,
  code,
  mine,
  language,
  terminal = false,
  shell = false,
  cwd = "app",
  termOutput = [],
  termAlive = false,
  onClose,
}: {
  open: boolean;
  fileName: string;
  code: string;
  mine: string;
  language: "javascript" | "typescript";
  terminal?: boolean;
  shell?: boolean;
  cwd?: string;
  termOutput?: TermLine[];
  termAlive?: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [compare, setCompare] = useState(false);
  if (!open && compare) {
    setCompare(false);
  }

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="answer-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="answer-close"
        aria-label="閉じる"
        onClick={onClose}
      >
        <IconCloseCircle className="h-9 w-9" />
      </button>
      <div className="answer-modal">
        <div className="answer-tabs">
          <p id={titleId} className="answer-tab is-on">
            答え
          </p>
        </div>
        <div className={`answer-stage${terminal || shell ? " is-term" : ""}`}>
          <header className={`answer-editor-head${terminal || shell ? " is-term" : ""}`}>
            {shell ? (
              <p className="console-window-title">
                <span className="console-window-prompt" aria-hidden="true">
                  &gt;<span className="console-window-prompt-cursor">_</span>
                </span>
                ターミナル
              </p>
            ) : terminal ? (
              <p className="console-window-title">
                <span className="console-window-prompt" aria-hidden="true">
                  &gt;<span className="console-window-prompt-cursor">_</span>
                </span>
                {fileName}
              </p>
            ) : (
              <span className="editor-tab">
                <IconFile className="h-3.5 w-3.5" />
                {fileName}
              </span>
            )}
            {shell ? null : (
              <button
                type="button"
                className="answer-compare"
                role="switch"
                aria-checked={compare}
                onClick={() => setCompare((on) => !on)}
              >
                <span>自分のコードと比べてみる</span>
                <span className={`answer-switch${compare ? " is-on" : ""}`} />
              </button>
            )}
          </header>
          {shell ? (
            <div className="node-term-body is-answer">
              <p className="node-term-line is-meta">
                <NodeTermPrompt cwd={cwd} /> {code}
              </p>
              <NodeTermLines lines={termOutput} />
              {termAlive ? null : (
                <p className="node-term-row">
                  <NodeTermPrompt cwd={cwd} />
                </p>
              )}
            </div>
          ) : compare ? (
            <div className="answer-split">
              <section className="answer-split-pane">
                <p className="answer-split-label">自分のコード</p>
                <HighlightEditor
                  id={`${titleId}-mine`}
                  value={mine}
                  language={language}
                  readOnly
                  hideGutter={terminal}
                />
              </section>
              <section className="answer-split-pane">
                <p className="answer-split-label">答え</p>
                <HighlightEditor
                  id={`${titleId}-answer`}
                  value={code}
                  language={language}
                  readOnly
                  hideGutter={terminal}
                />
              </section>
            </div>
          ) : (
            <HighlightEditor
              id={`${titleId}-code`}
              value={code}
              language={language}
              readOnly
              hideGutter={terminal}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}
