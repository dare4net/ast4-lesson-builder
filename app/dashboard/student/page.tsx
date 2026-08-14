"use client"

import { useState, useEffect, useMemo } from "react"
import { LessonCard } from "@/components/dashboard/student/lesson-card"
import { useAuth } from "@/context/auth-context"
import { lessonsListSync } from "@/lib/lesson-data-sync"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ArrowRight, Loader2, Zap, Compass, CheckCircle2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

type FilterTab = 'all' | 'in_progress' | 'completed';
const RECENT_LESSONS_LIMIT = 6;

export default function StudentDashboardPage() {
    const { user, token } = useAuth()
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const router = useRouter()

    useEffect(() => {
        if (user?.user_id && token) {
            refreshLessons()
        }
    }, [user, token])

    const refreshLessons = () => {
        if (user?.user_id && token) {
            lessonsListSync({
                userId: user.user_id,
                token: token,
                setLessons,
                setLoading,
                setError
            })
        }
    }

    const handleLessonRedirect = (lessonId: string) => {
        const returnUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : ''
        router.push(`/viewer/${lessonId}?userId=${user?.user_id}&token=${token}&returnUrl=${returnUrl}`)
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
    const completedLessonsCount = useMemo(() => lessons.filter(l => l.progress === 100).length, [lessons])
    const inProgressCount = useMemo(() => lessons.filter(l => l.progress > 0 && l.progress < 100).length, [lessons])

    // Current ongoing / last interacted lesson
    const currentOngoingLesson = useMemo(() => {
        if (!sortedLessons.length) return null;
        const ongoing = sortedLessons.find(l => l.progress > 0 && l.progress < 100);
        return ongoing || sortedLessons[0];
    }, [sortedLessons]);

    // Filter and limit lessons for dashboard display (Top 6 most recent)
    const displayedLessons = useMemo(() => {
        let filtered = sortedLessons;
        if (activeTab === 'in_progress') {
            filtered = sortedLessons.filter(l => l.progress > 0 && l.progress < 100);
        } else if (activeTab === 'completed') {
            filtered = sortedLessons.filter(l => l.progress === 100);
        }
        return filtered.slice(0, RECENT_LESSONS_LIMIT);
    }, [sortedLessons, activeTab]);

    const displayName = user?.email?.split('@')[0] || 'Learner'

    return (
        <div className="space-y-6 pb-12">
            {/* Sleek Hero Welcome Banner */}
            <section className="relative overflow-hidden p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60">
                            <Zap className="w-3.5 h-3.5 text-[#58CC02]" />
                            <span className="text-[11px] font-bold text-[#58CC02]">Active Student</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back, <span className="text-[#58CC02] capitalize">{displayName}</span>!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                            Pick up right where you left off or explore your enrolled curriculum modules.
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
                                <img
                                    src={currentOngoingLesson.thumbnail || "/logo.webp"}
                                    alt="Cover"
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-900"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/logo.webp"
                                    }}
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
                                onClick={() => handleLessonRedirect(currentOngoingLesson.lessonId)}
                                className="w-full py-2 px-3 rounded-lg bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <span>{currentOngoingLesson.progress > 0 ? "Continue Lesson" : "Start Lesson"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

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
                                onClick={() => setActiveTab('all')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                    activeTab === 'all'
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                All ({sortedLessons.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('in_progress')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                    activeTab === 'in_progress'
                                        ? "bg-[#58CC02] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                Ongoing ({inProgressCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('completed')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                    activeTab === 'completed'
                                        ? "bg-[#1CB0F6] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                Done ({completedLessonsCount})
                            </button>
                        </div>

                        {sortedLessons.length > RECENT_LESSONS_LIMIT && (
                            <Link href="/dashboard/student/programs">
                                <span className="text-xs font-bold text-[#58CC02] hover:underline flex items-center gap-1">
                                    View All <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </Link>
                        )}
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                                            }}
                                            onClick={() => handleLessonRedirect(lesson.lessonId)}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/40 space-y-2.5">
                                    <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {activeTab === 'in_progress' ? "No lessons currently in progress" : activeTab === 'completed' ? "No completed lessons yet" : "No active courses yet"}
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
                                        Explore the course catalog to discover and enroll in your next learning module.
                                    </p>
                                    <Link href="/dashboard/student/catalog">
                                        <button
                                            type="button"
                                            className="mt-2 px-4 py-2 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold transition-colors"
                                        >
                                            Explore Catalog
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
