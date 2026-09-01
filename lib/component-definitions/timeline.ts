import type { ComponentDefinition } from "@/types/lesson"

export const timelineDefinition: ComponentDefinition = {
    type: "timeline",
    label: "Timeline Rail",
    category: "interactive",
    description: "Interactive horizontal or vertical chronological event timeline.",
    icon: "⏳",
    defaultProps: {
      title: "Historical Timeline",
      events: [
        { id: "e1", year: "1969", title: "Moon Landing", description: "Apollo 11 mission touches down on the lunar surface." },
        { id: "e2", year: "1989", title: "World Wide Web", description: "Tim Berners-Lee proposes global hypertext system." },
        { id: "e3", year: "2007", title: "Smartphone Era", description: "First iPhone launches, revolutionizing mobile computing." },
      ],
      interactive: true,
      points: 15,
      mode: "practice",
      timeLimit: 25,
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Historical Timeline",
      },
      {
        name: "events",
        label: "Timeline Events",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "e1", year: "1969", title: "Event 1", description: "Description 1" },
        ],
      },
      {
        name: "interactive",
        label: "Interactive Order Check",
        type: "boolean",
        required: false,
        defaultValue: true,
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
