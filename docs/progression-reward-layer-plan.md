# AST Platform — Progression & Reward Layer Plan

Technical audit of the current scoring, completion, and navigation infrastructure, plus a phased plan for building meaningful progression and rewards. Companion to [`platform-engagement-strategy.md`](./platform-engagement-strategy.md).

**Audience:** Product, engineering, and lesson authors  
**Date:** August 2026

---

## 1. Executive Summary

The platform already has a **working lesson engine** with slide gating, component completion, score tracking, persistence, and celebration UI. What it lacks is a **reward utility loop** — scores and completion states exist but rarely change what a student can do next, see on a dashboard, or compare with peers.

| Layer | Status | Notes |
|---|---|---|
| Component scoring (live mode) | ✅ Built | `ScoringProvider` + `ScoredRenderer` |
| Practice mode (zero stakes) | ✅ Built | By design — no points, unlimited retry |
| Slide unlock chain | ✅ Built | Completing slide N unlocks slide N+1 |
| Dynamic Next / End Lesson buttons | ✅ Built | Gated on component + navigation lock |
| Lesson completion overlay | ✅ Built | Confetti, score, accuracy, next lesson |
| Progress persistence | ✅ Built | MongoDB + localStorage offline |
| Lesson `markCompleted` API | ✅ Built | External backend call with final score % |
| Module lesson list (completed / in progress) | ✅ Built | Student module page |
| Course / module progress % | ⚠️ Partial | Depends on backend enrollment API |
| Per-course leaderboard | ❌ Not built | API client stub only |
| Cross-lesson mastery meter | ❌ Not built | No aggregation layer |
| Points spend / unlock logic | ❌ Not built | Points are display-only |
| Review queue from wrong answers | ❌ Not built | Wrong answers stored but unused |

**Root cause of “students don’t care about scores”:** Most authored lessons use **`mode: "practice"`**, so `totalScore` is 0, the header shows `0 / 0`, and the completion overlay defaults accuracy to 100%. Scores are real infrastructure with nothing meaningful to measure in most lessons today.

---

## 2. Infrastructure Audit

### 2.1 Scoring Architecture

```
Lesson JSON (components with mode + points)
        ↓
ScoringService.getTotalPossiblePoints()   ← only live mode + SCORED_COMPONENT_TYPES
        ↓
ScoringProvider (React context)
   currentScore / totalScore / percentage / isPerfect
        ↑
ScoredRenderer → useScoring hook → addPoints()   ← only when mode === 'live' AND correct
        ↓
LessonViewer → saveUserInteraction (score + totalScore)
        ↓
markCompleted(lessonId, finalScore%)   ← when all slides completed
```

**Key files:**

| File | Role |
|---|---|
| `context/scoring-context.tsx` | Global lesson score state |
| `services/scoring-service.ts` | Max points calculation, scored type list |
| `components/renderers/base/scored-renderer.tsx` | Wrapper for scored interactive components |
| `components/renderers/base/hooks.ts` | `handleScore`, `handlePoints`, practice vs live |
| `components/ui/score-display.tsx` | Sidebar score widget |
| `components/viewer/LessonCompletionOverlay.tsx` | End-of-lesson stats |

**Scored component types** (`ScoringService`):

`quiz`, `trueFalse`, `annotateImage`, `categorise`, `timeline`, `dragDrop`, `matchingPairs`, `fillInTheBlank`, `codeEditor`, `hotspot`, `flashcardQuiz`, `multiSelectQuiz`, `wordScramble`, `memoryGrid`, `spinTheWheel`

**Not in scored types:** `shortAnswer`, `wordCloud`, `scaleSlider`, `poll`, `flashcards` (by design or pending).

**Practice vs Live:**

| Behaviour | Practice | Live |
|---|---|---|
| Points added to context | ❌ | ✅ on correct |
| Retry allowed | ✅ | ❌ |
| Counts toward `totalScore` | ❌ | ✅ |
| Next button before timer | N/A | ✅ skip allowed until timer starts |
| Navigation lock during timer | N/A | ✅ via `NavigationLockContext` |

