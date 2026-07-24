"use client"

import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import { User, LogOut, Settings, Bell, Search, Hexagon, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
    const { user, logout } = useAuth()
    const isTutor = user?.role === 'tutor'
    const accentColor = isTutor ? 'indigo' : 'emerald'
    const accentClass = isTutor ? 'text-indigo-500' : 'text-emerald-500'
    const borderClass = isTutor ? 'border-indigo-500/10' : 'border-emerald-500/10'
    const bgAccentClass = isTutor ? 'bg-indigo-500/5' : 'bg-emerald-500/5'
    const shadowClass = isTutor ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
    const ringClass = isTutor ? 'ring-indigo-500/5' : 'ring-emerald-500/5'

    return (
        <header className={cn("fixed top-0 inset-x-0 z-50 bg-slate-950/40 backdrop-blur-2xl border-b", borderClass)}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                {/* Brand/Role Identity */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="relative group">
                        <div className={cn("w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center transition-all",
                            isTutor ? "border-indigo-500/30 group-hover:border-indigo-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-emerald-500/30 group-hover:border-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        )}>
                            <Zap className={cn("w-6 h-6 animate-pulse", accentClass)} />
                        </div>
                        <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950",
                            isTutor ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )} />
                    </Link>

                    <div className="hidden sm:flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black tracking-tight uppercase text-sm transform scale-y-110">After-School</span>
                            <div className="h-3 w-px bg-slate-800" />
                            <span className={cn("font-bold uppercase text-[10px] tracking-[0.3em]", accentClass)}>
                                {isTutor ? 'STUDIO' : 'ACADEMY'}
                            </span>
                        </div>
                        {user && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Hexagon className={cn("w-3 h-3 opacity-50", accentClass)} />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                    Sector: <span className={isTutor ? "text-indigo-400" : "text-emerald-400"}>{user.role}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar - Control Center Style */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full group">
                        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors",
                            isTutor ? "group-focus-within:text-indigo-500" : "group-focus-within:text-emerald-500"
                        )}>
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH TERMINAL..."
                            className={cn("w-full h-10 bg-slate-900/50 border border-slate-800 rounded-full pl-11 pr-4 text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none transition-all",
                                isTutor ? "focus:border-indigo-500/50 focus:ring-indigo-500/5" : "focus:border-emerald-500/50 focus:ring-emerald-500/5"
                            )}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="text-[9px] font-black text-slate-700 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">⌘K</span>
                        </div>
                    </div>
                </div>

                {/* Actions Zone */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className={cn("text-slate-400 relative rounded-xl hover:bg-white/5",
                        isTutor ? "hover:text-indigo-400" : "hover:text-emerald-400"
                    )}>
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    </Button>

                    <div className="h-6 w-px bg-slate-800 hidden sm:block" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:px-3 md:gap-3 rounded-xl hover:bg-slate-900 transition-colors">
                                <Avatar className={cn("h-8 w-8 border ring-4",
                                    isTutor ? "border-indigo-500/20 ring-indigo-500/5" : "border-emerald-500/20 ring-emerald-500/5"
                                )}>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                                    <AvatarFallback className={cn("bg-slate-900 font-bold uppercase text-[10px]", accentClass)}>
                                        {user?.role?.[0] || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start gap-0.5">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider leading-none">Authenticated</span>
                                    <span className="text-[9px] font-bold text-slate-500 leading-none truncate max-w-[80px]">{user?.email || 'User Session'}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-slate-900/90 backdrop-blur-2xl border-slate-800 rounded-2xl shadow-2xl p-2" align="right">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operator Profile</span>
                                    <span className="text-sm font-bold text-white truncate">{user?.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors",
                                isTutor ? "hover:bg-indigo-500/10" : "hover:bg-emerald-500/10"
                            )}>
                                <User className={cn("w-4 h-4", accentClass)} />
                                <span className="text-xs font-bold uppercase tracking-wider">Identity Overview</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors",
                                isTutor ? "hover:bg-indigo-500/10" : "hover:bg-emerald-500/10"
                            )}>
                                <Settings className={cn("w-4 h-4", accentClass)} />
                                <span className="text-xs font-bold uppercase tracking-wider">System Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Terminate Session</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
