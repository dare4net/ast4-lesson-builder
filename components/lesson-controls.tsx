"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Save, Upload, Download, Settings, Play, Pencil, ChevronDown, Menu, Plus, Loader2, LayoutDashboard, Mic, Volume2 } from "lucide-react"
import type { Lesson } from "@/types/lesson"
import type { AudioGenerationProgress } from "@/lib/audio-generator"
import { defaultLesson } from "@/lib/default-lesson"
import { useToast } from "@/components/ui/use-toast"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { VoiceSelector } from "@/components/ui/voice-selector"

interface LessonControlsProps {
  lesson: Lesson
  updateLessonMetadata: (metadata: Partial<Omit<Lesson, "slides">>) => void
  exportLesson: () => void
  importLesson: (lesson: Lesson) => void
  previewMode: boolean
  setPreviewMode: (mode: boolean) => void
  isMobile: boolean
  className?: string
  onSaveToDatabase?: () => void
  onLoadFromDatabase?: () => void
  isSaving?: boolean
  onPublishAndGenerateAudio?: () => Promise<void>
  isGeneratingAudio?: boolean
  audioGenerationProgress?: AudioGenerationProgress | null
  missingAudioCount?: number
  canPublish?: boolean
  hasUnpublishedChanges?: boolean
  hasValidationErrors?: boolean
}

