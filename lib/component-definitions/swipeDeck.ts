import type { ComponentDefinition } from "@/types/lesson"

export const swipeDeckDefinition: ComponentDefinition = {
    type: "swipeDeck",
    label: "Swipe Deck",
    category: "gamified",
    description: "Generic binary choice card deck with 3D tactile buttons and flippable explanations.",
    icon: "🎴",
    defaultProps: {
      title: "Myth vs Fact Challenge",
      leftLabel: "Myth",
      rightLabel: "Fact",
      cards: [
        { id: "c1", text: "Humans only use 10% of their brain.", correctSide: "left", explanation: "Brain imaging shows virtually all parts of the brain are active." },
        { id: "c2", text: "Water expands when it freezes.", correctSide: "right", explanation: "Ice forms a crystalline structure that occupies more volume." },
      ],
      points: 15,
      mode: "practice",
      state: "active",
      timeLimit: 45,
    },
    propDefinitions: [
      { name: "title", label: "Title", type: "string", required: false, defaultValue: "Myth vs Fact Challenge" },
      { name: "leftLabel", label: "Left Choice Label", type: "string", required: true, defaultValue: "Myth" },
      { name: "rightLabel", label: "Right Choice Label", type: "string", required: true, defaultValue: "Fact" },
      { name: "cards", label: "Deck Cards", type: "componentArray", required: true, defaultValue: [] },
      { name: "points", label: "Points", type: "number", required: false, defaultValue: 15 },
    ],
  }
