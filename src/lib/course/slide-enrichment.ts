import { DIAGRAM_LISTING } from "./diagram-listings";
import { resolveConsoleOutput } from "./console-preview";
import type { Lesson, Slide, SlideCallout } from "./types";

type EnrichContext = {
  lessonTitle: string;
  slideIndex: number;
};

function slideCode(slide: Slide): string | undefined {
  return (
    slide.code ??
    slide.codeExample ??
    DIAGRAM_LISTING[slide.diagram]?.code
  );
}

function haystack(slide: Slide): string {
  return [slide.title, slide.lead, ...(slide.points ?? []), slide.watch ?? "", slide.note ?? ""].join(
    "\n",
  );
}

function shortLabel(text: string, max = 56): string {
  const cleaned = text
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const punct = Math.max(
    cut.lastIndexOf("。"),
    cut.lastIndexOf("、"),
    cut.lastIndexOf("！"),
    cut.lastIndexOf("？"),
  );
  if (punct >= Math.floor(max * 0.45)) {
    return cleaned.slice(0, punct + 1);
  }
  return `${cleaned.slice(0, max - 1)}…`;
}

function firstMatchingLine(
  lines: string[],
  predicate: (line: string, index: number) => boolean,
): number {
  return lines.findIndex((line, index) => predicate(line, index));
}

function isCommentLine(row: string): boolean {
  const trimmed = row.trim();
  return (
    !trimmed ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("--") ||
    trimmed.startsWith("#")
  );
}

function firstCodeLine(lines: string[]): number {
  return firstMatchingLine(lines, (row) => !isCommentLine(row));
}

function pickToken(line: string, label?: string): string | undefined {
  // 注釈ラベルに含まれるコード断片があれば、それを優先（console.log への誤爆を防ぐ）
  if (label) {
    const fromLabel = [
      "Promise.resolve().then",
      "Promise.reject",
      "Promise.resolve",
      "Promise.allSettled",
      "Promise.all",
      "Promise.race",
      "setTimeout",
      "queueMicrotask",
      "console.log",
      ".then",
      ".catch",
      ".finally",
      ".bind",
      ".call",
      ".apply",
      ".includes",
      ".join",
      ".map",
      ".filter",
      ".reduce",
      "super",
      "static",
      "await",
      "async",
      "new",
      "this",
      "===",
    ].find((token) => label.includes(token) && line.includes(token));
    if (fromLabel) return fromLabel;
  }

  const patterns = [
    /\bPromise\.(?:resolve|reject|allSettled|all|race)\b/,
    /\.\b(?:bind|call|apply|includes|join|groupBy|map|filter|reduce|then|catch|finally)\b/,
    /\bconsole\.log\b/,
    /\?\?=|\?\?|\?\./,
    /\b(?:function|const|let|var|return|if|else|for|while|async|await|class|constructor|extends|super|static|import|export|typeof|instanceof|new|throw|try|catch|this|Promise|fetch|setTimeout)\b/,
    /\b(?:SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|CREATE|ALTER|COMMIT|ROLLBACK)\b/,
    /\b(?:git|npm|npx|node|gh)\b/,
    /===|!==|=>|\.\.\.|\+\+|--/,
    /[;=+\-*/<>!&|{}()[\]]/,
    /['"`]/,
  ];
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match?.[0]) return match[0];
  }
  const word = line.trim().match(/[A-Za-z_$\u3040-\u30ff\u4e00-\u9fff][\w$]*/);
  return word?.[0];
}