**Push model only:** Renderers call `addPoints()` at answer time. `ScoringService.calculateComponentScore()` is a stub (returns 0). Restoring score from saved `componentsState` on reload does **not** rehydrate `ScoringProvider` — only `initialScore` prop is supported and is rarely used.

---

### 2.2 How Components Handle Correct / Incorrect

Components fall into **three integration patterns**:

#### Pattern A — `ScoredRenderer` (centralised scoring)

Uses `handleScore(isCorrect)` → `addPoints(points)` in live mode only. Sets `status: 'completed'` via `InteractiveRenderer`.

| Component | Correct behaviour | Incorrect behaviour | Notes |
|---|---|---|---|
| `quiz` | +points per correct answer, success sound | incorrect sound, no points | Multi-question: points × question count in max |
| `dragDrop` | +points per item placed correctly | no points for wrong slot | Max = points × items |
| `matchingPairs` | +points per pair | — | Max = points × pairs |
| `fillInTheBlank` | +points per blank | — | Max = points × blanks |
| `hotspot` | +points when all hotspots found | miss feedback | Single award at completion |
| `flashcardQuiz` | +points on correct card | `handleScore(false)` on wrong | Card-by-card |
| `multiSelectQuiz` | +points on correct submission | penalty path on wrong | |
| `codeEditor` | +points when tests pass | — | |
| `shortAnswer` | tutor/manual or auto-mark path | — | Uses ScoredRenderer |
| `scaleSlider` | range-based scoring | — | Uses ScoredRenderer |
| `wordCloud` | participation scoring | — | Uses ScoredRenderer |

#### Pattern B — Standalone (local score in state, no `addPoints`)

Sets `setComponentState({ status: 'completed', score, maxScore, isCorrect })` directly. **Does not feed `ScoringContext`** even in live mode.

| Component | Correct | Incorrect | Gap |
|---|---|---|---|
| `trueFalse` | score = points, success sound | score = 0, incorrect sound | Not wired to context |
| `categorise` | partial/full points by item | partial points | Not wired to context |
| `wordScramble` | full points | 0 points | Not wired to context |
| `memoryGrid` | points by moves/time | — | Not wired to context |
| `spinTheWheel` | points on spin result | — | Not wired to context |
| `annotateImage` | points on labels | — | Not wired to context |
| `timeline` | ordering score | — | Not wired to context |

#### Pattern C — Interactive only (completion, no points)

| Component | Completion trigger |
|---|---|
| `poll` | After vote submitted |
| `flashcards` | After all cards viewed/flipped |

#### Pattern D — Content (auto-complete)

`paragraph`, `heading`, `bulletList`, `image`, `table`, `callout`, `accordion`, `quote` — mark `status: 'completed'` on render/acknowledge. No scoring.

---

### 2.3 Navigation & the Dynamic Next Button

**Viewer model:** One component visible per slide (`innerStepIndex`). Footer has Previous + Next (or Next Slide / End Lesson).

**Next button enabled when:**

1. `NavigationLockContext.isLocked === false` (no active live timer lock)
2. Current component is “complete” **OR** is live mode (live always passes completion check — timer lock handles gating instead)
3. Not mid-navigation debounce (500 ms)

**Button labels & styling:**

| Position | Label | Style |
|---|---|---|
| Mid-slide | `Next` | Green |
| Last component, not last slide | `Next Slide` | Next slide’s theme colour |
| Last component, last slide | `End Lesson` | Rose |

**Live mode nuance:** Before a timer starts, student can skip. Once timer registers a lock, Next is disabled until time expires or activity completes.

**Slide completion (`performCompletionCheck`):**

- Collects components where `isInteractiveComponent(type)` is true
- If none → slide auto-completes on view
- If all have `componentStates[id].status === 'completed'` → slide marked completed, next slide `state: 'active'`, `levelUp` sound
- Triggers `onSlidesUpdate` → persistence + optional `markCompleted` when **all** slides done

