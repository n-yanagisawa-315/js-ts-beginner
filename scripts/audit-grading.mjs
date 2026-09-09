import fs from "node:fs";
import {
  feedbackForIncorrectAnswer,
  grade,
  gradeShell,
} from "../src/lib/grade.ts";
import { gradeCodeByBehavior } from "../src/lib/grade-behavior.ts";
import { runStudentJs } from "../src/lib/run-js.ts";

const failures = [];
const codeQuestion = {
  id: "case-and-space",
  kind: "code",
  prompt: "",
  answer: 'const message = "hi ";',
};
const commentQuestion = {
  id: "q6",
  kind: "code",
  prompt: "Bを表示する処理は削除せず実行対象から外してください。",
  answer: 'console.log("A");\n// console.log("B");\nconsole.log("C");',
};
const shellQuestion = {
  id: "shell-case",
  kind: "shell",
  prompt: "",
  answer: "node app.js",
  aliases: ["node ./app.js"],
};

function expect(label, condition) {
  if (!condition) failures.push(label);
}

expect("正しいコードを受理できない", grade(codeQuestion, codeQuestion.answer));
expect(
  "セミコロンのないコードを誤って受理する",
  !grade(codeQuestion, 'const message = "hi "'),
);
expect(
  "セミコロン不足の案内を返せない",
  /セミコロン/.test(feedbackForIncorrectAnswer(codeQuestion, 'const message = "hi "')),
);
expect(
  "大文字化した実行不能コードを誤って受理する",
  !grade(codeQuestion, 'CONST MESSAGE = "hi ";'),
);
expect(
  "文字列内の空白を削除した誤答を受理する",
  !grade(codeQuestion, 'const message = "hi";'),
);
expect(
  "コメントアウトせず削除した回答を受理する",
  !grade(commentQuestion, 'console.log("A");\nconsole.log("C");'),
);
expect(
  "コメントアウトした正答を受理できない",
  grade(commentQuestion, commentQuestion.answer),
);
expect(
  "大文字のシェルコマンドを誤って受理する",
  !gradeShell(shellQuestion, "NODE APP.JS"),
);
expect(
  "明示したシェル別解を受理できない",
  gradeShell(shellQuestion, "node ./app.js"),
);
expect(
  "コード誤答で確認行を示せない",
  /1行目/.test(feedbackForIncorrectAnswer(codeQuestion, 'let message = "hi ";')),
);
expect(
  "シェル誤答でコマンド名を比較できない",
  /npm.*node/.test(feedbackForIncorrectAnswer(shellQuestion, "npm app.js")),
);

const asyncResult = await runStudentJs(
  "Promise.resolve(4).then(console.log); setTimeout(() => console.log(5), 0);",
);
expect(
  "Promiseまたはtimer後の出力を回収できない",
  asyncResult.logs.join(",") === "4,5",
);

const behaviorQuestion = {
  id: "behavior-add",
  kind: "code",
  prompt: "addで合計を返してください。",
  sample: "5",
  answer:
    "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));",
};
expect(
  "同じ振る舞いの別実装を受理できない",
  await gradeCodeByBehavior(
    behaviorQuestion,
    "function add(a, b) {\n  const total = a + b;\n  return total;\n}\nconsole.log(add(2, 3));",
    "js",
  ),
);
expect(
  "見本の値だけを直接表示する誤答を受理する",
  !(await gradeCodeByBehavior(behaviorQuestion, "console.log(5);", "js")),
);
expect(
  "セミコロンのない振る舞い正答を誤って受理する",
  !(await gradeCodeByBehavior(
    behaviorQuestion,
    "function add(a, b) {\n  return a + b\n}\nconsole.log(add(2, 3))",
    "js",
  )),
);
expect(
  "別入力で壊れる関数を受理する",
  !(await gradeCodeByBehavior(
    behaviorQuestion,
    "function add(a, b) {\n  return 5;\n}\nconsole.log(add(2, 3));",
    "js",
  )),
);

