import type { Lesson } from "@/types/lesson"

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
      components: [
        {
          id: `component-${Date.now()}`,
          type: "heading",
          props: {
            content: "Welcome to your new lesson",
            level: 1,
            align: "center",
          },
        },
        {
          id: `component-${Date.now() + 1}`,
          type: "paragraph",
          props: {
            content:
              "Start adding components to build your interactive lesson. Drag components from the left panel and drop them here.",
            align: "center",
          },
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
