# AST Platform — Component Architecture Audit

Why persistence, gating, and scoring bugs keep recurring — and what to consolidate so new components plug in reliably.

**Date:** August 2026  
**Related:** [`platform-gaps-audit.md`](./platform-gaps-audit.md), [`progression-reward-layer-plan.md`](./progression-reward-layer-plan.md)

---

## 1. Direct answer to your questions

### Why do you keep having these issues?

**Yes — the root cause is the lack of one enforced component shape.**

You built the right abstractions early (`InteractiveRenderer`, `ScoredRenderer`, `useInteractiveState`). New components were added ** beside** that system, not ** through** it. Each author (human or AI) reimplemented persistence, completion, and scoring differently.

That is not “bad architecture from scratch.” It is **good architecture that was not enforced**.

### Is every component doing its own thing?

**Mostly yes, for newer components.** There are three tiers today:

| Tier | Count | Behaviour |
|---|---|---|
| **Wrapped** (uses base renderers) | ~13 | Persistence, gating, scoring mostly consistent |
| **Standalone** (raw `useState` + manual `setComponentState`) | ~8 | Each implements save/restore differently — where bugs live |
| **Content** (view/acknowledge) | ~8 | Minimal state, low risk |

### Is a big overhaul required?

**No full rewrite. Medium consolidation, not a greenfield rebuild.**

The base layer in `components/renderers/base/` is sound. The work is:

1. **One registry** (single source of truth for categories + capabilities)
2. **Migrate 8 standalone renderers** into the existing wrappers
3. **Enforce contracts** with tests + a “new component checklist”

Estimated effort: **1–2 weeks** for registry + migrations + tests. Not months.

### Would it be breaking?

| Change | Breaks lesson JSON? | Breaks saved student state? | Breaks UI behaviour? |
|---|---|---|---|
| Unified registry | No | No | No |
| Migrate renderers to wrappers | No | No — if restored state fields preserved | Fixes bugs (stricter gating) |
| Fix category map | No | No | **Yes** — students must finish activities (correct behaviour) |
| Typed state interfaces | No | No — additive fields OK | No |
| Remove duplicate type lists | No | No | No |

**Lesson JSON and API contracts stay stable.** The only user-visible “break” is fixing gating so Next actually waits — which is a bug fix, not a regression.

---

## 2. What you got right (don't throw this away)

```
components/renderers/base/
├── base-renderer.tsx       ← disabled/editing shell
├── interactive-renderer.tsx ← continuous state sync to parent
├── scored-renderer.tsx     ← interactive + scoring (live/practice)
└── hooks.ts                ← useInteractiveState, useScoring
```

This stack **is** the plug-and-play shape:

```
Component JSON
     ↓
ScoredRenderer OR InteractiveRenderer OR ContentRenderer
     ↓
useInteractiveState(initialState, savedState, setComponentState)
     ↓
ALL activity state lives in one typed object
     ↓
Parent componentStates[id] → DB
```

**Quiz is the reference implementation.** When a component goes through `ScoredRenderer`, Next → Previous and DB resume work.

You also have:

- `lib/tutor-marking-contract.ts` — retry/submit rules (used by ~2 components, should be standard)
- `lib/validation/registry.ts` — per-type JSON validation
- `lib/component-definitions.ts` — studio authoring metadata

The problem is these systems **don't talk to each other** and new renderers **skip** the base wrappers.

---

## 3. The real architectural gap: five sources of truth

Every time a component is added, someone must manually update **five separate lists**. They don't stay in sync.

| # | Location | Purpose | Drift status |
|---|---|---|---|
| 1 | `lib/component-definitions.ts` | Studio palette: content / interactive / gamified | **Canonical for authoring** — but only 2 types marked `gamified` |
| 2 | `lib/lesson-utils.ts` → `COMPONENT_CATEGORY_MAP` | Viewer: gating, slide completion, progress % | **Stale** — missing 10+ types |
| 3 | `components/component-renderer.tsx` → `gamifiedTypes` + `interactiveTypes` | Which props/`setComponentState` to pass | **Duplicate lists**, overlap inconsistent |
| 4 | `services/scoring-service.ts` → `SCORED_COMPONENT_TYPES` | Which types earn points in live mode | **Separate list** again |
| 5 | `components/component-renderer.tsx` → `componentRenderers` map | type → React component | OK but unrelated to behaviour |

