"use client"

import { useState, useRef } from 'react';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Menu, Clock, User, Award } from 'lucide-react';
import type { Lesson } from '@/types/lesson';

export function LessonViewer() {
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const lessonContentRef = useRef<{ setCurrentSlideIndex: (index: number) => void } | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      
      // Validate required Lesson fields
      const requiredFields = ['id', 'title', 'description', 'author', 'level', 'duration', 'slides', 'createdAt', 'updatedAt'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Invalid lesson file format - missing required field: ${field}`);
        }
      }

      if (!Array.isArray(parsed.slides)) {
        throw new Error('Invalid lesson file format - slides must be an array');
      }

      // Validate slide structure
      for (const slide of parsed.slides) {
        const requiredSlideFields = ['id', 'title', 'components'];
        for (const field of requiredSlideFields) {
          if (!slide[field]) {
            throw new Error(`Invalid slide format - missing required field: ${field}`);
          }
        }

        if (!Array.isArray(slide.components)) {
          throw new Error('Invalid slide format - components must be an array');
        }

        // Validate components
        for (const component of slide.components) {
          const requiredComponentFields = ['id', 'type', 'props'];
          for (const field of requiredComponentFields) {
            if (!component[field]) {
              throw new Error(`Invalid component format - missing required field: ${field}`);
            }
          }
        }
      }

      setLessonData(parsed);
      setError(null);
    } catch (err) {
      setError('Failed to load lesson file. Please make sure it\'s a valid After School Tech lesson file.');
      setLessonData(null);
    }
  };

  const resetViewer = () => {
    setLessonData(null);
    setError(null);
    setCurrentScore(0);
    setTotalPossible(0);
    setCurrentSlideIndex(0);
  };

  const handleScoreUpdate = (score: number, total: number) => {
    setCurrentScore(score);
    setTotalPossible(total);
  };

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Lesson Title */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{lessonData?.title}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Slides Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">SLIDES</h3>
            <div className="space-y-1">
              {lessonData?.slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant={index === currentSlideIndex ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left h-auto py-2 px-3 ${
                    index === currentSlideIndex ? 'bg-secondary' : ''
                  }`}
                  onClick={() => handleJumpToSlide(index)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs opacity-50 mt-0.5">#{index + 1}</span>
                    <span className="text-sm">{slide.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Score Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              SCORE
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <Progress value={(currentScore / totalPossible) * 100} />
              <p className="text-sm text-muted-foreground">
                {currentScore} / {totalPossible} points
              </p>
            </div>
          </div>

          {/* Lesson Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                AUTHOR
              </h3>
              <p className="text-sm">{lessonData?.author}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                DURATION
              </h3>
              <p className="text-sm">{lessonData?.duration} minutes</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">DESCRIPTION</h3>
              <p className="text-sm text-muted-foreground">{lessonData?.description}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* End Lesson Button */}
      <div className="p-4 border-t mt-auto">
        <Button variant="destructive" className="w-full" onClick={resetViewer}>
          End Lesson
        </Button>
      </div>
    </div>
  );

  if (!lessonData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-lg">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Upload Lesson File</h2>
            <p className="mb-6 text-muted-foreground">
              Upload an After School Tech lesson file (.json) to start learning
            </p>
            <FileUploader onFileUpload={handleFileUpload} />
            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:block w-80 border-r bg-muted/40">
        {renderSidebarContent()}
      </div>

      {/* Mobile Menu Button and Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <SheetContent side="left" className="w-80 p-0">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <LessonContent 
          ref={lessonContentRef}
          lesson={lessonData} 
          onScoreUpdate={handleScoreUpdate}
          currentSlideIndex={currentSlideIndex}
          onSlideChange={setCurrentSlideIndex}
        />
      </div>
    </div>
  );
} 