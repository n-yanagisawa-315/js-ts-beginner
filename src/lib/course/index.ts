import { jsAdvanced } from "./js-advanced";
import { githubAdvanced } from "./github-advanced";
import { githubStart } from "./github-start";
import { jsBasic } from "./js-basic";
import { jsCallback } from "./js-callback";
import { jsDom } from "./js-dom";
import { jsMiddle } from "./js-middle";
import { jsModern } from "./js-modern";
import { jsNpm } from "./js-npm";
import { jsStart } from "./js-start";
import { nodeCore } from "./node-core";
import { nodeStart } from "./node-start";
import { languageChallenges } from "./language-challenges";
import { sqlAdvanced } from "./sql-advanced";
import { sqlStart } from "./sql-start";
import { tsLessons } from "./ts-lessons";
import { tsModern } from "./ts-modern";
import { applyCourseLearningDesign } from "./learning-design";
import { TRACK_ORDER, type Lesson, type Track } from "./types";

export type {
  Chapter,
  ChapterId,
  ConversationPage,
  DiagramId,
  ExerciseKind,
  GitAssertion,
  GitRepositoryState,
  Lesson,
  Level,
  Question,
  ProjectRole,
  ScaffoldLevel,
  Slide,
  StoryBeat,
  TalkLine,
  TermLine,
  TermTone,
  Track,
  BehaviorCase,
  QuestionVariant,
  TransferLevel,
} from "./types";
export { LEVEL_LABEL, TRACK_ACCENT, TRACK_LABEL, TRACK_ORDER } from "./types";
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
