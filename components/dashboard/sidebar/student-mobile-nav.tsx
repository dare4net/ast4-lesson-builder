"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Search,
    Target,
    Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Home", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "Programs", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Catalog", icon: Search, href: "/dashboard/student/catalog" },
    { label: "Stats", icon: Target, href: "/dashboard/student/progress" },
]

export function StudentMobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-slate-950/80 backdrop-blur-xl border-t border-emerald-500/10 z-[60] flex items-center justify-around px-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 group">
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500 group-hover:text-slate-300"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            isActive ? "text-emerald-500" : "text-slate-600"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}

            {/* Settings as a separate circle or just last item? Plan says 4 items + profile drawer */}
            <Link href="/dashboard/student/settings" className="flex flex-col items-center justify-center gap-1 group">
                <div className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    pathname === "/dashboard/student/settings" ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500"
                )}>
                    <Settings className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    pathname === "/dashboard/student/settings" ? "text-emerald-500" : "text-slate-600"
                )}>
                    Config
                </span>
            </Link>
        </nav>
    )
}
