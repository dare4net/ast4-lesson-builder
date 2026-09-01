'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Compass,
    TrendingUp,
    Store,
    Crown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isNavActive } from "@/lib/nav-active"
import { useStudentClubContext, STUDENT_PERSONAL } from "@/hooks/use-student-club"

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "Courses", icon: BookOpen, href: "/dashboard/student/programs" },
    { label: "Explore", icon: Compass, href: "/dashboard/student/catalog", marketplaceOnly: true },
    { label: "Progress", icon: TrendingUp, href: "/dashboard/student/progress" },
    { label: "Store", icon: Store, href: "/dashboard/student/store" },
    { label: "Pride", icon: Crown, href: "/dashboard/student/pride" },
]

export function StudentMobileNav() {
    const pathname = usePathname()
    const { marketplaceOpen, clubMode, activeOrgId, activeStudentOrg } = useStudentClubContext()
    const inClubLens =
        clubMode &&
        activeOrgId &&
        activeOrgId !== STUDENT_PERSONAL &&
        activeStudentOrg
    const items = navItems.filter((item) => !item.marketplaceOnly || marketplaceOpen)

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 shadow-sm">
            {items.map((item) => {
                const isActive = isNavActive(pathname, item.href, "/dashboard/student")
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 group py-1.5 px-3">
                        <div
                            className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive && !inClubLens && "bg-[#58CC02]/15 text-[#58CC02]",
                                !isActive && "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200",
                            )}
                            style={
                                isActive && inClubLens
                                    ? {
                                          backgroundColor: 'var(--club-accent-muted, rgb(88 204 2 / 0.15))',
                                          color: 'var(--club-accent, #58CC02)',
                                      }
                                    : undefined
                            }
                        >
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-bold tracking-tight",
                                isActive && !inClubLens && "text-[#58CC02]",
                                !isActive && "text-slate-400 dark:text-slate-500",
                            )}
                            style={isActive && inClubLens ? { color: 'var(--club-accent, #58CC02)' } : undefined}
                        >
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
