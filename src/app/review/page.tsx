import type { Metadata } from "next";
import { ReviewSession } from "@/components/review-session";
import { getReviewPageDTO } from "@/lib/course/server";

export const metadata: Metadata = {
  title: "復習",
  description: "学習履歴に合わせた単元横断の復習セッション",
};

export default function ReviewPage() {
  return <ReviewSession course={getReviewPageDTO()} />;
}
