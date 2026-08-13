# AST Platform — Gaps Audit (Honest)

Per-component audit of state persistence, collaborative features, offline storage, scoring, and navigation gating. Based on code review of the production viewer path (`LessonViewerUpload` → `LessonContent` → renderers).

**Date:** August 2026  
**Related:** [`progression-reward-layer-plan.md`](./progression-reward-layer-plan.md), [`platform-engagement-strategy.md`](./platform-engagement-strategy.md)

---

## 1. Executive summary

The platform has **two different persistence architectures**. Legacy interactive components (quiz, drag-drop, fill-in-the-blank) use a **continuous sync** pattern via `InteractiveRenderer` / `ScoredRenderer`. Most **newer components** use **local React state** and only call `setComponentState` on submit — with inconsistent or missing restore logic when the student clicks **Next → Previous** within the same lesson.

**Corrections from earlier audits:**

| Earlier claim | Actual behaviour |
|---|---|
| "Scores not restored on resume" | **Wrong for main viewer.** `LessonViewerUpload` restores `lessonState.score`, `totalScore`, and `initialComponentStates` from DB/sync. Quiz-era components restore fully. |
| "New components keep their state" | **Overstated.** Some do, many don't, several are partial. User-reported behaviour (complete → next → previous → gone) is real for specific components. |

**Severity tiers:**

| Tier | Meaning |
|---|---|
| 🔴 **Broken** | Complete work lost on Next → Previous (same session) |
| 🟠 **Partial** | Completion status survives but UI/answers wrong or blank |
| 🟡 **Submit-only** | In-progress work lost until final submit (by design, but inconsistent with quiz UX) |
| 🟢 **Works** | Full restore via `InteractiveRenderer` / `ScoredRenderer` |
| ⚪ **N/A** | Content-only, no meaningful state |

---

## 2. How persistence is supposed to work

```
Student interacts with component
        ↓
setComponentState(partialState)  →  LessonContent.componentStates[id]
        ↓
saveInteraction() every 30s + slide change + end lesson
        ↓
syncEngine → IndexedDB + localStorage + POST /api/interactions
        ↓
On resume: fetch interaction → initialComponentStates → savedState prop
```

**Within-session navigation (Next / Previous on same slide):**

- Only **one component mounted at a time** (`innerStepIndex`)
- Leaving a component **unmounts** it
- Returning remounts with `savedState={componentStates[componentId]}`
- Component must either:
  - **A)** Store all UI state in the object synced to parent (`InteractiveRenderer`), or
  - **B)** Read `savedState` on mount and rebuild UI (`useEffect`)

**Root cause pattern for bugs:** UI state split across **persisted parent state** vs **local `useState`**. Local-only state is destroyed on unmount.

---

## 3. Per-component state audit

Test scenario unless noted: **Complete activity → click Next → click Previous** (same lesson, same session, no page reload).

### 3.1 Tier A — Works (continuous sync via InteractiveRenderer / ScoredRenderer)

These store the full activity state in the parent `componentStates` object. Next → Previous restores correctly. DB resume also works.

| Component | Persisted state (examples) | Notes |
|---|---|---|
| `quiz` | `currentQuestion`, `selectedAnswer`, `isAnswered`, `score`, `isComplete`, `status` | Reference implementation |
| `dragDrop` | item positions, `isSubmitted`, `isCorrect` | |
| `fillInTheBlank` | `userAnswers`, `isSubmitted`, results | |
| `matchingPairs` | `matches`, `leftItems`, `rightItems`, selection | |
| `hotspot` | `discoveredHotspots`, `status` | |
| `codeEditor` | `code`, test results, `status` | |
| `poll` | `selectedOption`, `hasVoted`, `votes`, `status` | Own vote in component state; aggregates separate (see §5) |
| `wordCloud` | `submittedWords`, `wordCounts`, `isSubmitted`, `score` | Solo only — not collaborative despite label |
| `scaleSlider` | `selectedValue`, `isSubmitted`, `score` | Solo only |
| `shortAnswer` | `userResponse`, `isSubmitted`, tutor marks | |
| `flashcards` | `currentCardIndex`, `isFlipped`, `status` | |

---

### 3.2 Tier B — Partial restore (completion metadata survives, UI broken)

