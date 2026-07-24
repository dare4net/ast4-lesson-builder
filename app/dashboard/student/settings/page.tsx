"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Settings as SettingsIcon, User, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
    const { user } = useAuth()
    const [name, setName] = useState(user?.email?.split('@')[0] || "")
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
                    <SettingsIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">Account Preferences</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Account Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Manage your personal profile and account details.
                </p>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-6 shadow-sm">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-16 w-16 border-2 border-green-500/20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                            <AvatarFallback className="bg-green-50 text-green-600 font-bold text-lg">
                                {user?.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                                {name || 'Student Account'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                Role: {user?.role || 'student'}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                            <Input
                                value={user?.email || ""}
                                disabled
                                className="rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs h-10 border-slate-200 dark:border-slate-700"
                            />
                            <p className="text-[11px] text-slate-400">Email address cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your display name"
                                className="rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        {saved && (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Changes saved successfully!
                            </span>
                        )}
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-xl h-10 px-6 ml-auto shadow-sm flex items-center gap-2"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save Changes
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    )
}
