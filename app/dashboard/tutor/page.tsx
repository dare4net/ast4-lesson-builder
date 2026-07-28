"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen, Users, Layers, ArrowRight,
    Loader2, Globe, FileText, ChevronRight
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface Program {
    _id: string;
    name: string;
    description?: string;
    modules: any[];
    is_published?: boolean;
    created_at: string;
    enrolled_count?: number;
    enrolled_students?: string[];
    image_url?: string;
    cover_image?: string;
}

export default function TutorDashboardOverview() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.studio.getPrograms()
            .then((data) => setPrograms(Array.isArray(data) ? data : []))
            .catch(() => setPrograms([]))
            .finally(() => setLoading(false));
    }, []);

    // Derive all stats from programs data
    const totalModules = programs.reduce((a, p) => a + (p.modules?.length || 0), 0);
    const published = programs.filter(p => p.is_published !== false);
    const drafts = programs.filter(p => p.is_published === false);
    const totalLessons = programs.reduce((a, p) => a + (p.lessons_count ?? p.modules?.reduce((b: number, m: any) => b + (m.lessons_count || m.lessons?.length || 0), 0) ?? 0), 0);
    const publishRate = programs.length > 0 ? Math.round((published.length / programs.length) * 100) : 0;
    const topPrograms = [...programs].sort((a, b) => (b.modules?.length || 0) - (a.modules?.length || 0)).slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 text-[#1CB0F6] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {([
                    {
                        label: 'Programs',
                        value: programs.length,
                        sub: `${published.length} live · ${drafts.length} draft`,
                        color: '#1CB0F6', bg: '#EAF6FE',
                        icon: <BookOpen className="w-5 h-5" />,
                        bar: publishRate,
                    },
                    {
                        label: 'Modules',
                        value: totalModules,
                        sub: `across ${programs.length} program${programs.length !== 1 ? 's' : ''}`,
                        color: '#FF9600', bg: '#FFF4E0',
                        icon: <Layers className="w-5 h-5" />,
                        bar: null,
                    },
                    {
                        label: 'Published',
                        value: published.length,
                        sub: `${publishRate}% publish rate`,
                        color: '#58CC02', bg: '#EDF9E0',
                        icon: <Globe className="w-5 h-5" />,
                        bar: publishRate,
                    },
                    {
                        label: 'Drafts',
                        value: drafts.length,
                        sub: drafts.length > 0 ? 'Ready to publish' : 'All content is live',
                        color: '#CE82FF', bg: '#F5EEFF',
                        icon: <FileText className="w-5 h-5" />,
                        bar: null,
                    },
                ] as const).map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                                    {s.icon}
                                </div>
                                <span className="text-2xl font-black text-slate-800">{s.value}</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.sub}</p>
                            </div>
                            {s.bar !== null && (
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${s.bar}%`, backgroundColor: s.color }}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── TWO COLUMN: Programs health + Quick Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Programs table - takes 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 rounded-full bg-[#1CB0F6]" />
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Program Overview</h2>
                        </div>
                        <Link href="/studio/programs" className="flex items-center gap-1 text-[10px] font-black text-[#1CB0F6] hover:underline">
                            Open Studio <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {programs.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-400 mb-1">No programs yet</p>
                            <p className="text-[10px] text-slate-300">Create your first program in the Studio</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {topPrograms.map((program, i) => {
                                const isPublished = program.is_published !== false;
                                const imageUrl = program.image_url || program.cover_image;
                                const moduleCount = program.modules?.length || 0;
                                const maxModules = Math.max(...programs.map(p => p.modules?.length || 0), 1);
                                const barWidth = Math.round((moduleCount / maxModules) * 100);

                                return (
                                    <div key={program._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                                        {/* Rank */}
                                        <span className="text-[10px] font-black text-slate-300 w-4 shrink-0">#{i + 1}</span>

                                        {/* Thumbnail or color block */}
                                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                            {imageUrl
                                                ? <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                                                : <BookOpen className="w-4 h-4 text-slate-300" />
                                            }
                                        </div>

                                        {/* Name + bar */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 truncate">{program.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full rounded-full bg-[#1CB0F6]" style={{ width: `${barWidth}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                                    {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${isPublished
                                            ? 'bg-[#EDF9E0] text-[#58CC02] border-[#C3EEA0]'
                                            : 'bg-[#FFF4E0] text-[#FF9600] border-[#FFD99A]'}`}>
                                            {isPublished ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right column: summary stats stack */}
                <div className="space-y-3">
                    {/* Publish rate ring */}
                    <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 flex items-center gap-4">
                        {/* SVG ring */}
                        <div className="relative w-14 h-14 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="15.5" fill="none"
                                    stroke="#58CC02" strokeWidth="3"
                                    strokeDasharray={`${publishRate} ${100 - publishRate}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800">{publishRate}%</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#58CC02]">Publish Rate</p>
                            <p className="text-sm font-black text-slate-800">{published.length} of {programs.length}</p>
                            <p className="text-[10px] text-slate-400 font-medium">programs live</p>
                        </div>
                    </div>

                    {/* Content breakdown */}
                    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Content Breakdown</p>
                        {[
                            { label: 'Programs', value: programs.length, color: '#1CB0F6' },
                            { label: 'Modules', value: totalModules, color: '#FF9600' },
                            { label: 'Lessons', value: totalLessons, color: '#CE82FF' },
                        ].map(row => {
                            const max = Math.max(programs.length, totalModules, totalLessons, 1);
                            return (
                                <div key={row.label} className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 w-14 shrink-0">{row.label}</span>
                                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, backgroundColor: row.color }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-700 w-6 text-right">{row.value}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Studio shortcut (Animated CTA) */}
                    <Link href="/studio">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative overflow-hidden bg-slate-900 border-2 border-[#1CB0F6]/40 hover:border-[#1CB0F6] transition-all rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer group shadow-lg shadow-[#1CB0F6]/10"
                        >
                            {/* Animated ambient glow ring */}
                            <motion.div
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -inset-1 bg-gradient-to-r from-[#1CB0F6]/20 via-[#58CC02]/20 to-[#CE82FF]/20 rounded-2xl blur-sm -z-10"
                            />

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                                    <img src="/icons/icon-512x512.png" alt="Studio Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white">Creator Studio</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Build & edit interactive courses</p>
                                </div>
                            </div>

                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-8 h-8 rounded-xl bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 shadow-md"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </motion.div>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* ── Students CTA (link only — no list, no data dependency) ── */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EDF9E0] text-[#58CC02] flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800">Student Management</p>
                        <p className="text-xs text-slate-400 font-medium">View progress, scores, and enrolled programs per student.</p>
                    </div>
                </div>
                <Link href="/dashboard/tutor/students">
                    <button className="h-9 px-4 rounded-xl font-extrabold text-xs text-white flex items-center gap-1.5 border-b-[3px] shrink-0 transition-all duration-100 active:border-b-0 active:translate-y-px whitespace-nowrap"
                        style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}>
                        View Students <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
