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
                <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Loading course programs...</p>
            </div>
        )
    }

    return (
        <div className="space-y-7">
            {/* Header */}
            <div className="p-6 md:p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/30 bg-[#58CC02]/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span className="text-xs font-bold text-[#58CC02]">Course Creator Studio</span>
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
                            className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#58CC02] focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        onClick={() => router.push('/studio/programs/new')}
                        className="w-full sm:w-auto h-11 px-5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shrink-0 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                        style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                    >
                        <Plus className="w-4 h-4" />
                        Create Course
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center bg-white flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center mb-4">
                        <Folder className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No courses found</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm">
                        {searchQuery ? `No courses matching "${searchQuery}".` : "Your course catalog is empty. Create your first course to get started."}
                    </p>
                    <button
                        onClick={() => router.push('/studio/programs/new')}
                        className="mt-6 h-10 px-5 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px]"
                        style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                    >
                        Create New Course
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((prog, i) => (
                        <motion.div
                            key={prog._id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Card className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4 flex flex-col justify-between h-full hover:border-[#58CC02]/40 hover:shadow-md transition-all group cursor-pointer">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#58CC02] bg-[#58CC02]/10 px-2.5 py-0.5 rounded-full border border-[#58CC02]/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-800 tracking-tight group-hover:text-[#58CC02] transition-colors">
                                            {prog.program_name || prog.name || "Untitled Course"}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                            {prog.description || "Course modules and interactive activities."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
                                        <Layers className="w-3.5 h-3.5 text-[#58CC02]" />
                                        {prog.modules?.length || 0} Modules
                                    </span>
                                    <button
                                        onClick={() => router.push(`/studio/programs/${prog._id}`)}
                                        className="h-8 px-3 rounded-lg text-xs font-bold text-[#58CC02] hover:bg-[#58CC02]/10 transition-colors flex items-center gap-1"
                                    >
                                        <FileEdit className="w-3.5 h-3.5" />
                                        Manage
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
