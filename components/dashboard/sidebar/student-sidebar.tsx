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
    Crown,
    Store,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isNavActive } from "@/lib/nav-active"
import { useAuth } from "@/context/auth-context"
import { HandleAvatar } from "@/components/pride/handle-avatar"
import { useStudentClubContext } from "@/hooks/use-student-club"

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "My Courses", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Explore Courses", icon: Compass, href: "/dashboard/student/catalog", marketplaceOnly: true },
    { label: "My Progress", icon: TrendingUp, href: "/dashboard/student/progress" },
    { label: "Store", icon: Store, href: "/dashboard/student/store" },
    { label: "Pride", icon: Crown, href: "/dashboard/student/pride" },
    { label: "Settings", icon: Settings, href: "/dashboard/student/settings" },
]

interface StudentSidebarProps {
    isCollapsed?: boolean
    onToggle?: () => void
}

export function StudentSidebar({ isCollapsed: controlledIsCollapsed, onToggle }: StudentSidebarProps) {
    const [localIsCollapsed, setLocalIsCollapsed] = useState(true)
    const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : localIsCollapsed
    const handleToggle = onToggle || (() => setLocalIsCollapsed(!localIsCollapsed))

    const pathname = usePathname()
    const { user } = useAuth()
    const { marketplaceOpen } = useStudentClubContext()
    const navItems = NAV_ITEMS.filter((item) => !('marketplaceOnly' in item && item.marketplaceOnly) || marketplaceOpen)

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 h-screen z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm overflow-visible select-none"
        >
            {/* Header with Integrated Toggle Button */}
            <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-2.5">
                            <Image
                                src="/icons/icon-192x192.png"
                                alt="After-school.tech"
                                width={28}
                                height={28}
                                className="rounded-lg shrink-0"
                            />

                        </div>

                        <button
                            type="button"
                            onClick={handleToggle}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Collapse sidebar"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4 text-slate-500" />
                        </button>
                    </>
                ) : (
                    <div className="w-full flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleToggle}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-[#58CC02] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group relative flex items-center justify-center cursor-pointer"
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                        >
                            <Image
                                src="/icons/icon-192x192.png"
                                alt="After-school.tech"
                                width={28}
                                height={28}
                                className="rounded-lg group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#58CC02] text-white p-0.5 rounded-full shadow-xs">
                                <PanelLeftOpen className="w-2.5 h-2.5" />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation List - overflow-visible allows tooltips to float on top */}
            <div className="flex-1 py-4 px-2.5 space-y-1.5 overflow-visible">
                {navItems.map((item) => {
                    const isActive = isNavActive(pathname, item.href, "/dashboard/student")
                    return (
                        <Link key={item.href} href={item.href} className="block">
                            <div
                                className={cn(
                                    "relative group flex items-center h-10 rounded-xl transition-all duration-150 font-extrabold text-xs",
                                    isActive
                                        ? "bg-[#58CC02] text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
                                    isCollapsed ? "justify-center px-0" : "px-3 gap-3"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-4 h-4 shrink-0 transition-colors",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                )} />

                                {!isCollapsed && (
                                    <span className="truncate tracking-tight">
                                        {item.label}
                                    </span>
                                )}

                                {/* Hover Tooltip on Collapsed State (Z-50, elevated and unclipped) */}
                                {isCollapsed && (
                                    <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-[100] shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Footer User Avatar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                {!isCollapsed ? (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                        <HandleAvatar
                            handle={user?.handle || user?.user_id}
                            avatarId={user?.avatarId}
                            displayName={user?.full_name || user?.email}
                            avatarFrame={user?.avatarFrame}
                            className="h-7 w-7"
                        />
                        <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                {user?.full_name || user?.handle || user?.email?.split('@')[0] || 'Student'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 truncate">
                                Student
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <HandleAvatar
                            handle={user?.handle || user?.user_id}
                            avatarId={user?.avatarId}
                            displayName={user?.full_name || user?.email}
                            avatarFrame={user?.avatarFrame}
                            className="h-8 w-8"
                        />
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
