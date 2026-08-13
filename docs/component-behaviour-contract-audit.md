# AST Platform — Component Behaviour Contract Audit

Every renderer checked against the **existing shapes and contracts** already in the codebase — not persistence alone, but full predictable behaviour: gating, live/practice mode, scoring, retry, tutor marking, collaboration, feedback, and state lifecycle.

**Date:** August 2026  
**Related:** [`component-architecture-audit.md`](./component-architecture-audit.md), [`platform-gaps-audit.md`](./platform-gaps-audit.md)

---

## 1. What "predictable behaviour" means here

Your codebase already defines contracts in these files:

| Contract | Location | What it governs |
|---|---|---|
| **InteractiveRenderer** | `base/interactive-renderer.tsx` | All UI state in one object; continuous sync to parent |
| **ScoredRenderer** | `base/scored-renderer.tsx` | Interactive + `handleScore` / `handlePoints` / `handleRetry` |
| **useScoring** | `base/hooks.ts` | Live = points + no retry; practice = no points + retry allowed |
| **Live mode trio** | `components/live-mode/` | `LiveStartScreen` → `LiveTimer` → `NavigationLock` |
| **Tutor marking** | `lib/tutor-marking-contract.ts` | `isInputDisabled`, `shouldShowRetry`, `isItemApproved` |
| **Category gating** | `lib/lesson-utils.ts` | `isInteractiveComponent()` → blocks Next, slide completion |
| **Collaborative store** | `hooks/use-poll-store.ts` | Fetch/submit aggregate data (polls only today) |
| **Viewer navigation** | `LessonContent.tsx` | One component at a time; live can skip until timer starts |

**Predictable** = a component implements the contracts appropriate to its category.  
**Today:** ~13 components do. ~8 follow none of them. The rest are partial.

---

## 2. Behaviour tiers (reference implementations)

### Tier 0 — Content (view / acknowledge)

**Contract:** Optional `setComponentState({ status: 'completed' })` on view. No gating required. No scoring.

### Tier 1 — Interactive (must complete, no points)

**Contract:** `InteractiveRenderer` + registered in category map + `status: completed`.

**Reference:** `poll` (minus collaborative/live gaps)

### Tier 2 — Scored interactive (points in live mode)

**Contract:** Everything in Tier 1, plus:

- `ScoredRenderer`
- `mode: 'practice' | 'live'` prop
- Live mode: start screen + timer + navigation lock
- Practice mode: `handleRetry()` (not custom reset that bypasses rules)
- `handleScore` / `handlePoints` for context scoring

**Reference:** `quiz`, `matchingPairs`, `fillInTheBlank` (near-complete)

### Tier 3 — Scored + tutor marking

**Contract:** Tier 2 plus `tutor-marking-contract` helpers.

**Reference:** `shortAnswer` (only component that fully uses the contract)

### Tier 4 — Collaborative

**Contract:** Tier 1/2 plus server aggregate store hook.

**Reference:** `poll` (partial — store exists, storage is prototype-grade)

---

## 3. Master behaviour matrix

Legend: ✅ implements | ⚠️ partial | ❌ missing | — not applicable

| Component | Tier | Wrapper | Gated¹ | Persist² | Restore³ | `mode` prop | Live start | Live timer | Nav lock | Context score⁴ | Practice retry⁵ | Tutor contract⁶ | Collab⁷ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **quiz** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ handleRetry | ❌ | — |
| **dragDrop** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | — |
| **matchingPairs** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | — |
| **fillInTheBlank** | 3 | Scored | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ inline | — |
| **flashcardQuiz** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ no retry | ❌ | — |
| **shortAnswer** | 3 | Scored | 🔴 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ contract | ✅ | — |
| **multiSelectQuiz** | 2 | Scored | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | — |
| **hotspot** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ once | ✅ | ❌ | — |
| **codeEditor** | 2 | Scored | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ❌ | — |
| **wordCloud** | 2 | Scored | 🔴 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ fake live |
| **scaleSlider** | 2 | Scored | 🔴 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | — |
| **poll** | 4 | Interactive | ✅ | ✅ | ✅ | ⚠️ ignored | ❌ | ❌ | ❌ | — | ❌ | ❌ | ⚠️ |
| **flashcards** | 1 | Interactive | ✅ | ✅ | ✅ | ⚠️ no UI | ❌ | ❌ | ❌ | — | ❌ | — | — |
| **trueFalse** | 2 | ❌ standalone | 🔴 | ⚠️ submit | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ local | ❌ | ❌ | — |
| **categorise** | 2 | ❌ standalone | 🔴 | ⚠️ submit | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ local | ⚠️ custom reset | ❌ | — |
| **annotateImage** | 2 | ❌ standalone | 🔴 | ⚠️ submit | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ local | ⚠️ custom reset | ❌ | — |
| **timeline** | 1 | ❌ standalone | 🔴 | ⚠️ submit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ local | ❌ | — | — |
| **wordScramble** | 2 | ❌ standalone | 🔴 | ⚠️ submit | ❌ shuffle | ❌ | ❌ | ❌ | ❌ | ❌ local | ⚠️ custom reset | ❌ | — |
| **memoryGrid** | 2 | ❌ standalone | 🔴 | ⚠️ end only | ❌ shuffle | ❌ | ❌ | ❌ | ❌ | ❌ local | ⚠️ custom reset | ❌ | — |
| **spinTheWheel** | 2 | ❌ standalone | 🔴 | ⚠️ end only | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ local | ⚠️ custom reset | ❌ | — |
| **paragraph** | 0 | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| **heading** | 0 | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| **bulletList** | 0 | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| **image** | 0 | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| **table** | 0 | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| **callout** | 0 | — | — | ❌ | ❌ | — | — | — | — | — | — | — | — |
| **accordion** | 0 | — | — | ❌ | ❌ | — | — | — | — | — | — | — | — |
| **quote** | 0 | — | — | ❌ | ❌ | — | — | — | — | — | — | — | — |
| **video** | 0 | — | — | ❌ | ❌ | — | — | — | — | — | — | — | — |
| **codeBlock** | 0 | — | — | ❌ | ❌ | — | — | — | — | — | — | — | — |

