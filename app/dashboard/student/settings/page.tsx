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
    Volume2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedbackSettings } from "@/components/ui/feedback-settings"
import { apiClient } from "@/lib/api-client"

export default function SettingsPage() {
    const { user, logout, updateUser } = useAuth()
    const defaultDisplayName = user?.full_name || user?.fullName || (user?.email ? user.email.split("@")[0] : "Student")
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
        <div className="max-w-4xl space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-sm text-slate-500 font-medium">
                    Your name, plus how lessons sound and move on this device.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-5">
                <Card className="md:col-span-1 p-6 bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center gap-4 h-fit shadow-sm">
                    <Avatar className="h-24 w-24 border-4 border-[#1CB0F6]/20 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                        <AvatarFallback className="bg-[#1CB0F6]/10 text-2xl font-extrabold text-[#1CB0F6]">
                            {name[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center space-y-1 min-w-0 w-full">
                        <h2 className="text-lg font-extrabold text-slate-800 capitalize truncate">{name}</h2>
                        <span className="text-[11px] font-extrabold text-[#1CB0F6] bg-[#1CB0F6]/10 px-2.5 py-0.5 rounded-full border border-[#1CB0F6]/20 inline-block">
                            Student
                        </span>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <p className="w-full text-xs font-semibold text-slate-500 flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                        <span className="truncate">{user?.email}</span>
                    </p>
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
                                        Name saved
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
                                    Save name
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
                </div>
            </div>
        </div>
    )
}
