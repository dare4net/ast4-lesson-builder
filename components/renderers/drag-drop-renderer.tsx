"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MoveUp, MoveDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/lib/feedback-context"

interface DragItem {
  id: string
  text: string
  correctIndex: number
}

interface DragDropRendererProps {
  title?: string
  items?: DragItem[]
  shuffled?: boolean
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  savedState?: any // Persisted state from parent
  setComponentState?: (state: any) => void // State persister
}

// Generate a random pastel color
const generatePastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
};

export function DragDropRenderer({
  title = "Arrange in the correct order",
  items = [],
  shuffled = true,
  points = 15,
  isEditing = false,
  scoreContext,
  savedState,
  setComponentState,
}: DragDropRendererProps) {
  const { playFeedback } = useFeedback();
  const [mounted, setMounted] = useState(false);
  // State initialization: use savedState if present, else shuffle and persist
  const [dragItems, setDragItems] = useState<({
    id: string;
    text: string;
    correctIndex: number;
    color?: string;
  })[]>(() => {
    if (savedState?.dragItems) return savedState.dragItems;
    const withColor = (arr: DragItem[]) => arr.map(item => ({ ...item, color: generatePastelColor() }));
    if (isEditing) return withColor([...items].sort((a, b) => a.correctIndex - b.correctIndex));
    let arr = withColor([...items]);
    if (shuffled) arr = [...arr].sort(() => Math.random() - 0.5);
    return arr;
  });
  const [isSubmitted, setIsSubmitted] = useState(() => savedState?.isSubmitted || false);
  const [isCorrect, setIsCorrect] = useState(() => savedState?.isCorrect || false);

  // On first mount, persist the initial state if no savedState
  useEffect(() => {
    setMounted(true);
    if (!savedState) {
      setComponentState?.({ dragItems, isSubmitted: false, isCorrect: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on every relevant change, but only after mount
  useEffect(() => {
    if (!mounted) return;
    setComponentState?.({ dragItems, isSubmitted, isCorrect });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragItems, isSubmitted, isCorrect]);

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= dragItems.length) return;
    await playFeedback('click', { sound: true, animation: false });
    const newItems = [...dragItems];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;
    setDragItems(newItems);
  };

  const handleCheck = async () => {
    setIsSubmitted(true);
    const isAllCorrect = dragItems.every((item, index) => item.correctIndex === index);
    setIsCorrect(isAllCorrect);
    if (isAllCorrect) {
      await playFeedback('correct');
      if (scoreContext) {
        scoreContext.addPoints(points);
      }
    } else {
      await playFeedback('incorrect');
    }
  };

  // When resetting, assign new pastel colors
  const handleReset = async () => {
    const withColor = (arr: DragItem[]) => arr.map(item => ({ ...item, color: generatePastelColor() }));
    let newItems = withColor([...items]);
    if (shuffled) {
      newItems = [...newItems].sort(() => Math.random() - 0.5);
    }
    setDragItems(newItems);
    setIsSubmitted(false);
    setIsCorrect(false);
    await playFeedback('click', { sound: true, animation: false });
  };

  if (!mounted) return null;

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="space-y-2">
          {dragItems.map((item, index) => (
            <div key={item.id} className="p-3 bg-muted rounded">
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="duo-card">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="space-y-2">
          {dragItems.map((item, index) => (
            <div
              key={item.id}
              style={{ backgroundColor: item.color }}
              className={cn(
                "p-4 rounded-lg flex items-center gap-4 transition-colors duration-200",
                isSubmitted && item.correctIndex === index 
                  ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]" 
                  : isSubmitted && item.correctIndex !== index
                  ? "bg-destructive/20 text-destructive border border-destructive"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <div className="flex-1">
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                {item.text}
              </div>
              {!isSubmitted && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 hover:bg-muted/60"
                  >
                    <MoveUp className="h-4 w-4" />
                    <span className="sr-only">Move Up</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === dragItems.length - 1}
                    className="h-8 w-8 hover:bg-muted/60"
                  >
                    <MoveDown className="h-4 w-4" />
                    <span className="sr-only">Move Down</span>
                  </Button>
                </div>
              )}
              {isSubmitted && (
                <div className="animate-in fade-in duration-300">
                  {item.correctIndex === index ? (
                    <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-2">
          {isSubmitted && (
            <>
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-2 animate-in fade-in duration-300",
                  isCorrect ? "bg-[#E8F5E9]" : "bg-destructive/10"
                )}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
                    <p className="font-medium text-[#2E7D32]">You Rock! 🎉 Perfect order!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <p className="font-medium text-destructive">Not quite right. Try again!</p>
                  </>
                )}
              </div>
              {isCorrect ? (
                <Button
                  className="w-full bg-[#4CAF50] text-white hover:bg-[#43A047]"
                  disabled
                >
                  Complete! 🎉
                </Button>
              ) : (
                <Button
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleReset}
                >
                  Try Again
                </Button>
              )}
            </>
          )}
          {!isSubmitted && (
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCheck}
            >
              Check Order
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
