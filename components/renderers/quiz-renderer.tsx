"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useFeedback } from '@/lib/feedback-context';
import { cn } from '@/lib/utils';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
}

interface QuizRendererProps {
  title?: string;
  questions: QuizQuestion[];
  points?: number;
  isEditing?: boolean;
  scoreContext?: {
    score: number;
    totalPossible: number;
    addPoints: (points: number) => void;
  };
  onScoreUpdate?: (score: number) => void;
}

export function QuizRenderer({
  title = 'Quiz',
  questions = [],
  points = 15,
  isEditing = false,
  scoreContext,
  onScoreUpdate,
  savedState,
  setComponentState,
}: QuizRendererProps & { savedState?: any; setComponentState?: (state: any) => void }) {
  // Use savedState for initial state if available
  const [mounted, setMounted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(savedState?.currentQuestion ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(savedState?.selectedAnswer ?? null);
  const [isAnswered, setIsAnswered] = useState(savedState?.isAnswered ?? false);
  const [score, setScore] = useState(savedState?.score ?? 0);
  const [animationClass, setAnimationClass] = useState(savedState?.animationClass ?? '');
  const [isComplete, setIsComplete] = useState(savedState?.isComplete ?? false);
  const { playFeedback } = useFeedback();
  const isFirstRender = useRef(true);

  // Persist state on every change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const newState = {
      currentQuestion,
      selectedAnswer,
      isAnswered,
      score,
      animationClass,
      isComplete,
    };
    // Shallow compare with savedState
    const isEqual = savedState && Object.keys(newState).every(key => newState[key] === savedState[key]);
    if (!isEqual) {
      setComponentState?.(newState);
    }
  }, [currentQuestion, selectedAnswer, isAnswered, score, animationClass, isComplete, setComponentState, savedState]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnswerSelect = async (optionId: string) => {
    if (isAnswered) return;
    setSelectedAnswer(optionId);
    await playFeedback('click', { animation: false, sound: true });
  };

  const handleCheckAnswer = async () => {
    if (selectedAnswer === null || isAnswered) return;

    const selectedOption = questions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect ?? false;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1);
      if (scoreContext?.addPoints) {
        scoreContext.addPoints(Math.floor(points / questions.length));
      }
      await playFeedback('correct');
    } else {
      await playFeedback('incorrect');
    }

    if (onScoreUpdate) {
      onScoreUpdate(isCorrect ? score + 1 : score);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      await playFeedback('click', { animation: false });
    } else {
      setIsComplete(true);
      await playFeedback('complete');
      // Score is not reset to allow the final score to be displayed
    }
  };

  if (!mounted) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''} • {points} points
        </p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className={cn("duo-card space-y-6", animationClass)}>
      {/* Progress bar */}
      <div className="duo-progress-bar">
        <div
          className="duo-progress-bar-fill"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
        </div>

      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{question.question}</h3>
        
        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectAnswer = option.isCorrect;
            const showCorrect = isAnswered && isCorrectAnswer;
            const showIncorrect = isAnswered && isSelected && !isCorrectAnswer;
            
            return (
              <button
                key={option.id}
                className={cn(
                  'w-full p-4 text-left duo-button relative',
                  isSelected && !isAnswered && 'bg-secondary/20',
                  showCorrect && 'bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]',
                  showIncorrect && 'bg-destructive/20 border-destructive',
                  isAnswered && 'cursor-not-allowed',
                  !isAnswered && 'hover:bg-secondary/10'
                )}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={isAnswered}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className={cn(
            'p-4 rounded-xl',
            selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect 
              ? 'bg-[#E8F5E9]' 
              : 'bg-destructive/10'
          )}>
            {currentQuestion === questions.length - 1 && selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                  You Rock! 🎉
                </p>
                <p className="text-sm text-muted-foreground">Final Score: {score}/{questions.length}</p>
              </div>
            ) : (
              <>
                <p className="font-medium flex items-center gap-2">
                  {selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                      <span className="text-[#2E7D32]">Great job!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive">Not quite right</span>
                    </>
                  )}
                </p>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Action button */}
        <Button
          className={cn(
            'w-full duo-button',
            !isAnswered && selectedAnswer !== null && 'bg-primary text-white hover:bg-primary/90',
            isAnswered && currentQuestion === questions.length - 1 && 'bg-success text-white hover:bg-success/90',
            isAnswered && currentQuestion < questions.length - 1 && 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
          )}
          onClick={isAnswered ? handleNextQuestion : handleCheckAnswer}
          disabled={selectedAnswer === null && !isAnswered}
        >
          {isAnswered
            ? currentQuestion < questions.length - 1
              ? 'Continue'
              : 'Complete!'
            : 'Check'}
        </Button>

        {/* Score display */}
        {(isAnswered || currentQuestion > 0) && (
          <div className="flex justify-center">
            <span className="duo-badge">
              Score: {score}/{questions.length}
            </span>
          </div>
        )}
      </div>
        </div>
  );
}
