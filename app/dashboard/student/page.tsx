"use client"

import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { LessonCard } from "@/components/dashboard/student/lesson-card"
import { LessonDetailsModal, type LessonDetailsLesson } from "@/components/dashboard/student/lesson-details-modal"
import { StudentEconomyPanels } from "@/components/dashboard/student/economy-panels"
import { LivePrideShowcase } from "@/components/dashboard/student/live-pride-showcase"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { mergeLessonHunt } from "@/lib/lesson-hunt"
import { useLessonsList } from "@/hooks/use-lessons-list"
import { queryKeys } from "@/lib/query-keys"
import { invalidateLessonsListCache } from "@/lib/lesson-data-sync"
import { SoundEffects } from "@/lib/sound-effects"
import { LESSON_EARLY_UNLOCK_COST } from "@/lib/lesson-unlock"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ArrowRight, Loader2, Compass, CheckCircle2, PlayCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { buildStudentViewerHref } from "@/lib/viewer-url"
import { useMyPrograms } from "@/hooks/use-my-programs"
import { programProgressPercent } from "@/lib/program-progress"
import { StudentClubSwitcher } from "@/components/dashboard/student/student-club-switcher"
import { StudentClubStrip } from "@/components/dashboard/student/student-club-strip"
import { useStudentClubContext } from "@/hooks/use-student-club"
import { usePrideSummary } from "@/hooks/use-pride"

type FilterTab = 'all' | 'new' | 'in_progress' | 'completed';

