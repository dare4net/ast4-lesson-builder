"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useReadAloud } from "@/context/read-aloud-context";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import {
    getSlideTheme,
    getLessonPattern,
    type GraphicPatternStyle,
    type SlideTheme,
} from "@/lib/slide-themes";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";

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

/**
 * Render flat graphic background vector elements based on the lesson's pattern
 */
function RenderGraphicBackground({
    pattern,
    theme,
}: {
    pattern: GraphicPatternStyle;
    theme: SlideTheme;
}) {
    const color = theme.shapeHex;

    switch (pattern) {
        case "polka-dots":
            return (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern id="polka-dots-pat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="15" cy="15" r="8" fill={color} />
                            <circle cx="45" cy="45" r="12" fill={color} />
                            <circle cx="45" cy="15" r="5" fill={color} />
                            <circle cx="15" cy="45" r="6" fill={color} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#polka-dots-pat)" />
                </svg>
            );

        case "waves":
            return (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-50">
                    <svg className="absolute -top-10 left-0 w-full h-64" viewBox="0 0 1440 320" fill="none">
                        <path
                            fill={color}
                            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                    </svg>
                    <svg className="absolute -bottom-10 left-0 w-full h-64 rotate-180" viewBox="0 0 1440 320" fill="none">
                        <path
                            fill={color}
                            d="M0,96L48,128C96,160,192,224,288,224C384,224,480,160,576,149.3C672,139,768,181,864,192C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                    </svg>
                </div>
            );

        case "polygons":
            return (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <polygon points="50,20 90,90 10,90" fill={color} transform="translate(100, 80) rotate(15)" />
                    <polygon points="50,10 90,80 10,80" fill={color} transform="translate(800, 400) rotate(-25)" />
                    <polygon points="40,0 80,60 0,60" fill={color} transform="translate(1100, 100) rotate(40)" />
                    <rect x="200" y="450" width="70" height="70" fill={color} transform="rotate(30 235 485)" />
                    <rect x="950" y="180" width="90" height="90" rx="16" fill={color} transform="rotate(12 995 225)" />
                </svg>
            );

        case "squiggles":
            return (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 50 150 Q 100 100 150 150 T 250 150 T 350 150"
                        stroke={color}
                        strokeWidth="14"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 800 100 Q 850 50 900 100 T 1000 100 T 1100 100"
                        stroke={color}
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 200 500 Q 250 450 300 500 T 400 500 T 500 500"
                        stroke={color}
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <circle cx="750" cy="480" r="40" fill={color} />
                    <circle cx="1050" cy="420" r="25" fill={color} />
                </svg>
            );

        case "sunburst":
            return (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
                    <svg className="w-[1200px] h-[1200px]" viewBox="0 0 100 100">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <path
                                key={i}
                                d={`M 50 50 L ${50 + 60 * Math.cos((i * 30 * Math.PI) / 180)} ${50 + 60 * Math.sin((i * 30 * Math.PI) / 180)
                                    } L ${50 + 60 * Math.cos(((i * 30 + 15) * Math.PI) / 180)} ${50 + 60 * Math.sin(((i * 30 + 15) * Math.PI) / 180)
                                    } Z`}
                                fill={color}
                            />
                        ))}
                    </svg>
                </div>
            );

        default:
            return null;
    }
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
    // Tracks when the overlay first opened so we can filter out instant TTS errors
    const overlayOpenedAtRef = useRef<number>(0);

    // Audio completion callback — only unlocks early if at least 2s have passed.
    // This filters out instant TTS onerror/onend that fires when browser blocks speech.
    const handleAudioEnded = useCallback(() => {
        if (Date.now() - overlayOpenedAtRef.current >= 2000) {
            setCanBegin(true);
            setSecondsLeft(0);
        }
    }, []);

    // Pre-recorded audio — auto-plays when overlay opens
    const { stop } = useAudioPlayer({
        audioUrl: titleAudioUrl,
        autoPlay: isVisible,
        onEnded: handleAudioEnded,
    });

    // Always run a 10s countdown per slide, regardless of read-aloud setting.
    // Audio completion (handleAudioEnded) can unlock the button early.
    useEffect(() => {
        if (!isVisible) {
            setCanBegin(false);
            setSecondsLeft(10);
            return;
        }

        // Record when the overlay opened (used by handleAudioEnded guard)
        overlayOpenedAtRef.current = Date.now();
        setCanBegin(false);
        setSecondsLeft(10);

        // Tick down every second; unlock at 0
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
        stop(); // stop the cue audio when the student proceeds
        onBegin();
        setTimeout(() => setIsStarting(false), 500);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 select-none overflow-hidden"
            style={{ backgroundColor: theme.solidBgHex }}
        >
            {/* Decorative SVG Graphic Elements */}
            <RenderGraphicBackground pattern={pattern} theme={theme} />

            {/* Main Content Announcement Card */}
            <div
                className="relative z-10 flex flex-col items-center gap-6 text-center max-w-lg w-full mx-6 px-10 py-12 bg-white rounded-3xl"
            >
                {/* Course / Lesson Header */}
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: theme.btnBgHex }} />
                    <p
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: theme.subtleTextHex }}
                    >
                        {lessonTitle}
                    </p>
                </div>

                {/* Slide Counter Badge */}
                <div
                    className="px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm"
                    style={{
                        backgroundColor: theme.shapeHex,
                        color: theme.textHex,
                    }}
                >
                    Slide {slideIndex + 1} of {totalSlides}
                </div>

                {/* Main Slide Title */}
                <h1
                    className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight my-1"
                    style={{ color: theme.textHex }}
                >
                    {slideTitle}
                </h1>

                {/* Action Button to Dismiss Overlay */}
                <button
                    disabled={!canBegin || isStarting}
                    onClick={handleBegin}
                    className={cn(
                        "mt-4 px-10 py-4 rounded-2xl text-sm font-black tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-lg transition-all min-w-[220px]",
                        canBegin && !isStarting
                            ? "cursor-pointer hover:scale-105 active:scale-95"
                            : "opacity-70 cursor-not-allowed"
                    )}
                    style={{
                        backgroundColor: theme.btnBgHex,
                        color: theme.btnTextHex,
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
                            <span>Please wait&hellip; {secondsLeft}s</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
