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
import { Save, Upload, Download, Settings, Play, Pencil, ChevronDown, Menu, Plus, Loader2, LayoutDashboard } from "lucide-react"
import type { Lesson } from "@/types/lesson"
import { defaultLesson } from "@/lib/default-lesson"
import { useToast } from "@/components/ui/use-toast"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { FeedbackSettings } from "@/components/ui/feedback-settings"

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
  isSaving = false
}: LessonControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

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

  // Mobile remains largely the same but with updated colors
  if (isMobile) {
    return (
      <header className={cn("border-b border-slate-800 bg-[#0F172A] p-3 flex items-center justify-between", className)}>
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-[#0F172A] border-slate-800 text-slate-200">
              <SheetHeader>
                <SheetTitle className="text-emerald-400">{lesson.title || "Untitled Lesson"}</SheetTitle>
                <SheetDescription className="text-slate-400">Lesson Studio Menu</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200" onClick={() => router.push('/studio')}>
                  <LayoutDashboard className="h-4 w-4 mr-3 text-emerald-400" />
                  Creator Studio
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={createNewLesson}>
                  <Plus className="h-4 w-4 mr-3 text-emerald-500" />
                  New Lesson
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 hover:bg-slate-800" onClick={() => setIsSettingsOpen(true)}>
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
          <h1 className="font-bold text-base truncate max-w-[150px] text-slate-200">{lesson.title || "Untitled"}</h1>
        </div>

        <Button
          variant={previewMode ? "default" : "secondary"}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className={cn(
            "rounded-full px-4",
            previewMode ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-200"
          )}
        >
          {previewMode ? (
            <><Pencil className="h-4 w-4 mr-2" />Edit</>
          ) : (
            <><Play className="h-4 w-4 mr-2" />Preview</>
          )}
        </Button>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl bg-[#0F172A] border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Lesson Configuration</DialogTitle>
              <DialogDescription className="text-slate-400">
                Studio-grade settings for your educational content
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-400">Project Title</Label>
                  <Input
                    id="title"
                    value={lesson.title || ""}
                    onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-400">Description</Label>
                  <Textarea
                    id="description"
                    value={lesson.description || ""}
                    onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <FeedbackSettings />
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
          {onSaveToDatabase && (
            <Button
              variant={isSaving ? "secondary" : "default"}
              size="sm"
              onClick={onSaveToDatabase}
              disabled={isSaving}
              className={cn(
                "rounded-full px-4 font-bold shadow-lg transition-all",
                isSaving
                  ? "bg-slate-800 text-slate-400"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={createNewLesson}
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full px-4"
          >
            <Plus className="h-4 w-4 mr-2 text-emerald-500" />
            New
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-[#0F172A] font-bold rounded-full px-4 shadow-lg shadow-emerald-500/10">
                <Upload className="h-4 w-4 mr-2" />
                Publish
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0F172A] border-slate-800 text-slate-200">
              <DropdownMenuItem onClick={exportLesson} className="hover:bg-slate-800 cursor-pointer">
                <Download className="h-4 w-4 mr-3 text-emerald-500" />
                Export Project (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportClick} className="hover:bg-slate-800 cursor-pointer">
                <Upload className="h-4 w-4 mr-3 text-emerald-500" />
                Import Project
              </DropdownMenuItem>
              {onSaveToDatabase && (
                <>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem onClick={onSaveToDatabase} disabled={isSaving} className="hover:bg-slate-800 cursor-pointer">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-3 animate-spin text-blue-500" />
                    ) : (
                      <Save className="h-4 w-4 mr-3 text-blue-500" />
                    )}
                    Save to Database
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl bg-[#0F172A] border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Studio Configuration</DialogTitle>
            <DialogDescription className="text-slate-400">
              Fine-tune your lesson metadata and interaction policies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="d-title" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Project Title</Label>
                  <Input
                    id="d-title"
                    value={lesson.title || ""}
                    onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-author" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Lead Designer</Label>
                  <Input
                    id="d-author"
                    value={lesson.author || ""}
                    onChange={(e) => updateLessonMetadata({ author: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-description" className="text-slate-400 text-xs uppercase font-bold tracking-wider">Project Summary</Label>
                <Textarea
                  id="d-description"
                  value={lesson.description || ""}
                  onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                  className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-[106px] resize-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-emerald-400 text-xs uppercase font-bold tracking-wider mb-6 flex items-center gap-2">
                <Play className="h-3 w-3" />
                Runtime Feedback Policies
              </h3>
              <FeedbackSettings />
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
