"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Trophy, CheckCircle2, RotateCcw, LogOut, Award, Target, BookOpen, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getSlideTheme, getLessonPattern } from "@/lib/slide-themes";
import { SoundEffects } from "@/lib/sound-effects";
import { useAuth } from "@/context/auth-context";
import { CertificateStudio } from "@/components/certificates/certificate-studio";
import { CERTIFICATE_PRINT_COST } from "@/lib/certificates";

interface LessonCompletionOverlayProps {
    isVisible: boolean;
    lessonId: string;
    lessonTitle: string;
    completedSlidesCount: number;
    totalSlidesCount: number;
    score: number;
    totalPossibleScore: number;
    onReview: () => void;
    onEndLesson: () => void | Promise<void>;
    nextLesson?: { id: string; title: string } | null;
    onNextLesson?: () => void | Promise<void>;
}

/** Helper hook for smooth number count-up animation */
function useCountUp(targetValue: number, isVisible: boolean, durationMs: number = 1000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCount(0);
            return;
        }

        let startTime: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(easeOutProgress * targetValue));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            }
        };

        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [targetValue, isVisible, durationMs]);

    return count;
}

export function LessonCompletionOverlay({
    isVisible,
    lessonId,
    lessonTitle,
    completedSlidesCount,
    totalSlidesCount,
    score,
    totalPossibleScore,
    onReview,
    onEndLesson,
    nextLesson,
    onNextLesson,
}: LessonCompletionOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isNavigatingNext, setIsNavigatingNext] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const { user } = useAuth();
    const studentName = user?.full_name || user?.fullName || user?.email?.split("@")[0] || "Student";

    useEffect(() => {
        if (!isVisible) {
            setIsExiting(false);
            setIsNavigatingNext(false);
        }
    }, [isVisible]);

    const handleEndLesson = async () => {
        if (isExiting || isNavigatingNext) return;
        setIsExiting(true);
        try {
            await onEndLesson();
        } catch {
            setIsExiting(false);
        }
    };

    const handleNextLesson = async () => {
        if (isExiting || isNavigatingNext || !onNextLesson) return;
        setIsNavigatingNext(true);
        try {
            await onNextLesson();
        } catch {
            setIsNavigatingNext(false);
        }
    };

    // Theme setup
    const theme = getSlideTheme(0);

    // Count up values
    const animatedSlides = useCountUp(completedSlidesCount, isVisible, 800);
    const animatedScore = useCountUp(score, isVisible, 1200);

    const accuracyPct = totalPossibleScore > 0
        ? Math.min(100, Math.round((score / totalPossibleScore) * 100))
        : 100;
    const animatedAccuracy = useCountUp(accuracyPct, isVisible, 1000);

    // Play lesson-finished fanfare when overlay appears
    useEffect(() => {
        if (isVisible) {
            SoundEffects.play('finishedLesson')
        }
    }, [isVisible])

    // Canvas Confetti Particles Animation
    useEffect(() => {
        if (!isVisible || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        const colors = ["#58CC02", "#1CB0F6", "#FFC800", "#CE82FF", "#FF4B4B", "#2B70C9"];

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            rotation: number;
            rotationSpeed: number;
            shape: "square" | "circle" | "star";
            opacity: number;
        }

        const particles: Particle[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 1.5) + (Math.random() * 1.2 - 0.6);
            const speed = Math.random() * 16 + 7;
            particles.push({
                x: width / 2 + (Math.random() * 200 - 100),
                y: height / 2 + (Math.random() * 100 - 50),
                vx: Math.cos(angle) * speed + (Math.random() * 6 - 3),
                vy: Math.sin(angle) * speed,
                size: Math.random() * 9 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                shape: Math.random() > 0.4 ? "square" : Math.random() > 0.5 ? "circle" : "star",
                opacity: 1,
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.32; // Gravity
                p.vx *= 0.98;
                p.rotation += p.rotationSpeed;
                if (p.y > height + 20) p.opacity -= 0.02;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;

                if (p.shape === "circle") {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === "square") {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    for (let s = 0; s < 5; s++) {
                        ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, -Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
                        ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2), -Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2));
                    }
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden sm:p-4 md:p-6"
                style={{ backgroundColor: theme.solidBgHex }}
            >
                {/* Foreground Confetti Canvas (z-30 to burst over entire overlay) */}
                <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

                {/* Subtle Graphic Background Pattern */}
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="celebration-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="3" fill={theme.shapeHex} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#celebration-grid)" />
                    </svg>
                </div>

                {/* Main Celebration Wide Card (Full screen on mobile, max-w-2xl card on sm+) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative z-10 flex flex-col justify-between items-center text-center w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-3xl border-0 sm:border-4 border-white p-6 md:p-10 overflow-y-auto sm:overflow-visible space-y-6"
                >
                    {/* Header Section: Static Trophy + Titles */}
                    <div className="flex flex-col items-center space-y-3">
                        {/* Static Trophy Container (No bounce) */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center border-4 border-white">
                                <Trophy className="w-10 h-10 text-white stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#58CC02] text-white rounded-full p-1 border-2 border-white">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Title & Badge */}
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-[#58CC02] text-xs font-black uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Lesson Finished!</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                {lessonTitle}
                            </h1>
                            <p className="text-xs md:text-sm font-semibold text-slate-500 max-w-lg">
                                Great job! All lesson slides and interactive activities have been completed and saved.
                            </p>
                        </div>
                    </div>

                    {/* Staggered Animated Stats Cards Grid (Wider layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full my-2">
                        {/* Card 1: Slides Cleared */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center space-y-1"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                <BookOpen className="w-4 h-4 text-[#1CB0F6]" />
                                <span>Slides Cleared</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-slate-800 tabular-nums">
                                {animatedSlides} <span className="text-sm font-extrabold text-slate-400">/ {totalSlidesCount}</span>
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#58CC02] text-[10px] font-bold">
                                100% Finished
                            </span>
                        </motion.div>

                        {/* Card 2: Score Points */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center space-y-1"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>Score Points</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-slate-800 tabular-nums">
                                {animatedScore} <span className="text-xs font-bold text-slate-400">pts</span>
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold">
                                Total Earned
                            </span>
                        </motion.div>

                        {/* Card 3: Accuracy */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center space-y-1"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                <Target className="w-4 h-4 text-[#58CC02]" />
                                <span>Accuracy</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-[#58CC02] tabular-nums">
                                {animatedAccuracy}%
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold">
                                Mastery Rating
                            </span>
                        </motion.div>
                    </div>

                    {/* Friendly Saved Status Pill */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold"
                    >
                        <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0" />
                        <span>Lesson Completed & Progress Saved!</span>
                    </motion.div>

                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => setShowCertificate(true)}
                        className="w-full h-12 rounded-2xl bg-[#FFC800] hover:bg-[#e6b400] border-b-4 border-[#D9A000] text-slate-900 text-xs font-extrabold flex items-center justify-center gap-2 active:border-b-0 active:translate-y-[2px]"
                    >
                        <Award className="w-4 h-4" />
                        Print certificate · {CERTIFICATE_PRINT_COST}★
                    </motion.button>

                    {/* Action Buttons (Horizontal layout for wide modal) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="flex flex-col sm:flex-row gap-3 w-full pt-1"
                    >
                        <Button
                            variant="outline"
                            onClick={onReview}
                            disabled={isExiting}
                            className="w-full sm:flex-1 h-11 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 bg-white transition-all order-2 sm:order-1 disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4 text-slate-400" />
                            <span>Review Lesson</span>
                        </Button>

                        <Button
                            onClick={handleEndLesson}
                            disabled={isExiting}
                            className="w-full sm:flex-1 h-11 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#3B8C00] active:border-b-0 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-80"
                        >
                            {isExiting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Exiting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Complete & Exit</span>
                                    <LogOut className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Next Lesson Section — only shown when a next lesson exists */}
                    {nextLesson && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                            className="w-full pt-4 border-t-2 border-slate-100"
                        >
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 text-left">Up Next</p>
                            <Button
                                onClick={handleNextLesson}
                                disabled={isExiting || isNavigatingNext}
                                className="w-full h-12 rounded-2xl bg-[#1CB0F6] hover:bg-[#0E86C0] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#0E86C0] active:border-b-0 transition-all flex items-center justify-between px-5 disabled:opacity-80"
                            >
                                <span className="truncate text-left flex-1">{nextLesson.title}</span>
                                {isNavigatingNext ? (
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0 ml-3" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 shrink-0 ml-3" />
                                )}
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
        <CertificateStudio
            open={showCertificate}
            onOpenChange={setShowCertificate}
            payload={{
                kind: 'lesson',
                lessonId,
                studentName,
                lessonTitle,
                score,
                totalPossible: totalPossibleScore,
            }}
        />
        </>
    );
}
