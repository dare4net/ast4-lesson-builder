"use client"

import { Clock, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LessonCardProps {
    lesson: {
        id: string
        title: string
        description?: string
        moduleName?: string
        progress: number
        duration?: string
    }
    onClick?: () => void
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
    return (
        <Card
            onClick={onClick}
            className="p-6 rounded-[2rem] bg-slate-900/40 border-slate-800 hover:border-emerald-500/20 transition-all group cursor-pointer relative overflow-hidden h-full active:scale-[0.98]"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-4 h-full flex flex-col">
                <div className="flex items-start justify-between">
                    <div className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{lesson.moduleName || "GENERAL"}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold">{lesson.duration || "15M"}</span>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {lesson.title}
                    </h3>
                    {lesson.description && (
                        <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wider line-clamp-1">
                            {lesson.description}
                        </p>
                    )}
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYNC PROGRESS</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-1.5 bg-slate-950 border border-slate-800 shadow-inner" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800" />
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-emerald-500/20 flex items-center justify-center text-[8px] font-bold text-emerald-400">+12</div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/5 p-0 transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
