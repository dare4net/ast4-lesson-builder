"use client"

import { Clock, ArrowRight, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

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
            className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-green-500/40 dark:hover:border-green-500/40 transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between shadow-sm hover:shadow-md"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                        <BookOpen className="w-3 h-3" />
                        {lesson.moduleName || "General"}
                    </span>
                    {lesson.duration && (
                        <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.duration}</span>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                        {lesson.title}
                    </h3>
                    {lesson.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">
                            {lesson.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="flex items-center justify-end pt-1">
                    <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-green-600 dark:text-green-400 group-hover:bg-green-50 dark:group-hover:bg-green-500/10 px-3 rounded-lg transition-all flex items-center gap-1">
                        <span>{lesson.progress > 0 ? "Continue" : "Start"}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
