"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CodeLab } from "@/components/code-lab";
import { QuizChallenge } from "@/components/quiz-challenge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, RotateCcw } from "lucide-react";
import {
  getChapter,
  type Lesson,
} from "@/lib/course";
import { feedbackForIncorrectAnswer, grade } from "@/lib/grade";
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
    if (confidence === null) return;
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
          : feedbackForIncorrectAnswer(item.question, answer),
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
      <main id="main-content" className="review-state-page">
        <Card className="review-state-card" role="status" aria-label="復習問題を準備中">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-3/4" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (queue.items.length === 0) {
    return (
      <main id="main-content" className="review-state-page">
        <Empty className="review-state-card border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>
              <h1>まず講義の演習に挑戦しましょう</h1>
            </EmptyTitle>
            <EmptyDescription>
              一度解いた問題がここに集まり、学習履歴に応じた時期にもう一度出題されます。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">講座一覧へ</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    );
  }

  if (!item) {
    const resultPercent = queue.items.length
      ? (correctCount / queue.items.length) * 100
      : 0;
    return (
      <main id="main-content" className="review-state-page">
        <Card className="review-state-card">
          <CardHeader>
            <Badge variant="secondary">復習おわり</Badge>
            <CardTitle asChild>
              <h1>{correctCount} / {queue.items.length}</h1>
            </CardTitle>
            <CardDescription>
              {queue.isPreview
                ? "期限前の先取り結果を記録しました。次の復習期限は進めていません。"
                : "期限後の解答結果を記録し、条件を満たした問題の復習時期を更新しました。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={resultPercent} aria-label="今回の復習正解率" />
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">講座一覧へ</Link>
            </Button>
          </CardFooter>
        </Card>
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
          current={position + 1}
          total={queue.items.length}
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
          attempted={attemptNumber > 0}
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
        current={position + 1}
        total={queue.items.length}
      />
      <QuizChallenge
        key={`${position}-${question.id}-${question.variantId ?? "base"}`}
        question={question}
        index={position}
        total={queue.items.length}
        correctCount={correctCount}
        choice={choice}
        typed={typed}
        checked={checked}
        isCorrect={isCorrect}
        failReason={failReason}
        onChoice={setChoice}
        onTyped={setTyped}
        onSubmit={submit}
        onDismissFail={() => setFailReason(null)}
        onNext={next}
        nextLabel={nextLabel}
        onHintUsed={recordHint}
        confidence={confidence}
        onConfidence={setConfidence}
        attempted={attemptNumber > 0}
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
  current,
  total,
}: {
  chapter?: string;
  lesson: string;
  preview: boolean;
  current: number;
  total: number;
}) {
  return (
    <header className="learning-flow-header">
      <div className="learning-flow-header-main">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/">講座一覧へ戻る</Link>
        </Button>
        <div className="learning-flow-title">
          <Badge variant="secondary">
            <RotateCcw aria-hidden="true" />
            {preview ? "先取り復習" : "期限到来"}
          </Badge>
          <strong>{[chapter, lesson].filter(Boolean).join(" · ")}</strong>
        </div>
      </div>
      <div className="learning-flow-status">
        <div>
          <span>{current}/{total}</span>
          <Progress value={(current / total) * 100} aria-label="復習の進捗" />
        </div>
      </div>
    </header>
  );
}
