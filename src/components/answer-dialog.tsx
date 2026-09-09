"use client";

import { useRef, useState } from "react";
import { HighlightEditor } from "@/components/highlight-editor";
import { IconFile } from "@/components/icons";
import { NodeTermLines, NodeTermPrompt } from "@/components/node-terminal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { TermLine } from "@/lib/course/types";

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
  const [compare, setCompare] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  function close() {
    setCompare(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent
        className="answer-dialog-content"
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
        <DialogHeader className="sr-only">
          <DialogTitle>解答例</DialogTitle>
          <DialogDescription>
            解答例と自分のコードを比較できます。
          </DialogDescription>
        </DialogHeader>
        <div className="answer-modal">
        <div className="answer-tabs">
          <p className="answer-tab is-on">
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
              <div className="answer-compare">
                <Label htmlFor="answer-compare">
                  自分のコードと比べてみる
                </Label>
                <Switch
                  id="answer-compare"
                  checked={compare}
                  onCheckedChange={setCompare}
                />
              </div>
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
                  id="answer-mine"
                  value={mine}
                  language={language}
                  readOnly
                  hideGutter={terminal}
                />
              </section>
              <section className="answer-split-pane">
                <p className="answer-split-label">答え</p>
                <HighlightEditor
                  id="answer-example"
                  value={code}
                  language={language}
                  readOnly
                  hideGutter={terminal}
                />
              </section>
            </div>
          ) : (
            <HighlightEditor
              id="answer-code"
              value={code}
              language={language}
              readOnly
              hideGutter={terminal}
            />
          )}
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}
