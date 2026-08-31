"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
    User,
    Mail,
    Save,
    LogOut,
    CheckCircle2,
    Loader2,
    Volume2,
    AtSign,
    Globe,
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FeedbackSettings } from "@/components/ui/feedback-settings"
import { PushNotificationsSettings } from "@/components/notifications/push-notifications-settings"
import { HandleAvatar } from "@/components/pride/handle-avatar"
import { apiClient } from "@/lib/api-client"
import { AVATAR_IDS, resolveAvatarId } from "@/lib/avatar"
import { handleSchema } from "@/lib/contracts"
import { ACCENT_COLORS, PREMIUM_ACCENT_COLORS, resolveAccentColor } from "@/lib/pride-format"
import { publicProfilePath } from "@/lib/pride-paths"
import { queryKeys } from "@/lib/query-keys"
import { useQuery } from "@tanstack/react-query"

export default function SettingsPage() {
    const { user, logout, updateUser } = useAuth()
    const storeQuery = useQuery({ queryKey: queryKeys.store, queryFn: () => apiClient.store.get() })
    const prideQuery = useQuery({ queryKey: queryKeys.prideSummary, queryFn: () => apiClient.pride.summary() })
    const owned = (sku: string) => Number(storeQuery.data?.inventory?.items?.[sku]?.charges) > 0
    const pinOptions = Array.isArray(prideQuery.data?.stats) ? prideQuery.data.stats : []
    const defaultDisplayName = user?.full_name || user?.fullName || (user?.email ? user.email.split("@")[0] : "Student")
    const [name, setName] = useState(defaultDisplayName)
    const [handle, setHandle] = useState(user?.handle || "")
    const [isPublic, setIsPublic] = useState(user?.isPublicProfile === true)
    const [accentColor, setAccentColor] = useState<string | null>(user?.accentColor || null)
    const [avatarId, setAvatarId] = useState<string | null>(user?.avatarId || null)
    const [avatarFrame, setAvatarFrame] = useState<string>(user?.avatarFrame || '')
    const [nameplate, setNameplate] = useState<string>(user?.nameplate || '')
    const [pinnedStatKey, setPinnedStatKey] = useState<string>(user?.pinnedStatKey || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        apiClient.profile.get().then((profile) => {
            if (cancelled || !profile) return
            const nextHandle = profile.handle || ""
            const nextPublic = profile.isPublicProfile === true
            if (profile.full_name) setName(profile.full_name)
            setHandle(nextHandle)
            setIsPublic(nextPublic)
            setAccentColor(profile.accentColor || null)
            setAvatarId(profile.avatarId || null)
            setAvatarFrame(profile.avatarFrame || '')
            setNameplate(profile.nameplate || '')
            setPinnedStatKey(profile.pinnedStatKey || '')
            updateUser({
                full_name: profile.full_name,
                fullName: profile.full_name,
                handle: profile.handle || null,
                isPublicProfile: nextPublic,
                accentColor: profile.accentColor || null,
                avatarId: profile.avatarId || null,
                avatarFrame: profile.avatarFrame || null,
                nameplate: profile.nameplate || null,
                pinnedStatKey: profile.pinnedStatKey || null,
            })
        }).catch(() => {})
        return () => {
            cancelled = true
        }
        // Hydrate once from the live profile document.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const fullName = name.trim()
        const nextHandle = handle.trim().toLowerCase()
        if (!fullName) {
            setError("Display name is required.")
            return
        }
        if (nextHandle) {
            const parsed = handleSchema.safeParse(nextHandle)
            if (!parsed.success) {
                setError("Use 3–24 characters: start with a letter, then letters, numbers, or _")
                return
            }
        }
        if (isPublic && !nextHandle) {
            setError("Choose a handle before making your profile public.")
            return
        }
        setSaving(true)
        setError(null)
        setSaved(false)
        try {
            const payload: { full_name: string; handle?: string; isPublicProfile: boolean; accentColor?: string; avatarId?: string; avatarFrame?: 'gold' | ''; nameplate?: 'duo' | ''; pinnedStatKey?: string | null } = {
                full_name: fullName,
                isPublicProfile: isPublic && Boolean(nextHandle),
                avatarFrame: avatarFrame === 'gold' ? 'gold' : '',
                nameplate: nameplate === 'duo' ? 'duo' : '',
                pinnedStatKey: pinnedStatKey || null,
            }
            if (nextHandle) payload.handle = nextHandle
            if (accentColor) payload.accentColor = accentColor
            if (avatarId) payload.avatarId = avatarId
            const result = await apiClient.profile.update(payload)
            updateUser({
                full_name: fullName,
                fullName: fullName,
                handle: result.handle ?? nextHandle ?? null,
                isPublicProfile: result.isPublicProfile === true,
                accentColor: result.accentColor ?? accentColor,
                avatarId: result.avatarId ?? avatarId,
                avatarFrame: result.avatarFrame ?? avatarFrame,
                nameplate: result.nameplate ?? nameplate,
                pinnedStatKey: (result.pinnedStatKey ?? pinnedStatKey) || null,
            })
            setIsPublic(result.isPublicProfile === true)
            if (result.handle) setHandle(result.handle)
            setSaved(true)
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Could not save profile.")
        } finally {
            setSaving(false)
        }
    }

    const canGoPublic = Boolean(handle.trim())

    return (
        <div className="max-w-4xl space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-sm text-slate-500 font-medium">
                    Your name, plus how lessons sound and move on this device.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-5">
                <Card className="md:col-span-1 p-6 bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center gap-4 h-fit shadow-sm">
                    <HandleAvatar
                        handle={handle || user?.user_id}
                        avatarId={avatarId}
                        displayName={name}
                        accentColor={accentColor}
                        avatarFrame={avatarFrame}
                        className="h-24 w-24 border-[#1CB0F6]/20 shadow-sm"
                        fallbackClassName="text-2xl"
                    />
                    <div className="text-center space-y-1 min-w-0 w-full">
                        <h2 className="text-lg font-extrabold text-slate-800 capitalize truncate">{name}</h2>
                        {handle ? (
                            <p className="text-xs font-bold text-slate-400 truncate">@{handle}</p>
                        ) : null}
                        <span className="text-[11px] font-extrabold text-[#1CB0F6] bg-[#1CB0F6]/10 px-2.5 py-0.5 rounded-full border border-[#1CB0F6]/20 inline-block">
                            Student
                        </span>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <p className="w-full text-xs font-semibold text-slate-500 flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                        <span className="truncate">{user?.email}</span>
                    </p>
                    <Link
                        href="/onboarding?replay=1"
                        className="w-full min-h-11 py-2.5 px-4 rounded-xl font-bold text-xs text-[#58CC02] bg-[#58CC02]/10 hover:bg-[#58CC02]/15 border-2 border-[#58CC02]/30 transition-colors flex items-center justify-center"
                    >
                        Replay intro
                    </Link>
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full min-h-11 py-2.5 px-4 rounded-xl font-bold text-xs text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                    </button>
                </Card>

                <div className="md:col-span-2 space-y-5">
                    <Card className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                            <div className="w-11 h-11 rounded-xl bg-[#1CB0F6]/10 text-[#1CB0F6] flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">Profile</h3>
                                <p className="text-xs text-slate-500 font-medium">Shown on leaderboards and your courses</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-extrabold text-slate-700">Display name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your display name"
                                    className="h-11 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#1CB0F6] focus:bg-white text-slate-800 font-semibold text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                                    <AtSign className="w-3.5 h-3.5" />
                                    Handle
                                </Label>
                                <Input
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24))}
                                    placeholder="maya_codes"
                                    autoComplete="off"
                                    className="h-11 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#1CB0F6] focus:bg-white text-slate-800 font-semibold text-sm"
                                />
                                <p className="text-[11px] text-slate-400 font-medium">
                                    3–24 characters. This is how people find you. Email stays private.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-extrabold text-slate-700">Choose your avatar</Label>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    This face shows on your handle, search, pride boards, and public profile.
                                </p>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                    {AVATAR_IDS.map((id) => {
                                        const current = resolveAvatarId(handle || user?.user_id, avatarId)
                                        const selected = current === id
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                aria-label={`Choose ${id} avatar`}
                                                aria-pressed={selected}
                                                onClick={() => setAvatarId(id)}
                                                className="rounded-full p-0.5"
                                                style={{
                                                    boxShadow: selected ? `0 0 0 2px ${resolveAccentColor(handle, accentColor)}` : undefined,
                                                }}
                                            >
                                                <HandleAvatar
                                                    handle={id}
                                                    avatarId={id}
                                                    displayName={id}
                                                    className="h-10 w-10"
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-extrabold text-slate-700">Handle color</Label>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Follow buttons and your @handle use this. If you skip it, we pick one from your handle so not everyone is the same.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ACCENT_COLORS.map((color) => {
                                        const current = resolveAccentColor(handle, accentColor)
                                        const selected = current === color
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                aria-label={`Choose ${color}`}
                                                onClick={() => setAccentColor(color)}
                                                className="h-9 w-9 rounded-full border-2"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: selected ? '#0f172a' : 'transparent',
                                                    boxShadow: selected ? `0 0 0 2px ${color}` : undefined,
                                                }}
                                            />
                                        )
                                    })}
                                    {PREMIUM_ACCENT_COLORS.map((color) => {
                                        const locked = !owned('accent_pack')
                                        const selected = accentColor === color
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                aria-label={locked ? 'Buy the accent pack first' : `Choose ${color}`}
                                                disabled={locked}
                                                onClick={() => setAccentColor(color)}
                                                className="h-9 w-9 rounded-full border-2 disabled:opacity-40"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: selected ? '#0f172a' : 'transparent',
                                                    boxShadow: selected ? `0 0 0 2px ${color}` : undefined,
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                                {!owned('accent_pack') ? (
                                    <p className="text-[11px] font-medium text-slate-400">Extra colors unlock with the Accent Pack in the store.</p>
                                ) : null}
                            </div>
                            <div className="space-y-2 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
                                <Label className="text-xs font-extrabold text-slate-700">Cosmetics</Label>
                                <label className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                                    Gold frame
                                    <Switch
                                        checked={avatarFrame === 'gold'}
                                        disabled={!owned('avatar_frame')}
                                        onCheckedChange={(on) => setAvatarFrame(on ? 'gold' : '')}
                                        className="data-[state=checked]:bg-[#FFD700]"
                                    />
                                </label>
                                <label className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                                    Duo nameplate
                                    <Switch
                                        checked={nameplate === 'duo'}
                                        disabled={!owned('nameplate')}
                                        onCheckedChange={(on) => setNameplate(on ? 'duo' : '')}
                                        className="data-[state=checked]:bg-[#58CC02]"
                                    />
                                </label>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-500">Pinned pride stat</p>
                                    <select
                                        value={pinnedStatKey}
                                        disabled={!owned('pride_pin')}
                                        onChange={(event) => setPinnedStatKey(event.target.value)}
                                        className="h-10 w-full px-3 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 disabled:opacity-50"
                                    >
                                        <option value="">None</option>
                                        {pinOptions.map((stat: { key: string; label: string }) => (
                                            <option key={stat.key} value={stat.key}>{stat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5" />
                                        Make my profile public
                                    </Label>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Off by default. Public pages never show your email.
                                    </p>
                                    {canGoPublic ? (
                                        <Link
                                            href={publicProfilePath(handle)}
                                            className="text-[11px] font-bold"
                                            style={{ color: resolveAccentColor(handle, accentColor) }}
                                        >
                                            Preview your public profile
                                        </Link>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-400">
                                            Pick a handle first.
                                        </p>
                                    )}
                                </div>
                                <Switch
                                    checked={isPublic && canGoPublic}
                                    disabled={!canGoPublic}
                                    onCheckedChange={setIsPublic}
                                    aria-label="Make my profile public"
                                    className="data-[state=checked]:bg-[#58CC02]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-extrabold text-slate-700">Email</Label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="h-11 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-400 font-medium text-sm cursor-not-allowed"
                                />
                                <p className="text-[11px] text-slate-400 font-medium">Email is managed by your account administrator.</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                                {saved ? (
                                    <span className="text-xs font-bold text-[#58CC02] flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Profile saved
                                    </span>
                                ) : error ? (
                                    <span className="text-xs font-bold text-red-600">{error}</span>
                                ) : <span />}
                                <Button
                                    type="submit"
                                    variant="duo"
                                    disabled={saving}
                                    className="ml-auto bg-[#1CB0F6] hover:bg-[#1899D6] border-[#1CB0F6] border-b-[#1482B8]"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save profile
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                            <div className="w-11 h-11 rounded-xl bg-[#58CC02]/10 text-[#58CC02] flex items-center justify-center">
                                <Volume2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">Learning</h3>
                                <p className="text-xs text-slate-500 font-medium">Sound, volume, and motion while you work through lessons</p>
                            </div>
                        </div>
                        <FeedbackSettings showIntro={false} />
                    </Card>

                    <PushNotificationsSettings />
                </div>
            </div>
        </div>
    )
}
