import { jsAdvanced } from "./js-advanced";
import { jsBasic } from "./js-basic";
import { jsCallback } from "./js-callback";
import { jsMiddle } from "./js-middle";
import { jsModern } from "./js-modern";
import { jsNpm } from "./js-npm";
import { jsStart } from "./js-start";
import { nodeCore } from "./node-core";
import { nodeStart } from "./node-start";
import { tsLessons } from "./ts-lessons";
import { tsModern } from "./ts-modern";
import { applyCourseLearningDesign } from "./learning-design";
import type { Lesson, Track } from "./types";

export type {
  Chapter,
  ChapterId,
  ConversationPage,
  DiagramId,
  ExerciseKind,
  Lesson,
  Level,
  Question,
  ScaffoldLevel,
  Slide,
  StoryBeat,
  TalkLine,
  TermLine,
  TermTone,
  Track,
  TransferLevel,
} from "./types";
export { LEVEL_LABEL, TRACK_ACCENT, TRACK_LABEL } from "./types";
export {
  CHAPTERS,
  chaptersByTrack,
  getChapter,
  lessonsByChapter,
} from "./chapters";
export { normalizeAnswer } from "../grade";

const rawLessons: Lesson[] = [
  ...jsStart,
  ...jsBasic,
  ...jsCallback,
  ...jsMiddle,
  ...jsModern,
  ...jsAdvanced,
  ...jsNpm,
  ...tsLessons,
  ...tsModern,
  ...nodeStart,
  ...nodeCore,
];

export const lessons: Lesson[] = applyCourseLearningDesign(rawLessons);
export { prequestionForLesson } from "./learning-design";

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
  const inTrack = lessonsByTrack(current.track).find(
    (lesson) => lesson.order === current.order + 1,
  );
  if (inTrack) return inTrack.id;
  if (current.track === "js") return lessonsByTrack("ts")[0]?.id;
  return undefined;
}
