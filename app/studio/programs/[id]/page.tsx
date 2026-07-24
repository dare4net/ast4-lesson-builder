'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderOpen, ArrowLeft, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { ModuleCard } from '@/components/studio/module-card';

interface Module {
    _id: string;
    name: string;
    description: string;
    lessons: any[];
    order: number;
}

interface Program {
    _id: string;
    name: string;
    description: string;
    modules: string[];
}

function ProgramDetailContent() {
    const router = useRouter();
    const params = useParams();
    const programId = params?.id as string;

    const [program, setProgram] = useState<Program | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (programId) {
            fetchProgramData();
        }
    }, [programId]);

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
            return;
        }

        try {
            await apiClient.studio.deleteProgram(programId);
            router.push('/studio/programs');
        } catch (err: any) {
            alert('Failed to delete program');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this module?')) {
            return;
        }

        try {
            await apiClient.studio.deleteModule(moduleId);
            // Refresh data
            fetchProgramData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete module');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-4 text-gray-600">Loading program...</p>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-red-600">Program not found</p>
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
            {/* Cinematic Header Background */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/studio/programs')}
                    className="mb-8 text-slate-500 hover:text-white pl-0 hover:bg-transparent transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    My Programs
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-slate-800/50 pb-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <span className="h-1 w-1 bg-indigo-400 rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em]">Program Overview</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight">
                            {program.name}
                            <span className="text-indigo-500">.</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                            {program.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteProgram}
                            className="border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Program
                        </Button>
                        <Button
                            onClick={() => router.push(`/studio/programs/${programId}/modules/new`)}
                            size="lg"
                            className="bg-indigo-600 text-white hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-900/20"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Module
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl backdrop-blur-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                {/* Modules Grid */}
                {modules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-800 rounded-3xl bg-slate-950/50">
                        <div className="p-6 rounded-full bg-slate-900 mb-6">
                            <FolderOpen className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Modules Found</h3>
                        <p className="text-slate-500 mb-8 max-w-md text-center">Break down your curriculum into manageable modules to begin organization.</p>
                        <Button
                            onClick={() => router.push(`/studio/programs/${programId}/modules/new`)}
                            className="bg-indigo-600 text-white hover:bg-indigo-500 font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Module
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {modules.map((module) => (
                            <ModuleCard
                                key={module._id}
                                module={module}
                                onClick={() => router.push(`/studio/modules/${module._id}`)}
                                onDelete={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleDeleteModule(module._id);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProgramDetailPage() {
    return (
        <ProtectedRoute>
            <ProgramDetailContent />
        </ProtectedRoute>
    );
}
