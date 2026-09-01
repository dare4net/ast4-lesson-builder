# Studio Copilot — build plan

**Status:** Planning (post club launch + Phase 5 packaging).  
**Goal:** In-studio AI companion that generates **valid lesson JSON** tutors can edit — metered credits, not unlimited in seat price.

**Companions:** [`studio-copilot-harness.md`](./studio-copilot-harness.md) (plan/execute UX, memory, live specs), [`monetization-strategy.md`](./monetization-strategy.md) §4, [`org-launch-checklist.md`](./org-launch-checklist.md)

---

## 0. Product decisions (locked)

| Topic | Decision |
|-------|----------|
| **Surface** | Copilot is a **studio / builder** feature — not an org-dashboard feature |
| **Who pays** | **Org pool** (org-wide **or** per-tutor allocation — org chooses mode) + **personal pool**. Tutor may spend **personal credits on club content** |
| **Default pool** | **Club program** → default **club pool** (per org mode). **Personal program** → personal pool only |
| **Org Copilot mode** | **`org_wide`** — shared org bucket for all tutors · **`allocated`** — per-tutor caps; when exhausted, tutor **requests more** (owner/superadmin tops up allocation). No silent overflow to org-wide while in allocated mode |
| **Attribution** | Usage logged on `user_id` + optional `org_id` from program context — not “org owns Copilot UI” |
| **Generation context** | Always include **program name + description**, **module name + description**, plus lesson scope |
| **Images** | **No AI image gen in v1.** Model outputs **image prompts** in component props (same as skills today); tutor sources/uploads assets |
| **Audio** | **Unchanged** — manual “Generate audio” in builder; not part of Copilot generation |
| **Lesson create UX** | **New lesson** → blank `Untitled lesson` → straight to `/editor`. Title/description in builder **Studio Settings** (or module lesson settings). No create modal, no upfront TTS |
| **Provider (v1 recommendation)** | **OpenAI `gpt-4o-mini`** — see §8. Kimi is cheap on input but expensive on output; lesson gen is output-heavy |
| **Validator** | Copy `master-validator` rules into backend for C0/C1; extract shared package later if maintenance hurts |

## 1. Product definition

### What Copilot is

| In scope | Out of scope (v1) |
|----------|-------------------|
| Tutor describes outcome → structured lesson JSON | Auto-publish without tutor review |
| Edit at **lesson / slide / component** scope | New component types not in catalog |
| Uses registered component types only | Student-facing hint/chat AI |
| Routes **primary** vs **KS3+** authoring rules | Image generation inside lesson (optional later) |
| Quota meter on **credit pool** (`org_id` and/or `user_id`) | Unlimited generation in base seat plan |

### The loop (why tutors pay)

1. **Describe** — year group, topic, length, practice vs live, “they should be able to ___”.
2. **Generate** — slides + components as real studio JSON (not a wall of MCQs).
3. **Review** — diff preview; tutor accepts/rejects; never silent overwrite.
4. **Refine** — scoped text prompts (“make this slide shorter”, “swap finale for hangman on key terms”).
5. **Own** — drag, delete, hand-edit props in existing builder.

One-shot “generate and dump” is a demo. **Revise-in-place** is the product.

---

## 2. Assets we already have

| Asset | Location | Copilot use |
|-------|----------|-------------|
| Primary authoring rules | `skills/primary-lesson-generator/SKILL.md` | System prompt branch (KS2) |
| KS3+ authoring rules | `skills/curriculum-lesson-generator/SKILL.md` | System prompt branch (KS3+) |
| JSON schema reference | `skills/lesson-json/SKILL.md` | Structured output spec + examples |
| Component validators | `lib/validation/master-validator.ts`, `lib/validation/registry` | Post-gen gate; repair loop |
| Lesson builder | `components/lesson-builder.tsx`, `/builder` | Merge target UI |
| Studio + program context | `programs.org_id` for **club program attribution** when debiting org pool |
| Lesson metadata in builder | `components/lesson-controls.tsx` — title/description without create modal |
| TTS pipeline | `lib/audio-generator.ts` — **manual only**; not invoked by Copilot |
| Time limits (live) | `lib/validation/time-limit-calculator.ts` | Inject on KS3 assessment slides |

**Gap:** No LLM provider, no generation API, no prompt harness in repo yet.

---

## 3. Architecture (model → harness → API)

