import type { ComponentDefinition } from "@/types/lesson"

export const slideTitleDefinition: ComponentDefinition = {
    type: "slideTitle",
    label: "Slide Title",
    category: "structure",
    description: "Main slide heading...",
    icon: "📑",
    defaultProps: {
      content: "Slide Title",
      align: "center",
      color: "black",
      backgroundColor: "transparent",
    },
    propDefinitions: [
      {
        name: "content",
        label: "Title Content",
        type: "string",
        required: true,
        defaultValue: "Slide Title",
      },
      {
        name: "align",
        label: "Text Alignment",
        type: "select",
        required: false,
        defaultValue: "center",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      {
        name: "color",
        label: "Text Color",
        type: "color",
        required: false,
        defaultValue: "black",
      },
      {
        name: "backgroundColor",
        label: "Background Color",
        type: "color",
        required: false,
        defaultValue: "transparent",
      },
    ],
  }
