---
name: primary-lesson-generator
description: Authoring framework for Year 4–5 (ages 8–10) interactive lessons on the AST Lesson Builder — action-first pacing, low reading load, story framing, and strategic use of discovery/gamified components. Use when creating or extending lessons for KS2 / primary students, NOT for KS3+ academic lessons (use curriculum-lesson-generator instead).
---

# Primary Lesson Generator Skill

This skill governs how to author **child-friendly, interaction-first lessons** for **Year 4–5 (ages 8–10)** on the AST Lesson Builder.

> **When to use this skill**: Primary / KS2 lessons, ages 8–10, low-literacy topics, exploratory science, vocabulary, simple maths concepts, geography discovery.
>
> **When NOT to use this skill**: Year 7+, grammar-heavy modules, formal rhetoric, timed live assessments, academic essay-style progression. Use `skills/curriculum-lesson-generator/SKILL.md` instead.

> **Companion skill**: Always cross-reference `skills/lesson-json/SKILL.md` for exact JSON schemas, prop shapes, and validation rules.

---

## 1. Product Philosophy (Primary Mode)

Primary lessons follow a different north star from KS3:

| KS3 (curriculum-lesson-generator) | Primary (this skill) |
|---|---|
| Depth → mastery → live assessment | Action → discovery → gentle check |
| Long academic blocks before doing | **Mixed read → do → read → do per slide** |
| Academic framing | **Story / mission framing allowed** |
| Timed live mode | **Practice mode only** |
| Meta-language ("modal verb", "certainty spectrum") | **Concrete language** ("strong word", "maybe word") |
| Tables and long paragraphs | **Images, audio, short headings** |

**Core rule**: The child should **do something fun within 10 seconds** of starting a slide. Reading comes *after* curiosity, not before it.

---

## 2. Target Learner Profile

| Attribute | Guideline |
|---|---|
| Age | 8–10 (Year 4–5) |
| Reading stamina | 1–2 short sentences per screen maximum |
| Typing | Avoid — most cannot type fluently |
| Attention span | 3–5 minutes per activity block |
| Motivation | Play, story, exploration, visible progress |
| Failure tolerance | Low — wrong answers must feel light and retry-friendly |

---

## 3. Lesson Structure (Primary Module)

Primary modules are **shorter and lighter** than KS3 modules:

1. **Lesson 1 — Adventure Hook (5–8 slides)**:
   - Introduce a simple story frame (detective, explorer, helper character).
   - 80% interaction, 20% text.
   - Zero tests of unlearned concepts.
   - End with a celebratory poll or simple quiz (2 options max).

2. **Lessons 2 through N−1 — One Idea Per Lesson (6–10 slides)**:
   - One concrete concept only (e.g. "solids vs liquids", not "states of matter + particle theory + phase changes").
   - Each slide teaches through a **mixed sequence** of short content + activities — as many components as the concept needs, as long as each step earns its place (see Section 4).
   - Revisit the story frame on every slide opening line.

3. **Final Lesson — Show What You Found (4–6 slides)**:
   - **NOT** a timed live assessment barrage.
   - Mix of `memoryGrid`, `spinTheWheel`, `hotspot` quiz, simple `trueFalse`.
   - All components in `"practice"` mode — no `timeLimit`.
   - End with summary bullet list + encouraging completion message.

---

## 4. Slide Composition — Earn Your Place (Critical)

The AST lesson **viewer shows one component at a time** per slide. The learner taps Next to step through each component sequentially.

**Multiple components per slide is correct and encouraged** when each Next tap delivers something new and purposeful. Lengthy slides are **not** a problem — boring slides are.

### ❌ Bad primary slide (passive wall before doing)
```
paragraph → paragraph → table → callout → quiz
```
Six Next taps, all reading, then a test on something never explained on this slide.

### ❌ Bad primary slide (component buffet for novelty)
```
wordScramble → spinTheWheel → memoryGrid → categorise → poll
```
Fun activities with no teaching thread — novelty without learning.

### ✅ Good primary slide (mixed, interwoven, teach-before-test)
```
heading → callout (define hyperbole) → paragraph (one example) → trueFalse → memoryGrid
```
Read → do → read → do. Concept is shown before it is tested.

Another valid pattern:
```
heading → accordion (2 panels) → categorise → quiz (2 options)
```

