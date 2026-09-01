import type { ComponentDefinition } from "@/types/lesson"

export const hangmanDefinition: ComponentDefinition = {
    type: "hangman",
    label: "Word Quest (Hangman)",
    category: "gamified",
    description: "Gamified secret word guessing with A-Z virtual keyboard and 3D visual themes.",
    icon: "🔤",
    defaultProps: {
      title: "Word Quest Challenge",
      word: "ASTRONOMY",
      category: "Space Science",
      clue: "The scientific study of celestial bodies",
      theme: "spaceship",
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Word Quest Challenge" },
      { name: "word", label: "Target Word", type: "string", required: true, defaultValue: "ASTRONOMY" },
      { name: "category", label: "Category Header", type: "string", required: false, defaultValue: "Space Science" },
      { name: "clue", label: "Clue Text", type: "string", required: false, defaultValue: "" },
      { name: "theme", label: "Visual Theme", type: "select", required: false, defaultValue: "spaceship", options: [{ label: "Spaceship Launch", value: "spaceship" }, { label: "Castle Siege", value: "castle" }, { label: "Classic Hearts", value: "classic" }] },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
      { name: "mode", label: "Mode", type: "select", required: false, defaultValue: "practice", options: [{ label: "Practice", value: "practice" }, { label: "Live", value: "live" }] },
      { name: "timeLimit", label: "Time Limit (Seconds)", type: "number", required: false, defaultValue: 30, min: 15, max: 300 },
    ],
  }
