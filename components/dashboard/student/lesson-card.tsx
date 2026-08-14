"use client"

import { Clock, ArrowRight, BookOpen, CheckCircle2, PlayCircle, Zap } from "lucide-react"

interface LessonCardProps {
    lesson: {
        id: string
        title: string
        description?: string
        moduleName?: string
        programName?: string
        thumbnail?: string
        progress: number
        duration?: string
    }
    onClick?: () => void
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
    const isCompleted = lesson.progress === 100;
    const isInProgress = lesson.progress > 0 && lesson.progress < 100;
    const displayThumbnail = lesson.thumbnail || "/logo.webp";
    const categoryName = lesson.moduleName || lesson.programName || "Course Module";

    return (
        <div
            onClick={onClick}
            className="group relative h-full cursor-pointer"
        >
            <div className="relative h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#58CC02]/40 hover:-translate-y-0.5 hover:shadow-md shadow-sm flex flex-col">

                {/* Header Thumbnail Cover Image (Studio ModuleCard Style) */}
                <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
                    <img
                        src={displayThumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/logo.webp"
                        }}
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center justify-end pointer-events-none">
                        {isCompleted ? (
                            <span className="text-[10px] font-bold text-white bg-emerald-500 px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                        ) : isInProgress ? (
                            <span className="text-[10px] font-bold text-white bg-[#58CC02] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Zap className="w-3 h-3" /> {Math.round(lesson.progress)}%
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                New
                            </span>
                        )}
                    </div>

                    {/* Duration Badge */}
                    {lesson.duration && (
                        <div className="absolute bottom-2 right-2.5 text-[10px] font-semibold text-white/90 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{lesson.duration} min</span>
                        </div>
                    )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div className="space-y-1.5 mb-3">
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-[#58CC02] transition-colors line-clamp-1 leading-snug">
                            {lesson.title}
                        </h3>
                        {lesson.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                {lesson.description}
                            </p>
                        )}
                    </div>

                    {/* Footer Section with Sleek Progress Bar & Action Link */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        {/* Progress Bar Track */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <span>{isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}</span>
                                <span className={isCompleted ? "text-emerald-500 font-bold" : isInProgress ? "text-[#58CC02] font-bold" : "text-slate-400"}>
                                    {Math.round(lesson.progress)}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${isCompleted
                                        ? "bg-emerald-500"
                                        : isInProgress
                                            ? "bg-[#58CC02]"
                                            : "bg-slate-300 dark:bg-slate-700"
                                        }`}
                                    style={{ width: `${Math.min(100, Math.max(0, lesson.progress))}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Link */}
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#58CC02] transition-colors">
                                {isCompleted ? "Review" : isInProgress ? "Resume" : "Start"}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-extrabold text-[#58CC02] group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
