# Organisation & cohort model

How clubs sit on the existing platform. Companion to [`monetization-strategy.md`](./monetization-strategy.md) (§1 charge the organisation) and the workflow we settled in product chat (shared app, org-scoped data, vanity subdomain later — **not** one deploy per club).

**Status:** Phase 4+ — student home/courses/lessons scoped by active club; hybrids can switch to Personal; pride + people search cohort/org scoped (read-time); Explore hidden unless `public_access`; vanity subdomain maps host → org cookie; joining a strict club revokes `public_access`.  
**Last updated:** September 2026

---

## Dashboards (do not merge)

| Surface | Who | Job |
|---------|-----|-----|
| `/dashboard/tutor` | Teachers / studio authors | Build programs, mark work, live class |
| `/dashboard/org` | Org **owners** (+ club tutors who staff an org) | Cohorts, seats, join codes, roster — **invite-only** |
| `/dashboard/student` | Learners | Lessons, pride, store |
| Superadmin Orgs | Platform | Create orgs / seat caps / rescue |

### Club owner login (simple)

1. Superadmin creates org + owner email → copy **invite link** `/org/invite/<token>`.
2. Owner opens link → creates password → names first cohort → lands on `/dashboard/org`.
3. Later: sign in at **`/dashboard/org`** (email + password) **or** the same invite link (password only).

No public “I’m a club” portal. Invite token stays on the membership so the link remains a bookmark; password is always required after setup.

---

## Verdict first

**Yes — this builds on the current infrastructure.** You already have:

- Global `users` + JWT (`user_id`, `account_type`)
- Programs owned by `tutor_id`
- Student enrolments in `program_registrations` (+ denorm `users.programs`)
- Studio / student dashboards that list by ownership or enrolment

You do **not** need new databases, subdomain forks, or a second auth stack.

What you add is a thin membership layer:

```
organizations → org_memberships → cohorts → cohort_memberships
programs.org_id (+ keep tutor_id as author)
program_registrations.cohort_id (optional but recommended)
```

Hardest change is cultural in code: **stop treating `account_type` as the only role.** A person can be a tutor in Riverside and a public catalog student on the same login. Membership rows carry the role; `account_type` becomes a *default / legacy* label.

---

## Principles

1. **One person = one account.** Never a second login for “public me.”
2. **Orgs are memberships.** Isolation is query filters + membership checks, not separate DBs.
3. **Cohorts are how kids are grouped.** Day-to-day unit for invite codes, live class, pride scope.
4. **Seats are counted per org.** Multi-org student = a seat in each org that claims them.
5. **Public space is opt-in** (or org-locked), same account.
6. **Vanity subdomain** (`riverside.after-school.tech`) only sets org context — same Next app, same API.
7. **Marketplace publish** is a visibility flag on a program, not a copy into another universe.

---

## Layer diagram

```
Platform (after-school.tech)
└─ Organization          ← customer (club / academy)
   ├─ org_memberships    ← owner | tutor | student
   ├─ cohorts            ← “Thu KS2”, “Sat Coding”
   │  └─ cohort_memberships
   └─ programs           ← private by default; optional marketplace
      └─ program_registrations (student enrolments)
```

Independent tutors with no club still exist: `org_id = null` programs, personal enrolments — today’s behaviour.

---

## Data shapes

All new collections live in the **main** DB (`afterschooltech`), beside `users` / `programs` / `program_registrations`.

IDs: keep the platform style — string `user_id` for people; Mongo `ObjectId` for org/cohort/program docs (programs already use ObjectId).

### `organizations`

```js
{
  _id: ObjectId,
  name: "Riverside After-School",
  slug: "riverside",              // unique; vanity host later
  status: "active",               // active | suspended | trial
  seat_cap: 40,
  settings: {
    allow_public_opt_in: true,    // if false, kids cannot join public catalog
    vanity_enabled: false
  },
  billing: {
    plan: "club_monthly",         // freeform until Stripe
    external_customer_id: null
  },
  created_at: Date,
  updated_at: Date
}
```