/** 注釈ラベルの用語に対応するコード行を選ぶ。見つからなければ -1 */
function bestLineForLabel(lines: string[], label: string): number {
  const cues: Array<{ label: RegExp; code: RegExp; preferLast?: boolean }> = [
    { label: /\bbind\b/i, code: /\.bind\b/ },
    { label: /\bcall\b/i, code: /\.call\b/ },
    { label: /\bapply\b/i, code: /\.apply\b/ },
    { label: /\bincludes\b/i, code: /\.includes\b/ },
    { label: /\bjoin\b/i, code: /\.join\b/ },
    { label: /\bgroupBy\b/i, code: /\.groupBy\b|Object\.groupBy\b/ },
    { label: /\?\?=|まだ無/, code: /\?\?=/ },
    { label: /\?\./, code: /\?\./ },
    { label: /\?\?|空なら|無いとき/, code: /\?\?(?!=)/ },
    // より具体的なキーワードを this / 先頭行より優先
    { label: /\bsuper\b/i, code: /\bsuper\b/ },
    { label: /\bstatic\b/i, code: /\bstatic\b/ },
    { label: /\bawait\b/i, code: /\bawait\b/ },
    { label: /\bcatch\b/i, code: /\bcatch\b|\.catch\b/ },
    { label: /\bthen\b/i, code: /\.then\b/ },
    { label: /fulfilled|rejected|pending|Promise/i, code: /\bPromise\b|\bfetch\b|\.then\b|\.catch\b/ },
    { label: /===/, code: /===/ },
    { label: /\bnew\b/i, code: /\bnew\b/ },
    { label: /\bthis\b/i, code: /\bthis\b/ },
    { label: /コールバック|戻りがキー/, code: /\([^)]*\)\s*=>/ },
  ];

  for (const cue of cues) {
    if (!cue.label.test(label)) continue;
    if (cue.preferLast) {
      for (let index = lines.length - 1; index >= 0; index -= 1) {
        const row = lines[index] ?? "";
        if (!isCommentLine(row) && cue.code.test(row)) return index;
      }
    } else {
      const line = firstMatchingLine(
        lines,
        (row) => cue.code.test(row) && !isCommentLine(row),
      );
      if (line >= 0) return line;
    }
  }

  return -1;
}

function resolveLabelLine(lines: string[], label: string, haystack: string): number {
  // 要点ラベルだけで決め、全文に引きずられて別用語へ飛ぶのを防ぐ
  const fromLabel = bestLineForLabel(lines, label);
  if (fromLabel >= 0) return fromLabel;
  const fromHaystack = bestLineForLabel(lines, haystack);
  if (fromHaystack >= 0) return fromHaystack;
  return firstCodeLine(lines);
}

