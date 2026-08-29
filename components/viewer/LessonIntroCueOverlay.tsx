"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import {
    getSlideTheme,
    getLessonPattern,
    type GraphicPatternStyle,
} from "@/lib/slide-themes";
import { ChevronRight, Loader2, BookOpen, Layers } from "lucide-react";
import { CueOverlayShell } from "@/components/viewer/cue-overlay-shell";

interface LessonIntroCueOverlayProps {
    isVisible: boolean;
    lessonData: any;
    moduleTitle?: string;
    lessonNumber?: number;
    onBegin: () => void;
}

export function LessonIntroCueOverlay({
    isVisible,
    lessonData,
    moduleTitle = "Course Module",
    lessonNumber = 1,
    onBegin,
}: LessonIntroCueOverlayProps) {
    const theme = getSlideTheme(0);
    const lessonId = lessonData?.id || "lesson-intro";
    const pattern: GraphicPatternStyle = getLessonPattern(lessonId);

    const [canBegin, setCanBegin] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [isStarting, setIsStarting] = useState(false);
    const overlayOpenedAtRef = useRef<number>(0);

    const lessonTitle = lessonData?.title || "Untitled Lesson";
    const lessonDescription = lessonData?.description?.trim();
    const slides = lessonData?.slides || [];
    const introAudioUrl = lessonData?.introAudioUrl;

    const handleAudioEnded = useCallback(() => {
        setCanBegin(true);
        setSecondsLeft(0);
    }, []);

    const { stop: stopAudioPlayer } = useAudioPlayer({
        audioUrl: introAudioUrl,
        autoPlay: isVisible && !!introAudioUrl,
        onEnded: handleAudioEnded,
    });

    useEffect(() => {
        if (!isVisible) {
            setCanBegin(false);
            setSecondsLeft(30);
            return;
        }

        overlayOpenedAtRef.current = Date.now();
        setSecondsLeft(30);

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(interval);
                    setCanBegin(true);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, lessonData]);

    if (!isVisible || !lessonData) return null;

    const handleBegin = () => {
        if (isStarting) return;
        setIsStarting(true);
        stopAudioPlayer();
        onBegin();
        setTimeout(() => setIsStarting(false), 500);
    };

    return (
        <CueOverlayShell theme={theme} pattern={pattern} idPrefix="intro" className="p-4 md:p-6">
            <div className="relative z-10 flex flex-col justify-between items-center text-center max-w-lg w-full h-auto max-h-[85vh] sm:max-h-[90vh] my-auto bg-white/85 backdrop-blur-md rounded-[2rem] p-5 sm:p-7 md:p-8 overflow-y-auto space-y-4 sm:space-y-5 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]">
                <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider"
                    style={{ backgroundColor: theme.shapeHex, color: theme.textHex }}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lesson {lessonNumber} · {moduleTitle}</span>
                </div>

                <div className="space-y-2 max-w-lg">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Today&apos;s lesson
                    </p>
                    <h1
                        className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight"
                        style={{ color: theme.textHex }}
                    >
                        {lessonTitle}
                    </h1>

                    {lessonDescription && (
                        <p
                            className="text-xs sm:text-sm font-semibold leading-relaxed p-3 sm:p-3.5 rounded-2xl text-left"
                            style={{ backgroundColor: theme.solidBgHex, color: theme.textHex }}
                        >
                            <span className="font-extrabold">You&apos;ll learn about:</span> {lessonDescription}
                        </p>
                    )}
                </div>

                {slides.length > 0 && (
                    <div className="w-full space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest px-0.5" style={{ color: theme.subtleTextHex }}>
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>What you will learn ({slides.length} slides)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                            {slides.map((slide: any, index: number) => {
                                const slideTheme = getSlideTheme(index);
                                return (
                                    <div
                                        key={slide.id || index}
                                        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-white/80 text-[11px] sm:text-xs font-bold text-slate-700"
                                        style={{ border: `2px solid ${slideTheme.shapeHex}` }}
                                    >
                                        <span
                                            className="shrink-0 w-6 h-6 rounded-lg text-white flex items-center justify-center text-[10px] font-black"
                                            style={{ backgroundColor: slideTheme.btnBgHex }}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="truncate">{slide.title || `Slide ${index + 1}`}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="w-full pt-1 shrink-0">
                    <button
                        disabled={!canBegin || isStarting}
                        onClick={handleBegin}
                        className={cn(
                            "w-full min-h-11 h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-b-4",
                            canBegin && !isStarting
                                ? "bg-[#58CC02] hover:bg-[#46A302] text-white border-[#3B8C00] cursor-pointer active:translate-y-px active:border-b-0"
                                : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-80"
                        )}
                    >
                        {canBegin && !isStarting ? (
                            <>
                                <span>Start Lesson Now</span>
                                <ChevronRight className="w-4 h-4" />
                            </>
                        ) : isStarting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Starting Lesson&hellip;</span>
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Get ready {secondsLeft}s</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </CueOverlayShell>
    );
}
