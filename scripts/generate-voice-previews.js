import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EdgeTTS } from 'node-edge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOICES = [
    'en-US-AnaNeural',
    'en-US-ChristopherNeural',
    'en-GB-SoniaNeural',
    'en-US-JennyNeural',
    'en-US-AriaNeural',
    'en-AU-NatashaNeural',
    'en-NG-EzinneNeural',
    'en-IN-NeerjaNeural',
    'en-US-AndrewNeural',
    'en-GB-RyanNeural',
    'en-GB-ThomasNeural',
    'en-NG-AbeoNeural',
    'en-GB-LibbyNeural',
    'en-US-BrianNeural',
];

const SAMPLE_TEXT = "Hello! Welcome to Afterschool Tech. I will be your teacher for this lesson.";

async function generateAllPreviews() {
    const outputDir = path.join(__dirname, '..', 'public', 'sounds', 'voice-previews');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`[voice-previews] Generating sample audio for ${VOICES.length} verified voices...`);

    for (const voiceId of VOICES) {
        const filePath = path.join(outputDir, `${voiceId}.mp3`);
        try {
            console.log(`  -> Generating preview for ${voiceId}...`);
            const tts = new EdgeTTS({
                voice: voiceId,
                lang: voiceId.slice(0, 5),
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            });
            await tts.ttsPromise(SAMPLE_TEXT, filePath);
            console.log(`     ✓ Saved ${voiceId}.mp3`);
        } catch (err) {
            console.error(`     ✗ Failed for ${voiceId}:`, err.message);
        }
    }

    console.log('[voice-previews] Complete!');
}

generateAllPreviews();
