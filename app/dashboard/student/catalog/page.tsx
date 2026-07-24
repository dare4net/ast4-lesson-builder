"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Compass, Sparkles, CheckCircle2, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function CatalogPage() {
    const router = useRouter()
    const [catalog, setCatalog] = useState<any[]>([])
    const [myPrograms, setMyPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [registeringId, setRegisteringId] = useState<string | null>(null)
    const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rawCatalog, rawEnrolled] = await Promise.all([
                apiClient.programs.getCatalog(),
                apiClient.programs.getMyPrograms()
            ])
            const catalogData = Array.isArray(rawCatalog) ? rawCatalog : (rawCatalog?.data || rawCatalog?.programs || [])
            const enrolledData = Array.isArray(rawEnrolled) ? rawEnrolled : (rawEnrolled?.data || rawEnrolled?.programs || [])
            setCatalog(catalogData)
            setMyPrograms(enrolledData)
            if (catalogData.length > 0) {
                setSelectedProgram(catalogData[0])
            }
        } catch (err: any) {
            console.error("Failed to load catalog data", err)
            setError("Unable to load course catalog right now. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const isEnrolled = (programId: string) => {
        return myPrograms.some(p => p._id === programId || p.program_id === programId)
    }

    const handleRegister = async (programId: string) => {
        setRegisteringId(programId)
        try {
            await apiClient.programs.register(programId)
            const enrolled = await apiClient.programs.getMyPrograms()
            setMyPrograms(enrolled)
        } catch (err: any) {
            console.error("Failed to enroll in course", err)
            alert(err.message || "Failed to enroll in course")
        } finally {
            setRegisteringId(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
                    <Compass className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">Course Catalog</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Explore Learning Courses
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                    Discover new courses and modules designed to enhance your skills.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-xs font-medium text-slate-500">Fetching available courses...</span>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                    <Button
                        onClick={loadData}
                        variant="outline"
                        className="rounded-xl text-xs flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Courses Grid */}
                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
                        {catalog.map((program) => {
                            const enrolled = isEnrolled(program._id)
                            const isSelected = selectedProgram?._id === program._id

                            return (
                                <Card
                                    key={program._id}
                                    onClick={() => setSelectedProgram(program)}
                                    className={`p-6 rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-full border ${isSelected
                                        ? "border-green-500 ring-2 ring-green-500/10 bg-white dark:bg-slate-900"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            {enrolled && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                {program.program_name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                {program.description || "Interactive course modules."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">
                                            {program.modules?.length || 0} Modules
                                        </span>
                                        <Button
                                            size="sm"
                                            disabled={registeringId === program._id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (enrolled) {
                                                    router.push('/dashboard/student/programs')
                                                } else {
                                                    handleRegister(program._id)
                                                }
                                            }}
                                            className={enrolled
                                                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold text-xs h-8 px-3"
                                                : "bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-xs h-8 px-3 shadow-sm"
                                            }
                                        >
                                            {registeringId === program._id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : enrolled ? (
                                                "Go to Course"
                                            ) : (
                                                "Enroll Now"
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Selected Course Details Sidebar */}
                    {selectedProgram && (
                        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-6 sticky top-24">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Course</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                                    {selectedProgram.program_name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                    {selectedProgram.description || "No description available."}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Course Modules ({selectedProgram.modules?.length || 0})
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {selectedProgram.modules?.map((mod: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {i + 1}. {mod.title || mod.module_name || `Module ${i + 1}`}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {mod.lessons?.length || 0} Lessons
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                disabled={registeringId === selectedProgram._id}
                                onClick={() => {
                                    if (isEnrolled(selectedProgram._id)) {
                                        router.push('/dashboard/student/programs')
                                    } else {
                                        handleRegister(selectedProgram._id)
                                    }
                                }}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl h-11 text-xs shadow-sm flex items-center justify-center gap-2"
                            >
                                {isEnrolled(selectedProgram._id) ? (
                                    <>
                                        <span>View in My Courses</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Enroll in Course</span>
                                    </>
                                )}
                            </Button>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
