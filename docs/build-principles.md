# Build principles

How we ship this platform. Companion to [`platform-engagement-strategy.md`](./platform-engagement-strategy.md) (what scores mean) and [`monetization-strategy.md`](./monetization-strategy.md) (who pays). Use this when a new economy knob, component type, or “quick gamification win” looks tempting.

**Last updated:** August 2026

---

## The product

The lesson is the product. Stars, the store, hunt, cosmetics, and pride boards are the skin.

Kids will not notice 10★ store vs 15★ panic, or 5★ per scoring unit. They will notice that they cannot type on a phone. If the hands slip, the economy is noise.

---

## Keep these product rules

These are coherent. Do not reopen them in chat.

- Practice earns **points**, not stars.
- Kids never pay to look smarter on pride boards. Cash can make you look cool, never buy a crown.
- Retry **replaces earned** contribution. It never subtracts the component max after a partial score.
- Store pack is cheaper than panic buy at the live block (10★ store vs 15★ on-demand).
- Tutor-mark pending is **not** scored-complete, but the student must still be able to navigate after submitting.
- Next lesson unlocks at **50%** of the previous, or for **20★**. Stars skip the gate; they do not skip learning.

---

## Stop doing these

### 1. Adding economy rules on an unfinished interaction layer

Do not add the ninth star knob before the first activity feels native on a phone.

Freeze new gamification (new SKUs, new unlock maths, new toast types) until a short list of live activities type, tap, submit, retry, and restore focus correctly on mobile.

### 2. Designing the economy in chat, then duplicating it in two repos

Prices and unlock thresholds must not live as parallel constants in `lib/store-skus.ts` and `helpers/starMarket.js`. They will drift. One of them will be wrong, and a student wallet will be the bug report.

**Rule:** the backend owns the price list and unlock policy. The frontend displays what the server returns. If a number must appear in both places during a transition, add a test that they match.

### 3. Letting the browser decide how many stars you earned

Live awards must not compute an amount in the renderer and POST `awardStars(amount, …)`. Anyone can call that.

**Rule:** the client submits answers. The backend returns score, stars, and lock state. The wallet is the only source of star balance.

### 4. Growing the component zoo

There are ~40 renderers. Each one invents submit, reset, focus, and pending-tutor-mark behaviour. That is why “general problems” (keyboard focus, footer visibility, retry accounting) keep coming back one file at a time.

**Rule:** freeze new component types. Put shared input, focus, and scored-submit behaviour in the wrapper (`ScoredRenderer` / `InteractiveRenderer`), not in crossword vs flashcard vs fill-in-the-blank. New types need a product reason, not a catalog reason.

### 5. Testing source text instead of behaviour

A test that `expect(source).toContain('handleCaptureChange')` would have passed while the crossword keyboard stayed on the old cell.

**Rule:** anything a child types or taps needs an interaction test (or a real device pass). String-grep tests are a registry/contract check, not a UX check.

### 6. Treating accessibility as polish

Almost no `aria-label`s, no live regions, pinch-zoom disabled, phone keyboards as an afterthought. For a children’s product that is liability, and it is also why input bugs ship.

**Rule:** scored inputs must work with a software keyboard on first tap. Focus stays with the caret, not with a highlight that lies. Mute, reduced motion, and readable type size are not optional extras.

---

## What to do instead (near-term freeze)

Until the list below is true, do not add store aisles, new star formulae, or new renderer types.

1. **One wallet** — React Query / gamification context reads the server balance; pages do not keep a private `useState(0)`.
2. **One price list** — server-owned; frontend copy comes from the API.
3. **Five activities excellent on a phone** — pick the live types clubs actually use (quiz, FITB, matching, flashcard quiz, crossword). Type, tap, submit, retry, pending-mark, restore. Then copy the shared behaviour into the wrappers.
4. **Server-scored live work** — answers in, score/stars/locks out. Client-side `awardStars(amount)` goes away for live completions.

After that, the store means something.

---

## Decision test

Before merging a gamification or renderer change, answer:

1. Does a child on a phone complete this without tapping twice?
2. Does the server, not the browser, decide the star delta?
3. Did we add a new constant that already exists in the other repo?
4. Did we add a new component type instead of fixing a wrapper?
5. Is the test exercising the tap/type path, or only the file text?

If (1) or (2) is no, it is not done.
