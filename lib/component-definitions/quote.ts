import type { ComponentDefinition } from "@/types/lesson"

export const quoteDefinition: ComponentDefinition = {
    type: "quote",
    label: "Quote Card",
    category: "content",
    description: "Featured quote box with author attribution and tactile styling.",
    icon: "💬",
    defaultProps: {
      text: "Learning is a treasure that will follow its owner everywhere.",
      author: "Chinese Proverb",
      source: "Ancient Wisdom",
    },
    propDefinitions: [
      {
        name: "text",
        label: "Quote Text",
        type: "richText",
        required: true,
        defaultValue: "Learning is a treasure that will follow its owner everywhere.",
      },
      {
        name: "author",
        label: "Author Name",
        type: "string",
        required: false,
        defaultValue: "Chinese Proverb",
      },
      {
        name: "source",
        label: "Source / Context",
        type: "string",
        required: false,
        defaultValue: "Ancient Wisdom",
      },
    ],
  }