```
┌─────────────────────────────────────────────────────────────┐
│  Studio / Builder UI                                         │
│  Copilot panel: prompt, scope, age band, accept/reject diff  │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /api/copilot/generate (FE BFF)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (afterschool-tech-backend)                          │
│  1. Auth (tutor / org staff)                                 │
│  2. Resolve credit pool (personal vs org; tutor choice)       │
│  3. Quota check                                              │
│  4. Load program + module metadata for prompt context          │
│  5. Prompt assembler (skill + scope + catalog excerpt)       │
│  6. LLM call (structured JSON mode)                          │
│  7. validateLesson() on backend (ported from FE)               │
│  8. Optional repair pass (1 retry on validation errors)      │
│  9. Log usage + return patch + validation report             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                     Provider API
                  (OpenAI / Anthropic / etc.)
```

### Why generation lives on the backend

- API keys never in browser
- Quota enforcement is authoritative
- Same validation for CLI, studio, and future marketplace tools
- Audit log per org (`copilot_usage` collection)

### FE BFF option

Short term: Next.js `app/api/copilot/*` proxies to Express with JWT. Long term: call Express directly from studio if CORS/cookies are clean.

---

## 4. Scopes & operations

| Scope | Input | Output patch | Credit weight |
|-------|--------|--------------|---------------|
| **lesson_build** | Outcome brief, slide count hint, age band | Full lesson or empty lesson + slides[] | High (1 build) |
| **slide_edit** | Slide id + instruction | Replace `slides[i].components` | Medium |
| **component_edit** | Component id + instruction | Replace single component props | Low |
| **lesson_rewrite** | Tone/length/style on whole lesson | Full lesson replace (with diff) | High |

Meter **builds** and **edits** separately (monetization §4). Suggested v1 weights:

- `lesson_build` / `lesson_rewrite` → 1 build credit
- `slide_edit` → 1 edit credit
- `component_edit` → 1 edit credit (or 0.25 — decide in pricing)

---

## 5. Age routing (non-negotiable)

| Signal | Skill branch | Mode defaults |
|--------|--------------|---------------|
| Year 4–5 / ages 8–10 / “primary” | `primary-lesson-generator` | Practice only, story framing OK, low text |
| Year 7+ / KS3 / “secondary” | `curriculum-lesson-generator` | Live assessment on final lesson, time limits |

**Never mix** primary and curriculum rules in one generation. UI must force explicit age band before first build.

---

## 6. Prompt harness design

### System prompt layers (fixed order)

1. **Role** — “You output AST Lesson Builder JSON only.”
2. **Skill** — full or compressed primary *or* curriculum skill (see §7 token budget).
3. **Catalog** — allowed `type` values + one minimal example per high-use component.
4. **Constraints** — no unknown types; UUID-ish ids; `slide-<ts>` pattern; validation errors from last attempt.
5. **Output contract** — JSON schema or tool definition (see §8).

### User prompt layers

- Scope (build / slide / component)
- **Program:** `name`, `description`
- **Module:** `name`, `description`
- Current lesson JSON (truncated for component scope)
- Tutor instruction
- Age band (primary vs curriculum)

### Visual components

For `image`, `hotspot`, `video` poster, etc.: model fills **educational copy + `alt` + `caption`** and a separate **`imagePrompt`** (or skill-style “Asset prompt: …” in description) for the tutor to source art. **No URLs invented** unless using a known placeholder pattern.

### Repair loop

1. Generate → parse JSON
2. Run validator on backend (same rules as `lib/validation/master-validator.ts` — see §8.1)
3. If errors: one repair call with error list (max 1 retry in v1)
4. If still invalid: return errors to UI; do not charge full build (policy TBD)

---

## 7. Token & cost strategy

| Approach | Pros | Cons |
|----------|------|------|
| **A. Compress skills** — summarise SKILL.md to ~2–4k tokens each | Cheaper per call | Must re-sync when skills change |
| **B. Full skill in system prompt** | Highest quality | Expensive on lesson_build |
| **C. RAG over skill sections** | Scales as skills grow | More infra |

**Recommendation:** Start with **A** for v1; keep skill version hash in `copilot_usage` row for debugging. Revisit **C** when edit scopes need narrow retrieval.

Track per request: `prompt_tokens`, `completion_tokens`, `model`, `skill_version`, `scope`, `org_id`, `user_id`.

---