function inferCallouts(
  slide: Slide,
  code: string,
  consoleOutput: string[] | undefined,
): SlideCallout[] {
  if (slide.callouts && slide.callouts.length > 0) return slide.callouts;

  const text = haystack(slide);
  const lines = code.split("\n");
  const callouts: SlideCallout[] = [];
  const push = (callout: SlideCallout) => {
    if (
      callouts.some(
        (item) =>
          item.label === callout.label &&
          item.line === callout.line &&
          item.token === callout.token &&
          (item.target ?? "code") === (callout.target ?? "code"),
      )
    ) {
      return;
    }
    callouts.push(callout);
  };

  if (/セミコロン/.test(text) || (/(?:文末|行末)/.test(text) && /;/.test(text))) {
    const line = firstMatchingLine(
      lines,
      (row) => /;/.test(row) && !isCommentLine(row),
    );
    if (line >= 0) {
      push({
        label: "文末にセミコロンをつける",
        line,
        token: ";",
        target: "code",
        style: "brace",
      });
    }
  }

  if (/コメント/.test(text)) {
    const line = firstMatchingLine(
      lines,
      (row) => /^\s*\/\//.test(row) || /^\s*--/.test(row),
    );
    if (line >= 0) {
      const token = lines[line]?.trim().startsWith("--") ? "--" : "//";
      push({
        label:
          token === "--"
            ? "「--」から行末まではコメントになる"
            : "文頭に「//」がある行はコメントになる",
        line,
        token,
        target: "code",
        style: "brace",
      });
    }
    if (consoleOutput && consoleOutput.length > 0) {
      push({
        label: "コメントは実行されない",
        target: "console",
        line: 0,
        style: "dash",
      });
    }
  }

  if (/引用符|クォーテーション|クォート|文字列を|シングル|ダブル/.test(text)) {
    const quoteLines = lines
      .map((row, index) => ({ row, index }))
      .filter(
        ({ row }) =>
          !isCommentLine(row) &&
          (/['"]/.test(row) || /`/.test(row)),
      )
      .slice(0, 2);
    for (const { row, index } of quoteLines) {
      const token = row.includes("'") && !row.includes('"') ? "'" : '"';
      push({
        label:
          "シングルクォーテーション（ ' ）かダブルクォーテーション（ \" ）で囲む",
        line: index,
        token,
        target: "code",
        style: "circle",
      });
    }
  }

  if (/\+|連結/.test(text) && /文字|文字列|連結/.test(text)) {
    const line = firstMatchingLine(
      lines,
      (row) => /\+/.test(row) && !isCommentLine(row),
    );
    if (line >= 0) {
      push({
        label: "「+」で文字列を連結する",
        line,
        token: "+",
        target: "code",
        style: "brace",
      });
    }
  }

  // Array#join を SQL の JOIN と誤認しない（case-insensitive \bJOIN\b は .join に当たる）
  const looksLikeSql =
    /\bSELECT\b/i.test(code) ||
    (/\bFROM\b/i.test(code) && /\bWHERE\b/i.test(code)) ||
    /(?:^|[\s(,])JOIN\b/i.test(code) ||
    /SQL|クエリ/.test(text);
  if (looksLikeSql) {
    const line = firstMatchingLine(
      lines,
      (row) =>
        /\b(?:SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE)\b/i.test(row) &&
        !/\.join\b/i.test(row) &&
        !isCommentLine(row),
    );
    if (line >= 0) {
      const row = lines[line] ?? "";
      const token =
        row.match(
          /\b(?:SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|CREATE|ALTER|COMMIT|ROLLBACK)\b/i,
        )?.[0] ?? "SELECT";
      push({
        label: shortLabel(slide.points?.[0] ?? `${token} を確認する`),
        line,
        token,
        target: "code",
        style: "brace",
      });
    }
  }

  if (/\bgit\b|\bnpm\b|\bgh\b/i.test(code) || /Git|コミット|ブランチ|リポジトリ/.test(text)) {
    const line = firstMatchingLine(
      lines,
      (row) => /\b(?:git|npm|npx|gh|node)\b/i.test(row) && !isCommentLine(row),
    );
    if (line >= 0) {
      const token =
        lines[line]?.match(/\b(?:git|npm|npx|gh|node)\b/i)?.[0] ?? "git";
      push({
        label: shortLabel(slide.points?.[0] ?? `${token} コマンドを確認する`),
        line,
        token,
        target: "code",
        style: "brace",
      });
    }
  }

  if (consoleOutput && consoleOutput.length > 0) {
    push({
      label: `「${consoleOutput[0]}」が出力（表示）される`,
      target: "console",
      line: 0,
      style: "wave",
    });
  }

  // まだ注釈がなければ、要点の用語に合う行へ付ける（先頭行への誤爆を避ける）
  if (callouts.length === 0) {
    const label = shortLabel(slide.points?.[0] ?? slide.title);
    const line = resolveLabelLine(lines, label, text);
    if (line >= 0) {
      const row = lines[line] ?? "";
      push({
        label,
        line,
        token: pickToken(row, label),
        target: "code",
        style: "brace",
      });
    }
  }

  // コード注釈が無くコンソールだけある場合も、コード側に1本足す
  if (
    callouts.every((item) => item.target === "console") &&
    firstCodeLine(lines) >= 0
  ) {
    const label = shortLabel(slide.points?.[0] ?? slide.title);
    const line = resolveLabelLine(lines, label, text);
    const row = lines[line] ?? "";
    push({
      label,
      line,
      token: pickToken(row, label),
      target: "code",
      style: "brace",
    });
  }

  return callouts.slice(0, 3);
}

/** token が指定行に無いとき、実際に含まれる行へ付け直す */
function normalizeCallouts(
  code: string,
  callouts: SlideCallout[],
): SlideCallout[] {
  const lines = code.split("\n");
  return callouts.map((callout) => {
    if ((callout.target ?? "code") !== "code") return callout;
    if (callout.line === undefined || !callout.token) return callout;
    const current = lines[callout.line] ?? "";
    if (current.includes(callout.token)) return callout;
    const found = lines.findIndex(
      (row, index) =>
        !isCommentLine(row) &&
        row.includes(callout.token!) &&
        index !== callout.line,
    );
    if (found >= 0) return { ...callout, line: found };
    // トークンがどの行にも無いなら、ラベルから行を再推定
    const guessed = resolveLabelLine(lines, callout.label, callout.label);
    if (guessed >= 0) {
      const row = lines[guessed] ?? "";
      return {
        ...callout,
        line: guessed,
        token: row.includes(callout.token)
          ? callout.token
          : (pickToken(row, callout.label) ?? callout.token),
      };
    }
    return callout;
  });
}

export function enrichSlide(slide: Slide, context: EnrichContext): Slide {
  const code = slideCode(slide);
  const consoleOutput = resolveConsoleOutput(slide.consoleOutput, code);
  const inferred = code
    ? inferCallouts(slide, code, consoleOutput)
    : (slide.callouts ?? []);
  const callouts =
    code && inferred.length > 0 ? normalizeCallouts(code, inferred) : inferred;

  return {
    ...slide,
    section: slide.section ?? context.lessonTitle,
    consoleOutput:
      consoleOutput && consoleOutput.length > 0
        ? consoleOutput
        : slide.consoleOutput,
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
