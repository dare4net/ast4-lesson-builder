"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MoveUp, MoveDown, Lock } from "lucide-react"
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
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  savedState?: any // Persisted state from parent
  setComponentState?: (state: any) => void // State persister
  isLastSlideChild?: boolean // Whether this is the last interactive component
  onCheckSlideCompletion?: () => void // Function to check slide completion
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
  mode = 'practice',
  state = 'active',
  disabled = false,
  isLastSlideChild = false,
  onCheckSlideCompletion,
}: DragDropRendererProps) {
  const { playFeedback } = useFeedback();
  const [mounted, setMounted] = useState(false);
  const isDisabled = disabled || state === 'disabled';
  const isLiveMode = mode === 'live';

  // Debug logs
  useEffect(() => {
    console.log('Drag Drop Mode:', mode);
    console.log('Is Live Mode:', isLiveMode);
    console.log('Saved State:', savedState);
  }, [mode, isLiveMode, savedState]);

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
    if (isSubmitted || isDisabled) return;
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
    
    // Count correct positions and calculate points
    const correctCount = dragItems.reduce((count, item, index) => {
      return count + (item.correctIndex === index ? 1 : 0);
    }, 0);
    const pointsPerItem = Math.round(points / dragItems.length);
    const earnedPoints = correctCount * points;
    
    const isAllCorrect = correctCount === dragItems.length;
    setIsCorrect(isAllCorrect);
    
    if (isAllCorrect) {
      await playFeedback('correct');
    } else if (correctCount > 0) {
      await playFeedback('complete');
    } else {
      await playFeedback('incorrect');
    }

    // Award points for correct positions in live mode
    if (isLiveMode && scoreContext && correctCount > 0) {
      scoreContext.addPoints(earnedPoints);
    }

    const newState = {
      dragItems,
      isSubmitted: true,
      isCorrect: isAllCorrect,
      status: 'completed' // Mark as completed after submission
    };

    // Persist state after check
    setComponentState?.(newState);

    // If this is the last interactive child and we're completed, check slide completion
    if (isLastSlideChild && (isLiveMode || isAllCorrect)) {
      onCheckSlideCompletion?.();
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
    <Card className={cn(
      "duo-card",
      isDisabled && "opacity-75",
      isLiveMode && "border-blue-500"
    )}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center gap-4">
            {isLiveMode && (
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <span>Live Mode</span>
              </div>
            )}
            {isDisabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>
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
                    disabled={index === 0 || isDisabled}
                    className={cn(
                      "h-8 w-8",
                      !isDisabled && "hover:bg-muted/60"
                    )}
                  >
                    <MoveUp className="h-4 w-4" />
                    <span className="sr-only">Move Up</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === dragItems.length - 1 || isDisabled}
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
          {!isSubmitted ? (
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCheck}
              disabled={isDisabled}
            >
              Check Order
            </Button>
          ) : (
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

              {/* Action buttons based on mode and correctness */}
              <div className="space-y-2">
                {/* Live Mode: Always show Complete button */}
                {isLiveMode && (
                  <Button
                    className={cn(
                      "w-full",
                      isCorrect 
                        ? "bg-success text-success-foreground" 
                        : "bg-secondary text-secondary-foreground"
                    )}
                    disabled
                  >
                    {isCorrect ? "Complete! 🎉" : "Complete"}
                  </Button>
                )}

                {/* Practice Mode: Show Complete when correct, Try Again when not */}
                {!isLiveMode && (
                  <>
                    {isCorrect ? (
                      <Button
                        className="w-full bg-success text-success-foreground"
                        disabled
                      >
                        Complete! 🎉
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={handleReset}
                        disabled={isDisabled}
                      >
                        Try Again
                      </Button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
