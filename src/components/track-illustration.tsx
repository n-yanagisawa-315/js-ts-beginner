import type { Track } from "@/lib/course";
import { TRACK_META } from "@/lib/track-meta";

const LABEL: Record<Track, string> = {
  js: "JS",
  ts: "TS",
  node: ">_",
};

export function TrackIllustration({
  track,
  compact = false,
}: {
  track: Track;
  compact?: boolean;
}) {
  const meta = TRACK_META[track];
  return (
    <svg
      viewBox="0 0 240 180"
      className={compact ? "course-illustration is-compact" : "course-illustration"}
      role="img"
      aria-label={`${meta.name}講座のイラスト`}
    >
      <circle cx="120" cy="90" r="68" fill={meta.soft} />
      <circle
        cx="120"
        cy="90"
        r="67"
        fill="none"
        stroke={meta.accent}
        strokeWidth="2"
      />
      <path
        d="M72 57h96a8 8 0 0 1 8 8v68a8 8 0 0 1-8 8H72a8 8 0 0 1-8-8V65a8 8 0 0 1 8-8Z"
        fill="white"
        stroke="#6f7d93"
        strokeWidth="2"
      />
      <path d="M64 76h112" stroke="#d3dbe3" strokeWidth="2" />
      <circle cx="77" cy="67" r="3" fill="#d60d53" />
      <circle cx="88" cy="67" r="3" fill="#e7b14c" />
      <circle cx="99" cy="67" r="3" fill="#0fa88a" />
      <rect
        x="91"
        y="91"
        width="58"
        height="38"
        rx="5"
        fill={meta.accent}
      />
      <text
        x="120"
        y="116"
        fill="#173f4b"
        fontFamily="ui-monospace, monospace"
        fontSize="18"
        fontWeight="800"
        textAnchor="middle"
      >
        {LABEL[track]}
      </text>
      <path
        d="M49 35v12M43 41h12M190 32v10M185 37h10M202 126v12M196 132h12"
        stroke={meta.accent}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="48" cy="116" r="3" fill={meta.accent} />
      <circle cx="190" cy="65" r="3" fill={meta.accent} />
    </svg>
  );
}
