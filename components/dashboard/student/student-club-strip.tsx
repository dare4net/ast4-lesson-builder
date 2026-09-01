'use client'

import { Building2, Users } from 'lucide-react'
import { useStudentClubContext, STUDENT_PERSONAL } from '@/hooks/use-student-club'

export function StudentClubStrip() {
    const { clubMode, activeOrgId, activeStudentOrg, activeCohort, isLoading } = useStudentClubContext()

    if (isLoading || !clubMode || !activeStudentOrg || activeOrgId === STUDENT_PERSONAL) {
        return null
    }

    return (
        <section
            className="rounded-2xl border-2 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{
                borderColor: 'var(--club-accent-border, rgb(186 230 253))',
                backgroundColor: 'var(--club-accent-muted, rgb(240 249 255))',
            }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: 'var(--club-accent, #0ea5e9)' }}
                >
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Your club
                    </p>
                    <p className="text-sm font-black text-slate-900 truncate">{activeStudentOrg.name}</p>
                    {activeCohort && (
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1 truncate">
                            <Users className="w-3 h-3 shrink-0" />
                            {activeCohort.name}
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}
