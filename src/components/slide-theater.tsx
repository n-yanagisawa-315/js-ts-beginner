"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";
import { LearningFlowHeader } from "@/components/learning-flow-header";
import { SlideBoard } from "@/components/slide-board";
import { Button } from "@/components/ui/button";
import { IconChevron } from "@/components/icons";
import { slideLayout } from "@/lib/course/slide-layout";
import type {
  LessonNavigationDTO,
  ResolvedLessonDTO,
  ResolvedSlideDTO,
} from "@/lib/course/client-dtos";
import type { ConversationPage } from "@/lib/course/types";

export function SlideTheater({
  lesson,
  navigation,
  slide,
  index,
  total,
  conversationPages,
  conversationIndex,
  conversationTotal,
  continueLabel,
  onContinue,
  onPrev,
  onNext,
  assistant,
}: {
  lesson: ResolvedLessonDTO;
  navigation: LessonNavigationDTO;
  slide: ResolvedSlideDTO;
  index: number;
  total: number;
  conversationPages: ConversationPage[];
  conversationIndex: number;
  conversationTotal: number;
  continueLabel?: string;
  onContinue?: () => void;
  onPrev: () => void;
  onNext: () => void;
  assistant?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const handleNext = useEffectEvent(onNext);
  const handlePrev = useEffectEvent(onPrev);
  const layout = slideLayout(slide, { slideIndex: index });
  const currentPage = conversationPages[conversationIndex];
  const showingTalk = (currentPage?.lines.length ?? 0) > 0;
  const showConversationChrome =
    (layout === "talk" || showingTalk) && conversationTotal > 1;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.defaultPrevented ||
        (target instanceof HTMLElement &&
          target.closest(
            "input, textarea, [contenteditable='true'], .monaco-editor, [role='dialog']",
          ))
      ) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main
      id="main-content"
      ref={panelRef}
      className={`slide-stage relative flex min-h-full min-w-0 flex-1 flex-col is-${layout}`}
      aria-labelledby="slide-theater-title"
    >
      <LearningFlowHeader
        lesson={lesson}
        navigation={navigation}
        stage={
          showConversationChrome
            ? `スライド・会話 ${conversationIndex + 1}/${conversationTotal}`
            : "スライド"
        }
        current={index + 1}
        total={total}
        dark={false}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-10 lg:px-14">
        <SlideBoard
          slide={slide}
          titleId="slide-theater-title"
          pages={conversationPages}
          pageIndex={conversationIndex}
          section={slide.section ?? lesson.title}
          slideIndex={index}
        />
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--figure-line)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-10 lg:px-14">
        {assistant ? <div className="mr-auto">{assistant}</div> : null}
        <Button
          variant="ghost"
          size="icon"
          aria-label="前へ"
          onClick={onPrev}
          disabled={index === 0 && conversationIndex === 0}
        >
          <IconChevron dir="left" className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="次へ"
          onClick={onNext}
          disabled={
            index === total - 1 &&
            conversationIndex === conversationTotal - 1
          }
        >
          <IconChevron dir="right" className="h-6 w-6" />
        </Button>
        {continueLabel && onContinue ? (
          <Button className="ml-2" onClick={onContinue}>
            {continueLabel}
          </Button>
        ) : null}
      </footer>
    </main>
  );
}
