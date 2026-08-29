"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
    User,
    Mail,
    Save,
    LogOut,
    CheckCircle2,
    Loader2,
    Settings as SettingsIcon
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api-client"

export default function TutorSettingsPage() {
    const { user, logout, updateUser } = useAuth()
    const defaultDisplayName = user?.full_name || user?.fullName || (user?.email ? user.email.split('@')[0] : "Instructor")
    const [name, setName] = useState(defaultDisplayName)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const fullName = name.trim()
        if (!fullName) {
            setError("Display name is required.")
            return
        }
        setSaving(true)
        setError(null)
        setSaved(false)
        try {
            await apiClient.profile.update({ full_name: fullName })
            updateUser({ full_name: fullName, fullName: fullName })
            setSaved(true)
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Could not save profile.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl space-y-8">
            {/* Header */}
            <header className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#58CC02]/20 bg-[#58CC02]/10 w-fit">
                    <SettingsIcon className="w-3.5 h-3.5 text-[#58CC02]" />
                    <span className="text-xs font-bold text-[#58CC02]">Instructor Preferences</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 font-medium text-sm">
                    Manage your instructor profile, notification preferences, and workspace access.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 p-6 bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center gap-5 h-fit shadow-sm">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-[#58CC02]/20 shadow-md">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                            <AvatarFallback className="bg-[#58CC02]/10 text-2xl font-extrabold text-[#58CC02]">
                                {name[0]?.toUpperCase() || 'T'}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-lg font-extrabold text-slate-800 capitalize">
                            {name}
                        </h2>
                        <span className="text-xs font-bold text-[#58CC02] bg-[#58CC02]/10 px-3 py-0.5 rounded-full border border-[#58CC02]/20 inline-block capitalize">
                            {user?.role || 'Tutor'} Account
                        </span>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    <div className="w-full space-y-3 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-[#1CB0F6]" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out of Account
                    </button>
                </Card>

                {/* Settings Form */}
                <div className="md:col-span-2 space-y-5">
                    <Card className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2.5 rounded-xl bg-[#58CC02]/10 text-[#58CC02]">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">Profile Information</h3>
                                <p className="text-xs text-slate-400 font-medium">Update your public name and credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Display Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your display name"
                                    className="h-11 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#58CC02] focus:bg-white text-slate-800 font-semibold text-sm transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Email Address (Locked)</Label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="h-11 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-400 font-medium text-sm cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                {saved ? (
                                    <span className="text-xs font-bold text-[#58CC02] flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Profile updated
                                    </span>
                                ) : error ? (
                                    <span className="text-xs font-bold text-red-600">{error}</span>
                                ) : <span />}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                                    style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                                >
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4" />Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