const evidenceQuestion = {
  id: "runtime-evidence-basic",
  kind: "code",
  prompt: "",
  sample: "ok",
  answer: 'console.log("ok");',
};
const nonExecutableSource = 'throw new Error("visible source ran twice");';
expect(
  "一致するJS実行証跡を再利用できない",
  await gradeCodeByBehavior(evidenceQuestion, nonExecutableSource, "js", {
    runtime: "js",
    source: nonExecutableSource,
    result: { logs: ["ok"] },
  }),
);
expect(
  "ソースが異なるJS実行証跡を誤って再利用する",
  !(await gradeCodeByBehavior(evidenceQuestion, 'console.log("no");', "js", {
    runtime: "js",
    source: nonExecutableSource,
    result: { logs: ["ok"] },
  })),
);
expect(
  "実行証跡があるとセミコロン条件を迂回する",
  !(await gradeCodeByBehavior(evidenceQuestion, 'console.log("ok")', "js", {
    runtime: "js",
    source: 'console.log("ok")',
    result: { logs: ["ok"] },
  })),
);

const gradeQuestionSource = fs.readFileSync(
  "src/lib/grade-question.ts",
  "utf8",
);
const sqlCodeLabSource = fs.readFileSync(
  "src/components/code-lab.tsx",
  "utf8",
);
expect(
  "SQLの既存実行結果を採点に再利用していない",
  gradeQuestionSource.includes('evidence?.runtime === "sql"') &&
    sqlCodeLabSource.includes('evidence = { runtime: "sql"'),
);

const hiddenBehaviorQuestion = {
  ...behaviorQuestion,
  id: "runtime-evidence-hidden",
  behaviorCases: [{ args: [7, 4], expected: 11 }],
};
const hardCodedSource =
  "function add(a, b) {\n  return 5;\n}\nconsole.log(add(2, 3));";
expect(
  "実行証跡によってhidden behavior caseを迂回する",
  !(await gradeCodeByBehavior(hiddenBehaviorQuestion, hardCodedSource, "js", {
    runtime: "js",
    source: hardCodedSource,
    result: { logs: ["5"] },
  })),
);

const domQuestion = {
  id: "runtime-evidence-dom",
  kind: "code",
  runtime: "dom",
  prompt: "",
  answer: 'document.body.textContent = "ok";',
  fixtureHtml: "<main></main>",
  domProbe: 'document.body.textContent === "ok"',
};
const domSource = 'throw new Error("DOM grading ran twice");';
expect(
  "一致するDOM実行証跡を再利用できない",
  await gradeCodeByBehavior(domQuestion, domSource, "js", {
    runtime: "dom",
    source: domSource,
    result: { passed: true, html: "<main>ok</main>", logs: [] },
  }),
);

const codeLabSource = fs.readFileSync(
  new URL("../src/components/code-lab.tsx", import.meta.url),
  "utf8",
);
for (const required of [
  "submittingRef.current",
  "ref={domPreviewRef}",
  "runDomQuestion(question, typed, { iframe })",
  'evidence = { runtime: "js", source: typed, result }',
  'evidence = { runtime: "dom", source: typed, result }',
]) {
  expect(`CodeLabの単一実行・重複提出ガードがありません: ${required}`, codeLabSource.includes(required));
}
expect(
  "DOM実行器がCodeLab内で複数箇所から呼ばれています",
  codeLabSource.match(/runDomQuestion\(question, typed/g)?.length === 1,
);
expect(
  "DOM提出時に表示用srcDocを別途生成しています",
  !codeLabSource.includes("setDomDocument"),
);

const domRunnerSource = fs.readFileSync(
  new URL("../src/lib/run-dom.ts", import.meta.url),
  "utf8",
);
expect(
  "DOM実行器がlistener登録前にsrcdocを設定しています",
  domRunnerSource.indexOf('window.addEventListener("message", receive)') <
    domRunnerSource.indexOf("iframe.srcdoc = createDomDocument"),
);
expect(
  "DOM実行器が可視iframeを対象にできません",
  domRunnerSource.includes("const iframe = options.iframe ?? document.createElement"),
);

if (failures.length > 0) {
  console.error("採点・実行監査で問題が見つかりました:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("採点の文字列比較・非同期実行・振る舞い検証テストに成功しました。");
}
