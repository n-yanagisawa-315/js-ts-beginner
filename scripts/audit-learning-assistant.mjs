import assert from "node:assert/strict";
import fs from "node:fs";

import {
  assistantQuestionDetails,
  FAMILIAR_EXAMPLE_QUESTION,
  FIRST_STEP_QUESTION,
  LOCAL_ASSISTANT_MODEL_ID,
  SIMPLE_EXPLANATION_QUESTION,
  containsRestrictedAnswer,
  firstStepForQuestion,
  guardAssistantOutput,
  isUnreliableAssistantOutput,
  sanitizeAssistantOutput,
  trustedAssistantAnswer,
} from "../src/lib/learning-assistant-engine.ts";
import { applyCourseLearningDesign } from "../src/lib/course/learning-design.ts";
import {
  questionForSlide,
  teachingSlideEntries,
} from "../src/lib/course/slide-layout.ts";
import { githubAdvanced } from "../src/lib/course/github-advanced.ts";
import { githubStart } from "../src/lib/course/github-start.ts";
import { jsAdvanced } from "../src/lib/course/js-advanced.ts";
import { jsBasic } from "../src/lib/course/js-basic.ts";
import { jsCallback } from "../src/lib/course/js-callback.ts";
import { jsDom } from "../src/lib/course/js-dom.ts";
import { jsMiddle } from "../src/lib/course/js-middle.ts";
import { jsModern } from "../src/lib/course/js-modern.ts";
import { jsNpm } from "../src/lib/course/js-npm.ts";
import { jsStart } from "../src/lib/course/js-start.ts";
import { languageChallenges } from "../src/lib/course/language-challenges.ts";
import { nodeCore } from "../src/lib/course/node-core.ts";
import { nodeStart } from "../src/lib/course/node-start.ts";
import { sqlAdvanced } from "../src/lib/course/sql-advanced.ts";
import { sqlStart } from "../src/lib/course/sql-start.ts";
import { tsLessons } from "../src/lib/course/ts-lessons.ts";
import { tsModern } from "../src/lib/course/ts-modern.ts";

const lessons = applyCourseLearningDesign([
  ...jsStart,
  ...jsBasic,
  ...jsCallback,
  ...jsMiddle,
  ...jsModern,
  ...jsAdvanced,
  ...jsDom,
  ...jsNpm,
  ...tsLessons,
  ...tsModern,
  ...nodeStart,
  ...nodeCore,
  ...languageChallenges,
  ...sqlStart,
  ...sqlAdvanced,
  ...githubStart,
  ...githubAdvanced,
]);

let questionCount = 0;
let firstStepCount = 0;
let quickAnswerCount = 0;

for (const lesson of lessons) {
  const displayedQuestionIds = new Set();
  for (const { index: slideIndex } of teachingSlideEntries(lesson)) {
    const displayed = questionForSlide(lesson, slideIndex);
    assert.ok(displayed, `${lesson.id}/${slideIndex}: 設問が表示されません`);
    assert.equal(
      displayed.slide,
      slideIndex,
      `${lesson.id}/${displayed.id}: 表示スライドが一致しません`,
    );
    assert.equal(
      displayedQuestionIds.has(displayed.id),
      false,
      `${lesson.id}/${displayed.id}: 同じ設問が重複表示されます`,
    );
    displayedQuestionIds.add(displayed.id);
  }
  assert.equal(
    displayedQuestionIds.size,
    lesson.questions.length,
    `${lesson.id}: 到達できない設問があります`,
  );

  for (const question of lesson.questions) {
    questionCount += 1;
    const slide = lesson.slides[question.slide ?? 0];
    assert.ok(
      slide,
      `${lesson.id}/${question.id}: 対応するスライドがありません`,
    );

    const firstStepHint = firstStepForQuestion(question);
    const details = assistantQuestionDetails(question);
    for (const option of question.options ?? []) {
      assert.ok(
        details.includes(option),
        `${lesson.id}/${question.id}: 選択肢が文脈にありません`,
      );
    }
    if (question.code) {
      assert.ok(
        details.includes(question.code),
        `${lesson.id}/${question.id}: 設問コードが文脈にありません`,
      );
    }
    if (question.starter) {
      assert.ok(
        details.includes(question.starter),
        `${lesson.id}/${question.id}: starterが文脈にありません`,
      );
    }
    for (const fragment of question.fragments ?? []) {
      assert.ok(
        details.includes(fragment),
        `${lesson.id}/${question.id}: 並べ替え断片が文脈にありません`,
      );
    }
    for (const state of [
      { label: "未回答", unanswered: true },
      { label: "誤答後", unanswered: true },
      { label: "正答後", unanswered: false },
    ]) {
      const grounding = {
        lessonSummary: lesson.summary,
        slideLead: slide.lead,
        points: slide.points,
        firstStepHint,
        unanswered: state.unanswered,
        restrictedAnswer: state.unanswered ? question.answer : undefined,
      };
      const templates = [
        SIMPLE_EXPLANATION_QUESTION,
        FAMILIAR_EXAMPLE_QUESTION,
        ...(firstStepHint ? [FIRST_STEP_QUESTION] : []),
      ];

      for (const template of templates) {
        const answer = trustedAssistantAnswer(template, grounding);
        quickAnswerCount += 1;
        assert.ok(
          answer?.trim(),
          `${lesson.id}/${question.id}/${state.label}: 定型回答が空です`,
        );
        assert.ok(
          answer.length <= 500,
          `${lesson.id}/${question.id}/${state.label}: 定型回答が長すぎます`,
        );
        assert.doesNotMatch(
          answer,
          /(?:^|\n)\s*#{1,6}\s|(?:正解|回答)\s*[:：]/,
          `${lesson.id}/${question.id}/${state.label}: 不要な見出しがあります`,
        );
        if (state.unanswered) {
          assert.equal(
            containsRestrictedAnswer(answer, question.answer),
            false,
            `${lesson.id}/${question.id}/${state.label}: 定型回答が正答を含みます`,
          );
        }
        if (template === FIRST_STEP_QUESTION) {
          firstStepCount += 1;
          assert.equal(
            answer,
            `まずは、${firstStepHint}`,
            `${lesson.id}/${question.id}/${state.label}: 教材外のヒントが混ざっています`,
          );
        }
      }
    }
  }
}