export default function StudentDashboardPage() {
    const { user } = useAuth()
    const lessonsQuery = useLessonsList()
    const lessons = lessonsQuery.data || []
    const loading = lessonsQuery.isLoading && lessons.length === 0
    const error = lessonsQuery.isError ? 'Failed to fetch lesson list' : null
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [visibleCount, setVisibleCount] = useState<number>(8)
    const [detailsLesson, setDetailsLesson] = useState<LessonDetailsLesson | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [unlockingId, setUnlockingId] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const router = useRouter()
    const myProgramsQuery = useMyPrograms()
    const enrolledPrograms = myProgramsQuery.data || []
    const { marketplaceOpen, clubMode, activeStudentOrg } = useStudentClubContext()
    const prideSummary = usePrideSummary()

    const handleLessonRedirect = (lessonId: string, moduleId?: string, locked?: boolean) => {
        if (locked) return
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        router.push(buildStudentViewerHref(lessonId, { returnUrl, moduleId }))
    }

    const unlockDashboardLesson = async (lessonId: string) => {
        if (!lessonId || unlockingId) return
        setUnlockingId(lessonId)
        try {
            const result = await apiClient.store.unlockLesson(lessonId)
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
            setDetailsLesson((prev) => prev && String(prev.lessonId || prev.id) === String(lessonId)
                ? { ...prev, locked: false, unlockedByStars: true }
                : prev)
        } finally {
            setUnlockingId(null)
        }
    }

    const openLessonDetails = async (lesson: { lessonId?: string; title?: string; module?: string; program?: string; progress?: number; duration?: number | string; module_id?: string; moduleId?: string; locked?: boolean; unlockCost?: number }) => {
        const lessonId = lesson.lessonId
        if (!lessonId) return
        setDetailsOpen(true)
        setDetailsLoading(true)
        setDetailsLesson(null)
        try {
            const full = await apiClient.lessons.getLessonDetails(lessonId)
            const slides = Array.isArray(full?.slides) ? full.slides : []
            setDetailsLesson(mergeLessonHunt({
                ...lesson,
                ...full,
                lessonId,
                titleComputed: full?.title || lesson.title,
                title: full?.title || lesson.title,
                description: full?.description || lesson.module || lesson.program,
                progress: lesson.progress || 0,
                completed: (lesson.progress || 0) === 100,
                duration: full?.duration || lesson.duration,
                module_id: full?.module_id || lesson.module_id || lesson.moduleId,
                locked: Boolean(full?.locked ?? lesson.locked),
                unlockCost: full?.unlockCost || lesson.unlockCost || LESSON_EARLY_UNLOCK_COST,
            }, slides))
        } catch {
            setDetailsLesson({
                lessonId,
                title: lesson.title,
                titleComputed: lesson.title,
                description: lesson.module || lesson.program,
                progress: lesson.progress || 0,
                completed: (lesson.progress || 0) === 100,
                duration: lesson.duration,
                module_id: lesson.module_id || lesson.moduleId,
                locked: Boolean(lesson.locked),
                unlockCost: lesson.unlockCost || LESSON_EARLY_UNLOCK_COST,
            })
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleTabChange = (tab: FilterTab) => {
        setActiveTab(tab)
        setVisibleCount(8)
    }

    // Sorted lessons: newest to oldest by last activity/update timestamp
    const sortedLessons = useMemo(() => {
        return [...lessons].sort((a, b) => {
            const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
            const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
            return timeB - timeA;
        });
    }, [lessons]);

    // Real statistics derived from actual interaction data
    const activeLessonsCount = lessons.length
    const newLessonsCount = useMemo(() => lessons.filter(l => !l.progress || l.progress === 0).length, [lessons])
    const completedLessonsCount = useMemo(() => lessons.filter(l => l.progress === 100).length, [lessons])
    const inProgressCount = useMemo(() => lessons.filter(l => l.progress > 0 && l.progress < 100).length, [lessons])

    // Current ongoing / last interacted lesson
    const currentOngoingLesson = useMemo(() => {
        if (!sortedLessons.length) return null;
        const ongoing = sortedLessons.find(l => l.progress > 0 && l.progress < 100);
        return ongoing || sortedLessons[0];
    }, [sortedLessons]);

    // Filter lessons based on active tab
    const filteredLessons = useMemo(() => {
        let filtered = sortedLessons;
        if (activeTab === 'new') {
            filtered = sortedLessons.filter(l => !l.progress || l.progress === 0);
        } else if (activeTab === 'in_progress') {
            filtered = sortedLessons.filter(l => l.progress > 0 && l.progress < 100);
        } else if (activeTab === 'completed') {
            filtered = sortedLessons.filter(l => l.progress === 100);
        }
        return filtered;
    }, [sortedLessons, activeTab]);

    // Slice for progressive "See More" pagination
    const displayedLessons = useMemo(() => {
        return filteredLessons.slice(0, visibleCount);
    }, [filteredLessons, visibleCount]);

    const displayName = user?.full_name || user?.fullName || user?.email?.split('@')[0] || 'Learner'

    return (
        <div className="space-y-6 pb-12">
            <StudentClubStrip prideScopeType={prideSummary.scope?.type || activeStudentOrg?.branding?.prideScope} />

            {/* Sleek Hero Welcome Banner */}
            <section className="relative overflow-hidden p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <StudentClubSwitcher />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back, <span className="text-[#58CC02] capitalize">{displayName}</span>!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                            {clubMode && !marketplaceOpen
                                ? 'Your club courses and lessons are ready when you are.'
                                : 'Pick up right where you left off or explore your enrolled curriculum modules.'}
                        </p>
                    </div>

                    {/* Spotlight Hero Card for Current Ongoing Lesson */}
                    {currentOngoingLesson && (
                        <div className="w-full lg:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 shrink-0 space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <PlayCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                                    {currentOngoingLesson.progress > 0 && currentOngoingLesson.progress < 100 ? "Resume Learning" : "Recent Lesson"}
                                </span>
                                <span className="text-[10px] font-extrabold text-[#58CC02]">
                                    {Math.round(currentOngoingLesson.progress)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <OptimizedImage
                                    src={currentOngoingLesson.thumbnail || "/logo.webp"}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-900"
                                />

                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {currentOngoingLesson.title || "Lesson"}
                                    </h4>
                                    <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                                        {currentOngoingLesson.module || currentOngoingLesson.program || "Curriculum"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleLessonRedirect(currentOngoingLesson.lessonId, currentOngoingLesson.module_id || currentOngoingLesson.moduleId)}
                                className="w-full py-2 px-3 rounded-lg bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <span>{currentOngoingLesson.progress > 0 ? "Continue Lesson" : "Start Lesson"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <StudentEconomyPanels />

            <LivePrideShowcase />

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3.5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-[#1CB0F6] flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Lessons</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">{activeLessonsCount}</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3.5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-500 flex items-center justify-center shrink-0">
                        <Loader2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">{inProgressCount}</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3.5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[#58CC02] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">{completedLessonsCount}</span>
                    </div>
                </div>
            </section>

            {enrolledPrograms.length > 0 && (
                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Your courses</h2>
                        <Link
                            href="/dashboard/student/programs"
                            className="text-xs font-bold text-[#1CB0F6] hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {enrolledPrograms.slice(0, 3).map((prog: any) => {
                            const progressValue = programProgressPercent(prog)
                            const programId = prog.program_id || prog._id
                            return (
                                <Link
                                    key={programId}
                                    href={`/dashboard/student/programs/${programId}`}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-[#1CB0F6]/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                            {prog.program_name || prog.name || prog.title || "Course"}
                                        </h3>
                                        <span className="text-xs font-extrabold text-[#1CB0F6] tabular-nums shrink-0">
                                            {progressValue}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                                        <div
                                            className="h-full bg-[#1CB0F6] rounded-full"
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Lessons Section with Filter Tabs & View All Link */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
                        <p className="text-xs font-medium text-slate-500">Showing recent ongoing & latest interactive lessons</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => handleTabChange('all')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    activeTab === 'all'
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                All ({sortedLessons.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('new')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    activeTab === 'new'
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                New ({newLessonsCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('in_progress')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    activeTab === 'in_progress'
                                        ? "bg-[#58CC02] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                Ongoing ({inProgressCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('completed')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    activeTab === 'completed'
                                        ? "bg-[#1CB0F6] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                Done ({completedLessonsCount})
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2.5">
                        <div className="w-8 h-8 border-3 border-slate-200 dark:border-slate-800 border-t-[#58CC02] rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-slate-500">Loading your lessons...</span>
                    </div>
                ) : error ? (
                    <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-center space-y-2">
                        <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                        <Button variant="link" className="text-[#58CC02] font-bold text-xs" onClick={() => window.location.reload()}>
                            Reload Activity
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            <AnimatePresence mode="popLayout">
                                {displayedLessons.length > 0 ? (
                                    displayedLessons.map((lesson, idx) => (
                                        <motion.div
                                            key={lesson.id || lesson.lessonId || idx}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                        >
                                            <LessonCard
                                                lesson={{
                                                    id: lesson.lessonId,
                                                    title: lesson.title || "Lesson",
                                                    description: lesson.module || lesson.program,
                                                    moduleName: lesson.module,
                                                    programName: lesson.program,
                                                    thumbnail: lesson.thumbnail,
                                                    progress: lesson.progress || 0,
                                                    duration: lesson.duration ? String(lesson.duration) : undefined,
                                                    locked: Boolean(lesson.locked),
                                                    unlockCost: lesson.unlockCost || LESSON_EARLY_UNLOCK_COST,
                                                }}
                                                onClick={() => handleLessonRedirect(lesson.lessonId, lesson.module_id || lesson.moduleId, lesson.locked)}
                                                onDetails={() => openLessonDetails(lesson)}
                                                onUnlock={() => void unlockDashboardLesson(lesson.lessonId)}
                                                unlocking={unlockingId === lesson.lessonId}
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/40 space-y-2.5">
                                        <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {activeTab === 'new' ? "No new unstarted lessons" : activeTab === 'in_progress' ? "No lessons currently in progress" : activeTab === 'completed' ? "No completed lessons yet" : "No active courses yet"}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
                                            {marketplaceOpen
                                                ? 'Explore the course catalog to discover and enroll in your next learning module.'
                                                : 'Ask your club leader for a join code or wait for your next assigned course.'}
                                        </p>
                                        {marketplaceOpen ? (
                                            <Link href="/dashboard/student/catalog">
                                                <button
                                                    type="button"
                                                    className="mt-2 px-4 py-2 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    Explore Catalog
                                                </button>
                                            </Link>
                                        ) : (
                                            <Link href="/dashboard/student/programs">
                                                <button
                                                    type="button"
                                                    className="mt-2 px-4 py-2 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    View my courses
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Progressive See More Lessons Button */}
                        {visibleCount < filteredLessons.length && (
                            <div className="flex justify-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                                >
                                    <span>See More Lessons ({filteredLessons.length - visibleCount} remaining)</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <LessonDetailsModal
                lesson={detailsLesson}
                open={detailsOpen}
                loading={detailsLoading}
                onOpenChange={(open) => {
                    setDetailsOpen(open)
                    if (!open) setDetailsLesson(null)
                }}
                onLaunch={(lesson) => {
                    const lessonId = lesson.lessonId || lesson.id
                    if (!lessonId || lesson.locked) return
                    setDetailsOpen(false)
                    handleLessonRedirect(lessonId, lesson.module_id || lesson.moduleId)
                }}
                onUnlock={(lesson) => void unlockDashboardLesson(lesson.lessonId || lesson.id || '')}
                unlocking={Boolean(detailsLesson && unlockingId === (detailsLesson.lessonId || detailsLesson.id))}
            />
        </div>
    )
}
