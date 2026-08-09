---
name: curriculum-lesson-generator
description: Authoritative framework for decomposing curriculum topics into deep, highly educational interactive lessons with intertwined content, component placement friction rules, rich component role descriptions, and dynamic live-mode time limits for the AST Lesson Builder.
---

# Curriculum Lesson Generator Skill

This SKILL provides the definitive guidelines for taking any subject topic, decomposing it into a structured multi-lesson module, and generating **deep, pedagogically packed, highly engaging interactive lessons**.

---

## 1. Topic Decomposition & Curriculum Hierarchy Framework

Every subject topic MUST be decomposed into a multi-lesson module following this exact structure:

1. **Lesson 1: Introductory Hook Lesson (Always First)**:
   - **Purpose**: Spark curiosity, introduce the overall theme, tease all upcoming concepts, and build student excitement.
   - **Media & Component Focus**: Rich inviting media (`image`, `video`, `hotspot` discovery, `poll`, `flashcards`, simple `quiz`).
   - **Crucial Constraint**: Low cognitive friction. Do NOT test unlearned concepts or use high-friction inputs like `fillInTheBlank`.

2. **Lessons 2 through N-1: Concept-Specific Deep Lessons**:
   - **Rule**: **One core concept per lesson**. Do not cram multiple unrelated concepts into a single lesson.
   - **Depth**: Each concept is taught to **100% complete understanding** using as many interactive slides as necessary.
   - **Slide Progression**: Follows a logical sub-concept build-up where every slide teaches a complete, self-contained point.

3. **Lesson N: Comprehensive Assessment Lesson (Always Last)**:
   - **Purpose**: Test every single concept taught across all prior lessons in the topic under 100% Live Mode conditions.
   - **Structure**: Every slide is a dedicated live assessment challenge featuring 2–3 live interactive components with dynamic `timeLimit` parameters.

---

## 2. Component Cognitive Friction & Placement Rules

Interactive components carry different levels of cognitive friction. You MUST follow these placement rules:

### A. Low-Friction & Discovery Components (Introductory / Teaser Use)
- **Components**: `poll`, `image`, `video`, `hotspot` (`behavior: "discovery"`), `flashcards`, `quiz` (simple 2-option warm-up).
- **Usage**: Use freely on introductory slides, lesson openers, and concept teasers.

### B. High-Friction & Mastery Components (Consolidation Use Only)
- **Components**: `fillInTheBlank`, `dragDrop`, `matchingPairs`, `multiSelectQuiz`, `flashcardQuiz`, `codeEditor`, `hotspot` (`behavior: "quiz"`).
- **NEVER ON INTRODUCTORY SLIDES**: Do NOT place `fillInTheBlank` or complex matching/drag-drop activities on introductory or teaser slides before a concept is sealed.
- **Placement Rule**: High-friction components MUST ONLY be placed **AFTER** the specific sub-concept has been introduced, explained, and sealed on that slide or in a preceding section of the lesson.

---

## 3. Non-Negotiable Lesson Quality Rules

1. **Intertwined Component Structure (NO Text-Then-Single-Interactive Pattern)**:
   - **Rule**: Content, visual anchors (`image`, `hotspot`, `video`), and interactive components MUST BE INTERTWINED on every slide. Do NOT place all text at the top and a single activity at the bottom.
   - **Slide Pattern**:
     - `heading`
     - `paragraph` (introducing Sub-concept A)
     - **Visual Anchor** (`image` diagram / photo OR interactive `hotspot` discovery diagram)
     - Interactive component (e.g. `flashcards` or `poll`) reinforcing Sub-concept A immediately
     - `paragraph` / `bulletList` / `table` (introducing Sub-concept B or nuance)
     - Interactive component (e.g. `fillInTheBlank` or `quiz`) testing Sub-concept B
     - `quote` / `bulletList` summary tip

