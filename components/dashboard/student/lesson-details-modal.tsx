'use client'

import { useState, type ReactNode } from 'react'
import { Award, ChevronDown, Clock, HelpCircle, Layers, Loader2, Lock, Play, Star, Zap } from 'lucide-react'
import { CertificateStudio } from '@/components/certificates/certificate-studio'
import { useAuth } from '@/context/auth-context'
import { CERTIFICATE_PRINT_COST } from '@/lib/certificates'
import { LESSON_EARLY_UNLOCK_COST, LESSON_UNLOCK_PROGRESS } from '@/lib/lesson-unlock'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export type LessonDetailsLesson = {
    id?: string
    lessonId?: string
    _id?: string
    module_id?: string
    moduleId?: string
    titleComputed?: string
    title?: string
    description?: string
    index?: number
    completed?: boolean
    progress?: number
    duration?: number | string
    totalSlides?: number
    interactiveCount?: number
    categoryCounts?: { interactive?: number; gamified?: number }
    score?: number
    totalScore?: number
    obtainablePoints?: number
    obtainableStars?: number
    livePoints?: number
    practicePoints?: number
    locked?: boolean
    unlockedByStars?: boolean
    unlockCost?: number
    activities?: Array<{
        type: string
        label?: string
        slideTitle?: string
        mode?: string
        points?: number
        maxStars?: number
    }>
}

