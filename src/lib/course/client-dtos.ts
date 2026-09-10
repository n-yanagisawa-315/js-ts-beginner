import type {
  ChapterId,
  Lesson,
  Question,
  Slide,
  Track,
} from "./types";

export type HomeTrackDTO = {
  track: Track;
  lessonIds: string[];
  lessonCount: number;
  totalMinutes: number;
};

export type HomePageDTO = {
  tracks: HomeTrackDTO[];
};

export type TrackLessonDTO = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
};

export type TrackChapterDTO = {
  id: ChapterId;
  order: number;
  title: string;
  summary: string;
  levelLabel: string;
  lessons: TrackLessonDTO[];
};

export type TrackPageDTO = {
  track: Track;
  lessonCount: number;
  totalMinutes: number;
  chapters: TrackChapterDTO[];
};

export type LessonOutlineChapterDTO = {
  id: ChapterId;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    minutes: number;
  }>;
};

export type LessonNavigationDTO = {
  trackLabel: string;
  chapterTitle: string;
  outline: LessonOutlineChapterDTO[];
  nextLessonId: string | null;
};

export type ResolvedSlideListingDTO = {
  code: string;
  label: string;
};

export type ResolvedSlideSourceDTO = {
  title: string;
  url: string;
  publisher: string;
};

export type ResolvedSlideDTO = Slide & {
  listings: ResolvedSlideListingDTO[];
  sources: ResolvedSlideSourceDTO[];
};

export type ResolvedLessonDTO = Omit<Lesson, "slides"> & {
  slides: ResolvedSlideDTO[];
};

export type LessonPageDTO = {
  lesson: ResolvedLessonDTO;
  prequestion: string;
  predictionOptions: string[];
  navigation: LessonNavigationDTO;
};

export type ReviewQuestionIndexDTO = {
  id: string;
  kind: Question["kind"];
  contrastGroup: string | null;
  catalogOrder: number;
};

export type ReviewLessonDTO = {
  id: string;
  track: Track;
  chapter: ChapterId;
  chapterTitle: string;
  title: string;
  questions: ReviewQuestionIndexDTO[];
};

export type ReviewPageDTO = {
  version: 1;
  lessons: ReviewLessonDTO[];
};

export function exerciseSceneLabel(question: Pick<Question, "scenario" | "projectRole">) {
  const scenario = question.scenario?.trim();
  if (!scenario) return "";
  if (question.projectRole === "transfer") {
    return scenario.startsWith("別の場面")
      ? scenario
      : `別の場面へ応用: ${scenario}`;
  }
  if (question.projectRole === "build") {
    return scenario.startsWith("注文")
      ? scenario
      : `注文画面を作る: ${scenario}`;
  }
  return scenario.startsWith("基礎練習")
    ? scenario
    : `基礎練習: ${scenario}`;
}