| Component | What survives Next → Previous | What is lost | Root cause |
|---|---|---|---|
| `multiSelectQuiz` | `questionsAnswered[]`, `questionsCorrect[]`, `scores[]`, `status`, `currentQuestion` | Selected options, checkmarks, green/red result styling, `showResult` | `selectedOptions` and `showResult` are **local `useState`** inside `MultiSelectContent`, never written to persisted state. `flashcardQuiz` solves this with a `useEffect` on `currentQuestion` — **multi-select does not**. |
| `flashcardQuiz` | Full restore including flips and selected option | `hasStarted` (live mode) resets | Has explicit restore `useEffect` reading `selectedAnswers[currentQuestion]` — **works by design** |
| `memoryGrid` | `matchedPairIds`, completion if finished | Card positions, flipped cards mid-game, in-progress layout | Cards **re-shuffle on every mount**; only saves on **full** grid completion |
| `wordScramble` | `selectedLetterIds`, `submitted` flag (if submitted) | Letter tile mapping, visual spelling | Letters **re-shuffle on mount** with new IDs; restored `selectedLetterIds` point to stale tile IDs |
| `spinTheWheel` | `spinsCompleted`, `correctCount`, `completedIds`, `activityDone` (if fully done) | Wheel rotation, current question card, `answerSubmitted`, mid-spin progress | Only calls `setComponentState` when **`requiredSpins` reached**; local spin UI not in saved payload |
| `categorise` | `assignments`, submitted UI (if check was clicked) | In-progress drag assignments before Check | Submit-only; restore works **after** check |
| `annotateImage` | `placements`, submitted UI (if check was clicked) | In-progress placements before Check | Submit-only; restore works **after** check |
| `trueFalse` | Answer + result styling (after brief empty flash) | — | Submit-only with `useEffect` restore from `savedState.selected`; usually works but **not** using `InteractiveRenderer` |

---

### 3.3 Tier C — Broken (complete → next → previous → gone)

| Component | Behaviour | Root cause |
|---|---|---|
| `timeline` | Clicking through all events shows completion; Next → Previous shows **fresh timeline at event 1**, no completion badge | **Zero `savedState` restore logic.** Saves only `{ status, score, maxScore }` but never reads it back. `activeEventIndex` and `completed` are local-only. |
| `accordion` | N/A — content | **No `setComponentState` at all** — open/closed panels not tracked |
| `callout` | N/A — content | **No `setComponentState` at all** |

**User-reported "everything gone" matches `timeline` exactly.** Also matches any component where the student clicked Next **before** submit fired (category map allows skip — see §6).

---

### 3.4 Submit-only components (in-progress always lost)

These only call `setComponentState` on final submit, not during interaction. Leaving mid-activity always loses work — unlike quiz which syncs each selection.

| Component | Saves when |
|---|---|
| `trueFalse` | On answer tap |
| `categorise` | On "Check" |
| `annotateImage` | On "Check Annotations" |
| `wordScramble` | On "Check Answer" |
| `memoryGrid` | On all pairs matched |
| `spinTheWheel` | On final required spin only |
| `timeline` | On last event click (but restore broken) |

---

### 3.5 Content / auto-complete components

| Component | Persistence |
|---|---|
| `paragraph`, `heading`, `bulletList` | `status: completed` on view timer / scroll |
| `image`, `table` | `status: completed` on acknowledge |
| `quote`, `callout`, `accordion`, `video`, `codeBlock` | No meaningful interaction state |

---

## 4. The multi-select quiz bug (detailed)

`flashcardQuiz` and `multiSelectQuiz` share the same multi-question pattern. Flashcard quiz **fixed** UI restore; multi-select **did not**.

**Persisted** (`MultiSelectQuizState` → parent):

```typescript
{
  currentQuestion: number
  questionsAnswered: boolean[]
  questionsCorrect: boolean[]
  scores: number[]
  status / isComplete
}
```

**Not persisted** (local `useState` in `MultiSelectContent`):

```typescript
const [selectedOptions, setSelectedOptions] = useState<string[]>([])
const [showResult, setShowResult] = useState(false)
```

**What the student sees after Previous:**

- Internal logic knows question N was answered (`questionsAnswered[N] === true`)
- UI shows unanswered question with no selections, no green/red, no "completed" styling
- Next button may still work (completion status in parent) but visual feedback is gone

**Fix pattern (already in `flashcard-quiz-renderer.tsx` lines 92–107):**

Add `selectedOptionsByQuestion: string[][]` to persisted state **or** add a `useEffect` on `currentQuestion` that sets `showResult = true` and restores selections when `questionsAnswered[currentQuestion]`.

