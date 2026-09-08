"use client";

import { IconClose } from "@/components/icons";

export function GradeToast({
  message,
  tone,
  onClose,
}: {
  message: string;
  tone: "dark" | "light";
  onClose: () => void;
}) {
  const dark = tone === "dark";
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`grade-toast flex w-full items-start gap-3 px-4 py-3 text-sm leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.28)] ${
        dark
          ? "bg-[#3a1616] text-[#fca5a5]"
          : "border border-ng bg-[#fdecec] text-ng"
      }`}
    >
      <p className="min-w-0 flex-1">
        <span className="font-medium">不正解。</span> {message}
      </p>
      <button
        type="button"
        className={`btn btn-ghost h-11 min-h-11 w-11 shrink-0 p-0 ${
          dark ? "text-[#fca5a5] hover:bg-white/10" : "text-ng"
        }`}
        aria-label="閉じる"
        onClick={onClose}
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
}
