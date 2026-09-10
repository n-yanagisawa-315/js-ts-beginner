import type { ReactNode } from "react";
import { CodeHighlight } from "@/components/code-highlight";
import type { SlideCallout, SlideCalloutStyle } from "@/lib/course/types";

function resolveStyle(callout: SlideCallout): SlideCalloutStyle {
  if (callout.style) return callout.style;
  if (callout.target === "console") {
    return callout.label.includes("実行されない") ? "dash" : "wave";
  }
  const token = callout.token ?? "";
  if (token === "'" || token === '"' || token === "`") return "circle";
  if (token === "//" || token === "/*") return "brace";
  if (token === ";") return "brace";
  return "brace";
}

function highlightToken(
  line: string,
  token: string | undefined,
  style: SlideCalloutStyle | undefined,
) {
  if (!token || !line.includes(token)) {
    return <CodeHighlight code={line || " "} />;
  }

  const parts: ReactNode[] = [];
  let remaining = line;
  let key = 0;
  while (remaining.includes(token)) {
    const index = remaining.indexOf(token);
    const before = remaining.slice(0, index);
    if (before) {
      parts.push(<CodeHighlight key={`b-${key}`} code={before} />);
    }
    parts.push(
      <mark
        key={`t-${key}`}
        className={`slide-token-mark is-${style ?? "brace"}`}
      >
        {token}
      </mark>,
    );
    remaining = remaining.slice(index + token.length);
    key += 1;
    if (token === ";") break;
  }
  if (remaining) {
    parts.push(<CodeHighlight key={`a-${key}`} code={remaining} />);
  }
  return <>{parts}</>;
}

/** トークンから右下へ曲がる波括弧＋説明（セミコロン等） */
function BraceAnnotation({
  label,
  alignEnd = false,
}: {
  label: string;
  alignEnd?: boolean;
}) {
  return (
    <div
      className={`slide-anno slide-anno-brace${alignEnd ? " is-end" : ""}`}
      aria-hidden="true"
    >
      <svg className="slide-anno-brace-svg" viewBox="0 0 120 64" fill="none">
        <path
          d="M18 2 C18 16, 6 22, 6 32 C6 42, 18 48, 18 62"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M18 62 C36 58, 58 52, 88 48"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M78 40 L90 48 L78 52"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="slide-anno-label">{label}</span>
    </div>
  );
}

/** 出力テキスト下の波線から右へ伸びる関係矢印（Progate風） */
function WaveAnnotation({ label }: { label: string }) {
  return (
    <div className="slide-anno slide-anno-wave" aria-hidden="true">
      <svg
        className="slide-anno-wave-pointer"
        viewBox="0 0 280 54"
        fill="none"
        preserveAspectRatio="xMinYMid meet"
      >
        <path
          d="M4 10 Q10 2 16 10 T28 10 T40 10 T52 10 T64 10 T76 10 T88 10 T100 10"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <path
          d="M100 10 C100 22, 112 28, 132 28 L210 28"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <path
          d="M200 20 L212 28 L200 36"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="slide-anno-label">{label}</span>
    </div>
  );
}

/** コメント未実行を示す破線枠＋矢印 */
function DashAnnotation({ label }: { label: string }) {
  return (
    <div className="slide-anno slide-anno-dash" aria-hidden="true">
      <div className="slide-anno-dash-row">
        <div className="slide-anno-dash-box" />
        <svg className="slide-anno-dash-arrow" viewBox="0 0 80 36" fill="none">
          <path
            d="M4 18 L60 18"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeDasharray="5 4"
          />
          <path
            d="M50 10 L62 18 L50 26"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="slide-anno-label">{label}</span>
      </div>
    </div>
  );
}

/** 複数行の引用符をまとめて指す縦ブラケット＋矢印 */
function CircleGuide({ label }: { label: string }) {
  return (
    <div className="slide-anno slide-anno-circle-guide" aria-hidden="true">
      <svg className="slide-anno-span-brace" viewBox="0 0 100 72" fill="none">
        <path
          d="M22 4 C8 4, 4 18, 4 36 C4 54, 8 68, 22 68"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M22 36 L72 36"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M62 28 L74 36 L62 44"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="slide-anno-label">{label}</span>
    </div>
  );
}

