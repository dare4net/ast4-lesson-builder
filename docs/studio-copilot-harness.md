# Studio Copilot — harness & UX architecture

**Status:** Planning (core product spec).  
**Parent:** [`studio-copilot-plan.md`](./studio-copilot-plan.md) (billing, infra, phases).

**Thesis:** You are not selling raw JSON generation. You are selling a **plan-then-execute studio companion** with memory, taste, and a live component catalog — so every lesson feels continuous and intentional.

---

## 1. What we are building

| Layer | Job |
|-------|-----|
| **UX** | Chat that **clarifies → plans → asks permission → executes → reviews** |
| **Memory** | **Program + module context** persisted and updated; prior lessons summarized in — not rebuilt every time |
| **Harness** | State machine, prompts, tools, validators — separate **Planner** and **Executor** models/steps |
| **Catalog** | Component **shapes from code** (`lib/component-definitions/*`) at execution time — never stale SKILL markdown |
| **Personality** | Consistent Copilot voice; adapts delivery to chosen **style**, not a different bot per mode |

---

## 2. Conversation model (tutor-facing vs internal)

### What the tutor sees

**One continuous chat** — no “Intake”, “Plan”, or “Execute” labels, no checklists, no per-message cost preview. It should feel like talking to a curriculum partner who remembers the program.

Internally the harness still runs **clarify → plan → confirm → apply** (§2.1). The AI asks questions in prose, summarises what it heard, and offers *“Want me to build that?”* — not stage banners.

### Credit UX

| Show | Do not show |
|------|-------------|
| Remaining balance in panel chrome (updates after each request) | Per-turn “−X credits” in the thread |
| Usage history in settings (optional later) | “~N credits” before send |
| Block at zero balance | Token counts or provider names |

**Every request debits credits** (chat and apply). Cost is **variable** — computed from **actual provider token usage** through **our conversion formula** (parent §4.1), not a fixed price per turn.

### Internal phases (never shown in UI)

```
clarify ──► plan_ready ──► tutor_confirms ──► apply ──► review_patch
     ▲            │              │               │
     └────────────┴── chat continues freely ─────┘
```

Stored on `copilot_threads.internal_phase` — prompts/tools switch; the composer stays the same.

Apply requires internal confirmation (natural “yes / go ahead” or inline **Apply** on the assistant’s proposal) — not a separate wizard.

---

## 2.1 @ scope — Cursor-style context attachments

Typing **`@`** in the Copilot composer opens a **scope picker** (same idea as @-mentions in Cursor: attach context to this message).

| Mention | Resolves to | Injected context |
|---------|-------------|------------------|
| `@Lesson` | Whole lesson | All slides + metadata (summarise if huge) |
| `@Slide 3 — States of matter` | `slides[i]` | That slide’s components |
| `@Quiz — capital cities` | Component by label/type | id + props + live type spec |

**Multiple `@` chips** allowed. Chips are removable. Payload: `{ message, attachments: [{ kind, id }] }`.

**Default scope** when no `@`:

1. `editingComponentId` set → **component** on current slide  
2. Else → **current slide** (`currentSlideIndex`)  
3. Empty lesson → **lesson** (greenfield)

Builder already tracks `currentSlideIndex` and `editingComponentId` — wire these to focus + @ menu ordering (focused slide’s components first).

---

## 3. What the AI must learn (internal only)

Clarify through **conversation**, not a form. Internal `brief` schema tracks: audience, outcome, style, tone, length, mode, continuity. Pedagogy skills inject at **apply** time from audience + style — not visible gates.

---

## 4. Plan artifact (internal + inline in chat)

Before **apply**, the harness stores a structured plan server-side. The tutor sees it as **normal assistant prose** in the thread (slide outline, components, style) — optional collapsible “Plan details” for power users, not a mandatory checklist screen.

Inline actions on that message: **Apply to lesson** | **Keep chatting** (no separate “Plan phase” UI).

```ts
type CopilotPlan = {
  version: 1
  brief: {
    audience: string
    outcome: string
    style: string          // preset id or custom label
    tone: string
    length: { slidesMin: number; slidesMax: number; minutes?: number }
    modes: { practice: boolean; liveFinale: boolean }
    continuityNotes: string
  }
  narrativeHook?: string   // optional story frame (any style)
  slides: Array<{
    title: string
    purpose: string        // one sentence
    componentTypes: string[]  // e.g. ["heading", "hotspot", "quiz"]
    notes?: string
  }>
  imagePromptsPlanned: number
  assessmentSummary: string
  risks?: string[]         // e.g. "High text load for Year 4 — suggest shortening"
}
```

Structured `CopilotPlan` JSON is stored on the thread for execute — the chat rendering is human-friendly only.

---

