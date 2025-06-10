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
import type { Lesson, Slide, Component, ComponentType } from "@/types/lesson"
import { defaultLesson } from "@/lib/default-lesson"
import { CustomDndProvider } from "@/components/dnd-provider"
import { useFeedback } from "@/lib/feedback-context"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LessonBuilder() {
  // Initialize with default lesson or from localStorage
  const [lesson, setLesson] = useState<Lesson>(() => {
    if (typeof window !== "undefined") {
      const savedLesson = localStorage.getItem("currentLesson")
      if (savedLesson) {
        try {
          return JSON.parse(savedLesson)
        } catch (e) {
          console.error("Failed to parse saved lesson:", e)
        }
      }
    }
    return defaultLesson
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<"components">("components")
  const { toast } = useToast()
  const isMobile = useMobile()
  const { playFeedback } = useFeedback()

  // Save lesson to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentLesson", JSON.stringify(lesson))
    }
  }, [lesson])

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

  // Update a slide
  const updateSlide = useCallback(
    async (updatedSlide: Slide) => {
      setLesson((prevLesson) => {
        // Create a new slides array with the updated slide
        const updatedSlides = prevLesson.slides.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide,
        )

        // Return a new lesson object with the updated slides
        return {
          ...prevLesson,
          slides: updatedSlides,
        }
      })

      // Play feedback
      await playFeedback('click', { animation: false })
    },
    [currentSlideIndex, playFeedback],
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

  // Import lesson
  const importLesson = useCallback(
    async (importedLesson: Lesson) => {
      try {
        // Validate the imported lesson has the required structure
        if (!importedLesson.id || !Array.isArray(importedLesson.slides)) {
          throw new Error("Invalid lesson format")
        }

        // Update the timestamps
        const updatedLesson = {
          ...importedLesson,
          updatedAt: new Date().toISOString(),
        }

        // Completely replace the current lesson
        setLesson(updatedLesson)

        // Reset to the first slide
        setCurrentSlideIndex(0)

        // Force a refresh of the UI
        setTimeout(() => {
          // This will trigger a re-render
          setLesson((prev) => ({ ...prev }))
        }, 100)

        await playFeedback('complete')

        toast({
          title: "Lesson imported",
          description: `Loaded lesson: ${importedLesson.title}`,
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
    [toast, playFeedback],
  )

  // Add component to the current slide
  const addComponent = useCallback(async (type: string, defaultProps: Record<string, any> = {}) => {
      const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type: type as ComponentType,
      props: defaultProps,
    };

    updateSlide({
      ...currentSlide,
      components: [...currentSlide.components, newComponent],
    });

    await playFeedback('click')

    toast({
      title: "Component added",
      description: `Added new ${type} component`,
    });
  }, [currentSlide, updateSlide, toast, playFeedback]);

  const handleNextSlide = useCallback(async () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
      // Only play sound when completing the last slide
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
    }

    setLesson((prevLesson) => ({
          ...prevLesson,
      slides: [...prevLesson.slides, newSlide],
    }))

    setCurrentSlideIndex(lesson.slides.length)
    await playFeedback('click')
  }, [lesson.slides.length, toast, playFeedback])

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

  const handleSaveLesson = useCallback(async () => {
    // Save lesson logic here
    toast({
      title: "Lesson saved!",
      description: "Your lesson has been saved successfully.",
    })
    await playFeedback('complete')
  }, [lesson, toast, playFeedback])

  const handlePublishLesson = useCallback(async () => {
    // Validate lesson
    const hasEmptySlides = lesson.slides.some(slide => slide.components.length === 0)
    if (hasEmptySlides) {
      toast({
        title: "Cannot publish lesson",
        description: "Some slides are empty. Add content to all slides before publishing.",
        variant: "destructive",
      })
      await playFeedback('incorrect')
      return
    }

    // Publish lesson logic here
    toast({
      title: "Lesson published!",
      description: "Your lesson is now available to students.",
    })
    await playFeedback('complete')
  }, [toast, playFeedback])

  const handleUpdateSlideTitle = useCallback(async (newTitle: string) => {
    if (!currentSlide) return

    const updatedSlide = {
      ...currentSlide,
      title: newTitle,
    }

    updateSlide(updatedSlide)
  }, [currentSlide, updateSlide, toast, playFeedback])

  return (
    <CustomDndProvider>
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        <LessonControls
          lesson={lesson}
          updateLessonMetadata={updateLessonMetadata}
          exportLesson={exportLesson}
          importLesson={importLesson}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          isMobile={isMobile}
          className="flex-shrink-0"
        />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Far left - Slide Navigator */}
          {!isMobile && (
            <div className="w-[240px] border-r flex flex-col h-full bg-muted/10">
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

          {/* Components Sidebar */}
          {isMobile ? (
            <>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0 overflow-hidden">
                  {activeSidebar === "components" ? (
                    <ScrollArea className="h-full">
                      <ComponentLibrary addComponent={addComponent} />
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="h-full">
                      <SlideNavigator
                        slides={lesson.slides}
                        currentSlideIndex={currentSlideIndex}
                        setCurrentSlideIndex={(index) => {
                          setCurrentSlideIndex(index);
                          setSidebarOpen(false);
                        }}
                        addSlide={handleAddSlide}
                        deleteSlide={handleDeleteSlide}
                        reorderSlides={reorderSlides}
                      />
                    </ScrollArea>
                  )}
                </SheetContent>
              </Sheet>
              
              {/* Mobile FABs */}
              <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                  onClick={() => {
                    setActiveSidebar("components");
                    setSidebarOpen(true);
                  }}
                >
                  <LayoutGrid className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                  onClick={() => {
                    setActiveSidebar("slides");
                    setSidebarOpen(true);
                  }}
                >
                  <span className="text-lg font-medium">
                    {currentSlideIndex + 1}
                  </span>
                </Button>
              </div>
            </>
          ) : (
            <div className="w-[320px] border-r flex flex-col h-full">
                <ComponentLibrary addComponent={addComponent} />
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                className="duo-animated h-full"
              />
            )}
          </div>
        </div>
      </div>
    </CustomDndProvider>
  )
}
