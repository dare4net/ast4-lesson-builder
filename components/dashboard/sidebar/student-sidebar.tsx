"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    BookOpen,
    Search,
    Target,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    Hexagon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "My Programs", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Catalog", icon: Search, href: "/dashboard/student/catalog" },
    { label: "Progress", icon: Target, href: "/dashboard/student/progress" },
    { label: "Settings", icon: Settings, href: "/dashboard/student/settings" },
]

export function StudentSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={cn(
                "hidden md:flex flex-col fixed left-0 top-0 h-screen z-[60] border-r border-emerald-500/10 bg-slate-950/60 backdrop-blur-2xl transition-colors",
                isCollapsed ? "items-center" : "items-stretch"
            )}
        >
            {/* Logo/Header */}
            <div className={cn(
                "h-20 flex items-center px-6 border-b border-emerald-500/5",
                isCollapsed ? "justify-center px-0" : "justify-between"
            )}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <Zap className="w-5 h-5 text-slate-950 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-xs uppercase tracking-tighter transform scale-y-110">Emerald Hub</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em]">Directive 4.0</span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 absolute -right-4 top-16 bg-slate-950 border border-emerald-500/10 rounded-full z-10"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "relative group flex items-center h-12 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/5",
                                isCollapsed ? "justify-center" : "px-4 gap-4"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    />
                                )}

                                <item.icon className={cn(
                                    "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-emerald-400"
                                )} />

                                {!isCollapsed && (
                                    <span className="text-[11px] font-black uppercase tracking-widest truncate">
                                        {item.label}
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div className="absolute left-16 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Identity */}
            <div className={cn(
                "p-4 border-t border-emerald-500/5",
                isCollapsed ? "flex justify-center" : ""
            )}>
                {!isCollapsed ? (
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-emerald-500/10">
                            <Hexagon className="w-6 h-6 text-emerald-500/50 fill-emerald-500/10" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">Operator Active</span>
                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Sector-9</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Target className="w-5 h-5 text-slate-600" />
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
