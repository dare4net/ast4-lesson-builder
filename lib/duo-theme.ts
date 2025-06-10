import { type ThemeConfig } from '@/types/theme'

export const duoTheme: ThemeConfig = {
  colors: {
    primary: {
      DEFAULT: '#58CC02',
      hover: '#4CAF00',
      focus: '#4CAF00',
      active: '#3B8C00',
      foreground: '#FFFFFF',
    },
    secondary: {
      DEFAULT: '#FFC800',
      hover: '#E6B400',
      focus: '#E6B400',
      active: '#CC9E00',
      foreground: '#4B4B4B',
    },
    accent: {
      DEFAULT: '#FF4B4B',
      hover: '#E64242',
      focus: '#E64242',
      active: '#CC3939',
      foreground: '#FFFFFF',
    },
    background: {
      DEFAULT: '#FFFFFF',
      secondary: '#F7F7F7',
      tertiary: '#E5E5E5',
    },
    foreground: {
      DEFAULT: '#4B4B4B',
      secondary: '#777777',
      tertiary: '#AFAFAF',
    },
    border: {
      DEFAULT: '#E5E5E5',
      focus: '#4B4B4B',
    },
    success: {
      DEFAULT: '#58CC02',
      foreground: '#FFFFFF',
    },
    warning: {
      DEFAULT: '#FFC800',
      foreground: '#4B4B4B',
    },
    error: {
      DEFAULT: '#FF4B4B',
      foreground: '#FFFFFF',
    },
  },
  borderRadius: {
    small: '0.5rem',
    medium: '0.75rem',
    large: '1rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: '"DIN Round Pro", system-ui, sans-serif',
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  animations: {
    duoBounce: 'duo-bounce 0.3s ease-in-out',
    duoShake: 'duo-shake 0.3s ease-in-out',
    duoPop: 'duo-pop 0.2s ease-out',
    duoFloat: 'duo-float 3s ease-in-out infinite',
    duoPulse: 'duo-pulse 2s ease-in-out infinite',
    duoCelebrate: 'duo-celebrate 0.5s ease-out',
  },
  components: {
    button: {
      base: 'rounded-xl font-bold transition-all duration-200 shadow-md',
      variants: {
        primary: 'bg-primary hover:bg-primary-hover active:bg-primary-active text-white border-b-4 border-primary-active hover:border-primary-active/70 active:border-b-0 active:mt-1',
        secondary: 'bg-secondary hover:bg-secondary-hover active:bg-secondary-active text-foreground border-b-4 border-secondary-active hover:border-secondary-active/70 active:border-b-0 active:mt-1',
        outline: 'bg-background hover:bg-background-secondary active:bg-background-tertiary text-foreground border-2 border-border hover:border-foreground',
        ghost: 'hover:bg-background-secondary active:bg-background-tertiary text-foreground',
      },
      sizes: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
    card: {
      base: 'bg-background rounded-xl shadow-md border border-border',
      variants: {
        DEFAULT: 'p-6',
        compact: 'p-4',
        interactive: 'hover:border-foreground transition-colors duration-200 cursor-pointer',
      },
    },
    input: {
      base: 'rounded-lg border border-border focus:border-foreground focus:ring-2 focus:ring-foreground/10 transition-all duration-200',
      variants: {
        DEFAULT: 'px-4 py-2',
        large: 'px-6 py-3 text-lg',
      },
    },
  },
} 