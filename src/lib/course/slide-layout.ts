import type {
  ConversationPage,
  Lesson,
  Question,
  Slide,
  TalkLine,
} from "@/lib/course/types";

type SlideListing = {
  readonly code: string;
};

export type SlideLayout = "explain" | "talk" | "hero";

export function slideLayout(
  slide: Slide,
  context?: { slideIndex?: number },
): SlideLayout {
  if (slide.layout) return slide.layout;
  // storyTalk だけでは talk 固定にしない（会話のあと解説へ進める）
  if (context?.slideIndex === 0 && !isSummarySlide(slide)) return "hero";
  return "explain";
}

export function isSummarySlide(slide: Slide): boolean {
  return slide.title.includes("要点");
}

const SYNC_STOP_WORDS = new Set([
  "JavaScript",
  "TypeScript",
  "Node",
  "true",
  "false",
  "const",
  "let",
  "function",
  "return",
]);

function synchronizeConversationPages(
  slide: Slide,
  pages: ConversationPage[],
  listing: SlideListing,
): ConversationPage[] {
  const code = slide.code ?? listing.code;
  const codeLines = code.split("\n");
  return pages.map((page) => {
    if (page.focus === "story" || page.focus === "vocabulary" || page.focus === "summary") {
      return page;
    }
    const point =
      page.pointIndex === undefined ? "" : (slide.points?.[page.pointIndex] ?? "");
    const spoken = `${page.lines.map((line) => line.text).join(" ")} ${point}`;
    const terms = [
      ...new Set(
        (spoken.match(/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/g) ?? [])
          .filter((term) => term.length > 1 && !SYNC_STOP_WORDS.has(term)),
      ),
    ];
    const scores = codeLines.map((line) =>
      terms.reduce((score, term) => score + (line.includes(term) ? term.length : 0), 0),
    );
    const maxScore = Math.max(0, ...scores);
    const executableLines = codeLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.trim() && !line.trim().startsWith("//"))
      .map(({ index }) => index);
    const activeCodeLines =
      maxScore > 0
        ? scores
            .map((score, index) => ({ score, index }))
            .filter(({ score }) => score === maxScore)
            .slice(0, 2)
            .map(({ index }) => index)
        : page.focus === "point" && page.pointIndex !== undefined
          ? [executableLines[Math.min(page.pointIndex, executableLines.length - 1)]]
              .filter((index): index is number => index !== undefined)
          : [];
    if (activeCodeLines.length === 0) return page;
    return {
      ...page,
      activeCodeLines,
      diagramStep: page.pointIndex ?? activeCodeLines[0],
    };
  });
}

function chunkTalkLines(lines: TalkLine[], focus: ConversationPage["focus"]) {
  const pages: ConversationPage[] = [];
  for (let index = 0; index < lines.length; index += 4) {
    pages.push({
      lines: lines.slice(index, index + 4),
      focus,
    });
  }
  return pages;
}

export function talkPages(
  slide: Slide,
  listing: SlideListing,
  context?: { slideIndex?: number },
): ConversationPage[] {
  const layout = slideLayout(slide, context);
  const storyLines = slide.storyTalk ?? [];
  const contentLines = slide.talk ?? [];

  if (layout === "talk") {
    const source =
      storyLines.length > 0 && contentLines.length > 0
        ? [...storyLines, ...contentLines]
        : storyLines.length > 0
          ? storyLines
          : contentLines;
    if (source.length === 0) {
      return [{ lines: [], focus: "story" }];
    }
    return synchronizeConversationPages(
      slide,
      chunkTalkLines(source, "story"),
      listing,
    );
  }

  if (layout === "explain" || layout === "hero") {
    const explainPage: ConversationPage = {
      lines: [],
      focus: isSummarySlide(slide) ? "summary" : "intro",
    };
    const pages: ConversationPage[] = [
      ...chunkTalkLines(storyLines, "story"),
      // つなぎ会話のあとに、そのスライド本来の会話も続ける
      ...chunkTalkLines(contentLines, "story"),
      explainPage,
    ];
    return synchronizeConversationPages(slide, pages, listing);
  }

  return synchronizeConversationPages(
    slide,
    [{ lines: [], focus: "intro" }],
    listing,
  );
}

export function talkLines(slide: Slide, listing: SlideListing): TalkLine[] {
  return talkPages(slide, listing).flatMap((page) => page.lines);
}

export function teachingSlideEntries(lesson: Lesson) {
  return lesson.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => !isSummarySlide(slide));
}

export function questionForSlide(
  lesson: Lesson,
  slideIndex: number,
): Question | undefined {
  const tagged = lesson.questions.find((item) => item.slide === slideIndex);
  if (tagged) return tagged;
  const unit = teachingSlideEntries(lesson).findIndex(
    (entry) => entry.index === slideIndex,
  );
  return unit >= 0 ? lesson.questions[unit] : undefined;
}

export function nextSlideIndex(
  lesson: Lesson,
  from: number,
): number | undefined {
  if (from + 1 < lesson.slides.length) return from + 1;
  return undefined;
}

export function quizUnitIndex(lesson: Lesson, slideIndex: number): number {
  const unit = teachingSlideEntries(lesson).findIndex(
    (entry) => entry.index === slideIndex,
  );
  return unit < 0 ? 0 : unit;
}
