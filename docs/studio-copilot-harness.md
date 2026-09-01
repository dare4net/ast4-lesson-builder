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

## 2. Conversation phases (state machine)

```
┌──────────┐    enough info     ┌──────────┐   tutor approves   ┌──────────┐
│  INTAKE  │ ────────────────► │   PLAN   │ ─────────────────► │ EXECUTE  │
│  (chat)  │ ◄──────────────── │ (draft)  │ ◄── edit plan ────── │ (JSON)   │
└──────────┘   more questions  └──────────┘                    └────┬─────┘
      ▲              │                │                              │
      │              │ cancel         │ revise plan                  ▼
      │              ▼                │                         ┌──────────┐
      └──────── clarify ──────────────┘                         │  REVIEW  │
                                                                │ accept?  │
                                                                └────┬─────┘
                                                                     │
                              refine ────────────────────────────────┘
                              (back to PLAN or scoped EXECUTE)
```

### Phase rules

| Phase | Credits | Model work | Tutor sees |
|-------|---------|------------|------------|
| **INTAKE** | **Yes** — per chat turn (formula §4.1 in parent plan) | Clarifying questions — no lesson JSON | Chat thread + debit footer |
| **PLAN** | **Yes** — per plan draft/revise | Structured plan artifact | Plan cards + “~N credits” before send |
| **APPROVE** | **Yes** — small ack charge | Confirms snapshot; triggers execute job | “Build this lesson (~X credits)” |
| **EXECUTE** | **Yes** — largest typical debit | Generate JSON per approved plan | Progress + diff preview |
| **REVIEW** | **Yes** if repair/context patch runs | Validation repair or memory update | Accept / reject |

**No free pipeline steps.** Chat is part of the product and part of the margin.

**Hard rule:** EXECUTE never runs without an explicit **approved plan** snapshot — but approving still costs credits.

---

## 3. INTAKE — what Copilot must clarify

Copilot does **not** assume. It asks until these are filled or explicitly marked “use your judgment”:

### Required brief fields

| Field | Examples | Notes |
|-------|----------|-------|
| **Audience** | Year 4, Year 9, adult beginners, mixed ability | Drives reading load + friction rules |
| **Outcome** | “Identify three states of matter” / “Use past perfect in a paragraph” | One lesson = one primary outcome |
| **Style** | Story / academic / simple / gamified / exam-drill / **custom** | Free text allowed; AI may suggest 2–3 options |
| **Tone** | Playful, calm, competitive, formal | Sub-style |
| **Length** | ~6 slides, ~15 min, “short opener” | Slide count band, not exact |
| **Mode** | Practice only / live assessment on finale / mixed | Affects `mode` + `timeLimit` |
| **Continuity** | “Follows Lesson 2 on rivers” / “standalone” | Pulls module context + prior lesson summaries |

### Optional but asked once

- Vocabulary to include or avoid  
- SEN / EAL / low-literacy flags  
- “No horror / no religion” content guardrails  
- Assessment harshness (gentle retry vs strict)  
- Image note: **tutor sources assets**; Copilot will write **image prompts** only  

### Intake completion

Planner sets `brief.status: 'ready'` when all required fields are set **or** tutor clicks **“Use your best judgment for the rest”** (logged in thread).

**Pedagogy skills** (`primary-lesson-generator`, `curriculum-lesson-generator`) are **hints at execute time**, not intake gates. Style + audience pick which adapter to inject — they do not lock the tutor into “primary only” UX.

---

## 4. PLAN artifact (permission gate)

Before credits are spent on execute, Copilot outputs a **Plan Document** (structured JSON + human-readable cards):

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

**UX:** Full plan shown in a scrollable **Plan Review** panel. Tutor can edit text fields inline. Chat shows the same plan in prose: *“Here’s what I’ll build — confirm to proceed.”*

Buttons: **Build this lesson** | **Keep chatting** | **Reset plan**

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
| **Planner** (chat) | INTAKE + PLAN | `gpt-4o-mini` | Questions, `CopilotPlan`, context patches |
| **Executor** (build) | EXECUTE + repair | `gpt-4o-mini` (upgrade slot for hard lessons) | Lesson JSON patch |

**Optional:** Planner uses slightly higher temperature; Executor uses low temperature + JSON schema.

### Tool calls (Executor)

| Tool | Purpose |
|------|---------|
| `fetch_component_specs(types[])` | Live shapes |
| `fetch_pedagogy_adapter(audience, style)` | Compressed primary or curriculum rules |
| `validate_lesson(json)` | Returns errors/warnings |
| `emit_lesson_patch(json)` | Final structured output |

Planner tools (INTAKE only):

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
│  │                             │  │ │ Thread (chat)          │ │ │
│  │                             │  │ └────────────────────────┘ │ │
│  │                             │  │ ┌────────────────────────┐ │ │
│  │                             │  │ │ Plan review (when ready)│ │ │
│  │                             │  │ │ [ Build ] [ Revise ]   │ │ │
│  │                             │  │ └────────────────────────┘ │ │
│  │                             │  │ Credits: 847.5 · pool ▾      │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Module / program surfaces

- **Program → Copilot memory** tab: edit program context manually.  
- **Module → Copilot memory** tab: arc, summaries, “Regenerate summary from lessons.”  
- Context also visible read-only in Copilot panel header (“Remembering: Riverstone Science · Module 2 — Water cycle”).

### Scoped sessions

| Entry | Starting phase |
|-------|----------------|
| Empty lesson + “Build with Copilot” | INTAKE |
| Existing lesson + “Refine” | INTAKE with lesson JSON in context; plan says **patch** not rebuild |
| Slide / component selection + “Edit with Copilot” | Short INTAKE → small PLAN → EXECUTE patch |

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
