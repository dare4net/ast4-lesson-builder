'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, FolderOpen, ArrowLeft, Trash2, LayoutDashboard, Loader2, Edit3, Layers, Globe, Users } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { ModuleCard } from '@/components/studio/module-card';
import { motion } from 'framer-motion';
import { EditProgramDialog } from '@/components/studio/edit-program-dialog';
import { EditModuleDialog } from '@/components/studio/edit-module-dialog';
import { DeleteConfirmDialog } from '@/components/studio/delete-confirm-dialog';

interface Module { _id: string; name: string; description: string; lessons: any[]; order: number; is_published?: boolean; image_url?: string; cover_image?: string; default_voice?: string; }
interface Program { _id: string; name: string; description: string; modules: string[]; is_published?: boolean; image_url?: string; cover_image?: string; enrolled_students?: string[]; enrolled_count?: number; default_voice?: string; org_id?: string | null; visibility?: string; }

function ProgramDetailContent() {
    const router = useRouter();
    const params = useParams();
    const programId = params?.id as string;

    const [program, setProgram] = useState<Program | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
    const [isDeleteProgramOpen, setIsDeleteProgramOpen] = useState(false);
    const [selectedModuleForDelete, setSelectedModuleForDelete] = useState<Module | null>(null);
    const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<Module | null>(null);

    useEffect(() => { if (programId) fetchProgramData(); }, [programId]);

    const fetchProgramData = async () => {
        try {
            const [programData, modulesData] = await Promise.all([
                apiClient.studio.getProgram(programId),
                apiClient.studio.getModules(programId),
            ]);
            setProgram(programData);
            setModules(modulesData);
        } catch { setError('Failed to load program'); }
        finally { setLoading(false); }
    };

    const handleSaveProgram = async (id: string, data: {
        name: string
        description: string
        is_published: boolean
        default_voice?: string
        image_url?: string
        visibility?: 'org' | 'marketplace' | 'unlisted'
    }) => {
        await apiClient.studio.updateProgram(id, data);
        fetchProgramData();
    };

    const handleSaveModule = async (id: string, data: { name: string; description: string; is_published: boolean; default_voice?: string }) => {
        await apiClient.studio.updateModule(id, data);
        fetchProgramData();
    };

    const handleConfirmDeleteProgram = async () => {
        const res = await apiClient.studio.deleteProgram(programId);
        if (!res?.is_soft_deleted) router.push('/studio/programs');
        else fetchProgramData();
        return res;
    };

    const handleConfirmDeleteModule = async () => {
        if (!selectedModuleForDelete) return;
        const res = await apiClient.studio.deleteModule(selectedModuleForDelete._id);
        fetchProgramData();
        return res;
    };

    const [navigatingUrl, setNavigatingUrl] = useState<string | null>(null);

    const handleNavigate = (url: string) => {
        if (navigatingUrl) return;
        setNavigatingUrl(url);
        router.push(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#1CB0F6] animate-spin" />
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center space-y-4 w-full max-w-sm">
                    <p className="text-red-500 font-bold text-sm">Program not found</p>
                    <button onClick={() => router.push('/studio/programs')} className="h-9 px-4 rounded-xl font-bold text-xs text-white border-b-[3px] active:border-b-0 active:translate-y-px transition-all" style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}>
                        Back to Programs
                    </button>
                </div>
            </div>
        );
    }

    const isProgramPublished = program.is_published ?? true;
    const imageUrl = program.image_url || program.cover_image;

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <div className="h-1 w-full fixed top-0 left-0 right-0 z-50 bg-[#1CB0F6]" />

            {/* ── COVER HERO ── */}
            <div className="relative w-full bg-slate-900 overflow-hidden" style={{ minHeight: 'clamp(180px, 28vw, 260px)' }}>
                {imageUrl && (
                    <>
                        <img src={imageUrl} alt={program.name} className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105" style={{ filter: 'blur(1px)' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent" />
                    </>
                )}
                {!imageUrl && <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />}

                {/* Breadcrumb */}
                <div className="relative z-10 px-4 sm:px-6 pt-6 flex items-center gap-2 text-xs font-bold text-white/50">
                    <button onClick={() => handleNavigate('/dashboard/tutor')} className="flex items-center gap-1 hover:text-white transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <span>/</span>
                    <button onClick={() => handleNavigate('/studio/programs')} className="flex items-center gap-1 hover:text-white transition-colors group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />Programs
                    </button>
                </div>

                {/* Hero content */}
                <div className="relative z-10 px-4 sm:px-6 pt-3 pb-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="space-y-2 max-w-2xl min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isProgramPublished ? 'bg-[#58CC02]/30 border-[#58CC02]/50 text-[#58CC02]' : 'bg-amber-500/30 border-amber-400/40 text-amber-300'}`}>
                                {isProgramPublished ? 'Published' : 'Draft'}
                            </span>
                            {(program.enrolled_count ?? 0) > 0 && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1CB0F6]/30 border border-[#1CB0F6]/40 text-[#1CB0F6]">
                                    {program.enrolled_count} Enrolled
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow">{program.name}</h1>
                        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-lg line-clamp-2">{program.description || 'No description provided.'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 shrink-0 pb-4 sm:pb-0">
                        <button onClick={() => setIsEditProgramOpen(true)} className="h-9 px-3 sm:px-4 rounded-xl border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-[#1CB0F6]" /><span className="hidden xs:inline">Edit</span>
                        </button>
                        <button onClick={() => setIsDeleteProgramOpen(true)} className="h-9 px-3 rounded-xl border-2 border-red-500/30 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleNavigate(`/studio/programs/${programId}/modules/new`)}
                            disabled={!!navigatingUrl}
                            className="h-9 px-3 sm:px-4 rounded-xl font-extrabold text-xs text-white flex items-center gap-1.5 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px disabled:opacity-60"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            {navigatingUrl === `/studio/programs/${programId}/modules/new` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span className="hidden xs:inline">New Module</span>
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="relative z-10 px-4 sm:px-6 flex items-center gap-4 sm:gap-6 text-xs font-bold text-white/50 border-t border-white/10 mt-3">
                    <div className="flex items-center gap-1.5 py-2.5">
                        <Layers className="w-3.5 h-3.5 text-[#CE82FF]" />
                        <span className="text-white/70">{modules.length} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
                        <Users className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        <span className="text-white/70">{program.enrolled_count ?? 0} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
                        <Globe className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span className="text-white/70">{isProgramPublished ? 'Live' : 'Not Published'}</span>
                    </div>
                </div>
            </div>

            {/* ── MODULES BODY ── */}
            <main className="px-4 sm:px-6 py-4 sm:py-5">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />{error}
                    </div>
                )}

                {modules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-[#EDF9E0] text-[#58CC02] flex items-center justify-center mb-3">
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <p className="text-base font-black text-slate-700 mb-1">No Modules Yet</p>
                        <p className="text-xs text-slate-400 font-medium mb-5 max-w-xs">Break your curriculum into modules to organise lessons and activities.</p>
                        <button
                            onClick={() => handleNavigate(`/studio/programs/${programId}/modules/new`)}
                            disabled={!!navigatingUrl}
                            className="h-10 px-5 rounded-xl font-extrabold text-xs text-white flex items-center gap-2 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px disabled:opacity-60"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            {navigatingUrl === `/studio/programs/${programId}/modules/new` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Create First Module
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {modules.map((module, i) => (
                            <motion.div key={module._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <ModuleCard
                                    module={module}
                                    parentProgramImage={program.image_url || program.cover_image}
                                    onClick={() => handleNavigate(`/studio/modules/${module._id}`)}
                                    onDelete={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedModuleForDelete(module); }}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {isEditProgramOpen && <EditProgramDialog isOpen={isEditProgramOpen} onClose={() => setIsEditProgramOpen(false)} program={program} onSave={handleSaveProgram} />}
            {selectedModuleForEdit && <EditModuleDialog isOpen={!!selectedModuleForEdit} onClose={() => setSelectedModuleForEdit(null)} programVoice={program?.default_voice} module={selectedModuleForEdit} onSave={handleSaveModule} />}
            {isDeleteProgramOpen && <DeleteConfirmDialog isOpen={isDeleteProgramOpen} onClose={() => setIsDeleteProgramOpen(false)} title={program.name} itemName={program.name} itemType="program" enrolledStudents={program.enrolled_students} enrolledCount={program.enrolled_count} onConfirm={handleConfirmDeleteProgram} />}
            {selectedModuleForDelete && <DeleteConfirmDialog isOpen={!!selectedModuleForDelete} onClose={() => setSelectedModuleForDelete(null)} title={selectedModuleForDelete.name} itemName={selectedModuleForDelete.name} itemType="module" onConfirm={handleConfirmDeleteModule} />}
        </div>
    );
}

export default function ProgramDetailPage() {
    return <ProtectedRoute><ProgramDetailContent /></ProtectedRoute>;
}
