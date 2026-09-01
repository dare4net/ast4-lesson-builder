import type { ComponentDefinition } from "@/types/lesson"

export const jigsawDefinition: ComponentDefinition = {
    type: "jigsaw",
    label: "Jigsaw Diagram Puzzle",
    category: "gamified",
    description: "Interactive sliced image puzzle with drag-snap assembly and hotspot unlocks.",
    icon: "🧩",
    defaultProps: {
      title: "Assemble Cell Structure Diagram",
      image: "/placeholder.svg?height=400&width=600",
      gridSize: { rows: 3, cols: 3 },
      points: 20,
      mode: "practice",
      state: "active",
      timeLimit: 90,
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Jigsaw Diagram Puzzle" },
      { name: "image", label: "Diagram Image", type: "image", required: true, defaultValue: "/placeholder.svg?height=400&width=600" },
      { name: "gridSize", label: "Grid Layout", type: "componentArray", required: true, defaultValue: { rows: 3, cols: 3 } },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 20 },
    ],
  }
