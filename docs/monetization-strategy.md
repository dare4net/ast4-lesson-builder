# Monetization strategy

Stars, the store, pride, certificates, and programs are **engagement loops**, not a business yet. Stars are earned in-app, so selling more star sinks does not pay rent until someone puts **real money** in.

Who can pay: **schools / clubs**, **parents**, **tutors who sell**, and later **brands**. Don’t make kids pay to learn.

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

---

## 4. Turn stars into a real wallet (carefully)

Today: play → stars → cosmetics / hints / prints. Fun, zero revenue.

Add a **parent top-up** only:

| Sell for money | Do not sell for money |
|---|---|
| Cosmetics, nameplates, frames, extra certificate prints | Live powerups that change scores / pride |
| Streak freeze (nice-to-have) | Reset that erases a fair live attempt for cash |
| Extra share-card themes | Anything that buys a gold crown |

Rule: **cash can make you look cool, never smarter on the board.** If pride is for sale, clubs will leave.

---

## 5. Certificates as a product

The share card is closer to merch than to a PDF.

- Digital print: already 5★ — later map ★ packs to **parent checkout**.
- **Physical**: pack of 10 cards posted after a module (high margin, very “after-school”).
- **Club wall pack**: end-of-term print run the centre orders.

One SKU: “Term showcase pack.” Print; they hang it.

---

## 6. Live events and seasons (time-boxed money)

Live mode, wheels, polls, and pride already exist.

- **Season pass** for a 4-week challenge (club buys for the cohort).
- **Saturday live** — one tutor, 200 kids, ticketed by the centre.
- **Exam sprint** weeks (paid module, not a new app).

Scarcity sells. A forever library does not.

---

## 7. Brand / exam-board money (later)

Once there are *named clubs and completion data* (not selling kids’ data):

- Sponsored **optional** worlds (e.g. a bank’s “first budget” module) — labelled, skippable.
- Licensed content (coding / robotics brands) as paid program packs.
- Never: ads in the lesson. Clubs will leave.

---

## What to sell first (order)

1. **Club subscription** — one price, N learners, tutor studio included.
2. **Certificate / term pack** — proof for parents, almost no new product.
3. **Parent top-up for cosmetics only.**
4. **Marketplace cut** once 10+ tutors actually publish.

Until (1) is signed, don’t build Stripe for star packs. This is a **who-is-the-customer** problem first, not a payments problem.

---

## What will not make money

- More components (they make the *club* more willing to pay; they are not a SKU).
- A bigger star store with no cash in.
- Student-facing ads.
- Selling gold crowns.

First product build when this leaves the doc: **club billing + seats**, not another store aisle.
