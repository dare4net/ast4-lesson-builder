import type { ReactNode } from "react"
import { Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

export function CourseHero({
    title,
    description,
    progressPct,
    badge = "Enrolled Course",
    extra,
}: {
    title: string
    description?: string
    progressPct: number
    badge?: string
    extra?: ReactNode
}) {
    return (
        <Card className="p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 justify-between items-center">
            <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 w-fit mx-auto md:mx-0">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-extrabold text-primary">{badge}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    {title}
                </h1>
                {description ? (
                    <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">
                        {description}
                    </p>
                ) : null}
                {extra}
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 min-w-[160px]">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                <span className="text-4xl font-extrabold text-primary">{Math.round(progressPct)}%</span>
                <div className="h-2 w-36 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                    />
                </div>
            </div>
        </Card>
    )
}
