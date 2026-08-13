# AST Platform — Program & Module Completion Audit

How **course (program)**, **module**, and **lesson** completion percentages are calculated, stored, and displayed — and why a course can stay at **100%** after you add a new module.

**Date:** August 2026  
**Related:** [`progression-reward-layer-plan.md`](./progression-reward-layer-plan.md), [`platform-gaps-audit.md`](./platform-gaps-audit.md)

---

## 1. Executive summary

**Your instinct is correct.** Program-level completion is largely a **stored snapshot** on the enrollment record, not a live recalculation against the current curriculum. Module-level completion **is** recalculated on each page load from the live lesson list.

| Level | Where shown | Primary data source | Recalculated when curriculum grows? |
|---|---|---|---|
| **Lesson** | Viewer, module cards | Per-lesson interaction + `POST /lessons/{id}/complete` | N/A (binary per lesson) |
| **Module** | Student module page | `GET /lessons/module/{id}/lessons` → count `completed` | ✅ Yes (if API returns new lessons) |
| **Program (course)** | My Courses list, course detail, tutor student cards | Enrollment `progress.percent_complete` | ❌ **No — stale snapshot** |

**Root cause of “still 100% after new module”:** The UI reads `percent_complete` from the enrollment API **first** and never recomputes against the current module count unless that field is missing.

**Fix location:** Mostly **backend** (recompute on read + on curriculum change). Optional **frontend safety net** (never trust stored % without live denominator).

---

## 2. Why your audit-first approach makes sense (live platform)

You are right to be cautious. Many issues in this codebase are **behavioural breaking changes**, not JSON schema breaks:

| Change type | Example | Live-user impact |
|---|---|---|
| Gating fix | Register `trueFalse` in category map | Students suddenly **cannot skip** activities they used to skip |
| Scoring fix | Standalone scorers call `addPoints()` | Scores on resume/completion **change** for in-progress lessons |
| Tutor-mark fix | `fillInTheBlank` stops auto-grading in tutor-mark mode | Points already awarded may **disappear** on re-open |
| Completion fix | Recompute program % when modules added | **100% → 80%** — correct but surprising to students/tutors |

None of these break lesson JSON. All of them change what students **experience**. Fishing issues into separate audit `.md` files and fixing **one contract at a time** is the right strategy for a live platform.

**Recommended release pattern per fix:**

1. Audit doc (this file) → agreed behaviour  
2. Surgical code change (one surface)  
3. Test with one pilot course / one test student  
4. Ship with tutor comms if student-visible % changes  

---

## 3. Completion hierarchy (how the system is designed)

```
Program (course)
  └── Module(s)
        └── Lesson(s)
              └── Slide(s) + component activities
```

### 3.1 Lesson completion

**Trigger:** All slides reach `status: 'completed'` in the viewer.

**Code:** `components/viewer/LessonViewerUpload.tsx` (and legacy `LessonViewer.tsx`)

```typescript
const allCompleted = newSlides.every(s => s.status === 'completed');
if (allCompleted) {
  const finalScore = totalPossibleScore > 0
    ? Math.round((currentScore / totalPossibleScore) * 100) : 0;
  apiClient.lessons.markCompleted(lessonData.id, finalScore);
}
```

**API:** `POST /lessons/{lessonId}/complete` with `{ score: number }`  
(`lib/api-client.ts` line 218)

**Also persisted continuously:** Slide/component state via `lib/user-interactions.ts` → `/api/interactions` (MongoDB). This is **in-lesson progress**, separate from the backend “lesson completed” flag.

**Lesson `progress` % (on module cards):** Comes from the **external backend** lesson list (`completed`, `progress` fields). Not computed in this frontend repo.

---

### 3.2 Module completion

**Where:** `app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx`

**Calculation — always live on page load:**

```typescript
const completedLessonsCount = lessons.filter(l => l.completed).length
const progressPct = lessons.length > 0
  ? Math.round((completedLessonsCount / lessons.length) * 100) : 0
```

**Data fetch:**

1. `apiClient.programs.getDetails(programId)` — module metadata for breadcrumbs  
2. `apiClient.lessons.getModuleLessons(moduleId)` — lessons with `completed`, `progress`, `score`

**Behaviour when you add a lesson to an existing module:**

- If the backend returns the new lesson with `completed: false`, module % **should drop** (e.g. 5/5 → 5/6).  
- Module page does **not** use a stored `percent_complete` — it counts live.

**Caveat:** If the backend caches an old lesson list or omits new lessons until re-fetch, UI would also appear stale. From frontend code alone, module % is designed to be dynamic.

---

### 3.3 Program (course) completion

**Where:**

| Page | File |
|---|---|
| My Courses list | `app/dashboard/student/programs/page.tsx` |
| Course detail | `app/dashboard/student/programs/[id]/page.tsx` |
| Tutor student list | `app/dashboard/tutor/students/[id]/page.tsx` |
| Tutor program breakdown | `app/dashboard/tutor/students/[id]/programs/[programId]/page.tsx` |

**Student-facing calculation** (`getProgressValue` / `calculateProgress`):