2. **Visual-First Pedagogy & Detailed Visual Component Roles (`image`, `hotspot`, `video`)**:
   - **Rule**: Science, geography, history, biology, physics, literature, and technical topics MUST be visually anchored. Never rely purely on walls of text when a visual diagram, image, interactive hotspot map, or video embed can illustrate the physical or spatial reality.
   - **Component Roles & Descriptions**:
     - **`image`**: Use for high-impact visual diagrams, real-world photographs, state comparisons (e.g. ice vs water vs steam), and structural illustrations. Always include descriptive `alt` and educational `caption` props rendered directly below the image.
     - **`hotspot`**: Use for interactive spatial/diagram exploration. In `behavior: "discovery"`, students click key regions on an image (e.g. sun vs wooden desk vs shadow vs water bottle) to inspect popup content. In `behavior: "quiz"`, students are tested on identifying visual targets.
     - **`video`**: Use for processes in motion, dynamic experiments, or short video demonstrations. Always include instructional `caption` and `poster` thumbnail.
   - **Integration Frequency**: At least one visual element (`image`, `hotspot`, or `video`) MUST be included on any slide introducing a new physical, spatial, or structural concept.

3. **Copious Component Variety (Use Multiple Interactive Components per Slide)**:
   - Utilize as many registered interactive components on each slide as judiciously helpful. A single slide can contain 2 or 3 interactive components interspaced between explanations to maximize engagement and active learning.

4. **Complete, Self-Contained Teaching per Slide**:
   - Every slide must teach its target point **completely and self-contained on that slide**. Do not leave a point half-explained or rely on a future slide to reach a conclusion (except when building progressive concepts on top of foundational ones).

5. **Lesson Description = One Tight Content Summary Sentence**:
   - Write **one concise sentence** (or two at most) that states the topic and lists the key concepts/terms the lesson covers.
   - Model: *"Master the Past Perfect tense using had + past participle to layer past timelines, order earlier vs later past events, and master conjunctions like before, after, and by the time."*
   - **Rules**:
     - State the topic, then follow with the key things the student will learn/encounter in the lesson.
     - Do NOT go slide by slide. Do NOT list exact sentences or examples from the lesson content.
     - Do NOT use narrative or emotional framing ("discover", "journey", "adventure").
     - Do NOT mention component types, lesson structure, or Year group.

6. **Strictly Educational Theme**:
   - Use clean, encouraging, academic framing focused on language discovery, sentence building, and mastery. Avoid military or confusing sci-fi terminology.

7. **100% Valid Component Catalog Only**:
   - Only use components registered in `skills/lesson-json/SKILL.md`:
     - **Content & Visual**: `heading`, `paragraph`, `bulletList`, `image`, `table`, `video`, `codeBlock`, `quote`
     - **Interactive & Gamified**: `quiz`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `hotspot`, `codeEditor`, `poll`, `flashcardQuiz`, `multiSelectQuiz`

8. **Plain Text Only inside Tables**:
   - `table` cell data MUST BE PLAIN TEXT strings only. **NEVER use HTML tags** (such as `<strong>`, `<em>`, `<span>`, `<br>`) inside table data arrays.

9. **Dynamic & Realistic Live-Mode Time Limits (NEVER Hardcode Default 10s)**:
   - When `mode: "live"`, the system engine defaults to 10 seconds per activity if `timeLimit` is omitted or uncalculated. 10s is almost NEVER enough for multi-question, fill-in-the-blank, drag-and-drop, or matching activities!
   - `timeLimit` MUST ALWAYS be calculated dynamically based on component type cognitive friction, number of items, and prompt reading length.

10. **Strict Quiz Integrity (NEVER Repurpose `quiz` for Readiness Checks or Opinions)**:
   - **Rule**: `quiz`, `flashcardQuiz`, and `multiSelectQuiz` components MUST ONLY be used for **genuine educational knowledge assessment** testing curriculum concepts with unambiguous right/wrong answers.
   - **NEVER** use a `quiz` for "Are you ready?", "Pick your favorite", or readiness/opinion questions.
   - Use the `poll` component for student opinions, preference choices, icebreakers, and lesson readiness checks.

---

## 4. Interactive Component Catalog & Mode Matrix

Below is the complete list of all registered interactive components, their modes, friction levels, and primary pedagogical roles:

