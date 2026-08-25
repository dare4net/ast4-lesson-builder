# 🎬 Motion Design System Specification

## 1. 🎯 Motion Philosophy & Easing Design System

High-end digital experiences (like Apple iOS, Duolingo, Stripe, and Linear) do not use basic linear `fade-in` wrappers. They use **Physics-Based Easing**, **Staggered Hierarchy**, and **Purposeful Visual Choreography**.

### Easing Tokens
* **Apple Deceleration Curve (Primary Ease-Out):** `cubic-bezier(0.16, 1, 0.3, 1)`
  * *Feels responsive, fast to start, and smooth to settle.*
* **Spring Snap (Interactive & Buttons):** `cubic-bezier(0.34, 1.56, 0.64, 1)`
  * *Gives interactive elements a tactile, organic bounce upon completion or selection.*
* **Exit Deceleration (Fast Ease-In):** `cubic-bezier(0.7, 0, 0.84, 0)`
  * *Quickly clears outgoing elements in 150ms–180ms without lingering.*

### Timing Scale
| Token | Duration | Purpose |
| :--- | :--- | :--- |
| `duration-fast` | `150ms` | Micro-interactions: option selection, button press states, hover rings. |
| `duration-standard` | `320ms` | Component entrance reveals, card pop-ins, content cascade steps. |
| `duration-dramatic` | `450ms` | Navigation Bar spring reveal, modal overlays, slide scene transitions. |

---

## 2. 🗺️ Element Motion Hierarchy (What Animates vs. What Is Static)

To prevent visual fatigue and layout instability, **not everything is animated equally**.

```
[ Top Header & Progress Bar ] ➔ ALWAYS STATIC (Anchored UI Frame)
       │
[ Story Canvas Area ] ➔ STAGGERED ENTRANCE CASCADE (320ms)
   ├── Headings (Slide-down -8px + Opacity)
   ├── Visual Media (Scale 0.97 ➔ 1.0 + Opacity)
   ├── Text / Callouts (Slide-left -12px + Opacity)
   └── Interactive Component (Scale-Pop 0.96 ➔ 1.0)
       │
[ Bottom Navigation Bar ] ➔ DYNAMIC REVEAL & SPRING SLIDE (450ms)
   ├── Uncompleted Interactive Task ➔ TranslateY(100%) + Opacity 0 (Hidden to maximize height)
   └── Task Completed / Passive ➔ TranslateY(0) + Spring Bounce (Revealed with audio chime)
```

### 🛑 STATIC ELEMENTS (Do NOT Animate)
* **Top Header & Progress Bar:** Remains sticky and locked at the top of the viewport across slide transitions. Anchors the student's sense of place.
* **Canvas Shell Container:** Background canvas bounds remain stable to avoid viewport jumping.

### 🎬 ANIMATED ELEMENTS & CHOREOGRAPHY

#### A. Dynamic Navigation Bar (Footer)
* **Active Uncompleted Task State:**
  - `transform: translateY(100%)`, `opacity: 0`, `pointer-events: none`.
  - Frees up 100% vertical viewport space for interactive component interaction.
* **Completion Reveal Trigger:**
  - `transform: translateY(0)`, `opacity: 1`, `pointer-events: auto`.
  - Timing: `450ms` with `Spring Snap` curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - Accompanied by subtle glowing green border flash + completion audio chime.

#### B. Content Entrance Stagger Cascade
When a new slide or component mounts, elements reveal in a **60ms Staggered Sequence**:
1. **Slide Title / Heading (Delay 0ms):** Translates `-8px` down with opacity ramp.
2. **Media / Images (Delay 60ms):** Scales from `0.97` to `1.0` with opacity ramp.
3. **Paragraphs / Callouts (Delay 120ms):** Translates `-12px` from left with opacity ramp.
4. **Interactive Component Card (Delay 180ms):** Pops in with `scale(0.96) ➔ scale(1.0)` and shadow elevation.

#### C. Interactive Haptic Visual Physics
* **Option Tap / Press State:** Instantly scales down to `scale(0.97)` on `mousedown`/`touchstart`, then expands to `scale(1.02)` on active selection.
* **Incorrect Feedback State:** Micro-shake keyframe animation (`translateX: -4px ➔ 4px ➔ -2px ➔ 2px ➔ 0px` over `200ms`) with subtle red border pulse.
* **Correct Feedback State:** Scale pulse (`scale(1.04) ➔ scale(1.0)`) with emerald glowing ring expansion.

#### D. Exit Choreography (Slide & Scene Switching)
* Before new slide content mounts, outgoing elements exit together:
  - `transform: translateY(12px)`, `opacity: 0` over `180ms` (`Exit Deceleration`).
  - Prevents harsh DOM swapping or overlapping text flickering.

---

## 3. 🗓️ Implementation Blueprint

1. **CSS Motion Utility Classes (`styles/motion.css`):**
   Define Apple deceleration and spring curves as custom CSS properties & keyframes.
2. **Dynamic Navigation Reveal (`LessonContent.tsx`):**
   Connect `isCurrentComponentCompleted` state to the footer transform wrapper.
3. **Component Stagger Wrapper (`ComponentRenderer.tsx`):**
   Apply staggered entry delays based on element sequence position.
