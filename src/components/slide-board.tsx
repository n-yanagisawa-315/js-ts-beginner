import { Fragment } from "react";
import { TalkAvatar } from "@/components/talk-avatar";
import {
  SlideCodePanel,
  SlideConsolePanel,
  SlidePanelFlowArrow,
} from "@/components/slide-panels";
import { resolveConsoleOutput } from "@/lib/course/console-preview";
import {
  isSummarySlide,
  slideLayout,
  talkPages,
} from "@/lib/course/slide-layout";
import type { ResolvedSlideDTO } from "@/lib/course/client-dtos";
import type { ConversationPage } from "@/lib/course/types";

const INLINE_TOKEN =
  /(`[^`]+`|「[^」]+」|\b(?:true|false|null|undefined|if|else|for|while|return|const|let|var|function|class|constructor|this|new|extends|super|static|typeof|instanceof|async|await|Promise|pending|fulfilled|rejected|then|catch|finally|resolve|reject|fetch|onOk|onNg|allSettled|queueMicrotask|forEach|Node|JavaScript|TypeScript|SQL|SELECT|WHERE|JOIN|Git|GitHub|commit|branch|npm|npx|LTS|stdout|stderr)\b)/g;
const KEYWORD_TOKEN =
  /^(?:true|false|null|undefined|if|else|for|while|return|const|let|var|function|class|constructor|this|new|extends|super|static|typeof|instanceof|async|await|Promise|pending|fulfilled|rejected|then|catch|finally|resolve|reject|fetch|onOk|onNg|allSettled|queueMicrotask|forEach|Node|JavaScript|TypeScript|SQL|SELECT|WHERE|JOIN|Git|GitHub|commit|branch|npm|npx|LTS|stdout|stderr)$/;

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
          <Fragment key={`${part}-${index}`}>{part}</Fragment>
        );
      })}
    </>
  );
}

function SlideSources({
  sources,
}: {
  sources: ResolvedSlideDTO["sources"];
}) {
  if (sources.length === 0) return null;
  return (
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
  );
}

function ExplainVisual({
  slide,
  listing,
  consoleLines,
}: {
  slide: ResolvedSlideDTO;
  listing: ResolvedSlideDTO["listings"][number] | undefined;
  consoleLines: string[] | undefined;
}) {
  if (!listing) return null;

  // 実行結果が分かるときだけ左右対比＋実行矢印。不要なスライドはコード窓＋注釈のみ
  if (consoleLines && consoleLines.length > 0) {
    return (
      <div className="slide-dual-panels has-flow">
        <SlideCodePanel
          label={listing.label}
          code={listing.code}
          callouts={slide.callouts}
        />
        <SlidePanelFlowArrow />
        <SlideConsolePanel lines={consoleLines} callouts={slide.callouts} />
      </div>
    );
  }

  return (
    <div className="slide-dual-panels is-single">
      <SlideCodePanel
        label={listing.label}
        code={listing.code}
        callouts={slide.callouts}
      />
    </div>
  );
}

function ExplainBoard({
  slide,
  titleId,
  section,
}: {
  slide: ResolvedSlideDTO;
  titleId: string;
  section: string;
}) {
  const listing = slide.listings[0];
  const consoleLines = resolveConsoleOutput(
    slide.consoleOutput,
    listing?.code,
  );
  const summary = isSummarySlide(slide);

  return (
    <article className="slide-explain">
      <header className="slide-explain-header">
        <div className="slide-explain-titles">
          <p className="slide-section">{section}</p>
          <h2 id={titleId} className="slide-explain-title">
            <EmphasisText text={slide.title} />
          </h2>
        </div>
        <p className="slide-explain-lead">
          <EmphasisText text={slide.lead} />
        </p>
      </header>

      {summary && slide.points && slide.points.length > 0 ? (
        <ul className="slide-explain-points">
          {slide.points.map((point) => (
            <li key={point}>
              <EmphasisText text={point} />
            </li>
          ))}
        </ul>
      ) : null}

      <ExplainVisual
        slide={slide}
        listing={listing}
        consoleLines={consoleLines}
      />

      {slide.watch ? (
        <p className="slide-explain-watch">
          <span className="slide-explain-watch-label">注意</span>
          <span className="slide-explain-watch-body">
            <EmphasisText text={slide.watch} />
          </span>
        </p>
      ) : null}

      <SlideSources sources={slide.sources} />
    </article>
  );
}

function HeroBoard({
  slide,
  titleId,
  section,
}: {
  slide: ResolvedSlideDTO;
  titleId: string;
  section: string;
}) {
  const listing = slide.listings[0];
  const consoleLines = resolveConsoleOutput(
    slide.consoleOutput,
    listing?.code,
  );

  return (
    <article className="slide-hero">
      <header className="slide-hero-header">
        <p className="slide-section is-center">{section}</p>
        <h2 id={titleId} className="slide-hero-title">
          <EmphasisText text={slide.title} />
        </h2>
        <p className="slide-hero-lead">
          <EmphasisText text={slide.lead} />
        </p>
      </header>

      <div className="slide-hero-visual">
        <ExplainVisual
          slide={slide}
          listing={listing}
          consoleLines={consoleLines}
        />
      </div>

      <SlideSources sources={slide.sources} />
    </article>
  );
}

function TalkBoard({
  titleId,
  pages,
  pageIndex,
  section,
}: {
  titleId: string;
  pages: ConversationPage[];
  pageIndex: number;
  section: string;
}) {
  const page =
    pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0];

  return (
    <article className="slide-talk">
      <header className="slide-talk-header">
        <h2 id={titleId} className="slide-talk-title">
          {section}
        </h2>
        {pages.length > 1 ? (
          <p className="talk-progress">
            会話 {Math.min(pageIndex + 1, pages.length)} / {pages.length}
          </p>
        ) : null}
      </header>
      <ol className="slide-talk-thread" aria-label="初心者とエンジニアの会話">
        {page?.lines.map((line, index) => (
          <li
            key={`${line.speaker}-${index}-${line.text.slice(0, 20)}`}
            className={`slide-talk-line is-${line.speaker}`}
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
    </article>
  );
}

export function SlideBoard({
  slide,
  titleId,
  pages,
  pageIndex,
  section,
  slideIndex = 0,
}: {
  slide: ResolvedSlideDTO;
  titleId: string;
  pages?: ConversationPage[];
  pageIndex: number;
  section?: string;
  slideIndex?: number;
}) {
  const listings = slide.listings;
  const resolvedSection = slide.section ?? section ?? "講義";
  const layout = slideLayout(slide, { slideIndex });
  const resolvedPages =
    pages ?? talkPages(slide, listings[0], { slideIndex });
  const page =
    resolvedPages[Math.min(pageIndex, resolvedPages.length - 1)] ??
    resolvedPages[0];
  const showingTalk = (page?.lines.length ?? 0) > 0;

  if (layout === "talk" || showingTalk) {
    return (
      <TalkBoard
        titleId={titleId}
        pages={resolvedPages}
        pageIndex={pageIndex}
        section={resolvedSection}
      />
    );
  }

  if (layout === "hero") {
    return (
      <HeroBoard
        slide={slide}
        titleId={titleId}
        section={resolvedSection}
      />
    );
  }

  return (
    <ExplainBoard
      slide={slide}
      titleId={titleId}
      section={resolvedSection}
    />
  );
}
