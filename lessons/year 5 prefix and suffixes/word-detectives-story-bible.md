# Word Detectives: Story Bible & Curriculum Design Document
### The Lexicon Guild Campaign — Expanded 12-Lesson Arc (Year 4 / Year 5)

---

## 1. Premise

On the surface, this is a detective story. Words all over town are changing overnight — *happy* becomes *unhappy*, *play* becomes *replay*, *care* becomes *careful*. A Word Detective Agency is formed to catch whoever's responsible. Two suspects emerge: **the Prefix Bandit**, who strikes at the front of words, and **the Suffix Sidekick**, who strikes at the end.

Underneath, this is a story about how language actually grows. The "crimes" are never destructive — nothing is ever *broken*, only *made more precise*. By the end of the module, the child-detective doesn't lock the suspects up. She learns why they do what they do, and the town ends up better for it.

That's the whole engine of the module: **what looks like vandalism is actually craftsmanship**, and the detective's journey is figuring that out before the story tells her.

---

## 2. Visual Scripting Principle: Rich Visual Prompts in `alt`

To ensure every slide leaves ample room for rich visual storytelling without requiring pre-existing static image assets, **every single `image` and `hotspot` component must feature a hyper-detailed, cinematic `alt` description** that paints the exact visual scene:

- **Style**: Dark, cinematic, rain-slicked Victorian detective aesthetic with neon/glowing accent stamps, brass instruments, leather-bound dockets, and magnifying lenses.
- **Rule**: Never use generic descriptions like `alt: "A picture of a book"`. Always write rich scene scripts:
  - *Example*: `alt: "A moody, rain-slicked Victorian alleyway at midnight, lit by the warm amber glow of a streetlamp. On a cobblestone wall, a vintage brass plaque for 'THE HAPPY BAKER' has neon blue, glowing stencil letters reading 'UN-' freshly stamped in front of 'HAPPY', casting soft reflections in rain puddles."`

---

## 3. Cast of Characters

### The Prefix Bandit (Corvin)
- **Public identity (Lessons 1–5):** A masked figure who strikes at the *start* of words. Feared, mysterious, leaving stenciled prefix keys across town.
- **Toolkit:**
  - `un-`, `dis-` (negation)
  - `in-`, `im-`, `il-`, `ir-` (chameleon negation)
  - `re-`, `pre-` (time & sequence)
  - `mis-`, `over-` (misdirection & degree)
- **True identity:** **Corvin**, the Lexicon Guild's archivist. He has been protecting and modifying language for over two centuries. He keeps a meticulous leather-bound logbook detailing every word edit made to preserve human understanding.

### The Suffix Sidekick (Wren)
- **Public identity (Lessons 6–10):** A second masked figure who strikes at the *end* of words. Initially assumed to be the Bandit's accomplice.
- **Toolkit:**
  - `-ment`, `-tion`, `-sion` (naming tools: verb → noun)
  - `-ful`, `-less` (describing tools: noun → adjective)
  - `-able`, `-ible`, `-ness`, `-ship` (capability & state tools)
- **True identity:** **Wren**, Corvin's apprentice and successor. Where Corvin changes what a word *means*, Wren changes what a word *does*. She proofreads her edits to ensure perfect clarity.

### The Lexicon Guild
An ancient order of quiet word-menders whose motto is revealed in the final capstone: *"We do not invent. We complete."*

---

## 4. 12-Lesson / 12-Chapter Campaign Roadmap

```
ACT I: THE NEGATION OUTBREAK (Lessons 1–3)
├── Lesson 1: Chapter 1 — The Midnight Alterations (Intro & Evidence Board)
├── Lesson 2: Chapter 2 — The Negation Keys (un- & dis-)
└── Lesson 3: Chapter 3 — The Chameleon Prefixes (in-, im-, il-, ir-)

ACT II: TIME, MOTION & MISDIRECTION (Lessons 4–5)
├── Lesson 4: Chapter 4 — The Clock Keys (re- & pre-)
└── Lesson 5: Chapter 5 — Misdirection & Overreach (mis- & over-)

ACT III: THE SUFFIX SIDEKICK APPEARS (Lessons 6–8)
├── Lesson 6: Chapter 6 — The Shadow at the Word's End (Suffix Intro & Wren)
├── Lesson 7: Chapter 7 — The Naming Tools (-ment, -tion, -sion)
└── Lesson 8: Chapter 8 — The Describing Tools (-ful & -less)

ACT IV: ADVANCED CRAFTSMANSHIP & THE TRAP (Lessons 9–10)
├── Lesson 9: Chapter 9 — State & Capability (-able, -ible, -ness, -ship)
└── Lesson 10: Chapter 10 — The Town's Dragnet (Setting the Trap)

ACT V: REVEAL & CAPSTONE (Lessons 11–12)
├── Lesson 11: Chapter 11 — The Logbook in Detention (The Evidence Unfolded)
└── Lesson 12: Chapter 12 — We Do Not Invent, We Complete (Guild Graduation)
```

---

## 5. Lesson-by-Lesson Story Map & Handoffs

### Lesson 1 — Chapter 1: The Midnight Alterations
- **Beat:** Letter arrives at the Word Detective Agency. Evidence board shows four altered signs across town.
- **Components:** `accordion` (case files), `hotspot` (explore initial crime scene), `poll` (detective oath), `shortAnswer` (`markingMode: "tutor-mark"` field journal entry).
- **Handoff:** Detective receives a report of a fresh strike at the Grand Clocktower.

