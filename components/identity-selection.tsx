"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { GraduationCap, BookOpenCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.12 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
}

export function IdentitySelection() {
    const roles = [
        {
            id: "student",
            title: "I'm a student",
            subtitle: "Learn & play",
            description: "Interactive lessons, live timers, stars, and a public pride wall you opt into.",
            icon: GraduationCap,
            href: "/auth/login?role=student",
            accentColor: "#1CB0F6",
            activeBorderColor: "#1899D6",
        },
        {
            id: "tutor",
            title: "I'm a teacher",
            subtitle: "Create & teach",
            description: "Build live courses, drop lessons, and watch your class light up the boards.",
            icon: BookOpenCheck,
            href: "/auth/login?role=tutor",
            accentColor: "#58CC02",
            activeBorderColor: "#3B8C00",
        },
    ]

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2.5 flex z-20">
                <div className="flex-1 bg-[#58CC02]" />
                <div className="flex-1 bg-[#1CB0F6]" />
                <div className="flex-1 bg-[#FFC800]" />
                <div className="flex-1 bg-[#FF4B4B]" />
                <div className="flex-1 bg-[#CE82FF]" />
            </div>

            <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#1CB0F6 1.5px, transparent 1.5px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center mb-10 max-w-lg"
            >
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="AST Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                    Who&apos;s playing?
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Pick a portal. Students get the full run. Teachers open the studio.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 gap-5 max-w-2xl w-full relative z-10"
            >
                {roles.map((role) => (
                    <motion.div key={role.id} variants={itemVariants}>
                        <Link href={role.href} className="group block h-full">
                            <div className={cn(
                                "relative h-full p-7 rounded-3xl border-2 border-slate-200 bg-white transition-all duration-200",
                                "hover:-translate-y-0.5"
                            )}>
                                <div className="flex flex-col h-full gap-5">
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                style={{ backgroundColor: `${role.accentColor}18`, color: role.accentColor }}
                                            >
                                                <role.icon className="w-6 h-6" />
                                            </div>
                                            <span
                                                className="text-[11px] font-bold px-3 py-1 rounded-full border"
                                                style={{ color: role.accentColor, borderColor: `${role.accentColor}40`, backgroundColor: `${role.accentColor}12` }}
                                            >
                                                {role.subtitle}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1.5">
                                            {role.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {role.description}
                                        </p>
                                    </div>

                                    <div
                                        className="mt-auto w-full py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-[2px]"
                                        style={{
                                            backgroundColor: role.accentColor,
                                            borderColor: role.activeBorderColor,
                                        }}
                                    >
                                        Let&apos;s go
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 text-slate-400 text-xs font-medium text-center"
            >
                After-School Tech Studio • Interactive Learning Platform
            </motion.p>
        </div>
    )
}
