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
    containerRef,
}: {
    hotspot: HotspotNode
    isDecoy: boolean
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    const panelRef = useRef<HTMLDivElement>(null)
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ position: "absolute", opacity: 0 })
    const [arrowDir, setArrowDir] = useState<"above" | "below">("above")
    const [arrowOffset, setArrowOffset] = useState(0)

    useEffect(() => {
        const panel = panelRef.current
        const container = containerRef.current
        if (!panel || !container) return

        const cW = container.offsetWidth
        const cH = container.offsetHeight
        const pW = panel.offsetWidth
        const pH = panel.offsetHeight
        const pinX = hotspot.x * cW
        const pinY = hotspot.y * cH
        const GAP = 12
        const EDGE = 8

        // Prefer above; fall back to below if not enough room at top
        let top = pinY - pH - GAP
        let dir: "above" | "below" = "above"
        if (top < EDGE) {
            top = pinY + GAP
            dir = "below"
        }
        top = Math.max(EDGE, Math.min(top, cH - pH - EDGE))

        // Center panel over pin, clamp within container width
        let left = pinX - pW / 2
        left = Math.max(EDGE, Math.min(left, cW - pW - EDGE))

        // Arrow: where pinX falls relative to panel left edge
        const arrow = Math.max(10, Math.min(pinX - left, pW - 10))

        setPanelStyle({ position: "absolute", top, left, opacity: 1 })
        setArrowDir(dir)
        setArrowOffset(arrow)
    }, [hotspot.x, hotspot.y, containerRef])

    const colorBorder = isDecoy ? "border-rose-500" : "border-emerald-500"
    const colorText = isDecoy ? "text-rose-600" : "text-emerald-600"
    const arrowBorder = isDecoy ? "border-rose-500" : "border-emerald-500"

    return (
        <div
            ref={panelRef}
            className={cn(
                "absolute z-[100] w-max max-w-[min(18rem,75vw)] rounded-2xl border-2 border-b-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 shadow-2xl pointer-events-auto",
                colorBorder,
            )}
            style={panelStyle}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="space-y-1.5">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", colorText)}>
                    {hotspot.label}
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">{hotspot.content}</p>
            </div>

            {/* Chat-bubble arrow — points at the pin */}
            {arrowDir === "above" ? (
                <div className="absolute bottom-[-8px]" style={{ left: arrowOffset - 6 }}>
                    <div className={cn("w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-b-2 border-r-2", arrowBorder)} />
                </div>
            ) : (
                <div className="absolute top-[-8px]" style={{ left: arrowOffset - 6 }}>
                    <div className={cn("w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-t-2 border-l-2", arrowBorder)} />
                </div>
            )}
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
    containerRef,
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
    containerRef: React.RefObject<HTMLDivElement | null>
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
                    "absolute rounded-full flex items-center justify-center transition-all duration-300 border-2 border-b-4 active:border-b-2 active:translate-y-[2px] z-10 shadow-md cursor-pointer",
                    showNumbers ? "w-8 h-8 font-black text-[10px]" : "w-7 h-7",
                    pinStyle === "explored" && "bg-[#58CC02] border-[#58CC02] border-b-[#3B8C00] text-white scale-110",
                    pinStyle === "explore-idle" && "bg-white dark:bg-slate-900 border-emerald-500 border-b-emerald-600 text-emerald-600 dark:text-emerald-400 hover:scale-110",
                    pinStyle === "correct-hit" && "bg-[#58CC02] border-[#58CC02] border-b-[#3B8C00] text-white scale-110",
                    pinStyle === "correct-missed" && "bg-amber-100 dark:bg-amber-950 border-amber-400 border-b-amber-500 text-amber-700 dark:text-amber-300",
                    pinStyle === "decoy-hit" && "bg-[#FF4B4B] border-[#FF4B4B] border-b-[#CC3C3C] text-white",
                    pinStyle === "decoy-unclicked" && "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400",
                    pinStyle === "correct-found-play" && "bg-[#58CC02] border-[#58CC02] border-b-[#3B8C00] text-white scale-110 animate-in zoom-in-50 duration-300",
                    pinStyle === "decoy-found-play" && "bg-[#FF4B4B] border-[#FF4B4B] border-b-[#CC3C3C] text-white scale-110 animate-in zoom-in-50 duration-300",
                    pinStyle === "discover-clicked" && "bg-[#1CB0F6] border-[#1CB0F6] border-b-[#0090CC] text-white animate-pulse",
                    isOpen && "ring-2 ring-offset-2 ring-offset-transparent",
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
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                ) : null}
                {((isRevealed && clickResult === "decoy-hit") || pinStyle === "decoy-found-play") && (
                    <XCircle className="w-3.5 h-3.5 stroke-[3]" />
                )}
                {showNumbers && !isRevealed && !foundDuringPlay && <span>{index + 1}</span>}
                {!showNumbers && !isRevealed && !foundDuringPlay && (
                    <div
                        className={cn(
                            "rounded-full transition-all duration-300",
                            isDiscovered || wasClicked ? "w-2.5 h-2.5 bg-white" : "w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-400",
                        )}
                    />
                )}
                {isExplore && !isDiscovered && (
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping pointer-events-none" />
                )}
            </button>
            {isOpen && (foundDuringPlay || isExplore || isRevealed) && (
                <HotspotDetailPanel
                    hotspot={hotspot}
                    isDecoy={!isCorrectTarget && (foundDecoyDuringPlay || (isRevealed && wasClicked))}
                    containerRef={containerRef}
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
    const stageRef = useRef<HTMLDivElement>(null)
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
            <div className="border p-4 rounded-md text-slate-900 dark:text-slate-100">
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
                "w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2",
                disabledProp && "opacity-75",
            )}
        >
            {/* TOP SECTION: Meta & Title */}
            <div className="shrink-0 space-y-1.5 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-[0.2em]">
                            Image Exploration
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">
                            {title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border-2",
                                isExplore
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    : "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
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

            {/* CENTER SECTION: Interactive Image Stage */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-visible py-2 w-full">
                <div className="flex items-center justify-center w-full h-full my-auto">
                    {/* Stage wrapper: overflow-visible so popovers/tooltips don't clip */}
                    <div
                        ref={stageRef}
                        className={cn(
                            "relative inline-block shrink-0 max-w-full",
                            canClick && "cursor-crosshair",
                            !canClick && isDiscover && !isRevealed && !isSubmitted && "cursor-not-allowed",
                        )}
                        onClick={handleStageClick}
                    >
                        {/* 3D Tactile Image Frame */}
                        <div className="rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-800 overflow-hidden shadow-md bg-slate-900/5 dark:bg-slate-900/50">
                            <img
                                ref={imageRef}
                                src={image || "/placeholder.svg?height=300&width=400"}
                                alt={title}
                                className="max-h-[48vh] md:max-h-[52vh] w-auto h-auto object-contain block select-none bg-transparent"
                                draggable={false}
                            />
                        </div>

                        {/* Pin + detail popover layer */}
                        <div className="absolute inset-0">
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
                                    containerRef={stageRef}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Reserved Footer Height for Submit & Retry */}
            <div className="shrink-0 space-y-2.5 pb-4 pt-1 min-h-[56px] flex flex-col justify-center">
                <div className="flex flex-col justify-end">
                    {isDiscover && !isRevealed && (
                        <div className="space-y-2">
                            {allTargetsFound && (
                                <div className="p-2.5 rounded-xl border-2 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-center animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                                        All targets found — press Submit when ready!
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Clicks left:{" "}
                                    <span className={cn(clicksRemaining === 0 ? "text-rose-500 font-extrabold" : "text-purple-600 dark:text-purple-400 font-extrabold")}>
                                        {clicksRemaining}
                                    </span>
                                </span>
                                {!isSubmitted && (
                                    <button
                                        type="button"
                                        disabled={!canSubmit}
                                        onClick={handleSubmit}
                                        className={cn(
                                            "px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border-b-4 active:border-b-0 active:translate-y-[2px] shadow-md cursor-pointer",
                                            allTargetsFound
                                                ? "bg-[#58CC02] text-white hover:bg-[#46a302] border-[#3B8C00] ring-2 ring-emerald-400 ring-offset-1 animate-pulse"
                                                : canSubmit
                                                    ? "bg-[#1CB0F6] text-white hover:bg-sky-500 border-[#0090CC]"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 border-b-slate-300 shadow-none cursor-not-allowed",
                                        )}
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isDiscover && isRevealed && isSubmitted && (
                        <div
                            className={cn(
                                "p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm",
                                isPendingMarking && !tutorMarkedFlag
                                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
                                    : approved || correctFoundCount >= totalCorrectTargets
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500/20"
                                        : correctFoundCount > 0
                                            ? "bg-amber-50/50 dark:bg-amber-950/40 border-amber-300/30"
                                            : "bg-rose-50/50 dark:bg-rose-950/40 border-rose-300/30",
                            )}
                        >
                            {isPendingMarking && !tutorMarkedFlag ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                        Submitted — Pending Tutor Review
                                    </span>
                                    <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                                        Tap any pin to read its explanation. Your tutor will score this attempt.
                                    </p>
                                </div>
                            ) : approved || correctFoundCount >= totalCorrectTargets ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Approved" : "Correct"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight italic">
                                        {tutorMarkedFlag
                                            ? "Response reviewed and approved by tutor."
                                            : `Excellent! You found all ${totalCorrectTargets} targets.`}
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            ) : correctFoundCount > 0 ? (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Scored" : "Partial Credit"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                                        You found {correctFoundCount} / {totalCorrectTargets} correct targets.
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                        {tutorMarkedFlag ? "Tutor Reviewed" : "Incorrect"}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                                        {tutorMarkedFlag
                                            ? "Response reviewed by tutor — revision required."
                                            : `You found 0 / ${totalCorrectTargets} correct targets.`}
                                    </p>
                                    {renderScoreLine()}
                                </div>
                            )}
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                                Tap any pin to read its explanation.
                            </p>
                        </div>
                    )}

                    {isExplore && discoveredHotspots.length === hotspots.length && hotspots.length > 0 && (
                        <div className="p-3 rounded-xl border-2 bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500/20">
                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 italic">
                                You&apos;ve explored all nodes!
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3">
                    {showRetry && (
                        <button
                            type="button"
                            onClick={onLocalRetry}
                            className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                        >
                            Try Again
                        </button>
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
