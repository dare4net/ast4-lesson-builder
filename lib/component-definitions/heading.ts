import type { ComponentDefinition } from "@/types/lesson"

export const headingDefinition: ComponentDefinition = {
    type: "heading",
    label: "Heading",
    category: "content",
    description: "Section title or subtitle...",
    icon: "📌",
    defaultProps: {
      content: "Heading Text",
      level: 2,
      align: "left",
    },
    propDefinitions: [
      {
        name: "content",
        label: "Content",
        type: "string",
        required: true,
        defaultValue: "Heading Text",
      },
      {
        name: "level",
        label: "Heading Level",
        type: "select",
        required: true,
        defaultValue: 2,
        options: [
          { label: "H1 (Largest)", value: 1 },
          { label: "H2", value: 2 },
          { label: "H3", value: 3 },
          { label: "H4", value: 4 },
          { label: "H5", value: 5 },
          { label: "H6 (Smallest)", value: 6 },
        ],
      },
      {
        name: "align",
        label: "Alignment",
        type: "select",
        required: false,
        defaultValue: "left",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
  }
