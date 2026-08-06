"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/context/auth-context"
import {
    BookOpen,
    ArrowLeft,
    Folder,
    ChevronRight,
    Loader2,
    Sparkles,
    Trash2
} from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function StudentCourseDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const { token } = useAuth()

    const [program, setProgram] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [unregistering, setUnregistering] = useState(false)

    useEffect(() => {
        if (id && token) fetchCourseDetails()
    }, [id, token])

    const fetchCourseDetails = async () => {
        setLoading(true)
        try {
            const myPrograms = await apiClient.programs.getMyPrograms()
            const rawPrograms = Array.isArray(myPrograms) ? myPrograms : (myPrograms?.data || myPrograms?.programs || [])
            const enrolledReg = rawPrograms.find(
                (p: any) => p._id === id || p.program_id === id
            )

            const details = await apiClient.programs.getDetails(id)
            setProgram({
                ...details,
                registration: enrolledReg
            })
        } catch (err) {
            console.error("Failed to load course details", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnenroll = async () => {
        if (!confirm("Are you sure you want to unenroll from this course? Your progress will be reset.")) return
        setUnregistering(true)
        try {
            await apiClient.programs.unregister(id)
            router.push('/dashboard/student/programs')
        } catch (err) {
            console.error("Failed to unenroll", err)
        } finally {
            setUnregistering(false)
        }
    }

    const getProgressValue = () => {
        if (!program) return 0
        const reg = program.registration
        if (typeof reg?.progress?.percent_complete === 'number') return reg.progress.percent_complete
        if (typeof reg?.progress?.percentComplete === 'number') return reg.progress.percentComplete
        if (typeof reg?.overallProgress === 'number') return reg.overallProgress
        if (typeof reg?.totalProgress === 'number') return reg.totalProgress

        if (!program.modules || program.modules.length === 0) return 0
        const completedCount = reg?.progress?.completed_modules?.length || 0
        return Math.round((completedCount / program.modules.length) * 100)
    }

    const getModuleTitle = (mod: any, idx: number) => {
        return (
            mod.title ||
            mod.name ||
            mod.module_name ||
            mod.moduleTitle ||
            mod.module_title ||
            `Module ${idx + 1}`
        )
    }

    const getModuleLessonCount = (mod: any) => {
        if (Array.isArray(mod.lessons)) return mod.lessons.length
        if (typeof mod.lessonCount === 'number') return mod.lessonCount
        if (typeof mod.lessonsCount === 'number') return mod.lessonsCount
        if (typeof mod.lesson_count === 'number') return mod.lesson_count
        if (typeof mod.lessons_count === 'number') return mod.lessons_count
        return 0
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Course Details...</p>
            </div>
        )
    }

    if (!program) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <BookOpen className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Course Not Found</p>
                <button
                    onClick={() => router.push('/dashboard/student/catalog')}
                    className="h-10 px-5 rounded-xl font-extrabold text-xs text-white bg-[#58CC02] border-b-4 border-[#3B8C00]"
                >
                    Browse Catalog
                </button>
            </div>
        )
    }

    const progressPct = getProgressValue()

    const [openingModuleId, setOpeningModuleId] = useState<string | null>(null)

    const handleOpenModule = (moduleId: string) => {
        if (openingModuleId) return
        setOpeningModuleId(moduleId)
        router.push(`/dashboard/student/programs/${id}/modules/${moduleId}`)
    }

    return (
        <div className="space-y-8">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/dashboard/student/programs')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#58CC02] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Courses
                </button>

                <button
                    disabled={unregistering}
                    onClick={handleUnenroll}
                    className="h-9 px-4 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 transition-colors"
                >
                    {unregistering ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Unenroll</span>
                        </>
                    )}
                </button>
            </div>

            {/* Hero Course Card */}
            <Card className="p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 justify-between items-center">
                <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/20 bg-[#58CC02]/10 w-fit mx-auto md:mx-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span className="text-xs font-extrabold text-[#58CC02]">Enrolled Course</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                        {program.program_name || program.name || program.title || "Course"}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">
                        {program.description || "Select a module below to view detailed lesson topics."}
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 min-w-[160px]">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                    <span className="text-4xl font-extrabold text-[#58CC02]">{progressPct}%</span>
                    <div className="h-2 w-36 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Modules Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-[#1CB0F6]" />
                    <span>Course Modules ({program.modules?.length || 0})</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {program.modules?.map((mod: any, idx: number) => {
                        const moduleTitle = getModuleTitle(mod, idx)
                        const lessonCount = getModuleLessonCount(mod)

                        return (
                            <motion.div
                                key={mod._id || idx}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card
                                    onClick={() => handleOpenModule(mod._id)}
                                    className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#1CB0F6] transition-all cursor-pointer group flex flex-col justify-between h-full space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-11 h-11 rounded-2xl bg-[#1CB0F6]/10 text-[#1CB0F6] flex items-center justify-center font-bold text-xs">
                                                <Folder className="w-5.5 h-5.5" />
                                            </div>
                                            <span className="text-xs font-extrabold text-[#1CB0F6] bg-[#1CB0F6]/10 px-2.5 py-0.5 rounded-full border border-[#1CB0F6]/20">
                                                Module {idx + 1}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#1CB0F6] transition-colors">
                                                {moduleTitle}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                                                {mod.description || "Click to view detailed interactive lessons in this module."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold">
                                            {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                                        </span>
                                        <button
                                            disabled={openingModuleId === mod._id}
                                            className="h-9 px-4 rounded-xl bg-slate-50 group-hover:bg-[#1CB0F6] group-hover:text-white border-2 border-slate-200 group-hover:border-[#1899D6] text-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                                        >
                                            {openingModuleId === mod._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Open Module</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {(!program.modules || program.modules.length === 0) && (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-2">
                        <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-extrabold text-slate-700">No modules available in this course yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