**Rules**:
- **No component count cap** — use as many as the slide's learning goal requires.
- **Every component must earn its place**: teach, reinforce, or check something the slide already set up.
- **Never stack continuous passive content** (`paragraph` → `paragraph` → `table` with no activity between).
- **Teach before test** — never open a slide with a quiz on a concept explained later on the same or next slide.
- **Start every slide with non-autoplay content** — usually `heading` (≤8 words); never open with a component that autoplays audio.
- **Learning first, experience second** — pick components because the concept needs them, not because you want her to "try everything new."
- **Repeating one component type across slides is fine** if that is what the slide needs (e.g. two `trueFalse` checks after two separate mini-lessons).

---

## 5. Primary Component Tier List

Only use components from `skills/lesson-json/SKILL.md`. This tier list governs **when** to use them.

### Tier 1 — Lead With These (Primary Default)
| Component | Primary Role | Notes |
|---|---|---|
| `hotspot` (`behavior: "discovery"`) | Tap-to-explore scenes | Best opening activity on any slide |
| `memoryGrid` | Match pairs game | Keep to 3–4 pairs max |
| `wordScramble` | Spell a single short word | Max 8 letters; always include `hint` |
| `spinTheWheel` | Review game | `requiredSpins: 2–3`; simple questions only |
| `poll` | Opinions, predictions, icebreakers | 2–3 options; no wrong answer |
| `image` | Big visual anchor | Always include `caption` with one short sentence |
| `video` | Watch and wonder | Max 60–90 seconds; short `caption` |

### Tier 2 — Use After Concept Is Shown Visually
| Component | Primary Role | Notes |
|---|---|---|
| `flashcards` | 2–4 cards max | Front = picture word or emoji + label; back = one short sentence |
| `quiz` | 2 options only | One question per component; `"mode": "practice"` |
| `trueFalse` | Quick yes/no | One statement; friendly `explanation` |
| `categorise` | Sort into 2 buckets | Max 4 items; bucket titles = single words |
| `dragDrop` | Order 3 items | Simple sequences (life cycle, size order) |
| `matchingPairs` | Match 3 pairs max | Use pictures/emoji in labels where possible |

### Tier 3 — Use Sparingly (Year 5 Only, With Support)
| Component | Primary Role | Notes |
|---|---|---|
| `fillInTheBlank` | One blank only | Single word answer; no typing sentences |
| `flashcardQuiz` | 1 question only | `"mode": "practice"` |
| `timeline` | 3 events max | `"interactive": true`; simple year labels |
| `bulletList` | 3 items max | Short phrases, not sentences |
| `callout` (`variant: "tip"`) | One fun fact | Max 2 sentences |

### Tier 4 — Avoid for Primary
| Component | Why |
|---|---|
| `multiSelectQuiz` | Too complex; "select all" confuses young learners |
| `fillInTheBlank` (multi-blank) | Typing + reading overload |
| `shortAnswer` | Requires writing sentences |
| `codeEditor` | Not age-appropriate |
| `wordCloud` | Needs typing; better for group/teacher-led |
| `scaleSlider` | Abstract self-rating |
| `annotateImage` | Fine motor + label precision too hard |
| `table` | Wall of text for non-readers |
| `accordion` | Hidden text = skipped text |
| `quote` | Literary framing lost on most Year 4–5 |
| Live mode (`"mode": "live"`) | Timers cause anxiety |
| `hotspot` (`behavior: "quiz"`) | OK for Year 5 only; never timed |

---

## 6. Story Frame Pattern (Encouraged for Primary)

Unlike KS3 skills, primary lessons **SHOULD** use a simple narrative wrapper:

**Approved frames**: Explorer mission, detective mystery, animal adventure, space journey, helping a character fix something.

**Template — Slide opening heading**:
- ✅ "🕵️ Clue #2: What floats and what sinks?"
- ✅ "🌟 Mission: Find the three states of water!"
- ❌ "Understanding the properties of matter in different physical states"

**Template — Lesson description** (one sentence, story allowed):
- ✅ "Join Detective Max to discover which classroom objects are matter and which are not, using mass and volume clues."
- ❌ "Master the distinction between action and stative verbs and subject-verb agreement rules."

---

## 7. Writing Rules for Primary Content

### Sentence length
- **Heading**: Max 8 words (10 absolute max).
- **Paragraph**: Max 2 sentences. Max 20 words per sentence.
- **Bullet list**: Max 3 items. Max 6 words per item.
- **Quiz question**: Max 12 words.
- **Quiz options**: Max 4 words each.
- **Hotspot label**: Max 3 words + optional emoji.
- **Hotspot popup content**: Max 2 short sentences.

