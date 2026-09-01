"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { appEventBus } from "@/lib/event-bus"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useAllMyPrograms, useProgramCatalog } from "@/hooks/use-my-programs"
import { useStudentClubContext } from "@/hooks/use-student-club"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Compass, Zap, CheckCircle2, ArrowRight, Loader2, AlertCircle, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/dashboard/page-hero"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

const DUO_THEME_PALETTES = [
    { bg: "bg-[#1CB0F6]/10", border: "border-[#1CB0F6]/20", text: "text-[#1CB0F6]", buttonBg: "bg-[#1CB0F6] hover:bg-[#1899D6] border-[#1482B8]" },
    { bg: "bg-[#58CC02]/10", border: "border-[#58CC02]/20", text: "text-[#58CC02]", buttonBg: "bg-[#58CC02] hover:bg-[#46a302] border-[#3B8C00]" },
    { bg: "bg-[#FF9600]/10", border: "border-[#FF9600]/20", text: "text-[#FF9600]", buttonBg: "bg-[#FF9600] hover:bg-[#e08400] border-[#cc7700]" },
    { bg: "bg-[#CE82FF]/10", border: "border-[#CE82FF]/20", text: "text-[#CE82FF]", buttonBg: "bg-[#CE82FF] hover:bg-[#b866eb] border-[#9e4ed4]" }
]

