# Lesson JSON Authoring Skill

---
description: How to author a complete, valid lesson JSON file that works exactly as if built with the AST Lesson Builder UI.
---

## Overview

The AST Lesson Builder stores lessons as a single self-contained JSON file. This SKILL.md is the authoritative guide for generating a lesson JSON that is **100% compatible** with the builder, the viewer, and the database.

> **IMPORTANT - Official Component Catalog**:
> The following component types are 100% supported, registered, and functional in the builder and viewer:
> - **Content**: `heading`, `paragraph`, `bulletList`, `image`, `table`, `video` (YouTube embed), `callout`, `quote`, `accordion`
> - **Interactive & Gamified**: `quiz`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `hotspot`, `codeEditor`, `poll`, `flashcardQuiz`, `multiSelectQuiz`, `spinTheWheel`, `categorise`, `annotateImage`, `scaleSlider`, `wordCloud`, `memoryGrid`, `trueFalse`, `wordScramble`, `timeline`
> - **Structure**: `slideTitle` (renders as heading)

---

## 1. Top-Level Lesson Object

Every lesson file must be a JSON object with the following shape:

```json
{
  "id": "<uuid or unique string>",
  "title": "Lesson Title",
  "description": "Short lesson summary",
  "author": "Tutor Name",
  "level": "Beginner",
  "duration": 30,
  "slides": [...],
  "settings": {},
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Required Fields

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique lesson identifier. Use UUID or `lesson-<timestamp>` |
| `title` | `string` | Display title of the lesson |
| `slides` | `Slide[]` | Array of slide objects |

### Optional Fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | `string` | `""` | Short summary text |
| `author` | `string` | `"Anonymous"` | Instructor name |
| `level` | `string` | `"Beginner"` | Difficulty label |
| `duration` | `number` | `30` | Estimated minutes to complete |
| `settings` | `object` | `{}` | Extra metadata, free-form |
| `createdAt` | `string` | ISO 8601 | Creation timestamp |
| `updatedAt` | `string` | ISO 8601 | Last modified timestamp |

> **ID Generation Rule**: The builder uses `lesson-<Date.now()>` for new lessons. For manual authoring, use a short UUID (`crypto.randomUUID()`) or a `lesson-<timestamp>` pattern.

---

## 2. Slide Object

A lesson is made of one or more slides. Each slide holds an ordered array of components.

```json
{
  "id": "slide-<timestamp>",
  "title": "Slide Title",
  "status": "uncompleted",
  "state": "active",
  "components": [...]
}
```

### Slide Fields

| Field | Type | Allowed Values | Notes |
|---|---|---|---|
| `id` | `string` | — | Unique: use `slide-<Date.now()>` |
| `title` | `string` | — | Displayed in slide navigator |
| `status` | `"completed" \| "uncompleted"` | `"uncompleted"` at authoring time | Set to `"completed"` only for demo/done slides |
| `state` | `"active" \| "disabled"` | `"active"` | `"disabled"` hides slide from learner |
| `components` | `Component[]` | — | Ordered list of components on this slide |

> **Rule**: Always start with `status: "uncompleted"` and `state: "active"` unless you specifically want to mark a slide as already done.

---

## 3. Component Object

Every item placed on a slide is a component. The shape is:

```json
{
  "id": "<type>-<timestamp>",
  "type": "<ComponentType>",
  "props": { ... },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

### Component Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ | Pattern: `<type>-<Date.now()>` e.g. `quiz-1784983672268` |
| `type` | `ComponentType` | ✅ | See full type list below |
| `props` | `object` | ✅ | Component-specific properties (see per-component spec) |
| `state` | `"active" \| "disabled"` | ⬜ | Default `"active"` |
| `status` | `"completed" \| "uncompleted"` | ⬜ | Default `"uncompleted"` |
| `mode` | `"practice" \| "live"` | ⬜ | Only for interactive/gamified components |
| `timeLimit` | `number` | ⬜ | Time limit in seconds for `live` mode components, placed **inside `props`** |

> **Important**: Interactive components (`quiz`, `dragDrop`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `hotspot`, `flashcardQuiz`, `multiSelectQuiz`, `codeEditor`) have `mode` at **both** the top component level AND inside `props`. Both must be set for correct rendering.
> **`timeLimit` placement**: Always place `timeLimit` inside `props` — NOT at the top component level. Renderers read it from `props`. Example: `"props": { "timeLimit": 45, ... }`.
> **Live Mode Dynamic Timer Rule**: When `mode: "live"`, the system applies a default fallback timer of **10 seconds** if `timeLimit` is omitted. 10s is almost NEVER sufficient for multi-item or text-heavy activities!
> **Mandatory Calculation Formula**: Always calculate `props.timeLimit` dynamically using:
> `timeLimit = Base Setup Time (10-20s) + (Per-Item Time × Item Count)`
> Refer to `skills/curriculum-lesson-generator/SKILL.md` Section 3 for the complete reference matrix (e.g. 3-question quiz = 40s, 2 blanks = 45s, 4 drag items = 50s).

---

## 4. Component Type Reference

### 4.1 Content Components (category: `"content"`)

---

#### `paragraph`
Plain text block.

```json
{
  "id": "paragraph-<ts>",
  "type": "paragraph",
  "props": {
    "content": "Your paragraph text here. Supports <strong>rich text</strong> HTML.",
    "align": "left"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `content` | `string` | Rich text / plain string | `"Enter your text here..."` |
| `align` | `string` | `"left"` `"center"` `"right"` `"justify"` | `"left"` |

---

#### `heading`
Section title.

```json
{
  "id": "heading-<ts>",
  "type": "heading",
  "props": {
    "content": "Section Heading",
    "level": 2,
    "align": "left"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `content` | `string` | Plain string | `"Heading Text"` |
| `level` | `number` | `1` `2` `3` `4` `5` `6` | `2` |
| `align` | `string` | `"left"` `"center"` `"right"` | `"left"` |

---

#### `bulletList`
Ordered or unordered list.

```json
{
  "id": "bulletList-<ts>",
  "type": "bulletList",
  "props": {
    "items": ["Item one", "Item two", "Item three"],
    "type": "unordered"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `items` | `string[]` | Array of strings | `["Item 1", "Item 2", "Item 3"]` |
| `type` | `string` | `"unordered"` `"ordered"` | `"unordered"` |

---

#### `table`
Data in rows and columns.

```json
{
  "id": "table-<ts>",
  "type": "table",
  "props": {
    "rows": 3,
    "columns": 3,
    "data": [
      ["Header 1", "Header 2", "Header 3"],
      ["Row 1 A", "Row 1 B", "Row 1 C"],
      ["Row 2 A", "Row 2 B", "Row 2 C"]
    ]
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Range | Default |
|---|---|---|---|
| `rows` | `number` | 1–10 | `2` |
| `columns` | `number` | 1–10 | `2` |
| `data` | `string[][]` | 2D grid matching rows×columns | `[["Cell 1","Cell 2"],["Cell 3","Cell 4"]]` |

> **Rule**: `data.length` must equal `rows`, and `data[i].length` must equal `columns`.

---

#### `image`
Display an image with an optional educational caption. Essential for visually anchoring scientific concepts, real-world examples, comparison diagrams, and structural schematics.

```json
{
  "id": "image-<ts>",
  "type": "image",
  "props": {
    "src": "/placeholder.svg?height=300&width=600",
    "alt": "Ice cube (Solid), Glass of water (Liquid), Steam from kettle (Gas)",
    "caption": "Water in its three famous states: Solid ice, Liquid water, and Gas steam!",
    "width": "100%"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` (URL) | `/placeholder.svg?height=300&width=400` | Image asset path or URL |
| `alt` | `string` | `"Image description"` | Accessible description for screen readers |
| `caption` | `string` | `""` | Educational takeaway caption rendered directly below the image |
| `width` | `string` | `"100%"` | Display width CSS string |

> **Pedagogical Guideline**: Use `image` whenever introducing physical objects, microscopic particle structures, data charts, or real-world comparison photos.

---

#### `video`
Embed an instructional video or dynamic process demonstration.

```json
{
  "id": "video-<ts>",
  "type": "video",
  "props": {
    "src": "https://example.com/video.mp4",
    "poster": "https://example.com/thumbnail.jpg",
    "caption": "Observe how water molecules move faster as heat energy is added.",
    "controls": true,
    "autoplay": false,
    "loop": false
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | `/placeholder.mp4` | Video file URL or embed link |
| `poster` | `string` | `/placeholder.jpg` | Thumbnail preview image |
| `caption` | `string` | `""` | Instructional video summary |
| `controls` | `boolean` | `true` | Show playback controls |
| `autoplay` | `boolean` | `false` | Auto-start video |
| `loop` | `boolean` | `false` | Loop playback |

---

#### `codeBlock`
Display static code with syntax highlighting.

```json
{
  "id": "codeBlock-<ts>",
  "type": "codeBlock",
  "props": {
    "language": "python",
    "code": "print('Hello, world!')"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `language` | `string` | `"javascript"` `"python"` `"java"` `"csharp"` | `"javascript"` |
| `code` | `string` | Multiline code string | `"// Write your code here\nconsole.log('Hello, world!');"` |

---

#### `quote`
Highlighted quote block.

```json
{
  "id": "quote-<ts>",
  "type": "quote",
  "props": {
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "align": "left"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `text` | `string` | Rich text | `"Insert your quote here..."` |
| `author` | `string` | Plain string | `"Author Name"` |
| `align` | `string` | `"left"` `"center"` `"right"` | `"left"` |

#### `callout`
Highlighted alert box for notes, tips, warnings, and key takeaways.

```json
{
  "id": "callout-<ts>",
  "type": "callout",
  "props": {
    "variant": "note",
    "title": "Important Note",
    "content": "Add key insights, warnings, or tips here..."
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `variant` | `string` | `"note"` `"tip"` `"warning"` `"important"` | `"note"` |
| `title` | `string` | Plain title | `"Important Note"` |
| `content` | `string` | Rich text / plain string | `"Add key insights..."` |

---

#### `accordion`
Collapsible expandable panels for glossaries and FAQ lists.

```json
{
  "id": "accordion-<ts>",
  "type": "accordion",
  "props": {
    "title": "Key Definitions",
    "items": [
      { "id": "acc-1", "title": "What is this concept?", "content": "Detailed explanation goes here.", "audioUrl": "" },
      { "id": "acc-2", "title": "Why is it important?", "content": "Key significance and context.", "audioUrl": "" }
    ],
    "allowMultiple": false
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `title` | `string` | Section header | `"Key Definitions"` |
| `items` | `AccordionItem[]` | Array of items | Min 1 item |
| `allowMultiple` | `boolean` | `true` `false` | `false` |

---

### 4.2 Interactive Components (category: `"interactive"`)

> **Mode Rule**: All interactive components understand two modes:
> - `"practice"` — Learner can attempt freely, retries are allowed, no scoring pressure.
> - `"live"` — Submission is scored and tracked. Used in assessments.

---


#### `quiz`
Multiple-choice questions.

```json
{
  "id": "quiz-<ts>",
  "type": "quiz",
  "props": {
    "questions": [
      {
        "id": "q1",
        "question": "What is 2 + 2?",
        "options": [
          { "id": "1", "text": "3", "isCorrect": false },
          { "id": "2", "text": "4", "isCorrect": true },
          { "id": "3", "text": "5", "isCorrect": false }
        ],
        "explanation": "2 + 2 equals 4."
      }
    ],
    "showExplanation": true,
    "shuffleOptions": true,
    "randomizeAnswers": true,
    "points": 10,
    "mode": "live",
    "state": "active",
    "status": "uncompleted"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "live"
}
```

| Prop | Type | Notes |
|---|---|---|
| `questions` | `Question[]` | At least 1 required |
| `showExplanation` | `boolean` | Show explanation text after answer |
| `shuffleOptions` / `randomizeAnswers` | `boolean` | Randomise option order for students (Default: `true`) |
| `points` | `number` (0–100) | Points per correctly answered question |
| `mode` | `"practice" \| "live"` | Default `"practice"` |
| `state` | `"active" \| "disabled"` | |
| `status` | `"completed" \| "uncompleted"` | |
| `timeLimit` | `number` (5–300) | Optional. Seconds per question |

**Question object:**
```json
{
  "id": "q<index>",
  "question": "Question text",
  "options": [
    { "id": "opt-<ts>-1", "text": "Option A", "isCorrect": false },
    { "id": "opt-<ts>-2", "text": "Option B", "isCorrect": true }
  ],
  "explanation": "Optional explanation shown after answering"
}
```

> **Rule**: Exactly one `option.isCorrect` must be `true`. Minimum 2 options. Question IDs use `q<N>` for manual authoring or `q<timestamp>` from the builder.

---

#### `flashcards`
Two-sided study cards with flip animation.

```json
{
  "id": "flashcards-<ts>",
  "type": "flashcards",
  "props": {
    "title": "Vocabulary Review",
    "cards": [
      { "id": "1", "front": "Photosynthesis", "back": "The process plants use to convert sunlight to energy" },
      { "id": "2", "front": "Mitosis", "back": "Cell division producing two identical daughter cells" }
    ],
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"Flashcards"` |
| `cards` | `Card[]` | Minimum 1 card |
| `mode` | `"practice" \| "live"` | `"practice"` |
| `state` | `"active" \| "disabled"` | `"active"` |

**Card object:**
```json
{ "id": "card-<ts>", "front": "Term or question", "back": "Definition or answer" }
```

---

#### `dragDrop`
Drag items into correct position order.

```json
{
  "id": "dragDrop-<ts>",
  "type": "dragDrop",
  "props": {
    "title": "Arrange these steps in order",
    "items": [
      { "id": "1", "text": "Open the file", "correctIndex": 0 },
      { "id": "2", "text": "Edit the content", "correctIndex": 1 },
      { "id": "3", "text": "Save and close", "correctIndex": 2 }
    ],
    "shuffled": true,
    "points": 15,
    "mode": "live",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "live"
}
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Instruction shown above the drag area |
| `items` | `DragItem[]` | Minimum 2 items |
| `shuffled` | `boolean` | Present items in randomised order |
| `points` | `number` (0–100) | Points awarded for correct full ordering |
| `mode` | `"practice" \| "live"` | |
| `state` | `"active" \| "disabled"` | |
| `timeLimit` | `number` (5–300) | Optional |

**DragItem object:**
```json
{ "id": "1", "text": "Item label", "correctIndex": 0 }
```
> **Rule**: `correctIndex` is zero-based. Every item must have a unique `correctIndex` forming a complete sequential ordering (0, 1, 2, …).

---

#### `matchingPairs`
Match left-column items to right-column items.

```json
{
  "id": "matchingPairs-<ts>",
  "type": "matchingPairs",
  "props": {
    "title": "Match each term to its definition",
    "pairs": [
      { "id": "1", "left": "HTML", "right": "Structure of a webpage" },
      { "id": "2", "left": "CSS", "right": "Styling of a webpage" },
      { "id": "3", "left": "JavaScript", "right": "Behaviour of a webpage" }
    ],
    "shuffled": true,
    "points": 15,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Instruction prompt |
| `pairs` | `Pair[]` | Minimum 2 pairs |
| `shuffled` | `boolean` | Shuffle right-column options |
| `points` | `number` (0–100) | |
| `mode` | `"practice" \| "live"` | |
| `state` | `"active" \| "disabled"` | |

**Pair object:**
```json
{ "id": "1", "left": "Left term", "right": "Right match" }
```

---

#### `fillInTheBlank`
Complete missing words in a sentence.

```json
{
  "id": "fillInTheBlank-<ts>",
  "type": "fillInTheBlank",
  "props": {
    "title": "Fill in the missing words",
    "text": "The powerhouse of the cell is the {{blank}} and DNA is found in the {{blank}}.",
    "blanks": [
      { "id": "b1", "answer": "mitochondria", "alternatives": ["Mitochondria"] },
      { "id": "b2", "answer": "nucleus", "alternatives": ["Nucleus"] }
    ],
    "caseSensitive": false,
    "points": 10,
    "mode": "live",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "live"
}
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Instruction above the text |
| `text` | `string` | Sentence with `{{blank}}` markers. Each `{{blank}}` = one blank field in order |
| `blanks` | `Blank[]` | Must have same count as `{{blank}}` occurrences |
| `caseSensitive` | `boolean` | Whether answers are case-sensitive |
| `points` | `number` (0–100) | Per blank |
| `mode` | `"practice" \| "live"` | |
| `state` | `"active" \| "disabled"` | |

**Blank object:**
```json
{ "id": "b1", "answer": "correct answer", "alternatives": ["also correct", "another variant"] }
```
> **Critical Rule**: The number of `{{blank}}` tokens in `text` MUST exactly match `blanks.length`. The blanks are resolved sequentially left-to-right.

---

#### `codeEditor`
Interactive coding sandbox with test cases.

```json
{
  "id": "codeEditor-<ts>",
  "type": "codeEditor",
  "props": {
    "title": "Write a function to add two numbers",
    "initialCode": "function add(a, b) {\n  // Your code here\n}",
    "language": "javascript",
    "readOnly": false,
    "testCases": [
      { "id": "test1", "input": "", "expectedOutput": "5" }
    ],
    "points": 10,
    "mode": "live",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "live"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `title` | `string` | | `"Code Editor"` |
| `initialCode` | `string` | Multiline code | Starter template |
| `language` | `string` | `"javascript"` `"python"` `"java"` `"csharp"` | `"javascript"` |
| `readOnly` | `boolean` | | `false` |
| `testCases` | `TestCase[]` | | 1 default test |
| `points` | `number` (0–100) | | `10` |
| `mode` | `"practice" \| "live"` | | `"practice"` |
| `state` | `"active" \| "disabled"` | | `"active"` |

**TestCase object:**
```json
{ "id": "test1", "input": "optional stdin", "expectedOutput": "expected stdout" }
```

---

#### `hotspot`
Interactive visual diagram with clickable target regions. Supports both free-play inspection ("explore") and target-finding challenge ("discover") with optional decoy pins and tutor marking.

```json
{
  "id": "hotspot-<ts>",
  "type": "hotspot",
  "props": {
    "title": "Interactive Scene: Find all real Matter!",
    "image": "/placeholder.svg?height=400&width=600",
    "hotspots": [
      {
        "id": "hs1",
        "x": 0.2,
        "y": 0.3,
        "label": "Sunlight ☀️",
        "content": "NOT MATTER! Light is energy with no mass.",
        "isCorrect": false
      },
      {
        "id": "hs2",
        "x": 0.5,
        "y": 0.5,
        "label": "Wooden Desk 🪵",
        "content": "MATTER! Wood has mass and takes up volume.",
        "isCorrect": true
      }
    ],
    "behavior": "discover",
    "markingMode": "self-mark",
    "maxClicks": 5,
    "showNumbers": false,
    "points": 10,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Allowed Values | Default / Notes |
|---|---|---|---|
| `title` | `string` | Plain string | Header prompt |
| `image` | `string` (URL) | URL | Background diagram image asset |
| `hotspots` | `HotspotNode[]` | Minimum 1 target | Array of target pin objects |
| `behavior` | `string` | `"explore"` `"discover"` | `explore` = info popups; `discover` = scored click targets |
| `markingMode` | `string` | `"self-mark"` `"tutor-mark"` | Default `"self-mark"` |
| `maxClicks` | `number` | 1–50 | Maximum clicks allowed in discover mode |
| `showNumbers` | `boolean` | `true` `false` | Show numeric pin labels |
| `points` | `number` | 0–100 | Points awarded in discover mode |
| `mode` | `"practice" \| "live"` | | |
| `state` | `"active" \| "disabled"` | | |

**HotspotNode object:**
```json
{
  "id": "hs1",
  "x": 0.2,
  "y": 0.3,
  "label": "Pin Title Label",
  "content": "Explanation popup content",
  "isCorrect": true
}
```
> **Rules**:
> - `x` and `y` are decimal relative coordinates (`0.0`–`1.0`) relative to image dimensions.
> - `isCorrect`: Set `true` for correct targets, `false` for decoy pins in discover mode.

---

#### `trueFalse`
Rapid-fire binary True/False statement challenge.

```json
{
  "id": "trueFalse-<ts>",
  "type": "trueFalse",
  "props": {
    "statement": "The Earth revolves around the sun.",
    "isTrue": true,
    "explanation": "Earth takes 365.25 days to complete an orbit around the Sun.",
    "points": 10,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Allowed Values | Notes |
|---|---|---|---|
| `statement` | `string` | Plain question string | Main statement prompt |
| `isTrue` | `boolean` | `true` `false` | Correct answer |
| `explanation` | `string` | Plain string | Explanation shown after submit |
| `points` | `number` | 0–100 | Default `10` |

---

#### `shortAnswer`
Open-ended text response with keyword auto-grading or tutor manual review.

```json
{
  "id": "shortAnswer-<ts>",
  "type": "shortAnswer",
  "props": {
    "title": "Open Response",
    "question": "Explain why ecosystems depend on primary producers:",
    "placeholder": "Write your answer here...",
    "correctKeywords": ["energy", "photosynthesis", "food chain"],
    "markingMode": "self-mark",
    "points": 10,
    "mode": "practice",
    "state": "active",
    "timeLimit": 30
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Allowed Values | Notes |
|---|---|---|---|
| `question` | `string` | Plain prompt text | Question prompt |
| `placeholder` | `string` | Plain string | Textarea placeholder |
| `correctKeywords` | `string[]` | Array of strings | Keywords checked in self-mark mode |
| `markingMode` | `string` | `"self-mark"` `"tutor-mark"` | `self-mark` checks keywords; `tutor-mark` holds for review |
| `points` | `number` | 0–100 | Default `10` |

---

#### `annotateImage`
Diagram labeling challenge — place target text badges onto diagram image coordinates.

```json
{
  "id": "annotateImage-<ts>",
  "type": "annotateImage",
  "props": {
    "title": "Label the Cell Diagram",
    "image": "/placeholder.svg?height=400&width=600",
    "labels": [
      { "id": "l1", "text": "Nucleus", "x": 0.5, "y": 0.4 },
      { "id": "l2", "text": "Mitochondria", "x": 0.2, "y": 0.7 }
    ],
    "points": 15,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Activity title |
| `image` | `string` (URL) | Diagram image asset URL |
| `labels` | `LabelNode[]` | Target label text and relative `x`, `y` coordinates (`0.0`–`1.0`) |
| `points` | `number` | Total points for full diagram accuracy |

---

#### `categorise`
Sort items into matching bucket categories or columns.

```json
{
  "id": "categorise-<ts>",
  "type": "categorise",
  "props": {
    "title": "Categorise Energy Sources",
    "categories": [
      { "id": "c1", "title": "Renewable Energy" },
      { "id": "c2", "title": "Non-Renewable Energy" }
    ],
    "items": [
      { "id": "i1", "text": "Solar Power", "categoryId": "c1" },
      { "id": "i2", "text": "Coal", "categoryId": "c2" },
      { "id": "i3", "text": "Wind Turbines", "categoryId": "c1" }
    ],
    "points": 20,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Notes |
|---|---|---|
| `categories` | `Category[]` | Bucket headers (`id`, `title`) |
| `items` | `Item[]` | Items to place (`id`, `text`, `categoryId` target match) |
| `points` | `number` | Total points for categorisation |

---

#### `timeline`
Chronological event ordering line.

```json
{
  "id": "timeline-<ts>",
  "type": "timeline",
  "props": {
    "title": "Historical Timeline",
    "events": [
      { "id": "e1", "year": "1969", "title": "Moon Landing", "description": "Apollo 11 touches down." },
      { "id": "e2", "year": "1989", "title": "World Wide Web", "description": "Tim Berners-Lee proposes WWW." }
    ],
    "interactive": true,
    "points": 15
  },
  "state": "active",
  "status": "uncompleted"
}
```

---

#### `wordScramble`
Tap tile puzzle to unscramble target word.

```json
{
  "id": "wordScramble-<ts>",
  "type": "wordScramble",
  "props": {
    "title": "Unscramble the Word",
    "word": "PHOTOSYNTHESIS",
    "hint": "Process plants use to make food",
    "points": 15,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

---

#### `memoryGrid`
Concentration memory matching game.

```json
{
  "id": "memoryGrid-<ts>",
  "type": "memoryGrid",
  "props": {
    "title": "Memory Card Pairs",
    "pairs": [
      { "id": "p1", "term": "Photosynthesis", "definition": "Plants convert light to energy" },
      { "id": "p2", "term": "Respiration", "definition": "Cells release energy from glucose" }
    ],
    "points": 20,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

---

#### `wordCloud`
Interactive live word submission cloud.

```json
{
  "id": "wordCloud-<ts>",
  "type": "wordCloud",
  "props": {
    "title": "Live Word Cloud",
    "question": "Type key terms related to today's topic:",
    "placeholder": "Type a word...",
    "maxWords": 30,
    "points": 10,
    "mode": "practice",
    "state": "active",
    "timeLimit": 20
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

---

#### `scaleSlider`
Opinion spectrum / confidence slider component.

```json
{
  "id": "scaleSlider-<ts>",
  "type": "scaleSlider",
  "props": {
    "title": "Opinion Spectrum",
    "prompt": "Rate your confidence level:",
    "minLabel": "Strongly Disagree",
    "maxLabel": "Strongly Agree",
    "min": 1,
    "max": 10,
    "step": 1,
    "defaultValue": 5,
    "points": 10,
    "mode": "practice",
    "state": "active",
    "timeLimit": 15
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

---

#### `spinTheWheel`
Gamified spinning wheel quiz engine.

```json
{
  "id": "spinTheWheel-<ts>",
  "type": "spinTheWheel",
  "props": {
    "title": "Spin the Wheel Quiz",
    "requiredSpins": 3,
    "points": 20,
    "mode": "practice",
    "state": "active",
    "questions": [
      {
        "id": "wq1",
        "question": "What state of matter is steam?",
        "options": ["Solid", "Liquid", "Gas"],
        "correctAnswer": 2,
        "explanation": "Steam is water vapor in gas state."
      }
    ]
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

---


#### `poll`
Opinion poll — students pick one option and see live percentage bars. **No live/practice mode distinction** — polls are always open voting.

```json
{
  "id": "poll-<ts>",
  "type": "poll",
  "props": {
    "question": "Which state of matter has a fixed shape and volume?",
    "options": [
      { "id": "opt1", "text": "Solid" },
      { "id": "opt2", "text": "Liquid" },
      { "id": "opt3", "text": "Gas" },
      { "id": "opt4", "text": "Plasma" }
    ],
    "points": 5,
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Notes |
|---|---|---|
| `question` | `string` | Max 120 chars |
| `options` | `PollOption[]` | 2–6 options |
| `points` | `number` | Participation points (not scored) |
| `state` | `"active" \| "disabled"` | |

**PollOption object:**
```json
{ "id": "opt1", "text": "Option label" }
```
> **Rule**: Option text max 60 chars. Minimum 2, maximum 6 options. No `isCorrect` field — polls have no right answer.

---

#### `flashcardQuiz`
Multi-question quiz using flip-card mechanics. The main question card flips to reveal the question, then 4 answer option cards flip in sequentially. Student picks one.

```json
{
  "id": "flashcardQuiz-<ts>",
  "type": "flashcardQuiz",
  "props": {
    "questions": [
      {
        "id": "fq1",
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correctAnswer": 0,
        "explanation": "Paris is the capital and largest city of France."
      },
      {
        "id": "fq2",
        "question": "What is 7 × 8?",
        "options": ["54", "56", "63", "64"],
        "correctAnswer": 1
      }
    ],
    "points": 20,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Notes |
|---|---|---|
| `questions` | `FlashcardQuestion[]` | At least 1 required |
| `points` | `number` (0–100) | Total divided equally across questions |
| `timeLimit` | `number` | Seconds for live mode timer. Default 15s |
| `mode` | `"practice" \| "live"` | Live shows start screen + countdown timer |
| `state` | `"active" \| "disabled"` | |

**FlashcardQuestion object:**
```json
{
  "id": "fq<N>",
  "question": "Question text (max 120 chars)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Optional explanation shown after answering"
}
```
> **Rules**:
> - `options` is an array of plain strings (not objects). Min 2, max 4 options. Max 50 chars each.
> - `correctAnswer` is the **zero-based index** of the correct option in the `options` array.
> - `id` must be unique per question. Use `fq<N>` or `fq<timestamp>`.

---

#### `multiSelectQuiz`
Quiz where students select ALL correct answers from a 2×2 coloured card grid. Supports partial scoring.

```json
{
  "id": "multiSelectQuiz-<ts>",
  "type": "multiSelectQuiz",
  "props": {
    "title": "Select All That Apply",
    "questions": [
      {
        "id": "msq1",
        "question": "Which of the following are mammals?",
        "options": [
          { "id": "a", "text": "Dog", "isCorrect": true, "color": "bg-violet-500" },
          { "id": "b", "text": "Eagle", "isCorrect": false, "color": "bg-amber-500" },
          { "id": "c", "text": "Whale", "isCorrect": true, "color": "bg-sky-500" },
          { "id": "d", "text": "Salmon", "isCorrect": false, "color": "bg-rose-500" }
        ],
        "explanation": "Dogs and whales are mammals. Eagles and salmon are not."
      }
    ],
    "points": 15,
    "mode": "practice",
    "state": "active"
  },
  "state": "active",
  "status": "uncompleted",
  "mode": "practice"
}
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Header displayed above the component |
| `questions` | `MultiSelectQuestion[]` | At least 1 required |
| `points` | `number` (0–100) | Total, divided across questions; partial credit per question |
| `timeLimit` | `number` | Seconds for live mode timer. Default 15s |
| `mode` | `"practice" \| "live"` | Live shows start screen + countdown timer |
| `state` | `"active" \| "disabled"` | |

**MultiSelectQuestion object:**
```json
{
  "id": "msq<N>",
  "question": "Question text (max 120 chars)",
  "options": [
    { "id": "a", "text": "Option text (max 50 chars)", "isCorrect": true, "color": "bg-violet-500" },
    { "id": "b", "text": "Option text", "isCorrect": false, "color": "bg-amber-500" },
    { "id": "c", "text": "Option text", "isCorrect": false, "color": "bg-sky-500" },
    { "id": "d", "text": "Option text", "isCorrect": false, "color": "bg-rose-500" }
  ],
  "explanation": "Optional explanation shown after submit"
}
```

**Fixed colour palette** (assigned by position — always use in this order):

| Pos | `color` value |
|---|---|
| 0 | `"bg-violet-500"` |
| 1 | `"bg-amber-500"` |
| 2 | `"bg-sky-500"` |
| 3 | `"bg-rose-500"` |

> **Rules**:
> - Min 2, max 4 options per question.
> - At least 1 option must have `isCorrect: true`.
> - Option text max 50 chars.
> - `color` must follow the fixed palette above (matching position index).
> - Scoring: perfect answer (all correct, none wrong) = full points per question; partial = proportional; wrong picks reduce score.

---

### 4.3 Structure Components (category: `"structure"`)

---

#### `slideTitle`
Decorative full-width slide title.

```json
{
  "id": "slideTitle-<ts>",
  "type": "slideTitle",
  "props": {
    "content": "Module 1: Introduction",
    "align": "center",
    "color": "black",
    "backgroundColor": "transparent"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Allowed Values | Default |
|---|---|---|---|
| `content` | `string` | | `"Slide Title"` |
| `align` | `string` | `"left"` `"center"` `"right"` | `"center"` |
| `color` | `string` | CSS color string | `"black"` |
| `backgroundColor` | `string` | CSS color string | `"transparent"` |

---

#### `lessonIntro`
Introduction block with optional video/image.

```json
{
  "id": "lessonIntro-<ts>",
  "type": "lessonIntro",
  "props": {
    "title": "Welcome to Python for Beginners",
    "content": "In this lesson you will learn the fundamentals of Python programming.",
    "video": "",
    "image": ""
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"Welcome to the Lesson"` |
| `content` | `string` | Rich text intro paragraph |
| `video` | `string` | URL or `""` to omit |
| `image` | `string` | URL or `""` to omit |

---

#### `lessonSummary`
Recap block with key points list.

```json
{
  "id": "lessonSummary-<ts>",
  "type": "lessonSummary",
  "props": {
    "title": "What We Learned",
    "content": "Great work completing the lesson!",
    "showKeyPoints": true,
    "keyPoints": [
      "Variables store data values",
      "Python uses indentation for blocks",
      "Functions are defined with `def`"
    ]
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"Lesson Summary"` |
| `content` | `string` | Rich text |
| `showKeyPoints` | `boolean` | `true` |
| `keyPoints` | `string[]` | Array of takeaway strings |

---

#### `lessonComplete`
Final celebratory screen at the end.

```json
{
  "id": "lessonComplete-<ts>",
  "type": "lessonComplete",
  "props": {
    "title": "Congratulations!",
    "content": "You've completed this lesson. Well done!",
    "showReplayButton": true,
    "showNextLessonButton": true
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"Congratulations!"` |
| `content` | `string` | Completion message |
| `showReplayButton` | `boolean` | `true` |
| `showNextLessonButton` | `boolean` | `true` |

---

## 5. ID Generation Rules

| Object | Pattern | Example |
|---|---|---|
| Lesson | `lesson-<Date.now()>` or UUID | `lesson-1784983347000` |
| Slide | `slide-<Date.now()>` | `slide-1784983347920` |
| Component | `<type>-<Date.now()>` | `quiz-1784983672268` |
| Question | `q<N>` or `q<Date.now()>` | `q1`, `q1784983682563` |
| Option | `opt-<qTimestamp>-<N>` | `opt-1784983682563-1` |
| Card | `card-<Date.now()>` or `"1"`, `"2"` | `card-1784983603211` |
| Blank | `b<N>` | `b1`, `b2` |
| Hotspot | `"1"`, `"2"` or `hs-<N>` | `"1"` |
| Drag Item | `"1"`, `"2"` | `"1"` |
| Pair | `"1"`, `"2"` | `"1"` |

> **Rule**: IDs must be **unique within the lesson**. Never reuse the same ID across different objects.

---

## 6. Minimal Valid Lesson Template

Use this as a starting point for generating any new lesson:

```json
{
  "id": "lesson-1784983347000",
  "title": "My Lesson Title",
  "description": "What this lesson is about",
  "author": "Instructor Name",
  "level": "Beginner",
  "duration": 30,
  "slides": [
    {
      "id": "slide-1784983347001",
      "title": "Introduction",
      "status": "uncompleted",
      "state": "active",
      "components": [
        {
          "id": "heading-1784983347002",
          "type": "heading",
          "props": {
            "content": "Welcome",
            "level": 1,
            "align": "center"
          },
          "state": "active",
          "status": "uncompleted"
        },
        {
          "id": "paragraph-1784983347003",
          "type": "paragraph",
          "props": {
            "content": "Lesson introduction goes here.",
            "align": "left"
          },
          "state": "active",
          "status": "uncompleted"
        }
      ]
    }
  ],
  "settings": {
    "duration": 30,
    "level": "Beginner"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 7. Common Authoring Patterns

### Pattern A — Content-only slide (explanatory)
Use `heading + paragraph + bulletList + image` in sequence.

### Pattern B — Concept check slide
Use `heading + paragraph` then follow with `quiz` in `"live"` mode.

### Pattern C — Flashcard vocabulary review
Single `flashcards` component per slide, `mode: "practice"`.

### Pattern D — Ordering activity
`heading` + `dragDrop` in `"live"` mode. Ensure `correctIndex` values are 0-based and sequential.

### Pattern E — Code challenge
Use `codeBlock` (shows reference code) + `codeEditor` (learner writes solution).

### Pattern F — Final assessment slide
Multiple `quiz` components on one slide, all `mode: "live"`, `showExplanation: true`.

### Pattern G — Gamified flashcard quiz
Single `flashcardQuiz` per slide in `"live"` mode. Set `"timeLimit": 30` for sufficient reading time.

### Pattern H — Select-all knowledge check
Single `multiSelectQuiz` per slide in `"practice"` or `"live"` mode. Ensure at least 1 option has `isCorrect: true` per question and colour palette follows positional order.

### Pattern I — Class opinion poll
Single `poll` component, no `mode` field. Use for warm-ups, class surveys, or exit tickets. Set `points` for participation credit.

---

## 8. Validation Checklist

Before submitting a lesson JSON for loading:

- [ ] `id` is unique and non-empty
- [ ] `slides` array has at least 1 slide
- [ ] Every slide has a unique `id`
- [ ] Every component has a unique `id`
- [ ] Only implemented component types are used — no unknown types outside the registered catalog
- [ ] Each `quiz` has at least 1 question with exactly 1 `isCorrect: true` option
- [ ] Each `multiSelectQuiz` question has at least 1 `isCorrect: true` option and uses the fixed colour palette in positional order
- [ ] `flashcardQuiz` questions use `correctAnswer` as a zero-based index, not an ID
- [ ] `poll` options have no `isCorrect` field — polls are unscored
- [ ] `fillInTheBlank` has `{{blank}}` count matching `blanks.length`
- [ ] `dragDrop` items have `correctIndex` values forming 0-based sequence with no gaps
- [ ] `hotspot.x` and `hotspot.y` are decimal numbers between 0.0 and 1.0
- [ ] Interactive components (`quiz`, `dragDrop`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `hotspot`, `flashcardQuiz`, `multiSelectQuiz`, `shortAnswer`, `annotateImage`, `categorise`, `timeline`, `wordScramble`, `memoryGrid`, `wordCloud`, `scaleSlider`, `spinTheWheel`, `trueFalse`) have `mode` set at **both** component root AND inside `props`
- [ ] `poll` does NOT have a `mode` field — it is always open voting
- [ ] Live mode activities set explicit `"timeLimit"` in `props` if default timer is insufficient
- [ ] All IDs within lesson are globally unique (no duplicates across slides or components)

---

## 9. Complete Component Type Registry

| Type | Category | Mode | Scored | Live Timer |
|---|---|---|---|---|
| `paragraph` | content | — | ✗ | ✗ |
| `heading` | content | — | ✗ | ✗ |
| `bulletList` | content | — | ✗ | ✗ |
| `image` | content | — | ✗ | ✗ |
| `table` | content | — | ✗ | ✗ |
| `video` | content | — | ✗ | ✗ |
| `callout` | content | — | ✗ | ✗ |
| `quote` | content | — | ✗ | ✗ |
| `accordion` | content | — | ✗ | ✗ |
| `slideTitle` | content | — | ✗ | ✗ |
| `quiz` | interactive | practice/live | ✅ | ✅ |
| `shortAnswer` | interactive | practice/live | ✅ (self/tutor) | ✅ |
| `flashcards` | interactive | practice/live | ✗ | ✗ |
| `fillInTheBlank` | interactive | practice/live | ✅ | ✅ |
| `matchingPairs` | interactive | practice/live | ✅ | ✅ |
| `dragDrop` | interactive | practice/live | ✅ | ✅ |
| `hotspot` | interactive | practice/live | ✅ | ✅ |
| `codeEditor` | interactive | practice/live | ✅ | ✗ |
| `poll` | interactive | — | participation only | ✗ |
| `flashcardQuiz` | interactive | practice/live | ✅ | ✅ |
| `multiSelectQuiz` | interactive | practice/live | ✅ | ✅ |
| `spinTheWheel` | interactive | practice/live | ✅ | ✅ |
| `categorise` | interactive | practice/live | ✅ | ✅ |
| `annotateImage` | interactive | practice/live | ✅ | ✅ |
| `scaleSlider` | interactive | practice/live | ✅ | ✗ |
| `wordCloud` | interactive | practice/live | ✗ | ✗ |
| `memoryGrid` | interactive | practice/live | ✅ | ✅ |
| `trueFalse` | interactive | practice/live | ✅ | ✅ |
| `wordScramble` | interactive | practice/live | ✅ | ✅ |
| `timeline` | interactive | practice/live | ✅ | ✅ |

