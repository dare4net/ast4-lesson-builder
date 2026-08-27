export interface Lesson {
  id: string
  title: string
  description: string
  author: string
  level: string
  duration: number
  slides: Slide[]
  settings?: Record<string, any>
  voice?: string
  introAudioUrl?: string
  introTextHash?: string
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  title: string
  components: Component[]
  status: SlideStatus
  state: SlideState
  /** Pre-generated audio URL for the slide transition cue announcement */
  titleAudioUrl?: string
  /** Hash used to detect when the title has changed and needs re-generation */
  titleTextHash?: string
}


export type SlideStatus = "completed" | "uncompleted"
export type SlideState = "active" | "disabled"

export interface Component {
  id: string
  type: ComponentType
  props: Record<string, any>
  state?: ComponentState
  status?: ComponentStatus
  mode?: ComponentMode
}


export type ComponentType_Category =
  | "interactive"
  | "gamified"
  | "content"
  | "visual-guide"
  | "media"
  | "utility"
  | "structure"

export type ComponentState = "active" | "disabled"
export type ComponentStatus = "completed" | "uncompleted"
export type ComponentMode = "practice" | "live"

export type ComponentType =
  // Content Components
  | "paragraph"
  | "heading"
  | "bulletList"
  | "table"
  | "image"
  | "video"
  | "callout"
  | "accordion"
  | "quote"
  | "tabsPanel"
  | "embed"

  // Interactive & Gamified Components
  | "quiz"
  | "trueFalse"
  | "shortAnswer"
  | "annotateImage"
  | "categorise"
  | "timeline"
  | "scaleSlider"
  | "wordCloud"
  | "dragDrop"
  | "matchingPairs"
  | "fillInTheBlank"
  | "flashcards"
  | "codeEditor"
  | "hotspot"
  | "poll"
  | "flashcardQuiz"
  | "multiSelectQuiz"
  | "wordScramble"
  | "spinTheWheel"
  | "memoryGrid"
  | "wordCloud"
  | "annotationBoard"
  | "anagram"
  | "hangman"
  | "swipeDeck"
  | "spectrumSorter"
  | "jigsaw"
  | "crossword"

  // Media
  | "audioPlayer"

  // Lesson Structure Components
  | "slideTitle"

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
