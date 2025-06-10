export interface ThemeConfig {
  colors: {
    primary: ColorConfig;
    secondary: ColorConfig;
    accent: ColorConfig;
    background: {
      DEFAULT: string;
      secondary: string;
      tertiary: string;
    };
    foreground: {
      DEFAULT: string;
      secondary: string;
      tertiary: string;
    };
    border: {
      DEFAULT: string;
      focus: string;
    };
    success: StatusColorConfig;
    warning: StatusColorConfig;
    error: StatusColorConfig;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeights: {
      none: string;
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duoBounce: string;
    duoShake: string;
    duoPop: string;
    duoFloat: string;
    duoPulse: string;
    duoCelebrate: string;
  };
  components: {
    button: {
      base: string;
      variants: {
        primary: string;
        secondary: string;
        outline: string;
        ghost: string;
      };
      sizes: {
        sm: string;
        md: string;
        lg: string;
      };
    };
    card: {
      base: string;
      variants: {
        DEFAULT: string;
        compact: string;
        interactive: string;
      };
    };
    input: {
      base: string;
      variants: {
        DEFAULT: string;
        large: string;
      };
    };
  };
}

interface ColorConfig {
  DEFAULT: string;
  hover: string;
  focus: string;
  active: string;
  foreground: string;
}

interface StatusColorConfig {
  DEFAULT: string;
  foreground: string;
} 