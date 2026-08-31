export function slideCueVisitKey(slide: { id?: string } | undefined, index: number) {
    return String(slide?.id || `idx-${index}`)
}

/** Slides already reached (resume index + completed) should not replay their cue. */
export function seedSeenSlideKeys(
    slides: Array<{ id?: string; status?: string }> | undefined,
    currentIndex: number
) {
    const seen = new Set<string>()
    ;(slides || []).forEach((slide, index) => {
        if (index <= currentIndex || slide.status === 'completed') {
            seen.add(slideCueVisitKey(slide, index))
        }
    })
    return seen
}

export function shouldPlaySlideCue(seen: Set<string>, key: string, isSlideChange: boolean) {
    return isSlideChange && !seen.has(key)
}
