"use client"

import { TrendingUp, Construction, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ProgressPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">Learning Analytics</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    My Progress
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                    Track your learning milestones, completed lessons, and skill achievements over time.
                </p>
            </div>

            {/* Feature Placeholder Card */}
            <Card className="p-10 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                    <Construction className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Detailed Progress Analytics Coming Soon
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                        We are building advanced learning analytics to track your module completion rates, quiz scores, and learning speed. Check back soon!
                    </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                    <Link href="/dashboard/student">
                        <Button className="bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-xs px-5 h-10 shadow-sm">
                            Return to Dashboard
                        </Button>
                    </Link>
                    <Link href="/dashboard/student/programs">
                        <Button variant="outline" className="rounded-xl text-xs h-10 px-5 flex items-center gap-2">
                            <Compass className="w-3.5 h-3.5" />
                            View Enrolled Courses
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
