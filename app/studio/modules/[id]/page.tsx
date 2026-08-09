'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, FileText, ArrowLeft, Trash2, LayoutDashboard, Loader2, Edit3, Clock, BookOpen } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { LessonCreationModal } from '@/components/studio/lesson-creation-modal';
import { LessonTimelineItem } from '@/components/studio/lesson-timeline-item';
import { EditModuleDialog } from '@/components/studio/edit-module-dialog';
import { EditLessonSettingsModal } from '@/components/studio/edit-lesson-settings-modal';

interface Lesson { _id: string; title: string; description: string; order: number; duration?: number; level?: string; voice?: string; }
interface Module { _id: string; name: string; title?: string; description: string; program_id: string; image_url?: string; cover_image?: string; is_published?: boolean; default_voice?: string; }

function ModuleDetailContent() {
    const router = useRouter();
    const params = useParams();
    const moduleId = params?.id as string;

    const [module, setModule] = useState<Module | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLessonForSettings, setSelectedLessonForSettings] = useState<Lesson | null>(null);

    useEffect(() => { if (moduleId) fetchModuleData(); }, [moduleId]);

    const fetchModuleData = async () => {
        try {
            const [moduleData, lessonsData] = await Promise.all([
                apiClient.studio.getModule(moduleId),
                apiClient.studio.getLessons(moduleId),
            ]);
            setModule(moduleData);
            setLessons(lessonsData);
        } catch { setError('Failed to load module'); }
        finally { setLoading(false); }
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

    const handleSaveModule = async (id: string, data: { name: string; description: string; image_url?: string; is_published: boolean; default_voice?: string }) => {
        try { await apiClient.studio.updateModule(id, data); await fetchModuleData(); }
        catch { alert('Failed to update module'); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#1CB0F6] animate-spin" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center w-full max-w-sm space-y-4">
                    <p className="text-red-500 font-bold text-sm">Module not found</p>
                    <button onClick={() => router.push('/studio/programs')} className="h-9 px-4 rounded-xl font-bold text-xs text-white border-b-[3px] active:border-b-0 active:translate-y-px" style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}>
                        Back to Programs
                    </button>
                </div>
            </div>
        );
    }

    const imageUrl = module.image_url || module.cover_image;
    const totalDuration = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <div className="h-1 w-full fixed top-0 left-0 right-0 z-50 bg-[#CE82FF]" />

            {/* ── MODULE COVER HERO ── */}
            <div className="relative w-full bg-slate-900 overflow-hidden" style={{ minHeight: 'clamp(160px, 26vw, 240px)' }}>
                {imageUrl && (
                    <>
                        <img src={imageUrl} alt={module.name} className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105" style={{ filter: 'blur(1px)' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent" />
                    </>
                )}
                {!imageUrl && <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />}

                {/* Breadcrumb */}
                <div className="relative z-10 px-4 sm:px-6 pt-6 flex items-center gap-2 text-xs font-bold text-white/50">
                    <button onClick={() => router.push('/dashboard/tutor')} className="flex items-center gap-1 hover:text-white transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <span>/</span>
                    <button onClick={() => router.push(`/studio/programs/${module.program_id}`)} className="flex items-center gap-1 hover:text-white transition-colors group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />Program
                    </button>
                </div>

                {/* Hero content */}
                <div className="relative z-10 px-4 sm:px-6 pt-3 pb-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="space-y-1.5 max-w-2xl min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#CE82FF]/30 border border-[#CE82FF]/40">
                            <FileText className="w-3 h-3 text-[#CE82FF]" />
                            <span className="text-[9px] font-black text-[#CE82FF]">Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow">
                            {module.name || module.title || 'Untitled Module'}
                        </h1>
                        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2">{module.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0 pb-4 sm:pb-0">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="h-9 px-3 sm:px-4 rounded-xl border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-[#1CB0F6]" /><span className="hidden xs:inline">Edit</span>
                        </button>
                        <button
                            onClick={handleDeleteModule}
                            className="h-9 px-3 rounded-xl border-2 border-red-500/30 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-9 px-3 sm:px-4 rounded-xl font-extrabold text-xs text-white flex items-center gap-1.5 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                            style={{ backgroundColor: '#1CB0F6', borderColor: '#0E86C0' }}
                        >
                            <Plus className="w-4 h-4" /><span className="hidden xs:inline">New Lesson</span>
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="relative z-10 px-4 sm:px-6 flex items-center gap-4 sm:gap-6 text-xs font-bold text-white/50 border-t border-white/10 mt-3">
                    <div className="flex items-center gap-1.5 py-2.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        <span className="text-white/70">{lessons.length} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
                        <Clock className="w-3.5 h-3.5 text-[#FF9600]" />
                        <span className="text-white/70">{totalDuration}m Total</span>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <main className="px-4 sm:px-6 py-4 sm:py-5">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />{error}
                    </div>
                )}

                {/* Responsive two column: timeline + sidebar stacks on mobile */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
                    {/* Lesson Timeline — takes full width on mobile */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-3.5 rounded-full bg-[#1CB0F6] inline-block" />
                                Lesson Timeline
                            </h2>
                            <span className="text-[10px] font-black text-slate-400 bg-white border-2 border-slate-100 px-2.5 py-1 rounded-full">
                                {lessons.length} lessons
                            </span>
                        </div>

                        {lessons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center px-4">
                                <div className="w-11 h-11 rounded-xl bg-[#EAF6FE] text-[#1CB0F6] flex items-center justify-center mb-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-black text-slate-700 mb-1">No Lessons Yet</p>
                                <p className="text-xs text-slate-400 font-medium mb-4 max-w-xs">Add lessons to build out this module's curriculum.</p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="h-9 px-4 rounded-xl font-extrabold text-xs text-white flex items-center gap-2 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                                    style={{ backgroundColor: '#1CB0F6', borderColor: '#0E86C0' }}
                                >
                                    <Plus className="w-4 h-4" />Add First Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lessons.map((lesson, index) => (
                                    <LessonTimelineItem
                                        key={lesson._id}
                                        lesson={lesson}
                                        index={index}
                                        isLast={index === lessons.length - 1}
                                        onEdit={() => handleEditLesson(lesson._id)}
                                        onEditSettings={() => setSelectedLessonForSettings(lesson)}
                                        onDelete={() => handleDeleteLesson(lesson._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar — full width on mobile, fixed-width sidebar on lg+ */}
                    <div className="w-full lg:w-64 xl:w-72 shrink-0">
                        <Card className="bg-white border-2 border-slate-100 rounded-2xl shadow-none sticky top-4">
                            <CardHeader className="pb-3 border-b border-slate-100 px-4 pt-4">
                                <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider">Quick Actions</CardTitle>
                                <CardDescription className="text-slate-400 text-xs">Add and manage lessons</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 px-4 pb-4 space-y-3">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="w-full h-10 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-2 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                                    style={{ backgroundColor: '#1CB0F6', borderColor: '#0E86C0' }}
                                >
                                    <Plus className="w-4 h-4" />New Lesson
                                </button>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div className="p-3 rounded-xl bg-[#EAF6FE] border border-[#1CB0F6]/20 text-center">
                                        <div className="text-xl font-black text-slate-800">{lessons.length}</div>
                                        <div className="text-[9px] uppercase font-black text-[#1CB0F6] tracking-wider mt-0.5">Lessons</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#FFF4E0] border border-[#FF9600]/20 text-center">
                                        <div className="text-xl font-black text-slate-800">{totalDuration}m</div>
                                        <div className="text-[9px] uppercase font-black text-[#FF9600] tracking-wider mt-0.5">Duration</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <LessonCreationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} moduleId={moduleId} programId={module.program_id} />
            {module && <EditModuleDialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} module={module} onSave={handleSaveModule} />}
            <EditLessonSettingsModal
                isOpen={!!selectedLessonForSettings}
                onClose={() => setSelectedLessonForSettings(null)}
                lesson={selectedLessonForSettings}
                moduleTitle={module?.title || module?.name}
                moduleVoice={module?.default_voice}
                lessonNumber={selectedLessonForSettings ? lessons.findIndex(l => l._id === selectedLessonForSettings._id) + 1 : 1}
                onSaveSuccess={fetchModuleData}
            />
        </div>
    );
}

export default function ModuleDetailPage() {
    return <ProtectedRoute><ModuleDetailContent /></ProtectedRoute>;
}
