# 🚀 Storyboard Mission Engine Architecture & Implementation Roadmap

## 🎯 Executive Summary
This document outlines the architectural roadmap for transforming the platform into a **Story-Based Interactive Mission Engine**. 

Instead of heavy video/animation software overhead, the platform utilizes a lightweight, highly flexible web-native engine that empowers tutors to author mission-driven, immersive storyboard lessons directly in the Studio.

---

## 📊 Codebase Gap Analysis & 5-Pillar Capability Matrix

| Pillar | Current Platform Capability | Target Mission Engine Capability | Gap / Action Required |
| :--- | :--- | :--- | :--- |
| **1. Dynamic Styling & Atmosphere** | Static slide layouts & standard dark cards (`duo-card`). | Slide-level background themes (`backgroundImage`, `gradientPreset`, `ambientOverlay`) & component accent color overrides. | Add `styling` & `theme` interfaces to `Slide` and `Component` types; update viewer containers. |
| **2. Universal Rich Text & HTML** | Plain string rendering in Paragraph, Callout, and Quiz prompts. | Full HTML & Markdown formatting support (color highlights, inline badges, bold emphasis). | Implement sanitized HTML/Markdown rendering in `paragraph-renderer`, `callout-renderer`, and interactive labels. |
| **3. Tutor-Configurable Logic Engine** | Linear component rendering on slides without conditional gates. | Condition-based component rendering (`showIf`, `dependsOn`, `variables` e.g., `role === 'Professor'`). | Add `conditions` interface to `Component`; implement condition evaluator in `ComponentRenderer`. |
| **4. Zero-Friction Flow Control** | Manual button clicks required to navigate slides & components. | Optional `autoAdvanceOnComplete` and auto-reveal transitions upon interaction completion. | Add `autoAdvance` prop to components & register trigger handler in `LessonViewer`. |
| **5. Animations & SFX System** | Basic TTS audio & simple success/error sound triggers. | Expanded SFX suite (`unlock`, `transition`, `missionComplete`, `warning`) & smooth component entrance animations. | Upgrade `component-audio.ts` sound library; add framer-motion/CSS entrance animations. |

---

## 🛠️ Detailed Architectural Technical Plan

### 1. Dynamic Styling & Atmosphere System
#### Data Model Extensions (`types/lesson.ts`):
```ts
export interface SlideTheme {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: 'dark-blur' | 'emergency-pulse' | 'lab-cyber' | 'none';
  accentColor?: string;
}

export interface ComponentStyling {
  accentColor?: string;
  cardStyle?: 'glass' | 'flat' | 'bordered' | 'neon';
  customClass?: string;
}
```
* **Viewer Integration:** `LessonViewer` reads `slide.theme` to render background overlays dynamically behind the slide canvas.

---

### 2. Universal Rich Text & HTML Support
* **Formatted Narrative:** Update `ParagraphRenderer`, `CalloutRenderer`, and `HeadingRenderer` to process rich text/HTML formatted strings safely.
* **Inline Story Badges:** Tutors can format text like:
  ```html
  <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">URGENT</span>
  ```

---

### 3. Tutor-Configurable Logic Engine (Variables & Conditional Rendering)
#### Data Model Extensions (`types/lesson.ts`):
```ts
export interface ComponentCondition {
  targetComponentId?: string; // e.g. "q-1"
  conditionType: 'isCompleted' | 'isCorrect' | 'hasValue' | 'variableEquals';
  variableName?: string;       // e.g. "chosenRole"
  expectedValue?: any;         // e.g. "Professor"
}
```
* **Condition Evaluator (`lib/condition-evaluator.ts`):** Evaluates if a component should render on the slide based on current slide state and global lesson variables.

---

### 4. Zero-Friction Flow (Auto-Advancement)
* **Auto-Next Behavior:** When an interactive component (e.g. `quiz`, `poll`, `videoClip`) reaches `status: "completed"`, if `autoAdvance: true` is set, `LessonViewer` smoothly transitions to the next component or slide after a customizable delay (e.g., 800ms).

---

### 5. Unified Animation & SFX Overhaul
* **Expanded SFX Events (`lib/component-audio.ts`):**
  - `unlock`: Mission milestone or gated component unlocked.
  - `warning`: Alarm or high-urgency callout reveal.
  - `transition`: Slide transition wipe sound.
  - `missionComplete`: Final lesson capstone completion.
* **Entrance Animations:** Wrap components in CSS transition classes (`animate-in fade-in slide-in-from-bottom-4 duration-500`).

---

## 🗓️ Implementation Phases

1. **Phase 1: Rich Text & Styling Engine** (Pillars 1 & 2)
2. **Phase 2: Logic Engine & Condition Evaluator** (Pillar 3)
3. **Phase 3: Zero-Friction Flow & Auto-Advance** (Pillar 4)
4. **Phase 4: Animation & SFX Overhaul** (Pillar 5)
5. **Phase 5: Studio Authoring UI Enhancements** (Tutor Inspector controls for logic & styles)
