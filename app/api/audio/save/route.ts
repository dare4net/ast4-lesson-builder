import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { EdgeTTS } from 'node-edge-tts'
import { normalizeTextForSpeech } from '@/lib/audio-generator'

interface AudioItem {
    componentId: string
    text: string
    lessonId: string
}

interface BatchAudioRequest {
    items: AudioItem[]
}

/**
 * POST /api/audio/save
 * Accepts a batch of {componentId, text, lessonId} items.
 * Normalizes text (strips emojis, bracketed text, HTML, lowercases).
 * Generates MP3 audio for each using Edge Neural TTS (en-GB-SoniaNeural).
 * Returns { results: { componentId, audioUrl }[] }
 */
export async function POST(req: NextRequest) {
    try {
        const body: BatchAudioRequest = await req.json()
        const { items } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 })
        }

        const tts = new EdgeTTS({
            voice: 'en-GB-SoniaNeural', // Clear, friendly British English voice perfect for Year 4
            lang: 'en-GB',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        })

        const results = await Promise.all(
            items.map(({ componentId, text, lessonId }) =>
                generateAudio(tts, componentId, text, lessonId)
            )
        )

        return NextResponse.json({ results })
    } catch (err) {
        console.error('[audio/save] Error:', err)
        return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
    }
}

async function generateAudio(
    tts: EdgeTTS,
    componentId: string,
    rawText: string,
    lessonId: string
): Promise<{ componentId: string; audioUrl: string | null }> {
    try {
        const audioDir = path.join(process.cwd(), 'public', 'audio', lessonId)
        fs.mkdirSync(audioDir, { recursive: true })

        const fileName = `${componentId}.mp3`
        const filePath = path.join(audioDir, fileName)

        // Normalize text: strip emojis, bracketed content (e.g. [note], (click)), HTML tags, lowercase
        const cleanText = normalizeTextForSpeech(rawText)

        if (!cleanText) {
            return { componentId, audioUrl: null }
        }

        await tts.ttsPromise(cleanText, filePath)

        return { componentId, audioUrl: `/audio/${lessonId}/${fileName}` }
    } catch (err) {
        console.error(`[audio] Failed for ${componentId}:`, err)
        return { componentId, audioUrl: null }
    }
}
