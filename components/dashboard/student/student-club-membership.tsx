'use client'

import { Building2, Users } from 'lucide-react'
import { useStudentClubContext, STUDENT_PERSONAL } from '@/hooks/use-student-club'

export function StudentClubMembershipCard() {
    const { clubMode, activeOrgId, activeStudentOrg, activeCohort, isLoading } = useStudentClubContext()

    if (isLoading || !clubMode || !activeStudentOrg || activeOrgId === STUDENT_PERSONAL) {
        return null
    }

    return (
        <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-black text-slate-800">Your club</h2>
            </div>
            <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className="font-bold text-slate-500">Club</dt>
                    <dd className="font-black text-slate-900 text-right">{activeStudentOrg.name}</dd>
                </div>
                {activeCohort ? (
                    <div className="flex justify-between gap-4">
                        <dt className="font-bold text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Class / cohort
                        </dt>
                        <dd className="font-black text-slate-900 text-right">{activeCohort.name}</dd>
                    </div>
                ) : (
                    <p className="text-[11px] font-medium text-slate-500">
                        No class assigned yet — ask your tutor for a join code.
                    </p>
                )}
            </dl>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed border-t border-sky-100 pt-3">
                To leave this club or switch class, contact your club admin. Self-serve leave is not available yet.
            </p>
        </section>
    )
}
