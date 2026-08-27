"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploader } from "@/components/renderers/image-uploader"

interface JigsawEditorProps {
    image: string
    onImageChange: (url: string) => void
    gridSize: 2 | 3 | 4
    onGridSizeChange: (size: 2 | 3 | 4) => void
    lessonId?: string
    componentId?: string
}

export function JigsawEditor({
    image = "",
    onImageChange,
    gridSize = 3,
    onGridSizeChange,
    lessonId,
    componentId,
}: JigsawEditorProps) {
    return (
        <div className="space-y-6 text-slate-200">
            {/* Diagram Image Source */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Puzzle Diagram Image
                </Label>
                <ImageUploader
                    value={image}
                    onChange={onImageChange}
                    lessonId={lessonId}
                    componentId={componentId}
                />
            </div>

            {/* Grid Slicing Dimensions */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Puzzle Grid Assembly Layout
                </Label>
                <Select value={String(gridSize)} onValueChange={(val) => onGridSizeChange(Number(val) as 2 | 3 | 4)}>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-xs font-bold h-11">
                        <SelectValue placeholder="Select Grid Layout" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="2" className="font-bold">🧩 Easy (2×2 Grid — 4 Pieces)</SelectItem>
                        <SelectItem value="3" className="font-bold">🧩 Medium (3×3 Grid — 9 Pieces)</SelectItem>
                        <SelectItem value="4" className="font-bold">🧩 Challenge (4×4 Grid — 16 Pieces)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