**Note:** There is already a stub collection `organizations` used as a thin signup profile (`{ user_id, email, … }`). Do **not** overload that. Either:

- rename the stub to something like `organization_profiles` (legacy), or
- use a new collection name `orgs` / `clubs` and leave the stub alone until deleted.

**Recommendation:** new collection name **`orgs`** to avoid colliding with the signup stub.

### `org_memberships`

```js
{
  _id: ObjectId,
  org_id: ObjectId,
  user_id: "Ab12Cd",              // users.user_id
  role: "student",                // owner | tutor | student
  status: "active",               // active | invited | removed
  seat_counts: true,              // students usually true; owners/tutors false
  invited_by: "Xy98Zq" | null,
  joined_at: Date,
  created_at: Date
}
```

**Indexes:** unique `(org_id, user_id)`; `(user_id, status)` for “my orgs”; `(org_id, role, status)` for roster.

**Seat usage** = count of memberships where `org_id = X AND seat_counts = true AND status = active`.

### `cohorts`

```js
{
  _id: ObjectId,
  org_id: ObjectId,
  name: "Thu KS2 · Spring",
  join_code: "RIV-THU",           // unique among active codes (or unique globally)
  status: "active",               // active | archived
  program_ids: [ObjectId, …],     // programs assigned to this cohort
  created_by: "Xy98Zq",
  created_at: Date,
  updated_at: Date
}
```

### `cohort_memberships`

```js
{
  _id: ObjectId,
  cohort_id: ObjectId,
  org_id: ObjectId,               // denorm for easy filters
  user_id: "Ab12Cd",
  status: "active",
  joined_at: Date
}
```

**Indexes:** unique `(cohort_id, user_id)`; `(user_id, status)`.

Joining a cohort **implies** an `org_memberships` student row (create if missing) and consumes a seat if new to the org.

### Programs — additive fields

Keep existing docs. Add:

```js
{
  // existing
  tutor_id: "Xy98Zq",             // author / primary editor (unchanged)
  name, description, modules, is_published, …

  // new
  org_id: ObjectId | null,        // null = independent / personal tutor library
  visibility: "org",              // org | marketplace | unlisted
  // is_published stays = “live for enrolled students”
}
```

| `visibility` | Who can find / enrol |
|--------------|----------------------|
| `org` | Members of that org (via cohort or direct enrol) |
| `marketplace` | Public catalog + cut later |
| `unlisted` | Direct link / code only |

Studio list for a tutor in Riverside:  
`{ org_id: riverside, tutor_id }` **or** all org programs if role is `owner`.

Independent tutor (no org):  
`{ tutor_id, org_id: null }` — today’s query.

### `program_registrations` — additive fields

```js
{
  // existing
  program_id, user_id, status, progress, registered_at, last_activity,

  // new
  org_id: ObjectId | null,
  cohort_id: ObjectId | null,     // set when join-code path enrolled them
  source: "cohort" | "self" | "tutor" | "marketplace"
}
```

Progress stays **per registration** (already). Same marketplace program in two clubs ⇒ two registrations if you want separate runs; for v1, one registration per `(user_id, program_id)` is fine if you treat progress as global per program — **prefer allowing one active registration per (user, program, org)** later if clubs complain. Start simple: keep unique `(user_id, program_id)` as today; add `org_id` / `cohort_id` as attribution.

### Users — additive fields (optional)

```js
{
  // existing account_type stays for JWT / legacy UI
  account_type: "student" | "tutor" | …,

  // new
  public_access: false,           // opted into platform public catalog
  active_org_id: ObjectId | null, // last context (client can also store this)
  active_cohort_id: ObjectId | null
}
```

**Do not** encode “tutor at Riverside” only in `account_type`. Encode it in `org_memberships.role`.

JWT can stay `{ user_id, role: account_type }` for a while; APIs that need org context take `org_id` (header or query) and verify membership server-side.

---

## Roles (what they mean)

