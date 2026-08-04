# Unified Dynamic Action Bar

## Goal
Replace the current dual-button layout (component buttons + viewer nav button) with a single consolidated **Action Bar** at the bottom of the viewer. The bar morphs dynamically to show the correct buttons based on the active component's state, mode, and type.

---

## Component Button Audit

| Component | Buttons Present | Conditions |
|---|---|---|
| **quiz** | `Check Answer` | Practice, no answer selected or unconfirmed |
| | `Next Question` | After answer confirmed, not last question |
| | `Finish Quiz` | Live mode, last question |
| | `Quiz Completed` (disabled) | After last question answered |
| | [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) | Practice only, after completed |
| **multiSelectQuiz** | [Check](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/drag-drop-renderer.tsx#144-176) | After selecting options |
| | `Next Question →` | After checked, not last question |
| **flashcardQuiz** | `Next Question →` | After answering, not last question |
| **fillInTheBlank** | `Check Answers` | Before submit |
| | [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) (disabled) | After submit |
| | [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) | Practice only, score not perfect |
| **matchingPairs** | `Check Matches` | Only when all pairs matched |
| | [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) (disabled) | After checked |
| | [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) | Practice only |
| **dragDrop** | `Check Order` | Always (before submit) |
| | [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) (disabled) | After submit |
| | [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) | Practice only, if not correct |
| **flashcards** | `← Prev` / `Flip` / `Next →` (icon buttons) | Always - navigation controls |
| **hotspot** | `Start Over` | Always visible |
| | Points display | Always visible |
| **Content components** | *(none — just the nav button)* | — |

### Two special modes to note
- **Live mode**: Hides [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) everywhere; some components auto-advance
- **Completed state**: Most components show a disabled [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) pill instead of action buttons

---

## Current Architecture Problem

Right now there are **two separate button zones**:
1. **Inside the component renderer** — component-specific action buttons
2. **In the viewer footer** — Next / Next Slide / End Lesson button

These are rendered independently and cause visual stacking/doubling.

---

## Proposed Solution

### Phase 1 — Define a `ComponentAction` context/callback contract

Each renderer will communicate its needed action buttons UP to the viewer via a callback prop:
```typescript
onActionsChange?(actions: ActionButton[]): void
```

Where `ActionButton` is:
```typescript
type ActionButton = {
  label: string
  icon?: ReactNode
  variant: 'primary' | 'secondary' | 'disabled' | 'danger'
  onClick: () => void
  disabled?: boolean
  hidden?: boolean
}
```

### Phase 2 — Remove bottom button sections from all renderers

Strip out the `<div className="shrink-0 space-y-4 pb-6">` (bottom section with buttons) from each of the 8 interactive renderers. Component logic (handleCheck, handleRetry, etc.) stays in the renderer — only the button JSX is removed.

### Phase 3 — Update the viewer's `ActionBar`

The viewer footer becomes a single `ActionBar` that:
1. Renders whatever `actions[]` the active component fires via `onActionsChange`
2. Falls back to the Nav button (`Next / Next Slide / End Lesson`) when no component actions are set
3. Merges the nav button into the component actions when the component is complete (e.g. Completed pill + Next Slide)

### Flashcards edge case
`flashcards` has unique icon navigation buttons (← Flip →). These are kept inside the component as they are spatial controls, not action controls. The viewer just shows the Next Slide / End Lesson beside them.

---

## Files to Change

### Viewer
#### [MODIFY] LessonViewerUpload.tsx
- Add `componentActions` state: `ActionButton[]`
- Replace the viewer footer with `<ActionBar actions={...} navButton={...} />`
- Pass `onActionsChange` into `<ComponentRenderer />`

#### [MODIFY] LessonViewer.tsx
- Same as above (parallel viewer implementation)

#### [NEW] components/viewer/ActionBar.tsx
- Renders `actions[]` array dynamically
- Merges nav button when component complete

### Component Renderer Shell
#### [MODIFY] components/component-renderer.tsx
- Accept and pass through `onActionsChange` to each renderer

### Interactive Renderers (all 8 — strip bottom button JSX only)
- [quiz-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/quiz-renderer.tsx)
- [multi-select-quiz-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/multi-select-quiz-renderer.tsx)
- [flashcard-quiz-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/flashcard-quiz-renderer.tsx)
- [fill-in-the-blank-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/fill-in-the-blank-renderer.tsx)
- [matching-pairs-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/matching-pairs-renderer.tsx)
- [drag-drop-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/drag-drop-renderer.tsx)
- [hotspot-renderer.tsx](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx)
- *(flashcards — keep icon nav, remove nothing)*

Each renderer calls `onActionsChange(actions)` in a `useEffect` whenever its state changes.

---

## Verification Plan

### Manual Testing
1. Open a lesson in the **viewer** (`/viewer/[id]`)
2. Navigate to a **Quiz** slide → confirm you see `Check Answer` in the action bar, not inside the component body
3. Select an answer → button becomes active → click it → confirm `Next Question` appears → on last question, `Quiz Completed` + `Next Slide` appear together
4. Navigate to **Fill in the Blank** → confirm `Check Answers` at bottom, no separate button inside component
5. Navigate to **Matching Pairs** → match all → `Check Matches` appears → checked → [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) + `Next Slide` side by side
6. Navigate to **Drag & Drop** → `Check Order` visible → submit → [Completed](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/lib/api-client.ts#189-190) + `Next Slide`
7. Navigate to a **content** slide (paragraph, image) → only `Next Slide` or `End Lesson` shows
8. Navigate to the last slide → `End Lesson` appears in the bar
9. Test in **Live mode** → [Retry](file:///c:/Users/chatz/Downloads/AST/ast4-lesson-builder/components/renderers/hotspot-renderer.tsx#125-134) never shows, timer shows in component
10. Test in **PWA** — End Lesson routes back to module list correctly
