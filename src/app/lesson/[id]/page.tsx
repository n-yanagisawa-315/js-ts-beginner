import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonStudio } from "@/components/lesson-studio";
import { getLessonPageDTO, lessons } from "@/lib/course/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: lesson.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = getLessonPageDTO(id);
  if (!course) return {};
  return {
    title: course.lesson.title,
    description: course.lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getLessonPageDTO(id);
  if (!course) notFound();
  return <LessonStudio key={course.lesson.id} course={course} />;
}
