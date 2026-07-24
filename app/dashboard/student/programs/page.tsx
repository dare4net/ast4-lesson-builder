"use client"

import { useState, useEffect } from "react"
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
            const myPrograms = await apiClient.programs.getMyPrograms()
            setPrograms(myPrograms)
        } catch (err) {
            console.error("Failed to fetch enrolled courses", err)
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
                registration: program
            })
            setView('modules')
        } catch (err) {
            console.error("Failed to fetch course details", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnregister = async (programId: string) => {
        if (!confirm("Are you sure you want to unenroll from this course? Your progress will be removed.")) return

        setUnregistering(programId)
        try {
            await apiClient.programs.unregister(programId)
            setView('programs')
            fetchPrograms()
        } catch (err) {
            console.error("Failed to unenroll", err)
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

    const calculateProgramProgress = (prog: any) => {
        if (!prog.modules || prog.modules.length === 0) return 0
        const completedCount = prog.progress?.completed_modules?.length || 0
        return Math.round((completedCount / prog.modules.length) * 100)
    }

    const getModuleStatus = (moduleId: string) => {
        if (selectedProgram?.registration?.progress?.completed_modules?.includes(moduleId)) {
            return "Completed"
        }
        return "In Progress"
    }

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {view === 'programs' && "My Enrolled Courses"}
                            {view === 'modules' && (selectedProgram?.program_name || selectedProgram?.name || selectedProgram?.title || "Course")}
                            {view === 'lessons' && (selectedModule?.title || selectedModule?.name || selectedModule?.module_name)}
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className={cn(view === 'programs' ? "text-green-600 dark:text-green-400 font-semibold" : "")}>Courses</span>
                            {(view === 'modules' || view === 'lessons') && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                    <span className={cn(view === 'modules' ? "text-green-600 dark:text-green-400 font-semibold" : "")}>Modules</span>
                                </>
                            )}
                            {view === 'lessons' && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                    <span className="text-green-600 dark:text-green-400 font-semibold">Lessons</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {view === 'modules' && (
                    <Button
                        variant="ghost"
                        disabled={unregistering === selectedProgram?._id}
                        onClick={() => handleUnregister(selectedProgram?._id)}
                        className="rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-xs h-9 px-4 flex items-center gap-2 self-start sm:self-auto"
                    >
                        {unregistering === selectedProgram?._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                Unenroll from Course
                            </>
                        )}
                    </Button>
                )}

                {view === 'programs' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-xs font-semibold text-green-700 dark:text-green-400 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {programs.length} {programs.length === 1 ? 'Course' : 'Courses'} Enrolled
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-xs font-medium text-slate-500">Loading details...</span>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    <AnimatePresence mode="wait">
                        {view === 'programs' && (
                            programs.length > 0 ? (
                                programs.map((prog, idx) => {
                                    const progressValue = calculateProgramProgress(prog)
                                    return (
                                        <motion.div
                                            key={prog._id}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Card
                                                onClick={() => handleProgramSelect(prog)}
                                                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-green-500/40 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between shadow-sm hover:shadow-md"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                                            <Book className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
                                                            Active
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                            {prog.program_name || prog.name || prog.title || "Untitled Course"}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                            {prog.description || "Interactive learning course."}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Overall Progress</span>
                                                            <span className="font-bold text-green-600 dark:text-green-400">{progressValue}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 transition-all duration-500"
                                                                style={{ width: `${progressValue}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                                        {prog.modules?.length || 0} Modules
                                                    </span>
                                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                                                        <span>View Course</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="col-span-full py-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/30">
                                    <Book className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No enrolled courses</h3>
                                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                                        You haven't enrolled in any learning courses yet. Browse the catalog to start learning!
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/student/catalog')}
                                        className="mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-xl px-5"
                                    >
                                        Browse Course Catalog
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
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card
                                            onClick={() => handleModuleSelect(mod)}
                                            className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-500/40"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <Folder className="w-5 h-5" />
                                                    </div>
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                                        status === "Completed"
                                                            ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400"
                                                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                                    )}>
                                                        {status}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {mod.title || mod.name || mod.module_name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {mod.description || "Module learning content."}
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                                    {mod.lessons?.length || 0} Lessons
                                                </span>
                                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                                                    <span>Open Module</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
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
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5",
                                                lesson.completed
                                                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400"
                                                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                                            )}>
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {lesson.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={cn(
                                                        "text-xs font-semibold",
                                                        lesson.completed ? "text-green-600 dark:text-green-400" : "text-slate-500"
                                                    )}>
                                                        {lesson.completed ? "Completed" : (lesson.progress > 0 ? `${lesson.progress}% done` : "Not started")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            disabled={!lesson.lessonId}
                                            onClick={() => handleLaunchLesson(lesson.lessonId)}
                                            className={cn(
                                                "w-full rounded-xl font-semibold text-xs h-9 transition-all flex items-center justify-center gap-2",
                                                lesson.completed
                                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                    : "bg-green-600 hover:bg-green-500 text-white shadow-sm"
                                            )}
                                        >
                                            <Play className="w-3.5 h-3.5" />
                                            {lesson.completed ? "Review Lesson" : (lesson.progress > 0 ? "Continue Lesson" : "Start Lesson")}
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))
                        )}

                        {view === 'lessons' && lessons.length === 0 && (
                            <div className="col-span-full py-16 text-center">
                                <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">No lessons in this module</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}
