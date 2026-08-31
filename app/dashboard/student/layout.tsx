"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { GamificationEventListener } from "@/components/gamification/GamificationEventListener"
import { GamificationToastContainer } from "@/components/ui/gamification-toast"
import { StudentSidebar } from "@/components/dashboard/sidebar/student-sidebar"
import { StudentMobileNav } from "@/components/dashboard/sidebar/student-mobile-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LoginStreakModal } from "@/components/store/login-streak-modal"
import { PushRegister } from "@/components/push-register"
import { PushPermissionNudge } from "@/components/notifications/push-permission-nudge"
import { useStudentStats } from "@/hooks/use-student-stats"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { needsOnboarding } from "@/lib/onboarding"

interface StudentDashboardLayoutProps {
    children: ReactNode
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const statsQuery = useStudentStats()
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (loading || !user) return
        if (!needsOnboarding(user)) return
        const next = pathname && pathname.startsWith('/dashboard/student')
            ? `/onboarding?next=${encodeURIComponent(pathname)}`
            : '/onboarding'
        router.replace(next)
    }, [loading, user, pathname, router])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <GamificationEventListener />
            <GamificationToastContainer />
            <LoginStreakModal
                stats={statsQuery.data?.stats}
                userId={user?.user_id}
                enabled={!needsOnboarding(user)}
            />
            <PushRegister />
            <PushPermissionNudge />
            {/* Navigation */}
            <StudentSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <StudentMobileNav />

            {/* Main Content Area - dynamically expands when sidebar is collapsed */}
            <main className={cn(
                "relative flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out",
                isCollapsed ? "md:pl-[72px]" : "md:pl-[240px]"
            )}>
                <DashboardHeader sidebarIsCollapsed={isCollapsed} />
                <div className="flex-1 w-full pt-20 pb-20 md:pb-8 px-3 sm:px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="page-transition"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
