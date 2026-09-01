import type { ComponentDefinition } from "@/types/lesson"

export const categoriseDefinition: ComponentDefinition = {
    type: "categorise",
    label: "Categorise",
    category: "interactive",
    description: "Sort items into designated category buckets or columns.",
    icon: "🗂️",
    defaultProps: {
      title: "Categorise the Items",
      categories: [
        { id: "c1", title: "Renewable Energy" },
        { id: "c2", title: "Non-Renewable Energy" },
      ],
      items: [
        { id: "i1", text: "Solar Power", categoryId: "c1" },
        { id: "i2", text: "Coal", categoryId: "c2" },
        { id: "i3", text: "Wind Turbines", categoryId: "c1" },
        { id: "i4", text: "Natural Gas", categoryId: "c2" },
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
        defaultValue: "Categorise the Items",
      },
      {
        name: "categories",
        label: "Categories / Buckets",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "c1", title: "Category A" },
          { id: "c2", title: "Category B" },
        ],
      },
      {
        name: "items",
        label: "Items to Categorise",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "i1", text: "Item 1", categoryId: "c1" },
          { id: "i2", text: "Item 2", categoryId: "c2" },
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
        defaultValue: 30,
        min: 15,
        max: 300,
      },
    ],
  }
