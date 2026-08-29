"use client"

import type { ReactNode } from "react"
import { Edit3 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function EntityEditDialog({
    isOpen,
    onClose,
    title,
    description,
    accent = "green",
    children,
}: {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    accent?: "sky" | "green"
    children: ReactNode
}) {
    const iconClass = accent === "sky"
        ? "bg-[#EAF6FE] text-[#1CB0F6]"
        : "bg-[#EDF9E0] text-primary"

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl border-0 shadow-2xl rounded-3xl p-6 sm:p-7 bg-white text-slate-900 overflow-hidden">
                <DialogHeader className="pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconClass)}>
                            <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}