## 5. Memory — program & module context (continuity)

### Problem

Without memory, every lesson starts cold: wrong tone, repeated explanations, broken story arcs.

### Solution: layered context store

| Layer | Storage | Updated when |
|-------|---------|--------------|
| **Program context** | `programs.copilot_context` (or `studio_context` collection) | Tutor edits in program settings **or** Copilot proposes diff after accept |
| **Module context** | `modules.copilot_context` | After each **accepted** lesson build/edit |
| **Lesson thread** | `copilot_threads` messages | Every chat turn |
| **Prior lessons** | Derived summaries | On accept: append to module context; optional fetch of last N lesson titles + one-line summaries |

### Suggested context shape

```ts
type StudioCopilotContext = {
  // Voice & world
  narrativeFrame?: string       // "Agent Riverstone, KS2 science club"
  terminology?: string[]        // words to reuse consistently
  cast?: string[]               // recurring characters
  styleGuide?: string           // free text: "short sentences, emoji-free"
  doNot?: string[]              // guardrails

  // Curriculum arc (module)
  conceptsCovered?: string[]
  conceptsNext?: string[]
  lessonSummaries?: Array<{ lessonId: string; title: string; summary: string }>

  updatedAt: string
  updatedBy: 'tutor' | 'copilot' | 'system'
}
```

### Retrieval on every generation

```
system += program.copilot_context
system += module.copilot_context
system += last 3 lesson summaries from module (not full JSON)
system += current lesson title/description if set
system += approved plan (execute only)
```

### Context update after accept

1. Copilot (cheap model) emits `contextPatch` — 3–5 bullets: what this lesson established, terms introduced, story beat.  
2. Tutor sees **“Update module memory?”** with diff — default accept.  
3. Stored on module; program context changes less often.

---

## 6. EXECUTE — live component catalog (not docs)

### Source of truth

| Today | Copilot uses |
|-------|----------------|
| `lib/component-definitions/*.ts` | `defaultProps` + `propDefinitions` + `description` |
| `lib/component-registry.ts` | `gated`, `scored`, `wrapper`, `category` |
| `lib/validation/*` | Post-gen validation + repair |

**Do not** paste `lesson-json/SKILL.md` wholesale into the system prompt. It goes stale.

### Component Spec Service

Expose internally (BE imports shared package or HTTP from FE build artifact):

```
GET /copilot/component-specs?types=quiz,hotspot,paragraph
→ { quiz: { description, defaultProps, propDefinitions, registry: { gated, scored } }, ... }
```

**Executor prompt assembly:**

1. Approved plan lists component types per slide.  
2. Fetch specs **only for those types** (keeps tokens low).  
3. Instruct model: output must match `propDefinitions` shapes; start from `defaultProps` structure.  
4. Run `validateLesson()`; if errors, one **repair** call with error paths + relevant specs only.

### Viewer-safe filter

Only types where `isSupportedRenderer(type)` is true (same as builder library). Planner may not propose unimplemented types.

---

## 7. Two-role harness (Planner vs Executor)

Split work for cost + quality:

| Role | When | Model | Output |
|------|------|-------|--------|
| **Planner** (chat) | clarify / plan_ready | `gpt-4o-mini` | Conversation + `CopilotPlan` |
| **Executor** (build) | EXECUTE + repair | `gpt-4o-mini` (upgrade slot for hard lessons) | Lesson JSON patch |

**Optional:** Planner uses slightly higher temperature; Executor uses low temperature + JSON schema.

### Tool calls (Executor)

| Tool | Purpose |
|------|---------|
| `fetch_component_specs(types[])` | Live shapes |
| `fetch_pedagogy_adapter(audience, style)` | Compressed primary or curriculum rules |
| `validate_lesson(json)` | Returns errors/warnings |
| `emit_lesson_patch(json)` | Final structured output |

Planner tools (chat):

| Tool | Purpose |
|------|---------|
| `read_studio_context(programId, moduleId)` | Memory |
| `list_module_lessons(moduleId)` | Titles + descriptions |
| `draft_plan(brief)` | Writes plan artifact |
| `suggest_styles(audience, topic)` | Returns 3 style options |

---

## 8. Personality

Single identity — **Studio Copilot** — not a generic ChatGPT wrapper.

### Core traits (system, stable)

- Speaks like a **senior curriculum designer** paired with the tutor — collaborative, not subservient.  
- **Curious in intake** — asks one or two questions per turn, not a form dump.  
- **Opinionated in plan** — recommends slide flow and component choices with reasons.  
- **Humble in review** — “You’re the author; I’ll change whatever you want.”  
- Never mentions tokens, models, or “as an AI.”  
- Never auto-publishes; never talks to students.

### Style adaptation (variable system layer)

