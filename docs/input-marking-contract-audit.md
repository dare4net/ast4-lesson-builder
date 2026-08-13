# AST Platform — Input & Marking Contract Audit

How **self-mark vs tutor-mark** works for typing/input components (`shortAnswer`, `fillInTheBlank`, `codeEditor`), whether behaviour is consistent, and how the tutor viewer recognizes them.

**Date:** August 2026  
**Related:** [`component-behaviour-contract-audit.md`](./component-behaviour-contract-audit.md), [`lib/tutor-marking-contract.ts`](../lib/tutor-marking-contract.ts)

---

## 1. Executive summary

You **started** a proper marking contract (`lib/tutor-marking-contract.ts`) and **one component implements it fully** (`shortAnswer`). The tutor viewer has its **own parallel system** (`TutorLessonContent` + `TutorMarkingBar`) that recognizes components by a **hardcoded type list** and **guessed state field names**.

**It is not consistent today.**

| Component | `markingMode` prop | Self-mark behaviour | Tutor-mark behaviour | Uses contract helpers | Tutor bar works |
|---|---|---|---|---|---|
| **shortAnswer** | ✅ | Keyword auto-grade | Submit → pending, no points | ✅ | ✅ |
| **fillInTheBlank** | ✅ | Auto-grade per blank | ⚠️ **Still auto-grades + awards points** | ❌ inline | ✅ surgical blanks |
| **codeEditor** | ❌ | Test-case auto-grade only | ❌ no tutor-mark path | ❌ | ⚠️ generic bar only |

**Recommendation:** Define an **`SubmittableInput`** tier (like your content/interactive/gamified groups) with one state shape and one submit flow. Migrate all three into it.

---

## 2. The intended contract (already written)

### 2.1 State shape — `StandardComponentState`

From `lib/tutor-marking-contract.ts`:

```typescript
{
  userAnswers?: Record<string, any>   // multi-field (fillInTheBlank)
  userResponse?: string              // single-field (shortAnswer)
  isSubmitted: boolean
  isPendingMarking?: boolean         // true = waiting for tutor
  tutorMarked?: boolean              // true = tutor has scored
  isApproved?: boolean
  score?: number
  wasReset?: boolean                 // tutor reset → student can retry
  status?: string
  markedBy?: string
  markedAt?: string | Date
}
```

### 2.2 Authoring prop — `markingMode`

```typescript
markingMode: 'self-mark' | 'tutor-mark'
```

Defined in `component-definitions.ts` for:
- `fillInTheBlank` ✅
- `shortAnswer` ✅
- **Not** `codeEditor` ❌

### 2.3 Behaviour rules (contract)

| Rule | self-mark | tutor-mark |
|---|---|---|
| On submit | Auto-grade → set score → `isPendingMarking: false` | Submit only → `isPendingMarking: true`, score 0, **no auto points** |
| Input locked after submit | ✅ | ✅ |
| Practice retry | `shouldShowRetry()` when not perfect | ❌ blocked while pending |
| Live retry | ❌ never | ❌ never |
| Tutor can override | Via marking bar (any type in list) | Primary path |
| Student save preserves tutor mark | ✅ via `/api/interactions` merge | ✅ |

### 2.4 Helper functions

| Helper | Purpose |
|---|---|
| `isInputDisabled(state, context)` | Lock inputs when submitted / tutor view / disabled |
| `shouldShowRetry(state, context, totalPossible)` | Practice retry button rules |
| `isItemApproved(state, autoGradedCorrect)` | Tutor approval overrides auto-grade for UI |

**Only `shortAnswer` imports these.** `fillInTheBlank` duplicates logic inline.

---

## 3. Per-component implementation

### 3.1 `shortAnswer` — ✅ reference implementation

**State fields:** `userResponse`, `isSubmitted`, `isPendingMarking`, `score`, `status`

**Self-mark flow:**
1. Student types in `Textarea`
2. Submit → keyword match against `correctKeywords`
3. `handlePoints(earnedPoints)` in live mode
4. `isPendingMarking: false`, `isSubmitted: true`

