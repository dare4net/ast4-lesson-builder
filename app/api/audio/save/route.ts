import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { EdgeTTS } from 'node-edge-tts'
import { normalizeTextForSpeech } from '@/lib/audio-generator'
import { uploadAudioToCloudinary } from '@/lib/cloudinary'

// TTS + Cloudinary per clip can be slow; large lessons need headroom.
export const maxDuration = 300

const TTS_CONCURRENCY = 3

interface AudioItem {
    componentId: string
    text: string
    lessonId: string
    voice?: string
}

interface BatchAudioRequest {
    items: AudioItem[]
    voice?: string
}

async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    if (items.length === 0) return []

    const results = new Array<R>(items.length)
    let nextIndex = 0

    async function worker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++
            results[currentIndex] = await fn(items[currentIndex], currentIndex)
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
    )

    return results
}

/**
 * POST /api/audio/save
 * Accepts a batch of {componentId, text, lessonId, voice} items.
 * Generates MP3 audio sequentially (limited concurrency) and uploads to Cloudinary.
 * Returns partial success — failed items have audioUrl: null and an error field.
 */
export async function POST(req: NextRequest) {
    try {
        const body: BatchAudioRequest = await req.json()
        const { items, voice: batchVoice } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 })
        }

        const results = await mapWithConcurrency(items, TTS_CONCURRENCY, (item) => {
            const selectedVoice = item.voice || batchVoice || 'en-GB-SoniaNeural'
            const lang = selectedVoice.slice(0, 5)

            const tts = new EdgeTTS({
                voice: selectedVoice,
                lang,
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            })

            return generateAudio(tts, item.componentId, item.text, item.lessonId)
        })

        const failed = results.filter((r) => r.error)
        if (failed.length > 0) {
            console.warn(
                `[audio/save] ${failed.length}/${results.length} clips failed:`,
                failed.map((f) => `${f.componentId}: ${f.error}`).join('; '),
            )
        }

        return NextResponse.json({
            results,
            generated: results.filter((r) => r.audioUrl).length,
            failed: failed.length,
        })
    } catch (err: any) {
        console.error('[audio/save] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to generate audio' }, { status: 500 })
    }
}

async function generateAudio(
    tts: EdgeTTS,
    componentId: string,
    rawText: string,
    lessonId: string
): Promise<{ componentId: string; audioUrl: string | null; error?: string }> {
    try {
        // Use /tmp — the only writable directory on Vercel serverless functions.
        // public/audio is read-only after deployment.
        const tmpDir = path.join('/tmp', 'ast-audio', lessonId)
        fs.mkdirSync(tmpDir, { recursive: true })

        const fileName = `${componentId}.mp3`
        const filePath = path.join(tmpDir, fileName)

        // Normalize text: strip emojis, bracketed content (e.g. [note], (click)), HTML tags, lowercase
        const cleanText = normalizeTextForSpeech(rawText)

        if (!cleanText) {
            return { componentId, audioUrl: null }
        }

        // 1. Synthesize neural TTS audio file
        await tts.ttsPromise(cleanText, filePath)

        // 2. Upload to Cloudinary (replaces old audio under same public_id: ast_lessons/{lessonId}/{componentId})
        const cloudinaryUrl = await uploadAudioToCloudinary(filePath, lessonId, componentId)

        // 3. Clean up temp file to avoid /tmp bloat across warm invocations
        try { fs.unlinkSync(filePath) } catch (_) { /* ignore */ }

        return { componentId, audioUrl: cloudinaryUrl }
    } catch (err: any) {
        console.error(`[audio] Failed for ${componentId}:`, err)
        return { componentId, audioUrl: null, error: err.message || String(err) }
    }
}
