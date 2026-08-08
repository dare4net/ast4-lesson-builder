import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { EdgeTTS } from 'node-edge-tts'
import { normalizeTextForSpeech } from '@/lib/audio-generator'
import { uploadAudioToCloudinary } from '@/lib/cloudinary'

// Extend route timeout to 60s (TTS synthesis + Cloudinary upload can be slow for large batches)
export const maxDuration = 60

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

/**
 * POST /api/audio/save
 * Accepts a batch of {componentId, text, lessonId, voice} items.
 * Normalizes text (strips emojis, bracketed text, HTML, lowercases).
 * Generates MP3 audio for each using specified Edge Neural TTS voice (default: en-GB-SoniaNeural).
 * Uploads audio to Cloudinary with overwrite: true (discarding old audio).
 * Returns { results: { componentId, audioUrl }[] }
 */
export async function POST(req: NextRequest) {
    try {
        const body: BatchAudioRequest = await req.json()
        const { items, voice: batchVoice } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 })
        }

        const results = await Promise.all(
            items.map(({ componentId, text, lessonId, voice: itemVoice }) => {
                const selectedVoice = itemVoice || batchVoice || 'en-GB-SoniaNeural';
                const lang = selectedVoice.slice(0, 5);

                const tts = new EdgeTTS({
                    voice: selectedVoice,
                    lang: lang,
                    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                });

                return generateAudio(tts, componentId, text, lessonId);
            })
        )

        const failedItem = results.find(r => r.error)
        if (failedItem) {
            return NextResponse.json({ error: `Audio upload failed: ${failedItem.error}` }, { status: 500 })
        }

        return NextResponse.json({ results })
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
        const tmpDir = path.join(process.cwd(), 'public', 'audio', lessonId)
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

        return { componentId, audioUrl: cloudinaryUrl }
    } catch (err: any) {
        console.error(`[audio] Failed for ${componentId}:`, err)
        return { componentId, audioUrl: null, error: err.message || String(err) }
    }
}
