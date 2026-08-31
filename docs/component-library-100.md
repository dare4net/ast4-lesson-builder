# Component library — 100 interesting blocks

Target: **100 studio components**, all useful, none redundant.

Live in the studio today: **38**.  
This catalog proposes **62** more. Together that is **100**.

Do **not** ship another MCQ, another letter-scramble, generic `miniGame`, `themeSwitch`, `languageToggle`, `progressBar`, or chrome like `lessonComplete`. Those either already exist or are app chrome, not lesson blocks.

Existing renderer specs for shipped games live in [`gamified-components-spec.md`](./gamified-components-spec.md).

---

## Already shipping (38)

### Content (10)

| # | Type | What it is | Not the same as |
|---|---|---|---|
| 1 | `paragraph` | Body text | — |
| 2 | `heading` | Title / section heading | `slideTitle` |
| 3 | `bulletList` | Unordered list | numbered procedure (proposed) |
| 4 | `table` | Generic grid of cells | comparison / glossary (proposed) |
| 5 | `quote` | Pull quote | callout |
| 6 | `callout` | Tip / warning / info box | hint chrome |
| 7 | `accordion` | Collapsible sections | — |
| 8 | `image` | Still image | captioned figure, before/after (proposed) |
| 9 | `video` | Video clip | silent demo loop, 360 pan (proposed) |
| 10 | `slideTitle` | Slide identity title | `heading` |

### Checks (7)

| # | Type | What it is | Not the same as |
|---|---|---|---|
| 11 | `quiz` | Single-choice MCQ | `multiSelectQuiz`, `trueFalse` |
| 12 | `multiSelectQuiz` | Several correct options | `quiz` |
| 13 | `trueFalse` | Binary claim | `quiz` with two options |
| 14 | `flashcardQuiz` | Scored flip-and-answer | unscored `flashcards` |
| 15 | `fillInTheBlank` | Type into gaps in text | listen-then-cloze (proposed) |
| 16 | `shortAnswer` | Open written answer, tutor or self mark | `quiz` |
| 17 | `codeEditor` | Write and run / submit code | predict-the-output, debug-the-line (proposed) |

### Place and sort (9)

| # | Type | What it is | Not the same as |
|---|---|---|---|
| 18 | `dragDrop` | Drag items onto targets | matching pairs, label-the-diagram |
| 19 | `matchingPairs` | Pair A with B | drag-drop |
| 20 | `categorise` | Sort into buckets | venn place, odd-one-out (proposed) |
| 21 | `timeline` | Place dated events in order | order-the-steps (proposed) |
| 22 | `hotspot` | Tap regions on an image | label-the-diagram (drag names) |
| 23 | `annotateImage` | Mark up an image | hotspot, annotation board |
| 24 | `annotationBoard` | Free annotation canvas | annotate image |
| 25 | `spectrumSorter` | Place on a continuum | scale slider |
| 26 | `scaleSlider` | One numeric / Likert value | ranking line (proposed) |

### Games (9)

| # | Type | What it is | Not the same as |
|---|---|---|---|
| 27 | `flashcards` | Unscored study flips | `flashcardQuiz` |
| 28 | `anagram` | Rearrange letters of one word | word scramble, sentence unscramble |
| 29 | `wordScramble` | Scrambled letters / word | anagram, sentence unscramble |
| 30 | `hangman` | Guess letters, limited lives | word search |
| 31 | `crossword` | Interlocking clues | word search |
| 32 | `jigsaw` | Piece an image together | pixel reveal (proposed) |
| 33 | `memoryGrid` | Match hidden tiles | memory path / Simon (proposed) |
| 34 | `spinTheWheel` | Random prompt from a wheel | board race, probability spinner (skip) |
| 35 | `swipeDeck` | Swipe cards into camps | categorise, ranking line |

### Live class (2)

| # | Type | What it is | Not the same as |
|---|---|---|---|
| 36 | `poll` | Class vote | best-example vote, mood check (proposed) |
| 37 | `wordCloud` | Class words aggregate | collaborative list (proposed) |

`codeBlock` exists in the registry but is not in the studio library. Treat it as unshipped until it has a real editor.

---

## Proposed (62)

Suggested first batch: **order the steps, label the diagram, find the error, odd one out, analogy lock, word search, pixel reveal, escape room, exit ticket, branch choice**.

