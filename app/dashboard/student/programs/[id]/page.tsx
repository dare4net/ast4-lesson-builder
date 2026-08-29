"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useMyPrograms, useProgramDetails } from "@/hooks/use-my-programs"
import {
    BookOpen,
    ArrowLeft,
    Folder,
    ChevronRight,
    Loader2,
    Trash2
} from "lucide-react"
import { motion } from "framer-motion"
import { CourseHero } from "@/components/dashboard/course-hero"
import { StudentCard } from "@/components/dashboard/student-card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function StudentCourseDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const queryClient = useQueryClient()
    const myProgramsQuery = useMyPrograms()
    const detailsQuery = useProgramDetails(id)

    const program = useMemo(() => {
        const details = detailsQuery.data
        if (!details) return null
        const enrolledReg = (myProgramsQuery.data || []).find(
            (p: any) => p._id === id || p.program_id === id
        )
        return {
            ...details,
            registration: enrolledReg
        }
    }, [detailsQuery.data, myProgramsQuery.data, id])

    const loading = detailsQuery.isLoading || myProgramsQuery.isLoading
    const [unregistering, setUnregistering] = useState(false)
    const [unenrollOpen, setUnenrollOpen] = useState(false)
    const [unenrollError, setUnenrollError] = useState<string | null>(null)
    const [openingModuleId, setOpeningModuleId] = useState<string | null>(null)

    const handleUnenroll = async () => {
        setUnregistering(true)
        setUnenrollError(null)
        try {
            await apiClient.programs.unregister(id)
            await queryClient.invalidateQueries({ queryKey: queryKeys.myPrograms })
            router.push('/dashboard/student/programs')
        } catch (err: any) {
            console.error("Failed to unenroll", err)
            setUnenrollError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to unenroll")
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
                    type="button"
                    aria-label="Back to my courses"
                    onClick={() => router.push('/dashboard/student/programs')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#58CC02] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Courses
                </button>

                <button
                    disabled={unregistering}
                    onClick={() => setUnenrollOpen(true)}
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

            <CourseHero
                title={program.program_name || program.name || program.title || "Course"}
                description={program.description || "Select a module below to view detailed lesson topics."}
                progressPct={progressPct}
            />

            {/* Modules Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-[#1CB0F6]" />
                    <span>Course Modules ({program.modules?.length || 0})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {program.modules?.map((mod: any, idx: number) => {
                        const moduleTitle = getModuleTitle(mod, idx)
                        const lessonCount = getModuleLessonCount(mod)
                        const modThumbnail = mod.thumbnail || mod.image_url || mod.cover_image || program.image_url || program.cover_image || "/logo.webp"

                        return (
                            <motion.div
                                key={mod._id || idx}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <StudentCard
                                    href={`/dashboard/student/programs/${id}/modules/${mod._id}`}
                                    onClick={() => handleOpenModule(mod._id)}
                                    imageUrl={modThumbnail}
                                    imageAlt={moduleTitle}
                                    title={moduleTitle}
                                    badge={
                                        <span className="text-[10px] font-bold text-white bg-[#1CB0F6] px-2.5 py-0.5 rounded-full shadow-sm">
                                            Module {idx + 1}
                                        </span>
                                    }
                                    overlay={
                                        <div className="text-[10px] font-semibold text-white/90 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3 text-slate-300" />
                                            <span>{lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                                        </div>
                                    }
                                    subtitle={
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                            {mod.description || "Click to view detailed interactive lessons in this module."}
                                        </p>
                                    }
                                    footer={
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors">
                                                Explore Module
                                            </span>
                                            <div className="flex items-center gap-1 text-xs font-extrabold text-[#1CB0F6] group-hover:translate-x-1 transition-transform">
                                                {openingModuleId === mod._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-[#1CB0F6]" />
                                                ) : (
                                                    <>
                                                        <span>Open</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
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

            {unenrollError && (
                <p className="text-xs font-bold text-red-600">{unenrollError}</p>
            )}

            <AlertDialog open={unenrollOpen} onOpenChange={setUnenrollOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unenroll from this course?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your progress in this course will be reset. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnenroll}>Unenroll</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
