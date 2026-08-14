"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    BookOpen,
    Compass,
    TrendingUp,
    Settings,
    ChevronLeft,
    ChevronRight,
    User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "My Courses", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Explore Courses", icon: Compass, href: "/dashboard/student/catalog" },
    { label: "My Progress", icon: TrendingUp, href: "/dashboard/student/progress" },
    { label: "Settings", icon: Settings, href: "/dashboard/student/settings" },
]

export function StudentSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 76 : 250 }}
            className={cn(
                "hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm",
                isCollapsed ? "items-center" : "items-stretch"
            )}
        >
            {/* Header / Brand */}
            <div className={cn(
                "h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800/80 relative",
                isCollapsed ? "justify-center px-0" : "justify-between"
            )}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0">
                            <Image
                                src="/logo.webp"
                                alt="After-school.tech"
                                width={24}
                                height={24}
                                className="object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/icons/icon-192x192.png"
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white font-extrabold text-xs tracking-tight">After-school.tech</span>
                            <span className="text-[10px] font-bold text-[#58CC02] tracking-wide">Student Portal</span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center">
                        <Image
                            src="/logo.webp"
                            alt="After-school.tech"
                            width={22}
                            height={22}
                            className="object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/icons/icon-192x192.png"
                            }}
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full z-10 shadow-sm flex items-center justify-center absolute -right-3 top-5 transition-all"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "relative group flex items-center h-10 rounded-xl transition-all duration-150 font-bold text-xs",
                                isActive
                                    ? "bg-[#58CC02] text-white shadow-sm font-extrabold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
                                isCollapsed ? "justify-center" : "px-3.5 gap-3"
                            )}>
                                <item.icon className={cn(
                                    "w-4 h-4 shrink-0 transition-colors",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                )} />

                                {!isCollapsed && (
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div className="absolute left-14 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile Badge */}
            <div className={cn(
                "p-3 border-t border-slate-100 dark:border-slate-800/80",
                isCollapsed ? "flex justify-center" : ""
            )}>
                {!isCollapsed ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                {user?.email?.split('@')[0] || 'Student'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 truncate">
                                {user?.email}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
