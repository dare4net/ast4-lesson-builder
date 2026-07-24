"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import {
    User,
    Mail,
    Shield,
    Bell,
    Monitor,
    Key,
    Save,
    LogOut,
    Eye,
    EyeOff,
    Loader2,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function TutorSettingsPage() {
    const { user, logout } = useAuth()
    const [name, setName] = useState(user?.role || "Director")
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setTimeout(() => setSaving(false), 1500)
    }

    return (
        <div className="max-w-4xl space-y-10">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-indigo-500 rounded-full shadow-[0_0_8px_indigo]" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Sector Protocol</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">IDENTITY <span className="text-indigo-500">SETTINGS</span></h1>
                <p className="text-slate-500 font-medium tracking-wide">
                    Configure your director profile and terminal preferences for optimal sector oversight.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <Card className="md:col-span-1 p-8 bg-slate-900/40 border-slate-800 rounded-[2rem] flex flex-col items-center gap-6 h-fit sticky top-24 backdrop-blur-xl">
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-2 border-indigo-500/20 ring-8 ring-indigo-500/5 shadow-2xl transition-all group-hover:border-indigo-500/50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                            <AvatarFallback className="bg-slate-950 text-2xl font-black text-indigo-500">
                                {user?.role?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Seed</span>
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">
                            {user?.role?.toUpperCase() || 'DIRECTOR'}
                        </h2>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Command Hub: Emerald Alpha</span>
                    </div>

                    <div className="w-full h-px bg-slate-800" />

                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 group">
                            <Shield className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Level 7 Access</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 group">
                            <Key className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Hardware Key Linked</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="w-full mt-4 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-black uppercase text-[10px] tracking-widest"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Terminate Session
                    </Button>
                </Card>

                {/* Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8 bg-slate-900/40 border-slate-800 rounded-[2.5rem] shadow-2xl backdrop-blur-xl group hover:border-indigo-500/20 transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Director Profile</h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Identity</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 bg-slate-950/50 border-slate-800 rounded-xl focus-visible:ring-indigo-500/50 text-white font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Command Core ID</Label>
                                    <Input
                                        value={user?.email || ""}
                                        disabled
                                        className="h-12 bg-slate-950/80 border-slate-800 rounded-xl text-slate-500 font-bold opacity-60 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sector Keycode</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value="••••••••••••"
                                        disabled
                                        className="h-12 bg-slate-950/80 border-slate-800 rounded-xl text-slate-500 font-bold pr-12"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                        <Button variant="link" className="text-indigo-500 text-[10px] font-black uppercase p-0">Change</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end">
                                <Button
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/20 group"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    )}
                                    {saving ? 'SYNCING...' : 'SYNCHRONIZE PROFILE'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-slate-900/40 border-slate-800 rounded-[2rem] group hover:border-blue-500/30 transition-all cursor-pointer backdrop-blur-xl">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Pulse Alerts</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical Only</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-slate-900/40 border-slate-800 rounded-[2rem] group hover:border-indigo-500/30 transition-all cursor-pointer backdrop-blur-xl">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Studio UI</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High Definition</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
