"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { Lesson } from "@/lib/course";
import { LEVEL_LABEL, lessonsByChapter } from "@/lib/course";
import {
  emptyLearningStateSnapshot,
  learningStateSnapshot,
  learningStats,
  subscribeLearningState,
  type LearningState,
  type ProgressMap,
} from "@/lib/progress";

export function HomeTracks({
  js,
  ts,
  node,
}: {
  js: Lesson[];
  ts: Lesson[];
  node: Lesson[];
}) {
  const json = useSyncExternalStore(
    subscribeLearningState,
    learningStateSnapshot,
    emptyLearningStateSnapshot,
  );
  const state = useMemo(() => JSON.parse(json) as LearningState, [json]);
  const stats = useMemo(() => learningStats(state), [state]);
  const progress = state.lessons;
  const courseLessons = useMemo(() => [...js, ...ts, ...node], [js, ts, node]);
  const mastery = useMemo(() => {
    const result: Record<
      string,
      { retained: number; mastered: number; total: number }
    > = {};
    for (const lesson of courseLessons) {
      const conceptIds = [
        ...new Set(
          lesson.objectives?.flatMap((objective) => objective.conceptIds) ?? [],
        ),
      ];
      result[lesson.id] = conceptIds.reduce(
        (summary, conceptId) => {
          const concept = state.concepts?.[conceptId];
          if (
            concept?.masteryStage === "retained" ||
            concept?.masteryStage === "mastered"
          ) {
            summary.retained += 1;
          }
          if (concept?.masteryStage === "mastered") summary.mastered += 1;
          return summary;
        },
        { retained: 0, mastered: 0, total: conceptIds.length },
      );
    }
    return result;
  }, [courseLessons, state.concepts]);

  return (
    <>
      <section
        aria-labelledby="review-heading"
        className="border-y border-line bg-paper px-5 py-6 sm:px-10 lg:px-14"
      >
        <div className="flex max-w-5xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-studio">
              記憶のメンテナンス
            </p>
            <h2 id="review-heading" className="mt-1 font-serif text-2xl font-medium">
              復習
            </h2>
            <p className="mt-2 text-sm leading-6 text-mute">
              {stats.dueCount > 0
                ? `期限を迎えた問題が ${stats.dueCount} 問あります。`
                : stats.practicedCount > 0
                  ? "期限前の問題から、最近学んだ内容を先取りできます。"
                  : "演習を解くと、ここに復習問題が集まります。"}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-5 text-center sm:grid-cols-4">
            <div>
              <dt className="text-xs text-mute">期限</dt>
              <dd className="mt-1 font-mono text-xl">{stats.dueCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-mute">保持確認</dt>
              <dd className="mt-1 font-mono text-xl">{stats.retainedCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-mute">無支援保持率</dt>
              <dd className="mt-1 font-mono text-xl">
                {stats.independentRetentionRate === null
                  ? "—"
                  : `${Math.round(stats.independentRetentionRate * 100)}%`}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-mute">初回答の自信差（小ほど良）</dt>
              <dd className="mt-1 font-mono text-xl">
                {stats.calibrationError === null
                  ? "—"
                  : `${Math.round(stats.calibrationError * 100)}pt`}
              </dd>
            </div>
          </dl>
          <Link href="/review" className="btn btn-primary">
            {stats.dueCount > 0 ? "期限問題を復習" : "復習を始める"}
          </Link>
        </div>
      </section>
      <main className="grid flex-1 xl:grid-cols-3">
        <TrackColumn
          kicker="01 JavaScript"
          title="値がどう動くか"
          hint="基礎文法から npm まで、編ごとに基礎→上級へ進みます。最初の編は単語の意味から始めます。そのあと型の約束へ"
          lessons={js}
          followOn={{
            label: "TypeScript へ続く",
            lessons: ts,
            marker: "var(--ts)",
          }}
          progress={progress}
          mastery={mastery}
          marker="var(--js)"
        />
        <TrackColumn
          kicker="02 TypeScript"
          title="約束を先に書く"
          hint="TypeScript 7 の検査器から上級の型まで、編ごとに契約を厚くします"
          lessons={ts}
          progress={progress}
          mastery={mastery}
          marker="var(--ts)"
        />
        <TrackColumn
          kicker="03 Node.js"
          title="マシンの上で動かす"
          hint="実行環境から本番停止まで、編ごとに現場の道具を足します"
          lessons={node}
          progress={progress}
          mastery={mastery}
          marker="var(--node)"
        />
      </main>
    </>
  );
}

function TrackColumn({
  kicker,
  title,
  hint,
  lessons,
  followOn,
  progress,
  mastery,
  marker,
}: {
  kicker: string;
  title: string;
  hint: string;
  lessons: Lesson[];
  followOn?: { label: string; lessons: Lesson[]; marker: string };
  progress: ProgressMap;
  mastery: Record<string, { retained: number; mastered: number; total: number }>;
  marker: string;
}) {
  return (
    <section className="border-b border-line bg-desk px-5 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="mb-8 border-t-2 pt-5" style={{ borderColor: marker }}>
        <p className="font-mono text-xs tracking-[0.16em]">{kicker}</p>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          {title}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-mute">{hint}</p>
      </div>
      <LessonGroups lessons={lessons} progress={progress} mastery={mastery} marker={marker} />
      {followOn && followOn.lessons.length > 0 ? (
        <div className="mt-12">
          <p
            className="mb-1 font-mono text-xs tracking-[0.16em]"
            style={{ color: followOn.marker }}
          >
            {followOn.label}
          </p>
          <p className="mb-4 text-sm leading-6 text-mute">
            JavaScript の続きです。名前の型を先に約束します。
          </p>
          <LessonGroups
            lessons={followOn.lessons}
            progress={progress}
            mastery={mastery}
            marker={followOn.marker}
            orderOffset={lessons.length}
          />
        </div>
      ) : null}
    </section>
  );
}

function LessonGroups({
  lessons,
  progress,
  mastery,
  marker,
  orderOffset = 0,
}: {
  lessons: Lesson[];
  progress: ProgressMap;
  mastery: Record<string, { retained: number; mastered: number; total: number }>;
  marker: string;
  orderOffset?: number;
}) {
  const groups = lessonsByChapter(lessons);
  return (
    <>
      {groups.map(({ chapter, lessons: items }) => (
        <div key={chapter.id} className="mb-10 last:mb-0">
          <p className="font-mono text-[11px] tracking-[0.14em] text-mute">
            {String(chapter.order).padStart(2, "0")}{" "}
            {[...new Set(items.map((item) => LEVEL_LABEL[item.level]))].join("〜")}
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium tracking-tight">
            {chapter.title}
          </h3>
          <p className="mt-1 mb-3 max-w-sm text-sm leading-6 text-mute">
            {chapter.summary}
          </p>
          <ol>
            {items.map((lesson) => {
              const done = progress[lesson.id];
              const lessonMastery = mastery[lesson.id] ?? {
                retained: 0,
                mastered: 0,
                total: 0,
              };
              const ratio = lessonMastery.total
                ? lessonMastery.mastered / lessonMastery.total
                : 0;
              const displayOrder = orderOffset + lesson.order;
              return (
                <li key={lesson.id} className="py-2">
                  <Link
                    href={`/lesson/${lesson.id}`}
                    className="neo-card flex min-h-11 items-start justify-between gap-4 px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-mute">
                        {String(displayOrder).padStart(2, "0")}
                        <span className="mx-2">/</span>
                        {lesson.minutes}分
                      </p>
                      <p className="font-serif text-lg font-medium leading-snug">
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-mute">
                        {lesson.summary}
                      </p>
                    </div>
                    <div className="w-16 shrink-0 pt-1">
                      <p className="text-right font-mono text-[11px] text-mute">
                        {lessonMastery.mastered > 0
                          ? `${lessonMastery.mastered}/${lessonMastery.total} 習熟`
                          : lessonMastery.retained > 0
                            ? `${lessonMastery.retained} 保持`
                            : done
                              ? "練習済み"
                              : "未"}
                      </p>
                      <span
                        className="mt-2 block h-px w-full overflow-hidden bg-line"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-px"
                          style={{
                            width: `${Math.round(ratio * 100)}%`,
                            background: marker,
                          }}
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </>
  );
}
