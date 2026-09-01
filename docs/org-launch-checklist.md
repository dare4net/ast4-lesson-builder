# Org launch checklist

**Goal:** Ship a club end-to-end before **Studio Copilot** and before superadmin Phase B (users/programs).  
**Companion:** [`org-cohort-model.md`](./org-cohort-model.md) (architecture), [`club-branding-plan.md`](./club-branding-plan.md) (branding + pride tiers), [`superadmin-console.md`](./superadmin-console.md) (ops console — later), [`monetization-strategy.md`](./monetization-strategy.md) §1 + §4 (seats then Copilot)

---

## Build order reminder

| Step | Topic | Status |
|------|--------|--------|
| 1 | Orgs + memberships + invites | ✅ |
| 2 | Cohorts + join codes | ✅ |
| 3 | `programs.org_id` + studio org scope | ✅ |
| 4 | Student home scoped to active club | ✅ |
| 5 | Visibility + marketplace filter | ✅ |
| 6 | `public_access` opt-in | ✅ |
| 7 | Club / personal context switcher | ✅ |
| 8 | Vanity subdomain | ✅ (dev + CORS; prod DNS pending) |
| 9 | Stripe seats + Copilot quota | ⏳ **after this checklist** |

Steps 1–8 are **code-complete**. What remains is **QA, ops polish, and first-pilot readiness** — not new architecture.

---

## Manual QA (must pass before first paying club)

Run once on staging/local with a fresh org.

1. **Superadmin** — Create org + owner email → copy invite link  
2. **Owner invite** — `/org/invite/:token` → password + first cohort name → lands on `/dashboard/org`  
3. **Studio** — Owner/tutor creates program with **club selected** (not Personal)  
4. **Org dashboard** — Program appears under Programs; assign to cohort via checkboxes  
5. **Student join** — `/join/CODE` (or vanity host) → enrolls in cohort programs → `/dashboard/student`  
6. **Club lens** — Student sees club programs only; Explore hidden unless opted in  
7. **Public policy** — Owner disables “Allow public Explore opt-in” → student cannot enable Explore; join revokes existing opt-in  
8. **Vanity** (optional pilot) — Enable in superadmin → `https://<slug>.localhost:3000/join/CODE` works (log in on vanity host)  
9. **Multi-club** — Same student joins second org → club switcher shows both  
10. **Hybrid** — Student with personal + club programs → can switch to Personal lens  

**Fail any step → fix before Copilot.**

---

## Launch blockers (code/ops)

### A. Superadmin org ops *(Phase A in superadmin doc)*

- [x] Search/filter org list by name, slug, status  
- [x] Edit seat cap from superadmin  
- [x] Suspend / reactivate org (`status: suspended`)  
- [x] Overview: active clubs, seats in use, suspended count  
- [x] Operator-friendly API error messages (seat cap, suspended, role conflicts)  
- [ ] Manual QA of invite/seat cap error paths  

### B. Production infra

- [ ] Wildcard DNS `*.after-school.tech` → app host (vanity)  
- [ ] CORS allows production vanity origins (dev `*.localhost` done)  
- [ ] Owner invite emails deliver (if not manual link copy only)  

### C. Data hygiene (one-time)

- [ ] Decide legacy published programs: backfill `visibility: "marketplace"` vs `"unlisted"`  
- [ ] Document which tutors get a default org (optional — not required for launch)  

### D. Billing *(can be manual for pilot #1)*

- [ ] Invoice first club manually; set `seatCap` in superadmin  
- [ ] Stripe customer + checkout — **before scale**, not before first friend club  

---

## Explicitly deferred (post-launch / with Copilot)

| Item | When |
|------|------|
| Stripe self-serve seat upgrades | After first manual club |
| Copilot quota on `org_id` | **Next product build** after checklist green |
| Superadmin Users / Programs | After org launch ([`superadmin-console.md`](./superadmin-console.md) Phase B) |
| Moderation queue | When marketplace has volume |
| Leave club / cohort | **Not built** — owner removes member from org dashboard, or superadmin; student self-serve leave planned post-launch |
| Parent portal | Later |

---

## Copilot — what comes next

From [`monetization-strategy.md`](./monetization-strategy.md) §4:

1. **In-studio Copilot** — describe outcome → generate lesson JSON → edit in place (component / slide / lesson scope)  
2. **Meter on `org_id`** — monthly quota per club; tutor-only plan for indies  
3. **Do not** bundle unlimited Copilot in base seat price  

**Prerequisite:** Orgs and studio `org_id` tagging must work reliably (steps 1–3 above) so usage bills to the right customer.

Suggested Copilot build order (future doc):

1. Studio UI entry + prompt → existing lesson generator skills  
2. Usage counter collection (`copilot_usage` keyed by `org_id` / `user_id`)  
3. Quota check middleware on generate endpoints  
4. Superadmin / org owner usage readout (Phase D superadmin)  
5. Stripe metered billing or credit packs  

---

## Definition of done

**Org is “finished” when:**

- All 10 QA steps pass  
- Superadmin can create, suspend, and resize a club without DB access  
- One real (or pilot) club has run a cohort through join → lessons → pride  
- Team agrees to start **Copilot** as the next build  

---

## Quick links

| Surface | URL |
|---------|-----|
| Superadmin | `/superadmin` |
| Org owner | `/dashboard/org` |
| Student join | `/join/:code` |
| Studio | `/studio` (club scope in switcher) |
