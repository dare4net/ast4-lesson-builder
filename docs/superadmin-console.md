# Platform superadmin console

**Status:** Planned — UI shell exists (sidebar, routes); expand after **org launch** and before/at **Copilot metering**.  
**Companion:** [`org-launch-checklist.md`](./org-launch-checklist.md), [`org-cohort-model.md`](./org-cohort-model.md), [`monetization-strategy.md`](./monetization-strategy.md)

---

## Purpose

Superadmin is **platform ops** — not a second product dashboard. It exists so After-school.tech staff can:

- Onboard and rescue clubs
- Inspect users and content when support email arrives
- Run gamification catalog and push jobs (already built)
- Later: moderate marketplace, sync billing, read Copilot usage

Club owners use `/dashboard/org`. Tutors use `/dashboard/tutor` + `/studio`. Students use `/dashboard/student`. **Do not merge these surfaces.**

---

## Current state (built)

| Route | What works |
|-------|------------|
| `/superadmin` | Overview stats |
| `/superadmin/missions` | Mission catalog CRUD |
| `/superadmin/achievements` | Achievement catalog CRUD |
| `/superadmin/jobs` | Manual push reminder preview/run |
| `/superadmin/orgs` | Create org, invites, cohorts, program assign, vanity toggle |
| `/superadmin/login` | Env-auth console |

**Backend today:** `POST /superadmin/login`, catalog, jobs, full org CRUD under `/superadmin/orgs/*`.  
**Not built:** user search, global program admin, moderation, billing sync, audit log.

---

## Build phases (do in order)

### Phase A — Org ops polish *(during org launch)*

Small UI on **existing APIs** — no new collections.

- [x] Org list search + filter (`active` / `trial` / `suspended`)
- [x] Edit seat cap inline (`PATCH /superadmin/orgs/:id`)
- [x] Suspend / reactivate org (status field already in schema)
- [x] Overview cards: seats used, active/suspended counts
- [x] Copy-friendly invite + join links on org detail
- [ ] Recent cohort joins on overview (optional API)

**Why first:** You need this to run the first real club without Mongo shell.

---

### Phase B — People & programs *(after org launch checklist green)*

New superadmin APIs + console pages. Support/rescue tooling.

#### Users (`/superadmin/users`)

```
GET  /superadmin/users?q=&role=&limit=
GET  /superadmin/users/:userId
```

**List/detail should show:**

- Email, handle, `user_id`, `account_type` (legacy label)
- Org memberships (role, status, org name)
- Cohort memberships
- `public_access`, program registrations (count + sample)
- Created / last login if stored

**Actions (v1):**

- Toggle `public_access` (support override)
- Link to org detail
- Optional: trigger password reset email (if auth supports)

#### Programs (`/superadmin/programs`)

```
GET  /superadmin/programs?q=&org_id=&visibility=&tutor_id=
PATCH /superadmin/programs/:id  { visibility, is_published, org_id? }
```

**List/detail should show:**

- Name, author (`tutor_id`), `org_id`, visibility, published flag
- Module/lesson counts
- Marketplace vs club-only vs unlisted

**Actions (v1):**

- Force `visibility` (marketplace / org / unlisted)
- Soft-delete / restore rescue
- Reassign `org_id` (careful — audit later)

#### Tutors

Not a separate collection — **filter users** with studio programs or `org_memberships.role in (owner, tutor)`. Detail page links to their programs and staffed orgs.

---

### Phase C — Trust & safety *(when marketplace has volume)*

Only after public listings are common.

- [ ] `visibility: pending_review` on marketplace publish
- [ ] Moderation queue UI (`/superadmin/moderation`)
- [ ] User reports / flags collection
- [ ] User suspend / ban (distinct from org membership inactive)
- [ ] Audit log: `{ actor, action, target, at }` on superadmin mutations

---

### Phase D — Billing & Copilot ops *(with Stripe + Copilot quota)*

After [`org-launch-checklist.md`](./org-launch-checklist.md) step 9 and Copilot meter exist.

- [ ] Org billing tab: Stripe customer id, plan, seat cap sync
- [ ] Copilot usage by org / tutor (`org_id` meter from monetization doc §4)
- [ ] Manual quota bump (support)
- [ ] Feature flags per org (optional)

---

## Proposed nav (target)

| Section | Phase |
|---------|-------|
| Overview | A (enhance) |
| Organisations | A (polish) |
| Users | B |
| Programs | B |
| Missions | ✅ done |
| Achievements | ✅ done |
| Jobs | ✅ done |
| Moderation | C |
| Billing & usage | D |

---

## UI conventions

Match the rebuilt console (2026):

- Light shell `#F4F7FB`, white cards, **amber** accent (platform admin)
- Sidebar + mobile bottom nav — `lib/superadmin-nav.ts`
- Page header — `SuperadminPageHeader`
- One primary task per route; avoid tab soup inside a single page

---

## Security

- Credentials: `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD` in server env only
- Token in `sessionStorage` (`ast_superadmin_token`) — separate from student JWT
- Never expose superadmin routes in student/tutor middleware
- Phase C+: log every destructive action

---

## Explicit non-goals

- Superadmin is **not** a replacement for org owner dashboard
- No “edit lesson content” in v1 — link opens Studio as the author would
- No full analytics warehouse — use overview + external tools until needed

---

## When to start each phase

| Milestone | Start |
|-----------|--------|
| Phase A | **Now** — parallel with org QA |
| Phase B | Org launch checklist green |
| Phase C | First marketplace disputes or spam |
| Phase D | Stripe + Copilot quota shipped |

**Product sequence agreed:** finish **org launch** → **Copilot** (meter + studio UX) → expand superadmin Phase B–D as ops pain appears.
