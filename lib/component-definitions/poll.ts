import type { ComponentDefinition } from "@/types/lesson"

export const pollDefinition: ComponentDefinition = {
    type: "poll",
    label: "Poll",
    category: "interactive",
    description: "Interactive opinion poll with live response tallies and animated percentage bars.",
    icon: "📊",
    defaultProps: {
      question: "Which state of matter has a fixed shape and volume?",
      options: [
        { id: "opt1", text: "Solid" },
        { id: "opt2", text: "Liquid" },
        { id: "opt3", text: "Gas" },
        { id: "opt4", text: "Plasma" },
      ],
      points: 5,
      mode: "practice",
      state: "active",
      timeLimit: 10,
    },
    propDefinitions: [
      {
        name: "question",
        label: "Poll Question",
        type: "string",
        required: true,
        defaultValue: "Which state of matter has a fixed shape and volume?",
      },
      {
        name: "options",
        label: "Poll Options",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "opt1", text: "Solid" },
          { id: "opt2", text: "Liquid" },
          { id: "opt3", text: "Gas" },
          { id: "opt4", text: "Plasma" },
        ],
      },
      {
        name: "points",
        label: "Participation Points",
        type: "number",
        required: false,
        defaultValue: 5,
      },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        required: false,
        defaultValue: "practice",
        options: [
          { label: "Practice Mode", value: "practice" },
          { label: "Live Mode", value: "live" },
        ],
      },
      {
        name: "state",
        label: "State",
        type: "select",
        required: false,
        defaultValue: "active",
        options: [
          { label: "Active", value: "active" },
          { label: "Disabled", value: "disabled" },
        ],
      },
      {
        name: "timeLimit",
        label: "Time Limit (Seconds)",
        type: "number",
        required: false,
        defaultValue: 10,
        min: 5,
        max: 300,
      },
    ],
  }