/** コード窓 → コンソール窓の実行フロー矢印 */
export function SlidePanelFlowArrow() {
  return (
    <div className="slide-panel-flow" aria-hidden="true">
      <svg className="slide-panel-flow-svg" viewBox="0 0 56 48" fill="none">
        <path
          d="M4 24 H40"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M30 14 L42 24 L30 34"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>実行</span>
    </div>
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

  const circleCallouts = codeCallouts.filter(
    (callout) => resolveStyle(callout) === "circle",
  );
  const sharedCircleLabel =
    circleCallouts.length >= 2
      ? (circleCallouts.find((item) => item.label.includes("クォーテーション"))
          ?.label ?? circleCallouts[0]?.label)
      : undefined;
  const circleLines = new Set(
    circleCallouts
      .map((item) => item.line)
      .filter((line): line is number => line !== undefined),
  );

  const calloutByLine = new Map<number, SlideCallout[]>();
  for (const callout of codeCallouts) {
    if (callout.line === undefined) continue;
    if (sharedCircleLabel && resolveStyle(callout) === "circle") continue;
    const list = calloutByLine.get(callout.line) ?? [];
    list.push(callout);
    calloutByLine.set(callout.line, list);
  }

  const midInsert =
    sharedCircleLabel && circleLines.size >= 2
      ? Math.min(...circleLines)
      : undefined;

  return (
    <section className="slide-code-panel" aria-label={`${label}のコード`}>
      <header className="slide-code-panel-bar">
        <span className="slide-code-panel-tab">
          {label}
          <span aria-hidden="true">×</span>
        </span>
      </header>
      <div className="slide-code-panel-body">
        {lines.map((line, index) => {
          const lineCallouts = calloutByLine.get(index) ?? [];
          const circleOnLine = circleLines.has(index);
          const primary = lineCallouts[0];
          const style = primary
            ? resolveStyle(primary)
            : circleOnLine
              ? "circle"
              : undefined;
          const token =
            primary?.token ??
            (circleOnLine
              ? circleCallouts.find((item) => item.line === index)?.token
              : undefined);
          const highlighted =
            active.size === 0
              ? ""
              : active.has(index)
                ? " is-active"
                : " is-muted";

          return (
            <div key={`${index}-${line}`}>
              <div className="slide-code-line-wrap">
                <div className={`slide-code-line${highlighted}`}>
                  {highlightToken(line || " ", token, style)}
                </div>
                {lineCallouts.map((callout) => {
                  const kind = resolveStyle(callout);
                  if (kind === "brace") {
                    return (
                      <BraceAnnotation
                        key={`${callout.label}-${callout.token ?? ""}`}
                        label={callout.label}
                        alignEnd={callout.token === ";"}
                      />
                    );
                  }
                  return (
                    <p
                      key={`${callout.label}-${callout.token ?? ""}`}
                      className="slide-anno-label is-plain"
                    >
                      {callout.label}
                    </p>
                  );
                })}
              </div>
              {midInsert === index && sharedCircleLabel ? (
                <CircleGuide label={sharedCircleLabel} />
              ) : null}
            </div>
          );
        })}
        {codeCallouts
          .filter((callout) => callout.line === undefined)
          .map((callout) => (
            <p
              key={callout.label}
              className="slide-anno-label is-plain is-global"
            >
              {callout.label}
            </p>
          ))}
      </div>
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
  const dashCallouts = consoleCallouts.filter(
    (callout) => resolveStyle(callout) === "dash",
  );
  const waveByLine = new Map<number, SlideCallout[]>();
  for (const callout of consoleCallouts) {
    if (resolveStyle(callout) === "dash") continue;
    const line = callout.line ?? 0;
    const list = waveByLine.get(line) ?? [];
    list.push(callout);
    waveByLine.set(line, list);
  }

  return (
    <section className="slide-console-panel" aria-label="コンソール出力">
      <header className="slide-console-panel-bar">
        <span>{">_"} コンソール</span>
      </header>
      <div className="slide-console-panel-body">
        {dashCallouts.map((callout) => (
          <DashAnnotation key={callout.label} label={callout.label} />
        ))}
        {lines.map((line, index) => {
          const lineCallouts = waveByLine.get(index);
          return (
            <div key={`${index}-${line}`} className="slide-console-line-wrap">
              <span
                className={`slide-console-line${lineCallouts?.length ? " is-annotated" : ""}`}
              >
                {line}
              </span>
              {lineCallouts?.map((callout) => (
                <WaveAnnotation key={callout.label} label={callout.label} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
