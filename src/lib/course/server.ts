import "server-only";

import { githubAdvanced } from "./github-advanced";
import { githubStart } from "./github-start";
import { jsAdvanced } from "./js-advanced";
import { jsBasic } from "./js-basic";
import { jsCallback } from "./js-callback";
import { jsDom } from "./js-dom";
import { jsMiddle } from "./js-middle";
import { jsModern } from "./js-modern";
import { jsNpm } from "./js-npm";
import { jsStart } from "./js-start";
import { languageChallenges } from "./language-challenges";
import {
  CHAPTERS,
  chaptersByTrack,
  getChapter,
  lessonsByChapter,
} from "./chapters";
import {
  applyCourseLearningDesign,
  exitRecallHintsForLesson,
  predictionOptionsForLesson,
  prequestionForLesson,
} from "./learning-design";
import { nodeCore } from "./node-core";
import { nodeStart } from "./node-start";
import { sqlAdvanced } from "./sql-advanced";
import { sqlStart } from "./sql-start";
import { tsLessons } from "./ts-lessons";
import { tsModern } from "./ts-modern";
import {
  LEVEL_LABEL,
  TRACK_ACCENT,
  TRACK_LABEL,
  TRACK_ORDER,
  type Lesson,
  type Track,
} from "./types";
import type {
  HomePageDTO,
  LessonPageDTO,
  ReviewPageDTO,
  TrackPageDTO,
} from "./client-dtos";
import {
  REVIEW_API_VERSION,
  type ReviewBatchRequest,
} from "../review-contract";
import { resolveReviewBatchFromLessons } from "../review-resolver";
import { listingsFor } from "./diagram-listings";
import { sourcesForDiagram } from "./sources";

const rawLessons: Lesson[] = [
  ...jsStart,
  ...jsBasic,
  ...jsCallback,
  ...jsMiddle,
  ...jsModern,
  ...jsAdvanced,
  ...jsDom,
  ...jsNpm,
  ...tsLessons,
  ...tsModern,
  ...nodeStart,
  ...nodeCore,
  ...languageChallenges,
  ...sqlStart,
  ...sqlAdvanced,
  ...githubStart,
  ...githubAdvanced,
];

export const lessons: Lesson[] = applyCourseLearningDesign(rawLessons);

export {
  CHAPTERS,
  chaptersByTrack,
  getChapter,
  lessonsByChapter,
  LEVEL_LABEL,
  prequestionForLesson,
  TRACK_ACCENT,
  TRACK_LABEL,
  TRACK_ORDER,
};

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function lessonsByTrack(track: Track): Lesson[] {
  return lessons
    .filter((lesson) => lesson.track === track)
    .sort((a, b) => a.order - b.order);
}

export function nextLessonId(id: string): string | undefined {
  const current = getLesson(id);
  if (!current) return undefined;
  const trackLessons = lessonsByTrack(current.track);
  const currentLessonIndex = trackLessons.findIndex(
    (lesson) => lesson.id === current.id,
  );
  const inTrack = trackLessons[currentLessonIndex + 1];
  if (inTrack) return inTrack.id;
  const currentTrackIndex = TRACK_ORDER.indexOf(current.track);
  for (const nextTrack of TRACK_ORDER.slice(currentTrackIndex + 1)) {
    const first = lessonsByTrack(nextTrack)[0];
    if (first) return first.id;
  }
  return undefined;
}

export function getHomePageDTO(): HomePageDTO {
  return {
    tracks: TRACK_ORDER.map((track) => {
      const trackLessons = lessonsByTrack(track);
      return {
        track,
        lessonIds: trackLessons.map((lesson) => lesson.id),
        lessonCount: trackLessons.length,
        totalMinutes: trackLessons.reduce(
          (sum, lesson) => sum + lesson.minutes,
          0,
        ),
      };
    }),
  };
}

export function getTrackPageDTO(track: Track): TrackPageDTO {
  const trackLessons = lessonsByTrack(track);
  return {
    track,
    lessonCount: trackLessons.length,
    totalMinutes: trackLessons.reduce(
      (sum, lesson) => sum + lesson.minutes,
      0,
    ),
    chapters: lessonsByChapter(trackLessons).map(
      ({ chapter, lessons: chapterLessons }) => ({
        id: chapter.id,
        order: chapter.order,
        title: chapter.title,
        summary: chapter.summary,
        levelLabel: LEVEL_LABEL[chapterLessons[0]?.level ?? "start"],
        lessons: chapterLessons.map(({ id, title, summary, minutes }) => ({
          id,
          title,
          summary,
          minutes,
        })),
      }),
    ),
  };
}

export function getLessonPageDTO(id: string): LessonPageDTO | undefined {
  const lesson = getLesson(id);
  if (!lesson) return undefined;
  const chapter = getChapter(lesson.chapter);
  return {
    lesson: {
      ...lesson,
      slides: lesson.slides.map((slide) => ({
        ...slide,
        listings: listingsFor(slide),
        sources: sourcesForDiagram(slide.diagram),
      })),
    },
    prequestion: prequestionForLesson(lesson),
    predictionOptions: predictionOptionsForLesson(lesson),
    exitRecallHints: exitRecallHintsForLesson(lesson),
    navigation: {
      trackLabel: TRACK_LABEL[lesson.track],
      chapterTitle: chapter?.title ?? lesson.title,
      outline: lessonsByChapter(lessonsByTrack(lesson.track)).map(
        ({ chapter: outlineChapter, lessons: chapterLessons }) => ({
          id: outlineChapter.id,
          title: outlineChapter.title,
          lessons: chapterLessons.map(({ id: lessonId, title, minutes }) => ({
            id: lessonId,
            title,
            minutes,
          })),
        }),
      ),
      nextLessonId: nextLessonId(lesson.id) ?? null,
    },
  };
}

export function getLessonMetadata(id: string) {
  const lesson = getLesson(id);
  if (!lesson) return undefined;
  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export function getReviewPageDTO(): ReviewPageDTO {
  let catalogOrder = 0;
  return {
    version: REVIEW_API_VERSION,
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      track: lesson.track,
      chapter: lesson.chapter,
      chapterTitle: getChapter(lesson.chapter)?.title ?? lesson.title,
      title: lesson.title,
      questions: lesson.questions.map((question) => ({
        id: question.id,
        kind: question.kind,
        contrastGroup: question.contrastGroup ?? null,
        catalogOrder: catalogOrder++,
      })),
    })),
  };
}

export function resolveReviewBatch(request: ReviewBatchRequest) {
  return resolveReviewBatchFromLessons(
    lessons,
    request,
    (lesson) => getChapter(lesson.chapter)?.title ?? lesson.title,
  );
}
