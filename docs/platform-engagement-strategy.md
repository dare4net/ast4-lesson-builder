# AST Lesson Builder — Engagement, Audience & Product Strategy

Reference document capturing product findings and strategic decisions from platform review sessions (August 2026). Use this when making decisions about audience targeting, scoring systems, lesson authoring, and roadmap priorities.

---

## 1. Executive Summary

The AST Lesson Builder has a **strong interactive component library** and a **flexible lesson JSON engine**, but engagement problems stem from three separate layers — not one root cause:

1. **Scoring has no utility loop** — points appear but don't unlock, progress, or mean anything to students.
2. **Default lesson authoring skews KS3-academic** — skills, sample content, and extended lessons target Year 7+ depth and tone.
3. **Primary (Year 4–5) is possible but not supported by defaults** — a skilled teacher can author child-friendly lessons, but nothing in the ecosystem makes that the path of least resistance.

**Year 7 students enjoy the platform today.** That validates the core engine. The risk is engagement decay once novelty fades, unless progression and leaderboard systems are built.

**Product positioning (recommended)**:
> Khan Academy / Udemy substance + Duolingo interaction-first delivery — **without** Duolingo's empty dopamine loops.

---

## 2. Original Problem Statement

### Observed symptoms
- Students don't care about scores / points.
- A Year 4/5 student doesn't enjoy the platform.
- Year 7 students enjoy it now, but boredom is likely unless scoring becomes meaningful.

### Initial hypothesis (partially wrong)
"It's not child-friendly" → too broad. More accurate: **the default authoring style and reward systems aren't tuned for the age group or motivation model.**

---

## 3. Why Students Don't Care About Scores

Points only motivate when they connect to something the learner values. Currently scores are:

- Numbers shown after an activity completes
- Not tied to visible progress (levels, mastery %, unlocks)
- Not tied to consequences (unlock next section, earn badge, beat personal best)
- Not socially meaningful yet (no per-course leaderboard implemented)
- Often shown in **practice mode** where stakes are already zero

### The Duolingo trap vs the Khan model

| Duolingo trap (avoid) | Khan-style reward (target) |
|---|---|
| Streak for opening the app | Mastery % for understanding a concept |
| Points with nothing to spend them on | Progress map showing what's completed |
| Notifications to return | "You can do this now" proof of learning |
| Random rewards unrelated to skill | Unlock assessment after practice threshold |
| Leaderboard that shames bottom performers | Course leaderboard + most-improved metric |

### Scoring design principles (agreed direction)

> **Points should measure learning progress, not attendance.**

**Good score utility:**
1. **Course mastery meter** — "Modal Verbs: 68% mastered" not just "15/20 on this quiz"
2. **Unlock logic** — capstone/assessment locked until practice thresholds met
3. **Per-course leaderboard** — scoped to cohort/class, not one global humiliation board
4. **Personal best + improvement** — celebrate beating yourself, not only others
5. **Completion credentials** — lesson → module → course complete (Udemy energy)
6. **Retry with purpose** — wrong answers feed a "needs review" queue
7. **Attempt Efficiency ("Personal Best Attempts")** — in practice mode (where points are 0), track attempts to clear an activity (e.g. 3 attempts → 1 attempt). Students actively compete against their own attempt records!

**Bad score utility (Duolingo trap):**
- Points with no spend/unlock purpose
- Streaks for merely opening the app
- Leaderboards that demotivate the bottom third
- Random rewards disconnected from the skill being learned

### Planned features (from discussion)
- [ ] Per-course leaderboard
- [ ] Points tied to mastery progression
- [ ] Visible course/module completion states
- [ ] "Most improved this week" alongside top performers
- [ ] Standardized `attempts` tracking and "Personal Best Attempts" badge in Practice Mode

---

## 4. Audience Segmentation

### Year 4–5 (Primary / KS2) — Weak fit today

**Why the Year 4/5 student struggled:**
- Lessons were grammar-heavy (modal verbs, certainty percentages) — KS3 content on a primary-age child
- Too much reading before doing (paragraphs, tables, academic headings)
- Components used as quiz wrappers around schoolwork, not as the main experience
- Tone is teacher-y, not kid-y ("Probability Spectrum" vs "Splash Lab!")
- No story frame or emotional hook holding attention across slides
- Failure feedback is functional (red X + explanation), not light/retry-friendly
- Live mode timers add stress inappropriate for the age group

