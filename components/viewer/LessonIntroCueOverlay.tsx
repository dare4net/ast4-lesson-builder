"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import {
    getSlideTheme,
    getLessonPattern,
    type GraphicPatternStyle,
    type SlideTheme,
} from "@/lib/slide-themes";
import { ChevronRight, Loader2, BookOpen, Layers } from "lucide-react";

interface LessonIntroCueOverlayProps {
    isVisible: boolean;
    lessonData: any;
    moduleTitle?: string;
    lessonNumber?: number;
    onBegin: () => void;
}

/** Render flat graphic background vector elements based on the lesson's pattern */
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
                        <pattern id="polka-dots-pat-intro" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="15" cy="15" r="8" fill={color} />
                            <circle cx="45" cy="45" r="12" fill={color} />
                            <circle cx="45" cy="15" r="5" fill={color} />
                            <circle cx="15" cy="45" r="6" fill={color} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#polka-dots-pat-intro)" />
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

    // Audio end handler — unlocks button immediately
    const handleAudioEnded = useCallback(() => {
        setCanBegin(true);
        setSecondsLeft(0);
    }, []);

    // Custom pre-recorded audio player
    const { stop: stopAudioPlayer } = useAudioPlayer({
        audioUrl: introAudioUrl,
        autoPlay: isVisible && !!introAudioUrl,
        onEnded: handleAudioEnded,
    });


    // 30-second countdown timer (pre-recorded intro audio when available)
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 select-none overflow-hidden p-4 md:p-6"
            style={{ backgroundColor: theme.solidBgHex }}
        >
            {/* Decorative SVG Graphic Background */}
            <RenderGraphicBackground pattern={pattern} theme={theme} />

            {/* Main Lesson Introduction Card — No shadows, compact responsive card */}
            <div className="relative z-10 flex flex-col justify-between items-center text-center max-w-lg w-full h-auto max-h-[85vh] sm:max-h-[90vh] my-auto bg-white rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-slate-200 overflow-y-auto space-y-3.5 sm:space-y-5 shadow-sm">

                {/* Header: Clean Module & Lesson Identifier Badge */}
                <div className="flex flex-col items-center space-y-1.5 w-full">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lesson {lessonNumber} &bull; {moduleTitle}</span>
                    </div>
                </div>

                {/* Lesson Title & Description Section */}
                <div className="space-y-1.5 max-w-lg">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Today&apos;s Lesson: <span className="text-indigo-600">{lessonTitle}</span>
                    </h1>

                    {/* Lesson Description (Only shown if description is present) */}
                    {lessonDescription && (
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl text-left">
                            <span className="font-extrabold text-slate-800">You&apos;ll learn about:</span> {lessonDescription}
                        </p>
                    )}
                </div>

                {/* Slide Enumeration Breakdown Grid */}
                {slides.length > 0 && (
                    <div className="w-full space-y-1.5 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest px-0.5">
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                            <span>What you will learn ({slides.length} slides)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                            {slides.map((slide: any, index: number) => (
                                <div
                                    key={slide.id || index}
                                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                        {index + 1}
                                    </span>
                                    <span className="truncate">{slide.title || `Slide ${index + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Skip / Begin Button — No shadows, rounded-xl shape */}
                <div className="w-full pt-2 shrink-0">
                    <button
                        disabled={!canBegin || isStarting}
                        onClick={handleBegin}
                        className={cn(
                            "w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-b-4",
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
                                <span>Starting Cue&hellip; Skip in {secondsLeft}s</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
