import { jsAdvanced } from "./js-advanced";
import { jsBasic } from "./js-basic";
import { jsMiddle } from "./js-middle";
import { jsModern } from "./js-modern";
import { jsStart } from "./js-start";
import type { Lesson } from "./types";

export const jsLessons: Lesson[] = [
  ...jsStart,
  ...jsBasic,
  ...jsMiddle,
  ...jsModern,
  ...jsAdvanced,
];
