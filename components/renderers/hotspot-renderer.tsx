"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import {
    isInputDisabled,
    shouldShowRetry,
    isItemApproved,
    type MarkingMode,
} from "@/lib/tutor-marking-contract"
import {
    normalizeHotspotBehavior,
    normalizeHotspotNodes,
    resolveHotspotComponentProps,
    calculateHotspotScore,
    findHotspotAtClick,
    getCorrectHotspots,
    countCorrectFound,
    type HotspotNode,
    type HotspotState,
    type HotspotBehavior,
} from "@/lib/hotspot-utils"
import type { Component } from "@/types/lesson"

interface HotspotRendererProps {
    title?: string
    image: string
    hotspots: HotspotNode[]
    isEditing?: boolean
    points?: number
    showNumbers?: boolean
    mode?: "practice" | "live"
    state?: "active" | "disabled"
    disabled?: boolean
    savedState?: HotspotState
    setComponentState?: (state: HotspotState) => void
    id?: string
    status?: string
    behavior?: HotspotBehavior | "discovery" | "quiz"
    maxClicks?: number
    markingMode?: MarkingMode
    timeLimit?: number
}

function HotspotDetailPanel({
    hotspot,
    isDecoy,
}: {
    hotspot: HotspotNode
    isDecoy: boolean
}) {
    return (
        <div
            className={cn(
                "absolute z-50 w-max max-w-[min(16rem,70vw)] rounded-xl border-2 bg-white p-4 shadow-xl pointer-events-auto",
                isDecoy ? "border-rose-500" : "border-emerald-500",
            )}
            style={{
                left: `${hotspot.x * 100}%`,
                top: `${hotspot.y * 100}%`,
                transform: "translate(-50%, calc(-100% - 10px))",
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="space-y-1.5">
                <p
                    className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        isDecoy ? "text-rose-600" : "text-emerald-600",
                    )}
                >
                    {hotspot.label}
                </p>
                <p className="text-sm font-black text-slate-900 leading-tight">{hotspot.content}</p>
            </div>
        </div>
    )
}

