"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileCode2,
  Play,
} from "lucide-react";
import { useMemo, useSyncExternalStore, type CSSProperties } from "react";
import { TrackIllustration } from "@/components/track-illustration";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  LEVEL_LABEL,
  lessonsByChapter,
  type Lesson,
  type Track,
} from "@/lib/course";
import {
  emptyLearningStateSnapshot,
  learningStateSnapshot,
  subscribeLearningState,
  type LearningState,
} from "@/lib/progress";
import { TRACK_META } from "@/lib/track-meta";

export function TrackDetail({
  track,
  lessons,
}: {
  track: Track;
  lessons: Lesson[];
}) {
  const json = useSyncExternalStore(
    subscribeLearningState,
    learningStateSnapshot,
    emptyLearningStateSnapshot,
  );
  const state = useMemo(() => JSON.parse(json) as LearningState, [json]);
  const meta = TRACK_META[track];
  const groups = lessonsByChapter(lessons);
  const completed = lessons.filter((lesson) => state.lessons[lesson.id]).length;
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const progress = lessons.length ? (completed / lessons.length) * 100 : 0;
  const nextLesson =
    lessons.find((lesson) => !state.lessons[lesson.id]) ?? lessons[0];

  return (
    <main
      id="main-content"
      className="track-detail-page"
      style={{ "--track-accent": meta.accent } as CSSProperties}
    >
      <div className="track-detail-shell">
        <Link href="/" className="track-back-link">
          <ArrowLeft aria-hidden="true" />
          講座一覧へ戻る
        </Link>

        <Card className="track-hero-card">
          <div className="track-hero-copy">
            <CardHeader>
              <Badge variant="secondary">{meta.badge}</Badge>
              <CardTitle asChild>
                <h1>{meta.name} 入門</h1>
              </CardTitle>
              <CardDescription>{meta.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="track-outcome">
                <CheckCircle2 aria-hidden="true" />
                この講座の完成目標
                <strong>{meta.outcome}</strong>
              </p>
            </CardContent>
          </div>
          <div className="track-hero-visual">
            <TrackIllustration track={track} />
          </div>
          <CardFooter className="track-hero-footer">
            <div className="track-hero-facts">
              <span>
                <BookOpen aria-hidden="true" />
                {lessons.length}講義
              </span>
              <span>
                <FileCode2 aria-hidden="true" />
                {lessons.length}演習
              </span>
              <span>
                <Clock3 aria-hidden="true" />
                目安{Math.max(1, Math.round(minutes / 60))}時間
              </span>
            </div>
            <div className="track-hero-progress">
              <div>
                <span>{completed}/{lessons.length}講義完了</span>
                <strong>{Math.round(progress)}%</strong>
              </div>
              <Progress
                value={progress}
                aria-label={`${meta.name}の講義完了率`}
                indicatorClassName="bg-[var(--track-accent)]"
              />
            </div>
            {nextLesson ? (
              <Button asChild>
                <Link href={`/lesson/${nextLesson.id}`}>
                  <Play aria-hidden="true" className="size-4 fill-current" />
                  {completed > 0 ? "続きから学ぶ" : "最初から学ぶ"}
                </Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>

        <Alert className="track-notice" role="note">
          <AlertTitle>{meta.name}を学ぶ前に</AlertTitle>
          <AlertDescription>
            図と会話で仕組みを確認したあと、同じ内容を自分で書きます。
            分からない講義は飛ばさず、各編の上から順に進めるのがおすすめです。
          </AlertDescription>
        </Alert>

        <div className="track-curriculum-layout">
          <nav className="track-chapter-nav" aria-label={`${meta.name}の編一覧`}>
            <p>講座の編</p>
            <ol>
              {groups.map(({ chapter, lessons: chapterLessons }) => {
                const chapterDone = chapterLessons.every(
                  (lesson) => state.lessons[lesson.id],
                );
                return (
                  <li key={chapter.id}>
                    <a href={`#${chapter.id}`}>
                      <span>{String(chapter.order).padStart(2, "0")}</span>
                      {chapter.title}
                      {chapterDone ? (
                        <Check aria-label="完了" className="size-4" />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="track-curriculum" aria-labelledby="curriculum-title">
            <div className="course-section-heading">
              <div>
                <p className="course-section-kicker">講義一覧</p>
                <h2 id="curriculum-title">{meta.name}で学ぶ内容</h2>
              </div>
              <p>
                各編で基礎から始め、注文管理の実装へつなげます。
              </p>
            </div>

            <div className="track-chapter-list">
              {groups.map(({ chapter, lessons: chapterLessons }, index) => {
                const chapterCompleted = chapterLessons.filter(
                  (lesson) => state.lessons[lesson.id],
                ).length;
                const chapterMinutes = chapterLessons.reduce(
                  (sum, lesson) => sum + lesson.minutes,
                  0,
                );
                const firstOpen =
                  chapterLessons.find((lesson) => !state.lessons[lesson.id]) ??
                  chapterLessons[0];
                return (
                  <Card
                    key={chapter.id}
                    id={chapter.id}
                    className="track-chapter-card"
                  >
                    <div className="track-chapter-summary">
                      <div className="track-chapter-illustration">
                        <TrackIllustration track={track} compact />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <CardHeader>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{LEVEL_LABEL[chapterLessons[0]?.level ?? "start"]}</Badge>
                          {chapterCompleted === chapterLessons.length ? (
                            <Badge variant="secondary">
                              <Check aria-hidden="true" className="size-3.5" />
                              完了
                            </Badge>
                          ) : null}
                        </div>
                        <CardTitle>{chapter.title}</CardTitle>
                        <CardDescription>{chapter.summary}</CardDescription>
                        <div className="track-chapter-meta">
                          <span>
                            <BookOpen aria-hidden="true" />
                            {chapterLessons.length}講義
                          </span>
                          <span>
                            <Clock3 aria-hidden="true" />
                            約{chapterMinutes}分
                          </span>
                        </div>
                      </CardHeader>
                      {firstOpen ? (
                        <CardFooter>
                          <Button asChild variant="outline">
                            <Link href={`/lesson/${firstOpen.id}`}>
                              {chapterCompleted > 0 ? "続きから" : "この編を始める"}
                            </Link>
                          </Button>
                        </CardFooter>
                      ) : null}
                    </div>

                    <CardContent className="track-chapter-lessons">
                      <Accordion
                        type="single"
                        collapsible
                        defaultValue={index === 0 ? chapter.id : undefined}
                      >
                        <AccordionItem value={chapter.id}>
                          <AccordionTrigger>
                            この編で学ぶこと
                            <span>
                              {chapterCompleted}/{chapterLessons.length}完了
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol>
                              {chapterLessons.map((lesson, lessonIndex) => {
                                const done = Boolean(state.lessons[lesson.id]);
                                return (
                                  <li key={lesson.id}>
                                    <Link href={`/lesson/${lesson.id}`}>
                                      <span className="track-lesson-number">
                                        {done ? (
                                          <Check aria-label="完了" />
                                        ) : (
                                          String(lessonIndex + 1).padStart(2, "0")
                                        )}
                                      </span>
                                      <span>
                                        <strong>{lesson.title}</strong>
                                        <small>{lesson.summary}</small>
                                      </span>
                                      <small>{lesson.minutes}分</small>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