**End Lesson flow:**

1. Student clicks **End Lesson** (last slide, last component)
2. If all slides completed → `LessonCompletionOverlay` (confetti, slides cleared, score, accuracy %, next lesson CTA)
3. If incomplete → `IncompleteLessonModal` (keep learning vs end anyway; ending early does **not** mark lesson completed)

---

### 2.4 UI Cue System (Built-In Overlays)

These are **viewer chrome**, not lesson JSON component types. Legacy JSON types `lessonIntro`, `lessonSummary`, `lessonComplete` hit the fallback renderer and are separate from this system.

| Overlay | Trigger | Purpose |
|---|---|---|
| `LessonIntroCueOverlay` | Lesson load | Title, description, slide grid, intro audio / TTS, 30 s skip |
| `SlideTransitionOverlay` | Slide change | Slide title, themed background, title audio, 10 s countdown |
| `LessonCompletionOverlay` | All slides done + End Lesson | Celebration, stats, review / exit / next lesson |

**Already usable for progression framing:** Intro can set expectations (“3 challenges, 1 assessment”). Completion overlay already shows mastery-style accuracy — it just needs non-zero `totalPossibleScore` to mean anything.

---

### 2.5 Persistence & Backend Integration

**Saved per user + lesson** (`lib/user-interactions.ts` → `/api/interactions` → MongoDB):

```typescript
{
  componentsState: Record<componentId, { status, score, maxScore, ...answers }>,
  lessonState: {
    slides: [{ id, state, status }],
    currentSlideIndex,
    progress,        // % slides completed
    score,           // currentScore at save time
    totalScore       // totalPossibleScore at save time
  }
}
```

- Auto-save every 30 s + on slide change + on end lesson
- Offline: localStorage cache with sync on reconnect
- Tutor marking merge preserves tutor marks on student saves

**Lesson completion:** `POST /lessons/{id}/complete` with `{ score: finalPercentage }` — called automatically when all slides reach `status: 'completed'`.

**Student dashboard surfaces (real data):**

| Surface | Data source | What it shows |
|---|---|---|
| Module lesson list | Backend lesson API | `completed`, `progress`, `score`, `totalScore` |
| Module completion % | Count of `lesson.completed` | Binary per lesson |
| Program progress % | Enrollment API | `percent_complete` or module count |
| Student home | Lesson list API | In-progress vs completed counts |
| Progress page | — | Placeholder (“coming soon”) |
| Sidebar ScoreDisplay | Live session only | Points during lesson |

---

### 2.6 Critical Gaps & Bugs

#### Gap 1 — Category map out of sync (HIGH)

`lib/lesson-utils.ts` → `COMPONENT_CATEGORY_MAP` is missing newer types. They default to `"content"`, so `isInteractiveComponent()` returns **false**.

**Affected types:** `trueFalse`, `annotateImage`, `categorise`, `timeline`, `wordScramble`, `memoryGrid`, `spinTheWheel`, `shortAnswer`, `wordCloud`, `scaleSlider`

**Impact:**

- Next button does **not** wait for completion
- Slide completion check **ignores** these components
- Slide progress % undercounts activities
- Students can skip gamified components entirely

`component-renderer.tsx` lists these as interactive — **viewer gating uses `lesson-utils`, not `component-renderer`**.

#### Gap 2 — Standalone scorers don’t feed context (MEDIUM)

Pattern B components store `score` in `componentsState` but never call `addPoints()`. In live assessment lessons using `trueFalse`, `categorise`, `wordScramble`, etc., header score and completion overlay **under-report** even when mode is live.

#### Gap 3 — Score not restored on resume (MEDIUM)

`ScoringProvider` starts at 0 unless `initialScore` is passed. Saved `componentsState` scores are not summed back into context on load.

#### Gap 4 — Authoring defaults to practice (HIGH — product, not code)

Extended modal lessons 1–4 use `"mode": "practice"` throughout. Lesson 5 (assessment) uses `"mode": "live"`. Students experience scores only on the final lesson.

