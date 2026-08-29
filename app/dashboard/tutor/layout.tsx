"use client"

import { ReactNode } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TutorMobileNav } from "@/components/dashboard/sidebar/tutor-mobile-nav"
import { motion, AnimatePresence } from "framer-motion"

interface TutorDashboardLayoutProps {
    children: ReactNode
}

export default function TutorDashboardLayout({ children }: TutorDashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F7F8FA] text-slate-900 font-sans">
            <DashboardHeader hasSidebar={false} />
            <TutorMobileNav />
            <main className="relative flex flex-col min-h-screen">
                <div className="flex-1 w-full pt-16 pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="tutor-page-transition"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full pt-4"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
