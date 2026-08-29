import type { ComponentDefinition } from "@/types/lesson"

export const multiSelectQuizDefinition: ComponentDefinition = {
    type: "multiSelectQuiz",
    label: "Multi-Select Quiz",
    category: "interactive",
    description: "Quiz where students select ALL correct answers from colorful option cards, with partial-score feedback.",
    icon: "☑️",
    defaultProps: {
      title: "Select All That Apply",
      questions: [
        {
          id: "q1",
          question: "Which of the following are mammals?",
          options: [
            { id: "a", text: "Dog", isCorrect: true, color: "bg-violet-500" },
            { id: "b", text: "Eagle", isCorrect: false, color: "bg-amber-500" },
            { id: "c", text: "Whale", isCorrect: true, color: "bg-sky-500" },
            { id: "d", text: "Salmon", isCorrect: false, color: "bg-rose-500" },
          ],
        },
      ],
      points: 15,
      mode: "practice",
      state: "active",
      timeLimit: 15,
    },
    propDefinitions: [
      {
        name: "title",
        label: "Quiz Title",
        type: "string",
        required: false,
        defaultValue: "Select All That Apply",
      },
      {
        name: "questions",
        label: "Questions",
        type: "componentArray",
        required: true,
        defaultValue: [],
      },
      {
        name: "points",
        label: "Total Points",
        type: "number",
        required: false,
        defaultValue: 15,
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
        defaultValue: 15,
        min: 5,
        max: 300,
      },
    ],
  }