export function LessonControls({
  lesson,
  updateLessonMetadata,
  exportLesson,
  importLesson,
  previewMode,
  setPreviewMode,
  isMobile,
  className,
  onSaveToDatabase,
  onLoadFromDatabase,
  isSaving = false,
  onPublishAndGenerateAudio,
  isGeneratingAudio = false,
  audioGenerationProgress = null,
  missingAudioCount = 0,
  canPublish = false,
  hasUnpublishedChanges = false,
  hasValidationErrors = false,
}: LessonControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const publishDisabled = !canPublish || isGeneratingAudio || hasValidationErrors
  const progressPercent = audioGenerationProgress?.percent ?? 0
  const progressLabel = isGeneratingAudio && audioGenerationProgress
    ? audioGenerationProgress.total > 0
      ? `Generating ${progressPercent}%`
      : "Generating..."
    : null

  const getPublishLabel = () => {
    if (progressLabel) return progressLabel
    if (hasValidationErrors) return "Fix Errors to Publish"
    if (missingAudioCount > 0 && !hasUnpublishedChanges) return `Retry Audio (${missingAudioCount})`
    if (missingAudioCount > 0 && hasUnpublishedChanges) return `Publish (${missingAudioCount} audio)`
    if (canPublish) return "Publish Lesson"
    return "Published & Saved"
  }

  const getPublishTitle = () => {
    if (hasValidationErrors) return "Cannot publish: Fix verification errors in your lesson first"
    if (isGeneratingAudio) return "Generating lesson audio..."
    if (missingAudioCount > 0) return `${missingAudioCount} audio clip(s) still missing — click to resume generation`
    if (canPublish) return "Generate audio & save lesson changes"
    return "All changes and audio are up to date"
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        const importedLesson = JSON.parse(result)

        if (!importedLesson.id || !Array.isArray(importedLesson.slides)) {
          throw new Error("Invalid lesson format")
        }

        importLesson(importedLesson)

        if (typeof window !== "undefined") {
          localStorage.removeItem("currentLesson")
        }

        toast({
          title: "Lesson imported successfully",
          description: `Loaded lesson: ${importedLesson.title}`,
        })

        if (isMobile) {
          setIsMobileMenuOpen(false)
        }
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: "The selected file is not a valid lesson file",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Error reading the file",
        variant: "destructive",
      })
    }

    reader.readAsText(file)
    e.target.value = ""
  }

  const createNewLesson = () => {
    if (window.confirm("Create a new lesson? Any unsaved changes will be lost.")) {
      const newLesson = {
        ...defaultLesson,
        id: `lesson-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("currentLesson")
      }

      importLesson(newLesson)

      toast({
        title: "New lesson created",
        description: "Started a fresh lesson",
      })

      if (isMobile) {
        setIsMobileMenuOpen(false)
      }
    }
  }

  // Mobile UI
  if (isMobile) {
    return (
      <header className={cn("border-b border-slate-800 bg-[#0F172A] p-2.5 sm:p-3 flex items-center justify-between gap-2", className)}>
        <div className="flex items-center gap-2 min-w-0">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-300 h-9 w-9 shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-[#0F172A] border-slate-800 text-slate-200">
              <SheetHeader>
                <SheetTitle className="text-emerald-400">{lesson.title || "Untitled Lesson"}</SheetTitle>
                <SheetDescription className="text-slate-400">Lesson Studio Menu</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-3">
                {onPublishAndGenerateAudio && (
                  <Button
                    variant="outline"
                    disabled={publishDisabled}
                    className={cn(
                      "w-full justify-start font-bold",
                      missingAudioCount > 0
                        ? "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                        : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
                    )}
                    onClick={() => { setIsMobileMenuOpen(false); onPublishAndGenerateAudio(); }}
                  >
                    <Mic className="h-4 w-4 mr-3" />
                    {getPublishLabel()}
                  </Button>
                )}
                {onSaveToDatabase && (
                  <Button
                    variant="outline"
                    disabled={isSaving || !hasUnpublishedChanges}
                    className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
                    onClick={() => { setIsMobileMenuOpen(false); onSaveToDatabase(); }}
                  >
                    <Save className="h-4 w-4 mr-3 text-blue-400" />
                    {isSaving ? "Saving..." : "Save Lesson"}
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200" onClick={() => router.push('/studio')}>
                  <LayoutDashboard className="h-4 w-4 mr-3 text-emerald-400" />
                  Creator Studio
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={createNewLesson}>
                  <Plus className="h-4 w-4 mr-3 text-emerald-500" />
                  New Lesson
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={() => { setIsMobileMenuOpen(false); setIsSettingsOpen(true); }}>
                  <Settings className="h-4 w-4 mr-3 text-emerald-500" />
                  Studio Settings
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={exportLesson}>
                  <Download className="h-4 w-4 mr-3 text-emerald-500" />
                  Export Project
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-3 text-emerald-500" />
                  Import Project
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="font-bold text-sm truncate max-w-[120px] text-slate-200">{lesson.title || "Untitled"}</h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Publish / Save button in Mobile Header */}
          {onPublishAndGenerateAudio ? (
            <Button
              size="sm"
              onClick={onPublishAndGenerateAudio}
              disabled={publishDisabled}
              className={cn(
                "rounded-full px-3 h-8 text-[11px] font-bold shadow-md transition-all flex items-center gap-1 min-w-[88px]",
                hasValidationErrors
                  ? "bg-rose-950/60 text-rose-400 border border-rose-800/80"
                  : !canPublish
                    ? "bg-slate-800/80 text-slate-500 border border-slate-800"
                    : missingAudioCount > 0
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : isGeneratingAudio
                        ? "bg-slate-800 text-slate-400"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
              )}
              title={getPublishTitle()}
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
              <span>{progressLabel ?? (canPublish ? (missingAudioCount > 0 ? "Retry" : "Publish") : "Done")}</span>
            </Button>
          ) : (
            onSaveToDatabase && (
              <Button
                variant={isSaving ? "secondary" : "default"}
                size="sm"
                onClick={onSaveToDatabase}
                disabled={isSaving || !hasUnpublishedChanges}
                className={cn(
                  "rounded-full px-3 h-8 text-[11px] font-bold shadow-md transition-all flex items-center gap-1",
                  !hasUnpublishedChanges
                    ? "bg-slate-800/80 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                )}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving" : "Save"}</span>
              </Button>
            )
          )}

          {/* Mobile Preview Toggle */}
          <Button
            variant={previewMode ? "default" : "secondary"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "rounded-full px-3 h-8 text-[11px] font-bold transition-all flex items-center gap-1",
              previewMode ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-[#0F172A]" : "bg-slate-800 text-slate-200"
            )}
          >
            {previewMode ? (
              <><Pencil className="h-3.5 w-3.5" />Edit</>
            ) : (
              <><Play className="h-3.5 w-3.5" />Preview</>
            )}
          </Button>
        </div>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl bg-[#0F172A] border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Lesson Settings</DialogTitle>
              <DialogDescription className="text-slate-400">
                Customize lesson metadata, description, and voice narration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-400">Lesson Title</Label>
                  <Input
                    id="title"
                    value={lesson.title || ""}
                    onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-slate-400">Instructor / Author</Label>
                  <Input
                    id="author"
                    value={lesson.author || ""}
                    onChange={(e) => updateLessonMetadata({ author: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-400">Lesson Description</Label>
                  <Textarea
                    id="description"
                    value={lesson.description || ""}
                    onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Lesson Voice Narration
                  </Label>
                  <VoiceSelector
                    value={lesson.voice || "inherit"}
                    onChange={(voiceId) => updateLessonMetadata({ voice: voiceId })}
                    inheritLabel="Inherit from Module"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsSettingsOpen(false)} className="bg-slate-800 hover:bg-slate-700">
                Save & Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
    )
  }

  // Desktop UI
  return (
    <header className={cn("px-6 py-3 flex items-center justify-between", className)}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/studio')}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold px-3 h-8 text-xs flex items-center gap-1.5 border border-slate-800/80 rounded-lg bg-slate-900/40 transition-colors"
            title="Return to Creator Studio"
          >
            <LayoutDashboard className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Creator Studio</span>
          </Button>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <LayoutGrid className="h-5 w-5 text-[#0F172A]" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">{lesson.title || "New Project"}</h1>
        </div>

        <nav className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-full border border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full px-4 h-8 text-xs font-bold transition-all",
              !previewMode ? "bg-emerald-500 text-[#0F172A] hover:bg-emerald-400" : "text-slate-400 hover:text-slate-200"
            )}
            onClick={() => setPreviewMode(false)}
          >
            Design
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full px-4 h-8 text-xs font-bold transition-all",
              previewMode ? "bg-emerald-500 text-[#0F172A] hover:bg-emerald-400" : "text-slate-400 hover:text-slate-200"
            )}
            onClick={() => setPreviewMode(true)}
          >
            Preview
          </Button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-3 border-r border-slate-800 pr-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full"
            title="Studio Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Consolidated Primary Action: Publish Lesson */}
          {onPublishAndGenerateAudio ? (
            <Button
              size="sm"
              onClick={onPublishAndGenerateAudio}
              disabled={publishDisabled}
              className={cn(
                "rounded-full px-5 font-bold shadow-md transition-all min-w-[160px]",
                hasValidationErrors
                  ? "bg-rose-950/60 text-rose-400 border border-rose-800/80 cursor-not-allowed"
                  : !canPublish
                    ? "bg-slate-800/80 text-slate-500 border border-slate-800 cursor-not-allowed"
                    : missingAudioCount > 0
                      ? "bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/30"
                      : isGeneratingAudio
                        ? "bg-slate-800 text-slate-400 border border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30"
              )}
              title={getPublishTitle()}
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-emerald-400" />
                  {progressLabel}
                </>
              ) : hasValidationErrors ? (
                <>
                  <span className="text-rose-400 mr-1.5">⚠</span>
                  Fix Errors to Publish
                </>
              ) : missingAudioCount > 0 && !hasUnpublishedChanges ? (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Retry Audio ({missingAudioCount})
                </>
              ) : canPublish ? (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  {missingAudioCount > 0 ? `Publish (${missingAudioCount} audio)` : "Publish Lesson"}
                </>
              ) : (
                <>
                  <span className="text-emerald-400 mr-1.5">✓</span>
                  Published & Saved
                </>
              )}
            </Button>
          ) : (
            onSaveToDatabase && (
              <Button
                variant={isSaving ? "secondary" : "default"}
                size="sm"
                onClick={onSaveToDatabase}
                disabled={isSaving || !hasUnpublishedChanges}
                className={cn(
                  "rounded-full px-4 font-bold shadow-md transition-all",
                  !hasUnpublishedChanges
                    ? "bg-slate-800/80 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                )}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )
          )}

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full px-3"
                title="More Options"
              >
                <span className="text-xs font-semibold mr-1">More</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0F172A] border-slate-800 text-slate-200 w-52">
              {onSaveToDatabase && (
                <DropdownMenuItem
                  onClick={onSaveToDatabase}
                  disabled={!hasUnpublishedChanges || isSaving}
                  className={cn(
                    "cursor-pointer",
                    !hasUnpublishedChanges && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Save className="h-4 w-4 mr-3 text-blue-400" />
                  Save Draft (Quick)
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={exportLesson} className="hover:bg-slate-800 cursor-pointer">
                <Download className="h-4 w-4 mr-3 text-emerald-500" />
                Export Project (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportClick} className="hover:bg-slate-800 cursor-pointer">
                <Upload className="h-4 w-4 mr-3 text-emerald-500" />
                Import Project (.json)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem onClick={createNewLesson} className="hover:bg-slate-800 cursor-pointer">
                <Plus className="h-4 w-4 mr-3 text-emerald-500" />
                New Lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl bg-[#0F172A] border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Lesson Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Customize lesson title, instructor details, description, and voice narration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="d-title" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Lesson Title</Label>
                  <Input
                    id="d-title"
                    value={lesson.title || ""}
                    onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-author" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Instructor / Author</Label>
                  <Input
                    id="d-author"
                    value={lesson.author || ""}
                    onChange={(e) => updateLessonMetadata({ author: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-description" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Lesson Description</Label>
                <Textarea
                  id="d-description"
                  value={lesson.description || ""}
                  onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                  className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-[106px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Lesson Voice Narration
              </Label>
              <VoiceSelector
                value={lesson.voice || "inherit"}
                onChange={(voiceId) => updateLessonMetadata({ voice: voiceId })}
                inheritLabel="Inherit from Module"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-800 pt-6">
            <Button variant="secondary" onClick={() => setIsSettingsOpen(false)} className="bg-slate-800 hover:bg-slate-700 rounded-full px-6">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
