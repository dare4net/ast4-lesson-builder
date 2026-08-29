import type { ComponentDefinition } from "@/types/lesson"

export const anagramDefinition: ComponentDefinition = {
    type: "anagram",
    label: "Anagram Engine",
    category: "gamified",
    description: "Interactive scrambled letter tiles with hint system and shuffle pool.",
    icon: "🧩",
    defaultProps: {
      title: "Solve the Anagram",
      word: "ALGORITHM",
      hint: "A step-by-step set of instructions for solving a problem",
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Solve the Anagram" },
      { name: "word", label: "Target Word", type: "string", required: true, defaultValue: "ALGORITHM" },
      { name: "hint", label: "Hint Text", type: "string", required: false, defaultValue: "" },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
