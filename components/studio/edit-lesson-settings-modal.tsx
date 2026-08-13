"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Settings, Volume2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { generateBatchAudio, normalizeTextForSpeech } from "@/lib/audio-generator";
import { VoiceSelector } from "@/components/ui/voice-selector";
import { getVoiceById } from "@/lib/voices";

interface Lesson {
    _id: string;
    title: string;
    description: string;
    introAudioUrl?: string;
    voice?: string;
}

interface EditLessonSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson | null;
    moduleTitle?: string;
    lessonNumber?: number;
    moduleVoice?: string;
    onSaveSuccess: () => void;
}

export function EditLessonSettingsModal({
    isOpen,
    onClose,
    lesson,
    moduleTitle = "Course",
    lessonNumber = 1,
    moduleVoice,
    onSaveSuccess,
}: EditLessonSettingsModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [voice, setVoice] = useState("inherit");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lesson) {
            setTitle(lesson.title || "");
            setDescription(lesson.description || "");
            setVoice(lesson.voice || "inherit");
        }
    }, [lesson]);

    const isChanged = useMemo(() => {
        if (!lesson) return false;
        return (
            title.trim() !== (lesson.title || "").trim() ||
            description.trim() !== (lesson.description || "").trim() ||
            voice !== (lesson.voice || "inherit")
        );
    }, [lesson, title, description, voice]);

    if (!lesson) return null;

    const handleSave = async () => {
        if (!title.trim() || !isChanged) return;
        setIsSaving(true);

        try {
            // 1. Generate clean speech text for the lesson intro with full welcome prefix
            const cleanTitle = title.trim();
            const cleanDesc = description.trim();
            const welcomeText = `Welcome to lesson ${lessonNumber} of the ${moduleTitle} module. Today's lesson is ${cleanTitle}. ${cleanDesc ? `You'll learn about ${cleanDesc}.` : ""}`;
            const speechText = normalizeTextForSpeech(welcomeText);

            // 2. Synthesize audio via EdgeTTS & upload to Cloudinary (ast_lessons/{lessonId}/intro)
            let cloudinaryAudioUrl: string | null = null;
            const resolvedVoice = (voice && voice !== "inherit") ? voice : (moduleVoice || "en-GB-SoniaNeural");

            try {
                const { urlMap: audioMap } = await generateBatchAudio(
                    [
                        {
                            componentId: "intro",
                            text: speechText,
                            lessonId: lesson._id,
                            voice: resolvedVoice,
                        },
                    ],
                    resolvedVoice
                );
                cloudinaryAudioUrl = audioMap["intro"] || null;
            } catch (err) {
                console.warn("[EditLessonSettingsModal] Cloudinary audio generation warning:", err);
            }

            // 3. Save updated lesson title, description, voice, and Cloudinary audio URL to MongoDB
            const updatePayload: any = {
                title: cleanTitle,
                description: cleanDesc,
                voice: voice,
            };
            if (cloudinaryAudioUrl) {
                updatePayload.introAudioUrl = cloudinaryAudioUrl;
            }

            await apiClient.studio.updateLesson(lesson._id, updatePayload);

            onSaveSuccess();
            onClose();
        } catch {
            alert("Failed to update lesson settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent className="sm:max-w-md bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Settings className="w-4 h-4" />
                        </div>
                        <DialogTitle className="text-lg font-black tracking-tight">Edit Lesson Settings</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-slate-400 font-medium">
                        Update the title and description for this lesson.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Lesson Title Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Lesson Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to Past Perfect Tense"
                            className="h-10 rounded-xl border-2 border-slate-200 focus:border-indigo-500 font-bold text-xs"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Lesson Description Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                            Lesson Description <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief summary of what students will learn in this lesson..."
                            rows={3}
                            className="rounded-xl border-2 border-slate-200 focus:border-indigo-500 font-medium text-xs resize-none"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Lesson Voice Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                            Lesson Voice Narration
                        </label>
                        <VoiceSelector
                            value={voice}
                            onChange={setVoice}
                            inheritLabel={`Inherit from Module (${getVoiceById(moduleVoice).name})`}
                            disabled={isSaving}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                        className="h-10 px-4 rounded-xl text-slate-500 font-extrabold text-xs hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !title.trim() || !isChanged}
                        className="h-10 px-5 rounded-xl font-black text-xs text-white border-b-4 transition-all disabled:opacity-40"
                        style={{ backgroundColor: "#1CB0F6", borderColor: "#0E86C0" }}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating Audio & Saving...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
