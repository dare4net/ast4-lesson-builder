'use client'

import { useState } from 'react'
import { Loader2, Palette } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { ORG_ACCENT_PRESETS, resolveOrgAccent } from '@/lib/org-branding'
import { cn } from '@/lib/utils'

export function OrgBrandingSettings() {
    const { selected, selectedId, isOwner, refreshOrg, setError } = useOrgDashboard()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    if (!selected || !isOwner) return null

    const slug = selected.org.slug
    const current = selected.org.settings?.accentColor || resolveOrgAccent(slug, null)

    const pickAccent = async (accentColor: string) => {
        if (!selectedId || accentColor === current) return
        setSaving(true)
        setSaved(false)
        setError('')
        try {
            await apiClient.orgs.update(selectedId, {
                settings: { accentColor },
            })
            await refreshOrg()
            setSaved(true)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Could not save club colour.'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: current }}
                >
                    <Palette className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-slate-800">Club colour</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Students see this accent on join, home, and navigation when your club is active
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {ORG_ACCENT_PRESETS.map((color) => {
                    const selectedColor = color === current
                    return (
                        <button
                            key={color}
                            type="button"
                            disabled={saving}
                            aria-label={`Use ${color}`}
                            aria-pressed={selectedColor}
                            onClick={() => void pickAccent(color)}
                            className={cn(
                                'h-10 w-10 rounded-xl border-2 transition-transform hover:scale-105 disabled:opacity-60',
                                selectedColor ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-400' : 'border-white shadow-sm',
                            )}
                            style={{ backgroundColor: color }}
                        />
                    )
                })}
                {saving && <Loader2 className="w-5 h-5 animate-spin text-slate-400 self-center" />}
            </div>

            {saved && (
                <p className="text-[11px] font-bold text-emerald-600">Club colour saved</p>
            )}

            <div
                className="rounded-xl border px-4 py-3 text-xs font-bold"
                style={{
                    borderColor: `${current}55`,
                    backgroundColor: `${current}14`,
                    color: current,
                }}
            >
                Preview — {selected.org.name}
            </div>
        </section>
    )
}
