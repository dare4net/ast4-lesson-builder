import type { RenderableComponentType } from '@/lib/component-renderer-loaders'

const id = (type: string) => `test-${type}`

const LIVE = {
    mode: 'live' as const,
    timeLimit: 30,
}

/** Minimal props so every viewer renderer can mount in tests. */
export const RENDERER_FIXTURES: Record<RenderableComponentType, Record<string, unknown>> = {
    paragraph: { id: id('paragraph'), content: 'Hello from the test paragraph.' },
    heading: { id: id('heading'), content: 'Test heading', level: 2 },
    bulletList: { id: id('bulletList'), items: ['Alpha', 'Beta'] },
    image: { id: id('image'), src: '/placeholder.svg', alt: 'Test image' },
    table: {
        id: id('table'),
        headers: ['Col'],
        rows: [['Value']],
    },
    video: { id: id('video'), url: 'https://example.com/video.mp4', title: 'Test video' },
    codeBlock: { id: id('codeBlock'), code: 'print("hi")', language: 'python' },
    quote: { id: id('quote'), text: 'Testing is believing.', author: 'AST' },
    callout: { id: id('callout'), text: 'Remember to test.', variant: 'info' },
    accordion: {
        id: id('accordion'),
        items: [{ title: 'Section', content: 'Body copy' }],
    },
    quiz: {
        id: id('quiz'),
        title: 'Test quiz',
        points: 10,
        ...LIVE,
        questions: [{
            id: 'q1',
            question: 'Pick the right answer',
            options: [
                { id: 'a', text: 'Correct', isCorrect: true },
                { id: 'b', text: 'Wrong', isCorrect: false },
            ],
        }],
    },
    trueFalse: {
        id: id('trueFalse'),
        statement: 'The sky is blue.',
        isTrue: true,
        points: 10,
        ...LIVE,
    },
    annotateImage: {
        id: id('annotateImage'),
        image: '/placeholder.svg',
        points: 10,
        ...LIVE,
        prompts: [{ id: 'p1', x: 0.5, y: 0.5, label: 'Tap here' }],
    },
    categorise: {
        id: id('categorise'),
        title: 'Sort it',
        points: 10,
        ...LIVE,
        categories: [
            { id: 'c1', title: 'Group A' },
            { id: 'c2', title: 'Group B' },
        ],
        items: [
            { id: 'i1', text: 'Item 1', categoryId: 'c1' },
            { id: 'i2', text: 'Item 2', categoryId: 'c2' },
        ],
    },
    timeline: {
        id: id('timeline'),
        title: 'Order events',
        points: 10,
        ...LIVE,
        events: [
            { id: 'e1', text: 'First', order: 0 },
            { id: 'e2', text: 'Second', order: 1 },
        ],
    },
    matchingPairs: {
        id: id('matchingPairs'),
        title: 'Match pairs',
        points: 15,
        ...LIVE,
        pairs: [
            { id: 'p1', left: 'Cat', right: 'Meow' },
            { id: 'p2', left: 'Dog', right: 'Woof' },
        ],
    },
    dragDrop: {
        id: id('dragDrop'),
        title: 'Sort items',
        points: 15,
        ...LIVE,
        items: [
            { id: 'd1', text: 'One', correctIndex: 0 },
            { id: 'd2', text: 'Two', correctIndex: 1 },
        ],
    },
    flashcards: {
        id: id('flashcards'),
        cards: [{ id: 'fc1', front: 'Front', back: 'Back' }],
    },
    hotspot: {
        id: id('hotspot'),
        title: 'Find the spot',
        image: '/placeholder.svg',
        behavior: 'discover',
        points: 10,
        ...LIVE,
        hotspots: [
            { id: 'h1', x: 0.3, y: 0.4, label: 'Target', isCorrect: true },
        ],
    },
    shortAnswer: {
        id: id('shortAnswer'),
        title: 'Short answer',
        question: 'Name one primary colour.',
        points: 10,
        ...LIVE,
    },
    fillInTheBlank: {
        id: id('fillInTheBlank'),
        title: 'Fill blank',
        text: 'The {{b1}} is bright.',
        points: 5,
        ...LIVE,
        blanks: [{ id: 'b1', answer: 'sun' }],
    },
    codeEditor: {
        id: id('codeEditor'),
        title: 'Code task',
        prompt: 'Return 42',
        starterCode: 'function answer() {}',
        points: 10,
        ...LIVE,
    },
    poll: {
        id: id('poll'),
        question: 'Favourite colour?',
        options: [
            { id: 'o1', text: 'Red' },
            { id: 'o2', text: 'Blue' },
        ],
    },
    flashcardQuiz: {
        id: id('flashcardQuiz'),
        points: 20,
        ...LIVE,
        questions: [{
            id: 'fq1',
            question: 'Capital of France?',
            options: ['Paris', 'London'],
            correctAnswer: 0,
        }],
    },
    multiSelectQuiz: {
        id: id('multiSelectQuiz'),
        title: 'Multi select',
        points: 10,
        ...LIVE,
        questions: [{
            id: 'ms1',
            question: 'Pick evens',
            options: [
                { id: 'a', text: '2', isCorrect: true, color: 'bg-violet-500' },
                { id: 'b', text: '3', isCorrect: false, color: 'bg-amber-500' },
                { id: 'c', text: '4', isCorrect: true, color: 'bg-sky-500' },
            ],
        }],
    },
    wordCloud: {
        id: id('wordCloud'),
        title: 'Word cloud',
        question: 'One word for success',
        points: 10,
        lessonId: 'lesson-test',
        ...LIVE,
    },
    scaleSlider: {
        id: id('scaleSlider'),
        title: 'Rate it',
        prompt: 'How confident are you?',
        minLabel: 'Low',
        maxLabel: 'High',
        points: 10,
        lessonId: 'lesson-test',
        ...LIVE,
    },
    annotationBoard: {
        id: id('annotationBoard'),
        title: 'Annotate',
        image: '/placeholder.svg',
        points: 10,
        ...LIVE,
    },
    anagram: {
        id: id('anagram'),
        title: 'Anagram',
        targetWord: 'TEST',
        points: 15,
        ...LIVE,
    },
    hangman: {
        id: id('hangman'),
        title: 'Hangman',
        secretWord: 'CODE',
        points: 15,
        ...LIVE,
    },
    swipeDeck: {
        id: id('swipeDeck'),
        title: 'Swipe deck',
        points: 10,
        ...LIVE,
        cards: [
            { id: 's1', prompt: 'Agree?', yesLabel: 'Yes', noLabel: 'No', correctSwipe: 'yes' as const },
        ],
    },
    spectrumSorter: {
        id: id('spectrumSorter'),
        title: 'Spectrum',
        points: 10,
        ...LIVE,
        items: [
            { id: 'sp1', text: 'Cold', position: 0 },
            { id: 'sp2', text: 'Hot', position: 1 },
        ],
    },
    jigsaw: {
        id: id('jigsaw'),
        title: 'Jigsaw',
        image: '/placeholder.svg',
        gridSize: 2,
        points: 10,
        ...LIVE,
    },
    crossword: {
        id: id('crossword'),
        title: 'Crossword',
        points: 10,
        ...LIVE,
        clues: [{
            id: 'cl1',
            number: 1,
            direction: 'across' as const,
            clue: 'Feline pet',
            answer: 'CAT',
            row: 0,
            col: 0,
        }],
        grid: [['C', 'A', 'T']],
    },
    wordScramble: {
        id: id('wordScramble'),
        title: 'Scramble',
        word: 'HELLO',
        points: 10,
        ...LIVE,
    },
    memoryGrid: {
        id: id('memoryGrid'),
        title: 'Memory',
        points: 10,
        ...LIVE,
        pairs: [
            { id: 'm1', term: 'A', definition: 'Alpha' },
            { id: 'm2', term: 'B', definition: 'Beta' },
        ],
    },
    spinTheWheel: {
        id: id('spinTheWheel'),
        title: 'Spin',
        points: 10,
        ...LIVE,
        segments: [
            { id: 'seg1', label: 'Win', points: 5 },
            { id: 'seg2', label: 'Try', points: 0 },
        ],
    },
    slideTitle: { id: id('slideTitle'), content: 'Slide title', level: 1 },
}

/** Renderers that should show the shared live pre-play screen when mode is live. */
export const LIVE_START_SCREEN_TYPES = new Set<RenderableComponentType>([
    'quiz',
    'multiSelectQuiz',
    'flashcardQuiz',
    'fillInTheBlank',
    'matchingPairs',
    'dragDrop',
    'hotspot',
    'wordCloud',
    'scaleSlider',
    'shortAnswer',
    'trueFalse',
    'categorise',
    'timeline',
    'annotateImage',
    'codeEditor',
    'anagram',
    'hangman',
    'swipeDeck',
    'spectrumSorter',
    'jigsaw',
    'crossword',
    'wordScramble',
    'memoryGrid',
    'spinTheWheel',
    'annotationBoard',
])

export const ALL_RENDERABLE_TYPES = Object.keys(RENDERER_FIXTURES) as RenderableComponentType[]
