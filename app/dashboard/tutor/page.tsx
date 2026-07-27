"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Users, Activity, Plus, FileEdit, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function TutorDashboardOverview() {
    const [stats, setStats] = useState({
        programsCount: 0,
        activitiesCount: 0,
        studentsCount: 0,
    })
    const [myPrograms, setMyPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTutorData = async () => {
            try {
                const programsData = await apiClient.studio.getPrograms()
                const programsList = Array.isArray(programsData)
                    ? programsData
                    : (programsData?.data || programsData?.programs || [])

                setMyPrograms(programsList)
                setStats({
                    programsCount: programsList.length,
                    activitiesCount: programsList.reduce((acc: number, p: any) => acc + (p.modules?.length || 0), 0),
                    studentsCount: 0
                })
            } catch (err) {
                console.error("Failed to load tutor dashboard data", err)
                setMyPrograms([])
            } finally {
                setLoading(false)
            }
        }
        fetchTutorData()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="p-6 md:p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/20 bg-[#58CC02]/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span className="text-xs font-extrabold text-[#58CC02]">Instructor Dashboard</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                        Course Creator Studio
                    </h1>
                    <p className="text-slate-500 font-medium text-sm max-w-xl">
                        Manage your courses, modules, and interactive learning activities.
                    </p>
                </div>

                <Link href="/studio/programs/new">
                    <button className="h-12 px-6 rounded-xl font-extrabold text-xs text-white bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[2px] shadow-sm flex items-center gap-2 transition-all">
                        <Plus className="w-4 h-4" />
                        Create New Course
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Card className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-[#1CB0F6]/10 text-[#1CB0F6] flex items-center justify-center font-bold">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Courses</span>
                        <span className="text-2xl font-extrabold text-slate-800">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : stats.programsCount}
                        </span>
                    </div>
                </Card>

                <Card className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/10 text-[#58CC02] flex items-center justify-center font-bold">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Modules</span>
                        <span className="text-2xl font-extrabold text-slate-800">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : stats.activitiesCount}
                        </span>
                    </div>
                </Card>

                <Card className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Students</span>
                        <span className="text-2xl font-extrabold text-slate-800">--</span>
                    </div>
                </Card>
            </div>

            {/* Courses Overview List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-800">Published Courses</h2>
                    <Link href="/studio/programs" className="text-xs font-bold text-[#1CB0F6] hover:underline">
                        Manage All Courses
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-7 h-7 text-[#58CC02] animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading courses...</span>
                    </div>
                ) : myPrograms.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {myPrograms.map((program, idx) => (
                            <motion.div
                                key={program._id || idx}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4 flex flex-col justify-between h-full">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#58CC02] bg-[#58CC02]/10 px-2.5 py-0.5 rounded-full border border-[#58CC02]/20">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active Course
                                            </span>
                                        </div>
                                        <h3 className="text-base font-extrabold text-slate-800">
                                            {program.program_name || program.name || "Untitled Course"}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {program.description || "Course modules and activities."}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold">
                                            {program.modules?.length || 0} Modules
                                        </span>
                                        <Link href={`/studio/programs/${program._id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1CB0F6] hover:bg-[#1CB0F6]/10 rounded-xl flex items-center gap-1">
                                                <FileEdit className="w-3.5 h-3.5" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-extrabold text-slate-800">No courses created yet</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1 max-w-sm mx-auto">
                            Use the Course Creator studio to design interactive modules and lessons for your students.
                        </p>
                        <Link href="/studio/programs/new">
                            <button className="mt-4 h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-[#58CC02] border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[1px]">
                                Create Your First Course
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