### Lesson 2 — Chapter 2: The Negation Keys (`un-` & `dis-`)
- **Beat:** Uncovering how `un-` (*unhappy*, *unlock*) and `dis-` (*disappear*, *disagree*) reverse meaning. Decoy prefix trap (*ink* vs *incorrect*).
- **Components:** `categorise` (decoy prefix trap), `wordScramble` (codebreaking), `memoryGrid` (root matches), `trueFalse`.
- **Handoff:** A discarded scrap note is found signed *"sorry for the mess — C."*

### Lesson 3 — Chapter 3: The Chameleon Prefixes (`in-`, `im-`, `il-`, `ir-`)
- **Beat:** The Bandit changes shape! Learning why `in-` becomes `im-` before *p/m* (*impossible*), `il-` before *l* (*illegal*), and `ir-` before *r* (*irresponsible*).
- **Components:** `matchingPairs` (chameleon rules), `annotateImage` (prefix mechanics diagram), `quiz`.
- **Handoff:** Bandit spotted fleeing toward the Railway Station using a time-based prefix.

### Lesson 4 — Chapter 4: The Clock Keys (`re-` & `pre-`)
- **Beat:** Time manipulation prefixes: `re-` (again: *rebuild*) and `pre-` (before: *preview*).
- **Components:** `timeline` (sequencing *preview → view → review*), `dragDrop` (time assembly), `spinTheWheel`.
- **Handoff:** A newspaper from tomorrow is found at the scene, dated in advance!

### Lesson 5 — Chapter 5: Misdirection & Overreach (`mis-` & `over-`)
- **Beat:** Investigating mistakes and excesses (*misunderstand*, *overload*).
- **Components:** `categorise`, `shortAnswer` (tutor-mark log entry), `trueFalse`.
- **Handoff:** A personal note is left for the detective: *"Not everything sealed away is a lesson learned."*

### Lesson 6 — Chapter 6: The Shadow at the Word’s End
- **Beat:** First sighting of Wren (the Suffix Sidekick) at the Printing Press. Discovering that suffixes strike at the *end* of words to change what a word *does*.
- **Components:** `hotspot` (printing press inspection), `callout`, `quiz`, `poll`.
- **Handoff:** Clues point to suffix naming tools being used across town records.

### Lesson 7 — Chapter 7: The Naming Tools (`-ment`, `-tion`, `-sion`)
- **Beat:** Turning actions into nouns (*investigate → investigation*, *agree → agreement*).
- **Narrative Mirror:** The suffixes being created match the detective's own case log step-by-step!
- **Components:** `matchingPairs` (action → noun), `annotateImage`, `shortAnswer` (tutor-mark journal).
- **Handoff:** A torn logbook page is found in ancient handwriting.

### Lesson 8 — Chapter 8: The Describing Tools (`-ful` & `-less`)
- **Beat:** The power of contrasting pairs (*careful* vs *careless*, *hopeful* vs *hopeless*).
- **Discovery:** Detective inspects Wren's workshop and notices she proofreads her work to ensure maximum clarity.
- **Components:** `trueFalse` (contrast pairs), `categorise`, `flashcards`.
- **Handoff:** The Mayor calls an emergency town meeting to set a trap.

### Lesson 9 — Chapter 9: State & Capability (`-able`, `-ible`, `-ness`, `-ship`)
- **Beat:** Transforming words into states of being (*capable*, *happiness*, *friendship*).
- **Reveal:** Wren is revealed to be Corvin's apprentice, learning an ancient craft.
- **Components:** `categorise`, `memoryGrid`, `spinTheWheel`.
- **Handoff:** The town dragnet is prepared; both suspects are about to be cornered.

### Lesson 10 — Chapter 10: The Town’s Dragnet
- **Beat:** The Mayor and townspeople organize a massive trap to capture both suspects. Detective inputs their evidence file.
- **Components:** `poll` (detective decision), `shortAnswer` (tutor-mark case summary), `quiz`.
- **Handoff:** The trap springs! Both suspects are captured and brought to the Agency.

### Lesson 11 — Chapter 11: The Logbook in Detention
- **Beat:** Corvin presents his 200-year-old Lexicon Guild logbook during questioning.
- **Climax Mechanics:** The detective uses `categorise` and `hotspot` to analyze the logbook entries, proving every single edit made the language more precise.
- **Components:** `hotspot` (logbook inspection), `categorise` (made clearer vs made confusing), `accordion` (Guild archives).
- **Handoff:** Town realizes no law was broken; Corvin & Wren are invited to join the Agency.

### Lesson 12 — Chapter 12: We Do Not Invent, We Complete
- **Beat:** Grand capstone finale. Corvin & Wren are welcomed as official Lexicon Guild advisors.
- **Components:** `spinTheWheel` (master review), `memoryGrid`, `flashcardQuiz`, ending celebration badge overlay.

---

## 6. One-Line Test for Every Slide
Before finalizing any slide JSON in Lessons 1–12, it must pass this check:  
1. **Does the slide teach and check a real, specific prefix/suffix skill?**  
2. **Does the narrative beat move the Corvin/Wren Lexicon Guild mystery forward?**  
3. **Does every visual component feature a rich, cinematic `alt` visual prompt?**
