"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import {
    Users,
    Search,
    ChevronRight,
    Target,
    Mail,
    Loader2,
    GraduationCap,
    BookOpen,
    Clock
} from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Student {
    user_id: string;
    fullName?: string;
    full_name?: string;
    email: string;
    avatar?: string;
    enrolledPrograms?: any[];
    totalProgress?: number;
    last_activity?: string;
    lastActivity?: string;
    last_active?: string;
    lastActive?: string;
    registered_at?: string;
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
            setStudents(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch students", err)
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    const getDisplayName = (s: Student) => {
        if (s.fullName) return s.fullName
        if (s.full_name) return s.full_name
        if (s.email) {
            const prefix = s.email.split('@')[0]
            return prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[._-]/g, ' ')
        }
        return 'Student Learner'
    }

    const getLastActiveText = (s: Student) => {
        const dates: string[] = [
            s.last_activity,
            s.lastActivity,
            s.last_active,
            s.lastActive,
            ...(s.enrolledPrograms || []).map(p => p.last_activity || p.lastActivity)
        ].filter((d): d is string => Boolean(d))

        if (dates.length > 0) {
            dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            try {
                return formatDistanceToNow(new Date(dates[0]), { addSuffix: true })
            } catch (e) {
                return null
            }
        }

        const dateStr = s.registered_at || (s.enrolledPrograms?.[0]?.registered_at)
        if (!dateStr) return null
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
        } catch (e) {
            return null
        }
    }

    const filteredStudents = students.filter(s => {
        const name = getDisplayName(s).toLowerCase()
        const email = (s.email || "").toLowerCase()
        const query = searchQuery.toLowerCase()
        return name.includes(query) || email.includes(query)
    })

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Student Roster...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/20 bg-[#58CC02]/10 w-fit">
                        <GraduationCap className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span className="text-xs font-bold text-[#58CC02]">Student Roster</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Active Students
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        View enrolled students, overall course progress, and recent activity.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-white border-2 border-slate-200 rounded-2xl pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#58CC02] transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card className="rounded-3xl bg-white border-2 border-slate-200 p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
                        <p className="text-3xl font-extrabold text-slate-800">{students.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 flex items-center justify-center text-[#58CC02]">
                        <Users className="w-7 h-7" />
                    </div>
                </Card>

                <Card className="rounded-3xl bg-white border-2 border-slate-200 p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Course Completion</p>
                        <p className="text-3xl font-extrabold text-slate-800">
                            {students.length > 0
                                ? Math.round(students.reduce((acc, s) => acc + (s.totalProgress || 0), 0) / students.length)
                                : 0}%
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 flex items-center justify-center text-[#1CB0F6]">
                        <Target className="w-7 h-7" />
                    </div>
                </Card>
            </div>

            {/* Mobile-Friendly Student Cards Grid */}
            {filteredStudents.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-3xl text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                        <Users className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No students found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStudents.map((student, i) => {
                        const name = getDisplayName(student)
                        const lastActive = getLastActiveText(student)

                        return (
                            <motion.div
                                key={student.user_id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <Card
                                    onClick={() => router.push(`/dashboard/tutor/students/${student.user_id}`)}
                                    className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-[#58CC02] shadow-sm transition-all cursor-pointer group flex flex-col justify-between h-full space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3.5">
                                            <Avatar className="h-12 w-12 border-2 border-slate-200 group-hover:border-[#58CC02] transition-colors shrink-0">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user_id}`} />
                                                <AvatarFallback className="bg-[#58CC02]/10 text-[#58CC02] font-extrabold text-base">
                                                    {name[0] || 'S'}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-base font-extrabold text-slate-800 group-hover:text-[#58CC02] transition-colors truncate">
                                                    {name}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400 truncate flex items-center gap-1">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    {student.email || 'No email provided'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-xs font-extrabold">
                                                <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                                    {student.enrolledPrograms?.length || 0} Courses
                                                </span>
                                                <span className="text-[#58CC02]">{student.totalProgress || 0}% Progress</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                                                    style={{ width: `${student.totalProgress || 0}%` }}
                                                />
                                            </div>

                                            {lastActive && (
                                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        Last active:
                                                    </span>
                                                    <span className="font-extrabold text-slate-600">{lastActive}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="w-full h-10 bg-slate-50 group-hover:bg-[#58CC02] group-hover:text-white border-2 border-slate-200 group-hover:border-[#3B8C00] text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all">
                                        <span>View Student Details</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
