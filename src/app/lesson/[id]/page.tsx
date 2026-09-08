import { notFound } from "next/navigation";
import { LessonStudio } from "@/components/lesson-studio";
import { getLesson, lessons } from "@/lib/course";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: lesson.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonStudio key={lesson.id} lesson={lesson} />;
}
