import type { ComponentDefinition } from "@/types/lesson"

export const calloutDefinition: ComponentDefinition = {
    type: "callout",
    label: "Callout Box",
    category: "content",
    description: "Highlighted alert box for notes, tips, warnings, and key takeaways.",
    icon: "💡",
    defaultProps: {
      variant: "note",
      title: "Important Note",
      content: "Add key insights, warnings, or tips here...",
    },
    propDefinitions: [
      {
        name: "variant",
        label: "Variant",
        type: "select",
        required: true,
        defaultValue: "note",
        options: [
          { label: "Note (Blue)", value: "note" },
          { label: "Tip (Green)", value: "tip" },
          { label: "Warning (Yellow)", value: "warning" },
          { label: "Important (Red)", value: "important" },
        ],
      },
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Important Note",
      },
      {
        name: "content",
        label: "Content",
        type: "richText",
        required: true,
        defaultValue: "Add key insights, warnings, or tips here...",
      },
    ],
  }
