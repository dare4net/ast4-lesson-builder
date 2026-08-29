import type { ComponentDefinition } from "@/types/lesson"

export const matchingPairsDefinition: ComponentDefinition = {
    type: "matchingPairs",
    label: "Matching Pairs",
    category: "interactive",
    description: "Match related items...",
    icon: "🔄",
    defaultProps: {
      title: "Match the items",
      pairs: [
        { id: "1", left: "Dog", right: "Bark" },
        { id: "2", left: "Cat", right: "Meow" },
        { id: "3", left: "Cow", right: "Moo" },
      ],
      shuffled: true,
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Match the items",
      },
      {
        name: "pairs",
        label: "Matching Pairs",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "1", left: "Dog", right: "Bark" },
          { id: "2", left: "Cat", right: "Meow" },
          { id: "3", left: "Cow", right: "Moo" },
        ],
      },
      {
        name: "shuffled",
        label: "Shuffle Items",
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 15,
        min: 0,
        max: 100,
      },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        required: false,
        defaultValue: "practice",
        options: [
          { label: "Practice Mode", value: "practice" },
          { label: "Live Mode", value: "live" },
        ],
      },
      {
        name: "state",
        label: "State",
        type: "select",
        required: false,
        defaultValue: "active",
        options: [
          { label: "Active", value: "active" },
          { label: "Disabled", value: "disabled" },
        ],
      },
      {
        name: "timeLimit",
        label: "Time Limit (Seconds)",
        type: "number",
        required: false,
        defaultValue: 10,
        min: 5,
        max: 300,
      },
    ],
  }
