"use client";

import React, { useState, useRef, useEffect } from "react";
import { VOICE_CATALOG, getVoiceById, CATEGORY_LABELS, VoiceOption } from "@/lib/voices";
import { Volume2, VolumeX, Play, Pause, Sparkles, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceSelectorProps {
    value?: string;
    onChange: (voiceId: string) => void;
    inheritLabel?: string;
    disabled?: boolean;
    className?: string;
}

export function VoiceSelector({
    value = "",
    onChange,
    inheritLabel,
    disabled = false,
    className,
}: VoiceSelectorProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentVoiceId = value === "inherit" || !value ? "" : value;
    const activeVoice = getVoiceById(currentVoiceId || "en-GB-SoniaNeural");

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlayPreview = (voiceIdToPlay?: string) => {
        const voiceId = voiceIdToPlay || currentVoiceId || "en-GB-SoniaNeural";
        const voice = getVoiceById(voiceId);

        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(voice.sampleUrl);
        audioRef.current = audio;

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        audio.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    };

    const categories: Array<VoiceOption['category']> = [
        'kids',
        'female_educators',
        'male_educators',
        'characters',
    ];

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2">
                {/* Voice Select Dropdown */}
                <div className="relative flex-1">
                    <select
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(val);
                            if (isPlaying) {
                                if (audioRef.current) audioRef.current.pause();
                                setIsPlaying(false);
                            }
                        }}
                        disabled={disabled}
                        className="w-full h-10 px-3 pr-8 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:border-indigo-500 focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
                    >
                        {inheritLabel && (
                            <option value="inherit">
                                ↺ {inheritLabel}
                            </option>
                        )}

                        {categories.map((cat) => {
                            const voices = VOICE_CATALOG.filter((v) => v.category === cat);
                            if (voices.length === 0) return null;

                            return (
                                <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                                    {voices.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.accent} {v.gender === "female" ? "♀" : "♂"}) — {v.description}
                                        </option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </select>
                    {/* Custom Chevron Indicator */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                        ▼
                    </div>
                </div>

                {/* Play Voice Sample Preview Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlayPreview()}
                    disabled={disabled}
                    className={cn(
                        "h-10 px-3 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 shrink-0 transition-all",
                        isPlaying
                            ? "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300"
                            : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300"
                    )}
                    title={`Play sample preview of ${activeVoice.name}`}
                >
                    {isPlaying ? (
                        <>
                            <Pause className="w-3.5 h-3.5 animate-pulse" />
                            <span>Stop</span>
                        </>
                    ) : (
                        <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Sample</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Active Voice Info Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <Volume2 className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeVoice.name}</span>
                <span>&bull;</span>
                <span className="truncate">{activeVoice.description}</span>
            </div>
        </div>
    );
}
