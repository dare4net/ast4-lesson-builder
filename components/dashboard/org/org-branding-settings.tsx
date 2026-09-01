'use client'

import { useRef, useState, useEffect } from 'react'
import { ImagePlus, Loader2, Palette, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import {
    ORG_ACCENT_PRESETS,
    orgCanUse,
    resolveOrgAccent,
    type OrgBrandingTier,
} from '@/lib/org-branding'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { OrgPlanUpgradeCard } from '@/components/dashboard/org/org-plan-summary'
import { clubPlanLabel } from '@/lib/club-plans'

async function uploadBrandingImage(orgId: string, kind: 'logo' | 'banner' | 'favicon', file: File) {
    const form = new FormData()
    form.append('file', file)
    form.append('orgId', orgId)
    form.append('kind', kind)
    const res = await fetch('/api/org-branding/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Upload failed')
    return data.url as string
}

export function OrgBrandingSettings() {
    const { selected, selectedId, isOwner, refreshOrg, setError } = useOrgDashboard()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [welcomeDraft, setWelcomeDraft] = useState('')
    const [localError, setLocalError] = useState('')
    const logoInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    const slug = selected?.org.slug
    const settings = selected?.org.settings || {}
    const tier = (settings.brandingTier || 'standard') as OrgBrandingTier
    const current = settings.accentColor || resolveOrgAccent(slug, null)
    const canBrand = orgCanUse(tier, 'logo')
    const canPrideScope = orgCanUse(tier, 'prideScope')
    const canWhiteLabel = orgCanUse(tier, 'joinLayout')

    useEffect(() => {
        setWelcomeDraft(settings.welcomeMessage || '')
    }, [selectedId, settings.welcomeMessage])

    if (!selected || !isOwner) return null

    const saveSettings = async (patch: Record<string, unknown>) => {
        if (!selectedId) return
        setSaving(true)
        setSaved(false)
        setError('')
        setLocalError('')
        try {
            await apiClient.orgs.update(selectedId, { settings: patch })
            await refreshOrg()
            setSaved(true)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Could not save branding.'
            setError(message)
            setLocalError(message)
        } finally {
            setSaving(false)
        }
    }

    const pickAccent = async (accentColor: string) => {
        if (accentColor === current) return
        await saveSettings({ accentColor })
    }

    const saveWelcome = async () => {
        const welcomeMessage = welcomeDraft.trim() || null
        if (welcomeMessage === (settings.welcomeMessage || '')) return
        await saveSettings({ welcomeMessage })
    }

    const savePrideScope = async (prideScope: 'cohort' | 'org') => {
        if (prideScope === settings.prideScope) return
        await saveSettings({ prideScope })
    }

    const saveJoinLayout = async (joinLayout: 'standard' | 'hero') => {
        if (joinLayout === (settings.joinLayout || 'standard')) return
        await saveSettings({ joinLayout })
    }

    const onImagePick = async (kind: 'logo' | 'banner' | 'favicon', file: File | null) => {
        if (!file || !selectedId) return
        setSaving(true)
        setError('')
        setLocalError('')
        try {
            const url = await uploadBrandingImage(selectedId, kind, file)
            const key =
                kind === 'logo' ? 'logoUrl' : kind === 'banner' ? 'bannerUrl' : 'faviconUrl'
            await saveSettings({ [key]: url })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not upload image.'
            setError(message)
            setLocalError(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-500">
                Branding on <span className="text-slate-800">{clubPlanLabel(null, tier)}</span> plan
            </p>
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

            {canBrand ? (
                <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800">Branded club profile</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Logo, banner, and welcome message on student home and join
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logo</p>
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl border-2 border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
                                    {settings.logoUrl ? (
                                        <OptimizedImage src={settings.logoUrl} alt="" width={56} height={56} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImagePlus className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => logoInputRef.current?.click()}
                                    className="h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold"
                                >
                                    Upload logo
                                </button>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => void onImagePick('logo', e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Banner</p>
                            <div className="rounded-xl border-2 border-slate-100 bg-slate-50 h-20 overflow-hidden relative">
                                {settings.bannerUrl ? (
                                    <OptimizedImage src={settings.bannerUrl} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                        No banner yet
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => bannerInputRef.current?.click()}
                                className="h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold"
                            >
                                Upload banner
                            </button>
                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => void onImagePick('banner', e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="welcome-message" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Welcome message
                        </label>
                        <textarea
                            id="welcome-message"
                            rows={2}
                            maxLength={240}
                            value={welcomeDraft}
                            onChange={(e) => setWelcomeDraft(e.target.value)}
                            placeholder="Welcome to Riverside Robotics Club!"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium min-h-[4.5rem]"
                        />
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => void saveWelcome()}
                            className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-60"
                        >
                            Save welcome message
                        </button>
                    </div>

                    {canPrideScope && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Pride & leaderboards
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                Choose whether students compete with their whole club or just their class.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(['org', 'cohort'] as const).map((scope) => {
                                    const active = (settings.prideScope || 'org') === scope
                                    return (
                                        <button
                                            key={scope}
                                            type="button"
                                            disabled={saving}
                                            onClick={() => void savePrideScope(scope)}
                                            className={cn(
                                                'h-9 px-4 rounded-xl border-2 text-xs font-bold',
                                                active
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : 'border-slate-200 text-slate-600',
                                            )}
                                        >
                                            {scope === 'org' ? 'Whole club' : 'My class only'}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            ) : (
                <OrgPlanUpgradeCard orgName={selected.org.name} targetTier="branded" />
            )}

            {canWhiteLabel ? (
                <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-black text-slate-800">White-label experience</h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Hero join page, custom favicon on your vanity subdomain, and first-visit splash for students
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Join page layout</p>
                        <div className="flex flex-wrap gap-2">
                            {(['standard', 'hero'] as const).map((layout) => {
                                const active = (settings.joinLayout || 'standard') === layout
                                return (
                                    <button
                                        key={layout}
                                        type="button"
                                        disabled={saving}
                                        onClick={() => void saveJoinLayout(layout)}
                                        className={cn(
                                            'h-9 px-4 rounded-xl border-2 text-xs font-bold capitalize',
                                            active
                                                ? 'border-slate-900 bg-slate-900 text-white'
                                                : 'border-slate-200 text-slate-600',
                                        )}
                                    >
                                        {layout}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                            Hero uses your banner as a full-width header on join links.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Favicon</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border-2 border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
                                {settings.faviconUrl ? (
                                    <OptimizedImage src={settings.faviconUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <ImagePlus className="w-4 h-4 text-slate-300" />
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => faviconInputRef.current?.click()}
                                className="h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold"
                            >
                                Upload favicon
                            </button>
                            <input
                                ref={faviconInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => void onImagePick('favicon', e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                </section>
            ) : (
                <OrgPlanUpgradeCard orgName={selected.org.name} targetTier="white_label" />
            )}

            {localError && (
                <p className="text-[11px] font-bold text-red-600">{localError}</p>
            )}

            {saved && (
                <p className="text-[11px] font-bold text-emerald-600">Branding saved</p>
            )}
        </div>
    )
}
