import { hashText, normalizeTextForSpeech } from "@/lib/audio-generator"
import type { Lesson } from "@/types/lesson"

type PropsAudioTarget = {
    kind: "props"
    field: "audioUrl"
    hashField: "textHash"
}

type AccordionItemTarget = {
    kind: "accordionItem"
    itemIndex: number
}

type TimelineEventTarget = {
    kind: "timelineEvent"
    eventIndex: number
}

export type ComponentAudioTarget = PropsAudioTarget | AccordionItemTarget | TimelineEventTarget

export interface CollectedAudioItem {
    componentId: string
    text: string
    lessonId: string
    slideIdx: number
    compIdx: number
    newHash: string
    target: ComponentAudioTarget
}

const AUDIO_ELIGIBLE_TYPES = new Set([
    "paragraph",
    "bulletList",
    "heading",
    "callout",
    "quote",
    "accordion",
    "timeline",
    "image",
])

function getExistingAudio(comp: any, target: ComponentAudioTarget): string | undefined {
    if (target.kind === "props") {
        return comp.props?.[target.field]
    }
    if (target.kind === "accordionItem") {
        return comp.props?.items?.[target.itemIndex]?.audioUrl
    }
    return comp.props?.events?.[target.eventIndex]?.audioUrl
}

function getExistingHash(comp: any, target: ComponentAudioTarget): string | undefined {
    if (target.kind === "props") {
        return comp.props?.[target.hashField]
    }
    if (target.kind === "accordionItem") {
        return comp.props?.items?.[target.itemIndex]?.textHash
    }
    return comp.props?.events?.[target.eventIndex]?.textHash
}

function extractSpeechSegments(comp: any): Array<{ componentId: string; rawText: string; target: ComponentAudioTarget }> {
    switch (comp.type) {
        case "paragraph":
        case "heading":
            return [{
                componentId: comp.id,
                rawText: comp.props?.content || "",
                target: { kind: "props", field: "audioUrl", hashField: "textHash" },
            }]
        case "bulletList":
            return [{
                componentId: comp.id,
                rawText: (comp.props?.items || []).join(". "),
                target: { kind: "props", field: "audioUrl", hashField: "textHash" },
            }]
        case "callout":
            return [{
                componentId: comp.id,
                rawText: `${comp.props?.title || "Note"}. ${comp.props?.content || ""}`,
                target: { kind: "props", field: "audioUrl", hashField: "textHash" },
            }]
        case "quote":
            return [{
                componentId: comp.id,
                rawText: `Quote: ${comp.props?.text || ""}. Author: ${comp.props?.author || ""}`,
                target: { kind: "props", field: "audioUrl", hashField: "textHash" },
            }]
        case "image":
            return [{
                componentId: comp.id,
                rawText: comp.props?.caption || "",
                target: { kind: "props", field: "audioUrl", hashField: "textHash" },
            }]
        case "accordion":
            return (comp.props?.items || []).map((item: any, itemIndex: number) => ({
                componentId: `${comp.id}-acc-${item.id || itemIndex}`,
                rawText: `${item.title || ""}. ${item.content || ""}`,
                target: { kind: "accordionItem", itemIndex },
            }))
        case "timeline":
            return (comp.props?.events || []).map((event: any, eventIndex: number) => ({
                componentId: `${comp.id}-evt-${event.id || eventIndex}`,
                rawText: `${event.year || ""}: ${event.title || ""}. ${event.description || ""}`,
                target: { kind: "timelineEvent", eventIndex },
            }))
        default:
            return []
    }
}

export interface SlideCueAudioItem {
    componentId: string
    text: string
    lessonId: string
    slideIdx: number
    newHash: string
}

export interface LessonAudioPublishPlan {
    componentItems: CollectedAudioItem[]
    slideCueItems: SlideCueAudioItem[]
    skippedIds: Set<string>
    pendingCount: number
    readyCount: number
    totalEligible: number
}

function resolveVoiceForHash(lesson: Lesson): string {
    return (lesson.voice && lesson.voice !== "inherit") ? lesson.voice : "default"
}

function shouldReuseExistingAudio(existingHash: string | undefined, newHash: string, existingAudio: string | undefined): boolean {
    return Boolean(existingHash === newHash && existingAudio)
}

