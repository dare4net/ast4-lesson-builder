"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isNavActive } from "@/lib/nav-active"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/tutor" },
    { label: "My Courses", icon: BookOpen, href: "/dashboard/tutor/programs" },
    { label: "Students", icon: Users, href: "/dashboard/tutor/students" },
    { label: "Settings", icon: Settings, href: "/dashboard/tutor/settings" },
]

export function TutorSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className={cn(
                "hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors",
                isCollapsed ? "items-center" : "items-stretch"
            )}
        >
            {/* Header / Brand */}
            <div className={cn(
                "h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800/80",
                isCollapsed ? "justify-center px-0" : "justify-between"
            )}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="After-school.tech"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white font-bold text-xs">After-school.tech</span>
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Teacher Studio</span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="After-school.tech"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute -right-3.5 top-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full z-10 shadow-sm"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = isNavActive(pathname, item.href, "/dashboard/tutor")
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "relative group flex items-center h-11 rounded-xl transition-all duration-200 font-medium text-sm",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900",
                                isCollapsed ? "justify-center" : "px-3.5 gap-3.5"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="tutor-sidebar-active"
                                        className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full"
                                    />
                                )}

                                <item.icon className={cn(
                                    "w-5 h-5 shrink-0 transition-colors",
                                    isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                )} />

                                {!isCollapsed && (
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div className="absolute left-16 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
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
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {user?.email?.split('@')[0] || 'Teacher'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                Teacher Account
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                        <UserCheck className="w-4 h-4" />
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
