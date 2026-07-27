"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
    Users,
    ArrowLeft,
    Mail,
    BookOpen,
    Zap,
    Loader2,
    GraduationCap,
    ChevronRight,
    Clock
} from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface StudentDetail {
    user_id: string;
    fullName?: string;
    full_name?: string;
    email: string;
    avatar?: string;
    registrations: any[];
    sectorSummary: {
        totalEnrolled: number;
        averageProgress: number;
    };
    lastActive?: string;
    last_active?: string;
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

    const getDisplayName = (s: StudentDetail) => {
        if (s.fullName) return s.fullName
        if (s.full_name) return s.full_name
        if (s.email) {
            const prefix = s.email.split('@')[0]
            return prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[._-]/g, ' ')
        }
        return 'Student Learner'
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Student Profile...</p>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <GraduationCap className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Student Profile Not Found</p>
                <button
                    onClick={() => router.back()}
                    className="h-10 px-5 rounded-xl font-extrabold text-xs text-white bg-[#58CC02] border-b-4 border-[#3B8C00]"
                >
                    Back to Student Roster
                </button>
            </div>
        )
    }

    const studentName = getDisplayName(student)

    return (
        <div className="space-y-8">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => router.back()}
                    className="w-fit flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#58CC02] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Student Roster
                </button>

                <Card className="p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-[#58CC02]/20 shadow-md">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user_id}`} />
                            <AvatarFallback className="bg-[#58CC02]/10 text-2xl font-extrabold text-[#58CC02]">
                                {studentName[0] || 'S'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                                    {studentName}
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    {student.email || 'No email registered'}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[#58CC02] font-bold bg-[#58CC02]/10 px-2.5 py-0.5 rounded-full border border-[#58CC02]/20">
                                    <Zap className="w-3 h-3" />
                                    Enrolled Student
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-5 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-center space-y-0.5 min-w-[120px]">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Average Progress</p>
                            <p className="text-2xl font-extrabold text-[#58CC02]">{student.sectorSummary?.averageProgress || 0}%</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 text-center space-y-0.5 min-w-[120px]">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
                            <p className="text-2xl font-extrabold text-[#1CB0F6]">{student.sectorSummary?.totalEnrolled || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Enrolled Courses Grid */}
            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#58CC02]" />
                    <h2 className="text-xl font-extrabold text-slate-800">Enrolled Courses & Progress</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.registrations?.map((reg, i) => (
                        <motion.div
                            key={reg._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card className="p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#58CC02]/50 transition-all group flex flex-col justify-between h-full">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-[#58CC02] transition-colors line-clamp-1">
                                                {reg.program_name || reg.name || "Course"}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                                <span>{reg.moduleCount || 0} Modules</span>
                                                {reg.registered_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Joined {formatDistanceToNow(new Date(reg.registered_at))} ago</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-extrabold">
                                            <span className="text-slate-500 uppercase tracking-wider">Course Progress</span>
                                            <span className="text-[#58CC02]">{reg.progress?.percent_complete || 0}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                                                style={{ width: `${reg.progress?.percent_complete || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/tutor/students/${student.user_id}/programs/${reg.program_id}`)}
                                    className="w-full mt-6 h-11 bg-slate-50 hover:bg-[#58CC02] hover:text-white border-2 border-slate-200 hover:border-[#3B8C00] text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
                                >
                                    <span>View Detailed Progress</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {(!student.registrations || student.registrations.length === 0) && (
                    <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center">
                        <p className="text-xs font-bold text-slate-400">This student is not enrolled in any courses yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
