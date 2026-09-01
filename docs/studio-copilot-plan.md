# Studio Copilot — build plan

**Status:** Planning (post club launch + Phase 5 packaging).  
**Goal:** In-studio AI companion that generates **valid lesson JSON** tutors can edit — metered per org, not unlimited in seat price.

**Companions:** [`monetization-strategy.md`](./monetization-strategy.md) §4, [`org-launch-checklist.md`](./org-launch-checklist.md), [`component-library-100.md`](./component-library-100.md), [`skills/lesson-json/SKILL.md`](../skills/lesson-json/SKILL.md)

---

## 1. Product definition

### What Copilot is

| In scope | Out of scope (v1) |
|----------|-------------------|
| Tutor describes outcome → structured lesson JSON | Auto-publish without tutor review |
| Edit at **lesson / slide / component** scope | New component types not in catalog |
| Uses registered component types only | Student-facing hint/chat AI |
| Routes **primary** vs **KS3+** authoring rules | Image generation inside lesson (optional later) |
| Quota meter on `org_id` + `user_id` | Unlimited generation in base seat plan |

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
| Studio + org scope | `components/studio/studio-org-switcher.tsx`, `programs.org_id` | Bill to correct org |
| TTS pipeline | `lib/audio-generator.ts`, `/api/audio/save` | Optional post-accept step (not in v1 gen) |
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
│  1. Auth + org staff check                                   │
│  2. Quota check (copilot_usage)                              │
│  3. Prompt assembler (skill text + scope + catalog excerpt)    │
│  4. LLM call (structured JSON mode)                          │
│  5. validateLesson() equivalent / zod parse                  │
│  6. Optional repair pass (1 retry on validation errors)      │
│  7. Log usage + return patch + validation report             │
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
- Current lesson JSON (truncated for component scope)
- Tutor instruction
- Program context (optional): subject, module title, org name

### Repair loop

1. Generate → parse JSON
2. Run validator (port `master-validator` rules to BE or shared package)
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

## 8. Model & structured output (decisions needed)

### Provider (pick one for v1)

| Option | Notes |
|--------|--------|
| **OpenAI** | Strong JSON mode / structured outputs; familiar ops |
| **Anthropic** | Good long-context for full-lesson gen; tool use |
| **OpenRouter** | Model flexibility; add routing later |

**Recommendation:** One provider for v1. Abstract behind `helpers/llmProvider.js` interface.

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

## 9. Data model

### `copilot_usage` (Mongo)

```js
{
  org_id: ObjectId | null,      // null = indie tutor personal studio
  user_id: string,
  program_id: string | null,
  lesson_id: string | null,
  scope: 'lesson_build' | 'slide_edit' | 'component_edit' | 'lesson_rewrite',
  credits_charged: 1,
  model: 'gpt-4.1-mini',
  skill_branch: 'primary' | 'curriculum',
  skill_version: '2026-09-01',
  prompt_tokens: 4200,
  completion_tokens: 3800,
  validation_ok: true,
  created_at: Date,
}
```

### `org.copilot` (or settings extension)

```js
copilot: {
  monthly_build_quota: 20,
  monthly_edit_quota: 100,
  builds_used_this_period: 0,
  edits_used_this_period: 0,
  period_start: Date,
}
```

Indie tutors: quota on `user_id` when `org_id` is null.

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

## 14. Open decisions (resolve before C0)

1. **Provider** — OpenAI vs Anthropic vs other?
2. **Default model** — cost vs quality (e.g. mini for edits, larger for full builds)?
3. **Shared validation** — duplicate validator in BE vs publish `@ast/lesson-validation` package?
4. **Image URLs in generated lessons** — placeholder only, or Cloudinary upload step?
5. **Audio** — generate TTS automatically after accept, or manual “Generate audio” (current flow)?
6. **Indie tutor quota** — separate SKUs or free tier with low cap?

---

## 15. Suggested next session

1. Agree §14 decisions (provider + model tiering minimum).
2. Run **C0 spike**: one Node script calling provider with compressed primary skill + `lesson-json` excerpt; output to `tmp/copilot-spike.json`; run `npx tsx scripts/verify-lesson.ts`.
3. If spike quality is acceptable, scaffold **C1** API + `copilot_usage` collection.

---

## 16. Definition of done (Copilot v1)

- Tutor on a club program can build a **new lesson** from a brief and land in builder with valid JSON.
- Tutor can **edit one component** via text instruction.
- Quota decrements and blocks further builds when exhausted.
- No student sees Copilot UI.
- Copilot is **not** included unlimited in `club_standard` seat price.
