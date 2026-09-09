import type {
  ChapterId,
  Lesson,
  Question,
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

export type LessonPageDTO = {
  lesson: Lesson;
  prequestion: string;
  predictionOptions: string[];
  navigation: LessonNavigationDTO;
};

export type ReviewLessonDTO = {
  id: string;
  track: Track;
  chapter: ChapterId;
  chapterTitle: string;
  title: string;
  questions: Question[];
};

export type ReviewPageDTO = {
  lessons: ReviewLessonDTO[];
};
