'use client'

import { Bell, BookOpen, Flame, Loader2, MessageSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type PushPermissionCardProps = {
    accent?: string
    variant?: 'onboarding' | 'nudge' | 'settings'
    permission: 'default' | 'denied' | 'granted' | 'unsupported'
    loading?: boolean
    role?: 'student' | 'tutor'
    onEnable: () => void
    onDismiss?: () => void
}

const STUDENT_PERKS = [
    { icon: BookOpen, label: 'New lessons drop in your courses' },
    { icon: Flame, label: 'Streak reminders before you lose the flame' },
    { icon: MessageSquare, label: 'Class polls and live activity' },
]

const TUTOR_PERKS = [
    { icon: BookOpen, label: 'Know when students are answering live blocks' },
    { icon: MessageSquare, label: 'Class poll, cloud, and scale activity' },
    { icon: Sparkles, label: 'Followers and lesson publish alerts' },
]

export function PushPermissionCard({
    accent = '#1CB0F6',
    variant = 'nudge',
    permission,
    loading = false,
    role = 'student',
    onEnable,
    onDismiss,
}: PushPermissionCardProps) {
    const perks = role === 'tutor' ? TUTOR_PERKS : STUDENT_PERKS
    const blocked = permission === 'denied'
    const compact = variant === 'settings'

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-[1.75rem] border-2',
                compact ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50' : 'border-slate-200 bg-white shadow-sm',
            )}
        >
            <div
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl pointer-events-none"
                style={{ backgroundColor: accent }}
            />
            <div
                className="absolute -left-6 bottom-0 h-24 w-24 rounded-full opacity-15 blur-2xl pointer-events-none"
                style={{ backgroundColor: '#58CC02' }}
            />

            <div className={cn('relative', compact ? 'p-5' : 'p-6 sm:p-7')}>
                <div className="flex items-start gap-4">
                    <div
                        className="h-14 w-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                            borderColor: `${accent}44`,
                            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                            color: accent,
                        }}
                    >
                        <Bell className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p
                            className="text-[11px] font-black uppercase tracking-widest"
                            style={{ color: accent }}
                        >
                            Stay in the loop
                        </p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {blocked ? 'Notifications are blocked' : 'Get reminders on this device'}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1.5 leading-relaxed">
                            {blocked
                                ? 'Your browser blocked alerts. Turn them on in site settings, then flip the switch here.'
                                : 'We only ping for lessons, streaks, and class moments — not every star or badge.'}
                        </p>
                    </div>
                </div>

                {!blocked && (
                    <ul className="mt-5 space-y-2">
                        {perks.map(({ icon: Icon, label }) => (
                            <li
                                key={label}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                            >
                                <span
                                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${accent}18`, color: accent }}
                                >
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span className="text-sm font-bold text-slate-700">{label}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {variant !== 'settings' && (
                    <div className={cn('flex flex-col sm:flex-row gap-2.5', blocked ? 'mt-5' : 'mt-6')}>
                        {!blocked && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onEnable}
                                className="flex-1 h-12 rounded-2xl font-black text-white border-b-4 active:border-b-0 active:translate-y-[2px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ backgroundColor: accent, borderColor: '#0090CC' }}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Turn on reminders'}
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onDismiss}
                                className={cn(
                                    'h-12 rounded-2xl font-extrabold text-slate-500 border-2 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60',
                                    blocked ? 'flex-1' : 'sm:min-w-[8.5rem] px-4',
                                )}
                            >
                                {blocked ? 'Remind me later' : 'Not now'}
                            </button>
                        )}
                    </div>
                )}

                {variant === 'settings' && blocked && (
                    <p className="mt-4 text-xs font-semibold text-slate-500">
                        Chrome: lock icon in the address bar → Site settings → Notifications → Allow.
                    </p>
                )}
            </div>
        </div>
    )
}
