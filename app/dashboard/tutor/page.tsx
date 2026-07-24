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
                const [programs, activities] = await Promise.all([
                    apiClient.programs.getAll(),
                    apiClient.activities.getAll()
                ])

                setMyPrograms(programs)
                setStats({
                    programsCount: programs.length,
                    activitiesCount: activities.length,
                    studentsCount: 0 // Placeholder until real student roster API is exposed
                })
            } catch (err) {
                console.error("Failed to load teacher studio data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTutorData()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Teacher Studio</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Course Creator Studio
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                        Manage your courses, modules, and interactive learning activities.
                    </p>
                </div>

                <Link href="/creator">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 h-12 shadow-sm flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        Create New Course
                    </Button>
                </Link>
            </div>

            {/* Real Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Courses</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : stats.programsCount}
                        </span>
                    </div>
                </Card>

                <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Learning Activities</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : stats.activitiesCount}
                        </span>
                    </div>
                </Card>

                <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enrolled Students</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">--</span>
                    </div>
                </Card>
            </div>

            {/* Courses Overview List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Published Courses</h2>
                    <Link href="/dashboard/tutor/programs" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Manage All Courses
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
                        <span className="text-xs font-medium text-slate-500">Loading courses...</span>
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
                                <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between h-full">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active Course
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {program.program_name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {program.description || "Course modules and activities."}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">
                                            {program.modules?.length || 0} Modules
                                        </span>
                                        <Link href="/creator">
                                            <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg flex items-center gap-1">
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
                    <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/30">
                        <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">No courses created yet</h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                            Use the Course Creator studio to design interactive modules and lessons for your students.
                        </p>
                        <Link href="/creator">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs px-5">
                                Create Your First Course
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
