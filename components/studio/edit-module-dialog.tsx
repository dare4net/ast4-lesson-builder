"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Edit3, Loader2, RefreshCw, Globe, Lock, Image as ImageIcon } from "lucide-react"
import { generateArtisticThumbnail } from "@/lib/thumbnail-generator"

interface EditModuleDialogProps {
    isOpen: boolean
    onClose: () => void
    module: {
        _id: string
        name?: string
        title?: string
        description?: string
        image_url?: string
        cover_image?: string
        is_published?: boolean
    }
    onSave: (id: string, data: { name: string; description: string; image_url?: string; is_published: boolean }) => Promise<void>
}

export function EditModuleDialog({ isOpen, onClose, module, onSave }: EditModuleDialogProps) {
    const originalName = module.name || module.title || ""
    const [styleIndex, setStyleIndex] = useState(0)
    const [name, setName] = useState(originalName)
    const [description, setDescription] = useState(module.description || "")
    const [imageUrl, setImageUrl] = useState(module.image_url || module.cover_image || "")
    const [isPublished, setIsPublished] = useState(module.is_published ?? true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAutoGenerate = async () => {
        if (!name.trim()) return
        const nextStyle = styleIndex + 1
        setStyleIndex(nextStyle)
        const autoThumbnail = await generateArtisticThumbnail(name.trim(), "MODULE CURRICULUM", nextStyle)
        setImageUrl(autoThumbnail)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setIsSubmitting(true)
        try {
            let finalImage = imageUrl.trim()
            if (name.trim() !== originalName && (!finalImage || finalImage.startsWith("data:image"))) {
                finalImage = await generateArtisticThumbnail(name.trim(), "MODULE CURRICULUM")
            }

            await onSave(module._id, {
                name: name.trim(),
                description: description.trim(),
                image_url: finalImage,
                is_published: isPublished
            })
            onClose()
        } catch (error) {
            console.error("Failed to update module:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl border-0 shadow-2xl rounded-3xl p-6 sm:p-7 bg-white text-slate-900 overflow-hidden">
                <DialogHeader className="pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EDF9E0] text-[#58CC02] flex items-center justify-center shrink-0">
                            <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                                Edit Module Settings
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium">
                                Configure module title, cover image, and publishing state.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                        {/* LEFT COLUMN: Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                                    Module Title
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Module 1: Variables & Data Types"
                                    required
                                    className="h-10 text-xs font-bold border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#58CC02] rounded-xl bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                                    Description
                                </label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what this module covers..."
                                    rows={4}
                                    className="text-xs font-medium border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#58CC02] rounded-xl bg-slate-50/50 resize-none"
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
                                            {isPublished ? "Visible to students inside program" : "Hidden from students"}
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

                        {/* RIGHT COLUMN: Thumbnail & Preview */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#58CC02]" />
                                    Module Cover Image
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerate}
                                    className="text-[11px] font-extrabold text-[#58CC02] hover:text-[#3B8C00] flex items-center gap-1 bg-[#EDF9E0] px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                                </button>
                            </div>

                            <Input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Leave empty to inherit Program Cover Image"
                                className="h-9 text-xs font-medium border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-[#58CC02] rounded-xl bg-slate-50/50"
                            />

                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-inner group">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                                        <p className="text-xs font-bold text-slate-400">Inherits Program Cover</p>
                                        <p className="text-[10px] text-slate-500">Add custom image or auto-generate</p>
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
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </span>
                            ) : (
                                "Save Module"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
