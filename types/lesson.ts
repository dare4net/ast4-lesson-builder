export interface Lesson {
  id: string
  title: string
  description: string
  author: string
  level: string
  duration: number
  slides: Slide[]
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  title: string
  components: Component[]
}

export interface Component {
  id: string
  type: ComponentType
  props: Record<string, any>
}

export type ComponentType =
  // Content Components
  | "paragraph"
  | "heading"
  | "bulletList"
  | "table"
  | "image"
  | "video"
  | "codeBlock"
  | "quote"

  // Visual & Layout Enhancers
  | "divider"
  | "box"
  | "callout"
  | "grid"
  | "carousel"
  | "accordion"
  | "iconBlock"

  // Interactive Components
  | "quiz"
  | "poll"
  | "dragDrop"
  | "matchingPairs"
  | "fillInTheBlank"
  | "flashcards"
  | "codeEditor"
  | "clickableImage"
  | "hotspot"

  // Gamified Components
  | "badgeReveal"
  | "scoreBoard"
  | "miniGame"
  | "progressBar"

  // Lesson Structure Components
  | "slideTitle"
  | "lessonIntro"
  | "lessonSummary"
  | "lessonComplete"

  // Utility Components
  | "timer"
  | "audioPlayer"
  | "languageToggle"
  | "themeSwitch"
  | "hint"
  | "notePad"

export interface ComponentDefinition {
  type: ComponentType
  label: string
  category: ComponentCategory
  description: string
  icon: string
  defaultProps: Record<string, any>
  propDefinitions: PropDefinition[]
}

export type ComponentCategory = "content" | "visual" | "interactive" | "gamified" | "structure" | "utility"

export interface PropDefinition {
  name: string
  label: string
  type: PropType
  required: boolean
  defaultValue?: any
  options?: string[] | number[] | { label: string; value: string | number }[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  description?: string
}

export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "multiSelect"
  | "color"
  | "richText"
  | "image"
  | "video"
  | "audio"
  | "json"
  | "component"
  | "componentArray"
