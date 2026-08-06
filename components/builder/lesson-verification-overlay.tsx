"use client";

import React from "react";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

interface LessonVerificationOverlayProps {
    isVisible: boolean;
    lessonTitle?: string;
}

export function LessonVerificationOverlay({
    isVisible,
    lessonTitle = "Lesson File"
}: LessonVerificationOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 text-slate-100">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="relative w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                        <ShieldCheck className="w-8 h-8 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                        <span>Verifying Lesson Structure</span>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Senate Master Validator is auditing components, schemas, interactive limits, and slide structure for <span className="text-emerald-300 font-semibold">"{lessonTitle}"</span>.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 text-xs text-emerald-400 font-medium bg-slate-950/50 py-2.5 px-4 rounded-xl border border-slate-800/80">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running top-to-bottom component audit...</span>
                </div>
            </div>
        </div>
    );
}
