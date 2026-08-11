"use client"

import * as React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Award, Eye, Clock, User, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface StudentPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    studentName?: string
    lessonId: string
    lessonTitle?: string
    components?: any[]
    interactions?: Record<string, any>
    onMarkSuccess?: () => void
}

export function StudentPreviewModal({
    isOpen,
    onClose,
    studentId,
    studentName = "Student Agent",
    lessonId,
    lessonTitle = "Lesson Session",
    components = [],
    interactions = {},
    onMarkSuccess
}: StudentPreviewModalProps) {
    const { toast } = useToast()
    const [loadingComponentId, setLoadingComponentId] = useState<string | null>(null)
    const [localInteractions, setLocalInteractions] = useState<Record<string, any>>(interactions)

    React.useEffect(() => {
        setLocalInteractions(interactions)
    }, [interactions])

    // Filter components that require or have responses
    const pendingComponents = components.filter(c => {
        const inter = localInteractions[c.id]
        return c.type === "shortAnswer" || c.type === "fillInTheBlank" || inter?.isPendingMarking
    })

    const handleMarkResponse = async (componentId: string, maxPoints: number, isApproved: boolean) => {
        setLoadingComponentId(componentId)
        try {
            await apiClient.studio.markStudentResponse(studentId, lessonId, componentId, {
                score: maxPoints,
                isApproved
            })

            setLocalInteractions(prev => ({
                ...prev,
                [componentId]: {
                    ...prev[componentId],
                    isPendingMarking: false,
                    tutorMarked: true,
                    score: isApproved ? maxPoints : 0
                }
            }))

            toast({
                title: isApproved ? "Points Awarded!" : "Mark Recorded",
                description: isApproved ? `Awarded +${maxPoints} pts to ${studentName}.` : `Marked 0 pts for ${studentName}.`,
            })

            if (onMarkSuccess) onMarkSuccess()
        } catch (err: any) {
            toast({
                title: "Error Marking Response",
                description: err.message || "Failed to submit tutor mark.",
                variant: "destructive"
            })
        } finally {
            setLoadingComponentId(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-slate-950 text-slate-100 border-2 border-slate-800 rounded-3xl p-0 overflow-hidden shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-6 bg-slate-900 border-b border-slate-800 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest">
                                    Studio Tutor Inspection
                                </Badge>
                                <Badge className="bg-slate-800 text-slate-300 text-[9px] font-bold">
                                    {studentName}
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">
                                {lessonTitle}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400 font-medium">
                                Inspect student open-ended submissions and perform manual tutor marking.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Submissions List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {pendingComponents.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                            <h4 className="text-base font-bold text-slate-300">No Open-Ended Submissions Found</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                This lesson does not contain shortAnswer or fillInTheBlank components requiring tutor evaluation.
                            </p>
                        </div>
                    ) : (
                        pendingComponents.map((comp, idx) => {
                            const inter = localInteractions[comp.id] || {}
                            const isPending = inter.isPendingMarking || (!inter.tutorMarked && inter.userAnswer)
                            const maxPoints = comp.props?.points || 10

                            return (
                                <div
                                    key={comp.id || idx}
                                    className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                                                {comp.type} Component #{idx + 1}
                                            </span>
                                            <h4 className="text-sm font-bold text-slate-200">
                                                {comp.props?.question || comp.props?.title || "Open-ended Question"}
                                            </h4>
                                        </div>
                                        {inter.tutorMarked ? (
                                            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Marked (+{inter.score || 0} pts)
                                            </Badge>
                                        ) : isPending ? (
                                            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase animate-pulse">
                                                <AlertCircle className="w-3 h-3 mr-1" /> Pending Tutor Review
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-800 text-slate-400 text-[9px] font-black uppercase">
                                                Unsubmitted
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Student Answer Card */}
                                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <User className="w-3 h-3" /> Student Submitted Answer:
                                        </span>
                                        <p className="text-sm font-semibold text-slate-100 italic leading-relaxed">
                                            "{inter.userAnswer || inter.response || "No text submitted yet."}"
                                        </p>
                                    </div>

                                    {/* Marking Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Max Available: <span className="text-purple-400 font-bold">{maxPoints} pts</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                disabled={loadingComponentId === comp.id || !inter.userAnswer}
                                                onClick={() => handleMarkResponse(comp.id, maxPoints, false)}
                                                className="h-9 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs"
                                            >
                                                <X className="w-3.5 h-3.5 mr-1" /> 0 Pts
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={loadingComponentId === comp.id || !inter.userAnswer}
                                                onClick={() => handleMarkResponse(comp.id, maxPoints, true)}
                                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                                            >
                                                <Award className="w-3.5 h-3.5 mr-1.5" /> Award +{maxPoints} Pts
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
