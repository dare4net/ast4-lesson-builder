import type { ComponentDefinition } from "@/types/lesson"

export const flashcardQuizDefinition: ComponentDefinition = {
    type: "flashcardQuiz",
    label: "Flashcard Quiz",
    category: "interactive",
    description: "Multi-question quiz where the question flips onto a card, then answer options flip in sequentially for the student to pick.",
    icon: "🎴",
    defaultProps: {
      title: "Flashcard Quiz",
      questions: [
        {
          id: "fq1",
          question: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Madrid"],
          correctAnswer: 0,
        },
        {
          id: "fq2",
          question: "What is 7 × 8?",
          options: ["54", "56", "63", "64"],
          correctAnswer: 1,
        },
      ],
      points: 20,
      mode: "practice",
      state: "active",
      timeLimit: 15,
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Flashcard Quiz",
      },
      {
        name: "questions",
        label: "Questions",
        type: "componentArray",
        required: true,
        defaultValue: [
          {
            id: "fq1",
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Madrid"],
            correctAnswer: 0,
          },
        ],
      },
      {
        name: "points",
        label: "Total Points",
        type: "number",
        required: false,
        defaultValue: 20,
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