#### Gap 5 — No cross-lesson aggregation (BY DESIGN — not built)

Completion and score are per-lesson. No course mastery %, no leaderboard storage, no “personal best” history.

#### Gap 6 — Progress page is empty

`app/dashboard/student/progress/page.tsx` is a placeholder. Rich analytics UI does not exist yet (see also `dashboard_audit.md.resolved` for removed fake XP/streak data).

---

## 3. What You Can Build Easily (Current Infra)

These require **configuration, small fixes, or UI wiring** — no new backend domain model.

### 3.1 Fix category map (1–2 hours) — **Do first**

Add missing types to `COMPONENT_CATEGORY_MAP`:

| Type | Category |
|---|---|
| `trueFalse`, `annotateImage`, `categorise`, `timeline`, `shortAnswer` | `interactive` |
| `wordScramble`, `memoryGrid`, `spinTheWheel`, `wordCloud`, `scaleSlider` | `gamified` |

Extend `scripts/test-scoring.ts` to assert these pass `isInteractiveComponent()`.

**Unlocks:** Correct Next button gating, slide completion, and progress % for all new components.

---

### 3.2 Wire Pattern B components to `ScoredRenderer` or `addPoints` (1–2 days)

Wrap or inject `useScoring` in standalone renderers so live mode awards points consistently.

**Unlocks:** Accurate header score and completion overlay for assessment lessons using new component types.

---

### 3.3 Restore score from saved state on lesson load (half day)

On interaction fetch, sum `componentsState[*].score` for live components (or replay from states) and pass as `ScoringProvider initialScore`.

**Unlocks:** Resume mid-lesson with correct score display.

---

### 3.4 Authoring policy: practice vs live (immediate — no code)

| Lesson role | Recommended `mode` | Points |
|---|---|---|
| Intro / teach | `practice` | 0 or omit |
| Guided practice | `practice` | 0 |
| Checkpoint quiz | `live` | 10–25 per item |
| Module assessment | `live` | weighted |
| Primary (Y4–5) | `practice` only | 0 |

**Unlocks:** Meaningful scores on assessment without changing engine code.

---

### 3.5 Surface existing completion data on dashboards (1–3 days)

Already available from API on module page:

- Lesson `completed` badge ✅
- `progress` % while in progress ✅
- `score / totalScore` in lesson detail modal ✅

**Easy additions:**

- Show **best score %** on completed lesson cards (data may already exist from `markCompleted`)
- Module hero: “Average assessment score” from completed lessons
- Student home: “Continue where you left off” using `currentSlideIndex` from interactions API

---

### 3.6 Use completion overlay as mastery moment (config only)

When assessment lessons use live mode + points:

- Accuracy % becomes a real mastery signal
- “Perfect score” trophy already in `ScoreDisplay` when `isPerfect`
- Next lesson CTA already wired when `nextLesson` prop is passed

**Unlocks:** Udemy-style lesson completion without new features.

---

### 3.7 Slide unlock as progression (already works)

Sequential slide unlock (`state: 'disabled'` → `'active'`) is built-in. Authors can structure:

1. Teach slides (content-heavy)
2. Practice slide (practice mode)
3. Gate assessment slide behind prior completion

No code change — pure lesson JSON structure.

---

### 3.8 Feedback & celebration layer (already works)

| Event | Feedback |
|---|---|
| Correct answer | `quizSuccess` sound + visual |
| Incorrect | `incorrect` sound |
| Slide complete | `levelUp` sound |
| Lesson complete | `finishedLesson` + confetti |
| Incomplete exit | `incorrect` on modal |

Tune lesson copy and component placement for primary vs secondary — overlays are age-neutral.

---

### 3.9 Tutor-visible attempt data (already works)

`componentsState` persists answers, `isCorrect`, scores. Tutor dashboard can read interaction API (existing merge logic for tutor marks).

**Unlocks:** Formative review without gamification.

---

## 4. What Needs a New Layer (Build or Plug-and-Play)

