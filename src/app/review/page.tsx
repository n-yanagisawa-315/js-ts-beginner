import type { Metadata } from "next";
import { ReviewSession } from "@/components/review-session";
import { lessons } from "@/lib/course";

export const metadata: Metadata = {
  title: "復習 | JS / TS / Node しくみ講座",
  description: "学習履歴に合わせた単元横断の復習セッション",
};

export default function ReviewPage() {
  return <ReviewSession lessons={lessons} />;
}
