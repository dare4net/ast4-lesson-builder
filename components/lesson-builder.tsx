"use client"

import * as React from 'react'
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { ComponentLibrary } from "@/components/component-library"
import { SlideEditor } from "@/components/slide-editor"
import { BuilderLessonPreview } from "@/components/builder/BuilderLessonPreview"
import { LessonControls } from "@/components/lesson-controls"
import { SlideNavigator } from "@/components/slide-navigator"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LayoutGrid, PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen, Blocks, Plus, Pencil, Play } from "lucide-react"
import type { Lesson, Slide, Component, ComponentType, SlideStatus } from "@/types/lesson"
import { defaultLesson } from "@/lib/default-lesson"
import { getInteractiveAndGamifiedComponents, normalizeSlides } from "@/lib/lesson-utils"
import { CustomDndProvider } from "@/components/dnd-provider"
import { useFeedback } from "@/lib/feedback-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ScoringProvider } from "@/context/scoring-context"
import { ComponentEditor } from "@/components/component-editor"
import { NavigationLockProvider } from '@/context/navigation-lock-context'
import { SaveLessonModal } from "@/components/modals/save-lesson-modal"
import { LoadLessonModal } from "@/components/modals/load-lesson-modal"
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { generateBatchAudio, type AudioGenerationProgress } from '@/lib/audio-generator'
import { applyLessonComponentAudioPatches, planLessonAudioPublish } from '@/lib/component-audio'
import { cn } from "@/lib/utils"

import { LessonVerificationOverlay } from "@/components/builder/lesson-verification-overlay"
import { validateLesson } from "@/lib/validation/master-validator"
import { useLessonHistory } from "@/hooks/use-lesson-history"

