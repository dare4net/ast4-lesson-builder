"use client"

import { motion } from "framer-motion"
import { BookOpen, ChevronRight, ArrowLeft, Loader2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PageHero } from "@/components/dashboard/page-hero"
import { StudentCard } from "@/components/dashboard/student-card"
import { useMyPrograms } from "@/hooks/use-my-programs"
import { programProgressPercent } from "@/lib/program-progress"
import { StudentClubSwitcher } from "@/components/dashboard/student/student-club-switcher"
import { useStudentClubContext } from "@/hooks/use-student-club"

export default function StudentProgramsListPage() {
    const router = useRouter()
    const myProgramsQuery = useMyPrograms()
    const programs = myProgramsQuery.data || []
    const loading = myProgramsQuery.isLoading
    const { marketplaceOpen } = useStudentClubContext()

    const calculateProgress = (prog: any) => programProgressPercent(prog)

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHero
                title="My Enrolled Courses"
                description="Select a course to continue learning."
                back={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Back to dashboard"
                        onClick={() => router.push('/dashboard/student')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                }
                badge={
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <StudentClubSwitcher />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 text-xs font-bold text-[#1CB0F6]">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{programs.length} {programs.length === 1 ? 'Course' : 'Courses'}</span>
                        </div>
                    </div>
                }
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading your courses...</span>
                </div>
            ) : programs.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-extrabold text-slate-800">No enrolled courses yet</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1 max-w-sm mx-auto">
                        {marketplaceOpen
                            ? 'Browse the catalog to start learning!'
                            : 'Your club will assign courses here. Check back soon.'}
                    </p>
                    {marketplaceOpen && (
                        <Button
                            onClick={() => router.push('/dashboard/student/catalog')}
                            className="mt-4 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1482B8] text-white font-extrabold text-xs rounded-xl px-5 h-10"
                        >
                            Browse Catalog
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {programs.map((prog, idx) => {
                        const progressValue = calculateProgress(prog)
                        const imageUrl = prog.image_url || prog.cover_image || prog.thumbnailUrl || prog.thumbnail || "/logo.webp"

                        return (
                            <motion.div
                                key={prog._id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <StudentCard
                                    href={`/dashboard/student/programs/${prog.program_id || prog._id}`}
                                    imageUrl={imageUrl}
                                    imageAlt={prog.program_name || prog.name || "Course cover"}
                                    title={prog.program_name || prog.name || prog.title || "Untitled Course"}
                                    badge={
                                        <span className="text-[10px] font-bold text-white bg-[#1CB0F6] px-2.5 py-0.5 rounded-full shadow-sm">
                                            Active
                                        </span>
                                    }
                                    overlay={
                                        <div className="text-[10px] font-semibold text-white/90 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                                            <Layers className="w-3 h-3 text-slate-300" />
                                            <span>{prog.moduleCount || prog.modules?.length || 0} Modules</span>
                                        </div>
                                    }
                                    subtitle={
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mt-1">
                                            {prog.description || "Interactive learning course program."}
                                        </p>
                                    }
                                    footer={
                                        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                    <span>Progress</span>
                                                    <span className="text-[#1CB0F6] font-bold">{progressValue}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#1CB0F6] rounded-full transition-all duration-500"
                                                        style={{ width: `${progressValue}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors">
                                                    Continue Learning
                                                </span>
                                                <div className="flex items-center gap-1 text-xs font-extrabold text-[#1CB0F6] group-hover:translate-x-1 transition-transform">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
