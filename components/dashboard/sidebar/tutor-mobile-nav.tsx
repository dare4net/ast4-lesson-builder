"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Monitor, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Hub", icon: LayoutDashboard, href: "/dashboard/tutor" },
    { label: "Studio", icon: Monitor, href: "/dashboard/tutor/programs" },
    { label: "Agents", icon: Users, href: "/dashboard/tutor/students" },
    { label: "Settings", icon: Settings, href: "/dashboard/tutor/settings" },
]

export function TutorMobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-slate-950/80 backdrop-blur-xl border-t border-indigo-500/10">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href} className="relative py-2 px-4 flex flex-col items-center gap-1 group">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                isActive
                                    ? "bg-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                    : "text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/5"
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                                isActive ? "text-indigo-400" : "text-slate-600"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <div className="absolute -top-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_indigo]" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