**Tutor-mark flow:**
1. Submit → **no grading**
2. `isPendingMarking: true`, `score: 0`, `status: 'completed'`
3. Student sees "Submitted / pending review" UI
4. `shouldShowRetry` returns false while pending

**Contract helpers:** ✅ `isInputDisabled`, `shouldShowRetry`, `isItemApproved`

**Tutor viewer recognition:** ✅ `userResponse` in `hasStudentResponse` check; `shortAnswer` in `SUBMITTABLE_TYPES`

---

### 3.2 `fillInTheBlank` — ⚠️ tutor-mark is broken

**State fields:** `userAnswers`, `isSubmitted`, `isPendingMarking`, `correctAnswers`, `score`, `status`

**Self-mark flow:** Works correctly
1. Student fills blanks
2. Submit → per-blank string match (+ alternatives)
3. `handlePoints(earnedPoints)` ✅
4. `isPendingMarking: false` (when self-mark)

**Tutor-mark flow:** ⚠️ **Inconsistent with shortAnswer**
1. Submit → **still runs full auto-grade**
2. **Still calls `handlePoints(earnedPoints)`** even in tutor-mark mode
3. Sets `isPendingMarking: true` but score already populated
4. Student may see auto-score UI **and** "pending tutor review" simultaneously

```typescript
// fill-in-the-blank-renderer.tsx — current behaviour
const isPending = props.markingMode === 'tutor-mark';
handlePoints(earnedPoints);  // ← should NOT run in tutor-mark
setState({ isSubmitted: true, isPendingMarking: isPending, score: earnedPoints, ... });
```

**Contract helpers:** ❌ Uses inline `inputsLocked = isTutorView || isSubmitted` instead of `isInputDisabled`

**Tutor viewer recognition:** ✅
- In `SUBMITTABLE_TYPES`
- `extractSurgicalItems` has **dedicated** fillInTheBlank handler — per-blank breakdown with checkboxes (best tutor UX of the three)

---

### 3.3 `codeEditor` — ❌ not part of marking group

**State fields:** `code`, `output`, `testResults`, `isSubmitted`, `status` — **no** `userResponse`, **no** `isPendingMarking`, **no** `markingMode`

**Scoring flow:** Automated test cases only
1. Student writes code in textarea
2. Run tests → `handleScore(true)` if all pass (live only via ScoredRenderer)
3. `isSubmitted: true`; in practice can retry via `handleRetry`

**Tutor-mark:** Not supported in JSON/studio. Tutor can still open marking bar because:
- `codeEditor` is in `SUBMITTABLE_TYPES`
- `hasStudentResponse` triggers on `isSubmitted`

**Tutor bar for codeEditor:** ⚠️ Weak
- `extractSurgicalItems` has **no** codeEditor handler
- Falls through to default single-response extractor looking for `userResponse` / `userAnswer` — **not `code`**
- If only `code` + `isSubmitted` exist, surgical list may be **empty** → bar awards full `maxPoints` by default

**Should it be in the input/marking group?** Debatable:
- **Yes** if you want tutor to review code manually (add `markingMode`, show code in bar)
- **No** if code is always test-automated (remove from `SUBMITTABLE_TYPES`, keep test-only scoring)

---

## 4. How the tutor viewer recognizes components

### 4.1 Two tutor surfaces (also inconsistent)

| Surface | File | Which components |
|---|---|---|
| **Tutor lesson viewer** | `TutorLessonContent.tsx` | 15 types in `SUBMITTABLE_TYPES` |
| **Studio student preview** | `student-preview-modal.tsx` | Only `shortAnswer`, `fillInTheBlank`, or anything with `isPendingMarking` |

The studio preview is **narrower** than the full tutor viewer.

---

### 4.2 TutorLessonContent — recognition logic

**Step 1 — Type whitelist (`SUBMITTABLE_TYPES`):**

```typescript
'shortAnswer', 'fillInTheBlank', 'quiz', 'trueFalse', 'multiSelectQuiz',
'flashcardQuiz', 'codeEditor', 'wordCloud', 'scaleSlider', 'categorise',
'annotateImage', 'dragDrop', 'matchingPairs', 'wordScramble', 'memoryGrid'
```