These require **new backend entities, aggregation jobs, or third-party integration**.

### 4.1 Course / module mastery meter

**Need:** Aggregate `markCompleted` scores + component-level correctness across lessons into one % per skill/module.

**Options:**

| Approach | Effort | Notes |
|---|---|---|
| **Build:** `course_progress` collection, nightly rollup job | Medium | Full control, Khan-style mastery |
| **Plug-and-play:** Analytics pipeline (Mixpanel, Amplitude) | Low–medium | Dashboards external to app |
| **Minimal:** Compute on read from `interactions` collection | Medium | No new storage, slower at scale |

**Recommendation:** Start with on-read aggregation from existing `interactions` for one pilot course.

---

### 4.2 Per-course leaderboard

**Need:** Scoped rankings (class/cohort), stored scores, anti-cheat (use server-side final score only).

**API stub exists:** `getMyProgramProgress` — leaderboard endpoint does not.

| Approach | Effort |
|---|---|
| **Build:** `leaderboard_entries` per program + week/course scope | Medium |
| **Plug-and-play:** Firebase / Supabase realtime leaderboard | Low–medium |
| **Avoid:** Global all-time board (demotivates bottom third) |

**Include:** “Most improved this week” metric alongside top score (per engagement strategy).

---

### 4.3 Personal best & retry motivation

**Need:** Store `{ userId, lessonId, bestScore, attemptCount, lastAttemptAt }`.

Not in current schema. `markCompleted` may overwrite — verify backend behaviour.

**Unlocks:** “Beat your best: 72% → ?” on lesson card.

---

### 4.4 Unlock rules beyond slide chain

**Examples:**

- Assessment locked until ≥80% on practice lessons
- Bonus content unlocked at perfect score
- Module certificate at 100% lesson completion

**Need:** Rule engine reading aggregated progress — not in lesson JSON alone.

**Minimal v1:** Backend flag on lesson `prerequisites: [lessonId]` checked before launch.

---

### 4.5 Review queue from wrong answers

**Need:** Index `componentsState` where `isCorrect === false`, surface “3 items to review” on dashboard.

Data exists in interactions; no UI or spaced-repetition scheduler.

**Build:** Review page filtering interactions → generate mini-lesson or deep-link to slide/component.

---

### 4.6 Points economy (spend / earn)

Current points are **session-only** (except saved totals in interaction). No wallet, shop, or unlock spend.

**Recommendation:** Defer explicit “coin shop” unless tied to real unlocks. Prefer **mastery %** over spendable currency (avoids Duolingo empty dopamine).

---

### 4.7 Streaks & daily goals

Sound effect exists (`streak.mp3`); **no streak tracking**. Engagement strategy explicitly deprioritises attendance streaks.

If built: tie to “completed a learning objective” not “opened app”.

---

### 4.8 Certificates & credentials

**Need:** PDF/badge generation on course completion, verifiable credential store.

**Plug-and-play:** Accredible, Credly  
**Build:** Template + `course_completed` event

---

### 4.9 Primary-friendly progression (without fake XP)

Primary needs **story progression** not points:

| Built today | New layer needed |
|---|---|
| Slide unlock chain | Chapter map UI (cosmetic wrapper) |
| Completion overlay | Character / sticker collectibles tied to slide complete |
| Practice-only mode | Parent/tutor progress email |

Cosmetic layer can sit **on top of** existing completion events without changing scoring.

---

## 5. Recommended Roadmap

### Phase 0 — Fix foundation (1 week)

1. Fix `COMPONENT_CATEGORY_MAP` (Gap 1)
2. Wire Pattern B scorers to context (Gap 2)
3. Restore score on resume (Gap 3)
4. Update extended lessons 1–4: keep practice; ensure lesson 5 assessment uses live + points on all scored types
5. Extend `test-scoring.ts` for new types

**Outcome:** Assessment scores are trustworthy; navigation gating works for all components.

---

### Phase 1 — Make rewards visible (2–3 weeks, mostly UI)

