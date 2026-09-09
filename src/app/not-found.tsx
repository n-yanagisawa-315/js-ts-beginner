import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main id="main-content" className="review-state-page">
      <Card className="review-state-card">
        <CardHeader>
          <p className="course-section-kicker">404</p>
          <CardTitle asChild>
            <h1>講義が見つかりません</h1>
          </CardTitle>
          <CardDescription>
            URLを確認するか、講座一覧から学びたい講義を選び直してください。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/">講座一覧へ戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
