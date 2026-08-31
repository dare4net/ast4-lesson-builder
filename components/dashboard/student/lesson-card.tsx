"use client"

import Link from "next/link"
import { Clock, ArrowRight, CheckCircle2, Zap, Lock, Star, Loader2 } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { LESSON_EARLY_UNLOCK_COST, LESSON_UNLOCK_PROGRESS } from "@/lib/lesson-unlock"

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
        locked?: boolean
        unlockCost?: number
    }
    href?: string
    onClick?: () => void
    onDetails?: () => void
    onUnlock?: () => void
    unlocking?: boolean
}

export function LessonCard({ lesson, href, onClick, onDetails, onUnlock, unlocking = false }: LessonCardProps) {
    const isCompleted = lesson.progress === 100;
    const isLocked = Boolean(lesson.locked)
    const isInProgress = lesson.progress > 0 && lesson.progress < 100;
    const displayThumbnail = lesson.thumbnail || "/logo.webp";
    const actionLabel = isLocked ? `Unlock · ${lesson.unlockCost || LESSON_EARLY_UNLOCK_COST}★` : isCompleted ? "Review" : isInProgress ? "Resume" : "Start"

    const media = (
        <>
            <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
                <OptimizedImage
                    src={displayThumbnail}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                <div className="absolute top-2.5 right-2.5 flex items-center justify-end pointer-events-none">
                    {isLocked ? (
                        <span className="text-[10px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                        </span>
                    ) : isCompleted ? (
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

                {lesson.duration && (
                    <div className="absolute bottom-2 right-2.5 text-[10px] font-semibold text-white/90 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{lesson.duration} min</span>
                    </div>
                )}
            </div>

            <div className="px-4 sm:px-5 pt-4 pb-1 space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-[#58CC02] transition-colors line-clamp-1 leading-snug">
                    {lesson.title}
                </h3>
                {lesson.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {lesson.description}
                    </p>
                )}
            </div>
        </>
    )

    return (
        <div className="group relative h-full text-left">
            <div className="relative h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#58CC02]/40 hover:-translate-y-0.5 hover:shadow-md shadow-sm flex flex-col">
                {href && !isLocked ? (
                    <Link href={href} className="block" onClick={onClick}>
                        {media}
                    </Link>
                ) : (
                    <button type="button" onClick={isLocked ? onDetails : onClick} className="block w-full text-left cursor-pointer">
                        {media}
                    </button>
                )}

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 flex flex-col flex-1 gap-2">
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

                    <div className="mt-auto space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                            {onDetails && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        onDetails()
                                    }}
                                    className="h-9 px-3 rounded-xl border-2 border-slate-200 hover:border-[#1CB0F6] text-slate-600 text-[11px] font-extrabold transition-colors"
                                >
                                    Details
                                </button>
                            )}
                            {href && !isLocked ? (
                                <Link
                                    href={href}
                                    onClick={onClick}
                                    className="flex-1 h-9 px-3 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white text-[11px] font-extrabold flex items-center justify-center gap-1"
                                >
                                    {actionLabel}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={isLocked ? onUnlock : onClick}
                                    disabled={unlocking}
                                    className={`flex-1 h-9 px-3 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60 ${
                                        isLocked
                                            ? "bg-[#FFC800] hover:bg-[#e6b400] text-slate-900"
                                            : "bg-[#58CC02] hover:bg-[#46A302] text-white"
                                    }`}
                                >
                                    {unlocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isLocked ? <Star className="w-3.5 h-3.5 fill-current" /> : null}
                                    {actionLabel}
                                    {!isLocked && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>
                        {isLocked && (
                            <p className="text-[11px] font-semibold leading-snug text-slate-500">
                                Finish {LESSON_UNLOCK_PROGRESS}% of previous lesson to unlock for free
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
