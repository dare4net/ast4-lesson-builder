'use client'

import { useEffect, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { orgCanUse } from '@/lib/org-branding'
import {
    hasSeenClubWelcome,
    markClubWelcomeSeen,
} from '@/lib/club-welcome-storage'

type ClubWelcomeModalProps = {
    userId?: string | null
    orgId?: string | null
    orgName?: string
    welcomeMessage?: string | null
    brandingTier?: 'standard' | 'branded' | 'white_label'
    splashDone?: boolean
    enabled?: boolean
}

export function ClubWelcomeModal({
    userId,
    orgId,
    orgName,
    welcomeMessage,
    brandingTier,
    splashDone = true,
    enabled = true,
}: ClubWelcomeModalProps) {
    const [open, setOpen] = useState(false)
    const message = (welcomeMessage || '').trim()

    useEffect(() => {
        if (!enabled || !splashDone || !userId || !orgId || !message) return
        if (!orgCanUse(brandingTier, 'welcome')) return
        if (hasSeenClubWelcome(userId, orgId)) return
        setOpen(true)
    }, [enabled, splashDone, userId, orgId, message, brandingTier])

    const close = () => {
        if (userId && orgId) markClubWelcomeSeen(userId, orgId)
        setOpen(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={(next) => !next && close()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Welcome to {orgName || 'your club'}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed text-slate-600">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={close}>Let&apos;s go</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
