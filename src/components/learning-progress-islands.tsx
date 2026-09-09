"use client";

import Link from "next/link";
import { Check, CheckCircle2, Play, RotateCcw } from "lucide-react";
import {
  createContext,
  use,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getLearningStateSnapshot,
  getServerLearningStateSnapshot,
  learningStats,
  subscribeLearningState,
  type LearningState,
} from "@/lib/progress";

const LearningStateContext = createContext<LearningState | null>(null);

export function LearningProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const state = useSyncExternalStore(
    subscribeLearningState,
    getLearningStateSnapshot,
    getServerLearningStateSnapshot,
  );
  return (
    <LearningStateContext value={state}>{children}</LearningStateContext>
  );
}

function useLearningState() {
  const state = use(LearningStateContext);
  if (!state) {
    throw new Error("LearningProgressProviderが必要です。");
  }
  return state;
}

function completedCount(lessonIds: string[], state: LearningState) {
  return lessonIds.filter((id) => state.lessons[id]).length;
}

export function HomeTrackProgress({
  lessonIds,
  lessonCount,
  trackName,
}: {
  lessonIds: string[];
  lessonCount: number;
  trackName: string;
}) {
  const completed = completedCount(lessonIds, useLearningState());
  const progress = lessonCount ? (completed / lessonCount) * 100 : 0;

  return (
    <CardFooter className="course-track-progress">
      <div>
        <span>
          <CheckCircle2 aria-hidden="true" />
          {completed}/{lessonCount}講義完了
        </span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <Progress
        value={progress}
        aria-label={`${trackName}の講義完了率`}
        indicatorClassName="bg-[var(--track-accent)]"
      />
      <span className="course-track-open">
        講座を見る
        <span aria-hidden="true">→</span>
      </span>
    </CardFooter>
  );
}

export function ReviewProgressSummary() {
  const stats = learningStats(useLearningState());
  return (
    <>
      <div>
        <Badge variant="secondary">
          <RotateCcw aria-hidden="true" className="size-3.5" />
          記憶のメンテナンス
        </Badge>
        <h2 id="review-heading">忘れかけた内容を、短く復習する</h2>
        <p>
          {stats.dueCount > 0
            ? `期限を迎えた問題が${stats.dueCount}問あります。`
            : stats.practicedCount > 0
              ? "最近学んだ問題から、期限前の復習もできます。"
              : "演習を解くと、ここへ復習問題が集まります。"}
        </p>
      </div>
      <dl>
        <div>
          <dt>期限到来</dt>
          <dd>{stats.dueCount}</dd>
        </div>
        <div>
          <dt>保持確認</dt>
          <dd>{stats.retainedCount}</dd>
        </div>
        <div>
          <dt>無支援保持率</dt>
          <dd>
            {stats.independentRetentionRate === null
              ? "—"
              : `${Math.round(stats.independentRetentionRate * 100)}%`}
          </dd>
        </div>
        <div>
          <dt>初回答の自信差（小ほど良）</dt>
          <dd>
            {stats.calibrationError === null
              ? "—"
              : `${Math.round(stats.calibrationError * 100)}pt`}
          </dd>
        </div>
      </dl>
      <Button asChild>
        <Link href="/review">
          {stats.dueCount > 0 ? "期限問題を復習" : "復習を始める"}
        </Link>
      </Button>
    </>
  );
}

export function TrackHeroProgress({
  lessonIds,
  lessonCount,
  trackName,
}: {
  lessonIds: string[];
  lessonCount: number;
  trackName: string;
}) {
  const state = useLearningState();
  const completed = completedCount(lessonIds, state);
  const progress = lessonCount ? (completed / lessonCount) * 100 : 0;
  const nextLessonId =
    lessonIds.find((lessonId) => !state.lessons[lessonId]) ?? lessonIds[0];

  return (
    <>
      <div className="track-hero-progress">
        <div>
          <span>{completed}/{lessonCount}講義完了</span>
          <strong>{Math.round(progress)}%</strong>
        </div>
        <Progress
          value={progress}
          aria-label={`${trackName}の講義完了率`}
          indicatorClassName="bg-[var(--track-accent)]"
        />
      </div>
      {nextLessonId ? (
        <Button asChild>
          <Link href={`/lesson/${nextLessonId}`}>
            <Play aria-hidden="true" className="size-4 fill-current" />
            {completed > 0 ? "続きから学ぶ" : "最初から学ぶ"}
          </Link>
        </Button>
      ) : null}
    </>
  );
}

export function CompletionCheck({ lessonIds }: { lessonIds: string[] }) {
  const state = useLearningState();
  return lessonIds.every((id) => state.lessons[id]) ? (
    <Check aria-label="完了" className="size-4" />
  ) : null;
}

export function ChapterCompletionBadge({
  lessonIds,
}: {
  lessonIds: string[];
}) {
  const state = useLearningState();
  return lessonIds.every((id) => state.lessons[id]) ? (
    <Badge variant="secondary">
      <Check aria-hidden="true" className="size-3.5" />
      完了
    </Badge>
  ) : null;
}

export function ChapterStartButton({
  lessonIds,
}: {
  lessonIds: string[];
}) {
  const state = useLearningState();
  const completed = completedCount(lessonIds, state);
  const firstOpen =
    lessonIds.find((lessonId) => !state.lessons[lessonId]) ?? lessonIds[0];
  return firstOpen ? (
    <Button asChild variant="outline">
      <Link href={`/lesson/${firstOpen}`}>
        {completed > 0 ? "続きから" : "この編を始める"}
      </Link>
    </Button>
  ) : null;
}

export function ChapterCompletionCount({
  lessonIds,
}: {
  lessonIds: string[];
}) {
  const completed = completedCount(lessonIds, useLearningState());
  return (
    <span>
      {completed}/{lessonIds.length}完了
    </span>
  );
}

export function LessonCompletionNumber({
  lessonId,
  number,
}: {
  lessonId: string;
  number: string;
}) {
  const state = useLearningState();
  return state.lessons[lessonId] ? (
    <Check aria-label="完了" />
  ) : (
    number
  );
}