1. Lesson cards show score % when completed
2. Module page: average score + completion count
3. Pass `nextLesson` from module context into viewer (verify end-to-end)
4. Replace progress page placeholder with real data from interactions + completions
5. Document practice vs live in `skills/lesson-json/SKILL.md`

**Outcome:** Students see progress that reflects actual work — Khan-style completion map.

---

### Phase 2 — Course-level progression (4–6 weeks, backend)

1. Prerequisites on lessons (simple unlock rules)
2. On-read mastery aggregation for module
3. Personal best per lesson
4. Pilot leaderboard for one Year 7 cohort

**Outcome:** Scores connect to visibility and light social motivation.

---

### Phase 3 — Learning loop (8+ weeks)

1. Review queue from wrong answers
2. Spaced retry suggestions
3. Course certificate on module complete
4. Primary chapter map (cosmetic progression)

**Outcome:** Full “substance + interaction” model from engagement strategy.

---

## 6. Component Reference — Scoring & Gating Matrix

| Component | Category map today | Interactive gating | ScoredRenderer | Live → context | Stores score in state |
|---|---|---|---|---|---|
| quiz | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| dragDrop | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| matchingPairs | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| fillInTheBlank | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| hotspot | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| flashcardQuiz | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| multiSelectQuiz | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| codeEditor | ✅ interactive | ✅ | ✅ | ✅ | ✅ |
| flashcards | ✅ gamified | ✅ | ❌ | ❌ | ✅ |
| poll | ✅ interactive | ✅ | ❌ | ❌ | ✅ |
| trueFalse | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| categorise | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| annotateImage | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| timeline | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| wordScramble | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| memoryGrid | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| spinTheWheel | ❌ → content | ❌ **BUG** | ❌ | ❌ | ✅ |
| shortAnswer | ❌ → content | ❌ **BUG** | ✅ | ✅ | ✅ |
| wordCloud | ❌ → content | ❌ **BUG** | ✅ | ✅ | ✅ |
| scaleSlider | ❌ → content | ❌ **BUG** | ✅ | ✅ | ✅ |
| paragraph, heading, etc. | ✅ content | auto-complete | ❌ | ❌ | ❌ |

---

## 7. Plug-and-Play vs Build Decision Guide

| Feature | Recommendation | Rationale |
|---|---|---|
| Fix gating & scoring bugs | **Build** | Core product correctness |
| Module completion UI | **Build** | Data already exists |
| Mastery % | **Build** (minimal rollup) | Needs tight integration with lessons |
| Leaderboard | **Build** (scoped) or Supabase | Must match cohort model |
| Analytics dashboards | **Plug-and-play** (Mixpanel/Amplitude) | Faster than custom charts |
| Certificates | **Plug-and-play** initially | Commodity feature |
| Streaks | **Don’t build** yet | Conflicts with strategy |
| XP / coin shop | **Don’t build** | Empty dopamine risk |
| Primary sticker map | **Build** (frontend-only) | Thin layer on completion events |

---

## 8. Success Metrics

After Phase 0 + 1, expect:

- Assessment lessons show non-zero accuracy on completion overlay
- Module page reflects real scores from `markCompleted`
- Students cannot skip interactive components on gated slides
- Year 7 cohort can see “3/5 lessons complete, avg 78%” without new gamification

After Phase 2:

- Measurable increase in assessment retry rate (personal best)
- Leaderboard participation without completion rate drop (avoid shame design)

---

## 9. Related Documents

- [`platform-engagement-strategy.md`](./platform-engagement-strategy.md) — Why scores fail to motivate; audience segmentation
- [`skills/lesson-json/SKILL.md`](../skills/lesson-json/SKILL.md) — Authoring reference (should document mode + UI cues)
- [`skills/primary-lesson-generator/SKILL.md`](../skills/primary-lesson-generator/SKILL.md) — Primary-safe authoring
- `dashboard_audit.md.resolved` — Fake dashboard data removed; progress page still stub

---

*This plan reflects the codebase as of August 2026. Re-audit after major renderer or API changes.*
