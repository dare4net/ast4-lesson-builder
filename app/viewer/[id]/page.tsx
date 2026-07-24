import { LessonViewer } from '@/components/viewer/LessonViewerUpload';
import { notFound } from 'next/navigation';

async function fetchLesson(id: string, token?: string, userId?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const url = `${baseUrl}/lessons/${id}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
  });

  if (!res.ok) {
    if (res.status === 401) console.error('[Viewer] Backend: Unauthorized - Missing or invalid token');
    if (res.status === 404) console.error('[Viewer] Backend: Lesson not found');
    return null;
  }

  return res.json();
}

export default async function ViewerIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ userId?: string; token?: string }>;
}) {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const lessonData = await fetchLesson(awaitedParams.id, awaitedSearchParams?.token, awaitedSearchParams?.userId);
  if (!lessonData) return notFound();
  return (
    <div className="h-screen w-screen overflow-hidden">
      <LessonViewer
        initialLesson={lessonData.lesson}
        initialInteraction={lessonData.interaction}
        userId={awaitedSearchParams?.userId}
      />
    </div>
  );
}