| Role | Scope | Can |
|------|--------|-----|
| **Platform superadmin** | Global | Create orgs, set seat_cap, suspend |
| **Org owner** | One org | Invite tutors, create cohorts, see seat usage, billing later |
| **Tutor** | One org (or many) | Studio in that org, run cohorts, invite students |
| **Student** | One or many orgs | See enrolled programs; join codes |
| **Public visitor** | Same user + `public_access` | Marketplace catalog / public pride |
| **Parent** | Later | Linked to child; out of v1 |

A user may hold **different roles in different orgs** (tutor at A, student at B). Rare but allowed.

---

## Core workflows

### A. Own an organisation

1. Superadmin creates `orgs` row + invites owner email.
2. Owner accepts → `org_memberships` `{ role: "owner", seat_counts: false }`.
3. Owner invites tutors → memberships `{ role: "tutor" }`.
4. Owner/tutor creates cohort + join code; assigns `program_ids`.
5. Tutor builds programs with `org_id` set (studio “active org”).

### B. Onboard a student

1. Kid opens `/join/RIV-THU` (or vanity host that resolves org + code).
2. If logged out → signup/login (same global `users`).
3. Server: validate code → check `seat_cap` → upsert `org_memberships` (student) → upsert `cohort_memberships` → create `program_registrations` for cohort `program_ids` if missing.
4. Redirect to student home filtered by active org/cohort.

**Existing user joining a second club:** login → accept join → second org membership. No new account.

### B2. Leave a club (student self-serve)

1. Student opens **Settings → Your club** → **Leave club** (confirm).
2. Server: `POST /api/orgs/:orgId/leave` — verifies active **student** membership (not owner/tutor).
3. Deactivates `cohort_memberships` for that org; sets `org_memberships.status = removed` (frees seat).
4. **Does not** delete the user account, Personal library, marketplace registrations, or lesson completions.
5. Owner/tutor can still remove students from **People** (`DELETE .../membership`) — same outcome.

**Class changes** stay owner-driven (`POST .../members/:userId/cohort`). Students cannot self-move cohort.

### C. Want the public space

1. Student (or parent later) enables **Public catalog** → `users.public_access = true`.
2. If org `allow_public_opt_in === false` → blocked.
3. Same account; marketplace enrolments use `source: "marketplace"`, `org_id: null`.

### D. Multi-org student

1. Memberships in Riverside + Byte Club.
2. UI context switcher sets `active_org_id` / `active_cohort_id`.
3. Home feed / pride default to **active cohort**.
4. Each org’s seat count includes them independently.

### E. Publish to marketplace

1. Program `visibility: "org"` → `"marketplace"` (owner/tutor permission).
2. Appears on public catalog; platform cut later.
3. No document copy; `tutor_id` / `org_id` remain for attribution.

---

## What “isolation” means in queries

| Surface | Filter |
|---------|--------|
| Student my programs (club mode) | Registrations where `user_id` + (`org_id` = active org **or** cohort in active org) |
| Student catalog (club mode) | Programs assigned to their cohorts / org — **not** full marketplace unless `public_access` |
| Tutor studio | `org_id = active` and (owner **or** `tutor_id = me`) |
| Org roster | `org_memberships` for `org_id` |
| Pride / live (club) | Scope by `cohort_id` or `org_id` |
| Marketplace | `visibility = marketplace` + published |

Fail closed: if `org_id` is present on a resource, non-members get 404/403 — never leak existence across clubs if avoidable.

---

## Fit on current infrastructure

### Easy (additive)

| Piece | Why it’s easy |
|-------|----------------|
| New `orgs`, `org_memberships`, `cohorts`, `cohort_memberships` | New collections; no rewrite of lesson JSON |
| `programs.org_id` / `visibility` | Optional fields; independent tutors keep `org_id: null` |
| Join-code API | New route; reuses signup/login |
| Superadmin create-org | You already have superadmin JWT |
| Seat count | Aggregation on memberships |
| Vanity subdomain later | Middleware maps host → `slug` → `org_id` cookie |

### Moderate (touch existing paths)

