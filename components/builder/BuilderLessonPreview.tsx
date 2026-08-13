"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { LessonContent, type LessonContentRef } from "@/components/viewer/LessonContent"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Award, ArrowLeft, Clock, Eye, Play, User } from "lucide-react"
import { ScoringProvider } from "@/context/scoring-context"
import { ScoreDisplay } from "@/components/ui/score-display"
import { NavigationLockProvider } from "@/context/navigation-lock-context"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/types/lesson"
import { normalizeSlides, formatSlideTitle } from "@/lib/lesson-utils"

interface BuilderLessonPreviewProps {
  lesson: Lesson
  onExitPreview: () => void
}

export function BuilderLessonPreview({ lesson: sourceLesson, onExitPreview }: BuilderLessonPreviewProps) {
  const [lessonData, setLessonData] = useState<Lesson>(() => ({
    ...sourceLesson,
    slides: normalizeSlides(sourceLesson.slides),
  }))
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const lessonContentRef = useRef<LessonContentRef>(null)

  useEffect(() => {
    setLessonData((prev) => ({
      ...sourceLesson,
      slides: normalizeSlides(sourceLesson.slides).map((slide) => {
        const prevSlide = prev.slides.find((s) => s.id === slide.id)
        return prevSlide ? { ...slide, status: prevSlide.status, state: prevSlide.state } : slide
      }),
    }))
  }, [sourceLesson])

  const isSlideAccessible = useCallback(
    (index: number) => {
      if (!lessonData.slides[index]) return false
      return lessonData.slides[index].state !== "disabled"
    },
    [lessonData.slides]
  )

  const handleSlideChange = useCallback(
    (index: number) => {
      if (isSlideAccessible(index)) {
        setCurrentSlideIndex(index)
      }
    },
    [isSlideAccessible]
  )

  const handleSlidesUpdate = useCallback((updatedSlides: Lesson["slides"]) => {
    setLessonData((prev) => ({ ...prev, slides: updatedSlides }))
  }, [])

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index)
    lessonContentRef.current?.setCurrentSlideIndex(index)
    setIsMobileSheetOpen(false)
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Play className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Student Preview</span>
        </div>
        <p className="text-xs font-medium text-emerald-200/80 mt-1">
          Walk through the lesson as a student would — no intro or slide cues
        </p>
      </div>

      <div className="p-6 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-xs font-semibold text-slate-400">Previewing Lesson</h2>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{lessonData.title}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">Slides</h3>
            <div className="space-y-1.5">
              {lessonData.slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2.5 px-3.5 rounded-xl transition-all border border-transparent",
                    index === currentSlideIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                  onClick={() => handleJumpToSlide(index)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span
                      className={cn(
                        "text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border shrink-0",
                        index === currentSlideIndex
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-700 text-slate-500"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium truncate flex-1">{formatSlideTitle(slide.title, 20)}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              Score Overview
            </h3>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <ScoreDisplay />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                Instructor
              </span>
              <span className="font-semibold">{lessonData.author}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Duration
              </span>
              <span className="font-semibold">{lessonData.duration} minutes</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <Button
          variant="default"
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-wider transition-all h-10 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          onClick={onExitPreview}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Editor
        </Button>
      </div>
    </div>
  )

  return (
    <ScoringProvider lesson={lessonData}>
      <NavigationLockProvider>
        <div className="h-full w-full flex overflow-hidden bg-slate-950">
          {/* Desktop Sidebar — collapsible like tutor view */}
          <div className="hidden md:block w-80 shrink-0 h-full">
            {renderSidebarContent()}
          </div>

          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetContent side="left" className="w-80 p-0 border-r-0">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex flex-col relative h-full bg-white dark:bg-slate-950 overflow-hidden min-w-0">
            {/* Mobile only — open sidebar without duplicating the preview banner */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden absolute top-3 left-3 z-40 h-9 w-9 p-0 rounded-full bg-slate-900/80 text-slate-200 hover:bg-slate-800 border border-slate-700"
              onClick={() => setIsMobileSheetOpen(true)}
              title="Open slide navigator"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <div className="flex-1 relative overflow-hidden">
              <LessonContent
                ref={lessonContentRef}
                lesson={lessonData}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={handleSlideChange}
                onSlidesUpdate={handleSlidesUpdate}
                onEndLesson={onExitPreview}
                suppressCues
                previewMode
              />
            </div>
          </div>
        </div>
      </NavigationLockProvider>
    </ScoringProvider>
  )
}
