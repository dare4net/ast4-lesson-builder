"use client"

import { useEffect, useState, use } from 'react';
import { TutorLessonViewer } from '@/components/viewer/TutorLessonViewer';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TutorViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const lessonId = resolvedParams.id;

    const userId = searchParams?.get('userId') || '';
    const studentName = searchParams?.get('studentName') || 'Student';
    const returnUrl = searchParams?.get('returnUrl') || '';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<{ lesson: any; interaction: any } | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function loadLesson() {
            setLoading(true);
            setError(null);
            try {
                const url = `/lessons/${lessonId}${userId ? `?userId=${userId}` : ''}`;
                const data = await apiClient.get(url);
                if (isMounted) {
                    if (data && data.lesson) {
                        setLessonData(data);
                    } else {
                        setError('Lesson content not found');
                    }
                }
            } catch (err: any) {
                console.error('[TutorViewPage] Error loading lesson:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to load lesson for tutor inspection');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        if (lessonId) {
            loadLesson();
        }
        return () => { isMounted = false; };
    }, [lessonId, userId]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
                <div className="w-10 h-10 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-400">Loading Student Session...</p>
            </div>
        );
    }

    if (error || !lessonData) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Lesson Inspection Unavailable</h2>
                <p className="text-xs text-slate-400 max-w-md mb-6">{error || 'Could not load lesson data'}</p>
                <Button
                    variant="outline"
                    onClick={() => returnUrl ? router.push(returnUrl) : router.back()}
                    className="border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Student Progress
                </Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <TutorLessonViewer
                initialLesson={lessonData.lesson}
                initialInteraction={lessonData.interaction}
                studentId={userId}
                studentName={studentName}
                returnUrl={returnUrl}
            />
        </div>
    );
}
