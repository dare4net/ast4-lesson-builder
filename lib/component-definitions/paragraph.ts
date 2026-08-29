import type { ComponentDefinition } from "@/types/lesson"

export const paragraphDefinition: ComponentDefinition = {
    type: "paragraph",
    label: "Paragraph",
    category: "content",
    description: "Text block with formatting...",
    icon: "📝",
    defaultProps: {
      content: "Enter your text here...",
      align: "left",
      audioUrl: "",
      autoPlayAudio: false,
    },
    propDefinitions: [
      {
        name: "content",
        label: "Content",
        type: "richText",
        required: true,
        defaultValue: "Enter your text here...",
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
          { label: "Justify", value: "justify" },
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
