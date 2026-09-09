"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="review-state-page">
      <Card className="review-state-card" role="alert">
        <CardHeader>
          <p className="course-section-kicker">エラー</p>
          <CardTitle asChild>
            <h1>画面を表示できませんでした</h1>
          </CardTitle>
          <CardDescription>
            一時的な読込失敗の可能性があります。もう一度試すか、講座一覧へ戻ってください。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-3">
          <Button onClick={reset}>もう一度試す</Button>
          <Button asChild variant="outline">
            <Link href="/">講座一覧へ戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
