"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CodeLabProps } from "@/components/code-lab";
import { ConfidenceDialog } from "@/components/confidence-scale";
import {
  LearningAssistant,
  type LearningAssistantContext,
} from "@/components/learning-assistant";
import { LearningFlowHeader } from "@/components/learning-flow-header";
import type { QuizChallengeProps } from "@/components/quiz-challenge";
import { SlideTheater } from "@/components/slide-theater";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type {
  LessonNavigationDTO,
  LessonPageDTO,
} from "@/lib/course/client-dtos";
import type { Lesson } from "@/lib/course/types";
import {
  isSummarySlide,
  nextSlideIndex,
  questionForSlide,
  talkPages,
  teachingSlideEntries,
} from "@/lib/course/slide-layout";
import { feedbackForIncorrectAnswer, grade } from "@/lib/grade";
import {
  gradeQuestion,
  type RuntimeEvidence,
} from "@/lib/grade-question";
import {
  assistantQuestionDetails,
  firstStepForQuestion,
} from "@/lib/learning-assistant-engine";
import {
  getLatestExitRecallSnapshot,
  getServerLatestExitRecallSnapshot,
  questionProgressKey,
  readLearningState,
  recordQuestionAssistance,
  recordQuestionAttempt,
  recordSelfExplanation,
  recordLessonLearningEvent,
  subscribeLearningState,
  writeProgress,
} from "@/lib/progress";
import {
  readLessonResume,
  writeLessonResume,
  type LessonResumePhase,
} from "@/lib/lesson-resume";

const loadCodeLab = () => import("@/components/code-lab");
const loadQuizChallenge = () => import("@/components/quiz-challenge");

const CodeLab = dynamic<CodeLabProps>(
  () => loadCodeLab().then((module) => module.CodeLab),
  {
    loading: () => <ExerciseLoading variant="code" />,
  },
);

const QuizChallenge = dynamic<QuizChallengeProps>(
  () => loadQuizChallenge().then((module) => module.QuizChallenge),
  {
    loading: () => <ExerciseLoading variant="quiz" />,
  },
);

type Phase = LessonResumePhase;

const subscribeToNothing = () => () => {};

type StudioBootstrap = {
  phase: Phase;
  slide: number;
  conversationPage: number;
  prediction: string;
  exitRecall: string;
  attempted: number[];
  correctCount: number;
  drafts: Record<number, string>;
  typed: string;
};

function progressForLesson(lesson: LessonPageDTO["lesson"]): {
  attempted: Set<number>;
  correctCount: number;
  hasPrequestion: boolean;
  hasExitRecall: boolean;
  completed: boolean;
} {
  const state = readLearningState();
  const attempted = new Set<number>();
  let correctCount = 0;
  for (const { index } of teachingSlideEntries(lesson as Lesson)) {
    const question = questionForSlide(lesson as Lesson, index);
    if (!question) continue;
    const progress =
      state.questions[questionProgressKey(lesson.id, question.id)];
    if (!progress || progress.attempts <= 0) continue;
    attempted.add(index);
    if (
      progress.attemptHistory.some(
        (event) =>
          event.correct &&
          (event.context === "lesson" || event.context === "transfer"),
      )
    ) {
      correctCount += 1;
    }
  }
  const hasPrequestion = state.lessonEvents.some(
    (event) => event.lessonId === lesson.id && event.context === "prequestion",
  );
  const hasExitRecall = state.lessonEvents.some(
    (event) => event.lessonId === lesson.id && event.context === "exit-recall",
  );
  const lessonScore = state.lessons[lesson.id];
  return {
    attempted,
    correctCount,
    hasPrequestion,
    hasExitRecall,
    completed: Boolean(lessonScore && lessonScore.total > 0 && hasExitRecall),
  };
}

function defaultStudioBootstrap(): StudioBootstrap {
  return {
    phase: "predict",
    slide: 0,
    conversationPage: 0,
    prediction: "",
    exitRecall: "",
    attempted: [],
    correctCount: 0,
    drafts: {},
    typed: "",
  };
}

