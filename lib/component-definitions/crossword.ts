import type { ComponentDefinition } from "@/types/lesson"

export const crosswordDefinition: ComponentDefinition = {
    type: "crossword",
    label: "Mini Crossword",
    category: "gamified",
    description: "Interactive 5x5 crossword grid with Across/Down clue navigation.",
    icon: "🗺️",
    defaultProps: {
      title: "Biology Key Terms Crossword",
      gridSize: { rows: 5, cols: 5 },
      words: [
        { id: "w1", word: "CELL", clue: "Basic unit of life", direction: "across", row: 1, col: 0 },
        { id: "w2", word: "DNA", clue: "Genetic code molecule", direction: "down", row: 0, col: 1 },
      ],
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Mini Crossword" },
      { name: "gridSize", label: "Grid Size", type: "componentArray", required: true, defaultValue: { rows: 5, cols: 5 } },
      { name: "words", label: "Crossword Words", type: "componentArray", required: true, defaultValue: [] },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
