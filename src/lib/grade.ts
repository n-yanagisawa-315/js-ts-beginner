import type { Question } from "@/lib/course/types";

export function stripCodeNoise(value: string) {
  let result = "";
  let quote = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];

    if (quote) {
      result += char;
      if (char === "\\") {
        result += next ?? "";
        index += 1;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      result += char;
      continue;
    }
    if (char === "/" && next === "/") {
      while (index < value.length && value[index] !== "\n") index += 1;
      result += "\n";
      continue;
    }
    if (char === "/" && next === "*") {
      index += 2;
      while (
        index < value.length &&
        !(value[index] === "*" && value[index + 1] === "/")
      ) {
        if (value[index] === "\n") result += "\n";
        index += 1;
      }
      index += 1;
      continue;
    }
    result += char;
  }
  return result;
}

export function normalizeAnswer(value: string): string {
  let result = "";
  let quote = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === "\\") {
        result += char + (value[index + 1] ?? "");
        index += 1;
      } else if (char === quote) {
        result += quote === "`" ? "`" : '"';
        quote = "";
      } else {
        result += char;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      result += char === "`" ? "`" : '"';
    } else if (!/\s/.test(char) && char !== ";") {
      result += char;
    }
  }
  return result;
}

export function normalizeShell(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function gradeShell(question: Question, raw: string): boolean {
  const given = normalizeShell(raw);
  const expected = normalizeShell(question.answer);
  if (given === expected) return true;
  if (question.aliases?.some((alias) => normalizeShell(alias) === given)) {
    return true;
  }
  if (expected === "node -v") {
    return given === "node --version";
  }
  return false;
}

export function grade(question: Question, raw: string): boolean {
  if (question.kind === "shell") return gradeShell(question, raw);

  if (
    question.kind === "code" &&
    question.id === "q6" &&
    question.prompt.includes("削除せず実行対象から外して")
  ) {
    const keepsCommentedLine =
      /^\s*\/\/\s*console\.log\((["'])B\1\);?\s*$/m.test(raw);
    if (!keepsCommentedLine) return false;
  }

  const given = normalizeAnswer(
    question.kind === "code" || question.kind === "order" ? stripCodeNoise(raw) : raw,
  );
  const expected = normalizeAnswer(
    question.kind === "code" || question.kind === "order"
      ? stripCodeNoise(question.answer)
      : question.answer,
  );

  if (question.id === "q3" && question.prompt.includes("こんにちは")) {
    return /^(let|const)message:string="こんにちは"$/.test(given);
  }
  if (expected === "node-v") {
    return given === "node-v" || given === "node--version";
  }
  if (expected === "(n:number)=>string") {
    return /^\([a-zA-Z_][\w]*:number\)=>string$/.test(given);
  }
  return given === expected;
}

export function mismatchLines(given: string, expected: string): number[] {
  const wanted = stripCodeNoise(expected)
    .split("\n")
    .map((line) => normalizeAnswer(line))
    .filter(Boolean);
  const errors = new Set<number>();
  let next = 0;
  const rows = given.split("\n");
  rows.forEach((line, index) => {
    const norm = normalizeAnswer(stripCodeNoise(line));
    if (!norm) return;
    if (next >= wanted.length || norm !== wanted[next]) errors.add(index);
    next += 1;
  });
  if (next !== wanted.length) {
    const last = rows.reduce(
      (found, line, index) =>
        normalizeAnswer(stripCodeNoise(line)) ? index : found,
      0,
    );
    errors.add(last);
  }
  return [...errors];
}

export function feedbackForIncorrectAnswer(
  question: Question,
  raw: string,
): string {
  if (question.kind === "shell") {
    const givenCommand = normalizeShell(raw).split(" ")[0] || "未入力";
    const expectedCommand = normalizeShell(question.answer).split(" ")[0];
    return `コマンドの先頭は「${givenCommand}」になっています。実行する道具が「${expectedCommand}」でよいか、続く引数と分けて確認してください。 ${question.explain}`;
  }
  if (question.kind === "order") {
    const given = raw.split("\n").map((line) => normalizeAnswer(line));
    const expected = question.answer
      .split("\n")
      .map((line) => normalizeAnswer(line));
    const mismatch = expected.findIndex((line, index) => given[index] !== line);
    return `先頭から${Math.max(0, mismatch) + 1}番目の処理で順序が分かれています。その行が必要とする値を、直前の行が作っているか確認してください。 ${question.explain}`;
  }
  if (question.kind === "code") {
    const lines = mismatchLines(raw, question.answer);
    const location =
      lines.length > 0
        ? `${lines.slice(0, 3).map((line) => line + 1).join("・")}行目`
        : "入力と出力";
    return `${location}を確認してください。名前・値・実行順のどこが完成例と異なるかを1つずつ切り分けます。 ${question.explain}`;
  }
  const normalized = normalizeAnswer(raw);
  return `入力した「${normalized || "未入力"}」は条件と一致しません。大文字・小文字、値の型、記号を設問の条件と照合してください。 ${question.explain}`;
}