### Language
- Use **concrete nouns** (water, ice, dog, shadow) not abstract ones (modality, certainty, obligation).
- Replace grammar meta-terms with kid language:
  - "modal verb" → "helper word"
  - "certainty spectrum" → "how sure you are"
  - "subject-verb agreement" → "the word matches"
- Emojis are **allowed and encouraged** in headings, bullet lists, and flashcard fronts.

### Visual-first rule
Every slide that introduces something new MUST include one of:
- `image` with educational caption
- `hotspot` discovery scene
- `video` embed

Never introduce a new concept with paragraph text alone.

---

## 8. Primary Slide Patterns (Copy These)

### Pattern A — Pure Discovery (Best opener)
```
slide: "🔍 Explore the Scene"
components:
  - hotspot (behavior: "discovery", 3–4 hotspots, emoji labels)
```

### Pattern B — Tiny Hook + Game
```
slide: "🐸 Match the Frog Facts!"
components:
  - heading (level 2, ≤8 words)
  - memoryGrid (3 pairs, simple terms)
```

### Pattern C — Watch + Wonder
```
slide: "🎥 See It Happen!"
components:
  - video (short, with caption)
  - poll ("What did you notice?" — 3 options, no wrong answer)
```

### Pattern D — Story + Sort
```
slide: "📦 Sort the Treasure!"
components:
  - heading ("Help Max sort his finds!")
  - categorise (2 categories, 4 items)
```

### Pattern E — Quick Check (after teaching)
```
slide: "⭐ Quick Check!"
components:
  - trueFalse (one simple statement, friendly explanation)
```

### Pattern F — Celebration Ending
```
slide: "🎉 You Did It!"
components:
  - bulletList (3 key things learned — short phrases)
  - poll ("What was your favourite part?" — 3 fun options)
```

### Pattern G — Teach, Then Check (validated for Year 4 fables)
```
slide: "📢 Loud and Bigger — Hyperbole!"
components:
  - heading (level 2, ≤8 words, no autoplay)
  - callout (define the device in 1–2 sentences)
  - paragraph (one fable example)
  - trueFalse (check the example just shown)
  - memoryGrid (3–4 pairs reinforcing the device)
```
Each Next tap alternates explanation and doing. No arbitrary component cap.

---

## 9. Mode & Scoring Rules (Primary)

| Rule | Value |
|---|---|
| Default mode | `"practice"` on ALL interactive components |
| Live mode | **Never** for Year 4–5 |
| `timeLimit` | **Never set** for primary lessons |
| Points | Set `points: 5–10` — low stakes |
| `showExplanation` | Always `true` on quizzes |

Points are collected but primary lessons should not *depend* on points for motivation. Story progress ("Clue 2 unlocked!") matters more than score totals.

---

## 10. Topic Selection Guide

### ✅ Good primary topics
- Animals and habitats
- Weather and seasons
- Simple forces (push/pull, float/sink)
- Maps and directions
- Healthy eating / body parts
- Story characters and settings
- Simple fractions / shapes
- Word families and spelling patterns

### ❌ Poor primary topics (save for KS3)
- Modal verbs and certainty ranking
- Subject-verb agreement rules
- Persuasive rhetoric and counter-arguments
- Past perfect vs past progressive
- Essay structure and formal register

---

## 11. Platform Architecture — Viewer UI Cues (Not Lesson Components)

Intro, slide transitions, and lesson completion are **built-in viewer UI overlays** — authors do **not** add them as slide components. They activate automatically in `LessonContent.tsx`.

### Lesson Intro Cue (`LessonIntroCueOverlay`)
Shown once when a lesson starts. Displays:
- Module name + lesson number
- Lesson title and description
- Grid of all slide titles ("What you will learn")
- Optional pre-recorded audio via `lesson.introAudioUrl` (TTS fallback reads titles aloud)

**Primary authoring tip:** Write a short, exciting `description` and playful slide titles — they appear here before any content loads.

### Slide Transition Cue (`SlideTransitionOverlay`)
Shown before each slide begins. Displays:
- Lesson title + "Slide X of Y"
- The current `slide.title` in large text
- Themed pastel background (rotates per slide index)
- Optional audio via `slide.titleAudioUrl`

**Primary authoring tip:** Slide titles ARE your story beats. Use emoji and mission language:
- ✅ `"🐸 Mission 2: Sort the Pond Animals!"`
- ❌ `"Categorisation of vertebrate and invertebrate species"`

### Lesson Completion Overlay (`LessonCompletionOverlay`)
Shown when the student finishes. Displays:
- Confetti animation + fanfare sound
- Slides cleared, score points, accuracy %
- Review / Complete & Exit / Next Lesson buttons

