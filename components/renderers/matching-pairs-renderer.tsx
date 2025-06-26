"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { useFeedback } from "@/lib/feedback-context"
import { cn } from "@/lib/utils"

interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingPairsRendererProps {
  title?: string;
  pairs: MatchingPair[];
  shuffled?: boolean;
  points?: number;
  isEditing?: boolean;
  scoreContext?: {
    score: number;
    totalPossible: number;
    addPoints: (points: number) => void;
  };
}

// Generate a random pastel color
const generatePastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
};

export function MatchingPairsRenderer({
  title = "Match the items",
  pairs = [],
  shuffled = true,
  points = 15,
  isEditing = false,
  scoreContext,
  savedState,
  setComponentState,
}: MatchingPairsRendererProps & { savedState?: any; setComponentState?: (state: any) => void }) {
  const { playFeedback } = useFeedback();
  const [mounted, setMounted] = useState(false);

  // State initialization: use savedState if present, else shuffle and persist
  const [leftItems, setLeftItems] = useState<(MatchingPair & { selected: boolean })[]>(() => {
    if (savedState?.leftItems) return savedState.leftItems;
    return pairs.map((pair) => ({ ...pair, selected: false }));
  });
  const [rightItems, setRightItems] = useState<(MatchingPair & { selected: boolean })[]>(() => {
    if (savedState?.rightItems) return savedState.rightItems;
    let arr = pairs.map((pair) => ({ ...pair, selected: false }));
    if (shuffled && !savedState?.rightItems) arr = [...arr].sort(() => Math.random() - 0.5);
    return arr;
  });
  const [selectedLeft, setSelectedLeft] = useState(() => savedState?.selectedLeft ?? null);
  const [selectedRight, setSelectedRight] = useState(() => savedState?.selectedRight ?? null);
  const [matches, setMatches] = useState(() => savedState?.matches ?? {});
  const [isChecking, setIsChecking] = useState(() => savedState?.isChecking ?? false);
  const [isCorrect, setIsCorrect] = useState(() => savedState?.isCorrect ?? false);
  const [matchStats, setMatchStats] = useState(() => savedState?.matchStats ?? {
    correctCount: 0,
    noneCorrect: false,
    someCorrect: false
  });

  // On first mount, persist the initial state if no savedState
  useEffect(() => {
    setMounted(true);
    console.log('[MatchingPairsRenderer] MOUNT', {
      savedState,
      setComponentState,
      typeofSetComponentState: typeof setComponentState,
    });
    if (!savedState) {
      setComponentState?.({
        leftItems,
        rightItems,
        selectedLeft: null,
        selectedRight: null,
        matches: {},
        isChecking: false,
        isCorrect: false,
        matchStats: { correctCount: 0, noneCorrect: false, someCorrect: false },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on every check or relevant change
  useEffect(() => {
    if (!mounted) return;
    console.log('[MatchingPairsRenderer] Persisting state', {
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matches,
      isChecking,
      isCorrect,
      matchStats,
      setComponentState,
      typeofSetComponentState: typeof setComponentState,
    });
    setComponentState?.({
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matches,
      isChecking,
      isCorrect,
      matchStats,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftItems, rightItems, selectedLeft, selectedRight, matches, isChecking, isCorrect, matchStats]);

  // Initialize the game
  useEffect(() => {
    if (isEditing || savedState) return;

    const leftArray = pairs.map((pair) => ({ ...pair, selected: false }));
    let rightArray = pairs.map((pair) => ({ ...pair, selected: false }));

    if (shuffled) {
      rightArray = [...rightArray].sort(() => Math.random() - 0.5);
    }

    setLeftItems(leftArray);
    setRightItems(rightArray);
    setMatches({});
    setIsChecking(false);
    setIsCorrect(false);
  }, [pairs, shuffled, isEditing, savedState])
  const handleLeftClick = async (id: string) => {
    // Play click sound immediately if item is clickable
    if (!(isChecking || Object.keys(matches).includes(id))) {
      await playFeedback('click', { sound: true, animation: false });
    }

    if (isChecking || Object.keys(matches).includes(id)) return;

    setSelectedLeft(id);
    if (selectedRight) {
      const color = generatePastelColor();
      setMatches(prev => ({ ...prev, [id]: { rightId: selectedRight, color } }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightClick = async (id: string) => {
    // Play click sound immediately if item is clickable
    if (!(isChecking || Object.values(matches).some(m => m.rightId === id))) {
      await playFeedback('click', { sound: true, animation: false });
    }

    if (isChecking || Object.values(matches).some(m => m.rightId === id)) return;

    setSelectedRight(id);
    if (selectedLeft) {
      const color = generatePastelColor();
      setMatches(prev => ({ ...prev, [selectedLeft]: { rightId: id, color } }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };  // Function to check if a match is correct
  const validateMatch = (leftId: string, rightId: string) => {
    const leftItem = leftItems.find(item => item.id === leftId);
    const rightItem = rightItems.find(item => item.id === rightId);
    // A match is correct if both items have the same original ID
    return leftItem && rightItem && leftItem.id === rightItem.id;
  };

  // Function to check all matches
  const checkAllMatches = () => {
    const results = Object.entries(matches).map(([leftId, { rightId }]) => 
      validateMatch(leftId, rightId)
    );
    
    const correctCount = results.filter(Boolean).length;
    const allCorrect = correctCount === pairs.length && Object.keys(matches).length === pairs.length;
    const noneCorrect = correctCount === 0;
    const someCorrect = correctCount > 0 && !allCorrect;

    return { correctCount, allCorrect, noneCorrect, someCorrect };
  };

  const handleCheck = async () => {
    setIsChecking(true);
    const { correctCount, allCorrect, noneCorrect, someCorrect } = checkAllMatches();
    setIsCorrect(allCorrect);
    setMatchStats({ correctCount, noneCorrect, someCorrect });
    if (allCorrect) {
      await playFeedback('correct');
      if (scoreContext) {
        scoreContext.addPoints(points);
      }
    } else {
      await playFeedback('incorrect');
    }
    // Persist state after check
    setComponentState?.({
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matches,
      isChecking: true,
      isCorrect: allCorrect,
      matchStats: { correctCount, noneCorrect, someCorrect },
    });
  };

  const resetGame = async () => {
    const leftArray = pairs.map((pair) => ({ ...pair, selected: false }))
    let rightArray = pairs.map((pair) => ({ ...pair, selected: false }))

    if (shuffled) {
      rightArray = [...rightArray].sort(() => Math.random() - 0.5)
    }

    setLeftItems(leftArray)
    setRightItems(rightArray)
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatches({})
    setIsChecking(false)
    setIsCorrect(false)
    setMatchStats({ correctCount: 0, noneCorrect: false, someCorrect: false })
    await playFeedback('click', { animation: false })
    // Persist state after reset
    setComponentState?.({
      leftItems: leftArray,
      rightItems: rightArray,
      selectedLeft: null,
      selectedRight: null,
      matches: {},
      isChecking: false,
      isCorrect: false,
      matchStats: { correctCount: 0, noneCorrect: false, someCorrect: false },
    });
  }

  if (!mounted) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`left-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.left}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`right-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.right}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const allPairsMatched = Object.keys(matches).length === pairs.length

  return (
    <div className="duo-card space-y-6">
      {/* Progress indicator */}
      <div className="duo-progress-bar">
        <div
          className="duo-progress-bar-fill"
          style={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold">{title}</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Left items */}
          <div className="space-y-2">
            {leftItems.map((item) => {
              const match = matches[item.id]
              const isMatched = !!match
              const isSelected = selectedLeft === item.id

              return (                <button
                  key={`left-${item.id}`}
                  className={cn(
                    'w-full p-4 text-left duo-button transition-all relative',
                    isMatched && !isChecking && { backgroundColor: match.color },
                    isSelected && 'bg-primary text-primary-foreground',
                    isChecking && isMatched && (
                      item.id === match.rightId 
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]'
                        : 'bg-destructive/20 text-destructive border-destructive'
                    ),
                    (isMatched || isChecking) && 'cursor-not-allowed'
                  )}
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isMatched || isChecking}
                  style={isMatched && !isChecking ? { backgroundColor: match.color } : undefined}
                >
                  {item.left}
                  {isChecking && isMatched && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity opacity-100">
                      {item.id === match.rightId ? (
                        <CheckCircle2 className="w-5 h-5 text-[#4CAF50] animate-in fade-in duration-300" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive animate-in fade-in duration-300" />
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right items */}
          <div className="space-y-2">
            {rightItems.map((item) => {
              const matchEntry = Object.entries(matches).find(([_, m]) => m.rightId === item.id)
              const isMatched = !!matchEntry
              const isSelected = selectedRight === item.id
              const match = matchEntry ? matches[matchEntry[0]] : null

              return (
                <button
                  key={`right-${item.id}`}                  className={cn(
                    'w-full p-4 text-left duo-button transition-all relative',
                    isMatched && !isChecking && { backgroundColor: match?.color },
                    isSelected && 'bg-primary text-primary-foreground',
                    isChecking && isMatched && (
                      matchEntry?.[0] === item.id
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]'
                        : 'bg-destructive/20 text-destructive border-destructive'
                    ),
                    (isMatched || isChecking) && 'cursor-not-allowed'
                  )}
                  onClick={() => handleRightClick(item.id)}
                  disabled={isMatched || isChecking}
                  style={isMatched && !isChecking ? { backgroundColor: match?.color } : undefined}
                >
                  {item.right}
                  {isChecking && isMatched && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity opacity-100">
                      {matchEntry?.[0] === item.id ? (
                        <CheckCircle2 className="w-5 h-5 text-[#4CAF50] animate-in fade-in duration-300" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive animate-in fade-in duration-300" />
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          {!isChecking && allPairsMatched && (
            <Button
              className="w-full duo-button bg-primary text-primary-foreground"
              onClick={handleCheck}
            >
              Check
            </Button>
          )}

          {isChecking && (
            <>
              <div className={cn(
                'p-4 rounded-xl flex items-center gap-2',
                isCorrect ? 'bg-[#E8F5E9]' : 'bg-destructive/10',
                'transition-all animate-in fade-in duration-300'
              )}>
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                    <p className="font-medium text-[#2E7D32]">You Rock! 🎉 All matches are correct!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    <p className="font-medium text-destructive">
                      {matchStats.noneCorrect 
                        ? "Oops! None of the matches are correct. Try again!" 
                        : matchStats.someCorrect 
                          ? `You're getting there! Some matches are correct!`
                          : "Not quite right. Try different matches!"}
                    </p>
                  </>
                )}
              </div>
              {isCorrect ? (
                <Button
                  className="w-full duo-button bg-success text-success-foreground"
                  disabled
                >
                  You Rock! 🎉
                </Button>
              ) : (
                <Button
                  className="w-full duo-button bg-secondary text-secondary-foreground"
                  onClick={resetGame}
                >
                  Try Again
                </Button>
              )}
            </>
          )}
        </div>

        {/* Score badge */}
        <div className="flex justify-center">
          <span className="duo-badge">
            Matched: {Object.keys(matches).length}/{pairs.length}
          </span>
        </div>
      </div>
    </div>
  )
}
