"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    DialogFooter,
} from "@/components/ui/dialog"
import { EntityEditDialog } from "@/components/studio/entity-edit-dialog"
import { Loader2, RefreshCw, Globe, Lock, Image as ImageIcon, Upload, X, Volume2 } from "lucide-react"
import { generateArtisticThumbnail } from "@/lib/thumbnail-generator"
import { compressImageFile } from "@/lib/image-compressor"
import { VoiceSelector } from "@/components/ui/voice-selector"

interface EditProgramDialogProps {
    isOpen: boolean
    onClose: () => void
    program: {
        _id: string
        name?: string
        program_name?: string
        description?: string
        image_url?: string
        cover_image?: string
        is_published?: boolean
        default_voice?: string
    }
    onSave: (id: string, data: { name: string; description: string; image_url?: string; is_published: boolean; default_voice?: string }) => Promise<void>
}

export function EditProgramDialog({ isOpen, onClose, program, onSave }: EditProgramDialogProps) {
    const originalName = program.name || program.program_name || ""
    const [styleIndex, setStyleIndex] = useState(0)
    const [name, setName] = useState(originalName)
    const [description, setDescription] = useState(program.description || "")
    const [imageUrl, setImageUrl] = useState(program.image_url || program.cover_image || "")
    const [isPublished, setIsPublished] = useState(program.is_published ?? true)
    const [defaultVoice, setDefaultVoice] = useState(program.default_voice || "en-GB-SoniaNeural")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && program) {
            setName(program.name || program.program_name || "")
            setDescription(program.description || "")
            setImageUrl(program.image_url || program.cover_image || "")
            setIsPublished(program.is_published ?? true)
            setDefaultVoice(program.default_voice || "en-GB-SoniaNeural")
        }
    }, [isOpen, program])

    const handleAutoGenerate = async () => {
        if (!name.trim()) return
        const nextStyle = styleIndex + 1
        setStyleIndex(nextStyle)
        const autoThumbnail = await generateArtisticThumbnail(name.trim(), "PROGRAM CURRICULUM", nextStyle)
        setImageUrl(autoThumbnail)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const compressed = await compressImageFile(file)
            setImageUrl(compressed)
        } catch (err) {
            console.error("Failed to process image file:", err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setIsSubmitting(true)
        try {
            let finalImage = imageUrl.trim()
            if (!finalImage) {
                finalImage = await generateArtisticThumbnail(name.trim(), "PROGRAM CURRICULUM")
            }

            // Route thumbnail through Cloudinary (converts Base64 -> Cloudinary URL & deletes old image if replaced)
            try {
                const res = await fetch('/api/thumbnail/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageDataUrl: finalImage,
                        type: 'program',
                        id: program._id,
                        previousUrl: program.image_url || program.cover_image
                    })
                })
                const uploadData = await res.json()
                if (uploadData?.url) {
                    finalImage = uploadData.url
                }
            } catch (uploadErr) {
                console.error("Failed to process Cloudinary thumbnail upload:", uploadErr)
            }

            await onSave(program._id, {
                name: name.trim(),
                description: description.trim(),
                image_url: finalImage,
                is_published: isPublished,
                default_voice: defaultVoice,
            })
            onClose()
        } catch (error) {
            console.error("Failed to update program:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <EntityEditDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Program Settings"
            description="Configure program details, thumbnail cover, and visibility state."
            accent="sky"
        >
                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                        {/* LEFT COLUMN: Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                                    Program Title
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Intro to Python Game Dev"
                                    required
                                    className="h-10 text-xs font-bold border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#1CB0F6] rounded-xl bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                                    Description
                                </label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What will students learn in this program?"
                                    rows={4}
                                    className="text-xs font-medium border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#1CB0F6] rounded-xl bg-slate-50/50 resize-none"
                                />
                            </div>

                            {/* Program Default TTS Voice */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                    <Volume2 className="w-3.5 h-3.5 text-[#1CB0F6]" />
                                    Default Program Voice
                                </label>
                                <VoiceSelector
                                    value={defaultVoice}
                                    onChange={setDefaultVoice}
                                />
                            </div>

                            {/* Publish Status Switcher */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {isPublished ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">
                                            {isPublished ? "Published" : "Draft Status"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {isPublished ? "Visible to enrolled students" : "Hidden from catalog"}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                    className="data-[state=checked]:bg-[#58CC02] data-[state=unchecked]:bg-slate-300"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Thumbnail Upload & Preview */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#1CB0F6]" />
                                    Cover Thumbnail
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[11px] font-extrabold text-slate-700 hover:text-[#1CB0F6] flex items-center gap-1 bg-slate-100 hover:bg-[#EAF6FE] px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                                    >
                                        <Upload className="w-3 h-3 text-[#1CB0F6]" /> Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAutoGenerate}
                                        className="text-[11px] font-extrabold text-[#1CB0F6] hover:text-[#0090CC] flex items-center gap-1 bg-[#EAF6FE] px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Auto-Generate
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <Input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Paste Image URL or click Upload / Auto-Generate"
                                    className="h-9 text-xs font-medium border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#1CB0F6] rounded-xl bg-slate-50/50 pr-8"
                                />
                                {imageUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-inner group">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                                        <p className="text-xs font-bold text-slate-400">No Cover Image</p>
                                        <p className="text-[10px] text-slate-500">Upload a file, paste a URL, or click Auto-Generate</p>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-sm text-[9px] font-black text-emerald-400 rounded-full border border-slate-800">
                                    PREVIEW
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 flex items-center gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-10 px-5 rounded-xl font-extrabold text-xs text-slate-500 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="h-10 px-6 rounded-xl font-extrabold text-xs text-white border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px"
                            style={{ backgroundColor: '#1CB0F6', borderColor: '#0090CC' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </span>
                            ) : (
                                "Save Program"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
        </EntityEditDialog>
    )
}
