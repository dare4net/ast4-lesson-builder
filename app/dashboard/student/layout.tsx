"use client"

import { ReactNode } from "react"
import { StudentSidebar } from "@/components/dashboard/sidebar/student-sidebar"
import { StudentMobileNav } from "@/components/dashboard/sidebar/student-mobile-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { motion, AnimatePresence } from "framer-motion"

interface StudentDashboardLayoutProps {
    children: ReactNode
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            {/* Navigation */}
            <StudentSidebar />
            <StudentMobileNav />

            {/* Main Content Area */}
            <main className="relative flex flex-col min-h-screen md:pl-[260px] transition-[padding] duration-300">
                <DashboardHeader />
                <div className="flex-1 w-full max-w-7xl mx-auto pt-20 pb-20 md:pb-8 px-4 md:px-8">
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
