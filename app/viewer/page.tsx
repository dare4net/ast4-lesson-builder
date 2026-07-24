"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LessonViewer } from '@/components/viewer/LessonViewerUpload';
import { apiClient } from '@/lib/api-client';
import { fetchUserInteraction } from '@/lib/user-interactions';
import { Loader2 } from 'lucide-react';
import type { Lesson } from '@/types/lesson';

function ViewerContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const { user, loading: authLoading } = useAuth();

  const [initialLesson, setInitialLesson] = useState<Lesson | undefined>();
  const [initialInteraction, setInitialInteraction] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if (!lessonId || !user?.user_id) return;

      setLoading(true);
      try {
        console.log('[ViewerPage] Initializing for lesson:', lessonId, 'user:', user.user_id);
        const [lessonData, interactionData] = await Promise.all([
          apiClient.lessons.getLessonDetails(lessonId),
          fetchUserInteraction(user.user_id, lessonId)
        ]);

        setInitialLesson(lessonData);
        setInitialInteraction(interactionData);
      } catch (err: any) {
        console.error('[ViewerPage] Initialization failed:', err);
        setError(err.message || 'Failed to initialize session');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      init();
    }
  }, [lessonId, user?.user_id, authLoading]);

  if (authLoading || (loading && !initialLesson)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-[#0F172A]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">
            Establishing Secure Link
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-[#0F172A] text-white">
        <p className="text-rose-500 font-black uppercase tracking-widest">{error}</p>
      </div>
    );
  }

  return (
    <LessonViewer
      initialLesson={initialLesson}
      initialInteraction={initialInteraction}
      userId={user?.user_id}
    />
  );
}

export default function ViewerPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }>
        <ViewerContent />
      </Suspense>
    </div>
  );
}