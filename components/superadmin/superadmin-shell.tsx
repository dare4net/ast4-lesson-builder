'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { SuperadminMobileNav } from '@/components/superadmin/superadmin-mobile-nav'
import { SuperadminSidebar } from '@/components/superadmin/superadmin-sidebar'

export function SuperadminShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F4F7FB] text-slate-900 font-sans">
            <SuperadminSidebar />
            <SuperadminMobileNav />
            <main className="relative flex flex-col min-h-screen md:pl-[260px]">
                <div className="flex-1 w-full pt-6 pb-24 md:pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="superadmin-page"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
