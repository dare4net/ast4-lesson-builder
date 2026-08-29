import type { ComponentDefinition } from "@/types/lesson"

export const annotationBoardDefinition: ComponentDefinition = {
    type: "annotationBoard",
    label: "Annotation Board",
    category: "gamified",
    description: "Subject-agnostic text tagging passage canvas with customizable label palette.",
    icon: "🏷️",
    defaultProps: {
      title: "Identify Grammar Roles",
      passage: "The quick brown fox jumps over the lazy dog.",
      labels: [
        { id: "l1", name: "Subject", color: "#1CB0F6" },
        { id: "l2", name: "Predicate Verb", color: "#58CC02" },
        { id: "l3", name: "Direct Object", color: "#FFC800" },
      ],
      correctAnswers: [
        { wordIndex: 2, labelId: "l1" },
        { wordIndex: 4, labelId: "l2" },
        { wordIndex: 8, labelId: "l3" },
      ],
      points: 15,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Identify Grammar Roles" },
      { name: "passage", label: "Passage Text", type: "richText", required: true, defaultValue: "The quick brown fox jumps over the lazy dog." },
      { name: "labels", label: "Tag Categories Palette", type: "componentArray", required: true, defaultValue: [] },
      { name: "correctAnswers", label: "Target Tag Answers", type: "componentArray", required: true, defaultValue: [] },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
