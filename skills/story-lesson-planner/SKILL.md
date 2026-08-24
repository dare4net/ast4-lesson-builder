---
description: Story Lesson Planner — Generate deep, narrative-driven curriculum lesson plans across multi-file topic packages with purpose-driven component selection and 100% validator pass guarantees.
---

# Story Lesson Planner Skill

This skill generates **structured planning documents** and **valid lesson JSON files** for any curriculum lesson series built around a narrative story arc.

> **CRITICAL RULE:** All generated lesson JSON files MUST pass `scripts/verify-lesson.ts` (the master-validator script) with **100% VALID status, ZERO ERRORS, and ZERO WARNINGS**.

---

## STEP 0 — Ask These Intake Questions First

Do not generate any output until all of the following have been answered in order:

1. **Age Group / Year** (e.g. Year 3, Year 5, KS3, A-Level)
2. **Subject** (e.g. English Language, Mathematics, Science, History)
3. **Story Genre / World** (Present 10 options including Criminal Investigation, Sci-Fi, Disaster Survival, etc.)
4. **Topic** (Suggest 5–6 subject-relevant topics based on answers above)
5. **Tone** (Dark & Cinematic, Light & Playful, Serious & Academic, Comic Adventure, Eerie & Mysterious)
6. **Lesson Count** (Optional — default to narrative arc requirement)

---

## OUTPUT — Multi-File Folder Structure

```
lessons/
  <topic-slug>/
    01-premise-and-characters.md
    02-full-story.md
    03-lesson-plans/
      lesson-01.md
      lesson-02.md
      ...
    04-video-clips.md
```

---

## NARRATIVE DELIVERY & COMIC-STYLE STORYTELLING RULES

Learners (and adults) must understand the story **instantly from the slides themselves**, without ever needing to read external premise or story bible documents.

### 1. Multi-Layered Character Introductions (Slide 1 Architecture)
Slide 1 MUST establish characters using a clean, multi-layered visual and interactive flow—NEVER cramming everything into a single component.

#### Approved Character Visual Introduction Components:
- **`hotspot` (Spatial Scene Map):** Interactive room/group scene where learners click nodes to inspect each character in the room (titles MUST be character names; popup `content` MUST be identity/bio).
- **`image` (Character Portrait Card):** High-impact single or multi-column portrait image with character name caption and bio description.
- **`timeline` (Character History / Background):** Sequential timeline mapping a character's career, backstory, or track record (each node takes an image + text overview).
- **`video` (Motion Clip Intro):** Dramatic short video clip presenting a character in action with dialogue and voice intro.

#### Structured Multi-Layered Flow:
1. **Visual Character Identification (`hotspot` / `image` / `timeline` / `video`):** Used to visually introduce who the characters are.
2. **Character Stance Dossiers (`accordion`):** Used directly below the visual component to detail each character's **official stance, political motivation, and reasoning** in the crisis.
3. **Character Voice & Dialogue (`callout` / `quote`):** Used for direct spoken quotes to establish distinct tone and speech patterns.

### 2. Component Diversity & Anti-Repetition Mandate
**NEVER copy the same component sequence from lesson to lesson.** Unpredictable, dynamic slide structures keep learners engaged.

* **Always explore component alternatives across lessons:**
  - **Character / Scene Introductions:** Rotate between `hotspot`, `image` (portrait cards), `timeline` (dossiers), `annotateImage` (scene maps), and `video`.
  - **Concept / Argument Checks:** Rotate between `trueFalse`, `quiz`, `multiSelectQuiz`, `flashcardQuiz`, `poll`, `wordScramble`, `memoryGrid`, and `matchingPairs`.
  - **Text & Theory Delivery:** Rotate between `paragraph`, `callout`, `quote`, `accordion`, `bulletList`, and `flashcards`.
  - **Interactive Application:** Rotate between `shortAnswer`, `fillInTheBlank`, `categorise`, `dragDrop`, and `matchingPairs`.
* **Rule:** A single lesson series **MUST** utilize at least 10–12 distinct component types across its slides.

### 3. Immersive Narrative Titles (No Meta-Labels Rule)
Never break narrative immersion by putting meta-labels or internal author notes in user-facing titles.
- **NEVER use titles like:** `"CHAPTER 1 HANDOFF: Planted Suspicion"`, `"CLIFFHANGER: Secret Note"`, `"NARRATIVE HANDOFF"`.
- **ALWAYS use immersive, story-driven titles:** `"⚠️ Unexplained Tremor Beneath Room 4B"`, `"📜 A Fallen Document on the Tiles"`, `"⚡ Distant Siren across the Harbour"`.
- Make the narrative callouts feel like organic story moments in a comic book or movie.

---

## MASTER-VALIDATOR SCHEMA CONTRACT (ZERO-ERROR RULES)

Every component generated in lesson JSON MUST strictly adhere to the `lib/validation/master-validator.ts` schema:

