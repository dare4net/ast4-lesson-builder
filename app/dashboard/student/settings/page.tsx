"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Settings as SettingsIcon, User, Save, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
    const { user } = useAuth()
    const defaultDisplayName = user?.email ? user.email.split('@')[0] : "Student"
    const [name, setName] = useState(defaultDisplayName)
    const [saved, setSaved] = useState(false)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1CB0F6]/20 bg-[#1CB0F6]/10 w-fit">
                    <SettingsIcon className="w-3.5 h-3.5 text-[#1CB0F6]" />
                    <span className="text-xs font-bold text-[#1CB0F6]">Account Preferences</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    Account Settings
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Manage your profile details and preferences.
                </p>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-7 rounded-3xl border-2 border-slate-200 bg-white space-y-6 shadow-sm">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-20 w-20 border-4 border-[#1CB0F6]/20 shadow-md">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                            <AvatarFallback className="bg-[#1CB0F6]/10 text-[#1CB0F6] font-extrabold text-xl">
                                {name[0]?.toUpperCase() || 'S'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-lg font-extrabold text-slate-800 capitalize">
                                {name}
                            </h3>
                            <span className="text-xs font-bold text-[#1CB0F6] bg-[#1CB0F6]/10 px-3 py-0.5 rounded-full border border-[#1CB0F6]/20 inline-block capitalize">
                                Student Account
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                            <Input
                                value={user?.email || ""}
                                disabled
                                className="h-11 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-400 font-medium text-sm cursor-not-allowed"
                            />
                            <p className="text-[11px] text-slate-400 font-medium">Email address is managed by your account administrator.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Display Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your display name"
                                className="h-11 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#1CB0F6] focus:bg-white text-slate-800 font-semibold text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {saved ? (
                            <span className="text-xs font-bold text-[#1CB0F6] flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Changes saved successfully!
                            </span>
                        ) : <span />}
                        <button
                            type="submit"
                            className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px] ml-auto"
                            style={{ backgroundColor: '#1CB0F6', borderColor: '#1899D6' }}
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    )
}
