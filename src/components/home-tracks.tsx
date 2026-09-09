import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
import type { CSSProperties } from "react";
import {
  HomeTrackProgress,
  LearningProgressProvider,
  ReviewProgressSummary,
} from "@/components/learning-progress-islands";
import { TrackIllustration } from "@/components/track-illustration";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  HomePageDTO,
  HomeTrackDTO,
} from "@/lib/course/client-dtos";
import { TRACK_META } from "@/lib/track-meta";

export function HomeTracks({ course }: { course: HomePageDTO }) {
  return (
    <section id="course-catalog" className="course-catalog-main">
      <LearningProgressProvider>
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
              />
            ))}
          </div>
        </section>

        <section className="catalog-review" aria-labelledby="review-heading">
          <ReviewProgressSummary />
        </section>
      </LearningProgressProvider>
    </section>
  );
}

function TrackCard({
  course,
  order,
}: {
  course: HomeTrackDTO;
  order: number;
}) {
  const { track, lessonIds, lessonCount, totalMinutes } = course;
  const meta = TRACK_META[track];

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
        <HomeTrackProgress
          lessonIds={lessonIds}
          lessonCount={lessonCount}
          trackName={meta.name}
        />
      </Link>
    </Card>
  );
}
