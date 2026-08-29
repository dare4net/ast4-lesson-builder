"use client"

import { useAuth } from "@/context/auth-context"
import { User, LogOut, Settings, LayoutDashboard, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
import { isNavActive } from "@/lib/nav-active"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { PrideSearch } from "@/components/pride/pride-search"

const TUTOR_NAV = [
    { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/tutor/students", icon: Users },
]

interface DashboardHeaderProps {
    sidebarIsCollapsed?: boolean
    hasSidebar?: boolean
}

export function DashboardHeader({ sidebarIsCollapsed = true, hasSidebar = true }: DashboardHeaderProps) {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const isTutor = user?.role === 'tutor'

    return (
        <header className={cn(
            "fixed top-0 right-0 z-30 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 shadow-sm transition-[left] duration-300 ease-in-out",
            !hasSidebar
                ? "left-0"
                : sidebarIsCollapsed
                    ? "left-0 md:left-[72px]"
                    : "left-0 md:left-[240px]"
        )}>
            <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
                {/* Brand */}
                <Link href={isTutor ? "/dashboard/tutor" : "/dashboard/student"} className="flex items-center gap-2.5 group shrink-0">
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="After-school.tech"
                        width={30}
                        height={30}
                        className="rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="hidden lg:flex flex-col leading-tight">
                        <span className="text-slate-900 font-black text-xs tracking-tight">After-school.tech</span>
                        <span className="text-[10px] text-[#1CB0F6] font-bold">{isTutor ? 'Teacher Dashboard' : 'Student Dashboard'}</span>
                    </div>
                </Link>

                {!isTutor && (
                    <div className="flex-1 min-w-0 flex justify-center">
                        <PrideSearch />
                    </div>
                )}

                {/* Tutor nav links */}
                {isTutor && (
                    <nav className="flex items-center gap-1">
                        {TUTOR_NAV.map(item => {
                            const isActive = isNavActive(pathname, item.href, "/dashboard/tutor")
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={cn(
                                        "h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors",
                                        isActive
                                            ? "bg-[#EAF6FE] text-[#1CB0F6]"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                    )}>
                                        <item.icon className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isTutor && <NotificationBell />}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" aria-label="Account menu" className="h-9 w-9 sm:w-auto sm:px-3 sm:gap-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                                <Avatar className="h-7 w-7 border-2 border-[#1CB0F6]/30">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                                    <AvatarFallback className="bg-[#EAF6FE] text-[#1CB0F6] font-black text-xs">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:flex flex-col items-start leading-tight">
                                    <span className="text-xs font-black text-slate-800">{user?.email?.split('@')[0] || 'User'}</span>
                                    <span className="text-[10px] text-slate-400 font-medium capitalize">{user?.role || 'Student'}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52 bg-white border-2 border-slate-100 rounded-xl shadow-lg p-1.5" align="end">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-slate-400 font-bold">Signed in as</span>
                                    <span className="text-xs font-black text-slate-800 truncate">{user?.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={isTutor ? "/dashboard/tutor/settings" : "/dashboard/student/settings"}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors text-xs font-bold"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors text-xs font-bold"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
