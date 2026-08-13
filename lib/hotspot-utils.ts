import type { MarkingMode } from "@/lib/tutor-marking-contract"

/** Explore = open inspection (all pins visible). Discover = hidden hunt + check. */
export type HotspotBehavior = "explore" | "discover"

/** Legacy behavior strings still accepted in lesson JSON */
export type LegacyHotspotBehavior = HotspotBehavior | "discovery" | "quiz"

export interface HotspotNode {
    id: string
    x: number
    y: number
    label: string
    content: string
    /** Discover mode only — decoys are clickable but don't count toward score */
    isCorrect?: boolean
}

export type HotspotState = {
    /** Explore mode — nodes opened for reading */
    discoveredHotspots: string[]
    /** Discover mode — all nodes clicked (correct + decoy) */
    clickedHotspotIds: string[]
    clicksUsed: number
    isSubmitted: boolean
    isRevealed: boolean
    isPendingMarking?: boolean
    tutorMarked?: boolean
    isApproved?: boolean
    markedBy?: string
    score?: number
    status?: string
}

const HOTSPOT_ROOT_PROP_KEYS = [
    "title",
    "image",
    "hotspots",
    "behavior",
    "showNumbers",
    "points",
    "timeLimit",
    "mode",
    "state",
    "maxClicks",
    "markingMode",
] as const

/** Map legacy JSON values to current behavior names */
export function normalizeHotspotBehavior(raw: unknown): HotspotBehavior {
    if (raw === undefined || raw === null || raw === "") {
        // Pre-behavior-field lessons were informational (all pins visible)
        return "explore"
    }
    const value = String(raw).toLowerCase()
    if (value === "explore" || value === "discovery" || value === "clickableimage") return "explore"
    if (value === "discover" || value === "quiz") return "discover"
    return "explore"
}

export function isLegacyHotspotBehavior(raw: unknown): raw is "discovery" | "quiz" {
    const value = String(raw ?? "").toLowerCase()
    return value === "discovery" || value === "quiz"
}

function resolveHotspotIsCorrect(raw: Partial<HotspotNode> & { isTarget?: boolean }): boolean {
    if (typeof raw.isTarget === "boolean") return raw.isTarget
    return raw.isCorrect !== false
}

export function normalizeHotspotNodes(raw: unknown[]): HotspotNode[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item, index) => {
        const hs = (item ?? {}) as Partial<HotspotNode> & { isTarget?: boolean }
        return {
            id: typeof hs.id === "string" && hs.id.trim() ? hs.id : `hs-${index + 1}`,
            x: typeof hs.x === "number" ? hs.x : 0,
            y: typeof hs.y === "number" ? hs.y : 0,
            label: typeof hs.label === "string" ? hs.label : `Node ${index + 1}`,
            content: typeof hs.content === "string" ? hs.content : "",
            isCorrect: resolveHotspotIsCorrect(hs),
        }
    })
}

/**
 * Merge legacy flat hotspot components (props on root) and normalize behavior/nodes.
 * Safe to call on already-normalized extended-format components.
 */
export function resolveHotspotComponentProps(
    component: { props?: Record<string, unknown>; [key: string]: unknown },
): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...(component.props ?? {}) }

    for (const key of HOTSPOT_ROOT_PROP_KEYS) {
        if (merged[key] === undefined && component[key] !== undefined) {
            merged[key] = component[key]
        }
    }

    merged.behavior = normalizeHotspotBehavior(merged.behavior)

    if (Array.isArray(merged.hotspots)) {
        merged.hotspots = normalizeHotspotNodes(merged.hotspots as unknown[])
    }

    return merged
}

export function getCorrectHotspots(hotspots: HotspotNode[]): HotspotNode[] {
    return hotspots.filter(h => h.isCorrect !== false)
}

export function countCorrectFound(hotspots: HotspotNode[], clickedIds: string[]): number {
    const correctIds = new Set(getCorrectHotspots(hotspots).map(h => h.id))
    return clickedIds.filter(id => correctIds.has(id)).length
}

export function calculateHotspotScore(
    hotspots: HotspotNode[],
    clickedIds: string[],
    maxPoints: number,
): { earned: number; totalCorrect: number; correctFound: number } {
    const totalCorrect = getCorrectHotspots(hotspots).length
    const correctFound = countCorrectFound(hotspots, clickedIds)
    if (totalCorrect === 0) return { earned: 0, totalCorrect: 0, correctFound: 0 }
    const earned = Math.round((correctFound / totalCorrect) * maxPoints)
    return { earned, totalCorrect, correctFound }
}

export function minMaxClicksForHotspots(nodeCount: number): number {
    return nodeCount + 6
}

export function validateMaxClicks(maxClicks: number, nodeCount: number): boolean {
    return maxClicks > nodeCount + 5
}

export function findHotspotAtClick(
    hotspots: HotspotNode[],
    clickXPercent: number,
    clickYPercent: number,
    radius = 12,
): HotspotNode | null {
    for (const spot of hotspots) {
        const spotX = spot.x * 100
        const spotY = spot.y * 100
        const dist = Math.sqrt(
            Math.pow(clickXPercent - spotX, 2) + Math.pow(clickYPercent - spotY, 2),
        )
        if (dist <= radius) return spot
    }
    return null
}

export function createInitialHotspotState(behavior: HotspotBehavior): HotspotState {
    return {
        discoveredHotspots: [],
        clickedHotspotIds: [],
        clicksUsed: 0,
        isSubmitted: false,
        isRevealed: false,
        status: "active",
        score: 0,
    }
}

export type HotspotDiscoverProps = {
    behavior: HotspotBehavior
    markingMode?: MarkingMode
    maxClicks?: number
}
