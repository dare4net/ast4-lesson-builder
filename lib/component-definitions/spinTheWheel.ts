import type { ComponentDefinition } from "@/types/lesson"
import { DEFAULT_WHEEL_QUESTIONS } from "@/lib/spin-the-wheel-utils"

export const spinTheWheelDefinition: ComponentDefinition = {
    type: "spinTheWheel",
    label: "Spin the Wheel",
    category: "interactive",
    description: "Gamified wheel quiz engine. Students spin the wheel to unlock dynamic questions with required spin tracking.",
    icon: "🎡",
    defaultProps: {
      title: "Spin the Wheel Quiz",
      requiredSpins: 3,
      points: 20,
      mode: "practice",
      state: "active",
      questions: DEFAULT_WHEEL_QUESTIONS,
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Spin the Wheel Quiz",
      },
      {
        name: "requiredSpins",
        label: "Required Spins",
        type: "number",
        required: false,
        defaultValue: 3,
        min: 1,
        max: 20,
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 20,
        min: 0,
        max: 100,
      },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        required: false,
        defaultValue: "practice",
        options: [
          { label: "Practice", value: "practice" },
          { label: "Live", value: "live" },
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
        defaultValue: 60,
        min: 15,
        max: 300,
      },
    ],
  }