| Component Type | Supports `mode`? | Supports `timeLimit`? | Primary Interaction Type | Cognitive Friction | Primary Pedagogical Role |
|---|---|---|---|---|---|
| **`poll`** | ❌ (Always Open) | ❌ | Opinion voting & selection | Low | Warm-up engagement, icebreaker opinions, student preferences |
| **`flashcards`** | `"practice"` / `"live"` | ❌ | 3D card flip study | Low | Vocabulary discovery, key term definitions, quick-concept flipping |
| **`hotspot`** (discovery) | `"practice"` | ❌ | Visual diagram click inspection | Low | Interactive visual exploration, diagram labeling, spatial scene inspection |
| **`quiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Multiple choice question selection | Medium | Single-concept check, 3-4 option multiple choice evaluation |
| **`flashcardQuiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | 3D flip card + 4-option selection | Medium | Gamified 3D card questioning with 4 option cards |
| **`multiSelectQuiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Multi-correct boolean selection | Medium-High | Complex multi-choice evaluation (Select ALL that apply) |
| **`hotspot`** (quiz) | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Visual diagram target selection | Medium-High | Visual assessment — clicking exact regions on a diagram under time limit |
| **`fillInTheBlank`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Sentence reading & typing/selecting text | High (Requires Sealed Concept) | Sentence completion & exact terminology retrieval (ONLY after concept is sealed) |
| **`matchingPairs`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Dual-column term matching | High (Requires Sealed Concept) | Concept-to-definition linking, dual-column connection checks |
| **`dragDrop`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Sequential drag ordering | High (Requires Sealed Concept) | Process ordering, chronological sequence sorting, ranked classification |
| **`codeEditor`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Code editing & unit testing | High | Writing/editing code and executing automated unit test suites |

---

## 5. Dynamic Time Limit Calculation Matrix & Formulas

Always use the following formulas to set `props.timeLimit` whenever creating `mode: "live"` components:

```
timeLimit = Base Setup Time (10-20s) + (Per-Item Processing Time × Item Count) + Long Text Buffer
```

### Official Per-Component Time Plan Reference Table

| Component Type | Base Setup Time | Per-Item Time | Formula | Minimum `timeLimit` | Practical Examples |
|---|---|---|---|---|---|
| **`quiz`** | 10 seconds | 10s per question | `10 + (10 × questions.length)` | **20s** | • 1 Question = **20s**<br>• 2 Questions = **30s**<br>• 3 Questions = **40s** |
| **`fillInTheBlank`** | 15 seconds | 15s per blank | `15 + (15 × blanks.length)` | **30s** | • 1 Blank = **30s**<br>• 2 Blanks = **45s**<br>• 3 Blanks = **60s** |
| **`dragDrop`** | 10 seconds | 10s per item to sort | `10 + (10 × items.length)` | **30s** | • 3 Items = **40s**<br>• 4 Items = **50s**<br>• 5 Items = **60s** |
| **`matchingPairs`** | 10 seconds | 10s per pair | `10 + (10 × pairs.length)` | **30s** | • 3 Pairs = **40s**<br>• 4 Pairs = **50s**<br>• 5 Pairs = **60s** |
| **`flashcardQuiz`** | 10 seconds | 12s per question | `10 + (12 × questions.length)` | **25s** | • 1 Question = **25s**<br>• 2 Questions = **35s**<br>• 3 Questions = **45s** |
| **`multiSelectQuiz`** | 12 seconds | 8s per option card | `12 + (8 × total_options)` | **30s** | • 1 Question (4 options) = **45s**<br>• 2 Questions (8 options total) = **75s** |
| **`codeEditor`** | 20 seconds | 30s per test case | `20 + (30 × testCases.length)` | **60s** | • 1 Test Case = **60s**<br>• 2 Test Cases = **80s**<br>• 3 Test Cases = **110s** |
| **`hotspot` (quiz mode)** | 15 seconds | 10s per target | `15 + (10 × hotspots.length)` | **30s** | • 2 Hotspots = **35s**<br>• 3 Hotspots = **45s** |

### Additional Time Limit Rules:
1. **Long Prompt / Complex Option Penalty**: Add **+10 to +15 seconds** if question prompts exceed 20 words or option text contains full paragraphs.
2. **Double Mode Specification**: When setting `timeLimit`, ensure `mode: "live"` is set at **BOTH** the top component level AND inside `props`.
3. **No Short Timers**: Never set a `timeLimit` below **15 seconds** under any circumstances.
