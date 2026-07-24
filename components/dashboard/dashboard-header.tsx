"use client"

import { useAuth } from "@/context/auth-context"
import { User, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="After-school.tech"
                            width={36}
                            height={36}
                            className="rounded-lg group-hover:scale-105 transition-transform"
                        />
                        <div className="hidden sm:flex flex-col">
                            <span className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">
                                After-school.tech
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {isTutor ? 'Teacher Studio' : 'Student Dashboard'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:px-3 md:gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                <Avatar className={cn("h-8 w-8 border-2",
                                    isTutor ? "border-blue-200 dark:border-blue-500/20" : "border-green-200 dark:border-green-500/20"
                                )}>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                                    <AvatarFallback className={cn("font-bold text-sm",
                                        isTutor ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                                    )}>
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                        {user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5 capitalize">
                                        {user?.role || 'Student'}
                                    </span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5" align="end">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Signed in as</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={isTutor ? "/dashboard/tutor/settings" : "/dashboard/student/settings"}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="text-sm">Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Log Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
