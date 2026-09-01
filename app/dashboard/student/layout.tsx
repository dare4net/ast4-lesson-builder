"use client"

import { ReactNode, useEffect, useState, type CSSProperties } from "react"
import { usePathname, useRouter } from "next/navigation"
import { GamificationEventListener } from "@/components/gamification/GamificationEventListener"
import { GamificationToastContainer } from "@/components/ui/gamification-toast"
import { StudentSidebar } from "@/components/dashboard/sidebar/student-sidebar"
import { StudentMobileNav } from "@/components/dashboard/sidebar/student-mobile-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LoginStreakModal } from "@/components/store/login-streak-modal"
import { PushRegister } from "@/components/push-register"
import { PushPermissionNudge } from "@/components/notifications/push-permission-nudge"
import { ClubSplashOverlay } from "@/components/dashboard/student/club-splash-overlay"
import { ClubWelcomeModal } from "@/components/dashboard/student/club-welcome-modal"
import { useStudentStats } from "@/hooks/use-student-stats"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { needsOnboarding } from "@/lib/onboarding"
import { useStudentClubContext, STUDENT_PERSONAL } from "@/hooks/use-student-club"
import { clubThemeVars, resolveOrgAccent } from "@/lib/org-branding"

interface StudentDashboardLayoutProps {
    children: ReactNode
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [splashDone, setSplashDone] = useState(false)
    const statsQuery = useStudentStats()
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const club = useStudentClubContext()
    const inClubLens =
        club.clubMode &&
        club.activeOrgId &&
        club.activeOrgId !== STUDENT_PERSONAL &&
        club.activeStudentOrg
    const clubAccent = inClubLens
        ? club.activeStudentOrg?.branding?.accentColor ||
          resolveOrgAccent(club.activeStudentOrg?.slug, null)
        : null

    useEffect(() => {
        if (loading || !user) return
        if (!needsOnboarding(user)) return
        const next = pathname && pathname.startsWith('/dashboard/student')
            ? `/onboarding?next=${encodeURIComponent(pathname)}`
            : '/onboarding'
        router.replace(next)
    }, [loading, user, pathname, router])

    useEffect(() => {
        setSplashDone(false)
    }, [club.activeOrgId])

    return (
        <div
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans"
            data-club-theme={clubAccent ? 'active' : 'off'}
            style={clubAccent ? (clubThemeVars(clubAccent) as CSSProperties) : undefined}
        >
            <GamificationEventListener />
            <GamificationToastContainer />
            <ClubSplashOverlay
                userId={user?.user_id}
                orgId={inClubLens ? club.activeOrgId : null}
                orgName={club.activeStudentOrg?.name}
                logoUrl={club.activeStudentOrg?.branding?.logoUrl}
                accentColor={clubAccent || resolveOrgAccent(club.activeStudentOrg?.slug, null)}
                brandingTier={club.activeStudentOrg?.branding?.brandingTier}
                enabled={!needsOnboarding(user)}
                onFinished={() => setSplashDone(true)}
            />
            <ClubWelcomeModal
                userId={user?.user_id}
                orgId={inClubLens ? club.activeOrgId : null}
                orgName={club.activeStudentOrg?.name}
                welcomeMessage={club.activeStudentOrg?.branding?.welcomeMessage}
                brandingTier={club.activeStudentOrg?.branding?.brandingTier}
                splashDone={splashDone}
                enabled={!needsOnboarding(user)}
            />
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