export default function CatalogPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { marketplaceOpen, clubMode } = useStudentClubContext()
    const catalogQuery = useProgramCatalog()
    const allMyProgramsQuery = useAllMyPrograms()
    const catalog = catalogQuery.data || []
    const allMyPrograms = allMyProgramsQuery.data || []
    const loading = catalogQuery.isLoading || allMyProgramsQuery.isLoading
    const error = catalogQuery.isError || allMyProgramsQuery.isError
        ? "Unable to load course catalog right now. Please try again later."
        : null
    const [registeringId, setRegisteringId] = useState<string | null>(null)
    const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
    const [enrollError, setEnrollError] = useState<string | null>(null)

    useEffect(() => {
        if (clubMode && !marketplaceOpen) {
            router.replace('/dashboard/student/programs')
        }
    }, [clubMode, marketplaceOpen, router])

    if (clubMode && !marketplaceOpen) {
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-sm font-bold text-slate-600">Marketplace is hidden while you learn in club mode.</p>
                <Link href="/dashboard/student/programs" className="text-xs font-bold text-sky-700">
                    Back to my courses →
                </Link>
            </div>
        )
    }

    useEffect(() => {
        if (catalog.length > 0 && !selectedProgram) {
            void selectProgram(catalog[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- select first card once catalog arrives
    }, [catalog])

    const selectProgram = async (program: any) => {
        setSelectedProgram(program)
        setLoadingDetails(true)
        try {
            const details = await apiClient.programs.getDetails(program._id)
            setSelectedProgram(details)
        } catch (err) {
            console.error("Failed to fetch program details", err)
        } finally {
            setLoadingDetails(false)
        }
    }

    const isEnrolled = (programId: string) => {
        return allMyPrograms.some(p => p._id === programId || p.program_id === programId)
    }

    const handleRegister = async (programId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setRegisteringId(programId)
        setEnrollError(null)
        try {
            await apiClient.programs.register(programId)
            await queryClient.invalidateQueries({ queryKey: ['programs', 'mine'] })

            // Emit Gamification Event for Level 1 Mission "Program Explorer"
            appEventBus.emit('PROGRAM_ENROLLED', { programId })
        } catch (err: any) {
            console.error("Failed to enroll in course", err)
            setEnrollError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to enroll in course")
        } finally {
            setRegisteringId(null)
        }
    }

    const [navigatingId, setNavigatingId] = useState<string | null>(null)

    const handleGoToCourse = (programId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (navigatingId) return
        setNavigatingId(programId)
        router.push(`/dashboard/student/programs/${programId}`)
    }

    const handleCardClick = (program: any) => {
        selectProgram(program)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsMobileModalOpen(true)
        }
    }

    const getModuleTitle = (mod: any, idx: number) => {
        if (!mod || typeof mod !== 'object') return `Module ${idx + 1}`
        return mod.name || mod.title || mod.module_name || mod.moduleTitle || mod.module_title || `Module ${idx + 1}`
    }

    const getModuleLessonCount = (mod: any) => {
        if (!mod || typeof mod !== 'object') return 0
        if (Array.isArray(mod.lessons)) return mod.lessons.length
        if (typeof mod.lessonCount === 'number') return mod.lessonCount
        if (typeof mod.lessonsCount === 'number') return mod.lessonsCount
        if (typeof mod.lesson_count === 'number') return mod.lesson_count
        if (typeof mod.lessons_count === 'number') return mod.lessons_count
        return 0
    }

    const renderCourseOverviewContent = (program: any) => {
        const enrolled = isEnrolled(program._id)
        return (
            <div className="space-y-6">
                <div>
                    <span className="text-[10px] font-extrabold text-[#1CB0F6] uppercase tracking-wider bg-[#1CB0F6]/10 px-2.5 py-1 rounded-full border border-[#1CB0F6]/20 inline-block mb-2">
                        Course Overview
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800">
                        {program.name || program.program_name || program.title || "Untitled Course"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                        {program.description || "No description available."}
                    </p>
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Course Modules</span>
                        {loadingDetails && <Loader2 className="w-3.5 h-3.5 text-[#1CB0F6] animate-spin" />}
                    </h4>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {program.modules && program.modules.length > 0 ? (
                            program.modules.map((mod: any, idx: number) => {
                                const moduleTitle = getModuleTitle(mod, idx)
                                const lessonCount = getModuleLessonCount(mod)
                                const palette = DUO_THEME_PALETTES[idx % DUO_THEME_PALETTES.length]

                                return (
                                    <div
                                        key={typeof mod === 'object' ? (mod._id || idx) : idx}
                                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-extrabold text-[11px]`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-800 line-clamp-1">{moduleTitle}</p>
                                                {typeof mod === 'object' && mod.description && (
                                                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{mod.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-extrabold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                            {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                                        </span>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-xs text-slate-400 font-semibold italic">No modules listed for this course.</p>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    {enrollError && (
                        <p className="text-xs font-bold text-red-600">{enrollError}</p>
                    )}
                    {enrolled ? (
                        <Button
                            disabled={navigatingId === program._id}
                            onClick={(e) => handleGoToCourse(program._id, e)}
                            className="w-full bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1482B8] text-white font-extrabold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                        >
                            {navigatingId === program._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Go to Course</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            disabled={registeringId === program._id}
                            onClick={(e) => handleRegister(program._id, e)}
                            className="w-full bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] text-white font-extrabold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                        >
                            {registeringId === program._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    <span>Enroll in Course</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {clubMode && (
                <p className="text-xs font-semibold text-slate-600 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 leading-relaxed">
                    Courses you enroll here are saved to your{' '}
                    <span className="font-extrabold text-sky-800">Personal</span> library. Switch to Personal
                    in the club switcher to see them under My Courses — they won&apos;t appear in your club list.
                </p>
            )}

            <PageHero
                title={<><Compass className="w-6 h-6 text-[#1CB0F6]" /><span>Explore Course Catalog</span></>}
                description="Discover new learning modules and enroll to build your tech skills."
                badge={
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 text-xs font-bold text-[#1CB0F6] self-start sm:self-auto">
                        <BookOpen className="w-4 h-4" />
                        <span>{catalog.length} Available Courses</span>
                    </div>
                }
            />

            {enrollError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {enrollError}
                </div>
            )}
            {error ? (
                <div className="p-8 rounded-3xl bg-red-50 border-2 border-red-200 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-xs font-extrabold text-red-700">{error}</p>
                    <Button
                        onClick={() => {
                            void catalogQuery.refetch()
                            void allMyProgramsQuery.refetch()
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-9 rounded-xl inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                    </Button>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Course Catalog...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {catalog.map((prog, idx) => {
                            const enrolled = isEnrolled(prog._id)
                            const isSelected = selectedProgram?._id === prog._id
                            const palette = DUO_THEME_PALETTES[idx % DUO_THEME_PALETTES.length]
                            const imageUrl = prog.image_url || prog.cover_image

                            return (
                                <motion.div
                                    key={prog._id || idx}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div
                                        className={`rounded-3xl bg-white border transition-all group overflow-hidden h-full flex flex-col justify-between shadow-sm ${isSelected ? "border-[#1CB0F6] ring-2 ring-[#1CB0F6]/20" : "border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleCardClick(prog)}
                                            aria-pressed={isSelected}
                                            aria-label={`View ${prog.name || prog.program_name || prog.title || "course"}`}
                                            className="text-left w-full"
                                        >
                                            {/* Edge-to-Edge Media Header */}
                                            {imageUrl ? (
                                                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                                                    <OptimizedImage
                                                        src={imageUrl}
                                                        alt={prog.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                    {enrolled && (
                                                        <span className="absolute top-3.5 right-3.5 text-xs font-extrabold text-[#58CC02] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Enrolled
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-28 w-full p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                    <div className={`w-12 h-12 rounded-2xl ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text}`}>
                                                        <BookOpen className="w-6 h-6" />
                                                    </div>
                                                    {enrolled && (
                                                        <span className="text-xs font-extrabold text-[#58CC02] bg-white px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1 shadow-sm">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Enrolled
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="p-5 space-y-1.5">
                                                <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#1CB0F6] transition-colors leading-snug">
                                                    {prog.name || prog.program_name || prog.title || "Untitled Course"}
                                                </h3>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                    {prog.description || "Interactive learning course."}
                                                </p>
                                            </div>
                                        </button>

                                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                                            <span className="text-slate-400 font-extrabold">
                                                {prog.modules?.length || 0} Modules
                                            </span>

                                            {enrolled ? (
                                                <Button
                                                    disabled={navigatingId === prog._id}
                                                    onClick={(e) => handleGoToCourse(prog._id, e)}
                                                    className="bg-[#1CB0F6] hover:bg-[#1899D6] border-b-2 border-[#1482B8] text-white font-extrabold text-xs h-8 px-4 rounded-xl flex items-center gap-1.5 shrink-0"
                                                >
                                                    {navigatingId === prog._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Go to Course</span>
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled={registeringId === prog._id}
                                                    onClick={(e) => handleRegister(prog._id, e)}
                                                    className="bg-[#58CC02] hover:bg-[#46a302] border-b-2 border-[#3B8C00] text-white font-extrabold text-xs h-8 px-4 rounded-xl flex items-center gap-1.5 shrink-0"
                                                >
                                                    {registeringId === prog._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <span>Enroll</span>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    <div className="hidden lg:block">
                        {selectedProgram ? (
                            <Card className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm sticky top-6">
                                {renderCourseOverviewContent(selectedProgram)}
                            </Card>
                        ) : (
                            <Card className="p-8 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center py-16">
                                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-extrabold text-slate-400">Select a course to view details</p>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isMobileModalOpen && selectedProgram && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center p-4 lg:hidden"
                        onClick={() => setIsMobileModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                aria-label="Close course details"
                                onClick={() => setIsMobileModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {renderCourseOverviewContent(selectedProgram)}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
