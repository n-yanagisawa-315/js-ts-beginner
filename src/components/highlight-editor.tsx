"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { EditorProps, Monaco, OnMount } from "@monaco-editor/react";

const MonacoEditor = dynamic<EditorProps>(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => <EditorLoading />,
  },
);

const THEME_NAME = "course-dark";
type EditorInstance = Parameters<OnMount>[0];

function EditorLoading() {
  return (
    <div className="editor-loading" role="status">
      エディターを準備中…
    </div>
  );
}

function configureMonaco(monaco: Monaco) {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "F92672" },
      { token: "identifier", foreground: "66D9EF" },
      { token: "string", foreground: "E6DB74" },
      { token: "comment", foreground: "8F908A" },
      { token: "number", foreground: "AE81FF" },
    ],
    colors: {
      "editor.background": "#1D2023",
      "editor.foreground": "#F8F8F2",
      "editorCursor.foreground": "#E8EAED",
      "editor.lineHighlightBackground": "#FFFFFF08",
      "editorLineNumber.foreground": "#6B7380",
      "editorLineNumber.activeForeground": "#C9CDD4",
      "editor.selectionBackground": "#7769B866",
      "editor.inactiveSelectionBackground": "#7769B833",
      "editorSuggestWidget.background": "#25282D",
      "editorSuggestWidget.border": "#555C68",
      "editorSuggestWidget.foreground": "#F8F8F2",
      "editorSuggestWidget.selectedBackground": "#3B4261",
      "editorWidget.background": "#25282D",
      "editorWidget.border": "#555C68",
      "input.background": "#1D2023",
      "input.border": "#555C68",
      "focusBorder": "#7769B8",
    },
  });

  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
}

function setErrorMarkers(
  editor: EditorInstance,
  monaco: Monaco,
  errorLines: number[],
) {
  const model = editor.getModel();
  if (!model) return;

  monaco.editor.setModelMarkers(
    model,
    "course-grading",
    errorLines
      .filter((line) => line >= 0 && line < model.getLineCount())
      .map((line) => {
        const lineNumber = line + 1;
        return {
          severity: monaco.MarkerSeverity.Error,
          message: "この行をもう一度確認してください",
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: model.getLineMaxColumn(lineNumber),
        };
      }),
  );
}

export function HighlightEditor({
  id,
  value,
  language = "javascript",
  disabled,
  readOnly = false,
  hideGutter = false,
  describedBy,
  errorLines = [],
  onChange,
  onValidate,
}: {
  id: string;
  value: string;
  language?: "javascript" | "typescript";
  disabled?: boolean;
  readOnly?: boolean;
  hideGutter?: boolean;
  describedBy?: string;
  errorLines?: number[];
  onChange?: (value: string) => void;
  onValidate?: (errors: string[]) => void;
}) {
  const editorRef = useRef<EditorInstance | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const isReadOnly = readOnly || disabled;

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    setErrorMarkers(editorRef.current, monacoRef.current, errorLines);
  }, [errorLines]);

  return (
    <div className="editor-pane">
      <div className="editor-monaco">
        <MonacoEditor
          value={value}
          language={language}
          theme={THEME_NAME}
          beforeMount={configureMonaco}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;
            setErrorMarkers(editor, monaco, errorLines);
          }}
          onChange={(nextValue) => onChange?.(nextValue ?? "")}
          onValidate={(markers) =>
            onValidate?.(
              markers
                .filter((marker) => marker.severity === 8)
                .map((marker) => marker.message),
            )
          }
          loading={<EditorLoading />}
          wrapperProps={{
            id,
            "aria-describedby": describedBy,
          }}
          options={{
            ariaLabel: readOnly ? "コードの表示" : "コードエディター",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            contextmenu: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            detectIndentation: false,
            folding: !hideGutter,
            fontFamily: "var(--font-code), Menlo, Monaco, monospace",
            fontLigatures: true,
            fontSize: 13,
            formatOnPaste: true,
            glyphMargin: !hideGutter,
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            hover: { enabled: isReadOnly ? "off" : "on" },
            insertSpaces: true,
            lineDecorationsWidth: hideGutter ? 0 : 10,
            lineHeight: 22,
            lineNumbers: hideGutter ? "off" : "on",
            lineNumbersMinChars: 3,
            links: false,
            matchBrackets: "always",
            minimap: {
              enabled: !hideGutter,
              maxColumn: 60,
              renderCharacters: false,
              scale: 1,
              showSlider: "mouseover",
            },
            mouseWheelZoom: true,
            padding: { top: 12, bottom: 12 },
            parameterHints: { enabled: !isReadOnly },
            quickSuggestions: isReadOnly
              ? false
              : { comments: false, other: true, strings: false },
            readOnly: isReadOnly,
            renderLineHighlight: readOnly ? "none" : "line",
            scrollBeyondLastLine: false,
            showDeprecated: false,
            showUnused: false,
            smoothScrolling: true,
            stickyScroll: { enabled: false },
            suggestOnTriggerCharacters: !isReadOnly,
            tabCompletion: isReadOnly ? "off" : "on",
            tabSize: 2,
            wordWrap: "off",
          }}
        />
      </div>
    </div>
  );
}
