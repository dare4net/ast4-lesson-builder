"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Compass,
    TrendingUp,
    Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "Courses", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Explore", icon: Compass, href: "/dashboard/student/catalog" },
    { label: "Progress", icon: TrendingUp, href: "/dashboard/student/progress" },
    { label: "Settings", icon: Settings, href: "/dashboard/student/settings" },
]

export function StudentMobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 shadow-sm">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 group py-1.5 px-3">
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isActive ? "bg-[#58CC02]/15 text-[#58CC02]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold tracking-tight",
                            isActive ? "text-[#58CC02]" : "text-slate-400 dark:text-slate-500"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
