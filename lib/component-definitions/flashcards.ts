import type { ComponentDefinition } from "@/types/lesson"

export const flashcardsDefinition: ComponentDefinition = {
    type: "flashcards",
    label: "Flashcards",
    category: "interactive",
    description: "Two-sided study cards...",
    icon: "🎴",
    defaultProps: {
      title: "Flashcards",
      cards: [
        { id: "1", front: "What is the capital of France?", back: "Paris" },
        { id: "2", front: "What is the capital of Japan?", back: "Tokyo" },
        { id: "3", front: "What is the capital of Australia?", back: "Canberra" },
      ],
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
        defaultValue: "Flashcards",
      },
      {
        name: "cards",
        label: "Flashcards",
        type: "componentArray",
        required: true,
        defaultValue: [
          { id: "1", front: "What is the capital of France?", back: "Paris" },
          { id: "2", front: "What is the capital of Japan?", back: "Tokyo" },
          { id: "3", front: "What is the capital of Australia?", back: "Canberra" },
        ],
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
        defaultValue: 15,
        min: 5,
        max: 300,
      },
    ],
  }
