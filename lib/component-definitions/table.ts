import type { ComponentDefinition } from "@/types/lesson"

export const tableDefinition: ComponentDefinition = {
    type: "table",
    label: "Table",
    category: "content",
    description: "Organize data in rows and columns...",
    icon: "📊",
    defaultProps: {
      rows: 2,
      columns: 2,
      data: [
        ["Cell 1", "Cell 2"],
        ["Cell 3", "Cell 4"],
      ],
    },
    propDefinitions: [
      {
        name: "rows",
        label: "Number of Rows",
        type: "number",
        required: true,
        defaultValue: 2,
        min: 1,
        max: 10,
      },
      {
        name: "columns",
        label: "Number of Columns",
        type: "number",
        required: true,
        defaultValue: 2,
        min: 1,
        max: 10,
      },
      {
        name: "data",
        label: "Table Data",
        type: "componentArray",
        required: true,
        defaultValue: [
          ["Cell 1", "Cell 2"],
          ["Cell 3", "Cell 4"],
        ],
      },
    ],
  }
