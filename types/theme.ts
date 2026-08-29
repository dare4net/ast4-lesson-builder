export interface ThemeConfig {
  borderRadius: {
    small: string
    medium: string
    large: string
    full: string
  }
  typography: {
    fontSizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeights: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
    lineHeights: {
      none: string
      tight: string
      normal: string
      relaxed: string
    }
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}
