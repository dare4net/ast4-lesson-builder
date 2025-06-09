export type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  highlight: string
  background: string
  cardBackground: string
  cardBorder: string
  cardShadow: string
  text: string
  textMuted: string
  success: string
  error: string
  warning: string
  info: string
}

export type Theme = {
  id: string
  name: string
  description: string
  colors: ThemeColors
  borderRadius: string
  fontFamily: string
}

// Default theme based on provided brand colors
export const defaultTheme: Theme = {
  id: "default",
  name: "Afterschool Brand",
  description: "The default theme using Afterschool Tech brand colors",
  colors: {
    primary: "#f5aa31", // Orange-yellow
    secondary: "#eb6004", // Deep orange
    accent: "#319bda", // Blue
    highlight: "#5cb334", // Green
    background: "#f8f9fa", // Light gray page background
    cardBackground: "#fff8f0", // Warm cream for cards
    cardBorder: "#f5aa31", // Orange border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#5cb334", // Green for success
    error: "#e74c3c", // Red for errors
    warning: "#f39c12", // Amber for warnings
    info: "#319bda", // Blue for info
  },
  borderRadius: "0.5rem", // Reduced border radius
  fontFamily: "'Poppins', sans-serif",
}

// Ocean Adventure theme
export const oceanTheme: Theme = {
  id: "ocean",
  name: "Ocean Adventure",
  description: "Dive into learning with cool ocean blues and teals",
  colors: {
    primary: "#0099cc", // Ocean blue
    secondary: "#006699", // Deep blue
    accent: "#66cccc", // Teal
    highlight: "#ff9933", // Coral
    background: "#f0f8ff", // Light blue page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e6f3ff", // Very light blue border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#33cc99", // Seafoam green for success
    error: "#ff6666", // Coral red for errors
    warning: "#ffcc66", // Sand yellow for warnings
    info: "#66ccff", // Sky blue for info
  },
  borderRadius: "0.5rem",
  fontFamily: "'Poppins', sans-serif",
}

// Space Explorer theme
export const spaceTheme: Theme = {
  id: "space",
  name: "Space Explorer",
  description: "Blast off with deep purples and cosmic blues",
  colors: {
    primary: "#6633cc", // Purple
    secondary: "#3333cc", // Deep blue
    accent: "#cc66ff", // Lavender
    highlight: "#ffcc00", // Star yellow
    background: "#f5f5ff", // Light purple page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e8e0ff", // Very light purple border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc99", // Green for success
    error: "#ff6699", // Pink for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#3399ff", // Blue for info
  },
  borderRadius: "0.75rem", // Slightly more rounded corners
  fontFamily: "'Poppins', sans-serif",
}

// Jungle Safari theme
export const jungleTheme: Theme = {
  id: "jungle",
  name: "Jungle Safari",
  description: "Explore learning with lush greens and earthy tones",
  colors: {
    primary: "#66cc33", // Jungle green
    secondary: "#339933", // Deep green
    accent: "#ffcc33", // Sunny yellow
    highlight: "#ff9933", // Orange
    background: "#f5fff0", // Light green page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e8f5e0", // Very light green border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc33", // Green for success
    error: "#ff6633", // Orange-red for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#66cccc", // Teal for info
  },
  borderRadius: "0.375rem", // Less rounded corners
  fontFamily: "'Poppins', sans-serif",
}

// Rainbow Fun theme
export const rainbowTheme: Theme = {
  id: "rainbow",
  name: "Rainbow Fun",
  description: "A colorful spectrum of learning excitement",
  colors: {
    primary: "#ff6699", // Pink
    secondary: "#ff9933", // Orange
    accent: "#ffcc33", // Yellow
    highlight: "#66cc33", // Green
    background: "#fff5fa", // Light pink page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#ffe0f0", // Very light pink border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc33", // Green for success
    error: "#ff3366", // Pink-red for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#3399ff", // Blue for info
  },
  borderRadius: "0.75rem", // More rounded corners
  fontFamily: "'Poppins', sans-serif",
}

