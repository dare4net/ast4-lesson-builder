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
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 group py-1 px-2">
                        <div className={cn(
                            "p-1.5 rounded-xl transition-all duration-200",
                            isActive ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium tracking-tight",
                            isActive ? "text-green-600 dark:text-green-400 font-semibold" : "text-slate-500 dark:text-slate-400"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
