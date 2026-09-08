import { nodeCore } from "./node-core";
import { nodeStart } from "./node-start";
import type { Lesson } from "./types";

export const nodeLessons: Lesson[] = [...nodeStart, ...nodeCore];
