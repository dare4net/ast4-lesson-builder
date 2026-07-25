'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, ArrowLeft, Trash2, LayoutDashboard, Loader2, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { LessonCreationModal } from '@/components/studio/lesson-creation-modal';
import { LessonTimelineItem } from '@/components/studio/lesson-timeline-item';

interface Lesson { _id: string; title: string; description: string; order: number; duration?: number; level?: string; }
interface Module { _id: string; name: string; title?: string; description: string; program_id: string; }

function ModuleDetailContent() {
    const router = useRouter();
    const params = useParams();
    const moduleId = params?.id as string;

    const [module, setModule] = useState<Module | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => { if (moduleId) fetchModuleData(); }, [moduleId]);

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
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModule = async () => {
        if (!confirm('Delete this module? All lessons will also be deleted.')) return;
        try {
            await apiClient.studio.deleteModule(moduleId);
            router.push(`/studio/programs/${module?.program_id}`);
        } catch { alert('Failed to delete module'); }
    };

    const handleEditLesson = (lessonId: string) => router.push(`/editor?lessonId=${lessonId}`);

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete this lesson?')) return;
        try {
            await apiClient.studio.deleteLesson(lessonId);
            const lessonsData = await apiClient.studio.getLessons(moduleId);
            setLessons(lessonsData);
        } catch { alert('Failed to delete lesson'); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading module...</p>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="bg-white border-2 border-slate-200 rounded-3xl">
                    <CardContent className="py-12 text-center space-y-4">
                        <p className="text-red-500 font-semibold">Module not found</p>
                        <button onClick={() => router.push('/studio/programs')} className="h-10 px-5 rounded-xl font-bold text-sm text-white border-b-4 active:border-b-0 active:translate-y-[2px]" style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}>
                            Back to Programs
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="h-1.5 w-full bg-[#58CC02] fixed top-0 left-0 right-0 z-50" />

            <div className="container mx-auto px-6 pt-14 pb-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mt-6 mb-8 text-sm">
                    <button onClick={() => router.push('/dashboard/tutor')} className="flex items-center gap-1.5 text-slate-400 hover:text-[#58CC02] font-semibold transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                    </button>
                    <span className="text-slate-300">/</span>
                    <button onClick={() => router.push(`/studio/programs/${module.program_id}`)} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-semibold transition-colors group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Program
                    </button>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start gap-5 pb-8 mb-10 border-b-2 border-slate-200">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1CB0F6]/10 border border-[#1CB0F6]/20">
                            <FileText className="w-3.5 h-3.5 text-[#1CB0F6]" />
                            <span className="text-xs font-bold text-[#1CB0F6]">Module Overview</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {module.name || module.title || "Untitled Module"}
                        </h1>
                        <p className="text-slate-500 text-sm leading-relaxed">{module.description || 'No description provided.'}</p>
                    </div>

                    <button
                        onClick={handleDeleteModule}
                        className="h-10 px-4 rounded-xl text-sm font-bold text-red-500 bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-colors flex items-center gap-2 shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Module
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />{error}
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-10">
                    {/* Lesson Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2.5">
                                <span className="p-2 bg-[#58CC02]/10 rounded-xl border border-[#58CC02]/20">
                                    <FileText className="w-4 h-4 text-[#58CC02]" />
                                </span>
                                Lesson Timeline
                            </h2>
                            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border-2 border-slate-200">
                                {lessons.length} Lessons
                            </span>
                        </div>

                        {lessons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 rounded-3xl bg-white">
                                <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center mb-4">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <p className="text-slate-500 text-sm mb-6">No lessons in this module yet.</p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                                    style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add First Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-0 relative pl-4">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="pb-6 last:pb-0">
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

                    {/* Sidebar Quick Actions */}
                    <div className="lg:sticky lg:top-8 space-y-5">
                        <Card className="bg-white border-2 border-slate-200 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-base font-extrabold text-slate-800">Quick Actions</CardTitle>
                                <CardDescription className="text-slate-500 text-xs">Manage this module's content</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-5">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="w-full h-12 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                                    style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                                >
                                    <Plus className="w-5 h-5" />
                                    New Lesson
                                </button>

                                <div className="pt-3 border-t border-slate-100">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
                                            <div className="text-2xl font-extrabold text-slate-800">{lessons.length}</div>
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">Lessons</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
                                            <div className="text-2xl font-extrabold text-slate-800">
                                                {lessons.reduce((acc, l) => acc + (l.duration || 0), 0)}m
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">Total Time</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
    return <ProtectedRoute><ModuleDetailContent /></ProtectedRoute>;
}
