import type { ComponentDefinition } from "@/types/lesson"

export const quizDefinition: ComponentDefinition = {
    type: "quiz",
    label: "Quiz",
    category: "interactive",
    description: "Multiple choice questions...",
    icon: "❓",
    defaultProps: {
      questions: [
        {
          id: "q1",
          question: "What is the capital of France?",
          options: [
            { id: "1", text: "London", isCorrect: false },
            { id: "2", text: "Paris", isCorrect: true },
            { id: "3", text: "Berlin", isCorrect: false },
            { id: "4", text: "Madrid", isCorrect: false },
          ],
          explanation: "Paris is the capital and most populous city of France.",
        },
      ],
      showExplanation: true,
      shuffleOptions: true,
      randomizeAnswers: true,
      points: 10,
      mode: "practice",
      state: "active",
      status: "uncompleted"
    },
    propDefinitions: [
      {
        name: "questions",
        label: "Questions",
        type: "componentArray",
        required: true,
        defaultValue: [
          {
            id: "q1",
            question: "What is the capital of France?",
            options: [
              { id: "1", text: "London", isCorrect: false },
              { id: "2", text: "Paris", isCorrect: true },
              { id: "3", text: "Berlin", isCorrect: false },
              { id: "4", text: "Madrid", isCorrect: false },
            ],
            explanation: "Paris is the capital and most populous city of France.",
          },
        ],
      },
      {
        name: "showExplanation",
        label: "Show Explanation",
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      {
        name: "shuffleOptions",
        label: "Randomize Answers / Options",
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      {
        name: "points",
        label: "Points Per Question",
        type: "number",
        required: false,
        defaultValue: 10,
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
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        defaultValue: "uncompleted",
        options: [
          { label: "Uncompleted", value: "uncompleted" },
          { label: "Complete", value: "complete" }
        ]
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