This is **not** tied to `markingMode` or input type — it's a flat list mixing auto-scored quizzes with open input.

**Step 2 — Has student response (`hasStudentResponse`):**

Checks if state contains any of:
- `isSubmitted`
- `userAnswer` / `userAnswers` / `userResponse` / `response` / `answers`
- `placements` / `selectedOption` / `selectedAnswer`
- `status === 'completed'` with more than one key

**Step 3 — Not already handled:**

Skip bar if `tutorMarked === true` or `wasReset && !isSubmitted`

**Step 4 — Render `TutorMarkingBar`**

Calls `apiClient.studio.markStudentResponse()` or `resetStudentResponse()`

---

### 4.3 TutorMarkingBar — surgical extraction

`extractSurgicalItems(componentType, props, state, maxPoints)`:

| Type | Extraction |
|---|---|
| `fillInTheBlank` | One row per blank — student vs expected ✅ |
| `categorise` | One row per item — uses `placements` (note: student renderer uses `assignments` — **possible field name mismatch**) |
| `multiSelectQuiz` | One row per question — expects `userAnswers` in state (**multi-select may not store this**) |
| **Default** | Single row from `userAnswer` / `response` / `userResponse` / `selectedOption` |

**shortAnswer** uses default path via `userResponse` ✅  
**codeEditor** — no dedicated path ⚠️

---

### 4.4 Tutor mark persistence — ✅ consistent (server layer)

When tutor marks via API, student auto-save **must not overwrite**:

`pages/api/interactions.ts` merge logic:
- If `tutorMarked === true` on existing state → preserve tutor `score`, `isApproved`, `markedBy`, force `isPendingMarking: false`
- If `wasReset === true` → keep reset state until student submits again

`lib/sync-engine.ts` has similar merge for offline sync.

This layer works regardless of component renderer quality.

---

## 5. Proposed group: `SubmittableInput` tier

Components where the student **types or writes** an answer that may be self-graded or tutor-graded.

### 5.1 Members

| Component | Include? | Notes |
|---|---|---|
| `shortAnswer` | ✅ | Primary member |
| `fillInTheBlank` | ✅ | Multi-field variant |
| `codeEditor` | ⚠️ optional | Only if `markingMode` added; else keep test-only tier |

**Not members** (different interaction model):
- `quiz`, `multiSelectQuiz` — selection not typing
- `categorise`, `dragDrop` — manipulation not text entry
- `wordCloud` — word list not graded answer

### 5.2 Mandatory props

```typescript
{
  markingMode: 'self-mark' | 'tutor-mark'  // required for tier
  points: number
  mode: 'practice' | 'live'
}
```

For `codeEditor` if included:
```typescript
markingMode: 'self-mark' | 'tutor-mark' | 'test-mark'  // test-mark = current behaviour
```

### 5.3 Mandatory state (extends `StandardComponentState`)

**Single-field** (`shortAnswer`):
```typescript
{ userResponse, isSubmitted, isPendingMarking, score, status, tutorMarked?, isApproved?, wasReset? }
```

**Multi-field** (`fillInTheBlank`):
```typescript
{ userAnswers, isSubmitted, isPendingMarking, correctAnswers?, score, status, ... }
```

**Code** (`codeEditor` if in tier):
```typescript
{ code, isSubmitted, isPendingMarking, testResults?, score, status, ... }
```

### 5.4 Mandatory submit behaviour

```typescript
function submitSubmittableInput(state, markingMode, autoGradeFn) {
  if (markingMode === 'tutor-mark') {
    return {
      ...state,
      isSubmitted: true,
      isPendingMarking: true,
      score: 0,
      status: 'completed',
      // NO handlePoints, NO autoGradeFn
    };
  }
  const { score, details } = autoGradeFn(state);
  handlePoints(score);  // live only, via ScoredRenderer
  return {
    ...state,
    isSubmitted: true,
    isPendingMarking: false,
    score,
    status: 'completed',
    ...details,
  };
}
```

