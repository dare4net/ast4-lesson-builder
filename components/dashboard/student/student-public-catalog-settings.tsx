'use client'

import { useEffect, useState } from 'react'
import { Compass, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { useStudentClubContext } from '@/hooks/use-student-club'

export function StudentPublicCatalogSettings() {
    const queryClient = useQueryClient()
    const { clubMode, publicAccess, isLoading } = useStudentClubContext()
    const [enabled, setEnabled] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            setEnabled(publicAccess)
        }
    }, [isLoading, publicAccess])

    if (isLoading || !clubMode) {
        return null
    }

    const handleToggle = async (next: boolean) => {
        setSaving(true)
        setError(null)
        setSaved(false)
        const previous = enabled
        setEnabled(next)
        try {
            await apiClient.profile.updatePublicAccess(next)
            await queryClient.invalidateQueries({ queryKey: ['student-orgs-mine'] })
            setSaved(true)
        } catch (err: unknown) {
            setEnabled(previous)
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Could not update catalog access.'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-extrabold text-slate-800">Public catalog</h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Explore courses outside your club on the same account
                    </p>
                </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
                <div className="space-y-1">
                    <Label className="text-xs font-extrabold text-slate-700">
                        Allow public Explore
                    </Label>
                    <p className="text-[11px] text-slate-500 font-medium max-w-md">
                        Off by default for club students. When on, you can browse the public catalog and
                        enroll in courses outside your club programs.
                    </p>
                    {saved && !error && (
                        <p className="text-[11px] font-bold text-[#58CC02]">Setting saved</p>
                    )}
                    {error && (
                        <p className="text-[11px] font-bold text-red-600">{error}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                    <Switch
                        checked={enabled}
                        disabled={saving}
                        onCheckedChange={(next) => void handleToggle(next)}
                        aria-label="Allow public Explore catalog"
                        className="data-[state=checked]:bg-violet-600"
                    />
                </div>
            </div>
        </Card>
    )
}