function HotspotPin({
    hotspot,
    index,
    showNumbers,
    isDiscovered,
    isRevealed,
    isCorrectTarget,
    wasClicked,
    clickResult,
    activeHotspotId,
    onClickPin,
    behavior,
}: {
    hotspot: HotspotNode
    index: number
    showNumbers: boolean
    isDiscovered: boolean
    isRevealed: boolean
    isCorrectTarget: boolean
    wasClicked: boolean
    clickResult?: "correct-hit" | "decoy-hit" | "missed"
    activeHotspotId: string | null
    onClickPin: (id: string) => void
    behavior: HotspotBehavior
}) {
    const isExplore = behavior === "explore"
    const foundDuringPlay = behavior === "discover" && !isRevealed && wasClicked
    const foundCorrectDuringPlay = foundDuringPlay && isCorrectTarget
    const foundDecoyDuringPlay = foundDuringPlay && !isCorrectTarget
    const visible = isExplore || isRevealed || foundDuringPlay

    if (!visible) return null

    const pinStyle = isRevealed
        ? isCorrectTarget
            ? wasClicked
                ? "correct-hit"
                : "correct-missed"
            : wasClicked
              ? "decoy-hit"
              : "decoy-unclicked"
        : isExplore
          ? isDiscovered
              ? "explored"
              : "explore-idle"
          : foundCorrectDuringPlay
            ? "correct-found-play"
            : foundDecoyDuringPlay
              ? "decoy-found-play"
              : "discover-clicked"

    const isOpen = activeHotspotId === hotspot.id

    return (
        <>
            <button
                type="button"
                className={cn(
                    "absolute rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 shadow-lg",
                    showNumbers ? "w-8 h-8 font-black text-[10px]" : "w-6 h-6",
                    pinStyle === "explored" && "bg-emerald-500 border-white text-white scale-110",
                    pinStyle === "explore-idle" && "bg-white border-emerald-500 text-emerald-600 hover:scale-110",
                    pinStyle === "correct-hit" && "bg-emerald-500 border-white text-white scale-110",
                    pinStyle === "correct-missed" && "bg-amber-100 border-amber-400 text-amber-700",
                    pinStyle === "decoy-hit" && "bg-rose-500 border-white text-white",
                    pinStyle === "decoy-unclicked" && "bg-slate-200 border-slate-300 text-slate-500",
                    pinStyle === "correct-found-play" && "bg-emerald-500 border-white text-white scale-110 animate-in zoom-in-50 duration-300",
                    pinStyle === "decoy-found-play" && "bg-rose-500 border-white text-white scale-110 animate-in zoom-in-50 duration-300",
                    pinStyle === "discover-clicked" && "bg-sky-500 border-white text-white animate-pulse",
                    isOpen && "ring-2 ring-offset-1",
                    isOpen && (foundDecoyDuringPlay || (isRevealed && clickResult === "decoy-hit") ? "ring-rose-400" : "ring-emerald-400"),
                )}
                style={{
                    left: `${hotspot.x * 100}%`,
                    top: `${hotspot.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    onClickPin(hotspot.id)
                }}
            >
                {(isRevealed && clickResult === "correct-hit") || pinStyle === "correct-found-play" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                ) : null}
                {((isRevealed && clickResult === "decoy-hit") || pinStyle === "decoy-found-play") && (
                    <XCircle className="w-3.5 h-3.5" />
                )}
                {showNumbers && !isRevealed && !foundDuringPlay && <span>{index + 1}</span>}
                {!showNumbers && !isRevealed && !foundDuringPlay && (
                    <div
                        className={cn(
                            "rounded-full transition-all duration-300",
                            isDiscovered || wasClicked ? "w-2.5 h-2.5 bg-white" : "w-2 h-2 bg-emerald-500",
                        )}
                    />
                )}
                {isExplore && !isDiscovered && (
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
                )}
            </button>
            {isOpen && (foundDuringPlay || isExplore || isRevealed) && (
                <HotspotDetailPanel
                    hotspot={hotspot}
                    isDecoy={!isCorrectTarget && (foundDecoyDuringPlay || (isRevealed && wasClicked))}
                />
            )}
        </>
    )
}

function HotspotContent({
    title,
    image,
    hotspots,
    points,
    state,
    setState,
    handlePoints,
    handleRetry,
    isLive,
    isDisabled: disabledProp,
    props,
}: ScoredRenderProps<HotspotState> & {
    title: string
    image: string
    hotspots: HotspotNode[]
    points: number
    isDisabled: boolean
    props: HotspotRendererProps
}) {
    const [mounted, setMounted] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
    const allFoundSoundPlayed = useRef(false)
    const imageRef = useRef<HTMLImageElement>(null)
    const { playFeedback } = useFeedback()
    const { registerLock, unregisterLock } = useNavigationLock()

    const behavior = normalizeHotspotBehavior(props.behavior)
    const markingMode = props.markingMode ?? "self-mark"
    const timeLimit = props.timeLimit ?? 45
    const maxClicks = props.maxClicks ?? hotspots.length + 6
    const isExplore = behavior === "explore"
    const isDiscover = behavior === "discover"

    const {
        discoveredHotspots,
        clickedHotspotIds,
        clicksUsed,
        isSubmitted,
        isRevealed,
        isPendingMarking,
        tutorMarked,
        score = 0,
    } = state

    const tutorMarkedFlag = Boolean(tutorMarked || (state as any).markedBy)
    const inputsLocked = isInputDisabled(state, {
        markingMode,
        mode: props.mode,
        disabledProp,
    })
    const clicksRemaining = Math.max(0, maxClicks - clicksUsed)
    const totalCorrectTargets = getCorrectHotspots(hotspots).length
    const correctFoundCount = countCorrectFound(hotspots, clickedHotspotIds)
    const allTargetsFound =
        isDiscover &&
        !isRevealed &&
        !isSubmitted &&
        totalCorrectTargets > 0 &&
        correctFoundCount >= totalCorrectTargets
    const canClick = isDiscover && !isRevealed && !isSubmitted && !inputsLocked && clicksRemaining > 0
    const canSubmit =
        isDiscover && !isRevealed && !isSubmitted && !inputsLocked && (clicksUsed > 0 || allTargetsFound)

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (allTargetsFound && !allFoundSoundPlayed.current) {
            allFoundSoundPlayed.current = true
            void playFeedback("complete", { sound: true, animation: false })
        }
        if (!allTargetsFound) {
            allFoundSoundPlayed.current = false
        }
    }, [allTargetsFound, playFeedback])

    useEffect(() => {
        if (isLive && isDiscover && hasStarted && !isSubmitted && state.status !== "completed") {
            registerLock(props.id || "hotspot-renderer")
        } else {
            unregisterLock(props.id || "hotspot-renderer")
        }
        return () => unregisterLock(props.id || "hotspot-renderer")
    }, [isLive, isDiscover, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

    const onLocalRetry = () => {
        handleRetry()
        setActiveHotspotId(null)
        setHasStarted(false)
        allFoundSoundPlayed.current = false
        setState({
            discoveredHotspots: [],
            clickedHotspotIds: [],
            clicksUsed: 0,
            isSubmitted: false,
            isRevealed: false,
            isPendingMarking: false,
            score: 0,
            status: "active",
        })
    }

    const handleExploreClick = (hotspotId: string) => {
        if (disabledProp || discoveredHotspots.includes(hotspotId)) return
        const newDiscovered = [...discoveredHotspots, hotspotId]
        void playFeedback("click", { sound: true, animation: false })
        setState(prev => ({
            ...prev,
            discoveredHotspots: newDiscovered,
            status: newDiscovered.length === hotspots.length ? "completed" : "active",
        }))
    }

    const playBlockedClick = () => {
        void playFeedback("blockedClick", { sound: true, animation: false })
    }

    const useDiscoverClick = (hotspot: HotspotNode | null, clickX?: number, clickY?: number) => {
        if (isDiscover && !isRevealed && !isSubmitted && !inputsLocked && clicksRemaining <= 0) {
            playBlockedClick()
            return
        }
        if (!canClick) return

        if (!hotspot) {
            void playFeedback("softMiss", { sound: true, animation: false })
            setState(prev => ({ ...prev, clicksUsed: prev.clicksUsed + 1 }))
            return
        }

        if (clickedHotspotIds.includes(hotspot.id)) return

        const isCorrect = hotspot.isCorrect !== false
        void playFeedback(isCorrect ? "click" : "softMiss", { sound: true, animation: false })
        setActiveHotspotId(hotspot.id)
        setState(prev => ({
            ...prev,
            clickedHotspotIds: [...prev.clickedHotspotIds, hotspot.id],
            clicksUsed: prev.clicksUsed + 1,
        }))
    }

    const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isExplore) {
            setActiveHotspotId(null)
            return
        }
        if (props.isEditing || !isDiscover) return
        if (!imageRef.current) return

        const rect = imageRef.current.getBoundingClientRect()
        const clickX = ((e.clientX - rect.left) / rect.width) * 100
        const clickY = ((e.clientY - rect.top) / rect.height) * 100
        const hit = findHotspotAtClick(hotspots, clickX, clickY)

        if (hit && clickedHotspotIds.includes(hit.id)) {
            setActiveHotspotId(prev => (prev === hit.id ? null : hit.id))
            return
        }

        setActiveHotspotId(null)

        if (!isRevealed && !isSubmitted && !inputsLocked && clicksRemaining <= 0) {
            playBlockedClick()
            return
        }
        if (!canClick) return

        useDiscoverClick(hit, clickX, clickY)
    }

    const handlePinClick = (hotspotId: string) => {
        if (isExplore) {
            const opening = activeHotspotId !== hotspotId
            setActiveHotspotId(prev => (prev === hotspotId ? null : hotspotId))
            if (opening && !discoveredHotspots.includes(hotspotId)) {
                handleExploreClick(hotspotId)
            }
            return
        }
        if (isRevealed || clickedHotspotIds.includes(hotspotId)) {
            setActiveHotspotId(prev => (prev === hotspotId ? null : hotspotId))
            return
        }
        if (!isRevealed && !isSubmitted && !inputsLocked && clicksRemaining <= 0) {
            playBlockedClick()
            return
        }
        const spot = hotspots.find(h => h.id === hotspotId)
        if (spot) useDiscoverClick(spot)
    }

    const handleSubmit = async () => {
        if (inputsLocked || isSubmitted || !isDiscover || !canSubmit) return

        const { earned, totalCorrect, correctFound } = calculateHotspotScore(
            hotspots,
            clickedHotspotIds,
            points,
        )
        const isPending = markingMode === "tutor-mark"

        if (isPending) {
            await playFeedback("quizSuccess")
            setState(prev => ({
                ...prev,
                isSubmitted: true,
                isRevealed: true,
                isPendingMarking: true,
                score: 0,
                status: "completed",
            }))
            return
        }

        if (correctFound === totalCorrect && totalCorrect > 0) {
            await playFeedback("quizSuccess")
        } else if (correctFound > 0) {
            await playFeedback("complete")
        } else {
            await playFeedback("incorrect")
        }

        if (isLive) {
            handlePoints(earned)
        }

        setState(prev => ({
            ...prev,
            isSubmitted: true,
            isRevealed: true,
            isPendingMarking: false,
            score: earned,
            status: "completed",
        }))
    }

    const onTimeout = () => {
        if (!isSubmitted && isDiscover) void handleSubmit()
    }

    const totalPossible = points
    const showRetry = shouldShowRetry(state, { markingMode, mode: props.mode }, totalPossible)
    const approved = isItemApproved(state, (score ?? 0) >= totalPossible && totalPossible > 0)
    const showScore = markingMode === "self-mark" || tutorMarkedFlag

    const renderScoreLine = () => {
        if (!showScore || (isPendingMarking && !tutorMarkedFlag) || totalPossible <= 0) return null
        return (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">
                Score: {score} / {totalPossible} pts
            </p>
        )
    }

    if (!mounted) return null

    if (props.isEditing) {
        return (
            <div className="border p-4 rounded-md text-slate-900">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{behavior} mode preview</p>
                <div className="relative">
                    <img src={image || "/placeholder.svg?height=300&width=400"} alt={title} className="w-full h-auto rounded-md" />
                    {hotspots.map((hotspot, index) => (
                        <div
                            key={hotspot.id}
                            className={cn(
                                "absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                behavior === "discover" && hotspot.isCorrect === false
                                    ? "bg-rose-500 text-white"
                                    : "bg-primary text-primary-foreground",
                            )}
                            style={{
                                left: `${hotspot.x * 100}%`,
                                top: `${hotspot.y * 100}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (isLive && isDiscover && !hasStarted && !isSubmitted && state.status !== "completed") {
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                label={`Start Discover Challenge (${timeLimit}s Time Limit)`}
            />
        )
    }

    const getClickResult = (hotspot: HotspotNode): "correct-hit" | "decoy-hit" | "missed" | undefined => {
        if (!isRevealed) return undefined
        const isCorrect = hotspot.isCorrect !== false
        const wasClicked = clickedHotspotIds.includes(hotspot.id)
        if (isCorrect && wasClicked) return "correct-hit"
        if (isCorrect && !wasClicked) return "missed"
        if (!isCorrect && wasClicked) return "decoy-hit"
        return undefined
    }

    return (
        <div
            className={cn(
                "w-full h-full flex-1 flex flex-col bg-white text-slate-900 overflow-hidden transition-all duration-300 px-6",
                disabledProp && "opacity-75",
            )}
        >
            <div className="shrink-0 space-y-1.5 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">
                            Image Exploration
                        </span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">
                            {title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest border",
                                isExplore
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-purple-50 text-purple-600 border-purple-100",
                            )}
                        >
                            {isExplore ? "Explore Mode" : "Discover Mode"}
                        </span>
                        {isLive && isDiscover && (
                            <LiveTimer
                                isCompleted={isSubmitted || state.status === "completed"}
                                duration={timeLimit}
                                onTimeout={onTimeout}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-2">
                <div className="flex items-center justify-center w-full h-full my-auto">
                    <div
                        className={cn(
                            "relative inline-block shrink-0 rounded-2xl border-2 border-emerald-100 bg-white overflow-hidden shadow-sm max-w-full",
                            canClick && "cursor-crosshair",
                            !canClick && isDiscover && !isRevealed && !isSubmitted && "cursor-not-allowed",
                        )}
                        onClick={handleStageClick}
                    >
                        <img
                            ref={imageRef}
                            src={image || "/placeholder.svg?height=300&width=400"}
                            alt={title}
                            className="max-h-[42vh] w-auto h-auto object-contain block select-none"
                            draggable={false}
                        />

                        {hotspots.map((hotspot, idx) => (
                            <HotspotPin
                                key={hotspot.id}
                                hotspot={hotspot}
                                index={idx}
                                showNumbers={props.showNumbers ?? false}
                                isDiscovered={discoveredHotspots.includes(hotspot.id)}
                                isRevealed={isRevealed}
                                isCorrectTarget={hotspot.isCorrect !== false}
                                wasClicked={clickedHotspotIds.includes(hotspot.id)}
                                clickResult={getClickResult(hotspot)}
                                activeHotspotId={activeHotspotId}
                                onClickPin={handlePinClick}
                                behavior={behavior}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="shrink-0 space-y-2.5 pb-4 pt-1">
                <div className="min-h-[44px] flex flex-col justify-end">
                    {isDiscover && !isRevealed && (
                        <div className="space-y-2">
                            {allTargetsFound && (
                                <div className="p-2.5 rounded-xl border-2 bg-emerald-50 border-emerald-400 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-black text-emerald-700">
                                        All targets found — press Submit when ready!
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Clicks left:{" "}
                                    <span className={cn(clicksRemaining === 0 ? "text-rose-500" : "text-purple-600")}>
                                        {clicksRemaining}
                                    </span>
                                </span>
                                {!isSubmitted && (
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "h-9 rounded-xl text-white font-black uppercase text-[10px] tracking-wider shrink-0 transition-all",
                                            allTargetsFound
                                                ? "bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400 ring-offset-1 animate-pulse"
                                                : "bg-purple-600 hover:bg-purple-500",
                                            !canSubmit && "opacity-50 cursor-not-allowed",
                                        )}
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                    >
                                        Submit
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {isDiscover && isRevealed && isSubmitted && (
                        <div
                            className={cn(
                                "p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm",
                                isPendingMarking && !tutorMarkedFlag
                                    ? "bg-amber-50 border-amber-200"
                                    : approved || correctFoundCount >= totalCorrectTargets
                                      ? "bg-emerald-50/50 border-emerald-500/20"
                                      : correctFoundCount > 0
                                        ? "bg-amber-50/50 border-amber-300/30"
                                        : "bg-rose-50/50 border-rose-300/30",
                            )}
                        >
                            {isPendingMarking && !tutorMarkedFlag ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                        Submitted — Pending Tutor Review
                                    </span>
                                    <p className="text-[10px] font-medium text-slate-700 mt-0.5">
                                        Tap any pin to read its explanation. Your tutor will score this attempt.
                                    </p>
                                </div>
                            ) : approved || correctFoundCount >= totalCorrectTargets ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Approved" : "Correct"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 leading-tight italic">
                                        {tutorMarkedFlag
                                            ? "Response reviewed and approved by tutor."
                                            : `Excellent! You found all ${totalCorrectTargets} targets.`}
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            ) : correctFoundCount > 0 ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Scored" : "Partial Credit"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 leading-tight">
                                        You found {correctFoundCount} / {totalCorrectTargets} correct targets.
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Reviewed" : "Incorrect"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 leading-tight">
                                        {tutorMarkedFlag
                                            ? "Response reviewed by tutor — revision required."
                                            : `You found 0 / ${totalCorrectTargets} correct targets.`}
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            )}
                            <p className="text-[10px] text-slate-500 mt-2">
                                Tap any pin to read its explanation.
                            </p>
                        </div>
                    )}

                    {isExplore && discoveredHotspots.length === hotspots.length && hotspots.length > 0 && (
                        <div className="p-3 rounded-xl border-2 bg-emerald-50/50 border-emerald-500/20">
                            <p className="text-xs font-black text-slate-900 italic">
                                You&apos;ve explored all nodes!
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {showRetry && (
                        <Button
                            className="h-10 rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest"
                            onClick={onLocalRetry}
                        >
                            Try Again
                        </Button>
                    )}
                    {disabledProp && (
                        <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                            <Lock className="h-2.5 w-2.5" />
                            <span>Locked</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function HotspotRenderer(props: HotspotRendererProps) {
    const {
        title = "Interactive Image",
        image,
        hotspots: rawHotspots = [],
        isEditing = false,
        points = 10,
        mode = "practice",
        state: componentState = "active",
        disabled = false,
        savedState,
        setComponentState,
        id = "hotspot-renderer",
        status,
        behavior,
        maxClicks,
        markingMode = "self-mark",
        timeLimit,
        showNumbers = false,
        ...rest
    } = props

    const normalizedHotspots = normalizeHotspotNodes(rawHotspots as unknown[])
    const resolvedProps = resolveHotspotComponentProps({ props: { ...props, hotspots: rawHotspots } })
    const effectiveBehavior = normalizeHotspotBehavior(resolvedProps.behavior)

    const component: Component = {
        id,
        type: "hotspot",
        state: componentState as any,
        status: (status || (savedState as any)?.status || "uncompleted") as any,
        props: {
            ...rest,
            title,
            image,
            hotspots: normalizedHotspots,
            points,
            behavior: effectiveBehavior,
            maxClicks,
            markingMode,
            timeLimit,
            showNumbers,
            mode,
        },
        mode: mode as any,
    } as Component

    const initialState: HotspotState = {
        discoveredHotspots: [],
        clickedHotspotIds: [],
        clicksUsed: 0,
        isSubmitted: false,
        isRevealed: false,
        status: "active",
        score: 0,
    }

    return (
        <ScoredRenderer<HotspotState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <HotspotContent
                    {...renderProps}
                    title={title}
                    image={image}
                    hotspots={normalizedHotspots}
                    points={points}
                    isDisabled={disabled || component.state === "disabled"}
                    props={{ ...props, behavior: effectiveBehavior, markingMode, maxClicks, timeLimit, showNumbers }}
                />
            )}
        />
    )
}
