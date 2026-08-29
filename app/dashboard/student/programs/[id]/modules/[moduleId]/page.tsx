"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/context/auth-context"
import { buildStudentViewerHref } from "@/lib/viewer-url"
import {
    Folder,
    ArrowLeft,
    FileText,
    Play,
    CheckCircle2,
    Loader2,
    Clock,
    BookOpen,
    Info,
    Award,
    Layers,
    Zap,
    RotateCcw,
    ChevronRight,
    HelpCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function StudentModuleDetailPage() {
    const params = useParams()
    const programId = params?.id as string
    const moduleId = params?.moduleId as string
    const router = useRouter()
    const { user, token } = useAuth()

    const [moduleData, setModuleData] = useState<any | null>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [programName, setProgramName] = useState<string>("Course")
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null)

    useEffect(() => {
        if (moduleId && token) {
            fetchModuleDetails()
        }
    }, [moduleId, token])

    const fetchModuleDetails = async () => {
        setLoading(true)
        try {
            // Fetch program details for breadcrumbs
            if (programId) {
                const programDetails = await apiClient.programs.getDetails(programId)
                setProgramName(programDetails.program_name || programDetails.name || programDetails.title || "Course")

                const foundMod = (programDetails.modules || []).find((m: any) => m._id === moduleId)
                if (foundMod) {
                    setModuleData(foundMod)
                }
            }

            // Fetch lessons for this specific module
            const fetchedLessons = await apiClient.lessons.getModuleLessons(moduleId)
            setLessons(Array.isArray(fetchedLessons) ? fetchedLessons : [])
        } catch (err) {
            console.error("Failed to load module details", err)
        } finally {
            setLoading(false)
        }
    }

    const getModuleTitle = () => {
        if (!moduleData) return "Module Details"
        return (
            moduleData.title ||
            moduleData.name ||
            moduleData.module_name ||
            moduleData.moduleTitle ||
            moduleData.module_title ||
            "Module Details"
        )
    }

    const getLessonTitle = (lesson: any, idx: number) => {
        return (
            lesson.title ||
            lesson.name ||
            lesson.lesson_title ||
            lesson.lessonTitle ||
            `Lesson ${idx + 1}`
        )
    }

    const completedLessonsCount = lessons.filter(l => l.completed).length
    const progressPct = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0

    const [launchingId, setLaunchingId] = useState<string | null>(null)

    const launchLesson = (lesson: any) => {
        const id = lesson.lessonId || lesson._id
        if (!id || launchingId) return
        setLaunchingId(id)
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        router.push(buildStudentViewerHref(id, { returnUrl, moduleId }))
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Module Lessons...</p>
            </div>
        )
    }

    const moduleTitle = getModuleTitle()

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Breadcrumbs */}
            <div className="space-y-2">
                <button
                    onClick={() => router.push(`/dashboard/student/programs/${programId}`)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1CB0F6] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {programName}
                </button>
            </div>

            {/* Module Hero Banner */}
            <Card className="p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 justify-between items-center">
                <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1CB0F6]/20 bg-[#1CB0F6]/10 w-fit mx-auto md:mx-0">
                        <Folder className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        <span className="text-xs font-extrabold text-[#1CB0F6]">Module Overview</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                        {moduleTitle}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">
                        {moduleData?.description || "Complete all interactive lessons in this module to boost your progress."}
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 min-w-[160px]">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Module Completion</span>
                    <span className="text-4xl font-extrabold text-[#1CB0F6]">{progressPct}%</span>
                    <div className="h-2 w-36 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#1CB0F6] rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Lessons List Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#58CC02]" />
                        <span>Interactive Lessons ({lessons.length})</span>
                    </h2>
                </div>

                {lessons.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-2">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-extrabold text-slate-700">No lessons available yet</p>
                        <p className="text-xs text-slate-400 font-semibold">Check back soon for new learning content in this module.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {lessons.map((lesson, idx) => {
                            const lessonTitle = getLessonTitle(lesson, idx)
                            const isCompleted = lesson.completed
                            const isStarted = (lesson.progress || 0) > 0 && !isCompleted

                            return (
                                <motion.div
                                    key={lesson._id || idx}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#1CB0F6] transition-all group flex flex-col justify-between h-full space-y-5">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                    <FileText className="w-5 h-5 text-[#1CB0F6]" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedLesson({ ...lesson, titleComputed: lessonTitle, index: idx })}
                                                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#1CB0F6]/10 text-slate-500 hover:text-[#1CB0F6] transition-colors border border-slate-200"
                                                        title="View Lesson Details"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${isCompleted
                                                        ? "bg-[#58CC02]/10 border-[#58CC02]/20 text-[#58CC02]"
                                                        : isStarted
                                                            ? "bg-[#FFC800]/10 border-[#FFC800]/20 text-[#D9A000]"
                                                            : "bg-slate-100 border-slate-200 text-slate-500"
                                                        }`}>
                                                        {isCompleted ? "Completed" : isStarted ? `${lesson.progress}% Done` : "Ready"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3
                                                    onClick={() => setSelectedLesson({ ...lesson, titleComputed: lessonTitle, index: idx })}
                                                    className="text-base font-extrabold text-slate-800 group-hover:text-[#1CB0F6] transition-colors cursor-pointer"
                                                >
                                                    Lesson {idx + 1}: {lessonTitle}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                                                    {lesson.description || "Interactive slide lesson with practice exercises."}
                                                </p>
                                            </div>

                                            {/* Quick Metadata Snippet */}
                                            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {lesson.duration || 10} mins
                                                </span>
                                                {lesson.totalSlides > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                        {lesson.totalSlides} slides
                                                    </span>
                                                )}
                                                {lesson.interactiveCount > 0 && (
                                                    <span className="flex items-center gap-1 text-[#FFC800]">
                                                        <Zap className="w-3.5 h-3.5 fill-[#FFC800]" />
                                                        {lesson.interactiveCount} activities
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedLesson({ ...lesson, titleComputed: lessonTitle, index: idx })}
                                                className="px-3.5 h-11 border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all bg-white"
                                            >
                                                Details
                                            </button>
                                            <button
                                                disabled={(!lesson.lessonId && !lesson._id) || launchingId === (lesson.lessonId || lesson._id)}
                                                onClick={() => launchLesson(lesson)}
                                                className="flex-1 h-11 bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                                            >
                                                {launchingId === (lesson.lessonId || lesson._id) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4 fill-white" />
                                                        <span>{isCompleted ? "Review Lesson" : isStarted ? "Continue" : "Start Lesson"}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Lesson Details Modal */}
            <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
                <DialogContent className="max-w-md rounded-3xl bg-white border-2 border-slate-200 p-6 space-y-6">
                    {selectedLesson && (
                        <>
                            <DialogHeader className="space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1CB0F6]">
                                        Lesson {selectedLesson.index + 1}
                                    </span>
                                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${selectedLesson.completed
                                        ? "bg-[#58CC02]/10 border-[#58CC02]/20 text-[#58CC02]"
                                        : (selectedLesson.progress || 0) > 0
                                            ? "bg-[#FFC800]/10 border-[#FFC800]/20 text-[#D9A000]"
                                            : "bg-slate-100 border-slate-200 text-slate-500"
                                        }`}>
                                        {selectedLesson.completed ? "Completed" : (selectedLesson.progress || 0) > 0 ? `${selectedLesson.progress}% Done` : "Not Started"}
                                    </span>
                                </div>

                                <DialogTitle className="text-xl font-extrabold text-slate-800 leading-snug">
                                    {selectedLesson.titleComputed}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed">
                                    {selectedLesson.description || "Interactive slide lesson designed with guided practice and real-time feedback."}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Lesson Stats 4-Tile Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#1CB0F6]/10 text-[#1CB0F6] flex items-center justify-center font-bold">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Duration</p>
                                        <p className="text-xs font-extrabold text-slate-700">{selectedLesson.duration || 10} Mins</p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#CE82FF]/10 text-[#CE82FF] flex items-center justify-center font-bold">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Slides</p>
                                        <p className="text-xs font-extrabold text-slate-700">{selectedLesson.totalSlides ?? 0} Total</p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#FFC800]/10 text-[#D9A000] flex items-center justify-center font-bold">
                                        <Zap className="w-4 h-4 fill-[#D9A000]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Activities</p>
                                        <p className="text-xs font-extrabold text-slate-700">
                                            {selectedLesson.interactiveCount || 0} {(selectedLesson.categoryCounts?.gamified > 0) ? `(${selectedLesson.categoryCounts.interactive || 0} int / ${selectedLesson.categoryCounts.gamified} gami)` : "Interactive"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#58CC02]/10 text-[#58CC02] flex items-center justify-center font-bold">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
                                        <p className="text-xs font-extrabold text-slate-700">
                                            {selectedLesson.score || 0} / {selectedLesson.totalScore || 0} pts
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <DialogFooter className="pt-2 flex flex-col gap-2 sm:flex-col">
                                <button
                                    onClick={() => {
                                        const lesson = selectedLesson
                                        setSelectedLesson(null)
                                        launchLesson(lesson)
                                    }}
                                    className="w-full h-12 bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:border-b-0 active:translate-y-[2px]"
                                >
                                    <Play className="w-4 h-4 fill-white" />
                                    <span>
                                        {selectedLesson.completed ? "Review Lesson in Viewer" : (selectedLesson.progress || 0) > 0 ? "Continue Lesson" : "Start Lesson"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedLesson(null)}
                                    className="w-full h-10 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Close
                                </button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

