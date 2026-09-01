import type { ComponentDefinition } from "@/types/lesson"

export const memoryGridDefinition: ComponentDefinition = {
    type: "memoryGrid",
    label: "Memory Grid",
    category: "gamified",
    description: "Concentration memory game — flip cards to find matching pairs.",
    icon: "🎴",
    defaultProps: {
      title: "Memory Card Pairs",
      pairs: [
        { id: "p1", term: "Photosynthesis", definition: "Plants convert light to energy" },
        { id: "p2", term: "Respiration", definition: "Cells release energy from glucose" },
        { id: "p3", term: "Osmosis", definition: "Diffusion of water across a membrane" },
      ],
      points: 20,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Memory Card Pairs",
      },
      {
        name: "pairs",
        label: "Matching Pairs",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "p1", term: "Term 1", definition: "Definition 1" },
          { id: "p2", term: "Term 2", definition: "Definition 2" },
        ],
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 20,
      },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        required: false,
        defaultValue: "practice",
        options: [
          { label: "Practice", value: "practice" },
          { label: "Live", value: "live" },
        ],
      },
      {
        name: "timeLimit",
        label: "Time Limit (Seconds)",
        type: "number",
        required: false,
        defaultValue: 60,
        min: 15,
        max: 300,
      },
    ],
  }
