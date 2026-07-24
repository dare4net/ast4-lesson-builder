"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { Book, Folder, FileText, ChevronRight, ArrowLeft, Loader2, Play, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function ProgramsPage() {
    const { user, token } = useAuth()
    const router = useRouter()

    const [view, setView] = useState<'programs' | 'modules' | 'lessons'>('programs')
    const [loading, setLoading] = useState(true)
    const [unregistering, setUnregistering] = useState<string | null>(null)

    const [programs, setPrograms] = useState<any[]>([])
    const [selectedProgram, setSelectedProgram] = useState<any>(null)
    const [selectedModule, setSelectedModule] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])

    useEffect(() => {
        if (token) {
            fetchPrograms()
        }
    }, [token])

    const fetchPrograms = async () => {
        setLoading(true)
        try {
            // Get ONLY registered programs
            const myPrograms = await apiClient.programs.getMyPrograms()
            setPrograms(myPrograms)
        } catch (err) {
            console.error("Failed to fetch programs", err)
        } finally {
            setLoading(false)
        }
    }

    const handleProgramSelect = async (program: any) => {
        setLoading(true)
        try {
            const details = await apiClient.programs.getDetails(program._id)
            setSelectedProgram({
                ...details,
                registration: program // Keep the registration data (progress, status)
            })
            setView('modules')
        } catch (err) {
            console.error("Failed to fetch program details", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnregister = async (programId: string) => {
        if (!confirm("Are you sure you want to terminate this deployment? All progress in this sector will be PERMANENTLY RESET.")) return

        setUnregistering(programId)
        try {
            await apiClient.programs.unregister(programId)
            setView('programs')
            fetchPrograms()
        } catch (err) {
            console.error("Failed to unregister", err)
        } finally {
            setUnregistering(null)
        }
    }

    const handleModuleSelect = async (module: any) => {
        setLoading(true)
        setSelectedModule(module)
        try {
            const moduleLessons = await apiClient.lessons.getModuleLessons(module._id)
            setLessons(moduleLessons)
            setView('lessons')
        } catch (err) {
            console.error("Failed to fetch lessons", err)
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (view === 'lessons') {
            setView('modules')
            setLessons([])
        } else if (view === 'modules') {
            setView('programs')
            setSelectedProgram(null)
        } else {
            router.push('/dashboard/student')
        }
    }

    const handleLaunchLesson = (lessonId: string) => {
        router.push(`/viewer/${lessonId}?userId=${user?.user_id}&token=${token}`)
    }

    // Progress Calculation Helpers
    const calculateProgramProgress = (prog: any) => {
        if (!prog.modules || prog.modules.length === 0) return 0
        const completedCount = prog.progress?.completed_modules?.length || 0
        return Math.round((completedCount / prog.modules.length) * 100)
    }

    const getModuleStatus = (moduleId: string) => {
        if (selectedProgram?.registration?.progress?.completed_modules?.includes(moduleId)) {
            return "COMPLETED"
        }
        return "ACTIVE"
    }

    return (
        <div className="space-y-8">
            {/* Breadcrumbs / Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-500 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.1em]">
                            {view === 'programs' && "Active Directives"}
                            {view === 'modules' && selectedProgram?.program_name}
                            {view === 'lessons' && (selectedModule?.title || selectedModule?.module_name)}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <span className={cn(view === 'programs' ? "text-emerald-500" : "text-slate-500")}>REGISTRY</span>
                            {(view === 'modules' || view === 'lessons') && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className={cn(view === 'modules' ? "text-emerald-500" : "text-slate-500")}>MODULES</span>
                                </>
                            )}
                            {view === 'lessons' && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-emerald-500">LESSONS</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {view === 'modules' && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            disabled={unregistering === selectedProgram?._id}
                            onClick={() => handleUnregister(selectedProgram?._id)}
                            className="rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[10px] tracking-widest h-10 px-6 uppercase transition-all flex items-center gap-2"
                        >
                            {unregistering === selectedProgram?._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    TERMINATE
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {view === 'lessons' && lessons.length > 0 && (
                    <div className="hidden md:flex flex-col items-end gap-2 pr-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector Progress</span>
                            <span className="text-xs font-black text-emerald-500 font-mono">
                                {Math.round(lessons.reduce((acc, l) => acc + (l.progress || 0), 0) / (lessons.length || 1))}%
                            </span>
                        </div>
                        <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                style={{ width: `${Math.round(lessons.reduce((acc, l) => acc + (l.progress || 0), 0) / (lessons.length || 1))}%` }}
                            />
                        </div>
                    </div>
                )}

                {view === 'programs' && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{programs.length} ENROLLED</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing Directives...</span>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="wait">
                        {view === 'programs' && (
                            programs.length > 0 ? (
                                programs.map((prog, idx) => {
                                    const progressValue = calculateProgramProgress(prog)
                                    return (
                                        <motion.div
                                            key={prog._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Card
                                                onClick={() => handleProgramSelect(prog)}
                                                className="p-8 rounded-[2rem] bg-slate-900/40 border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />

                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                            <Book className="w-6 h-6 text-emerald-500" />
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Deployment Status</span>
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ACTIVE</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">
                                                            {prog.program_name || prog.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 line-clamp-2 uppercase tracking-wider font-bold leading-relaxed">
                                                            {prog.description || "Experimental curriculum module."}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector Clearance</span>
                                                            <span className="text-sm font-black text-emerald-400 font-mono">{progressValue}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progressValue}%` }}
                                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/50">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        {prog.modules?.length || 0} SECTOR MODULES
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-[2.5rem]">
                                    <Book className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-black uppercase tracking-[0.2em]">No active deployments found in registry</p>
                                    <Button
                                        onClick={() => router.push('/dashboard/student/catalog')}
                                        className="mt-6 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-400"
                                    >
                                        QUERY CATALOG
                                    </Button>
                                </div>
                            )
                        )}

                        {view === 'modules' && (
                            selectedProgram?.modules?.map((mod: any, idx: number) => {
                                const status = getModuleStatus(mod._id)
                                return (
                                    <motion.div
                                        key={mod._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card
                                            onClick={() => handleModuleSelect(mod)}
                                            className="p-8 rounded-[2rem] bg-slate-900/40 border-slate-800 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between hover:border-blue-500/40"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                                        <Folder className="w-6 h-6 text-blue-500" />
                                                    </div>
                                                    <div className={cn(
                                                        "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                                        status === "COMPLETED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                            "bg-slate-950 border-slate-800 text-slate-500"
                                                    )}>
                                                        {status}
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                                                    {mod.title || mod.module_name}
                                                </h3>
                                                <p className="text-xs text-slate-500 line-clamp-2 uppercase tracking-wider font-bold leading-relaxed">
                                                    {mod.description || "Core Sector Training."}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    {mod.lessons?.length || 0} DIRECTIVES
                                                </span>
                                                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Card>
                                    </motion.div>
                                )
                            })
                        )}

                        {view === 'lessons' && (
                            lessons.map((lesson, idx) => (
                                <motion.div
                                    key={lesson._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        className="p-6 rounded-[2rem] bg-slate-900/40 border-slate-800 hover:border-emerald-500/40 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                                                        lesson.completed
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                            : "bg-slate-950 border-slate-800 text-slate-600"
                                                    )}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                                                            {lesson.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[8px] font-black tracking-widest uppercase",
                                                                lesson.completed ? "text-emerald-500" : "text-slate-500"
                                                            )}>
                                                                {lesson.completed ? "Sync Complete" :
                                                                    (lesson.progress > 0 ? `In Progress: ${lesson.progress}%` : "Ready for Deployment")}
                                                            </span>
                                                            {lesson.score !== null && (
                                                                <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1 rounded">
                                                                    SCORE: {lesson.score}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center px-0.5">
                                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                                        <span className="text-[7px] font-black text-emerald-500 font-mono">{lesson.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                            style={{ width: `${lesson.progress || 0}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        disabled={!lesson.lessonId}
                                                        onClick={() => handleLaunchLesson(lesson.lessonId)}
                                                        className={cn(
                                                            "w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-10 shadow-lg transition-all",
                                                            lesson.completed
                                                                ? "bg-slate-800 hover:bg-slate-700 text-white"
                                                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10"
                                                        )}
                                                    >
                                                        <Play className="w-3 h-3 mr-2" />
                                                        {lesson.completed ? "REVISIT TERMINAL" : "LAUNCH DIRECTIVE"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}

                        {view === 'lessons' && lessons.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Search className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em]">No directives found in this sector</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}
