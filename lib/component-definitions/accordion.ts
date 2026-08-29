import type { ComponentDefinition } from "@/types/lesson"

export const accordionDefinition: ComponentDefinition = {
    type: "accordion",
    label: "Accordion FAQ",
    category: "content",
    description: "Collapsible expandable panels for glossaries and FAQ lists.",
    icon: "📂",
    defaultProps: {
      title: "Key Definitions",
      items: [
        { id: "acc-1", title: "What is this concept?", content: "Detailed explanation goes here.", audioUrl: "" },
        { id: "acc-2", title: "Why is it important?", content: "Key significance and context.", audioUrl: "" },
      ],
      allowMultiple: false,
    },
    propDefinitions: [
      {
        name: "title",
        label: "Accordion Section Title",
        type: "string",
        required: false,
        defaultValue: "Key Definitions",
      },
      {
        name: "items",
        label: "Accordion Panels",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "acc-1", title: "What is this concept?", content: "Detailed explanation goes here.", audioUrl: "" },
        ],
      },
      {
        name: "allowMultiple",
        label: "Allow Multiple Open",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    ],
  }
