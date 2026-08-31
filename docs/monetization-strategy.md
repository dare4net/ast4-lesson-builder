# Monetization strategy

Stars, the store, pride, certificates, and programs are **engagement loops**, not a business yet. Stars are earned in-app, so selling more star sinks does not pay rent until someone puts **real money** in.

Who can pay: **schools / clubs**, **parents**, **tutors who sell**, **tutors who generate**, and later **brands**. Don’t make kids pay to learn.

Related: [`platform-engagement-strategy.md`](./platform-engagement-strategy.md) (why scores must mean something) and [`component-library-100.md`](./component-library-100.md) (what makes clubs more willing to pay — not a SKU).

---

## 1. Charge the organisation (this should be most of the money)

After-school clubs, academies, and schools buy seats. The product already has programs, tutors, lessons, live mode, marking, and pride.

- **Per-learner / month** for a club (simplest to sell): e.g. 20–80 kids, one tutor login, parent view later.
- **Per-site** for a centre with many groups.
- **Yearly** if a school wants it on the timetable.

What they are buying: “our kids show up, finish lessons, and we can see who is stuck.” Not the flame animation.

This is the **default** business. Duolingo is B2C; this product looks more like a **club OS**.

---

## 2. Parent pass (B2C, sit on top of the club)

Parents do not want a star shop. They want:

- **Progress they can screenshot** (certificates already exist).
- **“My child is in this club”** access if the club doesn’t pay.
- **Print / share cards** as a paid extra (physical pack or unlimited downloads).

A **family pass** (one parent, 1–3 kids) is a second product. Keep club content included; sell *access + proof*, not pay-to-win live powerups.

---

## 3. Tutor marketplace (the platform becomes the store)

The lesson builder is the rails. The money is **other people selling programs on those rails**.

- Tutors publish a program.
- The platform takes **15–30%** of enrolments (Udemy-style).
- A club that already pays gets a better cut or free listing.

The company stays the platform; tutors bring students. That scales without writing every lesson in-house.

The Studio Copilot below is what makes the marketplace actually fill: without it, only power-users publish.

---

## 4. Studio Copilot (sell the authoring, not another quiz type)

This is a **tutor-paid** product. Kids never see it. Clubs will pay because lesson writing is the expensive part of running the platform, not the flame on the home screen.

Authoring skills already exist as Cursor workflows (`primary-lesson-generator`, `curriculum-lesson-generator`). The money is **putting that companion inside the studio**, with a meter.

### What the tutor gets

1. **Describe the outcome** — year group, topic, length, live vs practice, “they should be able to ___.”
2. **Copilot builds the lesson** — real studio JSON: slides, the right component types, points, modes. Not a wall of MCQs. Route primary prompts through the primary skill and KS3+ through the curriculum skill; never mix.
3. **Edit with text, three scopes:**
   - **Component** — “make this hotspot about rivers, three clickable regions, Year 5.”
   - **Slide** — “this slide is too wordy; one short callout then a categorise.”
   - **Lesson** — “shorter, funnier, swap the finale for a hangman on the key terms.”
4. Tutor still owns the canvas: drag, delete, tweak props by hand. Copilot is a faster author, not an auto-publish button.

That loop is the product. One-shot “generate and dump” is a demo. **Revise-in-place** is why they keep paying.

### Why it sells

- A club already paying for seats still cannot fill a term if every lesson takes two hours in the studio.
- Independent tutors (marketplace) will buy Copilot even before they buy a club seat.
- Token cost is real **COGS**. Unlimited Copilot inside the cheap seat is how you lose money on every lesson.

### How to charge

| Buyer | What they buy |
|---|---|
| Club on a seat plan | A **monthly Copilot quota** (e.g. 20 builds + 100 text-edits). Extra packs of credits. |
| Independent tutor | **Copilot-only** subscription, or pay-per-build, no student seats required. |
| Heavy academy | Site licence: higher quota, shared across tutors, still metered. |

Meter **builds** and **scoped edits** separately. A lesson-wide rewrite costs more than “fix this quiz stem.” Show remaining credits in the studio chrome so it feels like a tool, not a surprise bill.

Do **not** fold unlimited generation into the base per-learner price. Seats are margin. Copilot is usage.

### What the Copilot must not do

- Publish without the tutor looking.
- Invent a new component type. Only the studio catalog ([`component-library-100.md`](./component-library-100.md)).
- Ignore age: Year 4 prompt must not run the KS3 generator.
- Spend the club’s quota on regenerating the same slide in a loop with no “accept / reject.”
- Touch student-facing AI (hints, live chat). That is a different, later SKU, and it must not buy answers in live mode.

### Where it sits vs other money

Copilot feeds **§3 marketplace** (more programs listed) and makes **§1 club seats** stickier (tutors actually use the studio). It does not replace seats. A centre with 60 kids and no Copilot still owes for 60 seats.

---

## 5. Turn stars into a real wallet (carefully)

Today: play → stars → cosmetics / hints / prints. Fun, zero revenue.

Add a **parent top-up** only:

| Sell for money | Do not sell for money |
|---|---|
| Cosmetics, nameplates, frames, extra certificate prints | Live powerups that change scores / pride |
| Streak freeze (nice-to-have) | Reset that erases a fair live attempt for cash |
| Extra share-card themes | Anything that buys a gold crown |

Rule: **cash can make you look cool, never smarter on the board.** If pride is for sale, clubs will leave.

---

## 6. Certificates as a product

The share card is closer to merch than to a PDF.

- Digital print: already 5★ — later map ★ packs to **parent checkout**.
- **Physical**: pack of 10 cards posted after a module (high margin, very “after-school”).
- **Club wall pack**: end-of-term print run the centre orders.

One SKU: “Term showcase pack.” Print; they hang it.

---

## 7. Live events and seasons (time-boxed money)

Live mode, wheels, polls, and pride already exist.

- **Season pass** for a 4-week challenge (club buys for the cohort).
- **Saturday live** — one tutor, 200 kids, ticketed by the centre.
- **Exam sprint** weeks (paid module, not a new app).

Scarcity sells. A forever library does not.

---

## 8. Brand / exam-board money (later)

Once there are *named clubs and completion data* (not selling kids’ data):

- Sponsored **optional** worlds (e.g. a bank’s “first budget” module) — labelled, skippable.
- Licensed content (coding / robotics brands) as paid program packs.
- Never: ads in the lesson. Clubs will leave.

---

## What to sell first (order)

1. **Club subscription** — one price, N learners, tutor studio included. Copilot is *not* unlimited in this price.
2. **Studio Copilot credits** — bundled quota on the club plan, extra packs, or a tutor-only plan. This is the high-margin add-on and it has real token cost.
3. **Certificate / term pack** — proof for parents, almost no new product.
4. **Parent top-up for cosmetics only.**
5. **Marketplace cut** once 10+ tutors actually publish (Copilot is what gets them publishing).

Until (1) is signed, don’t build Stripe for star packs. Copilot billing can ship in the same invoice as seats (quota + overage), not as a second company.

---

## What will not make money

- More components (they make the *club* more willing to pay; they are not a SKU).
- A bigger star store with no cash in.
- Student-facing ads.
- Selling gold crowns.
- Unlimited free lesson generation (you pay OpenAI; they do not).

First product build when this leaves the doc: **club billing + seats**, then **metered Copilot**. Not another store aisle.