**Can the platform serve them?** Yes — with different authoring, not a different engine.

**Should they be a primary marketing target today?** No — not until primary authoring tooling and examples exist.

**Strategy:** Expert-authored primary mode later. Do not dilute KS3 product to chase primary.

### Year 7–9 (KS3) — Strong fit today

**Why Year 7 works:**
- Can tolerate reading + reasoning
- Handles grammar meta-language
- Structured progression feels appropriate
- Proving correctness is motivating at this age

**Risk:** Novelty fades. Without progression systems (mastery, leaderboard, unlocks), boredom arrives within weeks.

**Strategy:** Double down. This is the core user. Build scoring utility and leaderboard for this group first.

### Year 10+ / Adult — Possible later

Same engine, less gamified tone. Not current priority.

---

## 5. Platform Architecture Findings

### What is NOT built into the core (authoring flexibility exists)

- Lessons are **not template-locked** — free-form JSON, any slide order, any component mix
- Nothing forces grammar tables, 10-slide academic depth, or assessment finales
- A creative teacher **can** build child-friendly lessons with strategic component choice
- The viewer's **one-component-at-a-time** model rewards **mixed read → do sequences** per slide — multiple components are fine when each Next tap earns its place; passive-only stacks are the problem

### What IS built into defaults / ecosystem (creates friction)

| Layer | Primary-friendly? | Notes |
|---|---|---|
| Component library | ✅ If chosen well | `hotspot`, `memoryGrid`, `wordScramble`, `spinTheWheel`, `poll`, `categorise` |
| Lesson JSON flexibility | ✅ Fully | No rigid template |
| Viewer (one step per component) | ✅ If designed for it | Punishes text-heavy multi-component slides |
| `curriculum-lesson-generator` skill | ❌ | Biases toward KS3 academic depth, anti-narrative rules |
| Sample content (modals, etc.) | ❌ | Demonstrates wrong pattern for primary |
| `lessonIntro` / `lessonSummary` / `lessonComplete` | ⚠️ Legacy JSON types only | Documented in lesson-json SKILL but **not** lesson slide components — see **Viewer UI Cue System** below |
| UI chrome | ⚠️ Neutral/teen | "Memory Grid • 15 Points" — fine for Year 7, cold for Year 4/5 |
| Scoring / progression layer | ❌ Not built yet | Points exist but don't accumulate into meaningful progress |
| Per-course leaderboard | ❌ Not built yet | Planned |

### Viewer UI Cue System (built-in — NOT lesson components)

Intro, slide transitions, and completion are **real UI overlays** wired into `LessonContent.tsx`, not components authors place on slides:

| UI Overlay | File | What it reads from the lesson |
|---|---|---|
| **Lesson Intro Cue** | `LessonIntroCueOverlay.tsx` | `lesson.title`, `lesson.description`, all `slide.title` values, `lesson.introAudioUrl`, `lesson.moduleTitle`, `lesson.lessonNumber` |
| **Slide Transition Cue** | `SlideTransitionOverlay.tsx` | `slide.title`, `slide.titleAudioUrl`, per-slide theme colours, lesson graphic pattern |
| **Lesson Completion** | `LessonCompletionOverlay.tsx` | Score, accuracy %, slides cleared, confetti, next-lesson navigation |

**Authoring implication:** Primary- and KS3-friendly framing comes partly from **lesson metadata and slide titles**, not from adding extra JSON components. A playful slide title like "🕵️ Clue #2: What floats?" appears automatically in the slide cue overlay before the student sees any content.

**Legacy note:** The JSON component types `lessonIntro`, `lessonSummary`, and `lessonComplete` in `lesson-json/SKILL.md` are **not** the same as these UI overlays. If placed on a slide they hit the fallback renderer. Do not use them — rely on the built-in cue system instead.

**Audio cues:** `lesson.introAudioUrl` (intro) and `slide.titleAudioUrl` (per-slide) are generated at publish time via the lesson builder. TTS fallback reads slide titles aloud when audio is missing.

---

## 6. Component Strategy by Age