---

## 5. Collaborative components audit

### 5.1 Poll

| Question | Answer |
|---|---|
| Fetches other students' responses? | **Yes — aggregate counts only** via `GET /api/polls` |
| When fetched? | Once at lesson load (`usePollStore`) — **not live updating** |
| Where stored? | Local JSON files: `data/polls/{lessonId}.json` — **not MongoDB** |
| Per-student vote tracked? | **No** — POST increments count anonymously |
| Duplicate votes prevented? | **No** — same student can vote again in a new session |
| Student's own vote saved? | **Yes** — in `componentsState` via `InteractiveRenderer` |
| Individual responses visible? | **No** — only `{ optionId: count }` totals |

**Production readiness:** Prototype / demo quality. Not suitable for real classroom aggregation without user deduplication and DB storage.

---

### 5.2 Word cloud

| Question | Answer |
|---|---|
| Fetches other students' words? | **No** |
| Shared cloud across class? | **No** — each student sees only their own words |
| API exists? | **None** |
| Label accuracy | UI says **"Live Word Cloud"** — misleading; it is solo |

**Production readiness:** Not collaborative. Would need a new aggregation API (similar to polls but storing word frequency per lesson/component).

---

### 5.3 Scale slider

| Question | Answer |
|---|---|
| Shows class average / distribution? | **No** |
| Shared data? | **No** — solo via `ScoredRenderer` |

---

### 5.4 Summary: collaborative feature status

| Component | Claimed behaviour | Actual behaviour |
|---|---|---|
| `poll` | Class voting | Aggregate counts from JSON file; no user identity |
| `wordCloud` | "Live" collaborative cloud | Solo word entry only |
| `scaleSlider` | Could be survey | Solo slider only |

---

## 6. Navigation gating bug (category map)

`LessonContent` uses `isInteractiveComponent()` from `lib/lesson-utils.ts` to decide:

- Must activity be completed before **Next** enables?
- Does activity count toward **slide completion**?
- Does activity count toward **slide progress %**?

**Missing from `COMPONENT_CATEGORY_MAP`** (default to `"content"` → treated as non-interactive):

`trueFalse`, `annotateImage`, `categorise`, `timeline`, `wordScramble`, `memoryGrid`, `spinTheWheel`, `shortAnswer`, `wordCloud`, `scaleSlider`

**Impact:**

- Student can click **Next without finishing** these activities
- Slide may mark **complete without doing them**
- `setComponentState` never called → **nothing to restore** on Previous
- Contributes to "everything gone" reports when student skips quickly

`component-renderer.tsx` lists these as interactive/gamified for rendering — **but gating uses `lesson-utils`, not `component-renderer`.**

---

## 7. Offline / local storage (overbuilt)

Current stack — all active in production viewer:

| Layer | File | Behaviour |
|---|---|---|
| IndexedDB | `lib/offline-store.ts` | Primary local cache + sync queue |
| localStorage | `lib/user-interactions.ts` | Backup + restore on network fail |
| SyncEngine | `lib/sync-engine.ts` | Queue, dedupe, 60s heartbeat, sync on `online` |
| Auto-sync | `user-interactions.ts` | On `window.online`, push all `ast_interaction_*` keys |

Every save: **local first, server second.**  
On exit (`handleEndLesson`): **saves again**, does not purge local data.

**Product direction (user decision):** Stop offline persistence. Purge local state when student navigates away. Server-only saves while lesson tab is open.

**Files to change when implementing:**

- `lib/user-interactions.ts` — remove localStorage read/write
- `lib/offline-store.ts` — remove or bypass
- `lib/sync-engine.ts` — simplify to direct API save
- `LessonViewerUpload.tsx` — purge on unmount / exit
- Remove `SyncStatusHUD` offline indicators if no longer relevant

---

## 8. Scoring gaps (brief)

Separate from state persistence but affects trust in the platform:

| Gap | Detail |
|---|---|
| Practice mode default | Extended lessons 1–4 all `mode: "practice"` → `totalScore = 0` |
| Standalone scorers | `trueFalse`, `categorise`, `wordScramble`, etc. don't call `addPoints()` — header score wrong in live mode |
| Split UI state | Even when `componentsState` has `score`, header uses `ScoringProvider` session counter |
| No reward utility | Scores don't unlock, aggregate, or leaderboard |

