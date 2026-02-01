import type { Lesson, SlideStatus, SlideState } from "@/types/lesson"

export const defaultLesson: Lesson = {
  id: "lesson-default",
  title: "Untitled Lesson",
  description: "A new interactive lesson",
  author: "Anonymous",
  level: "Beginner",
  duration: 30,
  slides: [
    {
      id: "slide-default",
      title: "Introduction",
      status: "uncompleted" as SlideStatus,
      state: "active" as SlideState,
      components: [
        {
          id: "component-heading-default",
          type: "heading",
          props: {
            content: "Welcome to your new lesson",
            level: 1,
            align: "center",
          },
          state: "active",
          status: "uncompleted"
        },
        {
          id: "component-text-default",
          type: "paragraph",
          props: {
            content:
              "Start adding components to build your interactive lesson. Drag components from the left panel and drop them here.",
            align: "center",
          },
          state: "active",
          status: "uncompleted"
        },
      ],
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}
