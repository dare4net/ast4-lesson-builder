"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    Users,
    Plus,
    ArrowRight,
    Layout,
    Clock,
    Sparkles,
    Settings,
    ChevronRight,
    Monitor,
    Zap,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { formatDistanceToNow } from "date-fns"

export default function TutorDashboardPage() {
    const { user } = useAuth()
    const [statsData, setStatsData] = useState<any>(null)
    const [activities, setActivities] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [stats, activity, programsList] = await Promise.all([
                    apiClient.studio.getStats(),
                    apiClient.studio.getActivity(),
                    apiClient.studio.getPrograms()
                ])
                setStatsData(stats)
                setActivities(activity)
                setPrograms(programsList)
            } catch (error) {
                console.error("Failed to fetch tutor hub data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const stats = [
        { label: "TOTAL PROGRAMS", value: statsData?.totalPrograms?.toString() || "0", icon: Layout, color: "text-blue-400", href: "/dashboard/tutor/programs" },
        { label: "ACTIVE LEARNERS", value: statsData?.activeLearners?.toString() || "0", icon: Users, color: "text-indigo-400", href: "/dashboard/tutor/students" },
        { label: "SECTOR LESSONS", value: statsData?.totalLessons?.toString() || "0", icon: Monitor, color: "text-purple-400", href: "/dashboard/tutor/programs" },
        { label: "UPTIME", value: "99.9%", icon: Zap, color: "text-slate-400" },
    ]

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Hub Data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Tutor Command Banner */}
            <section className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] border border-indigo-500/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">DIRECTOR CLEARANCE GRANTED</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            STUDIO <span className="text-indigo-500 italic">COMMAND</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl font-medium tracking-wide leading-relaxed">
                            Initialize new programs or monitor student trajectories from your
                            centralized deployment interface.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard/tutor/programs">
                            <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black uppercase tracking-widest px-8 rounded-2xl h-14 shadow-lg shadow-indigo-500/20 group">
                                OPEN STUDIO
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 font-bold uppercase tracking-widest h-14 rounded-2xl">
                            <Plus className="w-4 h-4 mr-2" />
                            QUICK CREATE
                        </Button>
                    </div>
                </div>
            </section>

            {/* Analytics Snapshot */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const CardWrapper = stat.href ? Link : 'div'
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <CardWrapper
                                href={stat.href || "#"}
                                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center gap-5 hover:border-indigo-500/30 transition-colors group h-full cursor-pointer overflow-hidden relative"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
                                </div>
                                {stat.href && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-3 h-3 text-indigo-500/50" />
                                    </div>
                                )}
                            </CardWrapper>
                        </motion.div>
                    )
                })}
            </section>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Active Deployments */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Active Deployments</h2>
                            <div className="h-1 w-12 bg-indigo-500 mt-1" />
                        </div>
                        <Link href="/dashboard/tutor/programs" className="text-indigo-500 font-black uppercase text-[10px] tracking-widest hover:underline">
                            MANAGE REPOSITORY
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {programs.slice(0, 5).map((prog, i) => (
                            <Link key={prog._id} href={`/studio/programs/${prog._id}`}>
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500 group-hover:border-indigo-500/50 transition-colors">
                                            <Monitor className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase tracking-tight">{prog.program_name || prog.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                {prog.modules?.length || 0} Sectors Loaded
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden md:flex flex-col items-end">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase">Status: Live</span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                Synced: {prog.updated_at ? formatDistanceToNow(new Date(prog.updated_at)).toUpperCase() : 'N/A'} AGO
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Activity Logs */}
                <section className="space-y-8">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Student Pulse</h2>
                        <div className="h-1 w-12 bg-blue-500 mt-1" />
                    </div>

                    <Card className="rounded-[2.5rem] bg-slate-900/40 border-slate-800 p-8 space-y-6 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                        <div className="space-y-6">
                            {activities.length > 0 ? activities.map((log, idx) => (
                                <Link key={idx} href={`/dashboard/tutor/students/${log.user_id}`} className="group/log block">
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "w-1 h-10 rounded-full shrink-0 group-hover/log:scale-y-110 transition-transform",
                                            log.type === 'registration' ? "bg-indigo-500" : "bg-emerald-500"
                                        )} />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight group-hover/log:text-indigo-400 transition-colors">{log.user}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.action}</p>
                                            <p className="text-[9px] font-medium text-slate-600 mt-1">
                                                {formatDistanceToNow(new Date(log.time))} ago
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="py-10 text-center">
                                    <Clock className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent pulse detected</p>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" className="w-full mt-4 text-blue-400 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500/5">
                            VIEW ALL LOGS
                        </Button>
                    </Card>

                    {/* Quick Actions */}
                    <div className="p-1 rounded-2xl bg-slate-900/40 border border-slate-800">
                        <Link href="/dashboard/tutor/settings">
                            <Button variant="ghost" className="w-full justify-between h-12 px-4 text-slate-400 hover:text-white group">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Settings</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}
