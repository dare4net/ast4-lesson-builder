/**
 * Audio Generator Utility (Client & Server helper)
 *
 * Provides:
 *   - normalizeTextForSpeech: strips emojis, bracketed content (e.g. (note), [click]),
 *     HTML tags, lowercases, and normalizes whitespace for clean TTS speech synthesis.
 *   - hashText: fast string hash for delta detection.
 *   - generateBatchAudio: sends component texts to backend in chunked batches with progress.
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
        .replace(/<[^>]*>?/gm, '')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\{[^}]*\}/g, ' ')
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()

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
    voice?: string
}

export interface AudioBatchResult {
    componentId: string
    audioUrl: string | null
    error?: string
}

export interface AudioBatchResponse {
    results: AudioBatchResult[]
    generated?: number
    failed?: number
}

export interface AudioGenerationProgress {
    completed: number
    total: number
    percent: number
}

export interface AudioBatchGenerationResult {
    urlMap: Record<string, string | null>
    succeeded: number
    failed: number
    attempted: number
}

const CLIENT_CHUNK_SIZE = 8

export type AudioProgressCallback = (progress: AudioGenerationProgress) => void

/**
 * Send text components to backend in chunked batches (avoids server timeouts).
 * Calls onProgress after each clip attempt. Caller passes only pending items to resume.
 */
export async function generateBatchAudio(
    items: AudioBatchItem[],
    voice?: string,
    onProgress?: AudioProgressCallback,
): Promise<AudioBatchGenerationResult> {
    const urlMap: Record<string, string | null> = {}
    const total = items.length

    if (total === 0) {
        onProgress?.({ completed: 0, total: 0, percent: 100 })
        return { urlMap, succeeded: 0, failed: 0, attempted: 0 }
    }

    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 2000
    let completed = 0
    let succeeded = 0
    let failed = 0

    const reportProgress = () => {
        onProgress?.({
            completed,
            total,
            percent: Math.min(100, Math.round((completed / total) * 100)),
        })
    }

    reportProgress()

    for (let offset = 0; offset < items.length; offset += CLIENT_CHUNK_SIZE) {
        const chunk = items.slice(offset, offset + CLIENT_CHUNK_SIZE)
        let chunkResults: AudioBatchResult[] | null = null

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const res = await fetch('/api/audio/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: chunk, voice }),
                })

                if (!res.ok) {
                    const errText = await res.text()
                    console.error(`[audio] Batch chunk failed (attempt ${attempt}):`, errText)
                    if (attempt < MAX_RETRIES) {
                        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
                        continue
                    }
                    break
                }

                const data: AudioBatchResponse = await res.json()
                chunkResults = data.results || []
                break
            } catch (err) {
                console.warn(`[audio] generateBatchAudio network error (attempt ${attempt}/${MAX_RETRIES}):`, err)
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
                } else {
                    console.error('[audio] Chunk retries exhausted.')
                }
            }
        }

        if (!chunkResults) {
            for (const item of chunk) {
                urlMap[item.componentId] = null
                completed++
                failed++
                reportProgress()
            }
            continue
        }

        const resultById = new Map(chunkResults.map((result) => [result.componentId, result]))

        for (const item of chunk) {
            const result = resultById.get(item.componentId)
            if (result?.audioUrl) {
                urlMap[item.componentId] = result.audioUrl
                succeeded++
            } else {
                urlMap[item.componentId] = null
                failed++
                if (result?.error) {
                    console.warn(`[audio] Clip failed (${item.componentId}):`, result.error)
                }
            }
            completed++
            reportProgress()
        }
    }

    if (failed > 0) {
        console.warn(`[audio] ${failed} clip(s) failed. Click publish again to retry only missing clips.`)
    }

    return { urlMap, succeeded, failed, attempted: total }
}
