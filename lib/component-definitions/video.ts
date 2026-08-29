import type { ComponentDefinition } from "@/types/lesson"

export const videoDefinition: ComponentDefinition = {
    type: "video",
    label: "Video",
    category: "content",
    description: "Embed video from URL...",
    icon: "🎥",
    defaultProps: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      caption: "",
      aspectRatio: "16:9",
      autoPlay: false,
      poster: "",
    },
    propDefinitions: [
      {
        name: "url",
        label: "YouTube Video URL / Link",
        type: "string",
        required: true,
        placeholder: "https://www.youtube.com/watch?v=...",
        description: "Paste a YouTube watch link or share URL",
        defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        name: "caption",
        label: "Video Caption",
        type: "string",
        required: false,
        placeholder: "Optional video description",
        defaultValue: "",
      },
      {
        name: "aspectRatio",
        label: "Aspect Ratio",
        type: "select",
        required: false,
        defaultValue: "16:9",
        options: [
          { label: "Widescreen (16:9)", value: "16:9" },
          { label: "Standard (4:3)", value: "4:3" },
          { label: "Square (1:1)", value: "1:1" },
        ],
      },
      {
        name: "autoPlay",
        label: "Autoplay Video",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      {
        name: "poster",
        label: "Poster Frame Image URL",
        type: "image",
        required: false,
        defaultValue: "",
        description: "Custom video preview thumbnail image",
      },
    ],
  }