### Primary-friendly (Tier 1 — lead with these)
`hotspot` (discovery), `memoryGrid`, `wordScramble`, `spinTheWheel`, `poll`, `image`, `video`, `flashcards` (2–4 cards), `quiz` (2 options), `trueFalse`, `categorise` (2 buckets), `dragDrop` (3 items)

### KS3-appropriate (full library)
All components including `fillInTheBlank`, `multiSelectQuiz`, `flashcardQuiz`, `matchingPairs`, live mode with `timeLimit`

### Avoid for primary
`multiSelectQuiz`, multi-blank `fillInTheBlank`, `shortAnswer`, `codeEditor`, `wordCloud`, `scaleSlider`, `annotateImage`, `table`-heavy slides, live mode timers

---

## 7. Skills & Authoring Bias

The `curriculum-lesson-generator` skill explicitly pushes:
- Anti-narrative descriptions ("do NOT use discover, journey, adventure")
- Strictly educational / academic framing
- Intertwined text + multiple components per slide
- Heavy final live assessment lesson
- Deep 100%-mastery-per-concept density

This produces excellent **Year 7 lessons** and poor **Year 4 lessons** when followed blindly.

**Resolution:** Created `skills/primary-lesson-generator/SKILL.md` as a parallel authoring guide for KS2. AI agents and teachers must pick the correct skill based on target age.

---

## 8. Product North Star (Agreed)

```
Duolingo interaction-first delivery
        +
Khan Academy / Udemy learning substance
        −
Duolingo empty dopamine (streaks, meaningless points, notification loops)
```

**What this means in practice:**
- Interaction comes first on every slide — but interaction must teach something real
- Scores and leaderboards reward **mastery and completion**, not clicks
- Primary gets story frames and discovery; KS3 gets depth and assessment
- Don't chase primary by dumbing down KS3 content — serve each age with appropriate authoring rules

---

## 9. Roadmap Priorities (Recommended Order)

### Phase 1 — Stop engagement decay for Year 7 (current users)
1. Course-level mastery meter (% per topic)
2. Per-course leaderboard (class/cohort scoped)
3. Lesson/module completion states with visible progress bar
4. "Needs review" queue from wrong answers

### Phase 2 — Fix platform gaps blocking primary authoring
1. Publish 2–3 exemplar primary lessons using `primary-lesson-generator` skill (leverage built-in intro/slide/completion cues with playful titles)
2. Document the viewer UI cue system in `lesson-json/SKILL.md` (separate from legacy JSON component types)
3. Optional: primary UI theme (warmer colours, simpler labels on component chrome)

### Phase 3 — Primary as expert mode (not default product)
1. Market KS3+ as default
2. Offer primary as "guided authoring mode" for experienced teachers
3. Never auto-generate primary lessons with the KS3 skill

---

## 10. Key Quotes / Decisions Log

| Decision | Rationale |
|---|---|
| Don't permanently exclude Year 4/5 | Platform can serve them with different authoring — exclusion is a marketing/priority call, not a technical one |
| Exclude Year 4/5 from default target for now | Current skills, samples, and UI don't support them without expert effort |
| Year 7 = core user | Validated by student enjoyment; build scoring/leaderboard here first |
| Create `primary-lesson-generator` skill | Same components, different rules — not dumber content |
| Don't become Duolingo | Interaction-first yes; meaningless dopamine loops no |
| Scores must mean mastery | Points utility > more components |

---

## 11. Related Files

| File | Purpose |
|---|---|
| `skills/primary-lesson-generator/SKILL.md` | Authoring rules for Year 4–5 lessons |
| `skills/curriculum-lesson-generator/SKILL.md` | Authoring rules for KS3+ lessons |
| `skills/lesson-json/SKILL.md` | JSON schemas and component prop reference |
| `lessons/year4-science-lesson-1-mystery-of-matter.json` | Primary-leaning example (note: uses legacy `lessonIntro` JSON component — prefer built-in UI cues instead) |
| `lessons/year7-english-modals-lesson-*-extended.json` | KS3-depth example set |

---

## 12. Open Questions

- Should leaderboard reset weekly or persist for the whole course?
- Should primary lessons show points at all, or only stars/collectibles?
- Should mastery % be visible to students or only to tutors?
- When `introAudioUrl` / `titleAudioUrl` are published, should primary lessons auto-play them by default?

---

*Last updated: August 2026*