### Example: `trueFalse`

| System | How it's classified |
|---|---|
| `component-definitions.ts` | `interactive` |
| `lesson-utils.ts` | **Missing** → defaults to `content` |
| `component-renderer.tsx` gamifiedTypes | listed |
| `component-renderer.tsx` interactiveTypes | listed |
| `scoring-service.ts` SCORED_COMPONENT_TYPES | listed |
| Actual renderer | **Standalone** — no wrapper |

Same component, **four different treatments**. That is why bugs feel random.

### Two different "category" type systems

`types/lesson.ts` defines **both**:

- `ComponentType_Category` — used by `lesson-utils` (`interactive`, `gamified`, `content`, …)
- `ComponentCategory` — used by `component-definitions` (`content`, `interactive`, `gamified`, …)

Similar names, different enums, no bridge.

---

## 4. Three renderer patterns (today)

### Pattern A — Wrapped scored (✅ target for all point-bearing interactives)

**Uses:** `ScoredRenderer` → `InteractiveRenderer` → `useInteractiveState`

| Component |
|---|
| quiz, dragDrop, matchingPairs, fillInTheBlank, hotspot, flashcardQuiz, multiSelectQuiz, codeEditor, shortAnswer, scaleSlider, wordCloud |

**Gets for free:** continuous persistence, live/practice scoring, completion status sync

**Known gap:** `multiSelectQuiz` puts some UI state in local `useState` **inside** the wrapper — wrapper doesn't prevent this mistake

---

### Pattern B — Wrapped interactive (✅ target for non-scored interactives)

**Uses:** `InteractiveRenderer` only

| Component |
|---|
| poll, flashcards |

**Gets for free:** continuous persistence, completion status

---

### Pattern C — Standalone (❌ should not exist for new work)

**Uses:** raw `useState`, manual `setComponentState` on submit, optional `useEffect` for restore

| Component |
|---|
| trueFalse, categorise, annotateImage, timeline, wordScramble, memoryGrid, spinTheWheel |

**Each reimplements:** submit flow, restore, completion, feedback — inconsistently

---

### Pattern D — Content (✅ fine as-is)

**Uses:** direct `setComponentState({ status: 'completed' })` on view/acknowledge

| Component |
|---|
| paragraph, heading, bulletList, image, table |

---

### Pattern E — Content with no persistence (⚠️ gap)

| Component |
|---|
| callout, accordion, quote, video, codeBlock |

No `setComponentState` — acceptable for pure display, but means no "viewed" tracking.

---

## 5. Category behavioural contracts (what you want enforced)

Your grouping idea is correct: **similar utility → same mandatory behaviour.**

### Proposed taxonomy (aligned with your mental model)

| Category | Must gate Next? | Must persist state? | Can earn points? | Wrapper required |
|---|---|---|---|---|
| **content** | No | Optional (`status: completed` on view) | No | ContentRenderer |
| **interactive** | **Yes** | **Yes — full state** | Only if `mode: live` + `points > 0` | InteractiveRenderer or ScoredRenderer |
| **gamified** | **Yes** | **Yes — full state** | Yes (subset of interactive) | ScoredRenderer |
| **collaborative** | Yes | Yes + server aggregate | Optional | InteractiveRenderer + store hook |
| **structure** | No | No | No | None (slide chrome) |

**Note:** In your codebase today, `gamified` is barely used in `component-definitions` (only wordScramble, memoryGrid). Most scored types are labelled `interactive`. Recommend merging into **interactive** with a `scored: boolean` flag, or consistently marking all point types as gamified — pick one.

### Mandatory state shape (all interactive/gamified)

Every wrapped component state **must** include at minimum:

```typescript
interface BaseInteractiveState {
  status: 'active' | 'completed'
  // Optional scoring fields (when points > 0):
  score?: number
  maxScore?: number
  isCorrect?: boolean
}
```

**Rule:** No UI-critical field may live only in local `useState`. If it affects what the student sees after Next → Previous, it must be in this object.

### Mandatory behaviours by category