// Dinosaur Adventure theme
export const dinosaurTheme: Theme = {
  id: "dinosaur",
  name: "Dinosaur Adventure",
  description: "Prehistoric fun with earthy greens and browns",
  colors: {
    primary: "#669933", // Moss green
    secondary: "#996633", // Brown
    accent: "#cc9933", // Amber
    highlight: "#ff9933", // Orange
    background: "#f5f5e6", // Light tan page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e8e8d0", // Very light tan border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#669933", // Green for success
    error: "#cc6633", // Rust for errors
    warning: "#cc9933", // Amber for warnings
    info: "#669999", // Sage for info
  },
  borderRadius: "0.25rem", // Sharp corners
  fontFamily: "'Poppins', sans-serif",
}

// Candy Land theme
export const candyTheme: Theme = {
  id: "candy",
  name: "Candy Land",
  description: "Sweet learning with pinks and purples",
  colors: {
    primary: "#ff66cc", // Bubblegum pink
    secondary: "#cc66ff", // Lavender
    accent: "#66ccff", // Sky blue
    highlight: "#ffcc33", // Yellow
    background: "#fff0fa", // Light pink page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#ffd6f0", // Very light pink border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc99", // Mint for success
    error: "#ff6699", // Pink for errors
    warning: "#ffcc66", // Peach for warnings
    info: "#66ccff", // Sky blue for info
  },
  borderRadius: "0.75rem", // More rounded corners
  fontFamily: "'Poppins', sans-serif",
}

// Robot Lab theme
export const robotTheme: Theme = {
  id: "robot",
  name: "Robot Lab",
  description: "Technical learning with blues and grays",
  colors: {
    primary: "#3399cc", // Blue
    secondary: "#666699", // Slate blue
    accent: "#66cccc", // Teal
    highlight: "#ffcc33", // Yellow
    background: "#f5f7fa", // Light gray page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e0e8f0", // Very light gray border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc99", // Teal for success
    error: "#ff6666", // Red for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#3399cc", // Blue for info
  },
  borderRadius: "0.125rem", // Very sharp corners
  fontFamily: "'Poppins', sans-serif",
}

// Superhero theme
export const superheroTheme: Theme = {
  id: "superhero",
  name: "Superhero Academy",
  description: "Powerful learning with bold colors",
  colors: {
    primary: "#3366cc", // Blue
    secondary: "#cc3333", // Red
    accent: "#ffcc33", // Yellow
    highlight: "#66cc33", // Green
    background: "#f5f7ff", // Light blue page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#e0e8ff", // Very light blue border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc33", // Green for success
    error: "#cc3333", // Red for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#3366cc", // Blue for info
  },
  borderRadius: "0.25rem", // Sharp corners
  fontFamily: "'Poppins', sans-serif",
}

// Magic Kingdom theme
export const magicTheme: Theme = {
  id: "magic",
  name: "Magic Kingdom",
  description: "Enchanted learning with purples and blues",
  colors: {
    primary: "#9966cc", // Purple
    secondary: "#6633cc", // Deep purple
    accent: "#ff9933", // Orange
    highlight: "#ffcc33", // Yellow
    background: "#faf8ff", // Light purple page background
    cardBackground: "#ffffff", // White cards for contrast
    cardBorder: "#f0e8ff", // Very light purple border
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // Soft subtle shadow
    text: "#333333", // Dark gray for text
    textMuted: "#777777", // Medium gray for muted text
    success: "#66cc99", // Teal for success
    error: "#ff6699", // Pink for errors
    warning: "#ffcc33", // Yellow for warnings
    info: "#6699ff", // Blue for info
  },
  borderRadius: "0.5rem", // Rounded corners
  fontFamily: "'Poppins', sans-serif",
}

// All themes collection
export const themes: Theme[] = [
  defaultTheme,
  oceanTheme,
  spaceTheme,
  jungleTheme,
  rainbowTheme,
  dinosaurTheme,
  candyTheme,
  robotTheme,
  superheroTheme,
  magicTheme,
]

// Helper function to get a theme by ID
export function getThemeById(id: string): Theme {
  return themes.find((theme) => theme.id === id) || defaultTheme
}
