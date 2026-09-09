import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCode2,
} from "lucide-react";
import type { CSSProperties } from "react";
import {
  ChapterCompletionBadge,
  ChapterCompletionCount,
  ChapterStartButton,
  CompletionCheck,
  LearningProgressProvider,
  LessonCompletionNumber,
  TrackHeroProgress,
} from "@/components/learning-progress-islands";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TrackPageDTO } from "@/lib/course/client-dtos";
import { TRACK_META } from "@/lib/track-meta";

export function TrackDetail({ course }: { course: TrackPageDTO }) {
  const { track, chapters, lessonCount, totalMinutes } = course;
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const meta = TRACK_META[track];
  const lessonIds = lessons.map((lesson) => lesson.id);

  return (
    <main
      id="main-content"
      className="track-detail-page"
      style={{ "--track-accent": meta.accent } as CSSProperties}
    >
      <div className="track-detail-shell">
        <LearningProgressProvider>
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
                {lessonCount}講義
              </span>
              <span>
                <FileCode2 aria-hidden="true" />
                {lessonCount}演習
              </span>
              <span>
                <Clock3 aria-hidden="true" />
                目安{Math.max(1, Math.round(totalMinutes / 60))}時間
              </span>
            </div>
            <TrackHeroProgress
              lessonIds={lessonIds}
              lessonCount={lessonCount}
              trackName={meta.name}
            />
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
              {chapters.map((chapter) => {
                const chapterLessonIds = chapter.lessons.map(
                  (lesson) => lesson.id,
                );
                return (
                  <li key={chapter.id}>
                    <a href={`#${chapter.id}`}>
                      <span>{String(chapter.order).padStart(2, "0")}</span>
                      {chapter.title}
                      <CompletionCheck lessonIds={chapterLessonIds} />
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
              {chapters.map((chapter, index) => {
                const chapterLessons = chapter.lessons;
                const chapterLessonIds = chapterLessons.map(
                  (lesson) => lesson.id,
                );
                const chapterMinutes = chapterLessons.reduce(
                  (sum, lesson) => sum + lesson.minutes,
                  0,
                );
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
                          <Badge>{chapter.levelLabel}</Badge>
                          <ChapterCompletionBadge lessonIds={chapterLessonIds} />
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
                      {chapterLessons[0] ? (
                        <CardFooter>
                          <ChapterStartButton lessonIds={chapterLessonIds} />
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
                            <ChapterCompletionCount
                              lessonIds={chapterLessonIds}
                            />
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol>
                              {chapterLessons.map((lesson, lessonIndex) => {
                                return (
                                  <li key={lesson.id}>
                                    <Link href={`/lesson/${lesson.id}`}>
                                      <span className="track-lesson-number">
                                        <LessonCompletionNumber
                                          lessonId={lesson.id}
                                          number={String(lessonIndex + 1).padStart(
                                            2,
                                            "0",
                                          )}
                                        />
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
        </LearningProgressProvider>
      </div>
    </main>
  );
}
