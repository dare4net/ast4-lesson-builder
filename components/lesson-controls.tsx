"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Save, Upload, Download, Settings, Play, Pencil, ChevronDown, Menu, Plus } from "lucide-react"
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
}

export function LessonControls({
  lesson,
  updateLessonMetadata,
  exportLesson,
  importLesson,
  previewMode,
  setPreviewMode,
  isMobile,
  className
}: LessonControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

        // Validate basic lesson structure
        if (!importedLesson.id || !Array.isArray(importedLesson.slides)) {
          throw new Error("Invalid lesson format")
        }

        // Completely replace the current lesson with the imported one
        importLesson(importedLesson)

        // Clear any local storage to prevent conflicts
        if (typeof window !== "undefined") {
          localStorage.removeItem("currentLesson")
        }

        toast({
          title: "Lesson imported successfully",
          description: `Loaded lesson: ${importedLesson.title}`,
        })

        // Close mobile menu if open
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

    // Reset the input
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

      // Clear any local storage to prevent conflicts
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentLesson")
      }

      // Import the new lesson
      importLesson(newLesson)

      toast({
        title: "New lesson created",
        description: "Started a fresh lesson",
      })

      // Close mobile menu if open
      if (isMobile) {
        setIsMobileMenuOpen(false)
      }
    }
  }

  // Mobile UI
  if (isMobile) {
    return (
      <header className={cn("border-b bg-background p-2 flex items-center justify-between", className)}>
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>{lesson.title || "Untitled Lesson"}</SheetTitle>
                <SheetDescription>Lesson Builder Menu</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={createNewLesson}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Lesson
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Lesson Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportLesson}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Lesson
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Lesson
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="font-bold text-lg truncate max-w-[180px]">{lesson.title || "Untitled Lesson"}</h1>
        </div>

        <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Preview
            </>
          )}
        </Button>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lesson Configuration</DialogTitle>
              <DialogDescription>
                Configure your lesson settings and feedback preferences
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Lesson Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Lesson Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={lesson.title}
                    onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                    placeholder="Enter lesson title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lesson.description}
                    onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                    placeholder="Enter lesson description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={lesson.author}
                    onChange={(e) => updateLessonMetadata({ author: e.target.value })}
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              {/* Feedback Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Feedback Preferences</h3>
                <FeedbackSettings />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
    )
  }

  // Desktop UI
  return (
    <header className={cn("border-b bg-background p-2 flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg">{lesson.title || "Untitled Lesson"}</h1>

        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} title="Lesson Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Preview
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={createNewLesson}>
              <Plus className="h-4 w-4 mr-2" />
              New Lesson
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportLesson}>
              <Download className="h-4 w-4 mr-2" />
              Export Lesson
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleImportClick}>
              <Upload className="h-4 w-4 mr-2" />
              Import Lesson
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lesson Configuration</DialogTitle>
            <DialogDescription>
              Configure your lesson settings and feedback preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Lesson Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Lesson Details</h3>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={lesson.title}
                  onChange={(e) => updateLessonMetadata({ title: e.target.value })}
                  placeholder="Enter lesson title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={lesson.description}
                  onChange={(e) => updateLessonMetadata({ description: e.target.value })}
                  placeholder="Enter lesson description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={lesson.author}
                  onChange={(e) => updateLessonMetadata({ author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
            </div>

            {/* Feedback Settings */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Feedback Preferences</h3>
              <FeedbackSettings />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
