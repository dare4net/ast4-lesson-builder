"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/context/auth-context"
import { buildStudentViewerHref } from "@/lib/viewer-url"
import { queryKeys } from "@/lib/query-keys"
import { invalidateLessonsListCache } from "@/lib/lesson-data-sync"
import { SoundEffects } from "@/lib/sound-effects"
import { LESSON_EARLY_UNLOCK_COST, LESSON_UNLOCK_PROGRESS, withLessonLocks } from "@/lib/lesson-unlock"
import {
    Folder,
    ArrowLeft,
    FileText,
    Play,
    Loader2,
    Clock,
    BookOpen,
    Info,
    Layers,
    Zap,
    Lock,
    Star,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { LessonDetailsModal } from "@/components/dashboard/student/lesson-details-modal"

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

    useEffect(() => {
        const onFocus = () => {
            if (moduleId && token) fetchModuleDetails({ silent: true })
        }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
    }, [moduleId, token])

    const fetchModuleDetails = async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setLoading(true)
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

    const sequencedLessons = useMemo(() => withLessonLocks(lessons), [lessons])
    const completedLessonsCount = sequencedLessons.filter(l => l.completed).length
    const progressPct = sequencedLessons.length > 0 ? Math.round((completedLessonsCount / sequencedLessons.length) * 100) : 0

    const [launchingId, setLaunchingId] = useState<string | null>(null)
    const [unlockingId, setUnlockingId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const launchLesson = (lesson: any) => {
        if (lesson?.locked) return
        const id = lesson.lessonId || lesson._id
        if (!id || launchingId) return
        setLaunchingId(id)
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        router.push(buildStudentViewerHref(id, { returnUrl, moduleId }))
    }

    const unlockLesson = async (lesson: any) => {
        const id = lesson.lessonId || lesson._id
        if (!id || unlockingId) return
        setUnlockingId(id)
        try {
            const result = await apiClient.store.unlockLesson(id)
            if (result?.error) return
            void SoundEffects.play('starsSpent')
            if (typeof result?.starBalance === 'number') {
                queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                    ...(prev || {}),
                    starBalance: result.starBalance,
                }))
            }
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
            if (user?.user_id) void invalidateLessonsListCache(user.user_id)
            setLessons((prev) => prev.map((row) => {
                const rowId = row.lessonId || row._id
                if (String(rowId) !== String(id)) return row
                return { ...row, locked: false, unlockedByStars: true }
            }))
            if (selectedLesson && String(selectedLesson.lessonId || selectedLesson._id) === String(id)) {
                setSelectedLesson({ ...selectedLesson, locked: false, unlockedByStars: true })
            }
        } finally {
            setUnlockingId(null)
        }
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
                        <span>Interactive Lessons ({sequencedLessons.length})</span>
                    </h2>
                </div>

                {sequencedLessons.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-2">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-extrabold text-slate-700">No lessons available yet</p>
                        <p className="text-xs text-slate-400 font-semibold">Check back soon for new learning content in this module.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sequencedLessons.map((lesson, idx) => {
                            const lessonTitle = getLessonTitle(lesson, idx)
                            const isCompleted = lesson.completed
                            const isStarted = (lesson.progress || 0) > 0 && !isCompleted
                            const isLocked = Boolean(lesson.locked)
                            const unlockCost = Number(lesson.unlockCost) || LESSON_EARLY_UNLOCK_COST

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
                                                <div className={`w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs ${isLocked ? 'opacity-70' : ''}`}>
                                                    {isLocked ? <Lock className="w-5 h-5 text-slate-400" /> : <FileText className="w-5 h-5 text-[#1CB0F6]" />}
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
                                                        : isLocked
                                                            ? "bg-slate-100 border-slate-200 text-slate-500"
                                                            : isStarted
                                                            ? "bg-[#FFC800]/10 border-[#FFC800]/20 text-[#D9A000]"
                                                            : "bg-slate-100 border-slate-200 text-slate-500"
                                                        }`}>
                                                        {isCompleted ? "Completed" : isLocked ? "Locked" : isStarted ? `${lesson.progress}% Done` : "Ready"}
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
                                                disabled={(!lesson.lessonId && !lesson._id) || launchingId === (lesson.lessonId || lesson._id) || unlockingId === (lesson.lessonId || lesson._id)}
                                                onClick={() => isLocked ? unlockLesson(lesson) : launchLesson(lesson)}
                                                className={`flex-1 h-11 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                                                    isLocked
                                                        ? "bg-[#FFC800] hover:bg-[#e6b400] border-b-4 border-[#D9A000] text-slate-900 active:border-b-0 active:translate-y-[2px]"
                                                        : "bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] text-white active:border-b-0 active:translate-y-[2px]"
                                                }`}
                                            >
                                                {launchingId === (lesson.lessonId || lesson._id) || unlockingId === (lesson.lessonId || lesson._id) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : isLocked ? (
                                                    <>
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span>Unlock · {unlockCost}★</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4 fill-white" />
                                                        <span>{isCompleted ? "Review Lesson" : isStarted ? "Continue" : "Start Lesson"}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        {isLocked && (
                                            <p className="text-[11px] font-semibold leading-snug text-slate-500">
                                                Finish {LESSON_UNLOCK_PROGRESS}% of previous lesson to unlock for free
                                            </p>
                                        )}
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            <LessonDetailsModal
                lesson={selectedLesson}
                open={!!selectedLesson}
                onOpenChange={(open) => {
                    if (!open) setSelectedLesson(null)
                }}
                onLaunch={(lesson) => {
                    setSelectedLesson(null)
                    launchLesson(lesson)
                }}
                onUnlock={(lesson) => void unlockLesson(lesson)}
                launching={Boolean(selectedLesson && launchingId === (selectedLesson.lessonId || selectedLesson._id))}
                unlocking={Boolean(selectedLesson && unlockingId === (selectedLesson.lessonId || selectedLesson._id))}
            />
        </div>
    )
}

