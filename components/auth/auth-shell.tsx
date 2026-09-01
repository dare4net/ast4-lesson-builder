'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { AuthPlayground } from '@/components/auth/auth-playground'
import { cn } from '@/lib/utils'

export function AuthShell({
    role,
    mode,
    next,
    children,
}: {
    role: string
    mode: 'login' | 'signup'
    next?: string | null
    children: React.ReactNode
}) {
    const reduceMotion = useReducedMotion()
    const isStudent = role === 'student'
    const isOrg = role === 'organization'
    // Org staff use invite / deep links — not a public portal beside student/teacher.
    const accent = isStudent ? '#1CB0F6' : isOrg ? '#0EA5E9' : '#58CC02'
    const nextQuery = next ? `&next=${encodeURIComponent(next)}` : ''

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
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${accent} 1.5px, transparent 1.5px)`,
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 py-10 sm:py-14 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <Link href="/" className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            <Image src="/icons/icon-192x192.png" alt="AST Logo" width={32} height={32} className="object-contain" priority />
                        </div>
                        <span className="text-sm font-black text-slate-800 truncate">After-School Tech</span>
                    </Link>
                    {!isOrg && (
                        <div className="flex rounded-full border-2 border-slate-200 bg-white p-0.5 text-[11px] font-black">
                            <Link
                                href={`/auth/${mode}?role=student${nextQuery}`}
                                className={cn('h-8 px-3 rounded-full inline-flex items-center', isStudent && 'text-white')}
                                style={isStudent ? { backgroundColor: '#1CB0F6' } : undefined}
                            >
                                I&apos;m a student
                            </Link>
                            <Link
                                href={`/auth/${mode}?role=tutor${nextQuery}`}
                                className={cn('h-8 px-3 rounded-full inline-flex items-center', !isStudent && 'text-white')}
                                style={!isStudent ? { backgroundColor: '#58CC02' } : undefined}
                            >
                                I&apos;m a teacher
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-5 items-stretch flex-1">
                    <div
                        className="hidden lg:block rounded-[2rem] overflow-hidden border-2 border-white/20"
                        style={{ background: `linear-gradient(160deg, ${accent} 0%, #0f172a 88%)` }}
                    >
                        <AuthPlayground accent={accent} />
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="lg:hidden rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: accent }}>
                            <AuthPlayground accent={accent} compact />
                        </div>
                        <div className="w-full bg-white border-2 border-slate-200 rounded-3xl overflow-hidden">
                            <div className="h-2 w-full" style={{ backgroundColor: accent }} />
                            <div className="p-6 sm:p-8">{children}</div>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    After-School Tech Studio
                    {reduceMotion ? '' : ' • Interactive Learning'}
                </p>
            </div>
        </div>
    )
}