export function LessonBuilder() {
  // Initialize with default lesson or from localStorage
  // Initialize with defaultLesson to ensure server/client match during hydration
  const [lesson, setLesson] = useState<Lesson>(defaultLesson)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVerifyingLesson, setIsVerifyingLesson] = useState(false)

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewSessionKey, setPreviewSessionKey] = useState(0)

  const handleSetPreviewMode = useCallback((next: boolean) => {
    if (next && !previewMode) {
      setPreviewSessionKey((k) => k + 1)
    }
    setPreviewMode(next)
  }, [previewMode])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<"components" | "slides">("components")
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(true)
  const [isSlidesCollapsed, setIsSlidesCollapsed] = useState(false)
  const [slidesSheetOpen, setSlidesSheetOpen] = useState(false)
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false)

  // Master validation report for validation enforcement
  const masterReport = React.useMemo(() => validateLesson(lesson), [lesson])
  const hasValidationErrors = !masterReport.isValid || masterReport.errors.length > 0
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioGenerationProgress, setAudioGenerationProgress] = useState<AudioGenerationProgress | null>(null)

  const lessonIdForAudio = currentLessonId || lesson.id
  const audioPublishPlan = useMemo(
    () => planLessonAudioPublish(lesson, lessonIdForAudio),
    [lesson, lessonIdForAudio],
  )
  const missingAudioCount = audioPublishPlan.pendingCount
  const canPublish = hasUnpublishedChanges || missingAudioCount > 0

  const { toast } = useToast()
  const isMobile = useMobile()
  const { playFeedback } = useFeedback()
  const { undo, redo, canUndo, canRedo } = useLessonHistory(lesson, setLesson, isLoaded)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      if (event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (event.key.toLowerCase() === "z") {
        event.preventDefault()
        undo()
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undo, redo])

  const searchParams = useSearchParams()
  const router = useRouter()
  const lessonIdFromUrl = searchParams?.get('lessonId') || null
  const [isSaving, setIsSaving] = useState(false)

  const lastSavedLessonRef = useRef<string>("")
  const lessonVersionRef = useRef(0)

  // Load lesson on mount - either from DB (if ID present) or localStorage
  useEffect(() => {
    const initLesson = async () => {
      if (lessonIdFromUrl) {
        // Load from Database
        try {
          const fetchedLesson = await apiClient.studio.getLesson(lessonIdFromUrl);

          // Normalize DB response to Lesson type with robust slide title fallbacks
          let slides = normalizeSlides(fetchedLesson.content.slides || []);

          // Ensure at least one slide exists to prevent editor crash
          if (slides.length === 0) {
            slides = normalizeSlides([{
              id: `slide-${Date.now()}`,
              title: "Slide 1",
              components: [],
              status: "uncompleted",
              state: "active"
            }]);
          }

          const normalizedLesson: Lesson = {
            id: fetchedLesson.content?.id || lessonIdFromUrl,
            title: fetchedLesson.title || fetchedLesson.content?.title || "",
            description: fetchedLesson.description || fetchedLesson.content?.description || "",
            voice: fetchedLesson.voice || fetchedLesson.content?.voice || "inherit",
            introAudioUrl: fetchedLesson.introAudioUrl || fetchedLesson.content?.introAudioUrl || undefined,
            introTextHash: fetchedLesson.introTextHash || fetchedLesson.content?.introTextHash || undefined,
            slides: slides,
            settings: fetchedLesson.settings || fetchedLesson.content?.settings || {},
            author: fetchedLesson.author || fetchedLesson.content?.author || "",
            level: fetchedLesson.level || fetchedLesson.content?.level,
            duration: fetchedLesson.duration || fetchedLesson.content?.duration,
            createdAt: fetchedLesson.createdAt,
            updatedAt: fetchedLesson.updatedAt,
          }

          setLesson(normalizedLesson)
          setCurrentLessonId(lessonIdFromUrl)
          lessonVersionRef.current = Number(fetchedLesson.version) || 0
          lastSavedLessonRef.current = JSON.stringify(normalizedLesson)
          setHasUnpublishedChanges(false)
          toast({
            title: "Lesson Loaded",
            description: "Successfully loaded lesson from database",
          })
        } catch (error) {
          console.error("Failed to load lesson:", error)
          toast({
            title: "Load Error",
            description: "Failed to load lesson from database",
            variant: "destructive",
          })
        }
      } else if (typeof window !== "undefined") {
        // Fallback to LocalStorage
        const savedLesson = localStorage.getItem("currentLesson")
        if (savedLesson) {
          try {
            const parsed = JSON.parse(savedLesson)
            parsed.slides = normalizeSlides(parsed.slides || [])
            setLesson(parsed)
            lastSavedLessonRef.current = JSON.stringify(parsed)
            setHasUnpublishedChanges(false)
          } catch (e) {
            console.error("Failed to parse saved lesson:", e)
          }
        }
      }
      setIsLoaded(true)
    }

    initLesson()
  }, [lessonIdFromUrl, toast])

  // Save lesson to localStorage whenever it changes and update unpublished state based on baseline
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("currentLesson", JSON.stringify(lesson))

      const currentJson = JSON.stringify(lesson)
      if (!lastSavedLessonRef.current) {
        lastSavedLessonRef.current = currentJson
        setHasUnpublishedChanges(false)
      } else {
        setHasUnpublishedChanges(currentJson !== lastSavedLessonRef.current)
      }
    }
  }, [lesson, isLoaded])

  // Warn creator before navigating away without publishing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnpublishedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnpublishedChanges])

  // Make sure currentSlideIndex is valid
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1))
    }
  }, [lesson.slides.length, currentSlideIndex])

  // Get the current slide safely
  const currentSlide = lesson.slides[currentSlideIndex] || lesson.slides[0]
  const referenceOptions = useMemo(() => {
    return (lesson.slides || []).flatMap((slide) =>
      (slide.components || []).map((component) => ({
        id: component.id,
        type: component.type,
        title: String(component.props?.title || component.type),
      })),
    )
  }, [lesson.slides])

  // Add a new slide
  const addSlide = useCallback(async () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${lesson.slides.length + 1}`,
      components: [],
      status: "uncompleted",
      state: "active"
    }

    setLesson((prevLesson) => ({
      ...prevLesson,
      slides: [...prevLesson.slides, newSlide],
    }))

    // Set the current slide to the new slide
    setCurrentSlideIndex(lesson.slides.length)

    await playFeedback('complete')
  }, [lesson.slides.length, playFeedback])

  // Update slide status based on components
  const updateSlideStatus = useCallback((slide: Slide) => {
    const allInteractiveAndGamified = getInteractiveAndGamifiedComponents(slide.components);

    const newStatus: SlideStatus = allInteractiveAndGamified.length > 0
      ? allInteractiveAndGamified.every(comp => comp.status === "completed")
        ? "completed"
        : "uncompleted"
      : "completed";

    return {
      ...slide,
      status: newStatus
    };
  }, []);

  // Update a slide
  const updateSlide = useCallback(
    async (updatedSlide: Slide) => {
      // Update status based on components
      const finalSlide = updateSlideStatus(updatedSlide);

      setLesson((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.id === finalSlide.id ? finalSlide : slide
        ),
      }))
    },
    [updateSlideStatus],
  )

  // Delete a slide
  const deleteSlide = useCallback(
    async (index: number) => {
      if (lesson.slides.length <= 1) {
        await playFeedback('incorrect')
        toast({
          title: "Cannot delete slide",
          description: "A lesson must have at least one slide",
          variant: "destructive",
        })
        return
      }

      setLesson((prevLesson) => {
        // Create a new slides array without the deleted slide
        const updatedSlides = prevLesson.slides.filter((_, i) => i !== index)

        // Return a new lesson object with the updated slides
        return {
          ...prevLesson,
          slides: updatedSlides,
        }
      })

      // Adjust the current slide index if needed
      if (currentSlideIndex >= index && currentSlideIndex > 0) {
        setCurrentSlideIndex((prevIndex) => prevIndex - 1)
      }

      // Play feedback
      await playFeedback('click')

      toast({
        title: "Slide deleted",
        description: `Deleted slide: ${lesson.slides[index].title}`,
      })
    },
    [currentSlideIndex, lesson.slides, toast, playFeedback],
  )

  // Reorder slides
  const reorderSlides = useCallback(async (startIndex: number, endIndex: number) => {
    setLesson((prevLesson) => {
      const slides = Array.from(prevLesson.slides)
      const [removed] = slides.splice(startIndex, 1)
      slides.splice(endIndex, 0, removed)

      return {
        ...prevLesson,
        slides,
      }
    })

    setCurrentSlideIndex(endIndex)
    await playFeedback('click')
  }, [playFeedback])

  // Update lesson metadata
  const updateLessonMetadata = useCallback(async (metadata: Partial<Omit<Lesson, "slides">>) => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      ...metadata,
    }))
    await playFeedback('click', { animation: false })
  }, [playFeedback])

  // Export lesson
  const exportLesson = useCallback(async () => {
    const dataStr = JSON.stringify(lesson, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `${lesson.title.replace(/\s+/g, "-").toLowerCase()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    await playFeedback('complete')

    toast({
      title: "Lesson exported",
      description: `Saved as ${exportFileDefaultName}`,
    })
  }, [lesson, toast, playFeedback])

  // Save to Database
  const saveToDatabase = useCallback(async () => {
    if (hasValidationErrors) {
      toast({
        title: "Cannot save",
        description: "Fix verification errors in your lesson first",
        variant: "destructive",
      })
      return
    }

    if (!currentLessonId) {
      setSaveModalOpen(true); // Fallback to "Save As" if no ID
      return;
    }

    setIsSaving(true);
    try {
      const lessonData = {
        title: lesson.title,
        description: lesson.description,
        slides: lesson.slides,
        voice: lesson.voice,
        introAudioUrl: lesson.introAudioUrl,
        introTextHash: lesson.introTextHash,
        settings: lesson.settings || {},
        author: lesson.author,
        level: lesson.level,
        duration: lesson.duration,
        version: lessonVersionRef.current,
      };

      const saved = await apiClient.studio.updateLesson(currentLessonId, lessonData);
      if (saved?.version != null) {
        lessonVersionRef.current = saved.version;
      }
      lastSavedLessonRef.current = JSON.stringify(lesson);
      setHasUnpublishedChanges(false);

      toast({
        title: "Saved to Cloud",
        description: "Lesson changes synced to database",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      const conflict = error?.response?.status === 409;
      toast({
        title: conflict ? "Saved in another tab" : "Save Failed",
        description: conflict
          ? "Reload the lesson and try again so you don't overwrite newer changes."
          : "Could not save changes to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentLessonId, lesson, toast, hasValidationErrors]);

  // Publish & Generate Audio — resumes only missing/failed clips on retry
  const handlePublishAndGenerateAudio = useCallback(async () => {
    const lessonId = currentLessonId || lesson.id
    setIsGeneratingAudio(true)
    setAudioGenerationProgress(null)

    const plan = planLessonAudioPublish(lesson, lessonId)
    const { componentItems: itemsToGenerate, slideCueItems, introItem, skippedIds } = plan

    const resolvedVoice = (lesson.voice && lesson.voice !== "inherit") ? lesson.voice : undefined
    const allBatchItems = [
      ...(introItem ? [{ componentId: introItem.componentId, text: introItem.text, lessonId: introItem.lessonId, voice: resolvedVoice }] : []),
      ...itemsToGenerate.map(({ componentId, text, lessonId }) => ({ componentId, text, lessonId, voice: resolvedVoice })),
      ...slideCueItems.map(({ componentId, text, lessonId }) => ({ componentId, text, lessonId, voice: resolvedVoice })),
    ]

    let urlMap: Record<string, string | null> = {}
    let succeeded = 0
    let failed = 0

    if (allBatchItems.length > 0) {
      const result = await generateBatchAudio(allBatchItems, resolvedVoice, setAudioGenerationProgress)
      urlMap = result.urlMap
      succeeded = result.succeeded
      failed = result.failed
    } else {
      setAudioGenerationProgress({ completed: 0, total: 0, percent: 100 })
    }

    const skipped = skippedIds.size

    const newIntroAudioUrl = introItem ? (urlMap["intro"] ?? lesson.introAudioUrl) : lesson.introAudioUrl
    const newIntroTextHash = introItem ? introItem.newHash : lesson.introTextHash

    const slidesWithComponentAudio = applyLessonComponentAudioPatches(lesson.slides, itemsToGenerate, urlMap)
    const updatedSlides = slidesWithComponentAudio.map((slide, si) => {
      const slideCueItem = slideCueItems.find(i => i.slideIdx === si)
      const cueId = `slide-cue-${slide.id}`
      const newTitleAudioUrl = slideCueItem ? (urlMap[cueId] ?? slide.titleAudioUrl) : slide.titleAudioUrl
      const newTitleTextHash = slideCueItem ? slideCueItem.newHash : slide.titleTextHash

      return {
        ...slide,
        titleAudioUrl: newTitleAudioUrl,
        titleTextHash: newTitleTextHash,
      }
    })

    const updatedLesson = {
      ...lesson,
      introAudioUrl: newIntroAudioUrl,
      introTextHash: newIntroTextHash,
      slides: updatedSlides,
    }
    lastSavedLessonRef.current = JSON.stringify(updatedLesson)
    setLesson(updatedLesson)

    const remainingMissing = planLessonAudioPublish(updatedLesson, lessonId).pendingCount

    setIsGeneratingAudio(false)
    setAudioGenerationProgress(null)

    if (currentLessonId) {
      try {
        const saved = await apiClient.studio.updateLesson(currentLessonId, {
          title: updatedLesson.title,
          description: updatedLesson.description,
          slides: updatedLesson.slides,
          voice: updatedLesson.voice,
          introAudioUrl: updatedLesson.introAudioUrl,
          introTextHash: updatedLesson.introTextHash,
          settings: updatedLesson.settings || {},
          author: updatedLesson.author,
          level: updatedLesson.level,
          duration: updatedLesson.duration,
          version: lessonVersionRef.current,
        } as any)
        if (saved?.version != null) {
          lessonVersionRef.current = saved.version
        }
        lastSavedLessonRef.current = JSON.stringify(updatedLesson)
        setHasUnpublishedChanges(false)
      } catch (e) {
        console.error('[publish] DB save failed:', e)
        setHasUnpublishedChanges(true)
      }
    }

    toast({
      title: remainingMissing > 0 ? '🎙️ Audio partly published' : '🎙️ Audio Published!',
      description: allBatchItems.length === 0
        ? `All audio up to date (${skipped} unchanged)`
        : remainingMissing > 0
          ? `Generated: ${succeeded}, Still missing: ${remainingMissing} — click publish again to resume${skipped > 0 ? ` (${skipped} skipped)` : ''}`
          : `Generated: ${succeeded}${skipped > 0 ? `, Skipped: ${skipped}` : ''}`,
      variant: remainingMissing > 0 ? 'destructive' : undefined,
    })
  }, [lesson, currentLessonId, toast])

  // Import lesson (Wrapper Pattern)
  const importLesson = useCallback(
    async (importedLesson: Lesson) => {
      try {
        if (!Array.isArray(importedLesson.slides)) {
          throw new Error("Invalid lesson format")
        }

        // WRAPPER LOGIC:
        // If we have a current DB ID, keep it. Only update content.
        // If no DB ID, accept the imported ID.
        const updatedLesson = {
          ...importedLesson,
          // Preserved Identity
          id: currentLessonId || importedLesson.id,
          title: currentLessonId ? lesson.title : importedLesson.title, // Keep title if DB (optional, user can rename)
          author: currentLessonId ? lesson.author : importedLesson.author,

          // Overwritten Content
          slides: importedLesson.slides,
          settings: importedLesson.settings || {},

          updatedAt: new Date().toISOString(),
        }

        setLesson(updatedLesson)
        setCurrentSlideIndex(0)
        await playFeedback('complete')
        toast({
          title: "Content Imported",
          description: currentLessonId
            ? "Updated slides from file (kept database link)"
            : `Loaded lesson: ${importedLesson.title}`,
        })
      } catch (error) {
        console.error("Import error:", error)
        await playFeedback('incorrect')
        toast({
          title: "Import failed",
          description: "The selected file is not a valid lesson",
          variant: "destructive",
        })
      }
    },
    [toast, playFeedback, currentLessonId, lesson.title, lesson.author],
  )

  // Add component to the current slide
  const addComponent = useCallback(async (type: string, defaultProps: Record<string, any> = {}) => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type: type as ComponentType,
      props: defaultProps,
      state: "active",
      status: "uncompleted",
      ...(["quiz", "dragDrop", "matchingPairs", "fillInTheBlank", "hotspot", "codeEditor"].includes(type) && { mode: "practice" })
    };

    const updatedComponents = [...currentSlide.components, newComponent];
    await updateSlide({ ...currentSlide, components: updatedComponents });

    setEditingComponentId(newComponent.id);
    setIsInspectorOpen(true);
    setSidebarOpen(false);

    await playFeedback('click')
  }, [currentSlide, updateSlide, playFeedback]);

  // Update a component in the current slide
  const updateComponent = useCallback(async (componentId: string, props: Record<string, any>) => {
    if (!currentSlide) return;
    const newComponents = currentSlide.components.map(c =>
      c.id === componentId ? {
        ...c,
        props,
        ...(props.mode && { mode: props.mode }),
        ...(props.state && { state: props.state })
      } : c
    );
    await updateSlide({ ...currentSlide, components: newComponents });
    await playFeedback('click', { animation: false });
  }, [currentSlide, updateSlide, playFeedback]);

  // Handle component selection for editing
  const handleSelectComponent = useCallback(async (componentId: string) => {
    setEditingComponentId(componentId);
    setIsInspectorOpen(true);
    await playFeedback('click', { animation: false });
  }, [playFeedback]);

  const handleCloseInspector = useCallback(() => {
    setEditingComponentId(null);
    setIsInspectorOpen(false);
  }, []);

  const openLibrary = useCallback(() => {
    if (isMobile) {
      setActiveSidebar("components")
      setSidebarOpen(true)
      return
    }
    setIsLibraryCollapsed(false)
  }, [isMobile])

  const syncLessonIdInUrl = useCallback((lessonId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("lessonId", lessonId)
    router.replace(`/editor?${params.toString()}`)
  }, [router, searchParams])

  const handleSaveAsSuccess = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId)
    lastSavedLessonRef.current = JSON.stringify(lesson)
    setHasUnpublishedChanges(false)
    syncLessonIdInUrl(lessonId)
    toast({
      title: "Saved to Cloud",
      description: "Lesson created in the selected module",
    })
  }, [lesson, syncLessonIdInUrl, toast])

  const handleLoadSuccess = useCallback((loadedLesson: Lesson, lessonId: string, version?: number) => {
    setLesson(loadedLesson)
    setCurrentLessonId(lessonId)
    setCurrentSlideIndex(0)
    lessonVersionRef.current = version || 0
    lastSavedLessonRef.current = JSON.stringify(loadedLesson)
    setHasUnpublishedChanges(false)
    syncLessonIdInUrl(lessonId)
    toast({
      title: "Lesson Loaded",
      description: "Opened lesson from the database",
    })
  }, [syncLessonIdInUrl, toast])

  const editingComponent = editingComponentId
    ? currentSlide?.components.find(c => c.id === editingComponentId)
    : null;

  return (
    <NavigationLockProvider>
      <ScoringProvider lesson={lesson}>
        <CustomDndProvider>
          <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0F172A] text-slate-200 relative">
            {!previewMode && (
              <LessonControls
                lesson={lesson}
                updateLessonMetadata={updateLessonMetadata}
                exportLesson={exportLesson}
                importLesson={importLesson}
                previewMode={previewMode}
                setPreviewMode={handleSetPreviewMode}
                isMobile={isMobile}
                onSaveToDatabase={saveToDatabase}
                onLoadFromDatabase={() => setLoadModalOpen(true)}
                isSaving={isSaving}
                onPublishAndGenerateAudio={handlePublishAndGenerateAudio}
                isGeneratingAudio={isGeneratingAudio}
                audioGenerationProgress={audioGenerationProgress}
                missingAudioCount={missingAudioCount}
                canPublish={canPublish}
                hasUnpublishedChanges={hasUnpublishedChanges}
                hasValidationErrors={hasValidationErrors}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                className="flex-shrink-0 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md"
              />
            )}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              {previewMode ? (
                <BuilderLessonPreview
                  key={previewSessionKey}
                  lesson={lesson}
                  onExitPreview={() => handleSetPreviewMode(false)}
                />
              ) : (
                <>
                  {!isMobile && (
                    <CollapsibleRail
                      side="left"
                      collapsed={isSlidesCollapsed}
                      onToggle={() => setIsSlidesCollapsed((value) => !value)}
                      expandLabel="Expand slides"
                      collapseLabel="Collapse slides"
                      icon={LayoutGrid}
                      widthClass="w-[200px]"
                      collapsedExtra={
                        <span className="text-[10px] font-bold text-slate-500 [writing-mode:vertical-rl] rotate-180 tracking-widest">
                          {currentSlideIndex + 1}/{lesson.slides.length}
                        </span>
                      }
                    >
                      <ScrollArea className="flex-1">
                        <SlideNavigator
                          slides={lesson.slides}
                          currentSlideIndex={currentSlideIndex}
                          setCurrentSlideIndex={setCurrentSlideIndex}
                          addSlide={addSlide}
                          deleteSlide={deleteSlide}
                          reorderSlides={reorderSlides}
                          slideResults={masterReport.slideResults}
                        />
                      </ScrollArea>
                    </CollapsibleRail>
                  )}

                  <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full max-w-full overflow-hidden bg-slate-950/50 pb-16 sm:pb-0">
                    <div className="flex-1 h-full min-h-0 w-full max-w-full flex flex-col p-1 sm:p-3 overflow-hidden">
                      <div className="w-full max-w-full flex-1 h-full min-h-0 bg-white rounded-xl shadow-2xl shadow-emerald-900/10 overflow-hidden relative border border-slate-800">
                        <SlideEditor
                          slide={currentSlide}
                          updateSlide={updateSlide}
                          deleteSlide={deleteSlide}
                          slideIndex={currentSlideIndex}
                          onSelectComponent={handleSelectComponent}
                          selectedComponentId={editingComponentId}
                          onOpenLibrary={openLibrary}
                          onAddLibraryComponent={addComponent}
                          className="h-full"
                        />
                      </div>
                    </div>
                  </div>

                  {!isMobile && (
                    <CollapsibleRail
                      side="right"
                      collapsed={isLibraryCollapsed}
                      onToggle={() => setIsLibraryCollapsed((value) => !value)}
                      expandLabel="Expand component library"
                      collapseLabel="Collapse component library"
                      icon={Blocks}
                      widthClass="w-[300px] max-w-[300px]"
                    >
                      <ComponentLibrary
                        addComponent={addComponent}
                        headerAction={
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsLibraryCollapsed(true)}
                            className="h-7 w-7 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md"
                            title="Collapse component library"
                          >
                            <PanelRightClose className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </CollapsibleRail>
                  )}

                  {!isMobile && (
                    <Dialog
                      modal={false}
                      open={Boolean(editingComponent) && isInspectorOpen}
                      onOpenChange={(open) => { if (!open) handleCloseInspector() }}
                    >
                      <DialogContent
                        hideClose
                        hideOverlay
                        className="max-w-none w-[min(96vw,80rem)] h-[min(92vh,940px)] p-0 gap-0 overflow-hidden bg-[#0B1220] border-white/10 text-slate-200 sm:rounded-3xl flex flex-col shadow-[0_24px_80px_-20px_rgba(0,0,0,0.55)]"
                        onInteractOutside={(event) => event.preventDefault()}
                      >
                        <DialogTitle className="sr-only">Edit block</DialogTitle>
                        {editingComponent && (
                          <ComponentEditor
                            key={editingComponent.id}
                            component={editingComponent}
                            updateComponent={(props) => updateComponent(editingComponent.id, props)}
                            onClose={handleCloseInspector}
                            lessonId={currentLessonId || lesson.id}
                            lesson={lesson}
                            referenceOptions={referenceOptions}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  {isMobile && (
                    <Sheet open={Boolean(editingComponent) && isInspectorOpen} onOpenChange={(open) => { if (!open) handleCloseInspector() }}>
                      <SheetContent side="bottom" className="h-[90vh] p-0 bg-[#0B1220] border-t border-white/10">
                        {editingComponent && (
                          <ComponentEditor
                            key={editingComponent.id}
                            component={editingComponent}
                            updateComponent={(props) => updateComponent(editingComponent.id, props)}
                            onClose={handleCloseInspector}
                            isMobile={true}
                            lessonId={currentLessonId || lesson.id}
                            lesson={lesson}
                            referenceOptions={referenceOptions}
                          />
                        )}
                      </SheetContent>
                    </Sheet>
                  )}

                  {isMobile && (
                    <Sheet open={sidebarOpen && activeSidebar === "components"} onOpenChange={setSidebarOpen}>
                      <SheetContent side="bottom" className="h-[70vh] p-0 bg-[#0F172A] border-t border-slate-800">
                        <div className="flex flex-col h-full overflow-hidden">
                          <ComponentLibrary addComponent={addComponent} />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </>
              )}
            </div>

            {/* Mobile Bottom Action Bar — Fixed to bottom of viewport */}
            {isMobile && !previewMode && (
              <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 border-t border-slate-800 bg-[#0F172A]/95 backdrop-blur-lg shadow-2xl shrink-0">
                <button
                  onClick={() => setSlidesSheetOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-all"
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-wider">Slides</span>
                </button>
                <button
                  onClick={() => { setActiveSidebar("components"); setSidebarOpen(true); }}
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-all"
                >
                  <Blocks className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-wider">Library</span>
                </button>
                <button
                  onClick={addSlide}
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-wider">Add Slide</span>
                </button>
                <button
                  onClick={() => handleSetPreviewMode(!previewMode)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${previewMode
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60"
                    }`}
                >
                  {previewMode ? <Pencil className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="text-[10px] font-bold tracking-wider">{previewMode ? "Edit" : "Preview"}</span>
                </button>
              </div>
            )}

            {/* Mobile Slides Navigator Sheet */}
            {isMobile && (
              <Sheet open={slidesSheetOpen} onOpenChange={setSlidesSheetOpen}>
                <SheetContent side="bottom" className="h-[80vh] p-0 bg-[#0F172A] border-t border-slate-800">
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
                      <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Slides</h3>
                      <span className="text-xs text-slate-500">{lesson.slides.length} slide{lesson.slides.length !== 1 ? "s" : ""}</span>
                    </div>
                    <ScrollArea className="flex-1">
                      <SlideNavigator
                        slides={lesson.slides}
                        currentSlideIndex={currentSlideIndex}
                        setCurrentSlideIndex={(idx) => { setCurrentSlideIndex(idx); setSlidesSheetOpen(false); }}
                        addSlide={async () => { await addSlide(); setSlidesSheetOpen(false); }}
                        deleteSlide={deleteSlide}
                        reorderSlides={reorderSlides}
                        slideResults={masterReport.slideResults}
                      />
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Top-to-Bottom Verification Overlay on Load */}
            <LessonVerificationOverlay
              isVisible={isVerifyingLesson}
              lessonTitle={lesson.title}
            />

            <SaveLessonModal
              open={saveModalOpen}
              onOpenChange={setSaveModalOpen}
              lesson={lesson}
              onSaveSuccess={handleSaveAsSuccess}
              currentLessonId={currentLessonId}
            />
            <LoadLessonModal
              open={loadModalOpen}
              onOpenChange={setLoadModalOpen}
              onLoadSuccess={handleLoadSuccess}
            />
          </div>
        </CustomDndProvider>
      </ScoringProvider>
    </NavigationLockProvider >
  )
}

function CollapsibleRail({
  side,
  collapsed,
  onToggle,
  expandLabel,
  collapseLabel,
  icon: Icon,
  widthClass,
  collapsedExtra,
  children,
}: {
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  expandLabel: string
  collapseLabel: string
  icon: React.ComponentType<{ className?: string }>
  widthClass: string
  collapsedExtra?: React.ReactNode
  children: React.ReactNode
}) {
  const ExpandIcon = side === "left" ? PanelLeftOpen : PanelRightOpen
  const CollapseIcon = side === "left" ? PanelLeftClose : PanelRightClose

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#1e293b]/30 backdrop-blur-sm transition-[width] duration-300 ease-out overflow-x-hidden overflow-y-hidden shrink-0",
        side === "left" ? "border-r border-slate-800" : "border-l border-slate-800",
        collapsed ? "w-12" : widthClass,
      )}
    >
      {collapsed ? (
        <div className="flex flex-col items-center py-4 gap-4 animate-in fade-in duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800 h-9 w-9 rounded-lg"
            title={expandLabel}
          >
            <ExpandIcon className="w-5 h-5" />
          </Button>
          <div className="w-8 h-px bg-slate-800/80" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-500 hover:text-emerald-400 hover:bg-slate-800 h-9 w-9 rounded-lg"
            title={expandLabel}
          >
            <Icon className="w-5 h-5" />
          </Button>
          {collapsedExtra}
        </div>
      ) : (
        <div className="flex flex-col h-full min-w-0 min-h-0 animate-in fade-in duration-200">
          {side === "left" && (
            <div className="flex items-center justify-end px-2 pt-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-7 w-7 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md"
                title={collapseLabel}
              >
                <CollapseIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">{children}</div>
        </div>
      )}
    </div>
  )
}
