"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SlideBoard } from "@/components/slide-board";
import { IconChevron } from "@/components/icons";
import type { Slide } from "@/lib/course";

export function SlideTheater({
  kicker,
  slide,
  index,
  total,
  conversationIndex,
  conversationTotal,
  continueLabel,
  onContinue,
  onPrev,
  onNext,
}: {
  kicker: string;
  slide: Slide;
  index: number;
  total: number;
  conversationIndex: number;
  conversationTotal: number;
  continueLabel?: string;
  onContinue?: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  return (
    <div
      ref={panelRef}
      className="slide-stage relative flex min-h-full min-w-0 flex-1 flex-col"
      aria-labelledby="slide-theater-title"
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-10 lg:px-14">
        <Link
          href="/"
          className="btn btn-ghost min-h-11 px-3 text-sm text-[var(--cream-mute)] hover:text-[var(--cream)]"
        >
          講座一覧
        </Link>
        <p className="font-mono text-xs tracking-widest text-[var(--cream-mute)]">
          {kicker}
          <span className="mx-3 text-[var(--figure-line)]">/</span>
          {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
          {conversationTotal > 1 ? (
            <span className="ml-3 text-[var(--cream-mute)]">
              会話 {conversationIndex + 1}/{conversationTotal}
            </span>
          ) : null}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-10 lg:px-14">
        <SlideBoard
          slide={slide}
          titleId="slide-theater-title"
          pageIndex={conversationIndex}
        />
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--figure-line)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-10 lg:px-14">
        <button
          type="button"
          className="btn btn-ghost h-11 w-11 min-h-11 p-0"
          aria-label="前へ"
          onClick={onPrev}
          disabled={index === 0 && conversationIndex === 0}
        >
          <IconChevron dir="left" className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="btn btn-ghost h-11 w-11 min-h-11 p-0"
          aria-label="次へ"
          onClick={onNext}
          disabled={
            index === total - 1 &&
            conversationIndex === conversationTotal - 1
          }
        >
          <IconChevron dir="right" className="h-6 w-6" />
        </button>
        {continueLabel && onContinue ? (
          <button
            type="button"
            className="btn btn-studio ml-2"
            onClick={onContinue}
          >
            {continueLabel}
          </button>
        ) : null}
      </footer>
    </div>
  );
}
