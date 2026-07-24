'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, ArrowLeft, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { LessonCreationModal } from '@/components/studio/lesson-creation-modal';
import { LessonTimelineItem } from '@/components/studio/lesson-timeline-item';

interface Lesson {
    _id: string;
    title: string;
    description: string;
    order: number;
    duration?: number;
    level?: string;
}

interface Module {
    _id: string;
    name: string;
    title?: string;
    description: string;
    program_id: string;
}

function ModuleDetailContent() {
    const router = useRouter();
    const params = useParams();
    const moduleId = params?.id as string;

    const [module, setModule] = useState<Module | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (moduleId) {
            fetchModuleData();
        }
    }, [moduleId]);

    const fetchModuleData = async () => {
        try {
            const [moduleData, lessonsData] = await Promise.all([
                apiClient.studio.getModule(moduleId),
                apiClient.studio.getLessons(moduleId),
            ]);
            setModule(moduleData);
            setLessons(lessonsData);
        } catch (err: any) {
            setError('Failed to load module');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModule = async () => {
        if (!confirm('Are you sure you want to delete this module? All lessons will be deleted.')) {
            return;
        }

        try {
            await apiClient.studio.deleteModule(moduleId);
            router.push(`/studio/programs/${module?.program_id}`);
        } catch (err: any) {
            alert('Failed to delete module');
        }
    };

    const handleEditLesson = (lessonId: string) => {
        router.push(`/editor?lessonId=${lessonId}`);
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) {
            return;
        }

        try {
            await apiClient.studio.deleteLesson(lessonId);
            const lessonsData = await apiClient.studio.getLessons(moduleId);
            setLessons(lessonsData);
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete lesson');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-4 text-gray-600">Loading module...</p>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-red-600">Module not found</p>
                        <Button className="mt-4" onClick={() => router.push('/studio/programs')}>
                            Back to Programs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Cinematic Header Background - Darker/Different than Programs */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Header Section */}
                <div className="mb-16">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/studio/programs/${module.program_id}`)}
                        className="mb-8 text-slate-500 hover:text-emerald-400 pl-0 hover:bg-transparent transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Program
                    </Button>

                    <div className="flex justify-between items-start border-b border-slate-800/50 pb-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Module Overview</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">
                                {module.name || module.title || "Untitled Module"}
                            </h1>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                {module.description || 'No description provided for this module.'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteModule}
                                className="border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Module
                            </Button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl backdrop-blur-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="grid lg:grid-cols-[1fr_350px] gap-12">
                    {/* Left: Timeline */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                </span>
                                Lesson Timeline
                            </h2>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                {lessons.length} Lessons
                            </span>
                        </div>

                        {lessons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-950/50">
                                <div className="p-4 rounded-full bg-slate-900 mb-4">
                                    <FileText className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-slate-500 mb-6">No lessons in this module timeline yet.</p>
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Lesson
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-0 relative pl-4">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="pb-8 last:pb-0">
                                        <LessonTimelineItem
                                            lesson={lesson}
                                            index={index}
                                            isLast={index === lessons.length - 1}
                                            onEdit={() => handleEditLesson(lesson._id)}
                                            onDelete={() => handleDeleteLesson(lesson._id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Quick Actions / Stats Panel */}
                    <div className="space-y-6">
                        <div className="sticky top-8">
                            <Card className="bg-[#0F172A]/80 border-slate-800 backdrop-blur-xl shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-white">Quick Actions</CardTitle>
                                    <CardDescription className="text-slate-400">Manage this module's content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold h-12 text-lg shadow-lg shadow-emerald-900/20"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        New Lesson
                                    </Button>

                                    <div className="pt-4 border-t border-slate-800">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                                <div className="text-2xl font-black text-white">{lessons.length}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lessons</div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                                <div className="text-2xl font-black text-white">
                                                    {lessons.reduce((acc, l) => acc + (l.duration || 0), 0)}m
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Time</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <LessonCreationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                moduleId={moduleId}
                programId={module.program_id}
            />
        </div>
    );
}

export default function ModuleDetailPage() {
    return (
        <ProtectedRoute>
            <ModuleDetailContent />
        </ProtectedRoute>
    );
}
