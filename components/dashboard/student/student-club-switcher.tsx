'use client'

import { Building2, Users } from 'lucide-react'
import { useStudentClubContext, STUDENT_PERSONAL } from '@/hooks/use-student-club'
import { cn } from '@/lib/utils'

function orgOptionLabel(name: string, cohortName?: string) {
    return cohortName ? `${name} · ${cohortName}` : name
}

type StudentClubSwitcherProps = {
    className?: string
}

export function StudentClubSwitcher({ className }: StudentClubSwitcherProps) {
    const {
        studentOrgs,
        clubMode,
        canUsePersonal,
        activeOrgId,
        setActiveOrgId,
        isLoading,
    } = useStudentClubContext()

    if (isLoading || activeOrgId === null) {
        return (
            <div
                className={cn(
                    'h-9 min-w-[9rem] rounded-xl border-2 border-slate-200 bg-slate-50 animate-pulse',
                    className,
                )}
            />
        )
    }

    if (!clubMode || studentOrgs.length === 0) {
        return null
    }

    const showPersonal = canUsePersonal
    const activeOrg = studentOrgs.find((o) => o.id === activeOrgId) || studentOrgs[0]

    if (studentOrgs.length === 1 && !showPersonal) {
        return (
            <div
                className={cn(
                    'min-h-9 px-3 py-1.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-sky-900 inline-flex items-center gap-2',
                    className,
                )}
            >
                <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <div className="min-w-0 leading-tight">
                    <p className="truncate">{studentOrgs[0].name}</p>
                    {studentOrgs[0].cohort?.name && (
                        <p className="text-[10px] font-semibold text-sky-700 truncate flex items-center gap-1">
                            <Users className="w-3 h-3 shrink-0" />
                            {studentOrgs[0].cohort.name}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <label className={cn('relative inline-flex items-center max-w-[16rem]', className)}>
            <Building2 className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 pointer-events-none z-10" />
            <select
                value={activeOrgId}
                aria-label="Active club"
                onChange={(e) => setActiveOrgId(e.target.value)}
                className="h-9 pl-8 pr-8 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-sky-900 appearance-none cursor-pointer w-full truncate"
            >
                {studentOrgs.map((org) => (
                    <option key={org.id} value={org.id}>
                        {orgOptionLabel(org.name, org.cohort?.name)}
                    </option>
                ))}
                {showPersonal && (
                    <option value={STUDENT_PERSONAL}>Personal</option>
                )}
            </select>
            {activeOrg?.cohort?.name && activeOrgId !== STUDENT_PERSONAL && (
                <span className="sr-only">Class {activeOrg.cohort.name}</span>
            )}
        </label>
    )
}