## 8. Model & provider (v1 locked)

### Recommendation: **OpenAI `gpt-4o-mini`**

| Model | Input / 1M | Output / 1M | Why |
|-------|------------|-------------|-----|
| **gpt-4o-mini** | ~$0.15 | ~$0.60 | Best $/quality for **large JSON output**; strong structured JSON mode |
| Kimi K2.5 | ~$0.60 | ~$3.00 | Cheaper brand, but **output costs ~5×** — hurts full-lesson builds |
| Kimi K2.6 | ~$0.95 | ~$4.00 | Better quality; still output-heavy vs mini |

**Rough cost per lesson build** (8k output tokens): mini ≈ **$0.005**; Kimi K2.5 ≈ **$0.024**.

Kimi is a fine **second provider** behind `llmProvider` if you want to A/B quality later. For cheapest reliable v1, start with **gpt-4o-mini** + **prompt caching** on the fixed system prompt.

Use **OpenAI structured outputs** (JSON schema) or `response_format: { type: "json_object" }` + repair loop.

Abstract behind `helpers/llmProvider.js` so Kimi/OpenRouter can plug in via OpenAI-compatible base URL.

### 8.1 Validator: duplicate vs shared package (plain English)

Today lesson validation lives only in the **frontend** (`master-validator.ts`). Copilot runs on the **backend**, which must reject bad JSON before returning it to the tutor.

- **Duplicate (v1):** Copy or port the same validation rules into Node on the backend. Two copies to keep in sync when components change.
- **Shared npm package (later):** Move validators to `@ast/lesson-validation` imported by both FE and BE — one source of truth.

**Plan:** duplicate for C0/C1 spike; extract a package when Copilot ships or when sync pain shows up.

### Output shape

**Preferred:** JSON Schema / strict structured output matching a subset of `Lesson`:

```ts
// generation result (not stored as-is — merged into builder state)
{
  operation: 'lesson_build' | 'slide_edit' | 'component_edit',
  lesson?: Lesson,           // full or partial
  slidePatch?: { slideId, components },
  componentPatch?: { componentId, component },
  rationale?: string         // short, for tutor UI — not shown to students
}
```

Validate with zod generated from shared types (long-term: extract `types/lesson` to shared package).

---

## 9. Credit pools & data model

### Who pays (v1)

| Pool | Buyer | When it applies |
|------|-------|-----------------|
| **Org-wide pool** | Club | `copilot_mode: org_wide` — any tutor on a club program draws from one shared bucket |
| **Per-tutor allocation** | Club | `copilot_mode: allocated` — each tutor has a cap; **request more** when empty (mailto / owner action in superadmin) |
| **Personal pool** | Tutor | Personal programs, or **optional override** on club programs (tutor pays) |

**Org setting (v1):** `settings.copilotMode: 'org_wide' | 'allocated'` (superadmin or org owner when billing UI exists).

**UI rules**

- Club program → default **club credits** (org-wide or allocation per org mode).
- Personal program → **personal credits only**; club pool hidden.
- Club program + tutor has personal balance → **switch to personal** before Generate.
- Allocated mode, zero left → block generate + **Request more credits** CTA (not auto-debit org-wide).

**Superadmin (v1):** org-wide monthly caps **or** per-tutor allocation table; toggle org mode; top-up on request.

### `copilot_quota` (Mongo)

```js
// Org-wide pool
{ kind: 'org', org_id, builds_remaining, edits_remaining, period_start }

// Tutor personal pool
{ kind: 'user', user_id, builds_remaining, edits_remaining, period_start }

// Per-tutor allocation under org (v1)
{ kind: 'org_user', org_id, user_id, builds_remaining, edits_remaining, period_start }
```

### Pilot quotas (ops defaults, not product logic)

Before Stripe self-serve, you manually set how many Copilot actions each club or tutor gets per month in superadmin — same idea as setting `seatCap` today.

Example starter numbers (from monetization doc — **you can change anytime**):

| Credit type | Suggested pilot default | What counts as 1 |
|-------------|-------------------------|------------------|
| **Builds** | 20 / month / org (or per allocation) | Full lesson generate or lesson rewrite |
| **Edits** | 100 / month | Slide or component scoped edit |

These are **not** hardcoded in the app forever — they’re the numbers you type in when onboarding the first paying club so tutors don’t burn unlimited API spend. Stripe/metered billing replaces manual entry later.

