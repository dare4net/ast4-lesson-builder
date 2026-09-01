# Club experience & branding — build plan

**Goal:** Two students in two schools should feel they are in different clubs, on one shared app — sellable in tiers.

**Companions:** [`org-cohort-model.md`](./org-cohort-model.md), [`org-launch-checklist.md`](./org-launch-checklist.md)

**Last updated:** September 2026

---

## Sellable tiers

| Plan | Includes |
|------|----------|
| **Standard** | Tier 1 — accent, vanity, join chrome, student header |
| **Branded** | + Tier 2 — logo, banner, welcome, org-chosen pride scope |
| **White-label** | + Tier 3 — custom join layout, favicon, emails, first-visit splash |

Store on org as `settings.brandingTier` (`standard` \| `branded` \| `white_label`) until Stripe maps plans.

---

## Already shipped (baseline)

- [x] Orgs, memberships, cohorts, join codes (backend)
- [x] Org dashboard (`/dashboard/org`) — overview, cohorts, programs, people, settings shell
- [x] Studio org scope + program tagging
- [x] Student club / personal context switcher
- [x] Student cohort display (switcher + settings card)
- [x] Vanity host middleware + cookie (dev) + CORS
- [x] Join page `/join/[code]` with org/cohort preview
- [x] Superadmin multi-page console + org ops (search, seat cap, suspend)
- [x] Pride / people search club scope via `clubScope.js` (auto cohort → org fallback)
- [x] Settings `queryKey` fix for pride summary

---

## Phase 0 — Shared foundation

- [ ] **0.1** Extend org model: `accentColor`, `logoUrl`, `bannerUrl`, `welcomeMessage`, `prideScope` (`cohort` \| `org`), `brandingTier`, optional `joinLayout`
- [ ] **0.2** `resolveOrgAccent(slug, accentColor?)` — owner colour or slug-hash fallback (BE + FE)
- [ ] **0.3** Public org API returns safe branding subset (`GET /orgs/public/:slug`)
- [ ] **0.4** `/orgs/mine` includes branding for student org rows
- [ ] **0.5** `orgCanUse(tier, feature)` feature gate helper
- [ ] **0.6** Tests for model, patch, public API, accent fallback

---

## Phase 1 — Tier 1: Launch branding (Standard)

- [ ] **1.1** Org accent colour picker on `/dashboard/org/settings`
- [ ] **1.2** `--club-accent` CSS variables on student shell when club lens active
- [ ] **1.3** Themed student chrome (switcher, sidebar active, primary CTAs)
- [ ] **1.4** Branded join page (accent gradient, org name, cohort card)
- [ ] **1.5** Join preview “splash” card before confirm (no animation)
- [ ] **1.6** Student home club strip (org name + class)
- [ ] **1.7** Superadmin: optional default accent on org create
- [ ] **1.8** QA — two orgs, different accents, same student switches clubs

---

## Phase 2 — Tier 2: Owner branding + pride scope (Branded)

- [ ] **2.1** Logo upload (Cloudinary) → `settings.logoUrl`
- [ ] **2.2** Banner upload → `settings.bannerUrl`
- [ ] **2.3** Welcome message → `settings.welcomeMessage`
- [ ] **2.4** Org settings **Branding** section with live preview
- [ ] **2.5** Student home branded header (logo + welcome + banner)
- [ ] **2.6** Org setting `prideScope: cohort | org` (default **org**)
- [ ] **2.7** Wire `clubScope.js` to respect `prideScope` (not auto-only)
- [ ] **2.8** Pride UI copy — “Your club” vs “Your class” by scope
- [ ] **2.9** People search uses same scope rules
- [ ] **2.10** Gate Tier 2 fields by `brandingTier >= branded`
- [ ] **2.11** Tests — org setting overrides automatic cohort scope

---

## Phase 3 — Membership ops (club package)

- [ ] **3.1** Owner: remove student from org (free seat, deactivate cohort membership)
- [ ] **3.2** Owner: add / move student to cohort → auto-enroll cohort programs
- [ ] **3.3** Enforce one cohort per org per student (block or require owner move)
- [ ] **3.4** People page warning: org member without cohort (“no programs assigned”)
- [ ] **3.5** Student self-serve leave (`POST /orgs/:id/leave`) — post-launch OK
- [ ] **3.6** Update `org-cohort-model.md` + launch checklist

---

## Phase 4 — Tier 3: White-label (Premium)

- [ ] **4.1** Production wildcard DNS `*.after-school.tech`
- [ ] **4.2** Per-org favicon on vanity host
- [ ] **4.3** Custom join layout (`standard` \| `hero`)
- [ ] **4.4** First-visit club welcome modal (skippable, once per org)
- [ ] **4.5** Optional splash animation (respect `prefers-reduced-motion`)
- [ ] **4.6** Branded email templates (invite, join reminder)
- [ ] **4.7** Vanity host preselects club on student dashboard
- [ ] **4.8** Superadmin: white-label tier + vanity toggle
- [ ] **4.9** Gate Tier 3 features by `brandingTier === white_label`

---

## Phase 5 — Packaging for sale

- [ ] **5.1** Internal pricing / feature matrix doc
- [ ] **5.2** Superadmin: show and set `brandingTier` on org panel
- [ ] **5.3** Org owner “Upgrade” placeholders for locked features
- [ ] **5.4** Stripe products → `billing.plan` + `brandingTier` (when ready)
- [ ] **5.5** Extend launch QA for branding + pride scope

---

## Phase 6 — Launch QA

- [ ] **6.1** Two orgs — different accents/logos; student switch changes UI
- [ ] **6.2** Small org — org-wide pride feels competitive
- [ ] **6.3** Large org — cohort pride when owner selects it
- [ ] **6.4** Vanity join shows full branded experience
- [ ] **6.5** White-label favicon + one-time splash
- [ ] **6.6** Owner remove student + cohort assign enrolls programs
- [ ] **6.7** All BE + FE tests green

---

## Sprint order

| Sprint | Phases | Outcome |
|--------|--------|---------|
| **A** | 0 + 1 | Sellable Standard look |
| **B** | 2 + 3 (3.1–3.4) | Branded + pride scope + ops |
| **C** | 4 + 5 + 6 | White-label + sales gates + QA |

---

## What we should NOT build

- Random theme per student
- Full separate theme per org without owner config
- One deploy / fork per club