function resolveStudioBootstrap(lesson: LessonPageDTO["lesson"]): StudioBootstrap {
  if (typeof window === "undefined") return defaultStudioBootstrap();

  const progress = progressForLesson(lesson);
  const resume = readLessonResume(lesson.id);
  const latestExit = getLatestExitRecallSnapshot(lesson.id);
  const maxSlide = Math.max(lesson.slides.length - 1, 0);
  const mergedAttempted = new Set(progress.attempted);
  if (resume) {
    for (const index of resume.attemptedSlides) mergedAttempted.add(index);
  }
  const attempted = [...mergedAttempted].sort((a, b) => a - b);

  if (progress.completed || resume?.phase === "done") {
    return {
      phase: "done",
      slide: maxSlide,
      conversationPage: 0,
      prediction: resume?.prediction ?? "",
      exitRecall: resume?.exitRecall ?? latestExit,
      attempted,
      correctCount: Math.max(resume?.correctCount ?? 0, progress.correctCount),
      drafts: resume?.drafts ?? {},
      typed: "",
    };
  }

  if (resume) {
    const nextSlide = Math.min(resume.slide, maxSlide);
    const current = lesson.slides[nextSlide];
    const pageCount = current
      ? talkPages(current, current.listings[0]).length
      : 1;
    const nextPhase =
      resume.phase === "predict" && progress.hasPrequestion
        ? "slides"
        : resume.phase;
    const target =
      nextPhase === "quiz"
        ? questionForSlide(lesson as Lesson, nextSlide)
        : undefined;
    return {
      phase: nextPhase,
      slide: nextSlide,
      conversationPage: Math.min(
        resume.conversationPage,
        Math.max(pageCount - 1, 0),
      ),
      prediction: resume.prediction,
      exitRecall: resume.exitRecall,
      attempted,
      correctCount: Math.max(resume.correctCount, progress.correctCount),
      drafts: resume.drafts,
      typed:
        target?.kind === "code" || target?.kind === "shell"
          ? (resume.drafts[nextSlide] ?? target.starter ?? "")
          : "",
    };
  }

  if (progress.hasExitRecall) {
    return {
      ...defaultStudioBootstrap(),
      phase: "exit",
      exitRecall: latestExit,
      attempted,
      correctCount: progress.correctCount,
    };
  }

  if (progress.hasPrequestion) {
    const firstOpen = teachingSlideEntries(lesson as Lesson).find(
      (entry) => !mergedAttempted.has(entry.index),
    );
    return {
      ...defaultStudioBootstrap(),
      phase: "slides",
      slide: firstOpen?.index ?? maxSlide,
      attempted,
      correctCount: progress.correctCount,
    };
  }

  return defaultStudioBootstrap();
}

