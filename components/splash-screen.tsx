"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SplashScreenProps {
    onFinished: () => void
    progress?: number
    isLoading?: boolean
}

export function SplashScreen({ onFinished, progress = 0, isLoading = false }: SplashScreenProps) {
    const [showWelcome, setShowWelcome] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            const welcomeTimer = setTimeout(() => {
                setShowWelcome(true)
                // After welcome animation finishes, call onFinished
                setTimeout(() => {
                    onFinished()
                }, 2500)
            }, 500)

            return () => clearTimeout(welcomeTimer)
        }
    }, [isLoading, onFinished])

    if (!isVisible) return null

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-blob" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative mb-12"
                >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl animate-pulse" />

                        {/* Hexagon Frame */}
                        <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-3xl rotate-45 transform" />

                        {/* Logo Image or Icon */}
                        <div className="relative w-24 h-24 bg-slate-900 rounded-2xl border border-emerald-500/50 flex items-center justify-center shadow-2xl overflow-hidden">
                            <Zap className="w-12 h-12 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <motion.div
                                className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading-state"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                <motion.div
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Booting Systems: {Math.round(progress)}%
                                </span>
                            </div>
                        </motion.div>
                    ) : showWelcome ? (
                        <motion.div
                            key="welcome-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                WELCOME <span className="text-emerald-500">TO</span>
                            </h2>
                            <div className="flex flex-col items-center">
                                <span className="text-emerald-500 font-black text-sm tracking-[0.5em] uppercase mb-1">After-School</span>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                                <span className="text-white font-light text-2xl tracking-[0.2em] transform scale-y-110">TECH STUDIO</span>
                            </div>

                            <motion.div
                                className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Initialization Complete</span>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="syncing-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.4em] animate-pulse">
                                Synchronizing Identity...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Retro Data Scan Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,165,0.06))] bg-[length:100%_2px,3px_100%]" />
        </motion.div>
    )
}
