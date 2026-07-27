"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
    Users,
    ArrowLeft,
    Target,
    Activity,
    BookOpen,
    Layers,
    Clock,
    Zap,
    Loader2,
    CheckCircle2,
    PlayCircle,
    Timer,
    ChevronDown,
    ChevronUp,
    Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface BreakdownData {
    student: {
        fullName?: string;
        full_name?: string;
        email: string;
        avatar?: string;
    };
    program: {
        _id: string;
        name: string;
        description: string;
    };
    registration: {
        registeredAt: string;
        lastActivity: string;
        overallProgress: number;
    };
    stats: {
        clearedLessons: number;
        totalLessons: number;
        averageScore: number;
        totalTimeSpent: number;
        velocity: number;
    };
    sectors: any[];
    timeline: any[];
}

export default function StudentProgramBreakdownPage() {
    const params = useParams()
    const id = params?.id as string
    const programId = params?.programId as string
    const router = useRouter()
    const [data, setData] = useState<BreakdownData | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedSector, setExpandedSector] = useState<string | null>(null)

    useEffect(() => {
        if (id && programId) fetchBreakdown()
    }, [id, programId])

    const fetchBreakdown = async () => {
        try {
            const res = await apiClient.studio.getStudentProgramBreakdown(id as string, programId as string)
            setData(res)
            if (res.sectors && res.sectors.length > 0) setExpandedSector(res.sectors[0]._id || res.sectors[0].sector_id || '0')
        } catch (err) {
            console.error("Failed to fetch breakdown", err)
        } finally {
            setLoading(false)
        }
    }

    const getStudentName = (s?: BreakdownData['student']) => {
        if (!s) return 'Student Learner'
        if (s.fullName) return s.fullName
        if (s.full_name) return s.full_name
        if (s.email) {
            const prefix = s.email.split('@')[0]
            return prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[._-]/g, ' ')
        }
        return 'Student Learner'
    }

    const getModuleName = (sector: any, index: number) => {
        if (!sector) return `Module ${index + 1}`
        return (
            sector.name ||
            sector.module_name ||
            sector.title ||
            sector.moduleTitle ||
            sector.module_title ||
            sector.module?.name ||
            sector.module?.title ||
            sector.sector_name ||
            sector.sector_title ||
            sector.sector_details?.name ||
            sector.sector_details?.title ||
            sector.details?.name ||
            sector.details?.title ||
            `Module ${index + 1}`
        )
    }

    const getLessonTitle = (lesson: any, index: number) => {
        if (!lesson) return `Lesson ${index + 1}`
        return (
            lesson.title ||
            lesson.name ||
            lesson.lesson_title ||
            lesson.lessonTitle ||
            lesson.lesson?.title ||
            lesson.lesson?.name ||
            lesson.details?.title ||
            `Lesson ${index + 1}`
        )
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Course Analysis...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <BookOpen className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Course Data Unavailable</p>
                <button
                    onClick={() => router.back()}
                    className="h-10 px-5 rounded-xl font-extrabold text-xs text-white bg-[#58CC02] border-b-4 border-[#3B8C00]"
                >
                    Back to Student Details
                </button>
            </div>
        )
    }

    const studentName = getStudentName(data.student)

    return (
        <div className="space-y-8">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#58CC02] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Student Details
                </button>
            </div>

            {/* Course Banner */}
            <Card className="p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <Avatar className="h-20 w-20 border-4 border-[#58CC02]/20 shadow-md">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                        <AvatarFallback className="bg-[#58CC02]/10 text-[#58CC02] font-extrabold text-xl">
                            {studentName[0] || 'S'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/20 bg-[#58CC02]/10 w-fit mx-auto md:mx-0">
                            <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                            <span className="text-xs font-extrabold text-[#58CC02]">Course Breakdown</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                            {data.program?.name || "Course Overview"}
                        </h1>
                        <p className="text-xs font-medium text-slate-500">
                            Student: <span className="font-extrabold text-slate-700">{studentName}</span> ({data.student?.email})
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 min-w-[160px]">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Overall Completion</span>
                    <span className="text-4xl font-extrabold text-[#58CC02]">{data.registration?.overallProgress || 0}%</span>
                    <div className="h-2 w-36 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#58CC02] rounded-full"
                            style={{ width: `${data.registration?.overallProgress || 0}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: "Accuracy Score", value: `${data.stats?.averageScore || 0}%`, icon: Target, color: "text-[#58CC02]" },
                    { label: "Learning Pace", value: `${data.stats?.velocity || 0}%`, icon: Zap, color: "text-[#1CB0F6]" },
                    { label: "Lessons Completed", value: `${data.stats?.clearedLessons || 0}/${data.stats?.totalLessons || 0}`, icon: CheckCircle2, color: "text-[#58CC02]" },
                    { label: "Total Time", value: `${Math.round((data.stats?.totalTimeSpent || 0) / 60)}m`, icon: Timer, color: "text-purple-500" },
                ].map((stat, i) => (
                    <Card key={i} className="p-5 bg-white border-2 border-slate-200 rounded-3xl flex items-center gap-4 shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Module Breakdown */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-[#58CC02]" />
                        <h2 className="text-lg font-extrabold text-slate-800">Module & Lesson Breakdown</h2>
                    </div>

                    <div className="space-y-4">
                        {data.sectors?.map((sector, idx) => {
                            const moduleTitle = getModuleName(sector, idx)
                            const sectorKey = sector._id || sector.sector_id || idx
                            const isExpanded = expandedSector === sectorKey

                            return (
                                <Card
                                    key={sectorKey}
                                    className={`rounded-3xl border-2 transition-all overflow-hidden bg-white shadow-sm ${isExpanded ? "border-[#58CC02]" : "border-slate-200"
                                        }`}
                                >
                                    <button
                                        onClick={() => setExpandedSector(isExpanded ? null : sectorKey)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${sector.progress === 100 ? "bg-[#58CC02]/10 text-[#58CC02]" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-800">{moduleTitle}</h3>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                                    {sector.lessons?.length || 0} Lessons • {sector.progress || 0}% Completed
                                                </p>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                className="px-6 pb-6 pt-2 border-t border-slate-100"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                    {sector.lessons?.map((lesson: any, lIdx: number) => {
                                                        const lessonTitle = getLessonTitle(lesson, lIdx)
                                                        const isCleared = lesson.status === 'cleared'

                                                        return (
                                                            <div
                                                                key={lesson._id || lIdx}
                                                                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${isCleared
                                                                    ? "bg-green-50/50 border-green-200 text-slate-800"
                                                                    : "bg-slate-50 border-slate-200 text-slate-500"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={isCleared ? "text-[#58CC02]" : "text-slate-300"}>
                                                                        {isCleared ? (
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        ) : (
                                                                            <PlayCircle className="w-4 h-4" />
                                                                        )}
                                                                    </div>
                                                                    <span className="font-bold text-slate-700 line-clamp-1">{lessonTitle}</span>
                                                                </div>
                                                                {lesson.score !== undefined && (
                                                                    <span className="text-[10px] font-extrabold text-[#58CC02] bg-[#58CC02]/10 px-2 py-0.5 rounded-md">
                                                                        {lesson.score}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Activity Log */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1CB0F6]" />
                        <h2 className="text-lg font-extrabold text-slate-800">Recent Activity</h2>
                    </div>

                    <Card className="rounded-3xl bg-white border-2 border-slate-200 p-6 space-y-5 shadow-sm">
                        {data.timeline && data.timeline.length > 0 ? (
                            data.timeline.map((log, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-[#58CC02] mt-1.5 shrink-0" />
                                    <div className="space-y-0.5">
                                        <p className="font-extrabold text-slate-800 line-clamp-1">{log.lessonTitle || "Lesson Activity"}</p>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            Completed {log.completedAt ? formatDistanceToNow(new Date(log.completedAt), { addSuffix: true }) : 'recently'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center space-y-2">
                                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-xs font-bold text-slate-600">No interactive lessons completed yet</p>
                                {data.registration?.registeredAt && (
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Enrolled {formatDistanceToNow(new Date(data.registration.registeredAt), { addSuffix: true })}
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
