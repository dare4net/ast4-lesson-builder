import type { ComponentDefinition } from "@/types/lesson"

export const annotateImageDefinition: ComponentDefinition = {
    type: "annotateImage",
    label: "Annotate Image",
    category: "interactive",
    description: "Label image diagram regions by placing target annotation tags.",
    icon: "🏷️",
    defaultProps: {
      title: "Label the Diagram",
      image: "/placeholder.svg?height=400&width=600",
      labels: [
        { id: "l1", text: "Nucleus", x: 0.5, y: 0.4 },
        { id: "l2", text: "Mitochondria", x: 0.2, y: 0.7 },
      ],
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
        defaultValue: "Label the Diagram",
      },
      {
        name: "image",
        label: "Diagram Image URL",
        type: "image",
        required: true,
        defaultValue: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "labels",
        label: "Annotation Targets",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "l1", text: "Nucleus", x: 0.5, y: 0.4 },
          { id: "l2", text: "Mitochondria", x: 0.2, y: 0.7 },
        ],
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 15,
      },
    ],
  }
