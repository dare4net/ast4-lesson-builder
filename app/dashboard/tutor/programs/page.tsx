"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Plus, BookOpen, Search, Folder, Layers, Loader2, Sparkles, CheckCircle2, FileEdit } from "lucide-react"
import { motion } from "framer-motion"

interface Program {
    _id: string;
    program_name?: string;
    name?: string;
    description: string;
    modules: any[];
}

const DUO_THEME_PALETTES = [
    { bg: "bg-[#1CB0F6]/10", border: "border-[#1CB0F6]/20", text: "text-[#1CB0F6]" },
    { bg: "bg-[#58CC02]/10", border: "border-[#58CC02]/20", text: "text-[#58CC02]" },
    { bg: "bg-[#FF9600]/10", border: "border-[#FF9600]/20", text: "text-[#FF9600]" },
    { bg: "bg-[#CE82FF]/10", border: "border-[#CE82FF]/20", text: "text-[#CE82FF]" }
]

export default function TutorProgramsPage() {
    const router = useRouter()
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchPrograms()
    }, [])

    const fetchPrograms = async () => {
        try {
            const data = await apiClient.studio.getPrograms()
            setPrograms(data)
        } catch (err) {
            console.error("Failed to load programs", err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = programs.filter(p =>
        (p.program_name || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Loading course programs...</p>
            </div>
        )
    }

    return (
        <div className="space-y-7">
            {/* Header */}
            <div className="p-6 md:p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1CB0F6]/30 bg-[#1CB0F6]/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        <span className="text-xs font-bold text-[#1CB0F6]">Course Creator Studio</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                        Course Programs
                    </h1>
                    <p className="text-slate-500 text-sm max-w-xl">
                        Manage your course catalog, modules, and interactive learning activities.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        onClick={() => router.push('/studio/programs/new')}
                        className="w-full sm:w-auto h-11 px-5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shrink-0 border-b-4 bg-[#1CB0F6] hover:bg-[#1899D6] border-[#1482B8] transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                    >
                        <Plus className="w-4 h-4" />
                        Create Course
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center bg-white flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 text-[#1CB0F6] flex items-center justify-center mb-4">
                        <Folder className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No courses found</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm">
                        {searchQuery ? `No courses matching "${searchQuery}".` : "Your course catalog is empty. Create your first course to get started."}
                    </p>
                    <button
                        onClick={() => router.push('/studio/programs/new')}
                        className="mt-6 h-10 px-5 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 bg-[#1CB0F6] hover:bg-[#1899D6] border-[#1482B8] transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                    >
                        Create New Course
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((prog, i) => {
                        const imageUrl = (prog as any).image_url || (prog as any).cover_image
                        const palette = DUO_THEME_PALETTES[i % DUO_THEME_PALETTES.length]
                        return (
                            <motion.div
                                key={prog._id}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <div
                                    onClick={() => router.push(`/studio/programs/${prog._id}`)}
                                    className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between h-full hover:border-[#1CB0F6]/40 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div>
                                        {/* Proportionally Scaled Banner */}
                                        {imageUrl ? (
                                            <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={prog.name || prog.program_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                                />
                                                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1CB0F6] bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="h-24 w-full p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <div className={`w-10 h-10 rounded-xl ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text}`}>
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1CB0F6] bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-4 space-y-1">
                                            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight group-hover:text-[#1CB0F6] transition-colors leading-snug line-clamp-1">
                                                {prog.program_name || prog.name || "Untitled Course"}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                {prog.description || "Course modules and activities."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-4 pb-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                        <span className="inline-flex items-center gap-1 font-extrabold text-slate-400">
                                            <Layers className="w-3 h-3 text-[#1CB0F6]" />
                                            {prog.modules?.length || 0} Modules
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/studio/programs/${prog._id}`); }}
                                            className="bg-[#1CB0F6] hover:bg-[#1899D6] border-b-2 border-[#1482B8] text-white font-extrabold text-[11px] h-7 px-3 rounded-lg flex items-center gap-1 shrink-0"
                                        >
                                            <FileEdit className="w-3 h-3" />
                                            <span>Manage</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
