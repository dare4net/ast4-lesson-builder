"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import {
    Users,
    Search,
    ChevronRight,
    Target,
    Activity,
    Mail,
    Calendar,
    Loader2,
    Shield
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface Student {
    user_id: string;
    fullName: string;
    email: string;
    avatar?: string;
    enrolledPrograms: any[];
    totalProgress: number;
}

export default function TutorStudentsPage() {
    const router = useRouter()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const data = await apiClient.studio.getStudents()
            setStudents(data)
        } catch (err) {
            console.error("Failed to fetch students", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(s =>
        (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Scanning Agent Directory...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 w-fit">
                        <Users className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Agent Oversight</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        ACTIVE <span className="text-indigo-500">LEARNERS</span>
                    </h1>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="SEARCH AGENTS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Students Table/Grid */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                {filteredStudents.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                        <Shield className="w-12 h-12 text-slate-800 mb-4" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No agents detected in current sector</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/50">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Agent Identity</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Manifest</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Global Progress</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Last Active</th>
                                    <th className="px-8 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredStudents.map((student, i) => (
                                    <motion.tr
                                        key={student.user_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => router.push(`/dashboard/tutor/students/${student.user_id}`)}
                                        className="hover:bg-indigo-500/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user_id}`} />
                                                    <AvatarFallback>{student.fullName?.[0] || 'A'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                                        {student.fullName || 'Unknown Agent'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                {student.enrolledPrograms.slice(0, 2).map((prog, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        <span className="text-[10px] font-black text-slate-300 uppercase truncate max-w-[150px]">
                                                            {prog.program_name}
                                                        </span>
                                                    </div>
                                                ))}
                                                {student.enrolledPrograms.length > 2 && (
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                        + {student.enrolledPrograms.length - 2} MORE DEPLOYMENTS
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-indigo-400">{student.totalProgress}%</span>
                                                </div>
                                                <div className="w-40 h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
                                                        style={{ width: `${student.totalProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-slate-700" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                                    {student.enrolledPrograms?.[0]?.registered_at
                                                        ? formatDistanceToNow(new Date(student.enrolledPrograms[0].registered_at)).toUpperCase() + ' AGO'
                                                        : 'UNKNOWN'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right text-slate-800 group-hover:text-indigo-500 transition-colors">
                                            <ChevronRight className="w-5 h-5 ml-auto" />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] bg-slate-900/40 border-slate-800 p-8 flex items-center justify-between group">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Agent Reach</p>
                        <p className="text-4xl font-black text-white">{students.length}</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8" />
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] bg-slate-900/40 border-slate-800 p-8 flex items-center justify-between group">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Average Capacity</p>
                        <p className="text-4xl font-black text-white">
                            {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.totalProgress, 0) / students.length) : 0}%
                        </p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Target className="w-8 h-8" />
                    </div>
                </Card>
            </div>
        </div>
    )
}
