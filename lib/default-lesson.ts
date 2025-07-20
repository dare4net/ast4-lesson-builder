import type { Lesson, Component, ComponentType_Category, SlideStatus, SlideState } from "@/types/lesson"

// Helper function to determine component type category
export function getComponentTypeCategory(type: string): ComponentType_Category {
  const categoryMap: Record<string, ComponentType_Category> = {
    paragraph: "content",
    heading: "content",
    bulletList: "content",
    image: "media",
    quiz: "interactive",
    matchingPairs: "interactive",
    dragDrop: "interactive",
    scoreBoard: "gamified",
    flashcards: "gamified",
    hotspot: "interactive",
    fillInTheBlank: "interactive",
    codeEditor: "interactive",
  };
  
  return categoryMap[type] || "content";
}

// Helper function to categorize components
export function categorizeComponents(components: Component[]) {
  const categorized = {
    gamified: [] as Component[],
    interactive: [] as Component[],
    content: [] as Component[],
    media: [] as Component[],
    utility: [] as Component[],
    structure: [] as Component[]
  };

  components.forEach(component => {
    switch (component.component_type) {
      case "gamified":
        categorized.gamified.push(component);
        break;
      case "interactive":
        categorized.interactive.push(component);
        break;
      case "content":
        categorized.content.push(component);
        break;
      case "media":
        categorized.media.push(component);
        break;
      case "utility":
        categorized.utility.push(component);
        break;
      case "structure":
        categorized.structure.push(component);
        break;
    }
  });

  return categorized;
}

export const defaultLesson: Lesson = {
  id: `lesson-${Date.now()}`,
  title: "Untitled Lesson",
  description: "A new interactive lesson",
  author: "Anonymous",
  level: "Beginner",
  duration: 30,
  slides: [
    {
      id: `slide-${Date.now()}`,
      title: "Introduction",
      status: "uncompleted" as SlideStatus,
      state: "active" as SlideState,
      components: [
        {
          id: `component-${Date.now()}`,
          type: "heading",
          component_type: "content",
          props: {
            content: "Welcome to your new lesson",
            level: 1,
            align: "center",
          },
          state: "active",
          status: "uncompleted"
        },
        {
          id: `component-${Date.now() + 1}`,
          type: "paragraph",
          component_type: "content",
          props: {
            content:
              "Start adding components to build your interactive lesson. Drag components from the left panel and drop them here.",
            align: "center",
          },
          state: "active",
          status: "uncompleted"
        },
      ],
      get categorizedComponents() {
        return categorizeComponents(this.components);
      }
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