export function collectSlideCueAudioItems(lesson: Lesson, lessonId: string): {
    items: SlideCueAudioItem[]
    skippedIds: Set<string>
} {
    const items: SlideCueAudioItem[] = []
    const skippedIds = new Set<string>()
    const resolvedVoiceForHash = resolveVoiceForHash(lesson)

    lesson.slides.forEach((slide, slideIdx) => {
        const rawTitle = `Slide ${slideIdx + 1}. ${slide.title}`
        const cleanTitle = normalizeTextForSpeech(rawTitle)
        if (!cleanTitle) return

        const newHash = hashText(`${cleanTitle}::${resolvedVoiceForHash}`)
        const cueId = `slide-cue-${slide.id}`

        if (shouldReuseExistingAudio(slide.titleTextHash, newHash, slide.titleAudioUrl)) {
            skippedIds.add(cueId)
            return
        }

        items.push({
            componentId: cueId,
            text: cleanTitle,
            lessonId,
            slideIdx,
            newHash,
        })
    })

    return { items, skippedIds }
}

export function collectLessonComponentAudioItems(
    lesson: Lesson,
    lessonId: string,
): { items: CollectedAudioItem[]; skippedIds: Set<string> } {
    const items: CollectedAudioItem[] = []
    const skippedIds = new Set<string>()
    const resolvedVoiceForHash = resolveVoiceForHash(lesson)

    lesson.slides.forEach((slide, slideIdx) => {
        slide.components.forEach((comp, compIdx) => {
            if (!AUDIO_ELIGIBLE_TYPES.has(comp.type)) return

            extractSpeechSegments(comp).forEach(({ componentId, rawText, target }) => {
                const cleanText = normalizeTextForSpeech(rawText)
                if (!cleanText) return

                const newHash = hashText(`${cleanText}::${resolvedVoiceForHash}`)
                const existingAudio = getExistingAudio(comp, target)
                const existingHash = getExistingHash(comp, target)

                if (shouldReuseExistingAudio(existingHash, newHash, existingAudio)) {
                    skippedIds.add(componentId)
                    return
                }

                items.push({
                    componentId,
                    text: cleanText,
                    lessonId,
                    slideIdx,
                    compIdx,
                    newHash,
                    target,
                })
            })
        })
    })

    return { items, skippedIds }
}

export function planLessonAudioPublish(lesson: Lesson, lessonId: string): LessonAudioPublishPlan {
    const { items: componentItems, skippedIds: componentSkipped } = collectLessonComponentAudioItems(lesson, lessonId)
    const { items: slideCueItems, skippedIds: cueSkipped } = collectSlideCueAudioItems(lesson, lessonId)

    const skippedIds = new Set<string>([...componentSkipped, ...cueSkipped])
    const pendingCount = componentItems.length + slideCueItems.length
    const readyCount = skippedIds.size
    const totalEligible = pendingCount + readyCount

    return {
        componentItems,
        slideCueItems,
        skippedIds,
        pendingCount,
        readyCount,
        totalEligible,
    }
}

export function applyLessonComponentAudioPatches(
    slides: Lesson["slides"],
    collectedItems: CollectedAudioItem[],
    urlMap: Record<string, string | null>,
): Lesson["slides"] {
    return slides.map((slide, slideIdx) => ({
        ...slide,
        components: slide.components.map((comp, compIdx) => {
            const patches = collectedItems.filter(
                (item) => item.slideIdx === slideIdx && item.compIdx === compIdx,
            )
            if (patches.length === 0) return comp

            const nextProps = { ...comp.props }

            for (const patch of patches) {
                const audioUrl = urlMap[patch.componentId]
                if (!audioUrl) continue

                if (patch.target.kind === "props") {
                    nextProps[patch.target.field] = audioUrl
                    nextProps[patch.target.hashField] = patch.newHash
                    continue
                }

                if (patch.target.kind === "accordionItem") {
                    const items = [...(nextProps.items || [])]
                    const current = items[patch.target.itemIndex]
                    if (!current) continue
                    items[patch.target.itemIndex] = {
                        ...current,
                        audioUrl,
                        textHash: patch.newHash,
                    }
                    nextProps.items = items
                    continue
                }

                const events = [...(nextProps.events || [])]
                const current = events[patch.target.eventIndex]
                if (!current) continue
                events[patch.target.eventIndex] = {
                    ...current,
                    audioUrl,
                    textHash: patch.newHash,
                }
                nextProps.events = events
            }

            return { ...comp, props: nextProps }
        }),
    }))
}
