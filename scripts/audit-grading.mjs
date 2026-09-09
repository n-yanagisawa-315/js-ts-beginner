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
  "別入力で壊れる関数を受理する",
  !(await gradeCodeByBehavior(
    behaviorQuestion,
    "function add(a, b) {\n  return 5;\n}\nconsole.log(add(2, 3));",
    "js",
  )),
);

if (failures.length > 0) {
  console.error("採点・実行監査で問題が見つかりました:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("採点の文字列比較・非同期実行・振る舞い検証テストに成功しました。");
}
