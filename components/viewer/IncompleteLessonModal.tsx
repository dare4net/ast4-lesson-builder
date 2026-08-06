"use client";

import React, { useEffect } from "react";
import { AlertTriangle, ArrowRight, Play, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoundEffects } from "@/lib/sound-effects";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface IncompleteLessonModalProps {
    isOpen: boolean;
    completedSlidesCount: number;
    totalSlidesCount: number;
    onKeepLearning: () => void;
    onEndAnyway: () => void;
}

export function IncompleteLessonModal({
    isOpen,
    completedSlidesCount,
    totalSlidesCount,
    onKeepLearning,
    onEndAnyway,
}: IncompleteLessonModalProps) {
    // Play rejection sound when modal opens
    useEffect(() => {
        if (isOpen) {
            SoundEffects.play('incorrect')
        }
    }, [isOpen])

    if (!isOpen) return null;

    const remaining = Math.max(0, totalSlidesCount - completedSlidesCount);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onKeepLearning()}>
            <DialogContent className="sm:max-w-md rounded-3xl bg-white border-2 border-amber-200 p-6">
                <DialogHeader className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-xl font-extrabold text-slate-800">
                        Lesson Not Finished Yet
                    </DialogTitle>
                    <DialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed">
                        You have cleared <span className="font-extrabold text-amber-600 tabular-nums">{completedSlidesCount} of {totalSlidesCount}</span> slides.
                        You still have <span className="font-extrabold text-amber-600 tabular-nums">{remaining} incomplete {remaining === 1 ? 'slide' : 'slides'}</span> remaining.
                        If you end now, your current score will be saved, but the lesson status will not change to <span className="font-bold text-[#58CC02]">Completed</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <Button
                        onClick={onKeepLearning}
                        className="w-full sm:flex-1 h-11 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold text-xs border-b-4 border-[#3B8C00] active:border-b-0 transition-all flex items-center justify-center gap-1.5"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Keep Learning</span>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={onEndAnyway}
                        className="w-full sm:w-auto h-11 px-4 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                        <span>End Anyway</span>
                        <LogOut className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
