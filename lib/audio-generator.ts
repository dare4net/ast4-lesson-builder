/**
 * Audio Generator Utility (Client & Server helper)
 *
 * Provides:
 *   - normalizeTextForSpeech: strips emojis, bracketed content (e.g. (note), [click]),
 *     HTML tags, lowercases, and normalizes whitespace for clean TTS speech synthesis.
 *   - hashText: fast string hash for delta detection.
 *   - generateBatchAudio: sends all component texts to backend in one batch call.
 */

/**
 * Normalizes text for clean, natural speech synthesis:
 * 1. Strips HTML tags (<...>)
 * 2. Strips bracketed/parenthetical text like (click to expand), [note], {extra}
 * 3. Strips all emojis & unicode pictograms
 * 4. Lowercases all text
 * 5. Normalizes whitespace
 * 6. Ensures trailing period if missing
 */
export function normalizeTextForSpeech(text: string): string {
    if (!text) return ''

    let clean = text
        // Strip HTML tags
        .replace(/<[^>]*>?/gm, '')
        // Strip bracketed content: (text), [text], {text}
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\{[^}]*\}/g, ' ')
        // Strip emojis & unicode pictograms
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
        // Lowercase
        .toLowerCase()
        // Collapse multi-spaces / whitespace
        .replace(/\s+/g, ' ')
        .trim()

    // Ensure trailing period for a natural pause if no sentence-ending punctuation exists
    if (clean && !/[.!?]$/.test(clean)) {
        clean += '.'
    }

    return clean
}

/** Fast string hash for delta detection */
export function hashText(text: string): string {
    let h = 0
    for (let i = 0; i < text.length; i++) {
        h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
    }
    return Math.abs(h).toString(36)
}

export interface AudioBatchItem {
    componentId: string
    text: string
    lessonId: string
}

export interface AudioBatchResult {
    componentId: string
    audioUrl: string | null
}

/**
 * Send all text components to backend in one call.
 * Returns a map of componentId → audioUrl.
 */
export async function generateBatchAudio(
    items: AudioBatchItem[]
): Promise<Record<string, string | null>> {
    if (items.length === 0) return {}

    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 2000

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch('/api/audio/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            })

            if (!res.ok) {
                const errText = await res.text()
                console.error(`[audio] Batch generate failed (attempt ${attempt}):`, errText)
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
                    continue
                }
                return {}
            }

            const { results }: { results: AudioBatchResult[] } = await res.json()
            return Object.fromEntries(results.map(r => [r.componentId, r.audioUrl]))
        } catch (err) {
            console.warn(`[audio] generateBatchAudio network error (attempt ${attempt}/${MAX_RETRIES}):`, err)
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
            } else {
                console.error('[audio] All retries exhausted. Failed to generate audio batch.')
                return {}
            }
        }
    }
    return {}
}
