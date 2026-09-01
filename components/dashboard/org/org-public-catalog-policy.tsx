'use client'

import { useState } from 'react'
import { Compass, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'

export function OrgPublicCatalogPolicy() {
    const { selected, selectedId, isOwner, refreshOrg, setError } = useOrgDashboard()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    if (!selected || !isOwner) return null

    const allowed = selected.org.settings?.allowPublicOptIn !== false

    const toggle = async (next: boolean) => {
        if (!selectedId) return
        setSaving(true)
        setSaved(false)
        setError('')
        try {
            await apiClient.orgs.update(selectedId, {
                settings: { allowPublicOptIn: next },
            })
            await refreshOrg()
            setSaved(true)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Could not update club policy.'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-slate-800">Student public catalog</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Control whether club students can opt into Explore outside your programs
                    </p>
                </div>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="space-y-1">
                    <Label className="text-xs font-extrabold text-slate-700">
                        Allow public Explore opt-in
                    </Label>
                    <p className="text-[11px] text-slate-500 font-medium max-w-md">
                        When off, students in this club cannot enable public catalog access in their settings —
                        even if they joined another club that allows it.
                    </p>
                    {saved && (
                        <p className="text-[11px] font-bold text-emerald-600">Policy saved</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                    <Switch
                        checked={allowed}
                        disabled={saving}
                        onCheckedChange={(next) => void toggle(next)}
                        aria-label="Allow students to opt into public Explore"
                        className="data-[state=checked]:bg-violet-600"
                    />
                </div>
            </div>
        </section>
    )
}