### `copilot_usage` (Mongo)

```js
{
  pool_kind: 'org' | 'user' | 'org_user',
  org_id: ObjectId | null,
  user_id: string,
  program_id: string | null,
  program_name: string | null,
  module_id: string | null,
  module_name: string | null,
  lesson_id: string | null,
  scope: 'lesson_build' | 'slide_edit' | 'component_edit' | 'lesson_rewrite',
  credits_charged: 1,
  model: 'gpt-4o-mini',
  skill_branch: 'primary' | 'curriculum',
  skill_version: '2026-09-01',
  prompt_tokens: 4200,
  completion_tokens: 3800,
  validation_ok: true,
  created_at: Date,
}
```

### Org `copilot` settings (optional shortcut)

Orgs may still store default monthly quotas for ops; billing is **not** tied to `brandingTier`. Copilot SKUs are separate from club seat plans.

---

## 10. API sketch

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/copilot/generate` | Main generation |
| GET | `/copilot/quota` | Remaining credits for org/user |
| GET | `/copilot/usage` | Owner/superadmin history |

**Auth:** Same JWT as studio. Require org staff or tutor role. Pass `org_id` from studio context (must match program.org_id).

**Rate limits:** Per-user soft limit + org quota hard stop.

---

## 11. Studio UI sketch

### Entry points

1. **Empty lesson** — “Build with Copilot” on lesson create (`lesson-creation-modal.tsx`)
2. **Builder chrome** — right drawer or bottom panel (persistent while editing)
3. **Context menu** — “Edit with Copilot” on slide / component

### Panel states

1. **Setup** — age band, scope, brief textarea
2. **Generating** — streaming status text (not token stream to JSON — too fragile)
3. **Preview** — side-by-side or slide diff; validation warnings surfaced
4. **Accept** — merge into `lesson` state; undo via existing `useLessonHistory`
5. **Quota** — “12 builds left this month” in panel header

Do **not** auto-save to DB on accept — tutor still hits Save.

---

## 12. Phased delivery

| Phase | Deliverable | Exit criteria |
|-------|-------------|---------------|
| **C0 — Spike** | CLI script: prompt → JSON file → passes `verify-lesson.ts` | 3 primary + 3 KS3 lessons validate green |
| **C1 — API** | BE `/copilot/generate` + quota stub + usage log | Postman generates valid lesson; quota blocks at 0 |
| **C2 — Builder UX** | Panel in `/builder`, lesson_build + component_edit only | Tutor accepts patch into builder |
| **C3 — Edit scopes** | slide_edit + lesson_rewrite + diff preview | Refine loop feels useful |
| **C4 — Metering prod** | Org quotas in superadmin; owner readout | Pilot club has 20/100 limits |
| **C5 — Billing** | Stripe metered or credit packs | Invoice line matches usage |

**Do not start C5 until C2 is used by a real tutor.**

---

## 13. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Invalid JSON breaks builder | Validator + repair loop; never merge without accept |
| Primary content too academic | Hard age gate; eval set of 10 primary prompts |
| Cost blowout | Quota first; log tokens; cap max slides per build |
| Skill drift | `skill_version` in logs; CI eval on skill change |
| IP / data | No student PII in prompts; org content stays in your VPC |

---

## 14. Open decisions (remaining)

1. **Pilot default numbers** — e.g. 20 builds / 100 edits for first clubs (ops; set in superadmin).
2. **“Request more” UX** — mailto owner vs in-app notify (v1 mailto is fine).

**Resolved:** org-wide vs allocated (org chooses), no overflow when allocated, personal credits on club content OK, pool default by program type, provider, images, audio, validator.

---

## 15. Suggested next session

**Harness first** — see [`studio-copilot-harness.md`](./studio-copilot-harness.md).

1. **H0** — Export `component-specs` from `lib/component-definitions` (live shapes).
2. **H1** — `studio_context` on program + module (Mongo + simple settings UI).
3. **H2** — Planner thread API: intake chat → structured `CopilotPlan` (no execute yet).

---

## 16. Definition of done (Copilot v1)

- Tutor on a **club or personal** program can build a **new lesson** from a brief and land in builder with valid JSON.
- Tutor can choose **org pool vs personal pool** when both exist.
- Quota decrements and blocks further builds when exhausted.
- No student sees Copilot UI.
- Copilot credits are a **separate SKU** from club seat / branding plans.
