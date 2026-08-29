import type { ComponentDefinition } from "@/types/lesson"

export const dragDropDefinition: ComponentDefinition = {
    type: "dragDrop",
    label: "Drag & Drop",
    category: "interactive",
    description: "Match items by dragging...",
    icon: "🎯",
    defaultProps: {
      title: "Arrange in the correct order",
      items: [
        { id: "1", text: "First item", correctIndex: 0 },
        { id: "2", text: "Second item", correctIndex: 1 },
        { id: "3", text: "Third item", correctIndex: 2 },
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
        defaultValue: "Arrange in the correct order",
      },
      {
        name: "items",
        label: "Items",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "1", text: "First item", correctIndex: 0 },
          { id: "2", text: "Second item", correctIndex: 1 },
          { id: "3", text: "Third item", correctIndex: 2 },
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
