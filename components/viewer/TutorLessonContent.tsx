"use client"

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Award, X, CheckCircle2, AlertCircle, Clock, Loader2, RotateCcw, CheckSquare, Square, Lock } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import type { Lesson } from '@/types/lesson';
import { isInteractiveComponent, formatSlideTitle } from '@/lib/lesson-utils';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { interactionStorageKey } from '@/lib/lesson-ref';

/**
 * Component types that support submittable answers (tutor-markable).
 * Any component whose state contains `userAnswer` or `response` and `isPendingMarking`
 * will render a TutorMarkingBar when viewed in tutor mode.
 */
const SUBMITTABLE_TYPES = [
    'shortAnswer',
    'fillInTheBlank',
    'quiz',
    'trueFalse',
    'multiSelectQuiz',
    'flashcardQuiz',
    'codeEditor',
    'wordCloud',
    'scaleSlider',
    'categorise',
    'annotateImage',
    'dragDrop',
    'matchingPairs',
    'wordScramble',
    'memoryGrid',
];

interface TutorLessonContentProps {
    lesson: Lesson;
    currentSlideIndex: number;
    onSlideChange: (index: number) => void;
    initialComponentStates?: Record<string, any>;
    studentId: string;
}

export function TutorLessonContent({
    lesson,
    currentSlideIndex,
    onSlideChange,
    initialComponentStates = {},
    studentId
}: TutorLessonContentProps) {
    const [innerStepIndex, setInnerStepIndex] = useState(0);
    const [componentStates, setComponentStates] = useState<Record<string, any>>(initialComponentStates);

    const currentSlide = useMemo(() => lesson.slides[currentSlideIndex], [lesson.slides, currentSlideIndex]);

    const processedComponents = useMemo(() => {
        if (!currentSlide) return [];
        return currentSlide.components;
    }, [currentSlide]);

    const activeComponent = processedComponents[innerStepIndex];

    // Reset inner step when the tutor changes slide
    useEffect(() => {
        setInnerStepIndex(0);
    }, [currentSlideIndex]);

    const canGoNext = innerStepIndex < (processedComponents.length - 1) || currentSlideIndex < (lesson.slides.length - 1);
    const canGoPrev = innerStepIndex > 0 || currentSlideIndex > 0;

    const handleAdvance = () => {
        if (innerStepIndex < processedComponents.length - 1) {
            setInnerStepIndex(prev => prev + 1);
        } else if (currentSlideIndex < lesson.slides.length - 1) {
            setInnerStepIndex(0);
            onSlideChange(currentSlideIndex + 1);
        }
    };

    const handleRecall = () => {
        if (innerStepIndex > 0) {
            setInnerStepIndex(prev => prev - 1);
        } else if (currentSlideIndex > 0) {
            onSlideChange(currentSlideIndex - 1);
            // Will need to set to last step of previous slide — default 0 is fine for tutor view
        }
    };

    // Determine if the active component is a submittable type with student state
    const activeState = activeComponent ? componentStates[activeComponent.id] : null;
    const isSubmittable = activeComponent && SUBMITTABLE_TYPES.includes(activeComponent.type);
    const alreadyHandled = activeState?.tutorMarked === true || (activeState?.wasReset === true && !activeState?.isSubmitted);
    const hasStudentResponse = activeState && !alreadyHandled && (
        activeState.isSubmitted ||
        activeState.userAnswer ||
        activeState.userAnswers ||
        activeState.userResponse ||
        activeState.response ||
        activeState.answers ||
        activeState.placements ||
        activeState.selectedOption ||
        activeState.selectedAnswer ||
        (activeState.status === 'completed' && Object.keys(activeState).length > 1)
    );

    return (
        <div className="flex flex-col h-full relative bg-white dark:bg-slate-950 overflow-hidden font-sans">
            {/* Header — simplified, no audio controls */}
            <header className="shrink-0 w-full bg-slate-900 border-b border-slate-800 px-5 py-3 z-30 flex items-center justify-between gap-6 shadow-sm">
                <div className="flex-1 flex items-center gap-3">
                    {currentSlide?.title && (
                        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                                {formatSlideTitle(currentSlide.title, 22)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 shrink-0 items-center">
                    <div className="flex flex-col items-end justify-center">
                        <span className="text-[10px] font-medium text-slate-400">Student Score</span>
                        <span className="text-sm font-bold text-white tabular-nums">{activeState?.score || 0}</span>
                    </div>
                    <div className="flex flex-col items-end justify-center border-l border-slate-800 pl-4 h-6">
                        <span className="text-[10px] font-medium text-slate-400">Component</span>
                        <span className="text-sm font-bold text-white tabular-nums">
                            {innerStepIndex + 1} <span className="text-slate-600">/</span> {processedComponents.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Area — read-only, components are rendered with their saved state */}
            <main className="flex-1 relative overflow-y-auto bg-slate-50 dark:bg-slate-950 z-10 flex flex-col">
                <div className="w-full min-h-full flex-1 flex flex-col">
                    {activeComponent && (
                        <div
                            key={`${currentSlideIndex}-${innerStepIndex}`}
                            className="w-full flex-1 flex flex-col animate-in fade-in duration-300"
                        >
                            <ComponentRenderer
                                component={activeComponent}
                                savedState={componentStates[activeComponent.id]}
                                setComponentState={() => { }} // No-op — tutor cannot modify student state
                                isEditing={false}
                                isTutorView={true}
                                lessonId={lesson.id}
                            />
                        </div>
                    )}
                </div>

                {/* Inline Tutor Marking Bar — shown for submittable components with student responses */}
                {isSubmittable && hasStudentResponse && (
                    <TutorMarkingBar
                        key={activeComponent.id}
                        componentId={activeComponent.id}
                        componentType={activeComponent.type}
                        componentProps={activeComponent.props}
                        componentState={activeState}
                        maxPoints={activeComponent.props?.points || 10}
                        studentId={studentId}
                        lessonId={lesson.id}
                        componentMode={activeComponent.props?.mode || activeComponent.mode || 'practice'}
                        onMarkSuccess={(score, isApproved, correctAnswers) => {
                            setComponentStates(prev => ({
                                ...prev,
                                [activeComponent.id]: {
                                    ...(prev[activeComponent.id] || {}),
                                    tutorMarked: true,
                                    score,
                                    isApproved,
                                    correctAnswers: correctAnswers || prev[activeComponent.id]?.correctAnswers || {},
                                    isPendingMarking: false,
                                    status: 'completed'
                                }
                            }));
                        }}
                        onResetSuccess={() => {
                            setComponentStates(prev => ({
                                ...prev,
                                [activeComponent.id]: {
                                    wasReset: true,
                                    status: 'uncompleted',
                                    isSubmitted: false,
                                    isPendingMarking: false,
                                    userResponse: '',
                                    userAnswers: {},
                                    score: 0,
                                    tutorMarked: false
                                }
                            }));
                        }}
                    />
                )}
            </main>

            {/* Footer Navigation — no locks, always navigable */}
            <footer className="shrink-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 py-3.5 px-6 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        className="h-10 px-5 w-full rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center"
                        onClick={handleRecall}
                        disabled={!canGoPrev}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1.5" />
                        Previous
                    </Button>
                    <Button
                        className="h-10 px-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20"
                        onClick={handleAdvance}
                        disabled={!canGoNext}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}

// ─── Surgical Sub-Item Extraction ───────────────────────────────────────────

interface SurgicalItem {
    id: string;
    label: string;
    studentAns: string;
    expectedAns: string;
    unitPoints: number;
    isCorrectInitially: boolean;
}

function extractSurgicalItems(componentType: string, componentProps: any, componentState: any, maxPoints: number): SurgicalItem[] {
    if (!componentState) return [];

    // 1. Fill in the blanks
    if (componentType === 'fillInTheBlank' && componentProps?.blanks) {
        const blanks = componentProps.blanks || [];
        const userAnswers = componentState.userAnswers || {};
        const correctAnswers = componentState.correctAnswers || {};
        const unitPts = componentProps.points || Math.max(1, Math.floor(maxPoints / (blanks.length || 1)));

        return blanks.map((b: any, idx: number) => {
            const studentVal = userAnswers[b.id] ? String(userAnswers[b.id]) : '(No answer)';
            const expectedVal = b.answer || 'N/A';
            const isCorrect = correctAnswers[b.id] === true || studentVal.trim().toLowerCase() === expectedVal.trim().toLowerCase();
            return {
                id: b.id || `blank-${idx}`,
                label: `Blank ${idx + 1}`,
                studentAns: studentVal,
                expectedAns: expectedVal,
                unitPoints: unitPts,
                isCorrectInitially: isCorrect
            };
        });
    }

    // 2. Categorise
    if (componentType === 'categorise' && componentProps?.items) {
        const items = componentProps.items || [];
        const categories = componentProps.categories || [];
        const placements = componentState.placements || {};
        const unitPts = Math.max(1, Math.floor(maxPoints / (items.length || 1)));

        return items.map((it: any, idx: number) => {
            const placedCatId = placements[it.id];
            const placedCat = categories.find((c: any) => c.id === placedCatId)?.title || '(Unplaced)';
            const expectedCat = categories.find((c: any) => c.id === it.correctCategoryId)?.title || 'N/A';
            const isCorrect = placedCatId === it.correctCategoryId;
            return {
                id: it.id || `item-${idx}`,
                label: it.text || `Item ${idx + 1}`,
                studentAns: placedCat,
                expectedAns: expectedCat,
                unitPoints: unitPts,
                isCorrectInitially: isCorrect
            };
        });
    }

    // 3. Multi-Select Quiz
    if (componentType === 'multiSelectQuiz' && componentProps?.questions) {
        const questions = componentProps.questions || [];
        const selectedAnswers = componentState.userAnswers || {};
        const unitPts = Math.max(1, Math.floor(maxPoints / (questions.length || 1)));

        return questions.map((q: any, idx: number) => {
            const studentVal = selectedAnswers[q.id] ? String(selectedAnswers[q.id]) : '(No answer)';
            const expectedVal = q.correctAnswer || 'N/A';
            const isCorrect = studentVal === expectedVal;
            return {
                id: q.id || `q-${idx}`,
                label: q.question || `Question ${idx + 1}`,
                studentAns: studentVal,
                expectedAns: expectedVal,
                unitPoints: unitPts,
                isCorrectInitially: isCorrect
            };
        });
    }

    // 4. Default / Single-answer open response
    const rawAnswer = componentState.userAnswer
        || componentState.response
        || componentState.userResponse
        || componentState.selectedOption
        || null;

    if (rawAnswer !== null && rawAnswer !== undefined) {
        return [{
            id: 'single-response',
            label: 'Full Response',
            studentAns: String(rawAnswer),
            expectedAns: componentProps?.question ? 'Response to Prompt' : 'Expected Answer',
            unitPoints: maxPoints,
            isCorrectInitially: (componentState.score || 0) > 0 || componentState.isSubmitted
        }];
    }

    return [];
}

// ─── Inline Tutor Marking Bar ────────────────────────────────────────────────

interface TutorMarkingBarProps {
    componentId: string;
    componentType: string;
    componentProps?: any;
    componentState: any;
    maxPoints: number;
    studentId: string;
    lessonId: string;
    componentMode: 'practice' | 'live';
    onResetSuccess?: () => void;
    onMarkSuccess?: (score: number, isApproved: boolean, correctAnswers?: Record<string, boolean>) => void;
}

function TutorMarkingBar({
    componentId,
    componentType,
    componentProps,
    componentState,
    maxPoints,
    studentId,
    lessonId,
    componentMode,
    onResetSuccess,
    onMarkSuccess
}: TutorMarkingBarProps) {
    const isPracticeMode = componentMode !== 'live';
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [isDismissed, setIsDismissed] = useState(
        Boolean(componentState?.tutorMarked || (componentState?.wasReset && !componentState?.isSubmitted))
    );
    const [markedResult, setMarkedResult] = useState<{ isApproved: boolean; points: number } | null>(
        componentState?.tutorMarked ? { isApproved: (componentState.score || 0) > 0, points: componentState.score || 0 } : null
    );

    const surgicalItems = useMemo(() => {
        return extractSurgicalItems(componentType, componentProps, componentState, maxPoints);
    }, [componentType, componentProps, componentState, maxPoints]);

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
        const initialMap: Record<string, boolean> = {};
        surgicalItems.forEach(item => {
            initialMap[item.id] = item.isCorrectInitially;
        });
        return initialMap;
    });

    const toggleItem = (itemId: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const rawCalculatedScore = useMemo(() => {
        if (surgicalItems.length === 0) return maxPoints;
        return surgicalItems.reduce((acc, item) => {
            return acc + (checkedItems[item.id] ? item.unitPoints : 0);
        }, 0);
    }, [surgicalItems, checkedItems, maxPoints]);

    // Practice mode: always 0 points awarded, but state is still updated
    const calculatedScore = isPracticeMode ? 0 : rawCalculatedScore;

    const [activeLockError, setActiveLockError] = useState<string | null>(null);

    const isPendingManualMark = componentState?.isPendingMarking === true;
    const wasAutoScored = componentState?.isSubmitted && !componentState?.isPendingMarking && !componentState?.tutorMarked;

    const isApprovedMark = isPracticeMode
        ? (surgicalItems.length > 0 ? Object.values(checkedItems).some(Boolean) : true)
        : (calculatedScore > 0);

    const handleSaveMarks = async () => {
        setLoading(true);
        setActiveLockError(null);
        try {
            await apiClient.studio.markStudentResponse(studentId, lessonId, componentId, {
                score: calculatedScore,
                isApproved: isApprovedMark,
                mode: componentMode,
                correctAnswers: checkedItems
            });
            if (typeof window !== 'undefined') {
                localStorage.removeItem(interactionStorageKey(studentId, lessonId));
            }
            onMarkSuccess?.(calculatedScore, isApprovedMark, checkedItems);
            setMarkedResult({ isApproved: isApprovedMark, points: calculatedScore });
            setIsDismissed(true);
        } catch (err: any) {
            console.error('[TutorMarkingBar] Error marking response:', err);
            const serverError = err?.response?.data;
            if (serverError?.error === 'STUDENT_SESSION_ACTIVE' || err?.response?.status === 409) {
                setActiveLockError(serverError?.message || 'Student is currently active in this lesson. Marking is locked to prevent session collisions.');
            } else {
                setActiveLockError(serverError?.message || 'Failed to save marks. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setResetting(true);
        setActiveLockError(null);
        try {
            await apiClient.studio.resetStudentResponse(studentId, lessonId, componentId);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(interactionStorageKey(studentId, lessonId));
            }
            setMarkedResult(null);
            setIsDismissed(true);
            if (onResetSuccess) {
                onResetSuccess();
            }
        } catch (err: any) {
            console.error('[TutorMarkingBar] Error resetting component:', err);
            const serverError = err?.response?.data;
            if (serverError?.error === 'STUDENT_SESSION_ACTIVE' || err?.response?.status === 409) {
                setActiveLockError(serverError?.message || 'Student is currently active in this lesson. Resetting is locked to prevent session collisions.');
            } else {
                setActiveLockError(serverError?.message || 'Failed to reset component. Please try again.');
            }
        } finally {
            setResetting(false);
        }
    };

    if (isDismissed) return null;

    return (
        <div className="pointer-events-auto shrink-0 mx-4 mb-4 p-4 bg-slate-900 border-2 border-amber-500/30 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">{componentType}</span>
                    {isPracticeMode && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[8px] font-black uppercase tracking-wider border border-blue-500/30">
                            Practice Mode — No Points
                        </span>
                    )}
                    {isPendingManualMark && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-wider border border-amber-500/30 animate-pulse">
                            Pending Tutor Review
                        </span>
                    )}
                    {wasAutoScored && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase tracking-wider border border-emerald-500/30">
                            Auto-Scored: +{componentState.score || 0} pts
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                        Score: {calculatedScore} / {surgicalItems.length > 0 ? surgicalItems.reduce((a, i) => a + i.unitPoints, 0) : maxPoints} pts
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={resetting}
                        onClick={handleReset}
                        className="h-7 px-2.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors"
                        title="Reset component state and allow student to retry"
                    >
                        {resetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                        Reset
                    </Button>
                </div>
            </div>

            {/* Active Session Lock Error Banner */}
            {activeLockError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-amber-200 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-[11px] leading-snug">{activeLockError}</span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveLockError(null)}
                        className="h-6 px-2 text-[10px] font-black uppercase text-amber-400 hover:bg-amber-500/20 shrink-0"
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Surgical Sub-Item Evaluation List */}
            {surgicalItems.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Surgical Response Breakdown ({surgicalItems.length} items):
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {surgicalItems.map((item) => {
                            const isChecked = checkedItems[item.id] ?? item.isCorrectInitially;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                                        isChecked
                                            ? "bg-emerald-950/30 border-emerald-500/40 text-slate-100"
                                            : "bg-slate-950 border-slate-800 text-slate-400 opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                        <button
                                            type="button"
                                            className="shrink-0 text-emerald-400"
                                        >
                                            {isChecked ? (
                                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-600" />
                                            )}
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-amber-400">{item.label}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-200 truncate">
                                                "{item.studentAns}"
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-wider block",
                                            isChecked ? "text-emerald-400" : "text-slate-500"
                                        )}>
                                            +{(!isPracticeMode && isChecked) ? item.unitPoints : 0} / {item.unitPoints} pts
                                        </span>
                                        <span className="text-[8px] font-semibold text-slate-500 block">
                                            Exp: {item.expectedAns}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action Bar */}
            {markedResult ? (
                <div className="flex items-center gap-2 pt-1">
                    <Button
                        size="sm"
                        disabled={resetting || loading}
                        onClick={handleReset}
                        className="flex-1 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
                    >
                        {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        disabled={loading}
                        onClick={handleSaveMarks}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 mr-1.5" />}
                        {isPracticeMode ? 'Update (0 pts)' : `Update Score (${calculatedScore} pts)`}
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 pt-1">
                    <Button
                        size="sm"
                        disabled={resetting || loading}
                        onClick={handleReset}
                        className="flex-1 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
                    >
                        {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        disabled={loading}
                        onClick={handleSaveMarks}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 mr-1.5" />}
                        {isPracticeMode ? 'Mark Correct (0 pts)' : `Award Score (${calculatedScore} pts)`}
                    </Button>
                </div>
            )}
        </div>
    );
}