After brief is set, inject **style adapter** block:

| Style preset | Adapter emphasis |
|--------------|------------------|
| `story` | Mission frame, recurring hook, low meta-language |
| `academic` | Precise terms, intertwined explanation + check, tables OK |
| `simple` | Short lines, fewer components per slide, more polls/hotspots |
| `gamified` | Finale games, spin/hangman/memoryGrid, celebrate progress |
| `exam-prep` | Live mode, time limits, mixed high-friction items |
| `custom` | Tutor’s free-text style guide copied verbatim into adapter |

Personality stays constant; **pedagogy adapter** shifts.

---

## 9. UX layout (builder)

```
┌─────────────────────────────────────────────────────────────────┐
│ Lesson builder (existing)                                          │
│                                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐ │
│  │ Slides / canvas             │  │ Copilot panel              │ │
│  │                             │  │ ┌────────────────────────┐ │ │
│  │                             │  │ │ Thread + @ attachments   │ │ │
│  │                             │  │ │ [ Apply ] on proposals │ │ │
│  │                             │  │ └────────────────────────┘ │ │
│  │                             │  │ 412 credits · pool ▾       │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Module / program surfaces

- **Program → Copilot memory** tab: edit program context manually.  
- **Module → Copilot memory** tab: arc, summaries, “Regenerate summary from lessons.”  
- Context also visible read-only in Copilot panel header (“Remembering: Riverstone Science · Module 2 — Water cycle”).

### Scoped sessions

| Entry | Behaviour |
|-------|-----------|
| Open Copilot in builder | Continuous chat; focus from slide/component selection |
| `@Lesson` / `@Slide` / `@Component` | Explicit scope on message |
| Assistant proposes changes | Inline **Apply to lesson** on that message |

---

## 10. API design (harness-facing)

| Endpoint | Phase |
|----------|-------|
| `POST /copilot/threads` | Create/resume thread `{ programId, moduleId, lessonId, scope }` |
| `POST /copilot/threads/:id/messages` | Tutor message → Planner response (INTAKE/PLAN) |
| `POST /copilot/threads/:id/plan/approve` | Snapshot plan → EXECUTE job |
| `GET /copilot/threads/:id/plan` | Current draft plan |
| `POST /copilot/execute/:jobId` | Poll or SSE for progress |
| `GET /copilot/component-specs` | Live definitions |
| `GET/PUT /studio/context/program/:id` | Program memory |
| `GET/PUT /studio/context/module/:id` | Module memory |

Store `approved_plan_hash` on execute jobs for audit.

---

## 11. Token & cost strategy (internal)

| Segment | Notes |
|---------|-------|
| Provider tokens | Logged per request for **COGS / margin** — never shown to tutors |
| Product credits | **`credits_charged`** via config formula — see parent plan §4.1 |
| Pre-send estimate | UI computes same formula client-side for “~N credits” preview |

**Every phase debits credits** (chat, plan, execute, repair). Tune formula weights in config so margin stays healthy as models/prices change — without changing tutor-facing SKU.

---

## 12. Images & audio (unchanged)

- **Images:** Executor fills content + `imagePrompt` / alt / caption; `image.src` empty or placeholder constant.  
- **Audio:** Tutor triggers existing batch TTS — Copilot does not call TTS.

---

## 13. Implementation order (revised)

| Step | Deliverable |
|------|-------------|
| **H0** | `component-specs` exporter from `component-definitions` + viewer filter |
| **H1** | `studio_context` on program/module + UI tabs |
| **H2** | Thread API + Planner-only spike (intake → plan JSON, no execute) |
| **H3** | Plan review UI in builder |
| **H4** | Executor + validator + accept/reject merge |
| **H5** | Context auto-patch after accept |
| **H6** | Credits + pools (from parent plan) |

**C0 spike** becomes **H0 + H2**: prove Planner conversation + one manual execute with live specs — before full builder UI.

---

## 14. Success criteria (harness)

1. Tutor can run **three lessons in one module** without re-explaining style or story.  
2. Plan always shown and **explicitly approved** before execute (approve step also debits credits).  
3. Adding a new component in `component-definitions` automatically appears in specs — no prompt doc edit.  
4. Validator pass rate ≥ 90% after one repair on execute.  
5. Tutors describe Copilot as **“it remembers my program”** — not “it generates quizzes.”

---

## 15. Open harness questions

1. **Thread per lesson or per module?** Per lesson thread; module context shared.  
2. **Executor model upgrade** — higher-quality execute multiplies `SCOPE_MULT` (e.g. ×1.5 credits)?

**Resolved:** plan-then-execute, all phases metered, unified credit balance + internal formula, flexible style, program/module memory, live component specs, personality, images prompt-only, audio manual.