This is where scores currently have their **only visible payoff** — another reason to build course-level progression next.

### ⚠️ Do NOT use legacy JSON component types
`lessonIntro`, `lessonSummary`, and `lessonComplete` appear in older lesson JSON examples and in `lesson-json/SKILL.md` documentation, but they are **not registered slide components**. If placed in `slides[].components[]`, they render as a fallback error card.

Use the built-in UI cue system instead — controlled by lesson metadata and slide titles.

### Other platform behaviours to know

1. **Viewer shows one component at a time** per slide — mix content and activities so each Next tap earns its place (see Section 4).
2. **Read-aloud** is available on some content components via `audioUrl` — prefer adding audio for non-readers where possible.
3. **Graphic patterns** (`polka-dots`, `waves`, `squiggles`, etc.) are lesson-locked via `getLessonPattern(lessonId)` — consistent visual identity per lesson.
4. **UI chrome** on individual components (point badges, formal labels) is neutral/teen-toned — compensate with playful slide titles and cue overlays.

---

## 12. Primary vs KS3 Skill Selection

| Signal | Use this skill | Use curriculum-lesson-generator |
|---|---|---|
| Target age 8–10 | ✅ | ❌ |
| Target age 11+ | ❌ | ✅ |
| Topic uses grammar meta-language | ❌ | ✅ |
| Topic is concrete / visual | ✅ | Either |
| Story frame wanted | ✅ | ❌ |
| Timed live assessment finale | ❌ | ✅ |
| Typing required | ❌ | Maybe |

---

## 13. Primary Lesson Validation Checklist

Before submitting a primary lesson JSON:

- [ ] Every slide mixes content + activity — no passive-only stacks (`paragraph` → `paragraph` → `table`)
- [ ] No slide opens with a quiz/check on an untaught concept (teach before test)
- [ ] No slide opens with a component that autoplays audio — use `heading` or other non-autoplay content first
- [ ] Every component on the slide earns its place (learning first, novelty second)
- [ ] No `fillInTheBlank` with more than 1 blank
- [ ] No `multiSelectQuiz`, `shortAnswer`, or `codeEditor`
- [ ] No `"mode": "live"` anywhere
- [ ] No `timeLimit` set on any component
- [ ] All quiz questions have ≤2 options for Year 4; ≤3 for Year 5
- [ ] `memoryGrid` has ≤4 pairs
- [ ] `wordScramble` words are ≤8 letters with a `hint`
- [ ] Headings are ≤8 words; paragraphs are ≤2 sentences
- [ ] At least one visual (`image`, `hotspot`, or `video`) on every teaching slide
- [ ] Story frame present in lesson title and slide headings
- [ ] Lesson duration set to 20–30 minutes (not 45+)
- [ ] All component types and JSON shapes valid per `skills/lesson-json/SKILL.md`
- [ ] All interactive components have `mode: "practice"` at both root and inside `props`

---

## 14. Example Primary Lesson Outline

**Topic**: Float or Sink? (Year 4 Science)

**Lesson metadata** (feeds the intro cue overlay automatically):
- `title`: "Float or Sink? Splash Lab Mission"
- `description`: "Discover which objects float and which sink, and learn the simple rules that explain why."
- Slide titles below become the intro cue grid AND the slide transition announcements.

| Slide | Title (used by UI cues) | Components on slide |
|---|---|---|
| 1 | 🌊 Splash Lab! | `heading` → `poll` |
| 2 | 🔍 Explore the Pool | `heading` → `hotspot` discovery |
| 3 | 💧 Solids, Liquids, Gas | `callout` → `paragraph` → `trueFalse` |
| 4 | 🎴 Match the Objects | `heading` → `memoryGrid` (3 pairs) |
| 5 | 📦 Sort It! | `heading` → `categorise` (2 buckets, 4 items) |
| 6 | 🎡 Spin to Win! | `heading` → `spinTheWheel` (2 spins) |
| 7 | 🎉 Scientist Badge! | `bulletList` → `poll` |

**Duration**: 25 minutes | **Level**: Year 4 | **Mode**: All practice

Note: No `lessonIntro` component needed — the built-in intro cue reads `title`, `description`, and slide titles automatically.

---

## 15. Reference

- JSON schemas & prop shapes: `skills/lesson-json/SKILL.md`
- KS3 / secondary authoring: `skills/curriculum-lesson-generator/SKILL.md`
- Platform strategy & audience findings: `docs/platform-engagement-strategy.md`
