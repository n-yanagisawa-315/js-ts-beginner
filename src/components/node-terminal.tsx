"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import type { TermLine } from "@/lib/course";

export function NodeTermPrompt({ cwd }: { cwd: string }) {
  return <span className="node-term-cwd">{cwd} $</span>;
}

export function NodeTermLines({
  lines,
}: {
  lines: ReadonlyArray<TermLine>;
}) {
  return (
    <>
      {lines.map((line, index) => (
        <p
          key={`${index}-${line.text}`}
          className={`node-term-line is-${line.tone ?? "out"}`}
        >
          {line.text || "\u00a0"}
        </p>
      ))}
    </>
  );
}

export function NodeTermInput({
  cwd,
  value,
  disabled,
  onChange,
  onSubmit,
}: {
  cwd: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="node-term-row" onSubmit={handleSubmit}>
      <label htmlFor={id} className="sr-only">
        コマンド
      </label>
      <NodeTermPrompt cwd={cwd} />
      <input
        ref={inputRef}
        id={id}
        value={value}
        disabled={disabled}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="node-term-field"
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </form>
  );
}

export function NodeTermChrome({
  active,
  onSelect,
  children,
  footer,
}: {
  active: 1 | 2;
  onSelect: (tab: 1 | 2) => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="node-term">
      <header className="node-term-tabs">
        <button
          type="button"
          className={`node-term-tab${active === 1 ? " is-on" : ""}`}
          onClick={() => onSelect(1)}
        >
          <span className="node-term-glyph" aria-hidden="true">
            &gt;_
          </span>
          ターミナル1
        </button>
        <button
          type="button"
          className={`node-term-tab${active === 2 ? " is-on" : ""}`}
          onClick={() => onSelect(2)}
        >
          <span className="node-term-glyph" aria-hidden="true">
            &gt;_
          </span>
          ターミナル2
        </button>
      </header>
      <div className="node-term-body">{children}</div>
      {footer}
    </section>
  );
}
