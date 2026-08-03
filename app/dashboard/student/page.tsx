"use client"

import { useState, useEffect } from "react"
import { LessonCard } from "@/components/dashboard/student/lesson-card"
import { useAuth } from "@/context/auth-context"
import { lessonsListSync } from "@/lib/lesson-data-sync"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ArrowRight, Loader2, Sparkles, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function StudentDashboardPage() {
    const { user, token } = useAuth()
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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

    // Derived statistics from real data
    const activeLessonsCount = lessons.length
    const completedLessonsCount = lessons.filter(l => l.progress === 100).length
    const inProgressCount = lessons.filter(l => l.progress > 0 && l.progress < 100).length

    const displayName = user?.email?.split('@')[0] || 'Learner'

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <section className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
                            <Sparkles className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">Ready to Learn</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Welcome back, <span className="text-green-600 dark:text-green-400 capitalize">{displayName}</span>!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                            Pick up right where you left off or explore new learning modules.
                        </p>
                    </div>

                    {lessons.length > 0 && (
                        <div className="flex flex-col gap-2 shrink-0">
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 rounded-xl h-12 shadow-sm group text-sm"
                                onClick={() => {
                                    const firstLessonId = lessons[0]?.lessonId
                                    if (firstLessonId) handleLessonRedirect(firstLessonId)
                                }}
                            >
                                Resume Learning
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Real Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enrolled Lessons</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{activeLessonsCount}</span>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Loader2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{inProgressCount}</span>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{completedLessonsCount}</span>
                    </div>
                </div>
            </section>

            {/* Lessons List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                    {lessons.length > 0 && (
                        <Link href="/dashboard/student/programs" className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline">
                            View All Courses
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-7 h-7 text-green-600 dark:text-green-400 animate-spin" />
                        <span className="text-xs font-medium text-slate-500">Loading your lessons...</span>
                    </div>
                ) : error ? (
                    <div className="p-6 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 text-center">
                        <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                        <Button variant="link" className="text-green-600 dark:text-green-400 text-xs mt-1" onClick={() => window.location.reload()}>
                            Try Reloading
                        </Button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode="popLayout">
                            {lessons.length > 0 ? (
                                lessons.slice(0, 6).map((lesson, idx) => (
                                    <motion.div
                                        key={lesson.id || idx}
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <LessonCard
                                            lesson={{
                                                id: lesson.lessonId,
                                                title: lesson.title || "Lesson",
                                                description: lesson.moduleName,
                                                moduleName: lesson.programName,
                                                progress: lesson.progress || 0,
                                            }}
                                            onClick={() => handleLessonRedirect(lesson.lessonId)}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/30">
                                    <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No active courses yet</h3>
                                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                                        Explore our course catalog and enroll in your first learning module to get started.
                                    </p>
                                    <Link href="/dashboard/student/catalog">
                                        <Button className="mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-xs px-5">
                                            Explore Catalog
                                        </Button>
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
