"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SingleItemEditorProps {
    title?: string
    points?: number
    onTitleChange?: (value: string) => void
    onPointsChange?: (value: number) => void
    children?: React.ReactNode
    className?: string
    titlePlaceholder?: string
}

export function SingleItemEditor({
    title,
    points,
    onTitleChange,
    onPointsChange,
    children,
    className,
    titlePlaceholder = "Component Title",
}: SingleItemEditorProps) {
    return (
        <div className={cn("space-y-5", className)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {onTitleChange && (
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Context Label</Label>
                        <Input
                            value={title || ""}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder={titlePlaceholder}
                            className="w-full bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-slate-200 placeholder:text-slate-600"
                        />
                    </div>
                )}
                {onPointsChange !== undefined && (
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reward Points</Label>
                        <Input
                            type="number"
                            value={points}
                            onChange={(e) => onPointsChange(Number.parseInt(e.target.value) || 0)}
                            placeholder="10"
                            className="w-full bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-slate-200 placeholder:text-slate-600"
                        />
                    </div>
                )}
            </div>

            {children && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/20 overflow-hidden shadow-inner">
                    <div className="p-4 space-y-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
