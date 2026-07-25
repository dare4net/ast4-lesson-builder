'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Loader2, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { ProjectFolder } from '@/components/studio/project-folder';
import { motion } from 'framer-motion';

interface Program {
    _id: string;
    name: string;
    description: string;
    modules: any[];
    created_at: string;
}

function ProgramsContent() {
    const router = useRouter();
    const { logout } = useAuth();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchPrograms(); }, []);

    const fetchPrograms = async () => {
        try {
            const data = await apiClient.studio.getPrograms();
            setPrograms(data);
        } catch (err: any) {
            setError('Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading programs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top stripe */}
            <div className="h-1.5 w-full bg-[#58CC02] fixed top-0 left-0 right-0 z-50" />

            <div className="container mx-auto px-6 pt-14 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10 pt-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58CC02]/10 border border-[#58CC02]/20">
                            <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                            <span className="text-xs font-bold text-[#58CC02]">Course Creator Studio</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Programs</h1>
                        <p className="text-slate-500 text-sm max-w-lg">
                            Manage your interactive curriculums. Select a program to access its modules and lessons.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push('/dashboard/tutor')}
                            variant="outline"
                            className="border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100 bg-white font-semibold"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2 text-[#58CC02]" />
                            Dashboard
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                        <button
                            onClick={() => router.push('/studio/programs/new')}
                            className="h-10 px-5 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Plus className="w-4 h-4" />
                            New Program
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                {programs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-300 rounded-3xl bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center mb-5">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Programs Yet</h3>
                        <p className="text-slate-500 text-sm mb-7 max-w-md text-center">
                            Create your first educational program to start building courses with modules and lessons.
                        </p>
                        <button
                            onClick={() => router.push('/studio/programs/new')}
                            className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Plus className="w-4 h-4" />
                            Create First Program
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program, i) => (
                            <motion.div key={program._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                                <ProjectFolder
                                    program={program}
                                    onClick={() => router.push(`/studio/programs/${program._id}`)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProgramsPage() {
    return (
        <ProtectedRoute>
            <ProgramsContent />
        </ProtectedRoute>
    );
}
