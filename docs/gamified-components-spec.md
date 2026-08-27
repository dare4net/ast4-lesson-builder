# Gamified Interactive Components — Specification

All components follow the universal **ScoredRenderer** baseline: input locking, state persistence, tutor marking, retry workflow, and full-canvas responsive layout (`px-6 sm:px-10 md:px-12`) with dark mode support.

---

## 1. Anagram Engine (`anagram-renderer.tsx`)

Students rearrange scrambled letter tiles to form the correct target word or phrase.

**Key UI/UX:**
- 3D tactile letter tiles (tap-to-place into answer slots)
- Shuffled source tile pool with optional distractor letters
- Clue modes: text, image, or definition reveal
- Optional hint: "Reveal 1 Letter" (deducts points), "Shuffle Tiles"
- Optional countdown timer

**Schema:**
```typescript
interface AnagramComponent {
  type: "anagram"
  title: string
  targetWord: string           // e.g. "PHOTOSYNTHESIS"
  clue?: string
  imageUrl?: string
  allowDistractors?: boolean
  distractorLetters?: string[]
  maxRevealsAllowed?: number
  timeLimit?: number           // seconds
  points: number
}
```

---

## 2. Hangman / Word Quest (`hangman-renderer.tsx`)

Students guess letters one at a time to reveal a hidden vocabulary term before running out of attempts.

**Key UI/UX:**
- 3D tactile A–Z virtual keyboard
  - Correct guesses: Duolingo green (`#58CC02`)
  - Wrong guesses: rose/grey + disabled
- Blank reveal slots (one per letter)
- Category badge + optional clue/definition at top
- Configurable max attempts (5–10)
- Visual themes: `classic` | `spaceship` | `castle`

**Schema:**
```typescript
interface HangmanComponent {
  type: "hangman"
  title: string
  secretWord: string           // e.g. "MITOCHONDRIA"
  category: string             // e.g. "Cell Biology"
  clue?: string
  maxAttempts: number          // 6 recommended
  theme?: "classic" | "spaceship" | "castle"
  points: number
}
```

---

## 3. Multi-Word & Sentence Rearrange (Upgrade to `word-scramble-renderer.tsx`)

Extends the existing word scramble to 3 selectable modes.

**Modes:**
1. **Single Word** (legacy): Rearrange individual letters → one word
2. **Multi-Word Phrase**: Rearrange letters across multiple word slots (e.g. "GLOBAL WARMING")
3. **Sentence Builder**: Arrange whole word chips into a grammatically correct sentence; supports distractor word chips and auto-punctuation snapping

**Schema addition:**
```typescript
interface SentenceRearrangeComponent extends WordScrambleComponent {
  mode: "single-word" | "multi-word" | "sentence"
  distractors?: string[]       // Extra decoy word chips for sentence mode
}
```

---

## 4. Swipe Deck (`swipe-deck-renderer.tsx`)

A generic binary-decision card deck. Students sort cards into two customisable categories.

**Key UI/UX:**
- Stacked 3D card deck with smooth drag or button-press categorisation
- Teacher defines both labels (e.g. Myth/Fact, Acid/Base, Always/Never, Option A/Option B)
- Dual controls: drag left/right OR two 3D tactile buttons at the bottom
- Card flip on placement: reveals explanation/rationale on the back
- End-of-deck score summary

**Schema:**
```typescript
interface SwipeDeckComponent {
  type: "swipe-deck"
  title: string
  leftLabel: string            // e.g. "Myth"
  rightLabel: string           // e.g. "Fact"
  cards: {
    id: string
    front: string              // Statement / term / image URL
    explanation?: string       // Shown on card back after decision
    correctSide: "left" | "right"
  }[]
  points: number
}
```

---

## 5. Mini Crossword Puzzle (`crossword-renderer.tsx`)

An auto-generated 4×4 or 5×5 interactive crossword built from 3–6 key terms and their clues.

**Key UI/UX:**
- Numbered grid cells with tap-to-focus + keyboard input
- Clue list panel: **Across** / **Down** with active word highlight
- "Check Word" and "Reveal Cell" hint buttons (configurable, deducts points)
- Correct cells lock green; incorrect cells shake red

