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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <main className={cn(
                "relative flex flex-col min-h-screen",
                !noPadding && "pt-20 pb-20 md:pb-8 px-4 md:px-8",
                className
            )}>
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex-1 w-full max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}
