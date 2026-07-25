'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, ArrowLeft, Trash2, LayoutDashboard, Loader2, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { ModuleCard } from '@/components/studio/module-card';
import { motion } from 'framer-motion';

interface Module { _id: string; name: string; description: string; lessons: any[]; order: number; }
interface Program { _id: string; name: string; description: string; modules: string[]; }

function ProgramDetailContent() {
    const router = useRouter();
    const params = useParams();
    const programId = params?.id as string;

    const [program, setProgram] = useState<Program | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { if (programId) fetchProgramData(); }, [programId]);

    const fetchProgramData = async () => {
        try {
            const [programData, modulesData] = await Promise.all([
                apiClient.studio.getProgram(programId),
                apiClient.studio.getModules(programId),
            ]);
            setProgram(programData);
            setModules(modulesData);
        } catch (err: any) {
            setError('Failed to load program');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;
        try {
            await apiClient.studio.deleteProgram(programId);
            router.push('/studio/programs');
        } catch { alert('Failed to delete program'); }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this module?')) return;
        try {
            await apiClient.studio.deleteModule(moduleId);
            fetchProgramData();
        } catch { alert('Failed to delete module'); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading program...</p>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="bg-white border-2 border-slate-200 rounded-3xl">
                    <CardContent className="py-12 text-center space-y-4">
                        <p className="text-red-500 font-semibold">Program not found</p>
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
                {/* Breadcrumb nav */}
                <div className="flex items-center gap-2 mt-6 mb-8 text-sm">
                    <button onClick={() => router.push('/dashboard/tutor')} className="flex items-center gap-1.5 text-slate-400 hover:text-[#58CC02] font-semibold transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                    </button>
                    <span className="text-slate-300">/</span>
                    <button onClick={() => router.push('/studio/programs')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-semibold transition-colors group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Programs
                    </button>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pb-8 mb-10 border-b-2 border-slate-200">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58CC02]/10 border border-[#58CC02]/20">
                            <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                            <span className="text-xs font-bold text-[#58CC02]">Program Overview</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{program.name}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">{program.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDeleteProgram}
                            className="h-10 px-4 rounded-xl text-sm font-bold text-red-500 bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                        <button
                            onClick={() => router.push(`/studio/programs/${programId}/modules/new`)}
                            className="h-10 px-5 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Plus className="w-4 h-4" />
                            New Module
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />{error}
                    </div>
                )}

                {modules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-300 rounded-3xl bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center mb-5">
                            <FolderOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Modules Yet</h3>
                        <p className="text-slate-500 text-sm mb-7 max-w-md text-center">Break your curriculum into modules to organise your lessons and activities.</p>
                        <button
                            onClick={() => router.push(`/studio/programs/${programId}/modules/new`)}
                            className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Plus className="w-4 h-4" />
                            Create First Module
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {modules.map((module, i) => (
                            <motion.div key={module._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                                <ModuleCard
                                    module={module}
                                    onClick={() => router.push(`/studio/modules/${module._id}`)}
                                    onDelete={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProgramDetailPage() {
    return <ProtectedRoute><ProgramDetailContent /></ProtectedRoute>;
}
