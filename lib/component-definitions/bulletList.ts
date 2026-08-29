import type { ComponentDefinition } from "@/types/lesson"

export const bulletListDefinition: ComponentDefinition = {
    type: "bulletList",
    label: "Bullet List",
    category: "content",
    description: "Ordered or unordered list...",
    icon: "📋",
    defaultProps: {
      items: ["Item 1", "Item 2", "Item 3"],
      type: "unordered",
      audioUrl: "",
      autoPlayAudio: false,
    },
    propDefinitions: [
      {
        name: "items",
        label: "List Items",
        type: "componentArray",
        required: true,
        defaultValue: ["Item 1", "Item 2", "Item 3"],
      },
      {
        name: "type",
        label: "List Type",
        type: "select",
        required: true,
        defaultValue: "unordered",
        options: [
          { label: "Unordered (Bullets)", value: "unordered" },
          { label: "Ordered (Numbers)", value: "ordered" },
        ],
      },
      {
        name: "audioUrl",
        label: "Audio Track URL",
        type: "audio",
        required: false,
        defaultValue: "",
      },
      {
        name: "autoPlayAudio",
        label: "Auto-Play Audio",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    ],
  }
