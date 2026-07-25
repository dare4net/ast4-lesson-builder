"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, ArrowRight } from "lucide-react"

interface SplashScreenProps {
    onFinished: () => void
    progress?: number
    isLoading?: boolean
}

export function SplashScreen({ onFinished, progress = 0, isLoading = false }: SplashScreenProps) {
    const [showWelcome, setShowWelcome] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            const welcomeTimer = setTimeout(() => {
                setShowWelcome(true)
                const finishTimer = setTimeout(() => {
                    onFinished()
                }, 2200)
                return () => clearTimeout(finishTimer)
            }, 400)
            return () => clearTimeout(welcomeTimer)
        }
    }, [isLoading, onFinished])

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            {/* Soft top green stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#58CC02]" />

            {/* Subtle background pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#58CC02]/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-[#1CB0F6]/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-8"
                >
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-3xl bg-[#58CC02]/10 blur-xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
                            <Image
                                src="/icons/icon-192x192.png"
                                alt="After-School Tech Studio Logo"
                                width={72}
                                height={72}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">After-School Tech Studio</h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">Preparing your experience...</p>
                            </div>

                            <div className="w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    className="h-full bg-[#58CC02] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>

                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                                <Loader2 className="w-3.5 h-3.5 text-[#58CC02] animate-spin" />
                                <span className="text-xs font-semibold text-slate-600">
                                    Loading {Math.round(progress)}%
                                </span>
                            </div>
                        </motion.div>
                    ) : showWelcome ? (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02]">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold tracking-wide uppercase">Welcome to the Studio</span>
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                                Where Learning Meets <span className="text-[#58CC02]">Innovation</span>
                            </h1>

                            <p className="text-sm text-slate-500 font-normal leading-relaxed max-w-xs">
                                Interactive courses, creative modules, and empowered learning.
                            </p>

                            <motion.div
                                className="mt-2 flex items-center gap-2 text-xs font-bold text-[#1CB0F6]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Ready to get started
                                <ArrowRight className="w-3.5 h-3.5" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="syncing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <Loader2 className="w-5 h-5 text-[#58CC02] animate-spin" />
                            <span className="text-xs font-medium text-slate-500">Launching...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                After-School Tech Studio
            </div>
        </motion.div>
    )
}