| Behaviour | content | interactive | gamified | collaborative |
|---|---|---|---|---|
| Continuous sync to parent | — | ✅ | ✅ | ✅ |
| Survives Next → Previous | — | ✅ | ✅ | ✅ |
| Survives DB resume | optional | ✅ | ✅ | ✅ |
| Blocks Next until complete | — | ✅ | ✅ | ✅ |
| `addPoints()` in live mode | — | if scored | ✅ | optional |
| Retry in practice mode | — | ✅ | ✅ | — |
| Registered in category map | ✅ | ✅ | ✅ | ✅ |

---

## 6. Why plug-and-play fails today

Adding a new component currently requires:

1. Create `*-renderer.tsx` (no template enforced)
2. Add to `componentRenderers` map
3. Add to `component-definitions.ts`
4. Add validator in `lib/validation/`
5. Hope someone updates `lesson-utils.ts` category map
6. Hope someone updates `scoring-service.ts`
7. Hope someone adds to `gamifiedTypes` / `interactiveTypes`
8. Manually wire poll store if collaborative

**Steps 5–7 are often skipped** → gating/scoring bugs.

### What plug-and-play should look like

**One registry entry per component:**

```typescript
// lib/component-registry.ts (proposed)
{
  type: 'trueFalse',
  category: 'interactive',
  capabilities: {
    scored: true,
    gated: true,
    collaborative: false,
    persist: 'continuous',
  },
  wrapper: 'scored',           // 'content' | 'interactive' | 'scored'
  renderer: TrueFalseRenderer,
  validator: trueFalseValidator,
}
```

Everything else derives from this:

- `lesson-utils.isInteractiveComponent()` → reads `capabilities.gated`
- `ScoringService.isScoredComponent()` → reads `capabilities.scored`
- `component-renderer.tsx` → reads `wrapper` + `renderer`
- Studio palette → reads `category`

**New component checklist becomes:** write renderer content function + one registry entry + validator. Done.

---

## 7. Consolidation plan (architecture-first)

### Phase 1 — Single registry (no renderer changes yet)

**Effort:** 1–2 days | **Breaking:** No

- Create `lib/component-registry.ts` exporting all types with category + capabilities
- Refactor `lesson-utils`, `scoring-service`, `component-renderer` to **read from registry**
- Delete `gamifiedTypes`, `interactiveTypes`, `COMPONENT_CATEGORY_MAP`, `SCORED_COMPONENT_TYPES`
- Add test: every registered type has renderer + validator + category

**Immediate win:** category map can never drift again.

---

### Phase 2 — Migrate standalone renderers to wrappers

**Effort:** 3–5 days | **Breaking:** No JSON break; fixes student UX

Migrate in order of usage / pain:

| Component | Target wrapper | Notes |
|---|---|---|
| `trueFalse` | ScoredRenderer | Small state object |
| `categorise` | ScoredRenderer | assignments + submitted |
| `annotateImage` | ScoredRenderer | placements + submitted |
| `timeline` | InteractiveRenderer | activeEventIndex + completed |
| `wordScramble` | ScoredRenderer | fix stable letter IDs in state |
| `memoryGrid` | ScoredRenderer | persist card order in state |
| `spinTheWheel` | ScoredRenderer | save after each spin |
| `multiSelectQuiz` | Fix inside existing wrapper | move selectedOptions into state |

**Pattern for each migration:**

```
Before: useState everywhere + setComponentState on submit
After:  define XState interface → ScoredRenderer<XState> → content uses state/setState only
```

---

### Phase 3 — Enforce contracts

**Effort:** 1–2 days | **Breaking:** No

- Extend `scripts/test-scoring.ts` → full component contract test suite
- Add ESLint rule or CI check: renderers in `components/renderers/` must import from `base/` (except content types)
- Document in `skills/lesson-json/SKILL.md`: "new components MUST use wrapper X"
- Add `createComponentRenderer` scaffold script

---

### Phase 4 — Collaborative layer (optional, later)

**Effort:** days–weeks | **Breaking:** No

- Add `capabilities.collaborative: true` for poll, wordCloud
- Standard `useCollaborativeStore(lessonId, componentId)` hook (like `usePollStore`)
- Move poll storage from JSON files to MongoDB with user deduplication

---

## 8. Overhaul size assessment

