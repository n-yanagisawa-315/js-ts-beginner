"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CodeLab } from "@/components/code-lab";
import { ConfidenceScale } from "@/components/confidence-scale";
import { QuizChallenge } from "@/components/quiz-challenge";
import { SlideTheater } from "@/components/slide-theater";
import {
  LEVEL_LABEL,
  TRACK_LABEL,
  getChapter,
  nextLessonId,
  prequestionForLesson,
  type Lesson,
} from "@/lib/course";
import {
  nextSlideIndex,
  questionForSlide,
  talkPages,
  teachingSlideEntries,
} from "@/lib/course/slide-layout";
import { feedbackForIncorrectAnswer, grade } from "@/lib/grade";
import { gradeCodeByBehavior } from "@/lib/grade-behavior";
import {
  recordQuestionAssistance,
  recordQuestionAttempt,
  recordSelfExplanation,
  recordLessonLearningEvent,
  emptyLearningStateSnapshot,
  learningStateSnapshot,
  subscribeLearningState,
  type LearningState,
  writeProgress,
} from "@/lib/progress";

type Phase = "predict" | "slides" | "quiz" | "exit" | "done";

export function LessonStudio({ lesson }: { lesson: Lesson }) {
  const [phase, setPhase] = useState<Phase>("predict");
  const [slide, setSlide] = useState(0);
  const [conversationPage, setConversationPage] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [awarded, setAwarded] = useState(false);
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set());
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
  const learningJson = useSyncExternalStore(
    subscribeLearningState,
    learningStateSnapshot,
    emptyLearningStateSnapshot,
  );
  const previousExitRecall = useMemo(() => {
    const state = JSON.parse(learningJson) as LearningState;
    return (
      state.lessonEvents
        .filter(
          (event) =>
            event.lessonId === lesson.id && event.context === "exit-recall",
        )
        .at(-1)?.response ?? ""
    );
  }, [learningJson, lesson.id]);

  const question = questionForSlide(lesson, slide);
  const nextId = nextLessonId(lesson.id);
  const currentAnswer = question?.kind === "choice" ? (choice ?? "") : typed;
  const isCorrect = useMemo(
    () => (question ? grade(question, currentAnswer) : false),
    [question, currentAnswer],
  );
  const currentSlide = lesson.slides[slide];
  const conversationPages = currentSlide ? talkPages(currentSlide) : [];
  const lastConversationPage = Math.max(conversationPages.length - 1, 0);
  const chapterTitle = getChapter(lesson.chapter)?.title ?? TRACK_LABEL[lesson.track];
  const referenceTopic =
    lesson.track === "js"
      ? "javascript"
      : lesson.track === "ts"
        ? "typescript"
        : "node";
  const slideCount = lesson.slides.length;
  const teaching = teachingSlideEntries(lesson);
  const quizTotal = teaching.length;
  const quizIndex = teaching.findIndex((entry) => entry.index === slide);
  const codeQuiz =
    phase === "quiz" &&
    (question?.kind === "code" || question?.kind === "shell");
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
  const nextQuizLabel =
    nextIndex === undefined && allQuizzesDone ? "結果を見る" : "次のスライド";

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

  async function submit() {
    if (!question || checked) return;
    if (confidence === null) return;
    if (question.kind === "choice" ? !choice : currentAnswer.trim() === "") {
      return;
    }
    const correct =
      question.kind === "code"
        ? await gradeCodeByBehavior(question, currentAnswer, lesson.track)
        : isCorrect;
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
      setFailReason(
        question.kind === "choice" && choice
          ? (question.feedbackByAnswer?.[choice] ?? question.explain)
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
    if (nextIndex === undefined) {
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
      previousSlide ? Math.max(talkPages(previousSlide).length - 1, 0) : 0,
    );
  }

  if (phase === "predict") {
    return (
      <LearningCheckpoint
        mode="predict"
        lesson={lesson}
        value={prediction}
        confidence={confidence}
        comparisonLabel={previousExitRecall ? "前回の出口想起" : undefined}
        comparisonResponse={previousExitRecall || undefined}
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
        value={exitRecall}
        confidence={confidence}
        comparisonLabel="学習前の予想"
        comparisonResponse={prediction}
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
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="btn btn-ghost min-h-11 px-3 text-sm text-mute hover:text-ink"
          >
            講座一覧
          </Link>
          <p className="font-mono text-xs text-mute">
            {TRACK_LABEL[lesson.track]} / {LEVEL_LABEL[lesson.level]}
          </p>
        </header>
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
          failTick={failTick}
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
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMaterialReviewed(true);
              setPhase("slides");
            }}
          >
            スライドへ戻る
          </button>
        </footer>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-paper">
        <article className="flex flex-1 flex-col items-start justify-center px-5 py-16 sm:px-10 lg:px-14">
          <p className="font-mono text-xs tracking-[0.18em] text-studio">
            今回の練習おわり
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">
            {correctCount} / {quizTotal}
          </h1>
          <p className="mt-5 max-w-md leading-7 text-mute">
            今回、支援なしまたは再試行で正解できた問題数です。講義の閲覧完了と、
            時間を空けても使える「習熟」は別に記録されます。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
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
              className="btn btn-line"
            >
              もう一度
            </button>
            {nextId ? (
              <Link href={`/lesson/${nextId}`} className="btn btn-primary">
                次の講義
              </Link>
            ) : (
              <Link href="/" className="btn btn-primary">
                講座一覧へ
              </Link>
            )}
            <a
              href={`/reference/${referenceTopic}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-line"
            >
              早見表で復習
            </a>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-mute">
            分からない点は、試したコード・期待した結果・実際の結果を添えて質問してください。
          </p>
        </article>
      </div>
    );
  }

  if (!currentSlide) return null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SlideTheater
        kicker={`${chapterTitle} · ${lesson.title}`}
        slide={currentSlide}
        index={slide}
        total={slideCount}
        conversationIndex={conversationPage}
        conversationTotal={conversationPages.length}
        continueLabel={continueLabel}
        onContinue={continueFromSlide}
        onPrev={previousSlideOrConversation}
        onNext={nextSlideOrQuiz}
      />
    </div>
  );
}

function LearningCheckpoint({
  mode,
  lesson,
  value,
  confidence,
  comparisonLabel,
  comparisonResponse,
  onChange,
  onConfidence,
  onContinue,
}: {
  mode: "predict" | "exit";
  lesson: Lesson;
  value: string;
  confidence: number | null;
  comparisonLabel?: string;
  comparisonResponse?: string;
  onChange: (value: string) => void;
  onConfidence: (value: number) => void;
  onContinue: () => void;
}) {
  const prediction = mode === "predict";
  const title = prediction ? "説明を見る前に予想する" : "資料を閉じて思い出す";
  const prompt = prediction
    ? prequestionForLesson(lesson)
    : `「${lesson.title}」の仕組みを、コードを見ずに1〜3文で説明してください。正確さより、今取り出せることを確かめます。`;

  return (
    <main className="learning-checkpoint">
      <article>
        <p className="learning-checkpoint-step">
          {prediction ? "学習前の予想" : "講義末の出口想起"}
        </p>
        <p className="learning-checkpoint-project">
          {lesson.story?.project}
        </p>
        <h1>{title}</h1>
        <p className="learning-checkpoint-incident">
          {prediction ? lesson.story?.incident : lesson.story?.outcome}
        </p>
        <label htmlFor="learning-recall">{prompt}</label>
        <textarea
          id="learning-recall"
          name={prediction ? "lesson-prediction" : "lesson-exit-recall"}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder={
            prediction
              ? "例: 値を1つずつ調べる処理が必要そう…"
              : "例: 右側を先に計算し、その値を左の名前へ結び付ける…"
          }
        />
        <ConfidenceScale value={confidence} onChange={onConfidence} />
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
        <div className="learning-checkpoint-actions">
          {prediction && value.trim() === "" ? (
            <button
              type="button"
              className="btn btn-line"
              onClick={() => onChange("まだ分からない。説明で確かめたい。")}
            >
              まだ分からない
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            disabled={value.trim() === "" || confidence === null}
            onClick={onContinue}
          >
            {prediction ? "予想を残して説明を見る" : "思い出した内容を残して完了"}
          </button>
        </div>
        <p className="learning-checkpoint-note">
          {prediction
            ? "予想は採点しません。先に考えることで、説明のどこを見るかを決めます。"
            : "この後は休憩して構いません。睡眠時間を削って続ける必要はありません。"}
        </p>
      </article>
    </main>
  );
}
