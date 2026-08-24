# Story-Driven Lesson Generation Checklist

This checklist outlines the mandatory steps followed when planning, generating, and validating each lesson in the curriculum.

---

### 1. Narrative & Story Realignment
- [ ] **Master Bible Check**: Review master documentation (`01-premise-and-characters.md`, `02-full-story.md`, `03-lesson-plan.md`, `04-video-clips.md`).
- [ ] **Character Consistency**: Ensure active characters (Bluster, Spindle, Nibbs, Vane, Vance, Mayor Flump) maintain distinct voice and role.
- [ ] **Narrative Handoff**: Define an explicit handoff beat to the next lesson (Cliffhanger, Transition, or Graduation).

---

### 2. Lesson Plan & Component Architecture
- [ ] **Pedagogical Target**: Focus on specific Year 8 KS3 English skills (e.g., Ethos/Pathos/Logos, Hooks, Concessions, AFOREST, Speechcraft, Media Adaptation).
- [ ] **Plan Document**: Create detailed slide breakdown in `03-lesson-plans/lesson-XX.md`.
- [ ] **Component Diversity**: Select 5–7 distinct component types per lesson to guarantee varied interaction.
- [ ] **Mode Configuration**: Set `"mode": "practice"` for guided story lessons and `"mode": "live"` for formal assessments.

---

### 3. Schema & Renderer Compliance
- [ ] **Prop Validation**: Check component props against schema rules in `lib/validation/components/`.
- [ ] **Required Fields**: Include required props (`isTrue` for `trueFalse`, `blanks` for `fillInTheBlank`, `markingMode` for `shortAnswer`).
- [ ] **Renderer Check**: Confirm all component types have active React UI renderers in `components/component-renderer.tsx`.
- [ ] **Character Limits**: Enforce text limits (e.g., `poll` options $\le 60$ characters).

---

### 4. Automated Verification & Diversity Audit
- [ ] **Validator Check**: Run `npx tsx scripts/verify-lesson.ts <path-to-lesson.json>` and achieve **100% VALID PASS (0 Errors, 0 Warnings)**.
- [ ] **Similarity Audit**: Run `npx tsx scripts/compare-lessons.ts <path-to-lesson.json>` and confirm **pairwise Jaccard similarity < 60%**.
