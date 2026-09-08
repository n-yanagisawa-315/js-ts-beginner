"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CodeLab } from "@/components/code-lab";
import { QuizChallenge } from "@/components/quiz-challenge";
import {
  getChapter,
  type Lesson,
} from "@/lib/course";
import { grade } from "@/lib/grade";
import { gradeCodeByBehavior } from "@/lib/grade-behavior";
import {
  readLearningState,
  recordQuestionAssistance,
  recordQuestionAttempt,
  recordSelfExplanation,
} from "@/lib/progress";
import { buildReviewQueue } from "@/lib/review-queue";

const subscribeToNothing = () => () => {};

export function ReviewSession({ lessons }: { lessons: Lesson[] }) {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const queue = useMemo(
    () => (hydrated ? buildReviewQueue(lessons, readLearningState()) : null),
    [hydrated, lessons],
  );
  const [position, setPosition] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState(() => {
    if (typeof window === "undefined") return "";
    return (
      buildReviewQueue(lessons, readLearningState()).items[0]?.question
        .starter ?? ""
    );
  });
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [failTick, setFailTick] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerViewed, setAnswerViewed] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [attemptStartedAt, setAttemptStartedAt] = useState(() => Date.now());
  const [reflection, setReflection] = useState("");

  const item = queue?.items[position];
  const answer =
    item?.question.kind === "choice" ? (choice ?? "") : typed;
  const isCorrect = useMemo(
    () => (item ? grade(item.question, answer) : false),
    [answer, item],
  );

  async function submit() {
    if (!item || checked) return;
    if (
      item.question.kind === "choice"
        ? !choice
        : typed.trim() === ""
    ) {
      return;
    }
    const correct =
      item.question.kind === "code"
        ? await gradeCodeByBehavior(item.question, answer, item.lesson.track)
        : isCorrect;
    recordQuestionAttempt({
      lessonId: item.lesson.id,
      questionId: item.question.id,
      correct,
      context: item.question.exerciseKind === "transfer" ? "transfer" : "review",
      firstAttempt: attemptNumber === 0,
      supported: hintLevel > 0 || answerViewed,
      hintLevel,
      answerViewed,
      responseTimeMs: Date.now() - attemptStartedAt,
      confidence,
      variantId: item.question.variantId,
      response: answer,
      misconceptionId:
        item.question.kind === "choice" && choice
          ? (item.question.misconceptionByAnswer?.[choice]?.id ?? null)
          : null,
      conceptIds: item.question.conceptIds,
    });
    setAttemptNumber((count) => count + 1);
    setAttemptStartedAt(Date.now());
    if (!correct) {
      setFailReason(
        item.question.kind === "choice" && choice
          ? (item.question.feedbackByAnswer?.[choice] ?? item.question.explain)
          : item.question.explain,
      );
      setFailTick((current) => current + 1);
      return;
    }
    setFailReason(null);
    setChecked(true);
    setCorrectCount((current) => current + 1);
  }

  function next() {
    if (!queue) return;
    if (item && reflection.trim().length >= 10) {
      recordSelfExplanation({
        lessonId: item.lesson.id,
        questionId: item.question.id,
        response: reflection,
      });
    }
    const nextPosition = position + 1;
    setPosition(nextPosition);
    setChoice(null);
    setTyped(queue.items[nextPosition]?.question.starter ?? "");
    setChecked(false);
    setFailReason(null);
    setConfidence(null);
    setHintLevel(0);
    setAnswerViewed(false);
    setAttemptNumber(0);
    setAttemptStartedAt(Date.now());
    setReflection("");
  }

  function recordHint(level: number) {
    if (!item) return;
    setHintLevel(level);
    recordQuestionAssistance({
      lessonId: item.lesson.id,
      questionId: item.question.id,
      hintUsed: true,
    });
  }

  function recordAnswer() {
    if (!item) return;
    setAnswerViewed(true);
    recordQuestionAssistance({
      lessonId: item.lesson.id,
      questionId: item.question.id,
      answerViewed: true,
    });
  }

  if (!queue) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p role="status" className="text-mute">
          復習問題を準備しています…
        </p>
      </main>
    );
  }

  if (queue.items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-start justify-center px-5 py-16 sm:px-10">
        <p className="font-mono text-xs tracking-[0.16em] text-studio">復習</p>
        <h1 className="mt-3 font-serif text-4xl font-medium">
          まず講義の演習に挑戦しましょう
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-mute">
          一度解いた問題がここに集まり、適切な時期にもう一度出題されます。
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          講座一覧へ
        </Link>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex flex-1 flex-col items-start justify-center px-5 py-16 sm:px-10">
        <p className="font-mono text-xs tracking-[0.16em] text-studio">
          復習おわり
        </p>
        <h1 className="mt-3 font-serif text-5xl font-medium">
          {correctCount} / {queue.items.length}
        </h1>
        <p className="mt-4 text-mute">
          解答結果をもとに、次の復習時期を更新しました。
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          講座一覧へ
        </Link>
      </main>
    );
  }

  const chapterTitle = getChapter(item.lesson.chapter)?.title;
  const nextLabel =
    position + 1 === queue.items.length ? "結果を見る" : "次の問題";
  const question = item.question;

  if (question.kind === "code" || question.kind === "shell") {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <ReviewHeader
          chapter={chapterTitle}
          lesson={item.lesson.title}
          preview={queue.isPreview}
        />
        <CodeLab
          track={item.lesson.track}
          question={question}
          index={position}
          total={queue.items.length}
          correctCount={correctCount}
          typed={typed}
          checked={checked}
          failReason={failReason}
          failTick={failTick}
          onTyped={setTyped}
          onSubmit={submit}
          onDismissFail={() => setFailReason(null)}
          onNext={next}
          nextLabel={nextLabel}
          onHintUsed={recordHint}
          onAnswerViewed={recordAnswer}
          confidence={confidence}
          onConfidence={setConfidence}
          reflection={reflection}
          onReflection={setReflection}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <ReviewHeader
        chapter={chapterTitle}
        lesson={item.lesson.title}
        preview={queue.isPreview}
      />
      <QuizChallenge
        key={question.id}
        question={question}
        index={position}
        total={queue.items.length}
        correctCount={correctCount}
        choice={choice}
        typed={typed}
        checked={checked}
        isCorrect={isCorrect}
        failReason={failReason}
        failTick={failTick}
        onChoice={setChoice}
        onTyped={setTyped}
        onSubmit={submit}
        onDismissFail={() => setFailReason(null)}
        onNext={next}
        nextLabel={nextLabel}
        onHintUsed={recordHint}
        confidence={confidence}
        onConfidence={setConfidence}
        reflection={reflection}
        onReflection={setReflection}
      />
    </div>
  );
}

function ReviewHeader({
  chapter,
  lesson,
  preview,
}: {
  chapter?: string;
  lesson: string;
  preview: boolean;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-desk px-4 py-3 sm:px-6">
      <Link href="/" className="btn btn-ghost min-h-11 px-3 text-sm text-mute">
        講座一覧
      </Link>
      <div className="text-right">
        <p className="font-mono text-[11px] tracking-[0.14em] text-studio">
          {preview ? "先取り復習" : "期限到来"}
        </p>
        <p className="text-sm text-mute">
          {[chapter, lesson].filter(Boolean).join(" · ")}
        </p>
      </div>
    </header>
  );
}