### Content that teaches (8)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 39 | Worked example | `workedExample` | Steps reveal one by one | Not a paragraph and not an accordion — it is a paced solution |
| 40 | Glossary pair | `glossaryPair` | Term + meaning, searchable in-lesson | Not a table and not flashcards |
| 41 | Formula block | `formulaBlock` | Rendered math (KaTeX), not a screenshot | Not `codeBlock` |
| 42 | Numbered procedure | `numberedProcedure` | Cookbook steps with optional check-off | Not `bulletList` |
| 43 | Before / after slider | `beforeAfter` | Two images, one story | Not a single `image` |
| 44 | Comic strip | `comicStrip` | 3–6 sequential panels | Not a gallery of images |
| 45 | Captioned figure | `captionedFigure` | Image + teaching caption as one unit | `image` has no pedagogical caption contract |
| 46 | Code walkthrough | `codeWalkthrough` | Highlight lines while you explain | Not `codeEditor` (they do not write) and not a static `codeBlock` |

### Media (6)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 47 | Audio narration | `audioNarration` | Transcript lights up while it plays | Not `video` |
| 48 | Student recorder | `audioRecording` | They speak; tutor can hear | Registry stub — ship it for real |
| 49 | 360 pan image | `panoramaImage` | Drag to look around | Not a still `image` |
| 50 | Silent demo loop | `demoLoop` | Tiny repeating visual demo | Not a full `video` lesson |
| 51 | Split-screen demo | `splitDemo` | Tutor clip + student try zone | Not video-then-quiz as two blocks |
| 52 | Listen-then-cloze | `clozeListening` | Audio FITB | `fillInTheBlank` is visual text |

### Interactive scored — new mechanics (18)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 53 | Order the steps | `orderSteps` | Sequence a process | `timeline` is dated events, not procedure order |
| 54 | Label the diagram | `labelDiagram` | Drag names onto parts | `hotspot` is tap-regions; this is named labels |
| 55 | Find the error | `findTheError` | Tap the wrong bit in a paragraph or snippet | Not MCQ |
| 56 | Odd one out | `oddOneOut` | Which item does not belong | Not `categorise` |
| 57 | Analogy lock | `analogyLock` | A is to B as C is to ? | Not a 4-option quiz in spirit |
| 58 | Sentence unscramble | `sentenceUnscramble` | Reorder whole words | `wordScramble` / `anagram` are letters |
| 59 | Venn place | `vennPlace` | Two overlapping sets | `categorise` buckets do not overlap |
| 60 | Cause → effect chain | `causeEffect` | Link causes to effects in a chain | Not matching pairs |
| 61 | Predict the output | `codeTrace` | Show code, pick what it prints | Not `codeEditor` |
| 62 | Debug the line | `debugLine` | Click the broken line | Not write-the-fix in `codeEditor` |
| 63 | Graph plot | `graphPlot` | Drop points on axes | Not `scaleSlider` |
| 64 | Unit convert | `unitConvert` | Value in, value out, with units | Not short answer |
| 65 | Truth table | `truthTable` | Fill T/F cells for logic | Not `trueFalse` one-claim |
| 66 | Chart lie | `chartLie` | Which graph is misleading | Media-literacy, not quiz-about-a-chart |
| 67 | Citation hunt | `citationHunt` | Which source actually supports the claim | Not `quiz` |
| 68 | Ranking line | `rankingLine` | Order by a criterion | `scaleSlider` is one value; `spectrumSorter` is a continuum of items without a forced total order UI |
| 69 | Flowchart fill | `flowchartFill` | Missing node in a flow | Not `dragDrop` onto a picture |
| 70 | Combination lock | `comboLock` | Several clues, one code | Uses other blocks as evidence, not a password field |

