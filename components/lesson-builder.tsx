"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ComponentLibrary } from "@/components/component-library"
import { SlideEditor } from "@/components/slide-editor"
import { SlidePreview } from "@/components/slide-preview"
import { LessonControls } from "@/components/lesson-controls"
import { SlideNavigator } from "@/components/slide-navigator"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LayoutGrid } from "lucide-react"
import type { Lesson, Slide, Component, ComponentType, SlideStatus } from "@/types/lesson"
import { defaultLesson } from "@/lib/default-lesson"
import { getCategorizedComponents, getInteractiveAndGamifiedComponents } from "@/lib/lesson-utils"
import { CustomDndProvider } from "@/components/dnd-provider"
import { useFeedback } from "@/lib/feedback-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ScoringProvider } from "@/context/scoring-context"
import { ComponentEditor } from "@/components/component-editor"
import { NavigationLockProvider } from '@/context/navigation-lock-context'
import { SaveLessonModal } from "@/components/modals/save-lesson-modal"
import { LoadLessonModal } from "@/components/modals/load-lesson-modal"
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'

export function LessonBuilder() {
  // Initialize with default lesson or from localStorage
  // Initialize with defaultLesson to ensure server/client match during hydration
  const [lesson, setLesson] = useState<Lesson>(defaultLesson)
  const [isLoaded, setIsLoaded] = useState(false)

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<"components" | "slides">("components")
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)

  const { toast } = useToast()
  const isMobile = useMobile()
  const { playFeedback } = useFeedback()

  const searchParams = useSearchParams()
  const lessonIdFromUrl = searchParams.get('lessonId')
  const [isSaving, setIsSaving] = useState(false)

  // Load lesson on mount - either from DB (if ID present) or localStorage
  useEffect(() => {
    const initLesson = async () => {
      if (lessonIdFromUrl) {
        // Load from Database
        try {
          const fetchedLesson = await apiClient.studio.getLesson(lessonIdFromUrl);

          // Normalize DB response to Lesson type
          const slides = fetchedLesson.content.slides || [];

          // Ensure at least one slide exists to prevent editor crash
          if (slides.length === 0) {
            slides.push({
              id: `slide-${Date.now()}`,
              title: "Slide 1",
              components: [],
              status: "uncompleted",
              state: "active"
            });
          }

          const normalizedLesson: Lesson = {
            id: fetchedLesson.content.id || lessonIdFromUrl,
            title: fetchedLesson.title,
            description: fetchedLesson.content.description,
            slides: slides,
            settings: fetchedLesson.content.settings || {},
            author: fetchedLesson.content.author,
            level: fetchedLesson.content.level,
            duration: fetchedLesson.content.duration,
            createdAt: fetchedLesson.createdAt,
            updatedAt: fetchedLesson.updatedAt,
          }

          setLesson(normalizedLesson)
          setCurrentLessonId(lessonIdFromUrl)
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
            setLesson(parsed)
          } catch (e) {
            console.error("Failed to parse saved lesson:", e)
          }
        }
      }
      setIsLoaded(true)
    }

    initLesson()
  }, [lessonIdFromUrl, toast])

  // Save lesson to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("currentLesson", JSON.stringify(lesson))
    }
  }, [lesson, isLoaded])

  // Make sure currentSlideIndex is valid
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1))
    }
  }, [lesson.slides.length, currentSlideIndex])

  // Get the current slide safely
  const currentSlide = lesson.slides[currentSlideIndex] || lesson.slides[0]

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

    // Play feedback
    await playFeedback('complete')

    toast({
      title: "Slide added",
      description: `Added new slide: ${newSlide.title}`,
    })
  }, [lesson.slides.length, toast, playFeedback])

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
        settings: lesson.settings || {},
        author: lesson.author,
        level: lesson.level,
        duration: lesson.duration,
      };

      await apiClient.studio.updateLesson(currentLessonId, lessonData);

      toast({
        title: "Saved to Cloud",
        description: "Lesson changes synced to database",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not save changes to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentLessonId, lesson, toast]);

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

    // Auto-select the new component
    setEditingComponentId(newComponent.id);
    setIsInspectorOpen(true);

    await playFeedback('click')
    toast({
      title: "Component added",
      description: `Added new ${type} component`,
    });
  }, [currentSlide, updateSlide, toast, playFeedback]);

  const handleNextSlide = useCallback(async () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
      if (currentSlideIndex === lesson.slides.length - 2) {
        await playFeedback('complete')
      }
    } else {
      toast({
        title: "You've reached the end!",
        description: "Great job completing all slides!",
      })
    }
  }, [currentSlideIndex, lesson.slides.length, toast, playFeedback])

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }, [currentSlideIndex])

  const handleAddSlide = useCallback(async () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${lesson.slides.length + 1}`,
      components: [],
      status: "uncompleted",
      state: "active"
    };
    setLesson((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    await playFeedback('click')
  }, [lesson.slides.length, playFeedback])

  const handleDeleteSlide = useCallback(async () => {
    if (lesson.slides.length <= 1) {
      toast({
        title: "Cannot delete slide",
        description: "A lesson must have at least one slide",
        variant: "destructive",
      })
      await playFeedback('incorrect')
      return
    }
    const newSlides = lesson.slides.filter((_, index) => index !== currentSlideIndex)
    setLesson((prevLesson) => ({
      ...prevLesson,
      slides: newSlides,
    }))
    if (currentSlideIndex === lesson.slides.length - 1) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }, [currentSlideIndex, lesson.slides, toast, playFeedback])

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

  // Handle inspector close
  const handleCloseInspector = useCallback(() => {
    setEditingComponentId(null);
    setIsInspectorOpen(false);
  }, []);

  const editingComponent = editingComponentId
    ? currentSlide?.components.find(c => c.id === editingComponentId)
    : null;

  return (
    <NavigationLockProvider>
      <ScoringProvider lesson={lesson}>
        <CustomDndProvider>
          <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0F172A] text-slate-200">
            <LessonControls
              lesson={lesson}
              updateLessonMetadata={updateLessonMetadata}
              exportLesson={exportLesson}
              importLesson={importLesson}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              isMobile={isMobile}
              onSaveToDatabase={saveToDatabase}
              isSaving={isSaving}
              className="flex-shrink-0 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md"
            />
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              {/* Far left - Slide Navigator */}
              {!isMobile && (
                <div className="w-[260px] border-r border-slate-800 flex flex-col h-full bg-[#1e293b]/30 backdrop-blur-sm">
                  <ScrollArea className="flex-1">
                    <SlideNavigator
                      slides={lesson.slides}
                      currentSlideIndex={currentSlideIndex}
                      setCurrentSlideIndex={setCurrentSlideIndex}
                      addSlide={handleAddSlide}
                      deleteSlide={handleDeleteSlide}
                      reorderSlides={reorderSlides}
                    />
                  </ScrollArea>
                </div>
              )}

              {/* Main content area (Stage) */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950/50">
                <ScrollArea className="flex-1">
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-xl shadow-2xl shadow-emerald-900/10 overflow-hidden relative border border-slate-800">
                      {previewMode ? (
                        <SlidePreview
                          slide={currentSlide}
                          onNext={handleNextSlide}
                          onPrev={handlePrevSlide}
                          isFirst={currentSlideIndex === 0}
                          isLast={currentSlideIndex === lesson.slides.length - 1}
                        />
                      ) : (
                        <SlideEditor
                          slide={currentSlide}
                          updateSlide={updateSlide}
                          deleteSlide={deleteSlide}
                          slideIndex={currentSlideIndex}
                          onSelectComponent={handleSelectComponent}
                          selectedComponentId={editingComponentId}
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right sidebar - Unified Inspector/Library */}
              {!isMobile && (
                <div className="w-[480px] border-l border-slate-800 flex flex-col h-full bg-[#1e293b]/30 backdrop-blur-sm">
                  {isInspectorOpen && editingComponent ? (
                    <ComponentEditor
                      component={editingComponent}
                      updateComponent={(props) => updateComponent(editingComponent.id, props)}
                      onClose={handleCloseInspector}
                    />
                  ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="font-semibold text-emerald-400">Component Library</h3>
                      </div>
                      <ScrollArea className="flex-1">
                        <ComponentLibrary addComponent={addComponent} />
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Sheet for Inspector */}
              {isMobile && isInspectorOpen && editingComponent && (
                <Sheet open={isInspectorOpen} onOpenChange={(open) => !open && handleCloseInspector()}>
                  <SheetContent side="bottom" className="h-[85vh] p-0 bg-[#0F172A] border-t border-slate-800">
                    <ComponentEditor
                      component={editingComponent}
                      updateComponent={(props) => updateComponent(editingComponent.id, props)}
                      onClose={handleCloseInspector}
                      isMobile={true}
                    />
                  </SheetContent>
                </Sheet>
              )}

              {/* Mobile Sheet for Component Library */}
              {isMobile && !isInspectorOpen && (
                <Sheet open={sidebarOpen && activeSidebar === "components"} onOpenChange={setSidebarOpen}>
                  <SheetContent side="bottom" className="h-[70vh] p-0 bg-[#0F172A] border-t border-slate-800">
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="font-semibold text-emerald-400">Component Library</h3>
                      </div>
                      <ScrollArea className="flex-1">
                        <ComponentLibrary addComponent={addComponent} />
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </CustomDndProvider>
      </ScoringProvider>
    </NavigationLockProvider>
  )
}