1. **`image` Component:**
   - Use `props.src` for image URL (REQUIRED by validator).
   - `props.alt` and `props.caption` required.

2. **`shortAnswer` Component:**
   - Use `props.question` (REQUIRED by validator, NOT `props.prompt`).
   - Include `props.title`, `props.placeholder`, `props.maxLength`, `props.markingMode`, `props.correctKeywords`, `props.points`.

3. **`quiz` Component:**
   - `props.questions[i].options` MUST be an array of objects: `[{ "text": "Option A", "isCorrect": true }, { "text": "Option B", "isCorrect": false }]`.
   - Exactly ONE option per question must have `"isCorrect": true`.
   - `props.questions[i].explanation` is REQUIRED.

4. **`annotateImage` Component:**
   - Use `props.image` for background diagram URL (REQUIRED).
   - Each item in `props.labels` MUST include concise `text` (<= 45 characters / 1-5 words). Never put long explanatory sentences inside annotation tags.

5. **`hotspot` Component:**
   - Use `props.image` for background URL (REQUIRED by validator).
   - Coordinates `x` and `y` MUST be decimal ratios between `0.0` and `1.0` (e.g. `0.25`, `0.30`, NOT `25`, `30`).
   - Every hotspot item in `props.hotspots` MUST include `content: "explanation text"` (REQUIRED).

5. **`trueFalse` Component:**
   - MUST use `props.isTrue: true` or `props.isTrue: false` (REQUIRED by validator, NOT `isCorrect`).
   - MUST include `props.statement` and `props.explanation`.

6. **`categorise` Component:**
   - `props.items[i]` MUST use `text: "item description"` (NOT `content`).
   - Every item MUST include a `categoryId: "cat-id"` matching one of `props.categories[j].id`.

7. **`dragDrop` Component:**
   - `props.items[i]` MUST use `text: "item description"` (NOT `content`).
   - Every item in `props.items` MUST include `correctIndex: number` (0-based sequential integer: `0, 1, 2...`).

7. **`fillInTheBlank` Component:**
   - `props.text` MUST contain `{{blank}}` tokens matching `props.blanks` array length exactly.
   - Every item in `props.blanks` MUST include `answer: "string"`.

8. **`timeline` Component:**
   - MUST use `props.events` array (REQUIRED by validator, NOT `props.items`).
   - Every event item in `props.events` MUST include `title`, `description`, and `date`.

9. **`poll` Component:**
   - `props.question` prompt required (<= 120 chars).
   - `props.options` array of 2 to 6 objects with `text` <= 60 chars.

9. **Zero HTML Tags:**
   - Never include HTML tags (`<b>`, `<i>`, `<br>`, `<span>`) in any string property.

---

## CLI VERIFICATION WORKFLOW

After writing any lesson JSON file, ALWAYS run:
```bash
npx tsx scripts/verify-lesson.ts lessons/<topic-slug>/lesson-[N].json
```
Ensure output states `VALID STATUS: 100% VALID (0 ERRORS, 0 WARNINGS)` before presenting to the user.

---

## CLI SIMILARITY COMPARISON WORKFLOW

After generating multiple lessons in a series, ALWAYS run the similarity check to ensure variety:

### Overview Mode (compare one lesson against all siblings in the same folder):
```bash
npx tsx scripts/compare-lessons.ts lessons/<topic-slug>/lesson-1.json
```

### Two-Lesson Mode (compare two specific lessons):
```bash
npx tsx scripts/compare-lessons.ts lessons/<topic-slug>/lesson-2.json lessons/<topic-slug>/lesson-5.json
```

### Output Includes:
1. **Per-Lesson Profile:** Slide count, total components, distinct component types, and slide-by-slide pattern breakdown.
2. **Pairwise Comparison:** For every lesson pair:
   - **Slide Pattern Match** (weight 20%): Jaccard similarity of unique slide-level component patterns.
   - **Component Type Overlap** (weight 15%): Jaccard similarity of distinct component type sets.
   - **Full Sequence LCS** (weight 35%): Longest Common Subsequence ratio of the full component sequence across all slides.
   - **Structural Arrangement** (weight 30%): Slide-by-slide positional LCS comparison.
   - **Overall Similarity**: Weighted average of the 4 metrics above.
3. **Similarity Matrix:** Color-coded grid showing pairwise similarity percentages at a glance.
4. **Diversity Warnings:** Flags any pair exceeding 60% overall similarity.

### Interpretation Guide:
| Overall Similarity | Rating | Action |
|---|---|---|
| 0–25% | 🟢 VERY DISTINCT | Excellent variety — no action needed. |
| 26–40% | 🟢 DISTINCT | Good variety — acceptable. |
| 41–55% | 🟡 MODERATE | Consider swapping 1–2 components for alternatives. |
| 56–70% | 🟠 SIMILAR | Rewrite at least 2 slides with different component types. |
| 71–100% | 🔴 TOO SIMILAR | Major restructure required — lessons feel repetitive. |
