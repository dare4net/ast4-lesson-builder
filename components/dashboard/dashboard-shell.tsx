"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
    children: ReactNode
    className?: string
    noPadding?: boolean
}

export function DashboardShell({ children, className, noPadding = false }: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            {/* Structural Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
            </div>

            <main className={cn(
                "relative z-10 flex flex-col min-h-screen",
                !noPadding && "pt-24 pb-20 md:pb-8 px-4 md:px-8",
                className
            )}>
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex-1 w-full max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Decorative Scanline */}
            <div className="fixed top-0 left-0 w-full h-1 bg-emerald-500/20 z-[60] blur-sm animate-scan" />
        </div>
    )
}
