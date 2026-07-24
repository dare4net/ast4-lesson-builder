"use client"

import { motion } from "framer-motion"
import { User, GraduationCap, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.4
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100 } }
}

export function IdentitySelection() {
    const roles = [
        {
            id: "student",
            title: "Student",
            subtitle: "Unlock your potential",
            description: "Access your lessons, track your progress, and earn rewards.",
            icon: GraduationCap,
            href: "/auth/login?role=student",
            color: "from-blue-500/20 to-blue-600/20",
            accent: "text-blue-400",
            border: "border-blue-500/30",
            bg: "bg-blue-500/5",
            glow: "shadow-blue-500/10"
        },
        {
            id: "tutor",
            title: "Tutor",
            subtitle: "Master of Studio",
            description: "Create interactive content, manage classes, and inspire students.",
            icon: ShieldCheck,
            href: "/auth/login?role=tutor",
            color: "from-emerald-500/20 to-emerald-600/20",
            accent: "text-emerald-400",
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/5",
            glow: "shadow-emerald-500/10"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">IDENTITY PROTOCOL</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                    IDENTIFY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">YOURSELF</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Select your operational interface</p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10"
            >
                {roles.map((role) => (
                    <motion.div key={role.id} variants={itemVariants}>
                        <Link href={role.href} className="group block h-full">
                            <div className={cn(
                                "relative h-full p-8 rounded-[2.5rem] border bg-slate-900/40 backdrop-blur-xl transition-all duration-500",
                                role.border,
                                "hover:scale-[1.02] hover:bg-slate-900/60 shadow-2xl",
                                role.glow
                            )}>
                                {/* Accent Corner */}
                                <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-50 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2", role.color)} />

                                <div className="relative z-10">
                                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-slate-950 border transition-transform duration-500 group-hover:rotate-12", role.border)}>
                                        <role.icon className={cn("w-8 h-8", role.accent)} />
                                    </div>

                                    <div className="mb-2">
                                        <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", role.accent)}>{role.subtitle}</span>
                                        <h3 className="text-3xl font-black text-white tracking-tight mt-1">{role.title}</h3>
                                    </div>

                                    <p className="text-slate-400 text-sm leading-relaxed mb-10 min-h-[3rem]">
                                        {role.description}
                                    </p>

                                    <div className={cn(
                                        "inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 group-hover:gap-4",
                                        role.accent
                                    )}>
                                        Access Terminal <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute bottom-6 right-8 opacity-10 font-black text-6xl tracking-tighter select-none pointer-events-none">
                                    {role.id.toUpperCase()}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-16 text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]"
            >
                SECURE CLOUD-BASED ACCESS | AFTER-SCHOOL TECH v4.0
            </motion.p>
        </div>
    )
}
