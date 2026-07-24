"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
    Users,
    ArrowLeft,
    Target,
    Activity,
    Mail,
    Shield,
    Monitor,
    Layers,
    Clock,
    Zap,
    Loader2,
    CheckCircle2,
    Lock,
    PlayCircle,
    TrendingUp,
    Timer,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface BreakdownData {
    student: {
        fullName: string;
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
            if (res.sectors.length > 0) setExpandedSector(res.sectors[0]._id)
        } catch (err) {
            console.error("Failed to fetch breakdown", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Running Sector Diagnostics...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Shield className="w-12 h-12 text-slate-800" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol access denied</p>
                <Button variant="ghost" onClick={() => router.back()} className="text-indigo-500 mt-4">TERMINATE SESSION</Button>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors p-0 h-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Agent Trajectory
                </Button>

                <div className="flex gap-4">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] border border-slate-800 px-3 py-1 rounded-full">
                        SESSION-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden p-8 md:p-12 rounded-[3rem] border border-indigo-500/20 bg-slate-900/40 backdrop-blur-xl group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-slate-950 ring-8 ring-indigo-500/5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                            <AvatarFallback className="bg-indigo-500/10 text-indigo-500 font-black text-2xl">A</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-500 border-4 border-slate-950 flex items-center justify-center text-slate-950 shadow-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Integrated Trajectory Analysis</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic underline decoration-indigo-500/50 decoration-4 underline-offset-8">
                                {data.program.name}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.student.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Deployment</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-24 bg-slate-800" />

                    <div className="flex flex-col items-center md:items-end gap-3 px-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Level</p>
                            <p className="text-5xl font-black text-white tracking-tighter">{data.registration.overallProgress}%</p>
                        </div>
                        <div className="h-1.5 w-40 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.registration.overallProgress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-indigo-500 shadow-[0_0_15px_indigo]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Mastery Accuracy", value: `${data.stats.averageScore}%`, icon: Target, color: "text-emerald-400" },
                    { label: "Deployment Velocity", value: `${data.stats.velocity}%`, icon: Zap, color: "text-indigo-400" },
                    { label: "Sector Clearance", value: `${data.stats.clearedLessons}/${data.stats.totalLessons}`, icon: Shield, color: "text-blue-400" },
                    { label: "Time Commitment", value: `${Math.round(data.stats.totalTimeSpent / 60)}m`, icon: Timer, color: "text-slate-400" },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 bg-slate-900/40 border-slate-800 rounded-[2rem] flex items-center gap-5 backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
                        <div className={cn("w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Sector Map Breakdown */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-black text-white uppercase tracking-wider">Sector Map Breakdown</h2>
                    </div>

                    <div className="space-y-4">
                        {data.sectors.map((sector) => (
                            <div
                                key={sector._id}
                                className={cn(
                                    "rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                                    expandedSector === sector._id
                                        ? "bg-slate-900/60 border-indigo-500/30 shadow-2xl"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <button
                                    onClick={() => setExpandedSector(expandedSector === sector._id ? null : sector._id)}
                                    className="w-full px-8 py-6 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                                            sector.progress === 100
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                : "bg-slate-950 border-slate-800 text-slate-500 group-hover:border-indigo-500/30 group-hover:text-indigo-400"
                                        )}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{sector.name}</h3>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sector.lessons.length} LESSONS LOADED</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{sector.progress}% CLEARANCE</span>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedSector === sector._id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                                </button>

                                <AnimatePresence>
                                    {expandedSector === sector._id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="px-8 pb-8 pt-2"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {sector.lessons.map((lesson: any, idx: number) => (
                                                    <div
                                                        key={lesson._id}
                                                        className={cn(
                                                            "p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all group/lesson",
                                                            lesson.status === 'cleared'
                                                                ? "bg-slate-950/40 border-slate-800 hover:border-emerald-500/20"
                                                                : "bg-indigo-500/5 border-indigo-500/10"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                                                lesson.status === 'cleared' ? "border-emerald-500/10 text-emerald-500" :
                                                                    lesson.status === 'active' ? "border-indigo-500/20 text-indigo-400" : "border-slate-800 text-slate-600"
                                                            )}>
                                                                {lesson.status === 'cleared' ? <CheckCircle2 className="w-4 h-4" /> :
                                                                    lesson.status === 'active' ? <PlayCircle className="w-4 h-4" /> : <div className="w-1 h-1 rounded-full bg-slate-700" />}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{lesson.title}</p>
                                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{lesson.type}</p>
                                                            </div>
                                                        </div>
                                                        {lesson.score !== undefined && (
                                                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                                <span className="text-[10px] font-black text-emerald-500">{lesson.score}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pulse Timeline */}
                <div className="space-y-8">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Pulse Log</h2>
                        <div className="h-1 w-8 bg-indigo-500 mt-1" />
                    </div>

                    <Card className="rounded-[2.5rem] bg-slate-900/40 border-slate-800 p-8 space-y-8 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                        <div className="space-y-8">
                            {data.timeline.length > 0 ? data.timeline.map((log, i) => (
                                <div key={i} className="flex gap-4 relative group/log">
                                    {i !== data.timeline.length - 1 && (
                                        <div className="absolute left-1.5 top-6 bottom-[-32px] w-px bg-slate-800 group-hover/log:bg-indigo-500/30 transition-colors" />
                                    )}
                                    <div className="w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-950 mt-1 relative z-10 group-hover/log:bg-indigo-500 group-hover/log:border-indigo-500/30 transition-all" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight group-hover/log:text-indigo-400 transition-colors line-clamp-1">
                                            {log.lessonTitle}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(log.completedAt))} AGO
                                            </span>
                                            {log.score !== undefined && (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase">SCORE: {log.score}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center space-y-4">
                                    <Activity className="w-10 h-10 text-slate-800 mx-auto" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No telemetry logs available</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-3 text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Director Insight</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                            Agent performance is {data.stats.velocity > 50 ? 'exceeding' : 'within'} expected sector velocity. Average accuracy protocols are active.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
