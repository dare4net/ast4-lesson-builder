"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import {
    getSlideTheme,
    getLessonPattern,
    type GraphicPatternStyle,
} from "@/lib/slide-themes";
import { ChevronRight, Loader2 } from "lucide-react";
import { CueOverlayShell } from "@/components/viewer/cue-overlay-shell";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface SlideTransitionOverlayProps {
    isVisible: boolean;
    lessonId: string;
    lessonTitle: string;
    slideIndex: number;
    slideTitle: string;
    totalSlides: number;
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
    const reduceMotion = useReducedMotion();
    const [isStarting, setIsStarting] = useState(false);

    const { stop } = useAudioPlayer({
        audioUrl: titleAudioUrl,
        autoPlay: isVisible,
    });

    if (!isVisible) return null;

    const handleBegin = () => {
        if (isStarting) return;
        setIsStarting(true);
        stop();
        onBegin();
        setTimeout(() => setIsStarting(false), 500);
    };

    const enter = reduceMotion
        ? { opacity: 0 }
        : { opacity: 0, y: 14 };
    const shown = { opacity: 1, y: 0 };

    return (
        <CueOverlayShell theme={theme} pattern={pattern} idPrefix="slide" variant="simple" className="p-6">
            <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-md w-full">
                <motion.p
                    initial={enter}
                    animate={shown}
                    transition={{ duration: 0.28 }}
                    className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500"
                >
                    {lessonTitle}
                </motion.p>

                <motion.p
                    initial={enter}
                    animate={shown}
                    transition={{ duration: 0.28, delay: 0.06 }}
                    className="text-xs font-extrabold uppercase tracking-widest"
                    style={{ color: theme.btnBgHex }}
                >
                    Slide {slideIndex + 1} of {totalSlides}
                </motion.p>

                <motion.p
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="text-6xl font-black tabular-nums leading-none"
                    style={{ color: theme.textHex }}
                >
                    {slideIndex + 1}
                </motion.p>

                {totalSlides <= 12 && (
                    <motion.div
                        initial={enter}
                        animate={shown}
                        transition={{ duration: 0.28, delay: 0.14 }}
                        className="flex items-center justify-center flex-wrap gap-1.5"
                    >
                        {Array.from({ length: totalSlides }).map((_, index) => {
                            const dotTheme = getSlideTheme(index);
                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        index === slideIndex ? "w-6" : "w-2 opacity-40"
                                    )}
                                    style={{ backgroundColor: dotTheme.btnBgHex }}
                                />
                            );
                        })}
                    </motion.div>
                )}

                <motion.h1
                    initial={enter}
                    animate={shown}
                    transition={{ duration: 0.32, delay: 0.18 }}
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight"
                    style={{ color: theme.textHex }}
                >
                    {slideTitle}
                </motion.h1>

                <motion.div
                    initial={enter}
                    animate={shown}
                    transition={{ duration: 0.28, delay: 0.24 }}
                    className="w-full max-w-xs pt-2"
                >
                    <Button
                        variant="duo"
                        disabled={isStarting}
                        onClick={handleBegin}
                        className="w-full"
                        style={{
                            backgroundColor: theme.btnBgHex,
                            color: theme.btnTextHex,
                            borderColor: theme.btnBgHex,
                        }}
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Starting
                            </>
                        ) : (
                            <>
                                Begin
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </CueOverlayShell>
    );
}