¹ **Gated** = in `lesson-utils` `COMPONENT_CATEGORY_MAP` as interactive/gamified  
² **Persist** = continuous sync vs submit-only  
³ **Restore** = Next → Previous or DB resume shows same UI  
⁴ **Context score** = `addPoints()` via `handleScore`/`handlePoints` in live mode  
⁵ **Practice retry** = uses `handleRetry()` respecting live block  
⁶ **Tutor contract** = uses `isInputDisabled` / `shouldShowRetry` / `isItemApproved`  
⁷ **Collab** = server aggregate + store hook  

🔴 = missing from category map → **not gated** even if everything else works

---

## 4. Per-component behaviour notes

### Scored tier — mostly compliant (legacy core)

#### `quiz` ✅ Reference implementation
- Full ScoredRenderer + live trio + retry + continuous persist
- Live: tap-to-answer (no separate Check step)
- Practice: Check → Next Question → Retry on complete

#### `dragDrop` ✅
- Matches quiz pattern for live/practice/retry/persist

#### `matchingPairs` ✅
- Full live trio; retry resets pairs

#### `fillInTheBlank` ⚠️ Tutor marking inline, not contract helpers
- Has `markingMode: self-mark | tutor-mark`, pending state, tutor approval UI
- Implements tutor **behaviour** but duplicates logic instead of importing `shouldShowRetry` / `isInputDisabled`
- Retry uses `handleRetry` ✅

#### `flashcardQuiz` ⚠️ No practice retry
- Full live trio; restore `useEffect` on question change ✅ (multi-select should copy this)
- Once complete, no retry path in practice mode

#### `shortAnswer` ✅ Best tutor contract — 🔴 not gated
- Only renderer using `tutor-marking-contract` imports properly
- Missing from category map → Next not blocked

#### `multiSelectQuiz` ⚠️ Split state bug
- Has live trio and ScoredRenderer wrapper
- **Local `selectedOptions` + `showResult` not in persisted state** → UI lost on navigate
- No practice retry
- Does not copy flashcardQuiz restore pattern despite identical multi-question shape

#### `hotspot` ⚠️ Live mode incomplete
- Has `mode` prop and `handleScore` / `handleRetry`
- **No** LiveStartScreen, LiveTimer, NavigationLock
- Live mode behaviour undefined vs other scored components
- `behavior: 'discovery'` vs `'quiz'` changes scoring path

#### `codeEditor` ⚠️ Live mode incomplete
- Shows "Live" badge when `isLive` but **no** start screen, timer, or nav lock
- Submitted state locks in live; retry in practice via `handleRetry`
- Scoring only on all tests pass (`handleScore(true)`)

#### `wordCloud` ⚠️ Misleading + not gated
- Full live trio implemented
- Labelled "Live Word Cloud" but **solo only** — no class aggregate
- No practice retry after submit
- Missing from category map

#### `scaleSlider` ⚠️ Not gated, no retry
- Full live trio
- Submit once, no retry in practice
- Missing from category map

---

### Interactive tier

#### `poll` ⚠️ Collaborative prototype
- InteractiveRenderer ✅ — persist and restore own vote
- `mode` prop exists in JSON but **no live UI** (no timer, lock, start screen)
- `usePollStore` fetches aggregates once at lesson start
- POST to JSON file — no user deduplication
- Cannot change vote after submit (OK) but counts can be inflated across sessions

