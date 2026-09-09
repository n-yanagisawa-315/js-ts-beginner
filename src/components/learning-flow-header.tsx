"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, ListTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { LessonNavigationDTO } from "@/lib/course/client-dtos";
import type { Lesson } from "@/lib/course/types";

export function LearningFlowHeader({
  lesson,
  navigation,
  stage,
  current,
  total,
  dark = false,
}: {
  lesson: Lesson;
  navigation: LessonNavigationDTO;
  stage: string;
  current?: number;
  total?: number;
  dark?: boolean;
}) {
  const percent =
    current !== undefined && total
      ? Math.max(0, Math.min(100, (current / total) * 100))
      : stage === "講義完了"
        ? 100
        : 0;

  return (
    <header className={`learning-flow-header${dark ? " is-dark" : ""}`}>
      <div className="learning-flow-header-main">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">講座一覧</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight aria-hidden="true" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/track/${lesson.track}`}>
                  {navigation.trackLabel}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:flex">
              <ChevronRight aria-hidden="true" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="hidden sm:flex">
              <BreadcrumbPage>{navigation.chapterTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="learning-flow-title">
          <Badge variant={dark ? "outline" : "secondary"}>{stage}</Badge>
          <strong>{lesson.title}</strong>
        </div>
      </div>

      <div className="learning-flow-status">
        {current !== undefined && total ? (
          <div>
            <span>
              {current}/{total}
            </span>
            <Progress value={percent} aria-label={`${stage}の進捗`} />
          </div>
        ) : null}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <ListTree data-icon="inline-start" aria-hidden="true" />
              <span>講義一覧</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="learning-outline-sheet">
            <SheetHeader>
              <SheetTitle>{navigation.trackLabel}の講義一覧</SheetTitle>
              <SheetDescription>
                現在地を確認し、別の講義へ移動できます。
              </SheetDescription>
            </SheetHeader>
            <nav aria-label={`${navigation.trackLabel}の講義一覧`}>
              {navigation.outline.map((chapter) => (
                <section key={chapter.id}>
                  <h2>{chapter.title}</h2>
                  <ul>
                    {chapter.lessons.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/lesson/${item.id}`}
                          aria-current={item.id === lesson.id ? "page" : undefined}
                        >
                          <BookOpen aria-hidden="true" />
                          <span>{item.title}</span>
                          <small>{item.minutes}分</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
