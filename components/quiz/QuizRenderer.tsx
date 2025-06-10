import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/lib/feedback-context';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  quiz: {
    questions: QuizQuestion[];
  };
  onComplete?: () => void;
  viewOnly?: boolean;
}

export function QuizRenderer({ quiz, onComplete, viewOnly = false }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { playFeedback } = useFeedback();

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = async (answerIndex: number) => {
    if (viewOnly || isChecking) return;
    await playFeedback('click', { sound: true, animation: false });
    setSelectedAnswer(answerIndex);
  };
  const handleCheck = async () => {
    if (selectedAnswer === null) return;
    setIsChecking(true);
    
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      await playFeedback('complete');
      if (scoreContext && currentQuestionIndex === quiz.questions.length - 1) {
        scoreContext.addPoints(points);
      }
    } else {
      await playFeedback('incorrect');
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setIsChecking(false);
      await playFeedback('click', { sound: true, animation: false });
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-bold">{currentQuestion.question}</div>
      <div className="grid gap-3">
        {currentQuestion.options.map((option: string, index: number) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === currentQuestion.correctAnswer;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={viewOnly || isChecking}
              className={cn(
                "w-full p-4 rounded-lg flex items-center gap-4 transition-all duration-200",
                "text-left relative",
                {
                  "bg-muted hover:bg-muted/80": !isChecking,
                  "bg-success/10 text-success-foreground [&_*]:text-success-foreground": isChecking && isCorrectAnswer,
                  "bg-destructive/10 text-destructive-foreground": isChecking && isSelected && !isCorrectAnswer,
                  "bg-muted/50": isChecking && !isCorrectAnswer && !isSelected,
                  "ring-2 ring-primary": isSelected && !isChecking,
                }
              )}
            >
              <div className="flex-1">{option}</div>
              {isChecking && (
                <div className="flex-shrink-0">
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : isSelected && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="space-y-4">
        {isChecking && (
          <div className={cn(
            'p-4 rounded-xl flex items-center gap-2',
            isCorrect ? 'bg-success/10' : 'bg-destructive/10',
            'transition-all animate-in fade-in duration-300'
          )}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="font-medium">
                  {currentQuestionIndex === quiz.questions.length - 1 
                    ? '¡Perfecto! You completed the quiz!' 
                    : '¡Correcto! Well done!'}
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-medium">Not quite right. Try again!</p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          {!isChecking && selectedAnswer !== null && (
            <Button 
              onClick={handleCheck}
              className="w-full bg-primary text-primary-foreground"
            >
              Check Answer
            </Button>
          )}
          
          {isChecking && (
            isCorrect ? (
              currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                >
                  Next Question
                </Button>
              ) : (
                <Button 
                  className="w-full bg-success text-success-foreground"
                  disabled
                >
                  You Rock! 🎉
                </Button>
              )
            ) : (
              <Button 
                onClick={handleNext}
                className="w-full bg-secondary text-secondary-foreground"
              >
                Try Again
              </Button>
            )
          )}
        </div>
      </div>

      {isCorrect === false && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          <span>
            Try again! The correct answer is:{' '}
            {currentQuestion.options[currentQuestion.correctAnswer]}
          </span>
        </div>
      )}
    </div>
  );
}