See [`progression-reward-layer-plan.md`](./progression-reward-layer-plan.md) for reward layer roadmap.

---

## 9. Architecture recommendation

**Standardise all interactive components on one pattern:**

```
ScoredRenderer or InteractiveRenderer
  └── useInteractiveState (continuous parent sync)
        └── All UI state in typed State object
              └── On remount: savedState ?? initialState
```

**Never split** persisted state (parent) vs display state (local `useState`) unless local is purely cosmetic (animations, hover).

**For multi-question components:** Follow `flashcardQuiz` restore pattern, not bare `multiSelectQuiz`.

---

## 10. Priority fix list

### P0 — Correctness (student-visible bugs)

| # | Fix | Effort |
|---|---|---|
| 1 | Add missing types to `COMPONENT_CATEGORY_MAP` | Hours |
| 2 | `timeline` — add full `savedState` restore (`activeEventIndex`, `completed`, read `status`) | Hours |
| 3 | `multiSelectQuiz` — persist selections per question + restore UI (copy flashcardQuiz pattern) | Half day |
| 4 | `wordScramble` — stable letter IDs across mounts (seed shuffle from component id) | Half day |
| 5 | `memoryGrid` — persist card order or derive from saved pairs | Half day |

### P1 — Consistency

| # | Fix | Effort |
|---|---|---|
| 6 | Migrate submit-only components to `InteractiveRenderer` | 2–3 days |
| 7 | `spinTheWheel` — save after each spin, restore wheel UI | 1 day |
| 8 | Wire standalone scorers to `addPoints()` in live mode | 1–2 days |

### P2 — Infrastructure / product

| # | Fix | Effort |
|---|---|---|
| 9 | Remove offline triple-store; server-only + purge on exit | 1–2 days |
| 10 | Polls → MongoDB + user deduplication | Days |
| 11 | Word cloud aggregation API (if collaboration wanted) | Days |
| 12 | Progression / reward layer | Weeks |

---

## 11. Component matrix (quick reference)

| Component | Architecture | Next→Prev restore | DB resume | Gating works |
|---|---|---|---|---|
| quiz | ScoredRenderer | 🟢 | 🟢 | 🟢 |
| dragDrop | ScoredRenderer | 🟢 | 🟢 | 🟢 |
| fillInTheBlank | ScoredRenderer | 🟢 | 🟢 | 🟢 |
| matchingPairs | ScoredRenderer | 🟢 | 🟢 | 🟢 |
| hotspot | ScoredRenderer | 🟢 | 🟢 | 🟢 |
| flashcardQuiz | ScoredRenderer + restore FX | 🟢 | 🟢 | 🟢 |
| poll | InteractiveRenderer | 🟢 | 🟢 | 🟢 |
| wordCloud | ScoredRenderer | 🟢 | 🟢 | 🔴 category map |
| scaleSlider | ScoredRenderer | 🟢 | 🟢 | 🔴 category map |
| shortAnswer | ScoredRenderer | 🟢 | 🟢 | 🔴 category map |
| multiSelectQuiz | ScoredRenderer, split state | 🟠 UI lost | 🟠 | 🟢 |
| trueFalse | Submit-only | 🟡 usually OK | 🟡 | 🔴 category map |
| categorise | Submit-only | 🟡 after submit | 🟡 | 🔴 category map |
| annotateImage | Submit-only | 🟡 after submit | 🟡 | 🔴 category map |
| wordScramble | Submit-only | 🔴 shuffle breaks | 🔴 | 🔴 category map |
| memoryGrid | Submit-only | 🟠 partial | 🟠 | 🔴 category map |
| spinTheWheel | Submit-only | 🟠 partial | 🟠 | 🔴 category map |
| timeline | Submit-only | 🔴 gone | 🔴 | 🔴 category map |
| flashcards | InteractiveRenderer | 🟢 | 🟢 | 🟢 |

---

## 12. Honest bottom line

This is **not** a goldmine with a config switch flipped. It is **not** a greenfield rebuild either.

**What works:** Lesson flow, slide unlock, legacy interactives, DB persistence, completion overlay, module completion API.

**What is seriously broken:** Newer component state on navigation, category map gating, collaborative features (prototype-only), offline over-engineering conflicting with current product goals.

**Fastest wins:** Category map fix + timeline restore + multi-select restore pattern. Those three alone would fix the most reported "I finished it and it disappeared" cases.

---

*Audit based on codebase review August 2026. Re-verify after renderer refactors.*
