'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Pause, RefreshCw, Shield, Sparkles, Flame, Star, Zap, Lightbulb, RotateCcw, BookOpen, Square, Tag, Palette, Pin } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { resetStarAwardDedupe } from '@/lib/achievement-listener'
import { queryKeys } from '@/lib/query-keys'
import { useAuth } from '@/context/auth-context'
import { useGamification } from '@/context/gamification-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SoundEffects } from '@/lib/sound-effects'
import { CERTIFICATE_PRINT_COST } from '@/lib/certificates'

const ICONS: Record<string, typeof Clock> = {
    live_time: Clock,
    live_freeze: Pause,
    second_chance: RefreshCw,
    star_surge: Sparkles,
    focus_shield: Shield,
    streak_freeze: Flame,
    hint_pack: Lightbulb,
    live_block_reset: RotateCcw,
    reference_credit: BookOpen,
    avatar_frame: Square,
    nameplate: Tag,
    accent_pack: Palette,
    pride_pin: Pin,
}

export default function StudentStorePage() {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const { starBalance } = useGamification()
    const [lessonId, setLessonId] = useState('')
    const [quote, setQuote] = useState<{ cost: number; maxStars: number } | null>(null)
    const [error, setError] = useState('')

    const storeQuery = useQuery({
        queryKey: queryKeys.store,
        queryFn: () => apiClient.store.get(),
    })

    const lessonsQuery = useQuery({
        queryKey: queryKeys.storeResetLessons,
        queryFn: async () => {
            const raw = await apiClient.lessons.listMine(user!.user_id)
            return Array.isArray(raw) ? raw : []
        },
        enabled: Boolean(user?.user_id),
    })

    const resetLessons = useMemo(() => {
        return (lessonsQuery.data || []).map((lesson: any) => ({
            id: String(lesson.lessonId || lesson.id || ''),
            title: lesson.title || lesson.name || 'Lesson',
            program: lesson.program || lesson.programName || '',
            progress: Number(lesson.progress) || 0,
            status: lesson.status || (lesson.progress === 100 ? 'COMPLETED' : lesson.progress > 0 ? 'IN_PROGRESS' : 'NEW'),
        })).filter((lesson: { id: string }) => lesson.id)
    }, [lessonsQuery.data])

    const refresh = async (starBalance?: number) => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.store })
        await queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
        if (typeof starBalance === 'number') {
            queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                ...(prev || {}),
                starBalance,
            }))
        }
    }

    const buy = useMutation({
        mutationFn: (sku: string) => apiClient.store.buy(sku),
        onSuccess: (data) => {
            void SoundEffects.play('complete')
            void refresh(data.starBalance)
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Could not buy that.'),
    })
    const upgrade = useMutation({
        mutationFn: (sku: string) => apiClient.store.upgrade(sku),
        onSuccess: (data) => {
            void SoundEffects.play('quizSuccess')
            void refresh(data.starBalance)
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Could not upgrade that.'),
    })
    const activate = useMutation({
        mutationFn: (sku: string) => apiClient.store.activate(sku),
        onSuccess: () => {
            void SoundEffects.play('powerupUsed')
            void refresh()
            void queryClient.invalidateQueries({ queryKey: queryKeys.stats })
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Could not activate that.'),
    })
    const resetLesson = useMutation({
        mutationFn: (id: string) => apiClient.store.resetLesson(id),
        onSuccess: (data) => {
            resetStarAwardDedupe()
            void refresh(data.starBalance)
            void queryClient.invalidateQueries({ queryKey: queryKeys.storeResetLessons })
            setQuote(null)
            setLessonId('')
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Could not reset that lesson.'),
    })

    const items = Object.values(storeQuery.data?.inventory?.items || {})
    const liveItems = items.filter((item: any) => item.kind === 'live')
    const buffItems = items.filter((item: any) => item.kind === 'buff')
    const consumableItems = items.filter((item: any) => item.kind === 'consumable')
    const cosmeticItems = items.filter((item: any) => item.kind === 'cosmetic')

    return (
        <div className="space-y-6 pb-12">
            <section className="relative overflow-hidden p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9600]">Star market</p>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Spend stars. Stay competitive.</h1>
                <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    Live-mode powerups help you earn more stars. Upgrades get more expensive each level, and they cap.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="text-sm font-extrabold text-amber-700 tabular-nums">{starBalance} stars</span>
                </div>
            </section>

            {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}

            <section className="rounded-2xl border-2 border-[#FFC800] bg-[#FFF8E8] p-5 space-y-2">
                <h2 className="text-sm font-black text-slate-800">Certificates · {CERTIFICATE_PRINT_COST} stars each print</h2>
                <p className="text-xs font-medium text-slate-600">
                    Print a lesson certificate after you finish, or a pride-board certificate with today&apos;s date. Same A4 image on every device — download as PNG or PDF. Every print costs stars again.
                </p>
            </section>

            <Section title="Activate during live" items={liveItems} buy={buy} upgrade={upgrade} />
            <Section title="Buffs and protection" items={buffItems} buy={buy} upgrade={upgrade} activate={activate} />
            <Section title="Consumables" items={consumableItems} buy={buy} upgrade={upgrade} />
            <Section title="Cosmetics" items={cosmeticItems} buy={buy} upgrade={upgrade} cosmetics />

            <section className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF4B4B]" />
                    <h2 className="text-sm font-black text-slate-800 dark:text-white">Lesson reset</h2>
                </div>
                <p className="text-xs font-medium text-slate-500">
                    Wipe your progress on one lesson so you can run it again. Cost is 150% of the maximum live stars in that lesson. Lifetime pride counts stay; you can re-earn stars and try to beat live times.
                </p>
                <label className="block space-y-1.5">
                    <span className="text-[11px] font-extrabold text-slate-600">Choose a lesson</span>
                    <select
                        value={lessonId}
                        disabled={lessonsQuery.isLoading || resetLessons.length === 0}
                        onChange={async (event) => {
                            const id = event.target.value
                            setLessonId(id)
                            setQuote(null)
                            setError('')
                            if (!id) return
                            try {
                                const data = await apiClient.store.quoteReset(id)
                                setQuote({ cost: data.cost, maxStars: data.maxStars })
                            } catch (err: any) {
                                setError(err.response?.data?.error || 'Could not price that lesson.')
                            }
                        }}
                        className="h-11 w-full px-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-800"
                    >
                        <option value="">
                            {lessonsQuery.isLoading
                                ? 'Loading your lessons…'
                                : resetLessons.length
                                    ? 'Pick a lesson'
                                    : 'No lessons yet — play one first'}
                        </option>
                        {resetLessons.map((lesson: { id: string; title: string; program: string; progress: number; status: string }) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.title}
                                {lesson.program ? ` · ${lesson.program}` : ''}
                                {lesson.progress > 0 ? ` · ${Math.round(lesson.progress)}%` : ''}
                            </option>
                        ))}
                    </select>
                </label>                {quote ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-xs font-bold text-slate-600">
                            Max live stars {quote.maxStars} · reset costs <span className="text-[#FF4B4B]">{quote.cost}</span>
                        </p>
                        <Button
                            type="button"
                            className="bg-[#FF4B4B] hover:bg-red-600 text-white font-extrabold"
                            disabled={resetLesson.isPending}
                            onClick={() => resetLesson.mutate(lessonId.trim())}
                        >
                            Reset lesson
                        </Button>
                    </div>
                ) : null}
            </section>
        </div>
    )
}

