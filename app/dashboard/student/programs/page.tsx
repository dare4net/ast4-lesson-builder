"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import { BookOpen, ChevronRight, ArrowLeft, Loader2, Layers, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const CARD_PALETTES = [
    { accent: "#1CB0F6", bg: "bg-[#1CB0F6]/10", border: "border-[#1CB0F6]/20", text: "text-[#1CB0F6]", bar: "bg-[#1CB0F6]", badgeBg: "bg-[#1CB0F6]/10", badgeBorder: "border-[#1CB0F6]/20" },
    { accent: "#FF9600", bg: "bg-[#FF9600]/10", border: "border-[#FF9600]/20", text: "text-[#FF9600]", bar: "bg-[#FF9600]", badgeBg: "bg-[#FF9600]/10", badgeBorder: "border-[#FF9600]/20" },
    { accent: "#CE82FF", bg: "bg-[#CE82FF]/10", border: "border-[#CE82FF]/20", text: "text-[#CE82FF]", bar: "bg-[#CE82FF]", badgeBg: "bg-[#CE82FF]/10", badgeBorder: "border-[#CE82FF]/20" },
    { accent: "#58CC02", bg: "bg-[#58CC02]/10", border: "border-[#58CC02]/20", text: "text-[#58CC02]", bar: "bg-[#58CC02]", badgeBg: "bg-[#58CC02]/10", badgeBorder: "border-[#58CC02]/20" }
]

export default function StudentProgramsListPage() {
    const { token } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [programs, setPrograms] = useState<any[]>([])

    useEffect(() => {
        if (token) fetchPrograms()
    }, [token])

    const fetchPrograms = async () => {
        setLoading(true)
        try {
            const rawPrograms = await apiClient.programs.getMyPrograms()
            const programList = Array.isArray(rawPrograms) ? rawPrograms : (rawPrograms?.data || rawPrograms?.programs || [])
            setPrograms(programList)
        } catch (err) {
            console.error("Failed to fetch enrolled courses", err)
        } finally {
            setLoading(false)
        }
    }

    const calculateProgress = (prog: any) => {
        if (typeof prog.progress?.percent_complete === 'number') return prog.progress.percent_complete
        if (typeof prog.progress?.percentComplete === 'number') return prog.progress.percentComplete
        if (typeof prog.overallProgress === 'number') return prog.overallProgress
        if (typeof prog.totalProgress === 'number') return prog.totalProgress
        if (typeof prog.percent_complete === 'number') return prog.percent_complete
        if (!prog.modules || prog.modules.length === 0) return 0
        const done = prog.progress?.completed_modules?.length || 0
        return Math.round((done / prog.modules.length) * 100)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/student')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">My Enrolled Courses</h1>
                        <p className="text-xs text-slate-500 font-medium">Select a course to continue learning.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 text-xs font-bold text-[#1CB0F6] self-start sm:self-auto">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{programs.length} {programs.length === 1 ? 'Course' : 'Courses'}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading your courses...</span>
                </div>
            ) : programs.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-extrabold text-slate-800">No enrolled courses yet</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1 max-w-sm mx-auto">
                        Browse the catalog to start learning!
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard/student/catalog')}
                        className="mt-4 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1482B8] text-white font-extrabold text-xs rounded-xl px-5 h-10"
                    >
                        Browse Catalog
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {programs.map((prog, idx) => {
                        const progressValue = calculateProgress(prog)
                        const palette = CARD_PALETTES[idx % CARD_PALETTES.length]

                        return (
                            <motion.div
                                key={prog._id || idx}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card
                                    onClick={() => router.push(`/dashboard/student/programs/${prog.program_id || prog._id}`)}
                                    className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer group h-full flex flex-col justify-between shadow-sm"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className={`w-11 h-11 rounded-2xl ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text}`}>
                                                <BookOpen className="w-5.5 h-5.5" />
                                            </div>
                                            <span className={`text-xs font-bold ${palette.text} ${palette.badgeBg} px-2.5 py-0.5 rounded-full border ${palette.badgeBorder}`}>
                                                Active
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className={`text-base font-extrabold text-slate-800 mb-1 group-hover:${palette.text} transition-colors`}>
                                                {prog.program_name || prog.name || prog.title || "Untitled Course"}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                {prog.description || "Interactive learning course."}
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider">Progress</span>
                                                <span className={`font-extrabold ${palette.text}`}>{progressValue}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${palette.bar} transition-all duration-500`}
                                                    style={{ width: `${progressValue}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                                        <span className="text-slate-400 font-bold flex items-center gap-1">
                                            <Layers className="w-3.5 h-3.5" />
                                            {prog.moduleCount || prog.modules?.length || 0} Modules
                                        </span>
                                        <div className={`flex items-center gap-1 ${palette.text} font-extrabold group-hover:translate-x-0.5 transition-transform`}>
                                            <span>Open</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
