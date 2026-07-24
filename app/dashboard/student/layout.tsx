"use client"

import { ReactNode } from "react"
import { StudentSidebar } from "@/components/dashboard/sidebar/student-sidebar"
import { StudentMobileNav } from "@/components/dashboard/sidebar/student-mobile-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface StudentDashboardLayoutProps {
    children: ReactNode
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            {/* Structural Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
            </div>

            {/* Platform Navigation */}
            <StudentSidebar />
            <StudentMobileNav />

            {/* Main Content Area */}
            <main className="relative z-10 flex flex-col min-h-screen md:pl-[80px] lg:pl-[280px] transition-[padding] duration-300">
                <DashboardHeader />
                <div className="flex-1 w-full max-w-7xl mx-auto pt-24 pb-20 md:pb-8 px-4 md:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="page-transition"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Decorative Scanline */}
            <div className="fixed top-0 left-0 w-full h-1 bg-emerald-500/20 z-[70] blur-sm animate-scan" />
        </div>
    )
}
