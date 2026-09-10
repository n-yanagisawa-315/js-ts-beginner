import { previewConsoleOutput } from "./console-preview";
import type { Lesson, Slide, SlideCallout } from "./types";

type EnrichContext = {
  lessonTitle: string;
  slideIndex: number;
};

function slideCode(slide: Slide): string | undefined {
  return slide.code ?? slide.codeExample;
}

function haystack(slide: Slide): string {
  return [slide.title, slide.lead, ...(slide.points ?? []), slide.watch ?? "", slide.note ?? ""].join(
    "\n",
  );
}

function firstMatchingLine(
  lines: string[],
  predicate: (line: string) => boolean,
): number {
  return lines.findIndex((line) => predicate(line));
}

function inferCallouts(slide: Slide, code: string): SlideCallout[] {
  if (slide.callouts && slide.callouts.length > 0) return slide.callouts;

  const text = haystack(slide);
  const lines = code.split("\n");
  const callouts: SlideCallout[] = [];
  const push = (callout: SlideCallout) => {
    if (callouts.some((item) => item.label === callout.label)) return;
    callouts.push(callout);
  };

  if (/セミコロン/.test(text) || (/(?:文末|行末)/.test(text) && /;/.test(text))) {
    const line = firstMatchingLine(
      lines,
      (row) => /;/.test(row) && !row.trim().startsWith("//") && !row.trim().startsWith("*"),
    );
    if (line >= 0) {
      push({
        label: "文末にセミコロンをつける",
        line,
        token: ";",
        target: "code",
      });
    }
  }

  if (/コメント/.test(text) || /\/\/|\/\*/.test(text)) {
    const line = firstMatchingLine(lines, (row) => /^\s*\/\//.test(row));
    if (line >= 0) {
      push({
        label: "文頭に「//」がある行はコメントになる",
        line,
        token: "//",
        target: "code",
      });
    }
    const outputs = previewConsoleOutput(code);
    if (outputs && outputs.length > 0) {
      push({
        label: "コメントは実行されない",
        target: "console",
        line: 0,
      });
    }
  }

  if (/引用符|クォーテーション|クォート|文字列を/.test(text) || /シングル|ダブル/.test(text)) {
    const line = firstMatchingLine(
      lines,
      (row) =>
        /console\.log\s*\(/.test(row) &&
        (/['"]/.test(row) || /`/.test(row)) &&
        !row.trim().startsWith("//"),
    );
    if (line >= 0) {
      const row = lines[line] ?? "";
      const token = row.includes("'") && !row.includes('"') ? "'" : '"';
      push({
        label: "シングルクォーテーション（ ' ）かダブルクォーテーション（ \" ）で囲む",
        line,
        token,
        target: "code",
      });
    }
  }

  if (/console\.log|出力（表示）|コンソールに出力|窓から見せる|画面に出/.test(text)) {
    const outputs = previewConsoleOutput(code);
    if (outputs && outputs.length > 0) {
      push({
        label: `「${outputs[0]}」が出力（表示）される`,
        target: "console",
        line: 0,
      });
    }
  }

  if (/\+|連結/.test(text) && /文字/.test(text)) {
    const line = firstMatchingLine(
      lines,
      (row) => /\+/.test(row) && /console\.log/.test(row) && !row.trim().startsWith("//"),
    );
    if (line >= 0) {
      push({
        label: "「+」で文字列を連結する",
        line,
        token: "+",
        target: "code",
      });
    }
  }

  return callouts.slice(0, 3);
}

export function enrichSlide(slide: Slide, context: EnrichContext): Slide {
  const code = slideCode(slide);
  const consoleOutput =
    slide.consoleOutput ??
    (code ? previewConsoleOutput(code) : undefined);
  const callouts = code ? inferCallouts(slide, code) : (slide.callouts ?? []);

  return {
    ...slide,
    section: slide.section ?? context.lessonTitle,
    consoleOutput: consoleOutput && consoleOutput.length > 0 ? consoleOutput : slide.consoleOutput,
    callouts: callouts.length > 0 ? callouts : slide.callouts,
    layout:
      slide.layout ??
      (context.slideIndex === 0 && !slide.title.includes("要点")
        ? "hero"
        : undefined),
  };
}

export function enrichLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    slides: lesson.slides.map((slide, slideIndex) =>
      enrichSlide(slide, {
        lessonTitle: lesson.title,
        slideIndex,
      }),
    ),
  };
}

export function enrichLessons(lessons: Lesson[]): Lesson[] {
  return lessons.map(enrichLesson);
}
