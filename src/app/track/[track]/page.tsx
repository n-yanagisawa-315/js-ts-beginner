import { notFound } from "next/navigation";
import { TrackDetail } from "@/components/track-detail";
import { lessonsByTrack, TRACK_ORDER, type Track } from "@/lib/course";
import { TRACK_META } from "@/lib/track-meta";

export function generateStaticParams() {
  return TRACK_ORDER.map((track) => ({ track }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
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
  return (
    <TrackDetail
      track={currentTrack}
      lessons={lessonsByTrack(currentTrack)}
    />
  );
}