```
┌─────────────────────────────────────────────────────────┐
│  EXISTING (keep)                                        │
│  ████████████████████░░░░░░░░  ~65% done correctly      │
│  base renderers, quiz pattern, viewer, persistence API    │
├─────────────────────────────────────────────────────────┤
│  CONSOLIDATE (architecture fix)                         │
│  ████████░░░░░░░░░░░░░░░░░░░░  ~25% — registry + migrate│
├─────────────────────────────────────────────────────────┤
│  BUILD NEW (product features)                           │
│  ███░░░░░░░░░░░░░░░░░░░░░░░░░  ~10% — collaborative,   │
│  rewards layer, offline policy                          │
└─────────────────────────────────────────────────────────┘
```

| Question | Answer |
|---|---|
| Is architecture bad? | **Foundations good, enforcement missing** |
| Big overhaul? | **No** — migrate 8 files into existing wrappers + one registry |
| Minor patch? | **Also no** — registry + migrations is real work, not a one-liner |
| Root cause of persistence bugs? | **Standalone pattern + split local/parent state** |
| Root cause of gating bugs? | **Five drifting type lists** |
| Fix architecture first? | **Yes** — otherwise every new component repeats the same bugs |

---

## 9. Breaking change analysis (detailed)

### Safe (internal refactor only)

- Unified registry replacing duplicate lists
- Moving standalone renderers to wrappers **if saved state fields are superset of current**
- Adding typed interfaces (TypeScript only)
- Removing IndexedDB/offline (product decision, not architecture)

### Behaviour changes (bug fixes — communicate to users)

- **Gating fix:** students can no longer skip trueFalse, wordScramble, etc. without completing
- **Slide completion:** slides with new components won't auto-complete until activities done

### Risky (needs migration care)

- **Renaming state fields** in saved `componentsState` — avoid; use additive fields only
- **Changing scoring calculation** — affects `markCompleted` percentages; test with live lessons

### Not breaking

- Lesson JSON schema
- Component `props` shapes
- API `/api/interactions` structure
- Studio authoring flow

---

## 10. Recommended category mapping (canonical)

Use this when building the registry. One place, final.

| Type | Category | Scored | Gated | Wrapper |
|---|---|---|---|---|
| paragraph, heading, bulletList, quote, callout, accordion | content | — | — | content |
| table, image, video, codeBlock | content | — | — | content |
| poll | interactive | — | ✅ | interactive + pollStore |
| flashcards | interactive | — | ✅ | interactive |
| quiz, dragDrop, matchingPairs, fillInTheBlank | interactive | ✅ | ✅ | scored |
| hotspot, flashcardQuiz, multiSelectQuiz, codeEditor | interactive | ✅ | ✅ | scored |
| shortAnswer, scaleSlider, wordCloud | interactive | ✅ | ✅ | scored |
| trueFalse, categorise, annotateImage, timeline | interactive | ✅ | ✅ | scored *(migrate)* |
| wordScramble, memoryGrid, spinTheWheel | gamified | ✅ | ✅ | scored *(migrate)* |

---

## 11. Summary

| Your question | Short answer |
|---|---|
| Why keep having issues? | No enforced component contract; new types bypass the wrappers |
| Is architecture bad? | **Split-brain** — good base, inconsistent adoption |
| Every component own thing? | **Old ones: no. New ones: largely yes.** |
| Missing fix is architecture? | **Yes — registry + enforce wrappers before adding features** |
| Big overhaul? | **Medium** — ~1–2 weeks, not a rewrite |
| Breaking? | **Lesson JSON: no. Gating behaviour: fixes bugs.** |

**Do architecture first.** Fixing persistence on standalone renderers one-by-one without the registry will work short-term but the next component will break the same way.

**Order of operations:**

1. `lib/component-registry.ts` — single source of truth
2. Migrate 8 standalone renderers → existing wrappers
3. Fix multi-select split state inside wrapper
4. Contract tests in CI
5. *Then* offline policy, collaborative APIs, reward layer

---

*See [`platform-gaps-audit.md`](./platform-gaps-audit.md) for per-component bug status and [`progression-reward-layer-plan.md`](./progression-reward-layer-plan.md) for scoring/progression roadmap.*