**Schema:**
```typescript
interface CrosswordWord {
  id: string
  word: string
  clue: string
  direction: "across" | "down"
  row: number
  col: number
}

interface CrosswordComponent {
  type: "crossword"
  title: string
  gridSize: { rows: number; cols: number }
  words: CrosswordWord[]
  allowHints?: boolean
  points: number
}
```

---

## 6. Spectrum & Scale Sorter (`spectrum-sorter-renderer.tsx`)

Students place items along a continuous horizontal spectrum or numerical scale.

**Use cases:** pH scale, historical timeline, risk levels, temperature, geological time.

**Key UI/UX:**
- Gradient axis track with custom left/right pole labels
- Optional tick marks and scale numbers
- 3D tactile draggable chips that snap to positions
- Tolerance margin per item (e.g. ±5%)
- Position accuracy feedback after submission

**Schema:**
```typescript
interface SpectrumItem {
  id: string
  label: string
  correctPosition: number      // 0–100 percent along the scale
  tolerance?: number           // Percentage margin, default 5
  explanation?: string
}

interface SpectrumSorterComponent {
  type: "spectrum-sorter"
  title: string
  leftLabel: string            // e.g. "Acidic (pH 0)"
  rightLabel: string           // e.g. "Alkaline (pH 14)"
  scaleMin?: number
  scaleMax?: number
  showScale?: boolean
  items: SpectrumItem[]
  points: number
}
```

---

## 7. Jigsaw Diagram Puzzle (`jigsaw-renderer.tsx`)

Students assemble shuffled image tiles into a completed diagram or map.

**Key UI/UX:**
- Grid sizes: 2×2 (4 tiles), 3×3 (9 tiles), or 4×4 (16 tiles)
- Tiles are shuffled and displayed in a source pool
- Drag tile to correct grid position; snap-to-grid feedback
- Optional: unlock annotated hotspots on full completion
- Progress indicator showing tiles correctly placed

**Schema:**
```typescript
interface JigsawComponent {
  type: "jigsaw"
  title: string
  image: string                // Source image URL (sliced by the renderer)
  gridSize: 2 | 3 | 4         // Rows & cols (always square)
  hotspots?: {                 // Optional hotspots unlocked on completion
    label: string
    x: number                  // Percentage position
    y: number
    content: string
  }[]
  points: number
}
```

---

## 8. Annotation Board (`annotation-renderer.tsx`)

Students tag/highlight regions of a text passage, sentence, or code snippet with teacher-defined labels.

**Flexible across subjects:**
- Grammar: tag Subject / Object / Predicate / Complement
- Clause analysis: tag Main Clause / Subordinate Clause / Connective
- Literary analysis: tag Simile / Metaphor / Evidence / Technique
- Programming syntax: tag Loop Variable / Condition / Loop Body / Function Call
- Any label taxonomy the teacher defines

**Key UI/UX:**
- Selectable unit: `word` | `phrase` | `sentence`
- Student clicks a label chip first, then selects text unit(s) to tag it
- Tagged regions render as coloured highlight chips inline with the text
- Tap a tagged region to remove or change its label
- After submission: correct tags highlight green, incorrect tags highlight red

**Schema:**
```typescript
interface AnnotationToken {
  id: string
  text: string                 // The word/phrase/sentence
  correctLabel?: string        // Expected label id (omit for unlabelled sections)
}

interface AnnotationLabel {
  id: string
  text: string                 // e.g. "Subject", "Main Clause", "Condition"
  color?: string               // Optional accent colour for the chip
}

interface AnnotationBoardComponent {
  type: "annotation-board"
  title: string
  instruction?: string         // e.g. "Tag each part of the sentence with its grammatical role."
  content: AnnotationToken[]   // Pre-tokenised content units
  labels: AnnotationLabel[]    // Teacher-defined label taxonomy
  selectableUnit: "word" | "phrase" | "sentence"
  allowMultiLabel?: boolean     // Can one token have multiple labels?
  points: number
}
```