| Piece | Work |
|-------|------|
| Studio `find({ tutor_id })` | Also filter / set `org_id`; owner sees all org programs |
| `getMyPrograms` | Prefer registrations with org/cohort context; don’t show marketplace unless opted in |
| `listPrograms` public catalog | Filter `visibility = marketplace` (today everything published is global) |
| Authorize studio | Allow org owner without forcing `account_type === 'tutor'` forever |
| Class activity / drops fan-out | Prefer cohort roster over “everyone enrolled in program” when `cohort_id` set |

### Harder / careful

| Piece | Why |
|-------|-----|
| Dual meaning of role | JWT `role` vs membership role — migrate gradually |
| Stub `organizations` / `parents` / `tutors` side collections | Confusing names; leave stubs, don’t extend them |
| Denorm `users.programs` | Still OK as cache; source of truth stays `program_registrations` |
| Global pride boards | Must stay opt-in / cohort-scoped so clubs don’t flee |
| Billing / Stripe | After membership works; seat_cap can be manual at first |

### What you should **not** rebuild

- Per-org Mongo / per-org Next deploy
- Separate FCM projects per club
- Second user account for public
- Copying lesson trees between “tenant DBs”

Lesson content (`ast_lessons`), interactions, stars, missions, push tokens — all stay global to the user. Org only gates **who can see / assign / pay for** curriculum access.

---

## Suggested build order

1. **`orgs` + `org_memberships`** — superadmin create, owner invite, seat_cap  
2. **`cohorts` + join codes + `cohort_memberships`** — student onboard path  
3. **`programs.org_id` + studio active-org** — new programs tagged; old programs stay `org_id: null`  
4. **Student home scoped to active org** — hide global catalog by default for club kids  
5. **`visibility` + marketplace filter** — publish toggle  
6. **`public_access` opt-in**  
7. **Context switcher UI** (multi-org)  
8. **Vanity subdomain**  
9. **Stripe / Copilot quota on `org_id`**

Steps 1–4 are enough to **sell a club**. Copilot meters against `org_id` later ([`monetization-strategy.md`](./monetization-strategy.md) §4).

**Launch tracking:** [`org-launch-checklist.md`](./org-launch-checklist.md) — QA + ops polish before Copilot.  
**Superadmin expansion (later):** [`superadmin-console.md`](./superadmin-console.md).

---

## Migration notes for existing data

| Current | Transition |
|---------|------------|
| Tutors with programs, no org | Leave `org_id: null` — “indie” mode forever allowed |
| Students enrolled in programs | Registrations stay; `org_id`/`cohort_id` null until they join a cohort |
| Published programs on global catalog | Treat as `visibility: "marketplace"` (or `"unlisted"` until you decide) |
| Users with `account_type: organization` | Unused stub — ignore; real orgs are `orgs` collection |
| One tutor many students via enrolments | Still valid; cohort is an extra grouping, not a replacement |

Backfill optional: create a default org per busy tutor later — **not** required for launch.

---

## API sketch (v1)

```
POST   /api/superadmin/orgs
GET    /api/orgs/mine
POST   /api/orgs/:orgId/invites          { email, role }
POST   /api/orgs/:orgId/cohorts
POST   /api/cohorts/join                 { code }   // auth required
POST   /api/orgs/:orgId/leave              // student self-serve; auth required
PATCH  /api/programs/:id                 { visibility, org_id, … }
PATCH  /api/me/public-access             { enabled }
```

Studio and my-programs keep existing URLs; add `X-Org-Id` or `?orgId=` once membership exists.

---

## Open decisions (small)

1. **Collection name:** `orgs` vs rename signup stub — prefer **`orgs`**.  
2. **Registration uniqueness:** keep global `(user_id, program_id)` for v1, or per-org — prefer **global for v1**.  
3. **Default for brand-new signup with no code:** public indie student (`public_access: true`) vs forced “enter a code” — prefer **public indie**, clubs use codes.  
4. **Owner must also be tutor?** Prefer **yes for v1** (simpler studio) or owner-only admin without studio — product call.

---

## One-line summary

Add **orgs + memberships + cohorts** on the same Mongo/JWT stack; tag programs with `org_id`; onboard kids with **join codes**; keep **one account** for public and multi-club; sell seats before Copilot.
