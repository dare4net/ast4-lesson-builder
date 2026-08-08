export interface VoiceOption {
    id: string;
    name: string;
    gender: 'female' | 'male';
    category: 'kids' | 'female_educators' | 'male_educators' | 'characters';
    accent: string;
    description: string;
    sampleUrl: string;
}

export const VOICE_CATALOG: VoiceOption[] = [
    // 👧 Kids & Young Learners
    {
        id: 'en-US-AnaNeural',
        name: 'Ana',
        gender: 'female',
        category: 'kids',
        accent: 'US',
        description: 'Cute, energetic young girl voice. Perfect for early childhood & lower primary.',
        sampleUrl: '/sounds/voice-previews/en-US-AnaNeural.mp3',
    },
    {
        id: 'en-US-ChristopherNeural',
        name: 'Christopher',
        gender: 'male',
        category: 'kids',
        accent: 'US',
        description: 'Friendly, youthful boy voice. Great for interactive & gamified lessons.',
        sampleUrl: '/sounds/voice-previews/en-US-ChristopherNeural.mp3',
    },

    // 👩 Female Teachers & Instructors
    {
        id: 'en-GB-SoniaNeural',
        name: 'Sonia (Default)',
        gender: 'female',
        category: 'female_educators',
        accent: 'British',
        description: 'Clean, warm, friendly teacher tone (Default).',
        sampleUrl: '/sounds/voice-previews/en-GB-SoniaNeural.mp3',
    },
    {
        id: 'en-US-JennyNeural',
        name: 'Jenny',
        gender: 'female',
        category: 'female_educators',
        accent: 'US',
        description: 'Clear, modern, articulate female educator.',
        sampleUrl: '/sounds/voice-previews/en-US-JennyNeural.mp3',
    },
    {
        id: 'en-US-AriaNeural',
        name: 'Aria',
        gender: 'female',
        category: 'female_educators',
        accent: 'US',
        description: 'Expressive, patient, encouraging instructor voice.',
        sampleUrl: '/sounds/voice-previews/en-US-AriaNeural.mp3',
    },
    {
        id: 'en-AU-NatashaNeural',
        name: 'Natasha',
        gender: 'female',
        category: 'female_educators',
        accent: 'Australian',
        description: 'Upbeat, articulate, engaging Australian educator.',
        sampleUrl: '/sounds/voice-previews/en-AU-NatashaNeural.mp3',
    },
    {
        id: 'en-NG-EzinneNeural',
        name: 'Ezinne',
        gender: 'female',
        category: 'female_educators',
        accent: 'Nigerian',
        description: 'Warm, articulate, resonant African English voice.',
        sampleUrl: '/sounds/voice-previews/en-NG-EzinneNeural.mp3',
    },
    {
        id: 'en-IN-NeerjaNeural',
        name: 'Neerja',
        gender: 'female',
        category: 'female_educators',
        accent: 'Indian',
        description: 'Clear, expressive Indian English educator.',
        sampleUrl: '/sounds/voice-previews/en-IN-NeerjaNeural.mp3',
    },

    // 👨 Male Teachers & Instructors
    {
        id: 'en-US-AndrewNeural',
        name: 'Andrew',
        gender: 'male',
        category: 'male_educators',
        accent: 'US',
        description: 'Warm, encouraging, approachable male teacher.',
        sampleUrl: '/sounds/voice-previews/en-US-AndrewNeural.mp3',
    },
    {
        id: 'en-GB-RyanNeural',
        name: 'Ryan',
        gender: 'male',
        category: 'male_educators',
        accent: 'British',
        description: 'Articulate, engaging British mentor.',
        sampleUrl: '/sounds/voice-previews/en-GB-RyanNeural.mp3',
    },
    {
        id: 'en-GB-ThomasNeural',
        name: 'Thomas',
        gender: 'male',
        category: 'male_educators',
        accent: 'British',
        description: 'Calm, authoritative, clear British instructor.',
        sampleUrl: '/sounds/voice-previews/en-GB-ThomasNeural.mp3',
    },
    {
        id: 'en-NG-AbeoNeural',
        name: 'Abeo',
        gender: 'male',
        category: 'male_educators',
        accent: 'Nigerian',
        description: 'Strong, dynamic, articulate African English voice.',
        sampleUrl: '/sounds/voice-previews/en-NG-AbeoNeural.mp3',
    },

    // 🎭 Animated & Character Voices
    {
        id: 'en-GB-LibbyNeural',
        name: 'Libby (Storybook)',
        gender: 'female',
        category: 'characters',
        accent: 'British',
        description: 'Expressive, cheerful storytelling voice for narrative lessons.',
        sampleUrl: '/sounds/voice-previews/en-GB-LibbyNeural.mp3',
    },
    {
        id: 'en-US-BrianNeural',
        name: 'Brian (Storyteller)',
        gender: 'male',
        category: 'characters',
        accent: 'US',
        description: 'Animated, rich narrator tone for stories and adventures.',
        sampleUrl: '/sounds/voice-previews/en-US-BrianNeural.mp3',
    },
];

export const DEFAULT_VOICE_ID = 'en-GB-SoniaNeural';

export const CATEGORY_LABELS: Record<VoiceOption['category'], string> = {
    kids: '👧 Kids & Young Learners',
    female_educators: '👩 Female Teachers & Instructors',
    male_educators: '👨 Male Teachers & Instructors',
    characters: '🎭 Cartoon & Storyteller Characters',
};

export function getVoiceById(voiceId?: string): VoiceOption {
    return (
        VOICE_CATALOG.find((v) => v.id === voiceId) ||
        VOICE_CATALOG.find((v) => v.id === DEFAULT_VOICE_ID)!
    );
}
