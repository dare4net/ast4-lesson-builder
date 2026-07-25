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
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
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
            title: "Student Portal",
            subtitle: "Learn & Grow",
            description: "Access interactive lessons, complete engaging modules, and track your learning progress.",
            icon: GraduationCap,
            href: "/auth/login?role=student",
            accentColor: "#1CB0F6",
            activeBorderColor: "#1899D6",
            badgeBg: "bg-[#1CB0F6]/10",
            badgeBorder: "border-[#1CB0F6]/30",
            badgeText: "text-[#1CB0F6]",
            iconBg: "bg-[#1CB0F6]/10 border border-[#1CB0F6]/20",
            iconColor: "text-[#1CB0F6]",
            cardHover: "hover:border-[#1CB0F6]/40",
        },
        {
            id: "tutor",
            title: "Instructor Studio",
            subtitle: "Create & Empower",
            description: "Design interactive courses, build engaging learning activities, and inspire your students.",
            icon: BookOpenCheck,
            href: "/auth/login?role=tutor",
            accentColor: "#58CC02",
            activeBorderColor: "#3B8C00",
            badgeBg: "bg-[#58CC02]/10",
            badgeBorder: "border-[#58CC02]/30",
            badgeText: "text-[#58CC02]",
            iconBg: "bg-[#58CC02]/10 border border-[#58CC02]/20",
            iconColor: "text-[#58CC02]",
            cardHover: "hover:border-[#58CC02]/40",
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Top green stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#58CC02]" />

            {/* Subtle background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#1CB0F6]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#58CC02]/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center mb-10 max-w-lg"
            >
                {/* Logo */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden">
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

                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
                    Choose Your Portal
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Select your role to access your personalized learning or teaching workspace.
                </p>
            </motion.div>

            {/* Role Cards */}
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
                                "relative h-full p-7 rounded-3xl border-2 border-slate-200 bg-white transition-all duration-200 shadow-sm",
                                role.cardHover,
                                "hover:-translate-y-0.5 hover:shadow-md"
                            )}>
                                <div className="flex flex-col h-full gap-5">
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", role.iconBg)}>
                                                <role.icon className={cn("w-6 h-6", role.iconColor)} />
                                            </div>
                                            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full border", role.badgeBg, role.badgeBorder, role.badgeText)}>
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

                                    {/* 3D Duo-style button */}
                                    <div
                                        className="mt-auto w-full py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 border-b-4 active:border-b-0 active:translate-y-[2px] group-hover:opacity-90"
                                        style={{
                                            backgroundColor: role.accentColor,
                                            borderColor: role.activeBorderColor,
                                        }}
                                    >
                                        Enter Portal
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
