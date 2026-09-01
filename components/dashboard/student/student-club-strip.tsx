'use client'

import { Building2, Users } from 'lucide-react'
import { useStudentClubContext, STUDENT_PERSONAL } from '@/hooks/use-student-club'
import { orgCanUse } from '@/lib/org-branding'
import { clubLensLabel } from '@/lib/pride-scope-copy'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { cn } from '@/lib/utils'

type StudentClubStripProps = {
    prideScopeType?: string
}

export function StudentClubStrip({ prideScopeType }: StudentClubStripProps) {
    const { clubMode, activeOrgId, activeStudentOrg, activeCohort, isLoading } = useStudentClubContext()

    if (isLoading || !clubMode || !activeStudentOrg || activeOrgId === STUDENT_PERSONAL) {
        return null
    }

    const branding = activeStudentOrg.branding
    const tier = branding?.brandingTier || 'standard'
    const showBranded = orgCanUse(tier, 'logo')
    const hasBanner = showBranded && Boolean(branding?.bannerUrl)
    const label = prideScopeType === 'cohort' ? 'Your class' : clubLensLabel(prideScopeType || 'org')

    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-2xl border-2 min-h-[7.5rem]',
                !hasBanner && 'border-[color:var(--club-accent-border,rgb(186_230_253))]',
            )}
            style={
                hasBanner
                    ? undefined
                    : { backgroundColor: 'var(--club-accent-muted, rgb(240 249 255))' }
            }
        >
            {hasBanner && branding?.bannerUrl && (
                <>
                    <OptimizedImage
                        src={branding.bannerUrl}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(105deg, color-mix(in srgb, var(--club-accent, #0ea5e9) 88%, transparent) 0%, color-mix(in srgb, var(--club-accent, #0ea5e9) 62%, #0f172a) 48%, rgba(15, 23, 42, 0.55) 100%)`,
                        }}
                    />
                </>
            )}

            <div className="relative z-10 px-4 py-4 flex flex-wrap items-center gap-3">
                {showBranded && branding?.logoUrl ? (
                    <div
                        className={cn(
                            'w-11 h-11 rounded-xl overflow-hidden shrink-0 ring-2 shadow-md',
                            hasBanner ? 'ring-white/40' : 'ring-white border-2 border-white',
                        )}
                    >
                        <OptimizedImage
                            src={branding.logoUrl}
                            alt=""
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                        style={{ backgroundColor: 'var(--club-accent, #0ea5e9)' }}
                    >
                        <Building2 className="w-4 h-4" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p
                        className={cn(
                            'text-[10px] font-black uppercase tracking-widest',
                            hasBanner ? 'text-white/80' : 'text-slate-500',
                        )}
                    >
                        {label}
                    </p>
                    <p
                        className={cn(
                            'text-base font-black truncate',
                            hasBanner ? 'text-white' : 'text-slate-900',
                        )}
                    >
                        {activeStudentOrg.name}
                    </p>
                    {activeCohort && (
                        <p
                            className={cn(
                                'text-[11px] font-bold flex items-center gap-1 truncate',
                                hasBanner ? 'text-white/90' : 'text-slate-600',
                            )}
                        >
                            <Users className="w-3 h-3 shrink-0" />
                            {activeCohort.name}
                        </p>
                    )}
                    {showBranded && branding?.welcomeMessage && (
                        <p
                            className={cn(
                                'text-xs font-medium mt-1 line-clamp-2 max-w-xl',
                                hasBanner ? 'text-white/85' : 'text-slate-600',
                            )}
                        >
                            {branding.welcomeMessage}
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}
