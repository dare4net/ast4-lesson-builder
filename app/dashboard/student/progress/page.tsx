"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Target,
    Zap,
    Trophy,
    Star,
    TrendingUp,
    Calendar,
    ChevronRight,
    Award,
    Activity
} from "lucide-react"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const skillData = [
    { subject: 'Logic', A: 120, fullMark: 150 },
    { subject: 'Design', A: 98, fullMark: 150 },
    { subject: 'Speed', A: 86, fullMark: 150 },
    { subject: 'Focus', A: 99, fullMark: 150 },
    { subject: 'Tech', A: 85, fullMark: 150 },
    { subject: 'Creative', A: 65, fullMark: 150 },
];

const milestones = [
    { id: 1, title: "Initial Deployment", date: "Jan 12", xp: "+500", active: true },
    { id: 2, title: "Module Alpha Clear", date: "Jan 24", xp: "+1200", active: true },
    { id: 3, title: "7-Day Pulse", date: "Feb 01", xp: "+300", active: true },
    { id: 4, title: "Senior Directive", date: "TBD", xp: "+5000", active: false },
]

export default function ProgressPage() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-amber-500 rounded-full" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Identity Verification</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">Performance Metrics</h1>
                <p className="text-slate-500 font-medium max-w-xl">
                    Visualizing your cognitive growth and directive completion performance across the platform.
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Skill Radar Chart Section */}
                <Card className="lg:col-span-2 p-8 bg-slate-900/40 border-slate-800 rounded-[2.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8">
                        <Activity className="w-8 h-8 text-emerald-500/20" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full h-[400px] max-w-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                    <Radar
                                        name="Agent Stats"
                                        dataKey="A"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.1}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex-1 space-y-6 w-full">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Cognitive Profile</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Critical Thinking", points: "4,200 XP", perc: 85, color: "bg-emerald-500" },
                                    { label: "Systems Architecture", points: "2,100 XP", perc: 45, color: "bg-blue-500" },
                                    { label: "Creative Synthesis", points: "900 XP", perc: 30, color: "bg-purple-500" },
                                ].map(stat => (
                                    <div key={stat.label} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">{stat.label}</span>
                                            <span className="text-white">{stat.points}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.perc}%` }}
                                                className={cn("h-full", stat.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Badges & Achievements */}
                <Card className="p-8 bg-slate-900/40 border-slate-800 rounded-[2.5rem] flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Achievements</h3>
                        <Trophy className="w-4 h-4 text-amber-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={cn(
                                "aspect-square rounded-2xl flex items-center justify-center border transition-all group cursor-help",
                                i <= 4 ? "bg-amber-500/5 border-amber-500/20 text-amber-500" : "bg-slate-950 border-slate-800 text-slate-700"
                            )}>
                                <Award className={cn("w-6 h-6", i <= 4 ? "animate-pulse" : "opacity-40")} />
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-slate-800 space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                            <Zap className="w-6 h-6 text-emerald-500" />
                            <div>
                                <span className="text-[10px] font-black text-white uppercase tracking-tight block">Pulse Streak</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">7 CONSECUTIVE DAYS</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Timeline / Activity History */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity Timeline</h2>
                    <Button variant="ghost" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">Export Log</Button>
                </div>

                <div className="relative space-y-4">
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-800" />

                    {milestones.map((m) => (
                        <div key={m.id} className="relative pl-14 flex items-center justify-between group">
                            <div className={cn(
                                "absolute left-4 w-4 h-4 rounded-full border-4 border-slate-950 z-10",
                                m.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-800"
                            )} />

                            <div className="flex items-center gap-6 flex-1">
                                <span className="text-[10px] font-black text-slate-600 uppercase w-12">{m.date}</span>
                                <div className={cn(
                                    "px-6 py-4 rounded-2xl border flex-1 transition-all",
                                    m.active ? "bg-slate-900 border-slate-800 group-hover:border-emerald-500/30" : "bg-slate-950 border-slate-900 opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-white uppercase tracking-wider">{m.title}</span>
                                        <span className={cn("text-[9px] font-black tracking-widest", m.active ? "text-emerald-500" : "text-slate-600")}>{m.xp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
