"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface SplashScreenProps {
    onFinished: () => void
    isLoading?: boolean
}

export function SplashScreen({ onFinished, isLoading = false }: SplashScreenProps) {
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState<'loading' | 'ready'>('loading')

    useEffect(() => {
        let current = 0
        const interval = setInterval(() => {
            const increment = Math.random() * 5 + 3
            current = Math.min(current + increment, 100)
            setProgress(Math.round(current))

            if (current >= 100) {
                clearInterval(interval)
                setTimeout(() => {
                    setPhase('ready')
                    setTimeout(() => {
                        onFinished()
                    }, 1000)
                }, 300)
            }
        }, 75)

        return () => clearInterval(interval)
    }, [onFinished])

    const drawVariant = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i: number) => ({
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: i * 0.15, type: "spring", duration: 1.2, bounce: 0 },
                opacity: { delay: i * 0.15, duration: 0.2 }
            }
        })
    }

    const titleText = "After-School Tech Studio"

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF9F5] select-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            {/* Subtle Flat Notebook Grid */}
            <div
                className="absolute inset-0 opacity-[0.2] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#1CB0F6 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Flat Duo Top Stripe */}
            <div className="absolute top-0 inset-x-0 h-2 bg-[#58CC02]" />

            {/* Flat SVG Doodle Animations */}
            {/* Flat Doodle Star Top Right */}
            <svg className="absolute top-12 right-12 w-12 h-12 text-[#FFC800]" viewBox="0 0 100 100" fill="none">
                <motion.path
                    d="M50 5 L63 35 L95 38 L70 60 L78 92 L50 75 L22 92 L30 60 L5 38 L37 35 Z"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={drawVariant}
                />
            </svg>

            {/* Flat Doodle Spiral Bottom Left */}
            <svg className="absolute bottom-16 left-12 w-14 h-14 text-[#FF4B4B]" viewBox="0 0 100 100" fill="none">
                <motion.path
                    d="M 50,50 A 10,10 0 0 1 60,60 A 20,20 0 0 1 40,70 A 30,30 0 0 1 20,40 A 40,40 0 0 1 80,30"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={drawVariant}
                />
            </svg>

            {/* Flat Doodle Spark Top Left */}
            <svg className="absolute top-16 left-16 w-10 h-10 text-[#1CB0F6]" viewBox="0 0 60 60" fill="none">
                <motion.path
                    d="M30 5 V55 M5 30 H55 M12 12 L48 48 M48 12 L12 48"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={drawVariant}
                />
            </svg>

            {/* Main Center Flat Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-6 text-center">

                {/* Flat Logo Container */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 16
                    }}
                    className="relative"
                >
                    <div className="w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden p-3">
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

                {/* Flat Staggered Doodle Title */}
                <div className="space-y-1">
                    <motion.div className="flex flex-wrap justify-center gap-[2px]">
                        {titleText.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.02, duration: 0.25 }}
                                className="text-2xl font-extrabold text-slate-800 tracking-tight"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Hand-drawn Underline SVG */}
                    <div className="flex justify-center pt-1">
                        <svg className="w-48 h-3 text-[#58CC02]" viewBox="0 0 200 12" fill="none">
                            <motion.path
                                d="M 5,7 Q 50,2 100,7 T 195,6"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                custom={4}
                                initial="hidden"
                                animate="visible"
                                variants={drawVariant}
                            />
                        </svg>
                    </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full space-y-2 pt-3">
                    <div className="h-3 w-full bg-slate-200/70 rounded-full p-0.5 overflow-hidden">
                        <motion.div
                            className="h-full bg-[#58CC02] rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                        />
                    </div>

                    <div className="flex justify-between items-center px-1 text-xs font-bold text-slate-500">
                        <span className="uppercase tracking-wider text-[11px]">
                            {phase === 'ready' ? '🎉 Ready!' : 'Loading...'}
                        </span>
                        <span className="font-mono">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Flat Footer */}
            <div className="absolute bottom-6 text-xs font-bold text-slate-400 tracking-widest uppercase">
                ✦ Play • Code • Learn ✦
            </div>
        </motion.div>
    )
}