export function LessonDetailsModal({
    lesson,
    open,
    onOpenChange,
    onLaunch,
    launching = false,
    loading = false,
    unlocking = false,
    onUnlock,
}: {
    lesson: LessonDetailsLesson | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onLaunch: (lesson: LessonDetailsLesson) => void
    launching?: boolean
    loading?: boolean
    unlocking?: boolean
    onUnlock?: (lesson: LessonDetailsLesson) => void
}) {
    const [showHunt, setShowHunt] = useState(false)
    const [showCertificate, setShowCertificate] = useState(false)
    const { user } = useAuth()
    const studentName = user?.full_name || user?.fullName || user?.email?.split('@')[0] || 'Student'
    const completed = Boolean(lesson?.completed || (lesson?.progress || 0) === 100)
    const locked = Boolean(lesson?.locked)
    const unlockCost = Number(lesson?.unlockCost) || LESSON_EARLY_UNLOCK_COST

    return (
        <>
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    setShowHunt(false)
                    setShowCertificate(false)
                }
                onOpenChange(next)
            }}
        >
            <DialogContent className="max-w-lg rounded-3xl bg-white border-2 border-slate-200 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                {loading && !lesson ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-8 h-8 text-[#1CB0F6] animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading hunt details…</p>
                    </div>
                ) : lesson && (
                    <>
                        <DialogHeader className="space-y-2 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1CB0F6]">
                                    {typeof lesson.index === 'number' ? `Lesson ${lesson.index + 1}` : 'Lesson'}
                                </span>
                                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${lesson.completed
                                    ? 'bg-[#58CC02]/10 border-[#58CC02]/20 text-[#58CC02]'
                                    : locked
                                        ? 'bg-slate-100 border-slate-200 text-slate-500'
                                        : (lesson.progress || 0) > 0
                                        ? 'bg-[#FFC800]/10 border-[#FFC800]/20 text-[#D9A000]'
                                        : 'bg-slate-100 border-slate-200 text-slate-500'
                                    }`}>
                                    {lesson.completed ? 'Completed' : locked ? 'Locked' : (lesson.progress || 0) > 0 ? `${lesson.progress}% Done` : 'Not Started'}
                                </span>
                            </div>
                            <DialogTitle className="text-xl font-extrabold text-slate-800 leading-snug">
                                {lesson.titleComputed || lesson.title || 'Lesson'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed">
                                {lesson.description || 'Interactive slide lesson designed with guided practice and real-time feedback.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-3">
                            <StatTile icon={<Clock className="w-4 h-4" />} tint="bg-[#1CB0F6]/10 text-[#1CB0F6]" label="Duration" value={`${lesson.duration || 10} Mins`} />
                            <StatTile icon={<Layers className="w-4 h-4" />} tint="bg-[#CE82FF]/10 text-[#CE82FF]" label="Slides" value={`${lesson.totalSlides ?? 0} Total`} />
                            <StatTile
                                icon={<Zap className="w-4 h-4 fill-[#D9A000]" />}
                                tint="bg-[#FFC800]/10 text-[#D9A000]"
                                label="Activities"
                                value={
                                    lesson.interactiveCount || 0
                                        ? `${lesson.interactiveCount || 0}${(lesson.categoryCounts?.gamified || 0) > 0 ? ` (${lesson.categoryCounts?.interactive || 0} int / ${lesson.categoryCounts?.gamified} gami)` : ' Interactive'}`
                                        : '0 Interactive'
                                }
                            />
                            <StatTile
                                icon={<Award className="w-4 h-4" />}
                                tint="bg-[#58CC02]/10 text-[#58CC02]"
                                label="Score"
                                value={`${lesson.score || 0} / ${lesson.totalScore || lesson.obtainablePoints || 0} pts`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <StatTile
                                icon={<Star className="w-4 h-4 fill-amber-400" />}
                                tint="bg-amber-100 text-amber-600"
                                box="bg-amber-50 border-amber-200"
                                label="Stars"
                                labelClass="text-amber-600/70"
                                value={`up to ${lesson.obtainableStars || 0} live`}
                            />
                            <StatTile
                                icon={<Zap className="w-4 h-4" />}
                                tint="bg-[#1CB0F6]/10 text-[#1CB0F6]"
                                label="Points"
                                value={`${lesson.obtainablePoints || lesson.totalScore || 0} obtainable`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowHunt((openHunt) => !openHunt)}
                            className="w-full h-11 border-2 border-slate-200 hover:border-[#1CB0F6] text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
                        >
                            <HelpCircle className="w-4 h-4" />
                            {showHunt ? 'Hide hunt details' : 'See stars, points, and all blocks'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showHunt ? 'rotate-180' : ''}`} />
                        </button>

                        {showHunt && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {(lesson.activities || []).length} blocks · {lesson.livePoints || 0} live pts · {lesson.practicePoints || 0} practice pts
                                </p>
                                {(lesson.activities || []).length === 0 ? (
                                    <p className="text-xs font-medium text-slate-500">No scored or interactive blocks in this lesson yet.</p>
                                ) : (
                                    <ul className="space-y-1.5">
                                        {(lesson.activities || []).map((activity, index) => (
                                            <li
                                                key={`${activity.type}-${index}`}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-extrabold text-slate-800 truncate">
                                                        {activity.label || activity.type}
                                                    </span>
                                                    <span className="block text-[10px] font-bold text-slate-400 truncate">
                                                        {activity.slideTitle || 'Slide'} · {activity.mode === 'live' ? 'Live' : 'Practice'}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-[11px] font-black text-slate-600">
                                                    {activity.points || 0} pts
                                                    {activity.maxStars ? ` · ${activity.maxStars}★` : ''}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-2 flex flex-col gap-2 sm:flex-col">
                            {completed && (
                                <button
                                    type="button"
                                    onClick={() => setShowCertificate(true)}
                                    className="w-full h-12 bg-[#FFC800] hover:bg-[#e6b400] border-b-4 border-[#D9A000] text-slate-900 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 active:border-b-0 active:translate-y-[2px]"
                                >
                                    <Award className="w-4 h-4" />
                                    Print certificate · {CERTIFICATE_PRINT_COST}★
                                </button>
                            )}
                            {locked ? (
                                <>
                                    <p className="text-xs font-bold text-slate-500 text-center">
                                        Complete {LESSON_UNLOCK_PROGRESS}% of the previous lesson, or skip ahead with stars.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={unlocking || !onUnlock}
                                        onClick={() => lesson && onUnlock?.(lesson)}
                                        className="w-full h-12 bg-[#FFC800] hover:bg-[#e6b400] border-b-4 border-[#D9A000] text-slate-900 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                                    >
                                        {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                        Unlock with {unlockCost}★
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    disabled={launching || !lesson}
                                    onClick={() => lesson && onLaunch(lesson)}
                                    className="w-full h-12 bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                                >
                                    {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                                    <span>
                                        {lesson.completed ? 'Review Lesson in Viewer' : (lesson.progress || 0) > 0 ? 'Continue Lesson' : 'Start Lesson'}
                                    </span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="w-full h-10 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                Close
                            </button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
        {completed && lesson && (
            <CertificateStudio
                open={showCertificate}
                onOpenChange={setShowCertificate}
                payload={{
                    kind: 'lesson',
                    lessonId: lesson.lessonId || lesson.id,
                    studentName,
                    lessonTitle: lesson.titleComputed || lesson.title || 'Lesson',
                    score: lesson.score,
                    totalPossible: lesson.totalScore || lesson.obtainablePoints,
                }}
            />
        )}
        </>
    )
}

function StatTile({
    icon,
    tint,
    box = 'bg-slate-50 border-slate-200',
    label,
    labelClass = 'text-slate-400',
    value,
}: {
    icon: ReactNode
    tint: string
    box?: string
    label: string
    labelClass?: string
    value: string
}) {
    return (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${box}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${tint}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[10px] font-extrabold uppercase ${labelClass}`}>{label}</p>
                <p className="text-xs font-extrabold text-slate-700">{value}</p>
            </div>
        </div>
    )
}
