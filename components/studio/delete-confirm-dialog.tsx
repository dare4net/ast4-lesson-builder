"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2, ShieldCheck, Loader2 } from "lucide-react"

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    itemName: string
    itemType: 'program' | 'module' | 'lesson'
    enrolledStudents?: string[]
    enrolledCount?: number
    onConfirm: () => Promise<{ is_soft_deleted?: boolean } | void>
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    title,
    itemName,
    itemType,
    enrolledStudents = [],
    enrolledCount = 0,
    onConfirm
}: DeleteConfirmDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [resultMessage, setResultMessage] = useState<string | null>(null)

    // Format enrolled students disclaimer
    const getEnrolledDisclaimer = () => {
        if (enrolledCount === 0 || enrolledStudents.length === 0) {
            return "No students are currently enrolled in this course."
        }

        const topThree = enrolledStudents.slice(0, 3)
        const remaining = enrolledCount - topThree.length

        if (remaining > 0) {
            return `${topThree.join(", ")} and ${remaining} other${remaining > 1 ? 's' : ''} are currently enrolled in this course.`
        } else {
            return `${topThree.join(", ")} ${topThree.length === 1 ? 'is' : 'are'} currently enrolled in this course.`
        }
    }

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            const res = await onConfirm()
            if (res && res.is_soft_deleted) {
                setResultMessage("Item archived to protect student records.")
                setTimeout(() => {
                    setResultMessage(null)
                    onClose()
                }, 2000)
            } else {
                onClose()
            }
        } catch (error) {
            console.error(`Failed to delete ${itemType}:`, error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-2 border-red-500 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black text-red-600">
                        <AlertTriangle className="w-6 h-6 text-red-500" /> Delete {itemType.toUpperCase()}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-bold">
                        Are you sure you want to delete <span className="text-slate-900 font-black">"{itemName}"</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 pt-1">
                    {resultMessage ? (
                        <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-start gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-emerald-900 leading-snug">{resultMessage}</p>
                        </div>
                    ) : (
                        <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl space-y-1">
                            <p className="text-xs font-black text-red-900">Student Enrollment Notice</p>
                            <p className="text-[11px] text-red-700 font-bold leading-relaxed">
                                {getEnrolledDisclaimer()}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="font-bold border-2 border-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSubmitting || !!resultMessage}
                        className="bg-red-600 border-2 border-red-700 hover:bg-red-700 font-black text-white"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Trash2 className="w-4 h-4" /> Confirm Delete
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