#### `flashcards` ⚠️ Mode prop unused
- InteractiveRenderer ✅ — card index persists
- `mode: live` passed to content but **no live behaviour** (no timer, lock, scoring)
- Completion = view all cards; no retry concept

---

### Standalone tier — unpredictable (new components)

These **ignore all wrappers** and reimplement subsets of behaviour ad hoc.

#### `trueFalse` ❌
| Expected (Tier 2) | Actual |
|---|---|
| `mode` practice/live | **No mode prop** — always same behaviour |
| ScoredRenderer | Standalone |
| Context scoring in live | Saves `score` locally, **never `addPoints()`** |
| Gated | **Not in category map** |
| Retry | One shot only — no retry even in practice |
| Restore | ⚠️ `useEffect` on `savedState.selected` — works if saved |

#### `categorise` ❌
| Expected | Actual |
|---|---|
| Partial credit scoring to context | Local score only |
| mode / live | **No mode prop** |
| Retry | Custom `handleReset` — **does not use `handleRetry`**, clears without feedback rules |
| Gated | **Not in category map** |

#### `annotateImage` ❌
Same pattern as categorise — submit-only, custom reset, no mode, not gated, no context scoring.

#### `timeline` ❌ Worst restore
| Expected | Actual |
|---|---|
| InteractiveRenderer | Standalone |
| Restore position + completion | **No savedState read at all** |
| Saves | `{ status, score, maxScore }` only on last event click |
| After Next → Previous | Fresh timeline at event 1 |

#### `wordScramble` ❌
- No mode, not gated, no context scoring
- Custom retry resets local state **without clearing parent `componentsState`**
- Letter shuffle on remount **breaks** restored `selectedLetterIds`

#### `memoryGrid` ❌
- Saves only on **full** grid complete
- Mid-game progress lost on navigate
- Card shuffle breaks visual restore
- Custom reset, no mode, not gated

#### `spinTheWheel` ❌
- Saves only when `requiredSpins` reached
- Mid-game spin progress lost on navigate
- `useState(savedState?....)` init only — no sync if savedState arrives late
- Custom reset, no mode, not gated

---

### Content tier

#### `paragraph`, `heading`, `bulletList` ✅
- Timer/scroll → `status: completed`; restore works

#### `image`, `table` ✅
- Acknowledge → completed; restore works

#### `callout`, `accordion`, `quote`, `video`, `codeBlock` — display only
- No `setComponentState` — acceptable for pure content
- Accordion open/closed state **not tracked** — cannot resume which panel was open
- Video watch progress not tracked

---

## 5. Cross-cutting behaviour gaps

### 5.1 Live mode is inconsistent

**Full live trio (start + timer + lock):**  
quiz, dragDrop, matchingPairs, fillInTheBlank, flashcardQuiz, multiSelectQuiz, shortAnswer, wordCloud, scaleSlider

**Partial or none:**

| Component | Has mode prop | Live actually works |
|---|---|---|
| hotspot | ✅ | ❌ no timer/lock/start |
| codeEditor | ✅ | ❌ badge only |
| poll | ✅ | ❌ ignored |
| flashcards | ✅ | ❌ ignored |
| trueFalse, categorise, timeline, wordScramble, memoryGrid, spinTheWheel, annotateImage | ❌ | ❌ |

**Student expectation:** `mode: "live"` everywhere means timed, single-attempt, points count. **That is only true for ~10 components.**

---

### 5.2 Practice retry is inconsistent

**Uses `handleRetry()` (respects live block):**  
quiz, dragDrop, matchingPairs, fillInTheBlank, hotspot, codeEditor, shortAnswer

**Custom reset (may leave parent state stale):**  
categorise, annotateImage, wordScramble, memoryGrid, spinTheWheel

**No retry at all:**  
trueFalse, flashcardQuiz, multiSelectQuiz, wordCloud, scaleSlider, poll, flashcards, timeline

---

### 5.3 Tutor marking contract — defined but barely used

`lib/tutor-marking-contract.ts` documents rules for **every submittable component**.

**Actually imports contract:** `shortAnswer` only

**Inline duplicate logic:** `fillInTheBlank`

**Should use contract but don't:** categorise, annotateImage, trueFalse, multiSelectQuiz, codeEditor

---

### 5.4 Scoring to header context

**Via `handleScore` / `handlePoints` (live mode):** ScoredRenderer components

**Local `score` in state only (header stays wrong):**  
trueFalse, categorise, annotateImage, timeline, wordScramble, memoryGrid, spinTheWheel

---

### 5.5 Feedback sounds

Most interactives use `useFeedback` for correct/incorrect/click. Consistent enough.

**Gap:** Custom reset buttons on standalone components often skip `handleRetry` → no standardized click feedback on retry.