export function LessonStudio({ course }: { course: LessonPageDTO }) {
  const { lesson, navigation, prequestion, predictionOptions, exitRecallHints } =
    course;
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("predict");
  const [slide, setSlide] = useState(0);
  const [conversationPage, setConversationPage] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [awarded, setAwarded] = useState(false);
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [failReason, setFailReason] = useState<string | null>(null);
  const [failTick, setFailTick] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerViewed, setAnswerViewed] = useState(false);
  const [materialReviewed, setMaterialReviewed] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [attemptStartedAt, setAttemptStartedAt] = useState(() => Date.now());
  const [prediction, setPrediction] = useState("");
  const [exitRecall, setExitRecall] = useState("");
  const [reflection, setReflection] = useState("");
  const [assistantRuntimeState, setAssistantRuntimeState] = useState("");
  const getPreviousExitRecall = useCallback(
    () => getLatestExitRecallSnapshot(lesson.id),
    [lesson.id],
  );
  const previousExitRecall = useSyncExternalStore(
    subscribeLearningState,
    getPreviousExitRecall,
    getServerLatestExitRecallSnapshot,
  );

  // Hydrate resume once on the client during render (not in an effect).
  // Lesson changes remount via key={lesson.id} on the page.
  if (hydrated && !ready) {
    const bootstrap = resolveStudioBootstrap(lesson);
    setPhase(bootstrap.phase);
    setSlide(bootstrap.slide);
    setConversationPage(bootstrap.conversationPage);
    setPrediction(bootstrap.prediction);
    setExitRecall(bootstrap.exitRecall);
    setAttempted(new Set(bootstrap.attempted));
    setCorrectCount(bootstrap.correctCount);
    setDrafts(bootstrap.drafts);
    setTyped(bootstrap.typed);
    setChoice(null);
    setChecked(false);
    setAwarded(false);
    setFailReason(null);
    setConfidence(null);
    setHintLevel(0);
    setAnswerViewed(false);
    setMaterialReviewed(false);
    setAttemptNumber(0);
    setReflection("");
    setAssistantRuntimeState("");
    setReady(true);
  }

  useLayoutEffect(() => {
    if (!ready) return;
    writeLessonResume(lesson.id, {
      phase,
      slide,
      conversationPage,
      prediction,
      exitRecall,
      attemptedSlides: [...attempted],
      correctCount,
      drafts,
    });
  }, [
    attempted,
    conversationPage,
    correctCount,
    drafts,
    exitRecall,
    lesson.id,
    phase,
    prediction,
    ready,
    slide,
  ]);

  const question = useMemo(
    () => questionForSlide(lesson, slide),
    [lesson, slide],
  );
  const nextId = navigation.nextLessonId;
  const currentAnswer = question?.kind === "choice" ? (choice ?? "") : typed;
  const isCorrect = useMemo(
    () => (question ? grade(question, currentAnswer) : false),
    [question, currentAnswer],
  );
  const currentSlide = lesson.slides[slide];
  const conversationPages = useMemo(
    () =>
      currentSlide ? talkPages(currentSlide, currentSlide.listings[0]) : [],
    [currentSlide],
  );
  const lastConversationPage = Math.max(conversationPages.length - 1, 0);
  const referenceTopic = {
    js: "javascript",
    ts: "typescript",
    node: "node",
    sql: "sql",
    github: "github",
  }[lesson.track];
  const slideCount = lesson.slides.length;
  const teaching = useMemo(() => teachingSlideEntries(lesson), [lesson]);
  const quizTotal = teaching.length;
  const quizIndex = teaching.findIndex((entry) => entry.index === slide);
  const codeQuiz =
    phase === "quiz" &&
    (question?.kind === "code" ||
      question?.kind === "shell" ||
      question?.kind === "sql" ||
      question?.kind === "git");
  const nextIndex = nextSlideIndex(lesson, slide);
  const quizDone = question ? attempted.has(slide) : true;
  const allQuizzesDone = teaching.every((entry) => attempted.has(entry.index));
  const firstOpen = teaching.find((entry) => !attempted.has(entry.index));
  const continueLabel =
    conversationPage < lastConversationPage
      ? "会話を続ける"
      : question && !quizDone
        ? "この内容を演習する"
        : allQuizzesDone
          ? "結果を見る"
          : "残りの演習へ";

  useEffect(() => {
    if (
      phase !== "slides" ||
      !question ||
      conversationPage !== lastConversationPage
    ) {
      return;
    }
    if (
      question.kind === "code" ||
      question.kind === "shell" ||
      question.kind === "sql" ||
      question.kind === "git"
    ) {
      const projectPreview = lesson.id === "js-run" && question.id === "q1";
      void loadCodeLab().then((module) =>
        module.preloadCodeLabDependencies(question, projectPreview),
      );
      return;
    }
    void loadQuizChallenge();
  }, [
    conversationPage,
    lastConversationPage,
    lesson.id,
    phase,
    question,
  ]);
  const nextIsSummary =
    nextIndex !== undefined && isSummarySlide(lesson.slides[nextIndex]!);
  const nextQuizLabel =
    allQuizzesDone && (nextIndex === undefined || nextIsSummary)
      ? "結果を見る"
      : "次のスライド";
  const assistantQuestion = phase === "quiz" ? question : undefined;
  const assistantPage = conversationPages[
    Math.min(conversationPage, Math.max(conversationPages.length - 1, 0))
  ];
  const checkpointPrompt =
    phase === "predict"
      ? prequestion
      : phase === "exit"
        ? `「${lesson.title}」の仕組みを、コードを見ずに1〜3文で説明してください。`
        : undefined;
  const assistantSlide =
    phase === "slides" || phase === "quiz" ? currentSlide : undefined;
  const assistantContext: LearningAssistantContext = {
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary,
    phase:
      phase === "predict"
        ? "学習前の予想"
        : phase === "slides"
          ? "スライドの説明"
          : phase === "quiz"
            ? "演習"
            : phase === "exit"
              ? "学習後の想起"
              : "講義完了",
    slideTitle: assistantSlide?.title,
    slideLead: assistantQuestion?.lead ?? assistantSlide?.lead,
    conversation:
      phase === "slides" || phase === "quiz"
        ? assistantPage?.lines.map((line) => line.text).join(" ")
        : undefined,
    points: assistantSlide?.points,
    questionPrompt: assistantQuestion?.prompt ?? checkpointPrompt,
    questionDetails: assistantQuestion
      ? assistantQuestionDetails(assistantQuestion)
      : undefined,
    firstStepHint: assistantQuestion
      ? firstStepForQuestion(assistantQuestion)
      : undefined,
    expectedAnswer: assistantQuestion?.answer,
    learnerAnswer: assistantQuestion ? currentAnswer : undefined,
    attempted: assistantQuestion ? attemptNumber > 0 : undefined,
    correct: assistantQuestion ? checked : undefined,
    feedback: assistantQuestion ? (failReason ?? undefined) : undefined,
    runtimeState: assistantQuestion
      ? [
          assistantQuestion.kind === "sql"
            ? `初期データ:\n${assistantQuestion.sqlSeed ?? "なし"}\n現在のSQL:\n${currentAnswer}`
            : assistantQuestion.kind === "git"
              ? `初期状態:\n${JSON.stringify(assistantQuestion.gitInitialState ?? {})}\n実行したコマンド:\n${currentAnswer}`
              : undefined,
          assistantRuntimeState,
        ]
          .filter(Boolean)
          .join("\n")
      : undefined,
  };

  const assistant = (
    <LearningAssistant
      key={`${lesson.id}-${phase}-${slide}`}
      context={assistantContext}
      onAssistance={
        assistantQuestion
          ? () => {
              setHintLevel((level) => Math.max(level, 1));
              recordQuestionAssistance({
                lessonId: lesson.id,
                questionId: assistantQuestion.id,
                hintUsed: true,
              });
            }
          : undefined
      }
    />
  );

  function resetAttempt(starter = "") {
    setChoice(null);
    setTyped(starter);
    setChecked(false);
    setAwarded(false);
    setFailReason(null);
    setConfidence(null);
    setHintLevel(0);
    setAnswerViewed(false);
    setMaterialReviewed(false);
    setAttemptNumber(0);
    setAttemptStartedAt(Date.now());
    setReflection("");
    setAssistantRuntimeState("");
  }

  function updateTyped(value: string) {
    setTyped(value);
    if (question?.kind === "code" || question?.kind === "shell") {
      setDrafts((current) => ({ ...current, [slide]: value }));
    }
  }

  function showSlide(index: number) {
    setSlide(index);
    setConversationPage(0);
    setPhase("slides");
    resetAttempt();
  }

  async function submit(
    correctOverride?: boolean,
    evidence?: RuntimeEvidence,
  ) {
    if (!question || checked) return;
    if (confidence === null) return;
    if (question.kind === "choice" ? !choice : currentAnswer.trim() === "") {
      return;
    }
    const gradeResult =
      correctOverride === undefined
        ? await gradeQuestion(question, currentAnswer, lesson.track, evidence)
        : {
            passed: correctOverride,
            feedback: question.explain,
            diagnostics: [] as string[],
          };
    const correct = gradeResult.passed;
    recordQuestionAttempt({
      lessonId: lesson.id,
      questionId: question.id,
      correct,
      context: question.exerciseKind === "transfer" ? "transfer" : "lesson",
      firstAttempt: attemptNumber === 0,
      supported:
        hintLevel > 0 ||
        answerViewed ||
        materialReviewed ||
        question.scaffoldLevel === "worked",
      hintLevel,
      answerViewed,
      responseTimeMs: Date.now() - attemptStartedAt,
      confidence,
      variantId: question.variantId,
      response: currentAnswer,
      misconceptionId:
        question.kind === "choice" && choice
          ? (question.misconceptionByAnswer?.[choice]?.id ?? null)
          : null,
      conceptIds: question.conceptIds,
    });
    setAttemptNumber((count) => count + 1);
    setAttemptStartedAt(Date.now());
    if (!correct) {
      setAttempted((current) => new Set(current).add(slide));
      const runtimeError =
        evidence?.runtime === "js" ? evidence.result.error : undefined;
      const loopError =
        runtimeError?.includes("タイムアウト") ||
        runtimeError?.includes("表示が多すぎて");
      setFailReason(
        loopError
          ? (runtimeError ??
              "実行がタイムアウトしました。while の中で i を増やす処理があるか確認してください。")
          : question.kind === "choice" && choice
            ? (question.feedbackByAnswer?.[choice] ?? question.explain)
            : question.kind === "sql" || question.kind === "git"
              ? [gradeResult.feedback, ...gradeResult.diagnostics].join("\n")
              : feedbackForIncorrectAnswer(question, currentAnswer),
      );
      setFailTick((n) => n + 1);
      return;
    }
    setFailReason(null);
    setChecked(true);
    setAttempted((current) => new Set(current).add(slide));
    if (!awarded) {
      setCorrectCount((n) => n + 1);
      setAwarded(true);
    }
  }

  function enterQuizFor(index: number) {
    const target = questionForSlide(lesson, index);
    if (!target) return;
    setSlide(index);
    setPhase("quiz");
    setChoice(null);
    setChecked(false);
    setAwarded(false);
    setFailReason(null);
    setTyped(
      target.kind === "code" || target.kind === "shell"
        ? (drafts[index] ?? target.starter ?? "")
        : "",
    );
  }

  function enterQuiz() {
    enterQuizFor(slide);
  }

  function finishQuiz() {
    setPhase("exit");
  }

  function completeLesson() {
    writeProgress(lesson.id, correctCount, quizTotal);
    setPhase("done");
  }

  function goToOpenQuiz() {
    if (!firstOpen) {
      finishQuiz();
      return;
    }
    showSlide(firstOpen.index);
    enterQuizFor(firstOpen.index);
  }

  function afterQuiz() {
    if (question && reflection.trim().length >= 10) {
      recordSelfExplanation({
        lessonId: lesson.id,
        questionId: question.id,
        response: reflection,
      });
    }
    const hasOpenQuiz = teaching.some(
      (entry) => entry.index !== slide && !attempted.has(entry.index),
    );
    const nextIsSummary =
      nextIndex !== undefined && isSummarySlide(lesson.slides[nextIndex]!);
    if (nextIndex === undefined || (!hasOpenQuiz && nextIsSummary)) {
      finishQuiz();
      return;
    }
    showSlide(nextIndex);
  }

  function continueFromSlide() {
    if (conversationPage < lastConversationPage) {
      setConversationPage((current) => current + 1);
      return;
    }
    if (question && !quizDone) {
      enterQuiz();
      return;
    }
    if (allQuizzesDone) {
      finishQuiz();
      return;
    }
    goToOpenQuiz();
  }

  function nextSlideOrQuiz() {
    if (conversationPage < lastConversationPage) {
      setConversationPage((current) => current + 1);
      return;
    }
    if (question && !quizDone) {
      enterQuiz();
      return;
    }
    if (nextIndex === undefined) {
      if (allQuizzesDone) finishQuiz();
      else goToOpenQuiz();
      return;
    }
    setSlide(nextIndex);
    setConversationPage(0);
  }

  function previousSlideOrConversation() {
    if (conversationPage > 0) {
      setConversationPage((current) => current - 1);
      return;
    }
    if (slide === 0) return;
    const previous = slide - 1;
    const previousSlide = lesson.slides[previous];
    setSlide(previous);
    setConversationPage(
      previousSlide
        ? Math.max(
            talkPages(previousSlide, previousSlide.listings[0]).length - 1,
            0,
          )
        : 0,
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <LearningFlowHeader
          lesson={lesson}
          navigation={navigation}
          stage="続きを開いています"
          current={1}
          total={Math.max(teachingSlideEntries(lesson).length, 1)}
        />
        <ExerciseLoading variant="quiz" />
      </div>
    );
  }

  if (phase === "predict") {
    return (
      <LearningCheckpoint
        mode="predict"
        lesson={lesson}
        navigation={navigation}
        prequestion={prequestion}
        predictionOptions={predictionOptions}
        value={prediction}
        confidence={confidence}
        comparisonLabel={previousExitRecall ? "前回の出口想起" : undefined}
        comparisonResponse={previousExitRecall || undefined}
        assistant={assistant}
        onChange={setPrediction}
        onConfidence={setConfidence}
        onContinue={() => {
          recordLessonLearningEvent({
            lessonId: lesson.id,
            context: "prequestion",
            response: prediction,
            confidence,
          });
          setPhase("slides");
          setConfidence(null);
        }}
      />
    );
  }

  if (phase === "exit") {
    return (
      <LearningCheckpoint
        mode="exit"
        lesson={lesson}
        navigation={navigation}
        prequestion={prequestion}
        predictionOptions={predictionOptions}
        exitRecallHints={exitRecallHints}
        value={exitRecall}
        confidence={confidence}
        comparisonLabel="学習前の予想"
        comparisonResponse={prediction}
        assistant={assistant}
        onChange={setExitRecall}
        onConfidence={setConfidence}
        onContinue={() => {
          recordLessonLearningEvent({
            lessonId: lesson.id,
            context: "exit-recall",
            response: exitRecall,
            confidence,
          });
          completeLesson();
        }}
      />
    );
  }

  if (codeQuiz && question) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <LearningFlowHeader
          lesson={lesson}
          navigation={navigation}
          stage="コード演習"
          current={Math.max(quizIndex, 0) + 1}
          total={quizTotal}
        />
        <CodeLab
          track={lesson.track}
          question={question}
          index={Math.max(quizIndex, 0)}
          total={quizTotal}
          correctCount={correctCount}
          typed={typed}
          checked={checked}
          failReason={failReason}
          failTick={failTick}
          onTyped={updateTyped}
          onSubmit={submit}
          onDismissFail={() => setFailReason(null)}
          onNext={afterQuiz}
          nextLabel={nextQuizLabel}
          confidence={confidence}
          onConfidence={setConfidence}
          attempted={attemptNumber > 0}
          reflection={reflection}
          onReflection={setReflection}
          assistant={assistant}
          onRuntimeStateChange={setAssistantRuntimeState}
          projectPreview={lesson.id === "js-run" && question.id === "q1"}
          onHintUsed={(level) => {
            setHintLevel(level);
            recordQuestionAssistance({
              lessonId: lesson.id,
              questionId: question.id,
              hintUsed: true,
            })
          }}
          onAnswerViewed={() => {
            setAnswerViewed(true);
            recordQuestionAssistance({
              lessonId: lesson.id,
              questionId: question.id,
              answerViewed: true,
            })
          }}
          onOpenSlide={() => {
            setMaterialReviewed(true);
            setConversationPage(lastConversationPage);
            setPhase("slides");
          }}
        />
      </div>
    );
  }

  if (phase === "quiz" && question) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-paper">
        <LearningFlowHeader
          lesson={lesson}
          navigation={navigation}
          stage="確認演習"
          current={Math.max(quizIndex, 0) + 1}
          total={quizTotal}
        />
        <QuizChallenge
          key={question.id}
          question={question}
          index={Math.max(quizIndex, 0)}
          total={quizTotal}
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
          onNext={afterQuiz}
          nextLabel={nextQuizLabel}
          confidence={confidence}
          onConfidence={setConfidence}
          attempted={attemptNumber > 0}
          reflection={reflection}
          onReflection={setReflection}
          assistant={assistant}
          onHintUsed={(level) => {
            setHintLevel(level);
            recordQuestionAssistance({
              lessonId: lesson.id,
              questionId: question.id,
              hintUsed: true,
            })
          }}
        />
        <footer className="sticky bottom-0 z-10 flex justify-start border-t border-line bg-paper px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <Button
            variant="ghost"
            onClick={() => {
              setMaterialReviewed(true);
              setPhase("slides");
            }}
          >
            スライドへ戻る
          </Button>
        </footer>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-paper">
        <LearningFlowHeader
          lesson={lesson}
          navigation={navigation}
          stage="講義完了"
        />
        <main id="main-content" className="learning-done">
          <Card className="learning-done-card">
            <CardHeader>
              <p className="course-section-kicker">今回の練習おわり</p>
              <CardTitle asChild>
                <h1>{correctCount} / {quizTotal}</h1>
              </CardTitle>
              <CardDescription>
                今回、支援なしまたは再試行で正解できた問題数です。講義の閲覧完了と、
                時間を空けても使える「習熟」は別に記録されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-mute">
                分からない点は、試したコード・期待した結果・実際の結果を添えて質問してください。
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              {assistant}
              <Button
                variant="outline"
                onClick={() => {
                  setSlide(0);
                  setConversationPage(0);
                  setPhase("predict");
                  setCorrectCount(0);
                  setAttempted(new Set());
                  setDrafts({});
                  setPrediction("");
                  setExitRecall("");
                  resetAttempt();
                }}
              >
                もう一度
              </Button>
              <Button asChild>
                <Link href={nextId ? `/lesson/${nextId}` : "/"}>
                  {nextId ? "次の講義" : "講座一覧へ"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`/reference/${referenceTopic}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  早見表で復習
                </a>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentSlide) return null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SlideTheater
        lesson={lesson}
        navigation={navigation}
        slide={currentSlide}
        index={slide}
        total={slideCount}
        conversationPages={conversationPages}
        conversationIndex={conversationPage}
        conversationTotal={conversationPages.length}
        continueLabel={continueLabel}
        onContinue={continueFromSlide}
        onPrev={previousSlideOrConversation}
        onNext={nextSlideOrQuiz}
        assistant={assistant}
      />
    </div>
  );
}

function ExerciseLoading({ variant }: { variant: "code" | "quiz" }) {
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
      <p>{variant === "code" ? "コード演習を準備中…" : "確認演習を準備中…"}</p>
    </main>
  );
}

function LearningCheckpoint({
  mode,
  lesson,
  navigation,
  prequestion,
  predictionOptions,
  exitRecallHints = [],
  value,
  confidence,
  comparisonLabel,
  comparisonResponse,
  onChange,
  onConfidence,
  onContinue,
  assistant,
}: {
  mode: "predict" | "exit";
  lesson: Lesson;
  navigation: LessonNavigationDTO;
  prequestion: string;
  predictionOptions: string[];
  exitRecallHints?: string[];
  value: string;
  confidence: number | null;
  comparisonLabel?: string;
  comparisonResponse?: string;
  onChange: (value: string) => void;
  onConfidence: (value: number) => void;
  onContinue: () => void;
  assistant?: ReactNode;
}) {
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const prediction = mode === "predict";
  const title = prediction ? "説明を見る前に予想する" : "資料を閉じて思い出す";
  const prompt = prediction
    ? prequestion
    : `「${lesson.title}」の仕組みを、コードを見ずに1〜3文で説明してください。正確さより、今取り出せることを確かめます。`;
  const visibleHints = exitRecallHints.slice(0, hintLevel);

  return (
    <div className="learning-checkpoint-shell">
      <LearningFlowHeader
        lesson={lesson}
        navigation={navigation}
        stage={prediction ? "学習前の予想" : "講義末の出口想起"}
      />
      <main id="main-content" className="learning-checkpoint">
        <Card className="learning-checkpoint-card">
          <CardHeader>
            <div className="learning-checkpoint-meta">
              <Badge variant="secondary">
                {prediction ? "学習前の予想" : "講義末の出口想起"}
              </Badge>
              {lesson.story?.project ? (
                <p className="learning-checkpoint-project">
                  {lesson.story.project}
                </p>
              ) : null}
            </div>
            <CardTitle asChild>
              <h1>{title}</h1>
            </CardTitle>
            <CardDescription className="learning-checkpoint-incident">
              {prediction ? lesson.story?.incident : lesson.story?.outcome}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <FieldSet className="learning-prediction-options">
                <FieldLegend>{prompt}</FieldLegend>
                <FieldDescription>
                  正解を当てる問題ではありません。今の考えに一番近いものを選びます。
                </FieldDescription>
                <ToggleGroup
                  type="single"
                  value={value}
                  onValueChange={(next) => {
                    if (next) onChange(next);
                  }}
                  orientation="vertical"
                  className="learning-prediction-options-list"
                >
                  {predictionOptions.map((option, index) => (
                    <ToggleGroupItem key={option} value={option}>
                      <span aria-hidden="true">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                      {value === option ? (
                        <small aria-hidden="true">選択中</small>
                      ) : null}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            ) : (
              <div className="learning-checkpoint-recall">
                <Field>
                  <FieldLabel htmlFor="learning-recall">{prompt}</FieldLabel>
                  <FieldDescription>
                    まずは何も見ずに書いてみてください。詰まったら下のヒントを1段だけ開けます。
                  </FieldDescription>
                  <Textarea
                    id="learning-recall"
                    name="lesson-exit-recall"
                    autoComplete="off"
                    value={value}
                    onChange={(event) => onChange(event.currentTarget.value)}
                    placeholder="例: 名前は宣言した範囲の中で見える。内側からは外側が見えるが、外からは内側へは戻れない…"
                  />
                </Field>
                {exitRecallHints.length > 0 ? (
                  <div className="learning-checkpoint-hints">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={hintLevel >= exitRecallHints.length}
                      onClick={() =>
                        setHintLevel((current) =>
                          Math.min(current + 1, exitRecallHints.length),
                        )
                      }
                    >
                      {hintLevel === 0
                        ? "ヒントを1段だけ見る"
                        : hintLevel < exitRecallHints.length
                          ? "次のヒントを見る"
                          : "ヒントを確認済み"}
                    </Button>
                    {visibleHints.map((hint, index) => (
                      <Alert key={hint} className="learning-checkpoint-hint">
                        <AlertTitle>
                          ヒント {index + 1}/{exitRecallHints.length}
                        </AlertTitle>
                        <AlertDescription>{hint}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            {value.trim() && comparisonResponse?.trim() ? (
              <details className="learning-checkpoint-comparison">
                <summary>書いた内容を比較する</summary>
                <p>
                  <strong>{comparisonLabel}</strong>
                  {comparisonResponse}
                </p>
                <small>
                  文章が変わったこと自体を習得とは判定しません。増えた説明と、まだ曖昧な点を確認します。
                </small>
              </details>
            ) : null}
            <Alert className="learning-checkpoint-note">
              <AlertDescription>
                {prediction
                  ? "予想は採点しません。先に考えることで、説明のどこを見るかを決めます。"
                  : "この後は休憩して構いません。睡眠時間を削って続ける必要はありません。"}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="learning-checkpoint-actions">
            {assistant}
            <Button
              disabled={value.trim() === ""}
              onClick={() => {
                if (confidence === null) {
                  setConfidenceOpen(true);
                  return;
                }
                onContinue();
              }}
            >
              {prediction
                ? "予想を残して説明を見る"
                : "思い出した内容を残して完了"}
            </Button>
          </CardFooter>
        </Card>
        <ConfidenceDialog
          open={confidenceOpen}
          value={confidence}
          onChange={onConfidence}
          onCancel={() => setConfidenceOpen(false)}
          onConfirm={() => {
            setConfidenceOpen(false);
            onContinue();
          }}
        />
      </main>
    </div>
  );
}