### Games that are not hangman / crossword / jigsaw (16)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 71 | Word search | `wordSearch` | Find listed words in a grid | Not crossword, not hangman |
| 72 | Memory path | `memoryPath` | Simon-style sequence to replay | `memoryGrid` is pair-matching |
| 73 | Pixel reveal | `pixelReveal` | Right answers uncover a picture | Not `jigsaw` |
| 74 | Type racer | `typeRacer` | Type the passage against the clock | Not short answer |
| 75 | Pipe connect | `pipeConnect` | Rotate tiles to complete a path | Not drag-drop |
| 76 | Escape room | `escapeRoom` | Several locks; other blocks are clues | A container mechanic, not a quiz |
| 77 | Boss round | `bossRound` | Lives + phases | Not a normal `quiz` |
| 78 | Maze facts | `mazeFacts` | Correct tiles are the path | Not a content maze image |
| 79 | Cipher decode | `cipherDecode` | Break a simple cipher | Not anagram |
| 80 | Treasure map | `treasureMap` | Follow clues on a map | Not hotspot |
| 81 | Rhythm tap | `rhythmTap` | Tap syllables on a beat | Not audio narration |
| 82 | Bubble match | `bubbleMatch` | Pop two that belong together | Not `matchingPairs` table UI |
| 83 | Rule guesser | `ruleGuesser` | See examples, name the rule | Not quiz-after-examples |
| 84 | Budget sim | `budgetSim` | Spend a fixed purse | Not poll, not scale |
| 85 | Recipe builder | `recipeBuild` | Ingredients in the right order | Close to order-the-steps but with quantities / constraints |
| 86 | Board race | `boardRace` | Class race on one track | Not `spinTheWheel` |

### Live / class (6)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 87 | Exit ticket | `exitTicket` | One prompt at the end, class roll-up | Not `shortAnswer` in the middle of a slide |
| 88 | Mood check | `moodCheck` | Fast class feeling | Not `poll` (options are not a mood protocol) |
| 89 | Reaction bar | `reactionBar` | Live emoji / agree-disagree | Not `poll` |
| 90 | Collaborative list | `collabList` | Class builds one list | Not `wordCloud` |
| 91 | Live whiteboard | `liveWhiteboard` | Shared drawing | Registry `drawingCanvas` stub — ship as class-ready |
| 92 | Best-example vote | `bestExampleVote` | Vote on student work | Not `poll` on tutor-authored options |

### Structure that changes the lesson (4)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 93 | Branch choice | `branchChoice` | Pick a path; different next slides | Not a scored quiz |
| 94 | Checkpoint gate | `checkpointGate` | Locked until the prior block is done | Not a heading |
| 95 | Recap strip | `recapStrip` | 20-second “what you just learned” | Not `paragraph` |
| 96 | Goal setter | `goalSetter` | They write what they want from this lesson | Not `shortAnswer` for grading |

### STEM / craft specials (4)

| # | Working name | Type key | Mechanic | Why it is not redundant |
|---|---|---|---|---|
| 97 | Fraction pizza | `fractionPizza` | Shade / build fractions | Not `scaleSlider` |
| 98 | Clock set | `clockSet` | Set a clock face to a time | Not a number input |
| 99 | Color mix | `colorMix` | Mix pigments / light to a target | Not a color picker in settings |
| 100 | Music staff | `musicStaff` | Place / hear a note | Not `audioNarration` |

---

## Will not ship (on purpose)

| Idea | Why skip |
|---|---|
| Another MCQ variant | `quiz` / `multiSelectQuiz` / `trueFalse` cover it |
| Another letter scramble | `anagram` + `wordScramble` |
| `miniGame` | Too vague; each game must be a named mechanic |
| `themeSwitch` / `languageToggle` | App chrome, not a lesson block |
| `progressBar` | Viewer chrome already exists |
| `lessonIntro` / `lessonComplete` | Overlays already exist |
| `hint` as a block | Callout + store hint packs already exist |
| `divider` / `box` / `iconBlock` | Low teaching value |
| Dice / extra spinner | `spinTheWheel` already exists |
| Anatomy pin / extra hotspot | `hotspot` already exists |

---

## Counts

| Bucket | Shipped | Proposed | Total |
|---|---:|---:|---:|
| Content | 10 | 8 | 18 |
| Media | (in content) | 6 | 6 extra |
| Checks | 7 | 0 | 7 |
| Place / sort | 9 | 0 | 9 |
| Interactive scored (new) | 0 | 18 | 18 |
| Games | 9 | 16 | 25 |
| Live class | 2 | 6 | 8 |
| Structure | (slide title in content) | 4 | 4 extra |
| STEM / craft | 0 | 4 | 4 |
| **Total** | **38** | **62** | **100** |

---

## Build notes

- Every new scored type uses `ScoredRenderer` (lock, persist, retry, live vs practice).
- Every new type needs: registry entry, studio definition, editor, renderer, tests.
- Type keys above are proposals; keep them camelCase to match the existing registry.
- First implementation batch (recommended): `orderSteps`, `labelDiagram`, `findTheError`, `oddOneOut`, `analogyLock`, `wordSearch`, `pixelReveal`, `escapeRoom`, `exitTicket`, `branchChoice`.