Shared hook: `useSubmittableInput({ markingMode, autoGrade, ... })`

### 5.5 Mandatory renderer rules

- Import `isInputDisabled`, `shouldShowRetry`, `isItemApproved` — no inline duplicates
- `ScoredRenderer` wrapper for persist + live scoring
- Submit button label: `"Check Answers"` (self-mark) vs `"Submit Response"` (tutor-mark) — fillInTheBlank already does this partially
- Pending UI when `isPendingMarking && !tutorMarked`

### 5.6 Tutor viewer recognition (replace whitelist)

Instead of `SUBMITTABLE_TYPES` array:

```typescript
import { getComponentCapabilities } from '@/lib/component-registry';

const caps = getComponentCapabilities(component.type);
const showMarkingBar = caps.submittable && hasStudentResponse(state);
```

Registry flag: `submittable: true` + `markingModeSupported: true`

Surgical extractors registered per type in same registry — not a growing if/else in `TutorLessonContent`.

---

## 6. Inconsistency checklist (current bugs)

| # | Issue | Impact |
|---|---|---|
| 1 | fillInTheBlank tutor-mark still auto-scores + `handlePoints` | Student gets points before tutor reviews |
| 2 | fillInTheBlank doesn't use contract helpers | Retry/lock rules may diverge from shortAnswer |
| 3 | codeEditor has no `markingMode` but is in tutor list | Unclear product intent |
| 4 | codeEditor tutor bar can't show code surgically | Tutor marks blind or gets empty surgical list |
| 5 | categorise tutor extractor uses `placements`, renderer uses `assignments` | Tutor bar may show wrong/empty data |
| 6 | multiSelectQuiz extractor expects `userAnswers` not in state | Tutor breakdown broken |
| 7 | Studio preview vs tutor viewer filter different sets | Confusing for authors |
| 8 | SUBMITTABLE_TYPES includes auto-scored types with no pending flow | Marking bar on already-auto-scored quiz |

---

## 7. Fix priority

| Priority | Fix |
|---|---|
| **P0** | Fix fillInTheBlank tutor-mark: skip auto-grade + skip `handlePoints` when `markingMode === 'tutor-mark'` |
| **P0** | fillInTheBlank: import `tutor-marking-contract` helpers |
| **P1** | Decide codeEditor policy: add `markingMode` OR remove from submittable list |
| **P1** | Add `codeEditor` surgical extractor (show code + test results) if keeping in tier |
| **P1** | Fix categorise field name (`assignments` vs `placements`) in tutor extractor |
| **P2** | Create `useSubmittableInput` shared hook |
| **P2** | Replace `SUBMITTABLE_TYPES` with registry `submittable` flag |
| **P2** | Align studio preview filter with tutor viewer |

---

## 8. Answer to your questions

| Question | Answer |
|---|---|
| Should typing components share a group? | **Yes** — `SubmittableInput` with `markingMode` |
| Is self/tutor mark consistent? | **No** — shortAnswer correct; fillInTheBlank broken in tutor-mark; codeEditor N/A |
| Is there an existing shape? | **Yes** — `StandardComponentState` + helpers in `tutor-marking-contract.ts`, barely used |
| How does tutor viewer recognize them? | Hardcoded `SUBMITTABLE_TYPES` + heuristic state field checks — not driven by `markingMode` |
| Big overhaul? | **Small-medium** — fix fillInTheBlank, add shared hook, registry flag; codeEditor is a product decision |
| Breaking? | **No JSON break** — fix fillInTheBlank tutor-mark behaviour is a **bug fix** (students shouldn't get auto points in tutor-mark mode) |

---

*Contract source of truth: [`lib/tutor-marking-contract.ts`](../lib/tutor-marking-contract.ts). Reference renderer: [`short-answer-renderer.tsx`](../components/renderers/short-answer-renderer.tsx). Tutor UI: [`TutorLessonContent.tsx`](../components/viewer/TutorLessonContent.tsx).*
