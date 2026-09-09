"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  RotateCcw,
} from "lucide-react";
import { useSyncExternalStore, type CSSProperties } from "react";
import { TrackIllustration } from "@/components/track-illustration";
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
import { Progress } from "@/components/ui/progress";
import type {
  HomePageDTO,
  HomeTrackDTO,
} from "@/lib/course/client-dtos";
import {
  getLearningStateSnapshot,
  getServerLearningStateSnapshot,
  learningStats,
  subscribeLearningState,
  type LearningState,
} from "@/lib/progress";
import { TRACK_META } from "@/lib/track-meta";

export function HomeTracks({ course }: { course: HomePageDTO }) {
  const state = useSyncExternalStore(
    subscribeLearningState,
    getLearningStateSnapshot,
    getServerLearningStateSnapshot,
  );
  const stats = learningStats(state);

  return (
    <section id="course-catalog" className="course-catalog-main">
      <section className="course-catalog-section" aria-labelledby="catalog-title">
        <div className="course-section-heading">
          <div>
            <p className="course-section-kicker">言語ごとに選ぶ</p>
            <h2 id="catalog-title">5つの講座で、作る力をつなげる</h2>
          </div>
          <p>
            プログラム、API、データベース、共同開発を、
            注文管理システムの完成まで一つずつつなぎます。
          </p>
        </div>

        <div className="course-card-grid">
          {course.tracks.map((track, index) => (
            <TrackCard
              key={track.track}
              course={track}
              order={index + 1}
              state={state}
            />
          ))}
        </div>
      </section>

      <section className="catalog-review" aria-labelledby="review-heading">
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
      </section>
    </section>
  );
}

function TrackCard({
  course,
  order,
  state,
}: {
  course: HomeTrackDTO;
  order: number;
  state: LearningState;
}) {
  const { track, lessonIds, lessonCount, totalMinutes } = course;
  const meta = TRACK_META[track];
  const completed = lessonIds.filter((id) => state.lessons[id]).length;
  const progress = lessonCount ? (completed / lessonCount) * 100 : 0;

  return (
    <Card
      className="course-track-card"
      style={{ "--track-accent": meta.accent } as CSSProperties}
    >
      <Link
        href={`/track/${track}`}
        className="course-track-card-link"
        aria-label={`${meta.name}講座を見る`}
      >
        <div className="course-track-visual">
          <TrackIllustration track={track} />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary">{meta.badge}</Badge>
            <span className="course-card-order">
              {String(order).padStart(2, "0")}
            </span>
          </div>
          <CardTitle>{meta.name}</CardTitle>
          <CardDescription>{meta.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent className="course-track-stats">
          <span>
            <BookOpen aria-hidden="true" />
            全{lessonCount}講義
          </span>
          <span>
            <Clock3 aria-hidden="true" />
            約{Math.max(1, Math.round(totalMinutes / 60))}時間
          </span>
        </CardContent>
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
            aria-label={`${meta.name}の講義完了率`}
            indicatorClassName="bg-[var(--track-accent)]"
          />
          <span className="course-track-open">
            講座を見る
            <span aria-hidden="true">→</span>
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
