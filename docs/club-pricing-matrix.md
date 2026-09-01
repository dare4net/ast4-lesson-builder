# Club pricing & feature matrix

**Status:** Phase 5 — packaging for sale (internal + owner-facing upgrade placeholders).  
**Companions:** [`club-branding-plan.md`](./club-branding-plan.md), [`monetization-strategy.md`](./monetization-strategy.md) §1, [`org-launch-checklist.md`](./org-launch-checklist.md)

Stripe checkout is **not** live yet. Superadmin sets `billing.plan` manually; the backend syncs `settings.brandingTier`. Owners see locked features with **Request upgrade** (mailto).

---

## Plans (sellable SKUs)

| Plan ID | Display name | `brandingTier` | Indicative seat price (guide) |
|---------|--------------|----------------|-------------------------------|
| `club_standard` | Club Standard | `standard` | £2–4 / learner / month |
| `club_branded` | Club Branded | `branded` | £4–7 / learner / month |
| `club_white_label` | Club White-label | `white_label` | £7–12 / learner / month |

**Not included in seat price:** Studio Copilot credits (metered add-on — see monetization §4).  
**Pilot:** invoice manually; set `seatCap` + `billing.plan` in superadmin.

---

## Feature matrix

| Feature | Standard | Branded | White-label |
|---------|:--------:|:-------:|:-----------:|
| Club accent colour | ✓ | ✓ | ✓ |
| Branded join page (accent + preview) | ✓ | ✓ | ✓ |
| Student club strip / themed nav | ✓ | ✓ | ✓ |
| Vanity subdomain (when DNS + ops enable) | ✓* | ✓* | ✓* |
| Logo upload | | ✓ | ✓ |
| Banner upload | | ✓ | ✓ |
| Welcome message | | ✓ | ✓ |
| Pride scope: whole club vs class | | ✓ | ✓ |
| Hero join layout | | | ✓ |
| Custom favicon (vanity host) | | | ✓ |
| First-visit welcome modal | | | ✓ |
| First-visit splash animation | | | ✓ |
| Branded email templates (render) | | | ✓ |

\*Vanity requires superadmin toggle + wildcard DNS. Standard/Branded clubs can still use `yourapp.com/join/CODE`.

---

## Code mapping

| Layer | Location |
|-------|----------|
| Plan catalog (FE) | `lib/club-plans.ts` |
| Plan catalog + sync (BE) | `helpers/clubPlans.js` |
| Feature gates | `lib/org-branding.ts` / `helpers/orgBranding.js` → `orgCanUse(tier, feature)` |
| Owner upgrade UI | `components/dashboard/org/org-plan-summary.tsx` |
| Superadmin plan picker | `components/superadmin/orgs-panel.tsx` |
| Stripe field on org | `billing.plan`, `billing.externalCustomerId` |

### Stripe (when ready)

1. Create three Products / Prices matching plan IDs above (per-seat recurring).
2. On checkout success webhook → set `billing.plan` + `billing.externalCustomerId`.
3. `expandOrgPatchWithBillingPlan` already maps plan → `brandingTier`.
4. Do **not** bundle unlimited Copilot in seat price.

---

## Upgrade flow (today)

1. Owner opens **Settings** → sees current plan + locked sections.
2. Clicks **Request upgrade** → mailto to ops (`NEXT_PUBLIC_CLUB_UPGRADE_EMAIL`, default `hello@after-school.tech`).
3. Ops sets `billing.plan` in superadmin (or bumps `brandingTier` for comps).
4. Owner refreshes → features unlock per tier gates.

---

## Seat cap vs plan

- **Plan** = branding / white-label package.
- **Seat cap** = how many active student memberships count against billing.
- Both are independent fields on the org document.

---

## Domain note (pilot)

Production is temporarily on `ast.devinna.com`. White-label vanity URLs are `{slug}.ast.devinna.com` when `VANITY_ROOT_DOMAIN=ast.devinna.com` and wildcard DNS is configured.
