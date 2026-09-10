import { CodeHighlight } from "@/components/code-highlight";
import type { SlideCallout } from "@/lib/course/types";

function highlightToken(line: string, token?: string) {
  if (!token || !line.includes(token)) {
    return <CodeHighlight code={line || " "} />;
  }
  const index = line.indexOf(token);
  const before = line.slice(0, index);
  const after = line.slice(index + token.length);
  return (
    <>
      {before ? <CodeHighlight code={before} /> : null}
      <mark className="slide-token-mark">{token}</mark>
      {after ? <CodeHighlight code={after} /> : null}
    </>
  );
}

export function SlideCodePanel({
  label,
  code,
  callouts,
  activeLines,
}: {
  label: string;
  code: string;
  callouts?: SlideCallout[];
  activeLines?: number[];
}) {
  const lines = code.split("\n");
  const active = new Set(activeLines ?? []);
  const codeCallouts = (callouts ?? []).filter(
    (callout) => (callout.target ?? "code") === "code",
  );
  const calloutByLine = new Map<number, SlideCallout[]>();
  for (const callout of codeCallouts) {
    if (callout.line === undefined) continue;
    const list = calloutByLine.get(callout.line) ?? [];
    list.push(callout);
    calloutByLine.set(callout.line, list);
  }

  return (
    <section className="slide-code-panel" aria-label={`${label}のコード`}>
      <header className="slide-code-panel-bar">
        <span className="slide-code-panel-tab">
          {label}
          <span aria-hidden="true">×</span>
        </span>
      </header>
      <pre className="slide-code-panel-body">
        {lines.map((line, index) => {
          const lineCallouts = calloutByLine.get(index);
          const token = lineCallouts?.find((item) => item.token)?.token;
          const highlighted =
            active.size === 0
              ? lineCallouts?.length
                ? " is-active"
                : ""
              : active.has(index)
                ? " is-active"
                : " is-muted";
          return (
            <span key={`${index}-${line}`} className="slide-code-line-wrap">
              <span className={`slide-code-line${highlighted}`}>
                {highlightToken(line || " ", token)}
              </span>
              {lineCallouts?.map((callout) => (
                <span
                  key={`${callout.label}-${callout.token ?? ""}`}
                  className="slide-code-callout"
                >
                  {callout.label}
                </span>
              ))}
            </span>
          );
        })}
      </pre>
      {codeCallouts
        .filter((callout) => callout.line === undefined)
        .map((callout) => (
          <p key={callout.label} className="slide-code-callout is-global">
            {callout.label}
          </p>
        ))}
    </section>
  );
}

export function SlideConsolePanel({
  lines,
  callouts,
}: {
  lines: string[];
  callouts?: SlideCallout[];
}) {
  const consoleCallouts = (callouts ?? []).filter(
    (callout) => callout.target === "console",
  );
  const calloutByLine = new Map<number, SlideCallout[]>();
  for (const callout of consoleCallouts) {
    const line = callout.line ?? 0;
    const list = calloutByLine.get(line) ?? [];
    list.push(callout);
    calloutByLine.set(line, list);
  }

  return (
    <section className="slide-console-panel" aria-label="コンソール出力">
      <header className="slide-console-panel-bar">
        <span>{">_"} コンソール</span>
      </header>
      <pre className="slide-console-panel-body">
        {lines.map((line, index) => {
          const lineCallouts = calloutByLine.get(index);
          return (
            <span key={`${index}-${line}`} className="slide-console-line-wrap">
              <span
                className={`slide-console-line${lineCallouts?.length ? " is-annotated" : ""}`}
              >
                {line}
              </span>
              {lineCallouts?.map((callout) => (
                <span key={callout.label} className="slide-code-callout">
                  {callout.label}
                </span>
              ))}
            </span>
          );
        })}
      </pre>
      {consoleCallouts
        .filter((callout) => callout.line === undefined && lines.length === 0)
        .map((callout) => (
          <p key={callout.label} className="slide-code-callout is-global">
            {callout.label}
          </p>
        ))}
    </section>
  );
}
