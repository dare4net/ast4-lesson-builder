export type LibraryFilterId = "all" | "content" | "practice" | "live" | "games"

export type LibraryGroupId =
  | "text"
  | "media"
  | "questions"
  | "sort"
  | "explore"
  | "live"
  | "word-games"
  | "puzzles"

export interface LibraryGroup {
  id: LibraryGroupId
  label: string
  description: string
  filter: Exclude<LibraryFilterId, "all">
  types: string[]
}

export const LIBRARY_FILTERS: { id: LibraryFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "content", label: "Text" },
  { id: "practice", label: "Practice" },
  { id: "live", label: "Live" },
  { id: "games", label: "Games" },
]

export const LIBRARY_GROUPS: LibraryGroup[] = [
  {
    id: "text",
    label: "Text & layout",
    description: "Titles, copy, and structure",
    filter: "content",
    types: ["slideTitle", "heading", "paragraph", "quote", "callout", "bulletList", "accordion", "table"],
  },
  {
    id: "media",
    label: "Media",
    description: "Images and video",
    filter: "content",
    types: ["image", "video"],
  },
  {
    id: "questions",
    label: "Questions",
    description: "Quizzes and written answers",
    filter: "practice",
    types: ["quiz", "multiSelectQuiz", "trueFalse", "shortAnswer", "fillInTheBlank", "flashcards", "flashcardQuiz"],
  },
  {
    id: "sort",
    label: "Match & sort",
    description: "Pairing, grouping, and order",
    filter: "practice",
    types: ["matchingPairs", "dragDrop", "categorise", "timeline", "spectrumSorter"],
  },
  {
    id: "explore",
    label: "Explore",
    description: "Hotspots, annotation, and code",
    filter: "practice",
    types: ["hotspot", "annotateImage", "annotationBoard", "codeEditor"],
  },
  {
    id: "live",
    label: "Live classroom",
    description: "Shared activities in class",
    filter: "live",
    types: ["poll", "wordCloud", "scaleSlider", "spinTheWheel"],
  },
  {
    id: "word-games",
    label: "Word games",
    description: "Letters, words, and clues",
    filter: "games",
    types: ["hangman", "crossword", "wordScramble", "anagram"],
  },
  {
    id: "puzzles",
    label: "Puzzles",
    description: "Memory and spatial play",
    filter: "games",
    types: ["jigsaw", "memoryGrid", "swipeDeck"],
  },
]
