"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import {
    getSlideTheme,
    getLessonPattern,
    type GraphicPatternStyle,
} from "@/lib/slide-themes";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { CueOverlayShell } from "@/components/viewer/cue-overlay-shell";

interface SlideTransitionOverlayProps {
    isVisible: boolean;
    lessonId: string;
    lessonTitle: string;
    slideIndex: number;
    slideTitle: string;
    totalSlides: number;
    /** Pre-generated audio URL from lesson-builder publish step */
    titleAudioUrl?: string;
    onBegin: () => void;
}

export function SlideTransitionOverlay({
    isVisible,
    lessonId,
    lessonTitle,
    slideIndex,
    slideTitle,
    totalSlides,
    titleAudioUrl,
    onBegin,
}: SlideTransitionOverlayProps) {
    const theme = getSlideTheme(slideIndex);
    const pattern: GraphicPatternStyle = getLessonPattern(lessonId);

    const [canBegin, setCanBegin] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);
    const overlayOpenedAtRef = useRef<number>(0);

    const handleAudioEnded = useCallback(() => {
        if (Date.now() - overlayOpenedAtRef.current >= 2000) {
            setCanBegin(true);
            setSecondsLeft(0);
        }
    }, []);

    const { stop } = useAudioPlayer({
        audioUrl: titleAudioUrl,
        autoPlay: isVisible,
        onEnded: handleAudioEnded,
    });

    useEffect(() => {
        if (!isVisible) {
            setCanBegin(false);
            setSecondsLeft(10);
            return;
        }

        overlayOpenedAtRef.current = Date.now();
        setCanBegin(false);
        setSecondsLeft(10);

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

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, slideIndex]);

    const [isStarting, setIsStarting] = useState(false);

    if (!isVisible) return null;

    const handleBegin = () => {
        if (isStarting) return;
        setIsStarting(true);
        stop();
        onBegin();
        setTimeout(() => setIsStarting(false), 500);
    };

    return (
        <CueOverlayShell theme={theme} pattern={pattern} idPrefix="slide">
            <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-lg w-full mx-6 px-8 py-10 sm:px-10 sm:py-12 bg-white/85 backdrop-blur-md rounded-[2rem] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]">
                <p
                    className="text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{ color: theme.subtleTextHex }}
                >
                    {lessonTitle}
                </p>

                <div
                    className="w-20 h-20 rounded-[1.6rem] flex items-center justify-center text-3xl font-black text-white"
                    style={{ backgroundColor: theme.btnBgHex }}
                >
                    {slideIndex + 1}
                </div>

                {totalSlides <= 12 && (
                    <div className="flex items-center justify-center flex-wrap gap-1.5">
                        {Array.from({ length: totalSlides }).map((_, index) => {
                            const dotTheme = getSlideTheme(index);
                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        index === slideIndex ? "w-6" : "w-2 opacity-50"
                                    )}
                                    style={{ backgroundColor: dotTheme.btnBgHex }}
                                />
                            );
                        })}
                    </div>
                )}

                <div className="space-y-2">
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: theme.shapeHex, color: theme.textHex }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Slide {slideIndex + 1} of {totalSlides}
                    </div>
                    <h1
                        className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight"
                        style={{ color: theme.textHex }}
                    >
                        {slideTitle}
                    </h1>
                </div>

                <button
                    disabled={!canBegin || isStarting}
                    onClick={handleBegin}
                    className={cn(
                        "mt-2 min-h-11 min-w-[220px] px-10 py-3.5 rounded-2xl text-sm font-black tracking-wide uppercase flex items-center justify-center gap-2 border-b-4 transition-all",
                        canBegin && !isStarting
                            ? "cursor-pointer active:translate-y-px active:border-b-0"
                            : "opacity-70 cursor-not-allowed"
                    )}
                    style={{
                        backgroundColor: theme.btnBgHex,
                        color: theme.btnTextHex,
                        borderBottomColor: theme.textHex,
                    }}
                >
                    {canBegin && !isStarting ? (
                        <>
                            <span>Begin Slide</span>
                            <ChevronRight className="w-5 h-5" />
                        </>
                    ) : isStarting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Starting&hellip;</span>
                        </>
                    ) : (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Get ready {secondsLeft}s</span>
                        </>
                    )}
                </button>
            </div>
        </CueOverlayShell>
    );
}