```typescript
// Priority order — FIRST MATCH WINS:
if (typeof reg?.progress?.percent_complete === 'number') return reg.progress.percent_complete
if (typeof reg?.progress?.percentComplete === 'number') return reg.progress.percentComplete
if (typeof reg?.overallProgress === 'number') return reg.overallProgress
if (typeof reg?.totalProgress === 'number') return reg.totalProgress

// Fallback only if ALL stored fields are absent:
const completedCount = reg?.progress?.completed_modules?.length || 0
return Math.round((completedCount / program.modules.length) * 100)
```

**API calls on course detail page:**

1. `GET /programs/my/programs` — enrollment + **stored** `progress`  
2. `GET /programs/{id}` — current program structure (modules list)

These are **merged in the frontend** but progress % comes from (1), module count from (2). The stored % is **not** reconciled against the live module count when `percent_complete` exists.

**Tutor views:** Use backend-only fields — `reg.progress.percent_complete` or `registration.overallProgress` — with **no client-side fallback**.

---

## 4. The bug: 100% after adding a module

### 4.1 What happens step by step

1. Student completes all modules → backend sets enrollment `progress.percent_complete = 100` (and likely fills `completed_modules`).
2. You add Module 6 in Studio → program structure updates (`GET /programs/{id}` shows 6 modules).
3. Student opens My Courses → frontend reads enrollment from `GET /programs/my/programs`.
4. `percent_complete` is still `100` → UI shows **100%**. Fallback never runs.
5. New module appears in the list with 0% progress at module level, but **course hero still says 100%**.

### 4.2 Why fallback doesn’t save you

The fallback formula **would** work mathematically:

```
completed_modules.length / program.modules.length
→ e.g. 5 / 6 = 83%
```

…but it only runs when `percent_complete`, `percentComplete`, `overallProgress`, and `totalProgress` are **all absent**. In production, `percent_complete` is almost always present after any progress.

### 4.3 My Courses list has a second problem

On `programs/page.tsx`, fallback uses:

```typescript
const done = prog.progress?.completed_modules?.length || 0
return Math.round((done / prog.modules.length) * 100)
```

Enrollment objects from `getMyPrograms()` may **not include** a full `modules` array — often only `moduleCount`. If `prog.modules` is undefined, fallback returns **0%**, not a live calculation. So the list page is **double-dependent** on stored `percent_complete`.

---

## 5. Unused progress endpoint

`lib/api-client.ts` defines:

```typescript
getMyProgramProgress: (id: string) => this.get(`/programs/my/programs/${id}/progress`)
```

**This endpoint is never called anywhere in the frontend.**

Possible intent: a dedicated progress resource that recalculates on read. If the backend already implements live calculation there, wiring the dashboard to it would be a low-risk fix — **after verifying backend behaviour**.

---

## 6. Backend vs frontend responsibility

The external API (`NEXT_PUBLIC_API_URL`, default `http://localhost:5001/api`) owns:

- Enrollment records and `progress.percent_complete`
- `completed_modules` array
- Lesson `completed` / `progress` flags on `GET /lessons/module/{id}/lessons`
- Side effects of `POST /lessons/{id}/complete` (rollup to module/program progress)
- Tutor breakdown: `GET /studio/students/{id}/programs/{programId}` → `overallProgress`, `sectors[].progress`

**This repo (lesson-builder frontend) does not contain that backend.** Audit conclusions about **when** `percent_complete` is written or updated must be verified in the API service — but the **display bug is confirmed** in frontend: stored value wins over live structure.

### 6.1 Likely backend gaps (verify in API repo)

| Event | Expected behaviour | Likely actual |
|---|---|---|
| `POST /lessons/{id}/complete` | Mark lesson complete; recompute module + program % | Sets lesson flag; may set program % to 100 when all **current** modules done |
| New module added to program | Program % recomputed for all enrollments | **Not triggered** — old 100% persists |
| New lesson added to module | Module % drops for students who had 100% module | Depends on lesson list API |
| `GET /programs/my/programs` | Return **computed** % against live curriculum | Returns **stored** snapshot |
| `GET /programs/my/programs/{id}/progress` | Live calculation? | Unknown — unused by frontend |

---

## 7. Surface-by-surface reference

| UI surface | Formula / source | Dynamic? |
|---|---|---|
| Student home stats | `lessons.filter(l => l.progress === 100)` from `/lessons/my/interactions/{userId}` | Per interacted lessons only |
| My Courses card % | `progress.percent_complete` | ❌ Stored |
| Course detail hero % | `registration.progress.percent_complete` | ❌ Stored |
| Module detail hero % | `completedLessons / totalLessons` from module lessons API | ✅ Live |
| Module lesson cards | `lesson.completed`, `lesson.progress` from API | ✅ Live (per fetch) |
| Viewer top bar | `completedSlides / totalSlides` | ✅ Live (session) |
| Tutor student course card | `reg.progress.percent_complete` | ❌ Stored |
| Tutor breakdown header | `registration.overallProgress` | ❌ Stored |
| Tutor sector row | `sector.progress` | ❌ Stored (backend) |
| Student progress page | Placeholder — no real data | — |

---

## 8. Module “completion” vs program “completion”

