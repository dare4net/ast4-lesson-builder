import type { ComponentDefinition } from "@/types/lesson"

export const imageDefinition: ComponentDefinition = {
    type: "image",
    label: "Image",
    category: "content",
    description: "Display image with caption...",
    icon: "🖼️",
    defaultProps: {
      src: "/placeholder.svg?height=300&width=400",
      alt: "Image description",
      caption: "",
      width: "100%",
    },
    propDefinitions: [
      {
        name: "src",
        label: "Image Source",
        type: "image",
        required: true,
        defaultValue: "/placeholder.svg?height=300&width=400",
      },
      {
        name: "alt",
        label: "Alt Text",
        type: "string",
        required: true,
        defaultValue: "Image description",
      },
      {
        name: "caption",
        label: "Caption",
        type: "string",
        required: false,
        defaultValue: "",
      },
      {
        name: "width",
        label: "Width",
        type: "string",
        required: false,
        defaultValue: "100%",
      },
    ],
  }
