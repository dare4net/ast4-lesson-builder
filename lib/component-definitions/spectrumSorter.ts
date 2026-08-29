import type { ComponentDefinition } from "@/types/lesson"

export const spectrumSorterDefinition: ComponentDefinition = {
    type: "spectrumSorter",
    label: "Spectrum Sorter",
    category: "gamified",
    description: "Continuous linear axis track for ordering items along a scale.",
    icon: "🎚️",
    defaultProps: {
      title: "pH Scale Spectrum Sorter",
      minLabel: "Acidic (pH 0)",
      maxLabel: "Alkaline (pH 14)",
      tolerance: 10,
      items: [
        { id: "i1", text: "Lemon Juice", correctPosition: 15 },
        { id: "i2", text: "Pure Water", correctPosition: 50 },
        { id: "i3", text: "Bleach", correctPosition: 90 },
      ],
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Spectrum Sorter" },
      { name: "minLabel", label: "Min Bound Label", type: "string", required: true, defaultValue: "Low" },
      { name: "maxLabel", label: "Max Bound Label", type: "string", required: true, defaultValue: "High" },
      { name: "tolerance", label: "Accuracy Tolerance %", type: "number", required: false, defaultValue: 10 },
      { name: "items", label: "Spectrum Items", type: "componentArray", required: true, defaultValue: [] },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
