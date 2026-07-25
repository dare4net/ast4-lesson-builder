'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, LogOut, Layout, LayoutDashboard } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { ProjectFolder } from '@/components/studio/project-folder';

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

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const data = await apiClient.studio.getPrograms();
            setPrograms(data);
        } catch (err: any) {
            setError('Failed to load programs');
            console.error(err);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-4 text-gray-600">Loading programs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Cinematic Header Background */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-slate-800/50 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em]">Studio Dashboard</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight">
                            My Programs
                            <span className="text-emerald-500">.</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-lg text-lg">
                            Manage your interactive curriculums. Select a project folder to access modules and lessons.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push('/dashboard/tutor')}
                            variant="outline"
                            className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/50"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2 text-emerald-400" />
                            Tutor Dashboard
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                        <Button
                            onClick={() => router.push('/studio/programs/new')}
                            size="lg"
                            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Program
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl backdrop-blur-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                {/* Grid Content */}
                {programs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-800 rounded-3xl bg-slate-950/50">
                        <div className="p-6 rounded-full bg-slate-900 mb-6">
                            <BookOpen className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Workspace Empty</h3>
                        <p className="text-slate-500 mb-8 max-w-md text-center">Initialize your first educational program to begin building content.</p>
                        <Button
                            onClick={() => router.push('/studio/programs/new')}
                            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Initialize Program
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {programs.map((program) => (
                            <ProjectFolder
                                key={program._id}
                                program={program}
                                onClick={() => router.push(`/studio/programs/${program._id}`)}
                            />
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