function Section({
    title,
    items,
    buy,
    upgrade,
    activate,
    cosmetics,
}: {
    title: string
    items: any[]
    buy: { mutate: (sku: string) => void; isPending: boolean }
    upgrade: { mutate: (sku: string) => void; isPending: boolean }
    activate?: { mutate: (sku: string) => void; isPending: boolean }
    cosmetics?: boolean
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-black text-slate-700 dark:text-slate-200">{title}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((item) => {
                    const Icon = ICONS[item.sku] || Star
                    return (
                        <div key={item.sku} className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">{item.name}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">{item.description}</p>
                                </div>
                                <Icon className="w-5 h-5 text-[#FF9600] shrink-0" />
                            </div>
                            <p className="text-[11px] font-bold text-slate-600">
                                {cosmetics
                                    ? (item.owned || item.charges > 0 ? 'Owned · equip in Settings' : `Unlock · ${item.chargeCost} stars`)
                                    : `Level ${item.level}/${item.maxLevel} · ${item.effect} ${item.effectLabel} · ${item.charges} ready`}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="duo"
                                    disabled={buy.isPending || (cosmetics && (item.owned || item.charges > 0))}
                                    onClick={() => buy.mutate(item.sku)}
                                    className="flex-1 h-11 bg-[#58CC02] hover:bg-[#46A302] border-[#58CC02] border-b-[#3B8C00] text-white text-[11px]"
                                >
                                    {cosmetics && (item.owned || item.charges > 0) ? 'Owned' : `Buy ${item.chargeCost}`}
                                </Button>
                                <Button
                                    type="button"
                                    variant="duo"
                                    disabled={!item.canUpgrade || upgrade.isPending}
                                    onClick={() => upgrade.mutate(item.sku)}
                                    className={cn(
                                        'h-11 px-3 text-[11px]',
                                        item.canUpgrade
                                            ? 'bg-[#1CB0F6] hover:bg-[#0d9de0] border-[#1CB0F6] border-b-[#0a7cb3] text-white'
                                            : 'bg-slate-200 text-slate-400 border-slate-300 border-b-slate-400'
                                    )}
                                >
                                    {item.canUpgrade ? `Up ${item.upgradeCost}` : 'Max'}
                                </Button>
                                {activate && item.charges > 0 ? (
                                    <Button
                                        type="button"
                                        variant="duo"
                                        disabled={activate.isPending}
                                        onClick={() => activate.mutate(item.sku)}
                                        className="h-11 px-3 text-[11px] bg-[#FF9600] hover:bg-[#e08600] border-[#FF9600] border-b-[#c46f00] text-white"
                                    >
                                        Activate
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
