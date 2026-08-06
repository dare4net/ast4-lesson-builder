"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { ComponentValidationResult, MasterValidationReport } from "@/lib/validation/types";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    result?: ComponentValidationResult | MasterValidationReport | null;
}

export function VerificationModal({
    isOpen,
    onClose,
    title = "Component Verification Status",
    result
}: VerificationModalProps) {
    if (!result) return null;

    const errors = result.errors || [];
    const warnings = result.warnings || [];
    const isValid = result.isValid;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isValid ? (
                                errors.length === 0 && warnings.length === 0 ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                )
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                                    <XCircle className="w-6 h-6" />
                                </div>
                            )}
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight text-white">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                                    Senate Verification Audit Report
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Status Pills */}
                        <div className="flex items-center gap-2">
                            {errors.length > 0 && (
                                <span className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                                    {errors.length} Error{errors.length > 1 ? "s" : ""}
                                </span>
                            )}
                            {warnings.length > 0 && (
                                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                                    {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
                                </span>
                            )}
                            {errors.length === 0 && warnings.length === 0 && (
                                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                                    100% Valid
                                </span>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Perfect Pass State */}
                    {errors.length === 0 && warnings.length === 0 && (
                        <div className="p-6 text-center rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 space-y-2">
                            <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                            <p className="font-semibold text-base text-emerald-200">All Verification Checks Passed!</p>
                            <p className="text-xs text-emerald-400/80">
                                This component adheres to all component schema structures, pedagogical intertwining rules, and valid interactive properties.
                            </p>
                        </div>
                    )}

                    {/* Errors Section */}
                    {errors.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                <XCircle className="w-4 h-4" /> Critical Errors ({errors.length})
                            </h4>
                            <div className="space-y-2">
                                {errors.map((err, i) => (
                                    <div
                                        key={err.id || i}
                                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-200 space-y-1 text-xs"
                                    >
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[10px] text-rose-400 uppercase font-mono tracking-wider bg-rose-900/40 px-2 py-0.5 rounded">
                                                {err.code.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <p className="text-rose-100 font-medium leading-relaxed mt-1">{err.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings Section */}
                    {warnings.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> Recommended Improvements ({warnings.length})
                            </h4>
                            <div className="space-y-2">
                                {warnings.map((warn, i) => (
                                    <div
                                        key={warn.id || i}
                                        className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200 space-y-1.5 text-xs"
                                    >
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider bg-amber-900/40 px-2 py-0.5 rounded">
                                                {warn.code.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <p className="text-amber-100 font-medium leading-relaxed mt-1">{warn.message}</p>
                                        {warn.recommendation && (
                                            <div className="p-2 rounded-lg bg-amber-900/30 text-amber-300 text-[11px] border border-amber-800/40 flex items-start gap-2 mt-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                                <span><strong>Recommendation:</strong> {warn.recommendation}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                    <Button
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs px-6"
                    >
                        Close Audit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