There is **no explicit “mark module complete” API** in `api-client.ts`. Module completion is **derived**:

- **Student UI:** all lessons in module have `completed: true`  
- **Tutor UI:** lessons have `status: 'cleared'`

Program completion is similarly **derived** on the backend (presumably from module or lesson rollups) but **cached** as `percent_complete`.

**Implication:** Adding a module does not automatically append to `completed_modules`, but the **denominator** for a live calculation should increase. Stored `percent_complete = 100` ignores the new denominator.

---

## 9. Surgical fix options (ranked)

### Option A — Backend: compute on read (recommended)

On every `GET /programs/my/programs` and `GET /programs/my/programs/{id}/progress`:

```
percent_complete = round(
  completed_lessons_or_modules / total_lessons_or_modules_in_current_curriculum * 100
)
```

Do **not** persist 100% as a permanent flag; persist `completed_modules` / `completed_lessons` IDs and derive %.

**On curriculum change** (module/lesson create in Studio): optionally enqueue recomputation for all enrollments.

**Risk:** Students see % drop when you add content — **correct behaviour**, needs comms.

---

### Option B — Frontend safety net (quick, partial)

In `calculateProgress` / `getProgressValue`, always compute live when module list is available:

```typescript
const livePct = Math.round((completedCount / program.modules.length) * 100)
const storedPct = reg?.progress?.percent_complete
// Use minimum, or always prefer live:
return typeof storedPct === 'number' ? Math.min(storedPct, livePct) : livePct
```

Better: fetch module lessons for each module (expensive) or call `getMyProgramProgress(id)` if backend returns live %.

**Pros:** No backend deploy for partial fix.  
**Cons:** My Courses list still lacks module detail unless you add an API call; tutor views unchanged unless backend fixed too.

---

### Option C — Wire `getMyProgramProgress`

Replace stored field reads with:

```typescript
const progress = await apiClient.programs.getMyProgramProgress(programId)
```

**Only if** backend endpoint recalculates. Verify response shape first.

---

### Option D — Invalidate on Studio publish

When Studio creates/updates modules or lessons, backend sets `progress.percent_complete = null` or triggers rollup job.

**Pros:** Targeted, event-driven.  
**Cons:** Requires backend hook on Studio mutations.

---

## 10. Test plan (before any fix ships)

1. **Baseline:** Enroll test student in course with 5 modules, complete all → confirm 100%.  
2. **Add module:** Create Module 6 with 1 lesson (no completion).  
3. **Assert:**
   - Course detail % drops (e.g. 83% if module-granular, or lower if lesson-granular).  
   - My Courses list matches course detail.  
   - Module 6 opens with 0%; existing modules still show their lesson completion.  
   - Tutor breakdown `overallProgress` matches student view.  
4. **Complete new lesson:** Program % increases accordingly.  
5. **Add lesson to completed module:** Module % drops; program % drops.  
6. **Regression:** Student mid-lesson (not all slides done) — `markCompleted` not called; partial progress unchanged.

---

## 11. Related stale-data risks

| Area | Risk |
|---|---|
| IndexedDB lesson list cache | `lib/lesson-data-sync.ts` — 7-day TTL; may show old `progress` on student home until re-fetch |
| Offline interactions | Local saves sync later; completion API may fire before sync completes |
| `completed_modules` vs module IDs | If backend tracks completed module IDs, new module simply absent — live formula works; stored % does not |
| Binary vs partial completion | Module % counts `lesson.completed` (binary), not average of `lesson.progress` — a module at 99% on every lesson counts as 0% complete |

---

## 12. File index

| File | Role |
|---|---|
| `app/dashboard/student/programs/page.tsx` | Course list — stored `percent_complete` |
| `app/dashboard/student/programs/[id]/page.tsx` | Course detail — stored % + live module list |
| `app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx` | Module — **live** lesson count |
| `app/dashboard/tutor/students/[id]/page.tsx` | Tutor — stored `percent_complete` |
| `app/dashboard/tutor/students/[id]/programs/[programId]/page.tsx` | Tutor breakdown — `overallProgress`, `sector.progress` |
| `lib/api-client.ts` | API surface including unused `getMyProgramProgress` |
| `components/viewer/LessonViewerUpload.tsx` | Lesson complete → `markCompleted` |
| `lib/lesson-data-sync.ts` | Student home lesson list (cached) |

---

## 13. Bottom line

- **Module completion %** — recalculated from the lesson list API on each module page load. Should react to new lessons **if the backend returns them**.  
- **Program completion %** — **static snapshot** (`percent_complete`) preferred over live calculation. **This is the bug you observed.**  
- **It should be recalculated** from current curriculum + completed items, ideally on the backend at fetch time. The frontend currently **trusts stale stored values**.  
- **`getMyProgramProgress` exists but is unused** — worth checking whether it already does the right thing.  
- Your strategy of **audit docs → surgical fixes** is appropriate for a live platform where correctness fixes change visible student progress.

**Suggested first surgical fix:** Backend recompute on read for enrollment progress + frontend uses `Math.min(stored, live)` as a belt-and-braces guard on course detail page only (single file, easy to test).
