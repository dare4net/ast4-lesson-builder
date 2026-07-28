'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, BookOpen, Loader2, LogOut, LayoutDashboard, Layers, Search, Globe, FileText } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { ProjectFolder } from '@/components/studio/project-folder';
import { motion, AnimatePresence } from 'framer-motion';

interface Program {
    _id: string;
    name: string;
    description: string;
    modules: any[];
    is_published?: boolean;
    created_at: string;
}

function StudioContent() {
    const router = useRouter();
    const { logout } = useAuth();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        fetchPrograms();
        // Splash screen loads and leaves automatically after 1.2s
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const fetchPrograms = async () => {
        try {
            const data = await apiClient.studio.getPrograms();
            setPrograms(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const filteredPrograms = programs.filter(p => {
        const q = searchQuery.toLowerCase();
        const match = p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false);
        if (statusFilter === 'published') return match && p.is_published !== false;
        if (statusFilter === 'draft') return match && p.is_published === false;
        return match;
    });

    const totalModules = programs.reduce((acc, p) => acc + (p.modules?.length || 0), 0);
    const publishedCount = programs.filter(p => p.is_published !== false).length;
    const draftCount = programs.filter(p => p.is_published === false).length;

    return (
        <div className="min-h-screen bg-[#F7F8FA] relative overflow-x-hidden">
            {/* ── ENTRANCE SPLASH SCREEN (LOADS & LEAVES) ── */}
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        key="studio-splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.03 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut' }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-white p-3.5 shadow-2xl shadow-[#1CB0F6]/30 mb-5 flex items-center justify-center">
                                <img src="/icons/icon-512x512.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Creator Studio</h1>
                            <p className="mt-2 text-xs font-bold text-slate-400 tracking-wide uppercase">Authoring Workspace</p>
                        </motion.div>
                        <div className="mt-8 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#1CB0F6] animate-spin" />
                            <span className="text-xs font-bold text-slate-500">Entering Studio...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-1 w-full fixed top-0 left-0 right-0 z-40 bg-[#1CB0F6]" />

            {/* ── TOP NAV ── */}
            <header className="sticky top-1 z-30 bg-white border-b-2 border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <img src="/icons/icon-512x512.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6] hidden sm:block">Creator Studio</p>
                        <p className="text-sm font-black text-slate-800 leading-tight truncate">My Programs</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => router.push('/dashboard/tutor')}
                        className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 border-2 border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="h-9 w-9 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => router.push('/studio/programs/new')}
                        className="h-9 px-3 sm:px-4 rounded-xl font-extrabold text-xs text-white flex items-center gap-1.5 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                        style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Program</span>
                    </button>
                </div>
            </header>

            {/* ── MAIN STUDIO CONTENT ── */}
            <main className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Programs', value: programs.length, color: '#1CB0F6', bg: '#EAF6FE', icon: <BookOpen className="w-4 h-4" /> },
                        { label: 'Published', value: publishedCount, color: '#58CC02', bg: '#EDF9E0', icon: <Globe className="w-4 h-4" /> },
                        { label: 'Drafts', value: draftCount, color: '#FF9600', bg: '#FFF4E0', icon: <FileText className="w-4 h-4" /> },
                        { label: 'Modules', value: totalModules, color: '#CE82FF', bg: '#F5EEFF', icon: <Layers className="w-4 h-4" /> },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border-2 border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-wider truncate" style={{ color: s.color }}>{s.label}</p>
                                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                                {s.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col xs:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs font-semibold bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#1CB0F6] transition-colors"
                        />
                    </div>
                    <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-1 gap-1 shrink-0">
                        {([
                            { key: 'all', label: 'All', color: '#1CB0F6' },
                            { key: 'published', label: 'Live', color: '#58CC02' },
                            { key: 'draft', label: 'Draft', color: '#FF9600' },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className="flex-1 xs:flex-none h-7 px-2.5 rounded-lg text-xs font-black transition-all whitespace-nowrap"
                                style={statusFilter === tab.key
                                    ? { backgroundColor: tab.color, color: '#fff' }
                                    : { color: '#94a3b8' }
                                }
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />{error}
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-[#1CB0F6] animate-spin" />
                    </div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-[#EAF6FE] text-[#1CB0F6] flex items-center justify-center mb-3">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <p className="text-base font-black text-slate-700 mb-1">No Programs Found</p>
                        <p className="text-xs text-slate-400 font-medium mb-5 max-w-xs">
                            {searchQuery ? 'No programs match your search.' : 'Create your first program to start building interactive courses.'}
                        </p>
                        <button
                            onClick={() => router.push('/studio/programs/new')}
                            className="h-10 px-5 rounded-xl font-extrabold text-xs text-white flex items-center gap-2 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Plus className="w-4 h-4" />Create Program
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {filteredPrograms.map((program, i) => (
                            <motion.div key={program._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <ProjectFolder
                                    program={program}
                                    onClick={() => router.push(`/studio/programs/${program._id}`)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function StudioPage() {
    return <ProtectedRoute><StudioContent /></ProtectedRoute>;
}
