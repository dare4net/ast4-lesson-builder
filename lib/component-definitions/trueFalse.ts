import type { ComponentDefinition } from "@/types/lesson"

export const trueFalseDefinition: ComponentDefinition = {
    type: "trueFalse",
    label: "True or False",
    category: "interactive",
    description: "Rapid-fire binary question with animated selection cards.",
    icon: "⚡",
    defaultProps: {
      statement: "The earth revolves around the sun.",
      isTrue: true,
      explanation: "Earth takes 365.25 days to complete an orbit around the Sun.",
      points: 10,
    },
    propDefinitions: [
      {
        name: "statement",
        label: "Statement",
        type: "string",
        required: true,
        defaultValue: "The earth revolves around the sun.",
      },
      {
        name: "isTrue",
        label: "Correct Answer",
        type: "boolean",
        required: true,
        defaultValue: true,
      },
      {
        name: "explanation",
        label: "Explanation",
        type: "string",
        required: false,
        defaultValue: "",
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 10,
      },
    ],
  }
