import type { Question, Track } from "./course/types.ts";
import { grade } from "./grade.ts";
import { runStudentJs } from "./run-js.ts";

const FUNCTION_DECLARATION =
  /function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)|(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>/g;

function expectedOutput(question: Question): string[] | undefined {
  if (!question.sample?.trim()) return undefined;
  return question.sample.replace(/\r\n/g, "\n").split("\n");
}

function sameOutput(actual: string[], expected: string[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every((line, index) => line === expected[index])
  );
}

function numericProbeSource(answer: string): string {
  const probes: string[] = [];
  for (const match of answer.matchAll(FUNCTION_DECLARATION)) {
    const name = match[1] ?? match[3];
    const params = (match[2] ?? match[4] ?? match[5] ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!name || params.length === 0 || params.length > 3) continue;

    const numericCall = new RegExp(
      `\\b${name}\\s*\\(\\s*-?\\d+(?:\\.\\d+)?(?:\\s*,\\s*-?\\d+(?:\\.\\d+)?){${params.length - 1}}\\s*\\)`,
    );
    if (!numericCall.test(answer)) continue;

    const args = Array.from({ length: params.length }, (_, index) =>
      String(index % 2 === 0 ? index + 7 : -(index + 3)),
    );
    probes.push(
      `console.log("__course_probe__ ${name}", ${name}(${args.join(", ")}));`,
    );
  }
  return probes.join("\n");
}

export async function gradeCodeByBehavior(
  question: Question,
  raw: string,
  track: Track,
): Promise<boolean> {
  if (question.kind !== "code" || track === "ts") return grade(question, raw);

  const output = expectedOutput(question);
  if (!output) return grade(question, raw);

  const studentResult = await runStudentJs(raw);
  if (studentResult.error || !sameOutput(studentResult.logs, output)) return false;

  const probes = numericProbeSource(question.answer);
  if (!probes) return true;

  const [studentProbe, expectedProbe] = await Promise.all([
    runStudentJs(`${raw}\n${probes}`),
    runStudentJs(`${question.answer}\n${probes}`),
  ]);
  if (studentProbe.error || expectedProbe.error) return false;
  return sameOutput(studentProbe.logs, expectedProbe.logs);
}
