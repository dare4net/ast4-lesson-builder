# Lesson JSON Authoring Skill

---
description: How to author a complete, valid lesson JSON file that works exactly as if built with the AST Lesson Builder UI.
---

## Overview

The AST Lesson Builder stores lessons as a single self-contained JSON file. This SKILL.md is the authoritative guide for generating a lesson JSON that is **100% compatible** with the builder, the viewer, and the database.

> **IMPORTANT - Implemented Components Only**:
> Currently active renderers: `heading`, `paragraph`, `bulletList`, `image`, `video`, `codeBlock` (codeEditor), `quiz`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `hotspot`.
> Unimplemented / Legacy (DO NOT USE): `slideTitle`, `lessonIntro`, `quote`, `table`, `lessonSummary`, `lessonComplete`. Use combinations of `heading`, `paragraph`, `bulletList`, etc. instead.

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
| `timeLimit` | `number` | ⬜ | Time limit in seconds for `live` mode. Defaults to `10` (10s) if omitted |

> **Important**: Interactive components (`quiz`, `dragDrop`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `hotspot`) have `mode` at **both** the top component level AND inside `props`. Both must be set for correct rendering.
> **Live Mode Timer Gotcha**: When `mode: "live"`, the system applies a default timer of **10 seconds** per activity/question if `timeLimit` is omitted. 10s can be too short for complex questions or multi-item activities! Always specify `"timeLimit": 20`, `"timeLimit": 30`, or `"timeLimit": 60` in `props` when creating live-mode activities that require extra reading or sorting time.

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
Display an image with optional caption.

```json
{
  "id": "image-<ts>",
  "type": "image",
  "props": {
    "src": "https://example.com/my-image.png",
    "alt": "Description of image",
    "caption": "Optional caption text",
    "width": "100%"
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default |
|---|---|---|
| `src` | `string` (URL) | `/placeholder.svg?height=300&width=400` |
| `alt` | `string` | `"Image description"` |
| `caption` | `string` | `""` |
| `width` | `string` | `"100%"` |

---

#### `video`
Embed a video.

```json
{
  "id": "video-<ts>",
  "type": "video",
  "props": {
    "src": "https://example.com/video.mp4",
    "poster": "https://example.com/thumbnail.jpg",
    "caption": "",
    "controls": true,
    "autoplay": false,
    "loop": false
  },
  "state": "active",
  "status": "uncompleted"
}
```

| Prop | Type | Default |
|---|---|---|
| `src` | `string` | `/placeholder.mp4` |
| `poster` | `string` | `/placeholder.jpg` |
| `caption` | `string` | `""` |
| `controls` | `boolean` | `true` |
| `autoplay` | `boolean` | `false` |
| `loop` | `boolean` | `false` |

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
    "shuffleOptions": false,
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
| `shuffleOptions` | `boolean` | Randomise option order |
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
Clickable regions on an image.

```json
{
  "id": "hotspot-<ts>",
  "type": "hotspot",
  "props": {
    "title": "Identify the parts of a cell",
    "image": "https://example.com/cell-diagram.png",
    "hotspots": [
      { "id": "1", "x": 0.3, "y": 0.4, "label": "Nucleus", "content": "Controls cell activity" },
      { "id": "2", "x": 0.6, "y": 0.7, "label": "Mitochondria", "content": "Produces energy" }
    ],
    "behavior": "discovery",
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
| `title` | `string` | | Instruction prompt |
| `image` | `string` | URL | Background image |
| `hotspots` | `Hotspot[]` | | Minimum 1 |
| `behavior` | `string` | `"discovery"` `"quiz"` | `discovery` = info only; `quiz` = find all to complete |
| `mode` | `"practice" \| "live"` | | |
| `state` | `"active" \| "disabled"` | | |

**Hotspot object:**
```json
{
  "id": "1",
  "x": 0.35,
  "y": 0.28,
  "label": "Hotspot Label",
  "content": "Tooltip explanation text"
}
```
> **Rule**: `x` and `y` are decimal fractions (0.0–1.0) representing position as percentage of image width/height. Top-left is `(0, 0)`, bottom-right is `(1, 1)`.

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

---

## 8. Validation Checklist

Before submitting a lesson JSON for loading:

- [ ] `id` is unique and non-empty
- [ ] `slides` array has at least 1 slide
- [ ] Every slide has a unique `id`
- [ ] Every component has a unique `id`
- [ ] Only implemented component types are used (`heading`, `paragraph`, `bulletList`, `image`, `video`, `codeBlock`, `quiz`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `hotspot`) — NO `slideTitle`, `table`, `quote`, `lessonIntro`, `lessonSummary`, `lessonComplete`
- [ ] Each `quiz` has at least 1 question with exactly 1 `isCorrect: true` option
- [ ] `fillInTheBlank` has `{{blank}}` count matching `blanks.length`
- [ ] `dragDrop` items have `correctIndex` values forming 0-based sequence with no gaps
- [ ] `hotspot.x` and `hotspot.y` are between 0.0 and 1.0
- [ ] Interactive components have `mode` set at **both** component root AND inside `props`
- [ ] Live mode activities set explicit `"timeLimit"` in `props` (e.g. `20`, `30`, `60`) if the 10s default is too short
- [ ] All IDs within lesson are globally unique (no duplicates across slides or components)
