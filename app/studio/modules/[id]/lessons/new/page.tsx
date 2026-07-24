'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { apiClient } from '@/lib/api-client';
import { defaultLesson } from '@/lib/default-lesson';

function NewLessonContent() {
    const router = useRouter();
    const params = useParams();
    const moduleId = (params?.id as string) || '';
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreateLesson = async () => {
        setCreating(true);
        setError('');

        try {
            // Create skeletal lesson in DB immediately
            const lessonData = {
                title: defaultLesson.title,
                description: defaultLesson.description,
                slides: defaultLesson.slides,
                settings: {},
            };

            const result = await apiClient.studio.createLesson(moduleId, lessonData);

            // Redirect to editor with the new lessonId
            router.push(`/editor?lessonId=${result.lesson._id}`);
        } catch (err: any) {
            console.error('Failed to create lesson:', err);
            setError('Failed to initialize lesson. Please try again.');
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Background Glow */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-2xl relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 text-slate-500 hover:text-white pl-0 hover:bg-transparent transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Module
                </Button>

                <Card className="bg-[#0F172A]/90 border-slate-800 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-slate-800/80 pb-6">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em]">Studio Initialization</span>
                        </div>
                        <CardTitle className="text-3xl font-black text-white">Create New Lesson</CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                            Initialize a new lesson record in the database and enter the interactive Studio editor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 py-8 text-center">
                        <p className="text-slate-300 font-medium">
                            Click below to generate a new lesson template. Once initialized, you'll be launched directly into the Lesson Studio.
                        </p>

                        {error && (
                            <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-sm flex items-center justify-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 justify-center pt-4">
                            <Button
                                onClick={handleCreateLesson}
                                size="lg"
                                disabled={creating}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 h-12 rounded-full shadow-lg shadow-emerald-500/20 text-base"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Launching Studio...
                                    </>
                                ) : (
                                    'Create & Open Editor'
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                disabled={creating}
                                className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full px-6"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function NewLessonPage() {
    return (
        <ProtectedRoute>
            <NewLessonContent />
        </ProtectedRoute>
    );
}
