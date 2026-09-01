'use client'

import { useState } from 'react'
import { Building2, Loader2, LogOut, Users } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api-client'
import { useStudentClubContext, STUDENT_PERSONAL } from '@/hooks/use-student-club'

export function StudentClubMembershipCard() {
    const queryClient = useQueryClient()
    const {
        clubMode,
        activeOrgId,
        activeStudentOrg,
        activeCohort,
        studentOrgs,
        setActiveOrgId,
        isLoading,
    } = useStudentClubContext()
    const [leaveOpen, setLeaveOpen] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [leaveError, setLeaveError] = useState<string | null>(null)

    if (isLoading || !clubMode || !activeStudentOrg || activeOrgId === STUDENT_PERSONAL) {
        return null
    }

    const handleLeave = async () => {
        if (!activeOrgId) return
        setLeaving(true)
        setLeaveError(null)
        try {
            await apiClient.orgs.leave(activeOrgId)
            await queryClient.invalidateQueries({ queryKey: ['student-orgs-mine'] })
            await queryClient.invalidateQueries({ queryKey: ['programs', 'mine'] })

            const remaining = studentOrgs.filter((org) => org.id !== activeOrgId)
            if (remaining[0]) {
                setActiveOrgId(remaining[0].id)
            } else {
                setActiveOrgId(STUDENT_PERSONAL)
            }
            setLeaveOpen(false)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Could not leave this club. Try again or contact your club admin.'
            setLeaveError(message)
        } finally {
            setLeaving(false)
        }
    }

    return (
        <>
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
                <div className="border-t border-sky-100 pt-3 space-y-2">
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                        To switch class, ask your club admin. You can leave this club yourself — your
                        Personal library and progress stay on your account.
                    </p>
                    {leaveError && (
                        <p className="text-[11px] font-bold text-red-600">{leaveError}</p>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={leaving}
                        onClick={() => {
                            setLeaveError(null)
                            setLeaveOpen(true)
                        }}
                        className="h-9 rounded-xl border-red-200 text-red-700 hover:bg-red-50 text-xs font-extrabold gap-1.5"
                    >
                        {leaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <LogOut className="w-3.5 h-3.5" />
                        )}
                        Leave club
                    </Button>
                </div>
            </section>

            <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave {activeStudentOrg.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be removed from this club and your class. Club-assigned courses
                            will no longer appear in your club list. Your Personal courses and progress
                            are not deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={leaving}>Stay in club</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={leaving}
                            onClick={(e) => {
                                e.preventDefault()
                                void handleLeave()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {leaving ? 'Leaving…' : 'Leave club'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
