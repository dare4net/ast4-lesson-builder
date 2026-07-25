"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
    onFinished: () => void
    progress?: number
    isLoading?: boolean
}

export function SplashScreen({ onFinished, isLoading = false }: SplashScreenProps) {
    const [fakeProgress, setFakeProgress] = useState(0)
    const [phase, setPhase] = useState<'loading' | 'welcome'>('loading')

    useEffect(() => {
        // Animate progress from 0 → 100 over ~3 seconds
        let current = 0
        const interval = setInterval(() => {
            const jump = isLoading ? Math.random() * 4 : Math.random() * 8 + 4
            current = Math.min(current + jump, isLoading ? 85 : 100)
            setFakeProgress(Math.round(current))

            if (current >= 100) {
                clearInterval(interval)
                // Show welcome text briefly then finish
                setTimeout(() => {
                    setPhase('welcome')
                    setTimeout(() => {
                        onFinished()
                    }, 1800)
                }, 300)
            }
        }, 120)

        return () => clearInterval(interval)
    }, [isLoading, onFinished])

    // If auth finishes loading, let progress complete
    useEffect(() => {
        if (!isLoading && fakeProgress < 100) {
            setFakeProgress(100)
        }
    }, [isLoading])

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Top green stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#58CC02]" />

            {/* Subtle ambient blob */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#58CC02]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-8">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="absolute inset-0 rounded-3xl bg-[#58CC02]/10 blur-xl" />
                    <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="After-School Tech Studio"
                            width={72}
                            height={72}
                            className="object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center space-y-1"
                >
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">After-School Tech Studio</h1>
                    <p className="text-sm text-slate-400 font-medium">
                        {phase === 'welcome' ? 'Ready!' : 'Preparing your experience...'}
                    </p>
                </motion.div>

                {/* Progress bar */}
                <AnimatePresence mode="wait">
                    {phase === 'loading' ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full space-y-2"
                        >
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    className="h-full bg-[#58CC02] rounded-full"
                                    animate={{ width: `${fakeProgress}%` }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                                <span>Loading</span>
                                <span>{fakeProgress}%</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <div className="w-full h-2.5 bg-[#58CC02]/20 rounded-full overflow-hidden border border-[#58CC02]/30">
                                <div className="h-full w-full bg-[#58CC02] rounded-full" />
                            </div>
                            <div className="flex justify-end mt-2">
                                <span className="text-xs font-bold text-[#58CC02]">100%</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
                After-School Tech Studio
            </div>
        </motion.div>
    )
}