---

### 5.6 `isEditing` preview

Most renderers check `isEditing` and show a simplified preview. Standalone components do this ad hoc — generally OK.

---

### 5.7 Disabled slide state

`component-renderer.tsx` passes `setComponentState: undefined` when `component.state === "disabled"`. All tiers respect this ✅

---

## 6. Why behaviour feels unpredictable

It is not one bug. It is **six contracts with optional adoption**:

```
                    quiz (reference)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ScoredRenderer   Live trio    Category map
         │               │               │
    ┌────┴────┐     ┌────┴────┐    ┌────┴────┐
    │         │     │         │    │         │
  legacy   multi-  full    partial  in map  NOT in map
  core     select  (10)    (4)              (10+)
           bug
```

**New components typically implement:**
- ✅ Visual UI
- ✅ `useFeedback` sounds
- ⚠️ `setComponentState` on submit (sometimes)
- ❌ ScoredRenderer wrapper
- ❌ Live trio
- ❌ Category map entry
- ❌ Context scoring
- ❌ Tutor contract
- ❌ Restore on remount

---

## 7. Is this a wide gap or fixable incrementally?

| Question | Answer |
|---|---|
| Wide architectural gap? | **Yes in enforcement**, **no in foundations** — contracts exist, adoption is spotty |
| Every component own thing? | **Legacy core: shared shape. New 8: yes, each different.** |
| Big overhaul? | **Medium** — enforce existing contracts, don't invent new ones |
| Breaking for lesson JSON? | **No** — internal renderer changes |
| Breaking for students? | **Gating fixes change behaviour** (must finish activities — correct) |
| Breaking saved state? | **No** if state fields are additive |

---

## 8. Enforcement model (by category)

When the registry from [`component-architecture-audit.md`](./component-architecture-audit.md) is built, each category **must** implement:

### Content
- [ ] Optional `status: completed` on view
- [ ] No gating

### Interactive (poll, flashcards)
- [ ] `InteractiveRenderer`
- [ ] `status: completed` in state
- [ ] Category map entry
- [ ] Full state persist + restore
- [ ] If collaborative: store hook

### Scored interactive (everything with points)
- [ ] `ScoredRenderer`
- [ ] `mode` prop honoured
- [ ] Live: start + timer + lock
- [ ] Practice: `handleRetry`
- [ ] Live: `handleScore` / `handlePoints`
- [ ] Category map entry
- [ ] **No local useState for answer UI** — all in state object

### Scored + tutor (shortAnswer, fillInTheBlank, categorise)
- [ ] All scored rules above
- [ ] Import `tutor-marking-contract` helpers — no inline duplicate

### Gamified (wordScramble, memoryGrid, spinTheWheel)
- [ ] Same as scored interactive
- [ ] Stable random seed for shuffle games (restore must not break)

---

## 9. Fix priority by behaviour impact

| Priority | Action | Components affected |
|---|---|---|
| **P0** | Add all interactive types to category map | 10+ immediately gated correctly |
| **P0** | Migrate standalone → ScoredRenderer | trueFalse, categorise, annotateImage, timeline, wordScramble, memoryGrid, spinTheWheel |
| **P0** | Fix multi-select split state | multiSelectQuiz |
| **P1** | Complete live trio on partial components | hotspot, codeEditor |
| **P1** | Add practice retry where missing | flashcardQuiz, multiSelect, wordCloud, scaleSlider |
| **P1** | Wire context scoring on standalone | all Pattern C scorers |
| **P2** | Adopt tutor contract everywhere submittable | fillInTheBlank refactor + categorise + annotateImage |
| **P2** | Honour `mode` on poll + flashcards or remove prop | poll, flashcards |
| **P3** | Real collaborative layer | poll storage, wordCloud API |
| **P3** | Accordion/video progress tracking | optional content enhancements |

---

## 10. Summary

| Your question | Answer |
|---|---|
| Is the issue only persistence? | **No** — live mode, retry, scoring, gating, tutor rules all diverge |
| Do components implement existing shapes? | **~13 yes, ~8 no, rest partial** |
| Is behaviour predictable today? | **Only within the legacy scored core** (quiz, drag-drop, matching, fill-in-blank) |
| Architecture bad? | **Contracts good, adoption optional** — that's the bug |
| Fix architecture first? | **Yes** — one registry + mandatory tier contracts before new components |
| Big overhaul? | **Medium** — wrap existing renderers into shapes that already exist |
| Breaking? | **JSON: no. Stricter gating: yes (fix).** |

**The missing fix:** not a new architecture — **mandatory implementation of the architecture you already wrote**, grouped by content / interactive / scored / collaborative, with CI tests that fail if a new renderer skips its tier contract.

---

*Component count: 31 renderers audited. Re-run after migrations.*
