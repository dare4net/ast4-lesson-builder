---
name: curriculum-lesson-generator
description: Authoritative framework for decomposing curriculum topics into deep, highly educational interactive lessons with intertwined content, multiple interactive components, and dynamic live-mode time limits for the AST Lesson Builder.
---

# Curriculum Lesson Generator Skill

This SKILL provides the definitive guidelines for taking any subject topic and generating **deep, pedagogically packed, highly engaging interactive lessons**.

---

## 1. Non-Negotiable Lesson Quality Rules

1. **Intertwined Component Structure (NO Text-Then-Single-Interactive Pattern)**:
   - **Rule**: Content and interactive components MUST BE INTERtwined on every slide. Do NOT place all text at the top and a single activity at the bottom.
   - **Slide Pattern**:
     - `heading`
     - `paragraph` (introducing Sub-concept A)
     - Interactive component (e.g. `flashcards` or `matchingPairs`) reinforcing Sub-concept A immediately
     - `paragraph` / `bulletList` / `table` (introducing Sub-concept B or nuance)
     - Interactive component (e.g. `fillInTheBlank` or `quiz`) testing Sub-concept B
     - `quote` / `bulletList` summary tip

2. **Copious Component Variety (Use Multiple Interactive Components per Slide)**:
   - Utilize as many registered interactive components on each slide as judiciously helpful. A single slide can contain 2 or 3 interactive components interspaced between explanations to maximize engagement and active learning.

3. **Complete, Self-Contained Teaching per Slide**:
   - Every slide must teach its target topic **thoroughly and completely**. Do not leave a concept half-explained or rely on a future slide to finish explaining a rule (except when building progressive concepts on top of foundational ones).

4. **Strictly Educational Theme**:
   - Use clean, encouraging, academic framing focused on language discovery, sentence building, and mastery. Avoid military or confusing sci-fi terminology.

5. **100% Valid Component Catalog Only**:
   - Only use components registered in `skills/lesson-json/SKILL.md`:
     - **Content**: `heading`, `paragraph`, `bulletList`, `image`, `table`, `video`, `codeBlock`, `quote`
     - **Interactive / Gamified**: `quiz`, `flashcards`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `hotspot`, `codeEditor`, `poll`, `flashcardQuiz`, `multiSelectQuiz`

6. **Plain Text Only inside Tables**:
   - **Crucial Rule**: `table` component cell data MUST BE PLAIN TEXT strings only. **NEVER use HTML tags** (such as `<strong>`, `<em>`, `<span>`, `<br>`) inside table data arrays.

7. **Dynamic & Realistic Live-Mode Time Limits (NEVER Hardcode Default 10s)**:
   - **Rule**: When `mode: "live"`, the system engine defaults to 10 seconds per activity if `timeLimit` is omitted or uncalculated. **10 seconds is almost NEVER enough time** for multi-question, fill-in-the-blank, drag-and-drop, or matching activities!
   - `timeLimit` MUST ALWAYS be calculated dynamically based on:
     1. **Component type cognitive friction** (typing text vs clicking vs visual matching vs drag-and-drop).
     2. **Number of items / questions / blanks / pairs** inside the component.
     3. **Length and reading complexity of prompt text and options**.

8. **Final Topic Lesson Rule (Comprehensive 100% Live Assessment)**:
   - **Mandatory Requirement**: The final lesson of EVERY curriculum topic/module MUST be a **Comprehensive Assessment Lesson** that tests every single concept taught across all prior lessons in the topic.
   - **Slide Structure**: Every single slide in this lesson is a dedicated assessment challenge.
   - **100% Live Mode**: All interactive components on every slide (except brief informational headers/prompts) MUST be set to `mode: "live"` with explicit dynamic `timeLimit` parameters.
   - **Component Diversity**: Every slide must feature a rich mix of 2 to 3 live interactive components (`quiz`, `fillInTheBlank`, `matchingPairs`, `dragDrop`, `multiSelectQuiz`, `flashcardQuiz`).


---

## 2. Interactive Component Catalog & Mode Matrix

Below is the complete list of all 8 components supporting `mode: "live" | "practice"` and `timeLimit`:

| Component Type | Supports `mode`? | Supports `timeLimit`? | Primary Interaction Type |
|---|---|---|---|
| **`quiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Multiple choice question selection |
| **`fillInTheBlank`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Sentence reading & typing/selecting text blanks |
| **`dragDrop`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Dragging cards into correct ordinal sequence |
| **`matchingPairs`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Scanning dual columns & linking matched pairs |
| **`flashcardQuiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | 3D card flip animation + 4 option selection |
| **`multiSelectQuiz`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Grid evaluation of multi-correct boolean cards |
| **`codeEditor`** | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Writing/editing code & executing unit test cases |
| **`hotspot`** (quiz behavior) | `"practice"` / `"live"` | ✅ (`props.timeLimit`) | Visual diagram scanning & clicking target hotspots |

---

## 3. Dynamic Time Limit Calculation Matrix & Formulas

Always use the following formulas to set `props.timeLimit` whenever creating `mode: "live"` components:

```
timeLimit = Base Reading/Setup Time + (Per-Item Processing Time × Item Count) + Long Text Buffer
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

