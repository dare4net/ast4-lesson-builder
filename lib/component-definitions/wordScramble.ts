import type { ComponentDefinition } from "@/types/lesson"

export const wordScrambleDefinition: ComponentDefinition = {
    type: "wordScramble",
    label: "Word & Sentence Rearrange",
    category: "gamified",
    description: "Tap scrambled tiles in order to unscramble words or build full sentences.",
    icon: "🔤",
    defaultProps: {
      title: "Unscramble the Sequence",
      variant: "single",
      word: "PHOTOSYNTHESIS",
      words: ["SOLAR", "SYSTEM"],
      sentence: "Photosynthesis converts sunlight into chemical energy.",
      hint: "Process used by plants to synthesize food from sunlight",
      allowTextClue: true,
      allowLetterReveal: true,
      maxLetterReveals: 3,
      allowWordSolve: true,
      maxWordSolves: 1,
      allowFirstLetterAnchors: true,
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      {
        name: "word",
        label: "Word Scramble Configuration",
        type: "componentArray",
        required: false,
        defaultValue: "PHOTOSYNTHESIS",
        description: "Configure variant (single/multi/sentence), target words, sentence, and hint.",
      },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
