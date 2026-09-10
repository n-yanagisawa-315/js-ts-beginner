import { CodeHighlight } from "@/components/code-highlight";
import { Diagram } from "@/components/diagram";
import { TalkAvatar } from "@/components/talk-avatar";
import { isSummarySlide, talkPages } from "@/lib/course/slide-layout";
import type { ResolvedSlideDTO } from "@/lib/course/client-dtos";
import type { ConversationPage } from "@/lib/course/types";

const INLINE_TOKEN =
  /(`[^`]+`|「[^」]+」|\b(?:true|false|null|undefined|if|else|for|while|return|const|let|function|async|await|Promise|Node|JavaScript|TypeScript|SQL|SELECT|WHERE|JOIN|Git|GitHub|commit|branch|npm|npx|LTS|stdout|stderr)\b)/g;
const KEYWORD_TOKEN =
  /^(?:true|false|null|undefined|if|else|for|while|return|const|let|function|async|await|Promise|Node|JavaScript|TypeScript|SQL|SELECT|WHERE|JOIN|Git|GitHub|commit|branch|npm|npx|LTS|stdout|stderr)$/;
const STORY_BEAT_LABEL = {
  problem: "今回の作業",
  prediction: "予想する",
  trace: "動きを追う",
  resolution: "解決する",
  transfer: "別の場面へ",
} as const;

function inlineParts(text: string) {
  let offset = 0;
  return text.split(INLINE_TOKEN).map((part, index) => {
    const start = offset;
    offset += part.length;
    return { index, part, start };
  });
}

function EmphasisText({
  text,
  strongFirst = false,
}: {
  text: string;
  strongFirst?: boolean;
}) {
  const firstBreak = strongFirst ? text.search(/[。！？]/) : -1;
  const leadEnd = firstBreak >= 0 ? firstBreak + 1 : 0;

  return (
    <>
      {inlineParts(text).map(({ index, part, start }) => {
        if (!part) return null;
        const isLead = leadEnd > 0 && start < leadEnd;
        const isCode = part.startsWith("`") && part.endsWith("`");
        const isQuote = part.startsWith("「") && part.endsWith("」");
        const value = isCode ? part.slice(1, -1) : part;
        if (isCode) {
          return (
            <code key={`${part}-${index}`} className="slide-inline-code">
              {value}
            </code>
          );
        }
        if (isQuote || KEYWORD_TOKEN.test(part)) {
          return (
            <strong key={`${part}-${index}`} className="slide-keyword">
              {value}
            </strong>
          );
        }
        return isLead ? (
          <strong key={`${part}-${index}`} className="slide-lead-strong">
            {part}
          </strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

export function SlideBoard({
  slide,
  titleId,
  pages,
  pageIndex,
}: {
  slide: ResolvedSlideDTO;
  titleId: string;
  pages?: ConversationPage[];
  pageIndex: number;
}) {
  const listings = slide.listings;
  const summary = isSummarySlide(slide);
  const resolvedPages = pages ?? talkPages(slide, listings[0]);
  const page =
    resolvedPages[Math.min(pageIndex, resolvedPages.length - 1)] ??
    resolvedPages[0];
  const finalPage = pageIndex >= resolvedPages.length - 1;
  const sources = slide.sources;

  return (
    <article className="grid gap-8 py-2 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <div>
        {!summary && slide.storyContext && slide.storyBeat ? (
          <aside className="story-ribbon" aria-label="今回の物語">
            <span>{STORY_BEAT_LABEL[slide.storyBeat]}</span>
            <p>{slide.storyContext}</p>
          </aside>
        ) : null}
        <p className="kicker">{summary ? "要点" : "講義"}</p>
        <h2
          id={titleId}
          className="mt-3 font-serif text-3xl font-medium leading-[1.25] tracking-tight sm:text-4xl"
        >
          <EmphasisText text={slide.title} />
        </h2>
        <p className="talk-progress">
          会話 {Math.min(pageIndex + 1, resolvedPages.length)} /{" "}
          {resolvedPages.length}
        </p>
        <ol className="talk-thread" aria-label="初心者とエンジニアの会話">
          {page?.lines.map((line, index) => (
            <li
              key={`${line.speaker}-${index}-${line.text.slice(0, 20)}`}
              className={`talk-line is-${line.speaker}`}
            >
              <div className="talk-person" aria-hidden="true">
                <TalkAvatar speaker={line.speaker} />
              </div>
              <div className="talk-content">
                <p className="sr-only">
                  {line.speaker === "engineer" ? "エンジニア" : "初心者"}
                </p>
                <div className="talk-bubble">
                  <EmphasisText
                    text={line.text}
                    strongFirst={line.speaker === "engineer"}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <figure>
          <figcaption className="kicker mb-2">
            {page?.focus === "point"
              ? "いま話している要点"
              : page?.focus === "story"
                ? "いまの作業"
                : "図解"}
          </figcaption>
          <div className="diagram-board">
            <Diagram
              id={slide.diagram}
              listing={listings[0]}
              title={slide.title}
              points={slide.points}
              activePoint={page?.focus === "point" ? page.pointIndex : undefined}
              activeStep={page?.diagramStep}
              activeCodeLines={page?.activeCodeLines}
            />
          </div>
        </figure>
        {finalPage ? listings.slice(1).map((listing) => (
          <figure key={`${listing.label}-${listing.code.slice(0, 24)}`}>
            <div className="listing">
              <div className="listing-label">
                <span>コード</span>
                <span>{listing.label}</span>
              </div>
              <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.85rem] leading-7">
                <CodeHighlight code={listing.code} />
              </pre>
            </div>
          </figure>
        )) : (
          <p className="talk-code-note">
            会話の最後に、図と対応するコードを確認できます。
          </p>
        )}
        <aside className="slide-sources" aria-label="この内容の公式資料">
          <p>公式資料で確かめる</p>
          <ul>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.publisher}</span>
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}
