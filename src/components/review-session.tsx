"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CodeLabProps } from "@/components/code-lab";
import type { QuizChallengeProps } from "@/components/quiz-challenge";
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
import type { ReviewPageDTO } from "@/lib/course/client-dtos";
import { feedbackForIncorrectAnswer, grade } from "@/lib/grade";
import {
  gradeQuestion,
  type RuntimeEvidence,
} from "@/lib/grade-question";
import {
  initializeLearningState,
  recordQuestionAssistance,
  recordQuestionAttempt,
  recordSelfExplanation,
} from "@/lib/progress";
import {
  isReviewBatchResponseFor,
  REVIEW_API_VERSION,
  type ReviewBatchRequest,
  type ReviewBatchResponse,
} from "@/lib/review-contract";
import { buildReviewQueue, type ReviewQueue } from "@/lib/review-queue";

const loadCodeLab = () => import("@/components/code-lab");
const loadQuizChallenge = () => import("@/components/quiz-challenge");

const CodeLab = dynamic<CodeLabProps>(
  () => loadCodeLab().then((module) => module.CodeLab),
  {
    loading: () => <ReviewExerciseLoading variant="code" />,
  },
);

const QuizChallenge = dynamic<QuizChallengeProps>(
  () => loadQuizChallenge().then((module) => module.QuizChallenge),
  {
    loading: () => <ReviewExerciseLoading variant="quiz" />,
  },
);

const subscribeToNothing = () => () => {};
const REVIEW_REQUEST_TIMEOUT_MS = 15_000;

function isCodeQuestion(kind: ReviewQueue["items"][number]["question"]["kind"]) {
  return kind === "code" || kind === "shell" || kind === "sql" || kind === "git";
}

function preloadReviewExerciseChunks(queue: ReviewQueue) {
  if (queue.items.some(({ question }) => isCodeQuestion(question.kind))) {
    void loadCodeLab();
  }
  if (queue.items.some(({ question }) => !isCodeQuestion(question.kind))) {
    void loadQuizChallenge();
  }
}

function preloadCodeLabRuntimes(response: ReviewBatchResponse) {
  const codeQuestions = response.items.filter(({ question }) =>
    isCodeQuestion(question.kind),
  );
  if (codeQuestions.length === 0) return;
  void loadCodeLab().then((module) => {
    for (const { question } of codeQuestions) {
      module.preloadCodeLabDependencies(question);
    }
  });
}

function reviewBatchRequest(queue: ReviewQueue): ReviewBatchRequest {
  return {
    version: REVIEW_API_VERSION,
    items: queue.items.map((item) => ({
      lessonId: item.lesson.id,
      questionId: item.question.id,
      attemptCount: item.attemptCount,
    })),
  };
}

async function fetchReviewBatch(
  request: ReviewBatchRequest,
  signal?: AbortSignal,
): Promise<ReviewBatchResponse> {
  const response = await fetch("/api/review/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error("復習問題を取得できませんでした。");
  }
  const body: unknown = await response.json();
  if (!isReviewBatchResponseFor(body, request)) {
    throw new Error("復習問題の順序が一致しません。");
  }
  return body;
}

