import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackDetail } from "@/components/track-detail";
import { getTrackPageDTO, TRACK_ORDER } from "@/lib/course/server";
import type { Track } from "@/lib/course/types";
import { TRACK_META } from "@/lib/track-meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACK_ORDER.map((track) => ({ track }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  if (!TRACK_ORDER.includes(track as Track)) return {};
  const meta = TRACK_META[track as Track];
  return {
    title: `${meta.name}入門`,
    description: meta.shortDescription,
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!TRACK_ORDER.includes(track as Track)) notFound();
  const currentTrack = track as Track;
  return <TrackDetail course={getTrackPageDTO(currentTrack)} />;
}
