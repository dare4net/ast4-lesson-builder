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
    CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface StudentDetail {
    user_id: string;
    fullName: string;
    email: string;
    avatar?: string;
    registrations: any[];
    sectorSummary: {
        totalEnrolled: number;
        averageProgress: number;
    };
}

export default function StudentDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const [student, setStudent] = useState<StudentDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchStudentDetail()
    }, [id])

    const fetchStudentDetail = async () => {
        try {
            const data = await apiClient.studio.getStudentDetail(id as string)
            setStudent(data)
        } catch (err) {
            console.error("Failed to fetch student detail", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Accessing Agent File...</p>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Shield className="w-12 h-12 text-slate-800" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent data inaccessible in current sector</p>
                <Button variant="ghost" onClick={() => router.back()} className="text-indigo-500 mt-4">TERMINATE SEARCH</Button>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors p-0 h-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Oversight
                </Button>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <Avatar className="h-28 w-28 border-4 border-slate-950 ring-4 ring-indigo-500/20 shadow-2xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user_id}`} />
                                <AvatarFallback className="bg-slate-950 text-2xl font-black text-indigo-500">
                                    {student.fullName?.[0] || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-500 border-4 border-slate-950 flex items-center justify-center text-slate-950">
                                <Shield className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                                    {student.fullName || 'Unknown Agent'}
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    {student.email}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-800" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5" />
                                    Active Deployment
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-center space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector Mastery</p>
                            <p className="text-2xl font-black text-indigo-400">{student.sectorSummary.averageProgress}%</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-center space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Deployments</p>
                            <p className="text-2xl font-black text-indigo-400">{student.sectorSummary.totalEnrolled}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Programs Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Assigned Trajectories</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.registrations.map((reg, i) => (
                        <motion.div
                            key={reg._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-8 bg-slate-900/40 border-slate-800 rounded-[2.5rem] backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors line-clamp-1">
                                            {reg.program_name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <Layers className="w-3 h-3" />
                                                {reg.moduleCount} Sectors
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Deployed {formatDistanceToNow(new Date(reg.registered_at))} ago
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Mastery Progress</span>
                                        <span className="text-sm font-black text-white">{reg.progress?.percent_complete || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${reg.progress?.percent_complete || 0}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-2">
                                    {reg.progress?.completed_lessons?.slice(0, 3).map((lessonId: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Sector Cleared</span>
                                        </div>
                                    ))}
                                    {reg.progress?.completed_lessons?.length > 3 && (
                                        <div className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-500">
                                            <span className="text-[9px] font-black uppercase tracking-widest">+ {reg.progress.completed_lessons.length - 3} MORE</span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => router.push(`/dashboard/tutor/students/${student.user_id}/programs/${reg.program_id}`)}
                                    className="w-full mt-8 h-12 bg-slate-950 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all"
                                >
                                    Analyze Performance
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {student.registrations.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active deployments detected for this agent</p>
                    </div>
                )}
            </div>
        </div>
    )
}