export function ReviewSession({ course }: { course: ReviewPageDTO }) {
  const { lessons } = course;
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const initialized = useRef(false);
  const requestGeneration = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [batch, setBatch] = useState<ReviewBatchResponse | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
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

  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    const initialQueue = buildReviewQueue(lessons, initializeLearningState());
    setQueue(initialQueue);
    if (initialQueue.items.length === 0) return;

    const request = reviewBatchRequest(initialQueue);
    const controller = new AbortController();
    activeRequest.current = controller;
    const generation = ++requestGeneration.current;
    const timeout = window.setTimeout(
      () => controller.abort(),
      REVIEW_REQUEST_TIMEOUT_MS,
    );
    const batchPromise = fetchReviewBatch(request, controller.signal);
    preloadReviewExerciseChunks(initialQueue);
    void batchPromise
      .then((response) => {
        if (generation !== requestGeneration.current) return;
        preloadCodeLabRuntimes(response);
        setBatch(response);
        setTyped(response.items[0]?.question.starter ?? "");
      })
      .catch((error: unknown) => {
        if (generation !== requestGeneration.current) return;
        setLoadError(
          error instanceof DOMException && error.name === "AbortError"
            ? "復習問題の取得がタイムアウトしました。"
            : error instanceof Error
              ? error.message
              : "復習問題を取得できませんでした。",
        );
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (activeRequest.current === controller) activeRequest.current = null;
        if (generation === requestGeneration.current) setLoadingBatch(false);
      });
    return () => {
      requestGeneration.current += 1;
      window.clearTimeout(timeout);
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [hydrated, lessons]);

  async function retryLoad() {
    if (!queue || queue.items.length === 0 || loadingBatch) return;
    setLoadError(null);
    setLoadingBatch(true);
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const generation = ++requestGeneration.current;
    const timeout = window.setTimeout(
      () => controller.abort(),
      REVIEW_REQUEST_TIMEOUT_MS,
    );
    try {
      const batchPromise = fetchReviewBatch(
        reviewBatchRequest(queue),
        controller.signal,
      );
      preloadReviewExerciseChunks(queue);
      const response = await batchPromise;
      if (generation !== requestGeneration.current) return;
      preloadCodeLabRuntimes(response);
      setBatch(response);
      setTyped(response.items[0]?.question.starter ?? "");
    } catch (error) {
      if (generation !== requestGeneration.current) return;
      setLoadError(
        error instanceof DOMException && error.name === "AbortError"
          ? "復習問題の取得がタイムアウトしました。"
          : error instanceof Error
            ? error.message
            : "復習問題を取得できませんでした。",
      );
    } finally {
      window.clearTimeout(timeout);
      if (activeRequest.current === controller) activeRequest.current = null;
      if (generation === requestGeneration.current) setLoadingBatch(false);
    }
  }

  const item = batch?.items[position];
  const answer =
    item?.question.kind === "choice" ? (choice ?? "") : typed;
  const isCorrect = useMemo(
    () => (item ? grade(item.question, answer) : false),
    [answer, item],
  );

  async function submit(
    correctOverride?: boolean,
    evidence?: RuntimeEvidence,
  ) {
    if (!item || checked) return;
    if (confidence === null) return;
    if (
      item.question.kind === "choice"
        ? !choice
        : typed.trim() === ""
    ) {
      return;
    }
    const gradeResult =
      correctOverride === undefined
        ? await gradeQuestion(item.question, answer, item.lesson.track, evidence)
        : {
            passed: correctOverride,
            feedback: item.question.explain,
            diagnostics: [] as string[],
          };
    const correct = gradeResult.passed;
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
          : item.question.kind === "sql" || item.question.kind === "git"
            ? [gradeResult.feedback, ...gradeResult.diagnostics].join("\n")
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
    setTyped(batch?.items[nextPosition]?.question.starter ?? "");
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

  if (!queue || (queue.items.length > 0 && !batch && !loadError)) {
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

  if (loadError) {
    return (
      <main id="main-content" className="review-state-page">
        <Card className="review-state-card" role="alert">
          <CardHeader>
            <CardTitle asChild>
              <h1>復習問題を読み込めませんでした</h1>
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={retryLoad} disabled={loadingBatch}>
              {loadingBatch ? "再読み込み中…" : "もう一度試す"}
            </Button>
          </CardFooter>
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

  const chapterTitle = item.lesson.chapterTitle;
  const nextLabel =
    position + 1 === queue.items.length ? "結果を見る" : "次の問題";
  const question = item.question;

  if (
    question.kind === "code" ||
    question.kind === "shell" ||
    question.kind === "sql" ||
    question.kind === "git"
  ) {
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

function ReviewExerciseLoading({ variant }: { variant: "code" | "quiz" }) {
  return (
    <main
      id="main-content"
      className={
        variant === "code"
          ? "flex min-h-0 flex-1 items-center justify-center bg-[#10141c] p-6 text-[var(--cream)]"
          : "flex min-h-0 flex-1 items-center justify-center bg-paper p-6 text-ink"
      }
      role="status"
      aria-live="polite"
    >
      <p>{variant === "code" ? "コード演習を準備中…" : "復習問題を準備中…"}</p>
    </main>
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
