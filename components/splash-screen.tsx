"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Flame, Trophy, Gem } from "lucide-react"

interface SplashScreenProps {
    onFinished: () => void
    isLoading?: boolean
}

const motivationalQuotes = [
    "Booting up your learning superpower...",
    "Packing your daily XP rewards...",
    "Unlocking exciting new challenges...",
    "Preparing your tech workspace...",
    "Almost ready for action!"
]

export function SplashScreen({ onFinished, isLoading = false }: SplashScreenProps) {
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
    const [quoteIndex, setQuoteIndex] = useState(0)

    useEffect(() => {
        let current = 0
        // Paced interval: increments ~1.2% every 60ms => total loading ~5.0 seconds + 0.8s completion hold
        const interval = setInterval(() => {
            const increment = Math.random() * 1.5 + 0.6
            current = Math.min(current + increment, 100)
            setProgress(Math.round(current))

            if (current >= 20 && current < 40) setQuoteIndex(1)
            else if (current >= 40 && current < 65) setQuoteIndex(2)
            else if (current >= 65 && current < 88) setQuoteIndex(3)
            else if (current >= 88) setQuoteIndex(4)

            if (current >= 100) {
                clearInterval(interval)
                setTimeout(() => {
                    setPhase('ready')
                    setTimeout(() => {
                        onFinished()
                    }, 1000)
                }, 800)
            }
        }, 110)

        return () => clearInterval(interval)
    }, [onFinished])

    // Dramatic Spring Pop Variant
    const popIn = {
        hidden: { scale: 0, opacity: 0, y: 30 },
        visible: (delay: number) => ({
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 320,
                damping: 16,
                bounce: 0.65,
                delay
            }
        })
    }

    const badgePop = {
        hidden: (rotate: number) => ({ scale: 0, opacity: 0, rotate: rotate * 3, y: 20 }),
        visible: (custom: { delay: number; rotate: number }) => ({
            scale: 1,
            opacity: 1,
            y: 0,
            rotate: custom.rotate,
            transition: {
                type: "spring" as const,
                stiffness: 350,
                damping: 15,
                bounce: 0.7,
                delay: custom.delay
            }
        })
    }

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF9F5] select-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            {/* Colorful Canvas Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#1CB0F6 1.5px, transparent 1.5px)`,
                    backgroundSize: '28px 28px'
                }}
            />

            {/* Rainbow Duo Top Bar Drop-down */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute top-0 inset-x-0 h-2.5 flex"
            >
                <div className="flex-1 bg-[#58CC02]" />
                <div className="flex-1 bg-[#1CB0F6]" />
                <div className="flex-1 bg-[#FFC800]" />
                <div className="flex-1 bg-[#FF4B4B]" />
                <div className="flex-1 bg-[#CE82FF]" />
            </motion.div>

            {/* 1. Dramatic Pop Badge: Top Left (Energy Zap) */}
            <motion.div
                custom={{ delay: 0.2, rotate: -4 }}
                variants={badgePop}
                initial="hidden"
                animate="visible"
                className="absolute top-12 left-10 p-3 bg-white border-2 border-[#FFC800] rounded-2xl shadow-lg shadow-[#FFC800]/20 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-xl bg-[#FFC800] flex items-center justify-center text-white font-black text-sm">
                    <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800 tracking-tight hidden sm:inline">Energy Boost!</span>
            </motion.div>

            {/* 2. Dramatic Pop Badge: Top Right (XP Gem) */}
            <motion.div
                custom={{ delay: 0.4, rotate: 3 }}
                variants={badgePop}
                initial="hidden"
                animate="visible"
                className="absolute top-16 right-10 p-3 bg-white border-2 border-[#CE82FF] rounded-2xl shadow-lg shadow-[#CE82FF]/20 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-xl bg-[#CE82FF] flex items-center justify-center text-white font-black text-sm">
                    <Gem className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800 tracking-tight hidden sm:inline">XP Multiplier</span>
            </motion.div>

            {/* 3. Dramatic Pop Badge: Bottom Left (Flame Streak) */}
            <motion.div
                custom={{ delay: 0.6, rotate: -3 }}
                variants={badgePop}
                initial="hidden"
                animate="visible"
                className="absolute bottom-16 left-12 p-3 bg-white border-2 border-[#FF4B4B] rounded-2xl shadow-lg shadow-[#FF4B4B]/20 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-xl bg-[#FF4B4B] flex items-center justify-center text-white font-black text-sm">
                    <Flame className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800 tracking-tight hidden sm:inline">Daily Streak</span>
            </motion.div>

            {/* 4. Dramatic Pop Badge: Bottom Right (Trophy) */}
            <motion.div
                custom={{ delay: 0.8, rotate: 4 }}
                variants={badgePop}
                initial="hidden"
                animate="visible"
                className="absolute bottom-20 right-12 p-3 bg-white border-2 border-[#1CB0F6] rounded-2xl shadow-lg shadow-[#1CB0F6]/20 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-xl bg-[#1CB0F6] flex items-center justify-center text-white font-black text-sm">
                    <Trophy className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800 tracking-tight hidden sm:inline">Goal Hunter</span>
            </motion.div>

            {/* Main Center Area */}
            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-6 text-center">

                {/* Dramatic 3D Duo Logo Slam & Bounce */}
                <motion.div
                    custom={0.1}
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="relative"
                >
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-3xl bg-white border-4 border-[#1CB0F6] border-b-8 border-b-[#0090CC] shadow-2xl flex items-center justify-center p-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1CB0F6]/10 to-transparent pointer-events-none" />
                            <Image
                                src="/icons/icon-192x192.png"
                                alt="After-School Tech Studio"
                                width={80}
                                height={80}
                                className="object-contain drop-shadow-md"
                                priority
                            />
                        </div>

                        {/* Sparkle badge popping on corner */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 10, delay: 0.5 }}
                            className="absolute -top-3 -right-3 w-9 h-9 rounded-2xl bg-[#FFC800] border-2 border-white shadow-md flex items-center justify-center text-slate-900"
                        >
                            <Sparkles className="w-5 h-5 fill-slate-900 animate-spin-slow" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Staggered App Title Pop */}
                <motion.div
                    custom={0.3}
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                >
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        After-School <span className="text-[#1CB0F6]">Tech</span>
                    </h1>
                    <p className="text-xs font-black text-[#58CC02] tracking-widest uppercase">
                        ✦ Interactive Learning Studio ✦
                    </p>
                </motion.div>

                {/* Dynamic Quote Carousel Pop */}
                <motion.div
                    custom={0.5}
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="h-7 flex items-center justify-center"
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={quoteIndex}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className="text-xs font-black text-slate-700 bg-white/90 border-2 border-slate-200 px-4 py-1 rounded-full shadow-sm"
                        >
                            {motivationalQuotes[quoteIndex]}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                {/* 3D Duolingo Progress Bar Dramatic Entrance */}
                <motion.div
                    custom={0.7}
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="w-full space-y-2.5 pt-2"
                >
                    <div className="h-5 w-full bg-slate-200/80 rounded-2xl p-1 border-2 border-slate-300/60 shadow-inner relative overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#58CC02] via-[#46a302] to-[#58CC02] rounded-xl border-b-2 border-[#378000] relative"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-xl pointer-events-none" />
                        </motion.div>
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            {phase === 'ready' ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 500, bounce: 0.8 }}
                                    className="text-[#58CC02] flex items-center gap-1.5 font-black"
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-[#58CC02]" /> Ready for Action!
                                </motion.span>
                            ) : (
                                <span>Loading Experience...</span>
                            )}
                        </span>
                        <span className="text-xs font-black text-[#1CB0F6] bg-[#1CB0F6]/10 px-2.5 py-0.5 rounded-full border border-[#1CB0F6]/20 font-mono">
                            {progress}%
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Gamified Footer Staggered Pop */}
            <motion.div
                custom={0.9}
                variants={popIn}
                initial="hidden"
                animate="visible"
                className="absolute bottom-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2"
            >
                <span>Play</span> • <span>Code</span> • <span>Level Up</span>
            </motion.div>
        </motion.div>
    )
}


