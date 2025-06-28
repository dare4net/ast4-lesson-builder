import { LessonViewer } from '@/components/viewer/LessonViewer';
import { notFound } from 'next/navigation';

async function fetchLesson(id: string, userId?: string) {
  if (userId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/lessons/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return null;
    return res.json();
  } else {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/lessons/${id}`);
    if (!res.ok) return null;
    return res.json();
  }
}

export default async function ViewerIdPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { userId?: string };
}) {
  const lessonData = await fetchLesson(params.id, searchParams?.userId);
  if (!lessonData) return notFound();
  return (
    <div className="h-screen w-screen overflow-hidden">
      <LessonViewer
        initialLesson={lessonData.lesson}
        initialInteraction={lessonData.interaction}
        userId={searchParams?.userId}
      />
    </div>
  );
}