assert.equal(questionCount, 372, "全設問を監査できていません");
assert.equal(
  LOCAL_ASSISTANT_MODEL_ID,
  "Qwen3.5-4B-q4f16_1-MLC",
  "学習アシスタントのモデルが Qwen3.5-4B ではありません",
);
assert.equal(
  isUnreliableAssistantOutput("10 % 3 は Infinity です。"),
  true,
  "誤った数式を見逃しています",
);
assert.equal(
  isUnreliableAssistantOutput(
    "1 + 2 は 3 / % は 3 / % は 3 / % は 3 / % は 3 /",
  ),
  true,
  "異常な反復を見逃しています",
);
assert.equal(
  isUnreliableAssistantOutput(
    "1 + 2 は 3 です。10 % 3 は 1 です。1 / 0 は Infinity です。",
  ),
  false,
  "正しい数式を誤検出しています",
);
assert.equal(
  sanitizeAssistantOutput("正解: SELECT", false),
  "",
  "行内の正解ラベルを除去できません",
);
assert.equal(
  sanitizeAssistantOutput("答えは SELECT です", false),
  "",
  "行内の答え表現を除去できません",
);
assert.equal(
  containsRestrictedAnswer("SELECT * FROM orders;", "SELECT"),
  true,
  "裸の完成コードから正答を検出できません",
);
assert.equal(
  containsRestrictedAnswer("答えは行です。", "行"),
  true,
  "1文字の正答を検出できません",
);
assert.equal(
  containsRestrictedAnswer("最初に行う操作を考えます。", "行"),
  false,
  "1文字の正答を通常の文から誤検出しています",
);
assert.match(
  guardAssistantOutput(
    "「種類を確認するまで操作を許さない」が正解です。",
    false,
    {
      restrictedAnswer: "種類を確認するまで操作を許さない",
      fallback: "安全なヒント",
    },
  ),
  /安全なヒント/,
  "選択肢の正解言い切りを遮断できません",
);
assert.match(
  guardAssistantOutput(
    "ターミナルで「node -v」と打つと、現在使われているバージョンがわかります。",
    false,
    {
      restrictedAnswer: "node -v",
      fallback: "安全なヒント",
    },
  ),
  /安全なヒント/,
  "短いコマンド正答の漏えいを遮断できません",
);
assert.match(
  guardAssistantOutput(
    "WHEREは「行」を絞り込むのに使います。",
    false,
    {
      restrictedAnswer: "行",
      fallback: "安全なヒント",
    },
  ),
  /安全なヒント/,
  "1文字正答の漏えいを遮断できません",
);
assert.doesNotMatch(
  guardAssistantOutput(
    "まずは、条件で絞り込む対象が何かを確認しましょう。",
    false,
    {
      restrictedAnswer: "行",
      fallback: "安全なヒント",
    },
  ),
  /安全なヒント/,
  "漏えいのないヒントまで遮断しています",
);

const lessonStudioSource = fs.readFileSync(
  new URL("../src/components/lesson-studio.tsx", import.meta.url),
  "utf8",
);
const reviewSessionSource = fs.readFileSync(
  new URL("../src/components/review-session.tsx", import.meta.url),
  "utf8",
);
for (const [label, source] of [
  ["通常演習", lessonStudioSource],
  ["復習", reviewSessionSource],
]) {
  assert.match(source, /assistant=\{assistant\}/, `${label}にアシスタントがありません`);
  assert.match(
    source,
    /onRuntimeStateChange=\{setAssistantRuntimeState\}/,
    `${label}で実行結果がアシスタントへ渡りません`,
  );
}

console.log(
  `学習アシスタント監査に成功しました。${questionCount}問、定型回答${quickAnswerCount}件、最初のヒント${firstStepCount}件を確認しました。`,
);
