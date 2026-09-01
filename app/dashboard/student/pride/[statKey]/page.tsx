'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Crown } from 'lucide-react'
import { StudentName } from '@/components/pride/student-name'
import { CertificateStudio } from '@/components/certificates/certificate-studio'
import { usePrideBoard } from '@/hooks/use-pride'
import { useAuth } from '@/context/auth-context'
import { CERTIFICATE_PRINT_COST } from '@/lib/certificates'
import { crownClass, formatPrideValue, gapCopy } from '@/lib/pride-format'
import { PRIDE_INDEX_PATH } from '@/lib/pride-paths'
import { cn } from '@/lib/utils'

export default function PrideBoardPage() {
    const params = useParams<{ statKey: string }>()
    const statKey = decodeURIComponent(String(params?.statKey || ''))
    const { user } = useAuth()
    const { data, isLoading, isFetching, isError, error } = usePrideBoard(statKey)
    const [showCertificate, setShowCertificate] = useState(false)
    const studentName = user?.full_name || user?.fullName || data?.you?.handle || 'Student'

    const stat = data?.stat
    const board = data?.board || []
    const you = data?.you
    const gap = gapCopy(you?.gapToNext?.amount, stat?.unit, stat?.sort)
    const showLoading = isLoading && !data
    const unknown = isError && (error as { response?: { status?: number } } | null)?.response?.status === 404
    const clubLens = data?.scope?.type === 'cohort' || data?.scope?.type === 'org'

    return (
        <div className="w-full space-y-6 pb-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <Link href={PRIDE_INDEX_PATH} className="text-xs font-extrabold text-[#1CB0F6]">All pride boards</Link>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{stat?.label || 'Pride board'}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {clubLens
                            ? 'Classmates only. Crowns are 1st, 2nd, and 3rd in your club.'
                            : 'Top 50 public profiles. Crowns are 1st, 2nd, and 3rd.'}
                    </p>
                </div>
                {isFetching && data && (
                    <p className="text-[10px] font-bold text-slate-400 shrink-0">Updating…</p>
                )}
            </div>

            {you && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">You</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{formatPrideValue(you.value, stat?.unit)}</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                        {you.rank
                            ? `Rank #${you.rank}`
                            : clubLens
                                ? 'Not ranked in this class yet'
                                : you.listed === false
                                    ? 'Make your profile public to appear here.'
                                    : 'Not ranked yet'}
                    </p>
                    {gap && you.gapToNext && (
                        <div className="flex items-center gap-2 mt-1">
                            <StudentName
                                handle={you.gapToNext.handle}
                                displayName={you.gapToNext.displayName}
                                accentColor={you.gapToNext.accentColor}
                                avatarId={you.gapToNext.avatarId}
                                bestCrown={you.gapToNext.bestCrown}
                                crown={you.gapToNext.crown}
                                following={you.gapToNext.following}
                            />
                            <p className="text-xs font-bold text-[#FF9600]">{gap}</p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowCertificate(true)}
                        className="mt-4 h-11 px-4 rounded-xl bg-[#FF9600] hover:bg-[#e08600] border-b-4 border-[#c46f00] text-white text-xs font-extrabold active:border-b-0 active:translate-y-[2px]"
                    >
                        Print pride certificate · {CERTIFICATE_PRINT_COST}★
                    </button>
                </div>
            )}

            {isError && !data && (
                <p className="text-sm font-bold text-red-600">{unknown ? 'Unknown board.' : 'Could not load this board.'}</p>
            )}
            {showLoading ? (
                <p className="text-sm font-bold text-slate-400">Loading board…</p>
            ) : (
                <ol className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
                    {board.map((row) => {
                        const mine = Boolean(
                            user?.user_id
                            && (
                                (row as { userId?: string }).userId === user.user_id
                                || (you?.handle && row.handle && row.handle === you.handle)
                            )
                        )
                        return (
                            <li key={`${row.rank}-${row.handle || row.displayName}`} className={cn('flex items-center justify-between gap-3 px-4 py-3', mine && 'bg-[#FF9600]/10')}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn('w-8 inline-flex justify-center', crownClass(row.crown))}>
                                        {row.crown ? <Crown className="w-4 h-4" fill="currentColor" stroke="currentColor" /> : `#${row.rank}`}
                                    </span>
                                    <StudentName
                                        handle={row.handle}
                                        displayName={row.displayName}
                                        accentColor={row.accentColor}
                                        avatarId={row.avatarId}
                                        bestCrown={row.bestCrown}
                                        crown={row.crown}
                                        following={row.following}
                                    />
                                </div>
                                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{formatPrideValue(row.value, stat?.unit)}</span>
                            </li>
                        )
                    })}
                    {board.length === 0 && !isError && (
                        <li className="px-4 py-6 text-sm font-bold text-slate-400">No public ranks yet. Completions from here on count.</li>
                    )}
                </ol>
            )}
            <CertificateStudio
                open={showCertificate}
                onOpenChange={setShowCertificate}
                payload={{
                    kind: 'pride',
                    statKey,
                    studentName,
                    boardLabel: stat?.label || 'Pride board',
                    valueLabel: formatPrideValue(you?.value, stat?.unit),
                    rank: you?.rank,
                    crown: you?.crown,
                }}
            />
        </div>
    )
}
