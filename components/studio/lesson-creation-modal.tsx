"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { generateBatchAudio, normalizeTextForSpeech } from "@/lib/audio-generator"
import { useToast } from "@/hooks/use-toast"
import { VoiceSelector } from "@/components/ui/voice-selector"
import { getVoiceById } from "@/lib/voices"

interface LessonCreationModalProps {
    isOpen: boolean
    onClose: () => void
    moduleId: string
    programId?: string
    moduleVoice?: string
}

export function LessonCreationModal({ isOpen, onClose, moduleId, moduleVoice }: LessonCreationModalProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: 30, // Default 30 mins
        level: "Beginner",
        voice: "inherit",
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreate = async () => {
        if (!formData.title.trim()) {
            toast({
                title: "Title Required",
                description: "Please give your lesson a name.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        setLoadingMessage("Initializing lesson...")
        try {
            const newLesson = {
                title: formData.title,
                description: formData.description,
                slides: [],
                voice: formData.voice,
                settings: {
                    duration: formData.duration,
                    level: formData.level
                }
            }

            // Create via API
            const result = await apiClient.studio.createLesson(moduleId, newLesson)
            const lessonId = result?.lesson?._id || result?._id;

            if (lessonId) {
                // Auto-generate introduction audio cue
                setLoadingMessage("Synthesizing intro audio...")
                try {
                    const cleanTitle = formData.title.trim()
                    const cleanDesc = formData.description.trim()
                    const welcomeText = `Welcome to today's lesson. Today's topic is ${cleanTitle}. ${cleanDesc ? `You'll learn about ${cleanDesc}.` : ""}`
                    const speechText = normalizeTextForSpeech(welcomeText)

                    const resolvedVoice = (formData.voice && formData.voice !== "inherit") ? formData.voice : (moduleVoice || "en-GB-SoniaNeural")

                    const audioMap = await generateBatchAudio(
                        [
                            {
                                componentId: "intro",
                                text: speechText,
                                lessonId: lessonId,
                                voice: resolvedVoice,
                            },
                        ],
                        resolvedVoice
                    )

                    if (audioMap["intro"]) {
                        await apiClient.studio.updateLesson(lessonId, {
                            introAudioUrl: audioMap["intro"]
                        } as any)
                    }
                } catch (audioErr) {
                    console.warn("[LessonCreationModal] Auto audio generation warning:", audioErr)
                }
            }

            toast({
                title: "Lesson Created",
                description: "Redirecting to editor...",
            })

            // Redirect to Editor
            router.push(`/editor?lessonId=${lessonId}`)

        } catch (error) {
            console.error("Creation failed:", error)
            toast({
                title: "Error",
                description: "Failed to create lesson. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setLoadingMessage("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-[#0F172A] border-slate-800 text-slate-200 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Sparkles className="h-5 w-5 text-emerald-500" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white">New Lesson</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Define the core metadata before entering the studio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="lesson-title" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Lesson Title <span className="text-emerald-500">*</span>
                        </Label>
                        <Input
                            id="lesson-title"
                            placeholder="e.g., Introduction to Quantum Physics"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white placeholder:text-slate-600"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="lesson-desc" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Overview
                        </Label>
                        <Textarea
                            id="lesson-desc"
                            placeholder="What will students learn?"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white min-h-[100px] placeholder:text-slate-600 resize-none"
                        />
                    </div>

                    {/* Lesson Voice Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Narration Voice
                        </Label>
                        <VoiceSelector
                            value={formData.voice}
                            onChange={(v) => handleChange("voice", v)}
                            inheritLabel={`Inherit from Module (${getVoiceById(moduleVoice).name})`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Level */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Difficulty</Label>
                            <Select value={formData.level} onValueChange={(val) => handleChange("level", val)}>
                                <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white focus:ring-emerald-500/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (Min)</Label>
                            <Input
                                type="number"
                                min={5}
                                step={5}
                                value={formData.duration}
                                onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-800 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {loadingMessage || "Creating..."}
                            </>
                        ) : (
                            "Enter Studio"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
