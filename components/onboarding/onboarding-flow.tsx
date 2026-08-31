'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BookOpen, Crown, Loader2, Star, Timer } from 'lucide-react'
import { SoundEffects } from '@/lib/sound-effects'
import { useAuth } from '@/context/auth-context'
import { HandleAvatar } from '@/components/pride/handle-avatar'
import { FirstWin } from '@/components/onboarding/first-win'
import { apiClient } from '@/lib/api-client'
import { AVATAR_IDS, resolveAvatarId } from '@/lib/avatar'
import { handleSchema } from '@/lib/contracts'
import { ONBOARDING_BONUS_STARS, safeNextPath, suggestHandle } from '@/lib/onboarding'
import { ACCENT_COLORS, resolveAccentColor } from '@/lib/pride-format'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const STEPS = ['name', 'face', 'world', 'lesson', 'win'] as const

export function OnboardingFlow() {
    const { user, updateUser } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = safeNextPath(searchParams?.get('next')) || '/dashboard/student/catalog'
    const reduceMotion = useReducedMotion()

    const [step, setStep] = useState(0)
    const [name, setName] = useState(user?.full_name || user?.fullName || '')
    const [handle, setHandle] = useState(user?.handle || suggestHandle(user?.full_name || user?.fullName || ''))
    const [accentColor, setAccentColor] = useState<string | null>(user?.accentColor || null)
    const [avatarId, setAvatarId] = useState<string | null>(user?.avatarId || null)
    const [flipped, setFlipped] = useState<Record<string, boolean>>({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const [bonus, setBonus] = useState(0)
    const [lessonPick, setLessonPick] = useState<string | null>(null)

    const accent = resolveAccentColor(handle, accentColor)
    const face = resolveAvatarId(handle || user?.user_id, avatarId)
    const first = name.trim().split(/\s+/)[0] || 'there'
    const worldReady = flipped.stars && flipped.live && flipped.pride
    const lessonReady = lessonPick === 'live'

    const payload = useMemo(() => {
        const body: { full_name?: string; handle?: string; accentColor?: string; avatarId?: string } = {}
        if (name.trim().length >= 2) body.full_name = name.trim()
        const parsed = handleSchema.safeParse(handle.trim().toLowerCase())
        if (parsed.success) body.handle = parsed.data
        if (accentColor) body.accentColor = accentColor
        if (avatarId) body.avatarId = avatarId
        return body
    }, [name, handle, accentColor, avatarId])

    const finish = async (skipped: boolean) => {
        setSaving(true)
        setError(null)
        try {
            const result = await apiClient.onboarding.complete({ ...payload, skipped })
            updateUser({
                full_name: result.full_name ?? payload.full_name,
                fullName: result.full_name ?? payload.full_name,
                handle: result.handle ?? payload.handle ?? null,
                accentColor: result.accentColor ?? payload.accentColor ?? null,
                avatarId: result.avatarId ?? payload.avatarId ?? null,
                onboardingCompletedAt: result.onboardingCompletedAt || new Date().toISOString(),
                onboardingSkippedAt: result.onboardingSkippedAt || (skipped ? new Date().toISOString() : null),
            })
            setBonus(Number(result.bonusAwarded) || (skipped ? 0 : ONBOARDING_BONUS_STARS))
            if (skipped) {
                router.replace(next)
                return
            }
            void SoundEffects.play('levelUp')
            setDone(true)
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Could not save. Try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2.5 flex z-20">
                <div className="flex-1 bg-[#58CC02]" />
                <div className="flex-1 bg-[#1CB0F6]" />
                <div className="flex-1 bg-[#FFC800]" />
                <div className="flex-1 bg-[#FF4B4B]" />
                <div className="flex-1 bg-[#CE82FF]" />
            </div>
            <div
                className="absolute inset-0 opacity-[0.16] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#1CB0F6 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
            />

            <div className="relative z-10 flex-1 w-full max-w-lg mx-auto px-4 py-12 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1.5">
                        {STEPS.map((id, index) => (
                            <span
                                key={id}
                                className={cn('h-2 rounded-full transition-all', index === step ? 'w-6' : 'w-2')}
                                style={{ backgroundColor: index <= step ? accent : '#e2e8f0' }}
                            />
                        ))}
                    </div>
                    {step > 0 && !done && (
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => finish(true)}
                            className="text-xs font-extrabold text-slate-400"
                        >
                            Skip
                        </button>
                    )}
                </div>

                <div className="flex-1 bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={done ? 'done' : STEPS[step]}
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                        >
                            {done ? (
                                <div className="text-center space-y-4 py-4">
                                    <HandleAvatar
                                        handle={handle}
                                        avatarId={face}
                                        displayName={name}
                                        accentColor={accent}
                                        className="h-24 w-24 mx-auto border-4"
                                        fallbackClassName="text-3xl"
                                    />
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">You&apos;re in, {first}.</h2>
                                    <p className="text-sm font-bold text-slate-500">
                                        {handle ? <>@{handle}</> : 'Your run is ready.'}
                                        {bonus > 0 ? ` +${bonus} stars for showing up.` : ''}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.replace(next)}
                                        className="w-full h-12 rounded-2xl font-black text-white border-b-4 active:border-b-0 active:translate-y-[2px]"
                                        style={{ backgroundColor: accent, borderColor: '#0090CC' }}
                                    >
                                        Explore courses
                                    </button>
                                </div>
                            ) : step === 0 ? (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Hey, {first}</p>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">This is your run. Let&apos;s make it yours.</h2>
                                    </div>
                                    <label className="block space-y-1.5">
                                        <span className="text-xs font-extrabold text-slate-700">What should we call you?</span>
                                        <input
                                            value={name}
                                            onChange={(event) => {
                                                setName(event.target.value)
                                                if (!user?.handle) setHandle(suggestHandle(event.target.value))
                                            }}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-extrabold text-slate-800"
                                            placeholder="Your display name"
                                        />
                                    </label>
                                </div>
                            ) : step === 1 ? (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <HandleAvatar
                                            handle={handle}
                                            avatarId={face}
                                            displayName={name}
                                            accentColor={accent}
                                            className="h-16 w-16 border-4"
                                            fallbackClassName="text-xl"
                                        />
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Build your face</p>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pick a look.</h2>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {AVATAR_IDS.map((id) => (
                                            <button
                                                key={id}
                                                type="button"
                                                aria-label={`Choose ${id} avatar`}
                                                onClick={() => setAvatarId(id)}
                                                className="rounded-full p-0.5"
                                                style={{ boxShadow: face === id ? `0 0 0 2px ${accent}` : undefined }}
                                            >
                                                <HandleAvatar handle={id} avatarId={id} displayName={id} className="h-10 w-10" />
                                            </button>
                                        ))}
                                    </div>
                                    <label className="block space-y-1.5">
                                        <span className="text-xs font-extrabold text-slate-700">Handle</span>
                                        <input
                                            value={handle}
                                            onChange={(event) => setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-800"
                                            placeholder="maya_codes"
                                        />
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ACCENT_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                aria-label={`Choose ${color}`}
                                                onClick={() => setAccentColor(color)}
                                                className="h-9 w-9 rounded-full border-2"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: accent === color ? '#0f172a' : 'transparent',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>The world</p>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Tap to collect.</h2>
                                    </div>
                                    <WorldCard
                                        id="stars"
                                        title="Stars"
                                        copy="Finish live blocks. Stars buy time, freezes, and another run."
                                        icon={<Star className="w-5 h-5 fill-current" />}
                                        color="#FF9600"
                                        open={Boolean(flipped.stars)}
                                        onFlip={() => setFlipped((current) => ({ ...current, stars: true }))}
                                    />
                                    <WorldCard
                                        id="live"
                                        title="Live"
                                        copy="Timers, powerups, class votes. Everyone plays the same beat."
                                        icon={<Timer className="w-5 h-5" />}
                                        color="#1CB0F6"
                                        open={Boolean(flipped.live)}
                                        onFlip={() => setFlipped((current) => ({ ...current, live: true }))}
                                    />
                                    <WorldCard
                                        id="pride"
                                        title="Pride"
                                        copy="Public ranks only if you opt in. Email stays private."
                                        icon={<Crown className="w-5 h-5 fill-current" />}
                                        color="#FFC800"
                                        open={Boolean(flipped.pride)}
                                        onFlip={() => setFlipped((current) => ({ ...current, pride: true }))}
                                    />
                                </div>
                            ) : step === 3 ? (
                                <LessonPlaybook
                                    accent={accent}
                                    pick={lessonPick}
                                    onPick={(value) => {
                                        setLessonPick(value)
                                        void SoundEffects.play(value === 'live' ? 'correct' : 'incorrect')
                                    }}
                                />
                            ) : (
                                <FirstWin accent={accent} onWon={() => finish(false)} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                    {error && <p className="mt-4 text-xs font-bold text-red-600">{error}</p>}
                </div>

                {!done && step < 4 && (
                    <button
                        type="button"
                        disabled={saving || (step === 0 && name.trim().length < 2) || (step === 2 && !worldReady) || (step === 3 && !lessonReady)}
                        onClick={() => {
                            void SoundEffects.play('uiClick')
                            setStep((value) => value + 1)
                        }}
                        className="mt-4 w-full h-12 rounded-2xl font-black text-white border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        style={{ backgroundColor: accent, borderColor: '#0090CC' }}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                    </button>
                )}
            </div>
        </div>
    )
}

function WorldCard({
    title,
    copy,
    icon,
    color,
    open,
    onFlip,
}: {
    id: string
    title: string
    copy: string
    icon: React.ReactNode
    color: string
    open: boolean
    onFlip: () => void
}) {
    return (
        <button
            type="button"
            onClick={() => {
                void SoundEffects.play('uiClick')
                onFlip()
            }}
            className="w-full text-left rounded-2xl border-2 p-4 transition-colors"
            style={{
                borderColor: open ? color : '#e2e8f0',
                backgroundColor: open ? `${color}14` : '#fff',
            }}
        >
            <span className="flex items-center gap-2 text-sm font-black" style={{ color }}>
                {icon}
                {open ? title : `Tap for ${title}`}
            </span>
            {open && <p className="mt-1.5 text-sm font-semibold text-slate-600">{copy}</p>}
        </button>
    )
}

function LessonPlaybook({
    accent,
    pick,
    onPick,
}: {
    accent: string
    pick: string | null
    onPick: (value: string) => void
}) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>How a lesson works</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Play it like this.</h2>
            </div>
            <div className="rounded-2xl border-2 p-4 text-left" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}10` }}>
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Intro cue</p>
                <p className="mt-1 text-lg font-black text-slate-900">Every lesson starts on the canvas.</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">You hear what the lesson is about. Images and audio load while you read. Then you tap Start.</p>
            </div>
            <div className="space-y-2">
                <TeachRow icon={<BookOpen className="w-4 h-4" />} title="Slide cues" copy="A short card on the canvas tells you when you moved. Bottom nav hides until you begin." />
                <TeachRow icon={<Timer className="w-4 h-4" />} title="Live vs practice" copy="Live has a timer and pays stars. Practice is untimed so you can learn the move." />
                <TeachRow icon={<Star className="w-4 h-4" />} title="Check your answer" copy="Tap Check. Wrong is fine. Try again. Stars come from finishing a live block." />
            </div>
            <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-700">When do you earn stars?</p>
                {[
                    { id: 'open', label: 'Just opening a lesson' },
                    { id: 'live', label: 'Finishing a live block' },
                    { id: 'avatar', label: 'Changing your avatar' },
                ].map((option) => {
                    const selected = pick === option.id
                    const correct = option.id === 'live'
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onPick(option.id)}
                            className="w-full text-left rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold border-b-4 active:border-b-0 active:translate-y-[2px]"
                            style={{
                                borderColor: selected ? (correct ? '#58CC02' : '#FF4B4B') : '#e2e8f0',
                                backgroundColor: selected ? (correct ? '#58CC0214' : '#FF4B4B14') : '#fff',
                                color: selected && correct ? '#3B8C00' : '#0f172a',
                            }}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function TeachRow({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="mt-0.5 text-[#1CB0F6]">{icon}</span>
            <div>
                <p className="text-sm font-black text-slate-800">{title}</p>
                <p className="text-xs font-semibold text-slate-500">{copy}</p>
            </div>
        </div>
    )
}
