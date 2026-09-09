import type { Question, Track } from "./course/types.ts";
import { grade, hasRequiredSemicolons } from "./grade.ts";
import type { RuntimeEvidence } from "./grade-question.ts";

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

async function gradeBehaviorCases(
  question: Question,
  raw: string,
): Promise<boolean | undefined> {
  if (!question.behaviorCases?.length) return undefined;
  const functionName = [...question.answer.matchAll(FUNCTION_DECLARATION)]
    .map((match) => match[1] ?? match[3])
    .find(Boolean);
  if (!functionName) return false;

  const probes = question.behaviorCases
    .map((test, index) => {
      const args = JSON.stringify(test.args ?? []);
      const invocation = challengeInvocation(
        question.id,
        functionName,
        args,
      );
      return `console.log("__course_case_${index}__" + JSON.stringify(await (${invocation})));`;
    })
    .join("\n");
  const { runStudentJs } = await import("./run-js.ts");
  const result = await runStudentJs(`${raw}\n${probes}`);
  if (result.error) return false;
  return question.behaviorCases.every((test, index) => {
    const actual = result.logs.find((line) =>
      line.startsWith(`__course_case_${index}__`),
    );
    const prefix = `__course_case_${index}__`;
    if (test.expectedLogs) {
      if (!actual) return false;
      try {
        const values = JSON.parse(actual.slice(prefix.length)) as string[];
        let cursor = 0;
        return test.expectedLogs.every((expected) => {
          const found = values.indexOf(expected, cursor);
          if (found < 0) return false;
          cursor = found + 1;
          return true;
        });
      } catch {
        return false;
      }
    }
    const expected = expectedForCase(question.id, test.expected);
    return actual === `${prefix}${JSON.stringify(expected)}`;
  });
}

function expectedForCase(questionId: string, expected: unknown) {
  if (questionId === "js-challenge-immutable-status") {
    return { value: expected, sameReference: false };
  }
  if (
    questionId === "js-challenge-immutable-line" ||
    questionId === "js-challenge-immutable-remove"
  ) {
    return { value: expected, originalUnchanged: true };
  }
  return expected;
}

function challengeInvocation(
  questionId: string,
  functionName: string,
  args: string,
): string {
  switch (questionId) {
    case "js-challenge-immutable-status":
      return `(() => { const input = ${args}[0]; const value = ${functionName}(input); return { value, sameReference: value === input }; })()`;
    case "js-challenge-immutable-line":
    case "js-challenge-immutable-remove":
      return `(() => { const input = ${args}[0]; const before = JSON.stringify(input); const value = ${functionName}(...${args}); return { value, originalUnchanged: JSON.stringify(input) === before }; })()`;
    case "js-challenge-closure-number":
      return `(() => { const next = ${functionName}(...${args}); return [next(), next()]; })()`;
    case "js-challenge-closure-discount":
      return `(() => { const values = ${args}; return ${functionName}(values[0])(values[1]); })()`;
    case "js-challenge-closure-cart":
      return `(() => { const cart = ${functionName}(); return ${args}[0].map((amount) => cart.add(amount)); })()`;
    case "js-challenge-async-sequence":
      return `(async () => { globalThis.fetchOrder = async (id) => ({ id }); globalThis.saveOrder = async () => {}; return ${functionName}(...${args}); })()`;
    case "js-challenge-async-parallel":
      return `(async () => { globalThis.getStock = async () => 3; globalThis.getSlots = async () => ["午前"]; return ${functionName}(...${args}); })()`;
    case "js-challenge-async-finally":
      return `(async () => { const events = []; globalThis.setLoading = (value) => events.push(String(value)); globalThis.sendOrder = async (order) => { if (order.id === "fail") throw new Error("fail"); return order; }; try { await ${functionName}(...${args}); } catch {} return events; })()`;
    case "node-challenge-path-safe":
      return `(() => { const values = ${args}; return ${functionName}(values[0], values[1], { join: (...parts) => parts.join("/") }); })()`;
    case "node-challenge-fs-json":
      return `${functionName}(${args}[0], { readFile: async () => '{"id":"o1"}' })`;
    case "node-challenge-fs-write":
      return `(async () => { const events = []; const values = ${args}; await ${functionName}(values[0], values[1], { writeFile: async () => events.push("written") }); return events; })()`;
    case "node-challenge-io-parallel":
      return `${functionName}(${args}[0], async (file) => ({ id: file.replace(".json", "") }))`;
    case "node-challenge-io-settled":
      return `${functionName}(${args}[0], async (file) => { if (file.startsWith("missing")) throw new Error("missing"); return { id: file.replace(".json", "") }; })`;
    case "node-challenge-io-cleanup":
      return `(async () => { const events = []; const id = ${args}[0]; const lockApi = { acquire: async (value) => events.push("acquire:" + value), release: async (value) => events.push("release:" + value) }; const task = async () => { events.push("task"); if (id === "fail") throw new Error("fail"); }; try { await ${functionName}(id, lockApi, task); } catch {} return events; })()`;
    case "node-challenge-http-json":
    case "node-challenge-http-not-found":
      return `(() => { const events = []; const values = ${args}; const res = { set statusCode(value) { events.push(String(value)); }, setHeader: (_name, value) => events.push(String(value)), end: (body) => { if (body) events.push(String(body)); events.push("end"); } }; ${functionName}(res, values[1]); return events; })()`;
    case "node-challenge-http-error":
      return `(async () => { const events = []; const values = ${args}; const res = { set statusCode(value) { events.push(String(value)); }, end: () => events.push("end") }; const load = values[1] === "reject" ? async () => { throw new Error("fail"); } : async () => ({ id: "o1" }); await ${functionName}(res, load); return events; })()`;
    default:
      return `${functionName}(...${args})`;
  }
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
  evidence?: RuntimeEvidence,
): Promise<boolean> {
  if (question.kind !== "code" || track === "ts") return grade(question, raw);
  const behaviorResult = await gradeBehaviorCases(question, raw);
  if (behaviorResult !== undefined) return behaviorResult;
  if (!hasRequiredSemicolons(question.answer, raw)) return false;
  if (question.runtime === "dom") {
    if (
      evidence?.runtime === "dom" &&
      evidence.source === raw
    ) {
      return evidence.result.passed;
    }
    const { runDomQuestion } = await import("./run-dom.ts");
    const result = await runDomQuestion(question, raw);
    return result.passed;
  }

  const output = expectedOutput(question);
  if (!output) return grade(question, raw);

  const { runStudentJs } = await import("./run-js.ts");
  const studentResult =
    evidence?.runtime === "js" && evidence.source === raw
      ? evidence.result
      : await runStudentJs(raw);
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
