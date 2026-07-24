"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LessonCard } from "@/components/dashboard/student/lesson-card"
import { useAuth } from "@/context/auth-context"
import { lessonsListSync } from "@/lib/lesson-data-sync"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Trophy, Zap, Star, ArrowRight, Target, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function StudentDashboardPage() {
    const { user, token } = useAuth()
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showDiscovery, setShowDiscovery] = useState(false)
    const [availablePrograms, setAvailablePrograms] = useState<any[]>([])
    const [discoveryLoading, setDiscoveryLoading] = useState(false)
    const [registeringId, setRegisteringId] = useState<string | null>(null)

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

    const fetchDiscoveryPrograms = async () => {
        setDiscoveryLoading(true)
        try {
            const programs = await apiClient.programs.list()
            setAvailablePrograms(programs)
            setShowDiscovery(true)
        } catch (err) {
            console.error("Failed to fetch programs", err)
        } finally {
            setDiscoveryLoading(false)
        }
    }

    const handleRegister = async (programId: string) => {
        setRegisteringId(programId)
        try {
            await apiClient.programs.register(programId)
            // Once registered, refresh lessons and hide discovery
            setShowDiscovery(false)
            refreshLessons()
        } catch (err) {
            console.error("Registration failed", err)
        } finally {
            setRegisteringId(null)
        }
    }

    const router = useRouter()

    const handleLessonRedirect = (lessonId: string) => {
        router.push(`/viewer/${lessonId}?userId=${user?.user_id}&token=${token}`)
    }

    const stats = [
        { label: "COURSES ACTIVE", value: lessons.length.toString(), icon: BookOpen, color: "text-blue-400" },
        { label: "EXPERIENCE PTS", value: "1,240", icon: Zap, color: "text-emerald-400" },
        { label: "DAY STREAK", value: "7", icon: Trophy, color: "text-amber-400" },
        { label: "LEVEL", value: "L8", icon: Star, color: "text-purple-400" },
    ]

    return (
        <div className="space-y-12">
            {/* Welcome Banner */}
            <section className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] border border-emerald-500/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">MISSION CONTROL ACTIVE</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            WELCOME BACK, <span className="text-emerald-500">{user?.role?.toUpperCase() || "AGENT"}</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl font-medium tracking-wide">
                            Your learning trajectory is currently <span className="text-emerald-400 text-glow">OPTIMIZED</span>.
                            Access your terminal below to resume operations.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest px-8 rounded-2xl h-14 shadow-lg shadow-emerald-500/20 group"
                            onClick={() => {
                                const firstLessonId = lessons[0]?.lessonId
                                if (firstLessonId) handleLessonRedirect(firstLessonId)
                            }}
                        >
                            RESUME SESSION
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center gap-5 hover:border-emerald-500/30 transition-colors group"
                    >
                        <div className={cn("w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                            <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Lessons Section */}
            <div className="grid lg:grid-cols-1 gap-12">
                <div className="space-y-8">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Recent Interactivity</h2>
                        <div className="h-1 w-12 bg-emerald-500 mt-1" />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synchronizing Terminal...</span>
                        </div>
                    ) : error ? (
                        <div className="p-8 rounded-[2rem] border border-rose-500/20 bg-rose-500/5 text-center">
                            <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">{error}</p>
                            <Button variant="link" className="text-emerald-500 mt-2" onClick={() => window.location.reload()}>Re-initialize Sync</Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {lessons.length > 0 ? (
                                    lessons.slice(0, 6).map((lesson, idx) => (
                                        <motion.div
                                            key={lesson.id || idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <LessonCard
                                                lesson={{
                                                    id: lesson.lessonId,
                                                    title: lesson.title || "Secure Directive",
                                                    description: lesson.moduleName,
                                                    moduleName: lesson.programName,
                                                    progress: lesson.progress || 0,
                                                }}
                                                onClick={() => handleLessonRedirect(lesson.lessonId)}
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-12 rounded-[2rem] border border-dashed border-slate-800 text-center">
                                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Deployment Recommendation Required</p>
                                        <Link href="/dashboard/student/catalog">
                                            <Button
                                                className="mt-6 bg-emerald-500 text-slate-950 font-black rounded-xl"
                                            >
                                                INITIALIZE NEW DEPLOYMENT
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
