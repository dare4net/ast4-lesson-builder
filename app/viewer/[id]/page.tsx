import { LessonViewer } from '@/components/viewer/LessonViewer';
import { notFound, redirect } from 'next/navigation';
import { getSessionFromAstCookie } from '@/lib/session-cookie';

async function fetchLesson(id: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const url = `${baseUrl}/lessons/${id}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
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
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const session = await getSessionFromAstCookie();
  if (!session) {
    redirect(`/auth/login?role=student&next=/viewer/${awaitedParams.id}`);
  }

  const lessonData = await fetchLesson(awaitedParams.id, session.token);
  if (!lessonData) return notFound();
  return (
    <div className="h-dvh w-screen overflow-hidden">
      <LessonViewer
        initialLesson={lessonData.lesson}
        initialInteraction={lessonData.interaction}
        userId={session.user_id}
      />
    </div>
  );
}
