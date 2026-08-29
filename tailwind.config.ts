import type { Config } from "tailwindcss";
import { duoTheme } from "./lib/duo-theme";

const config: Config = {
    darkMode: ["class"],
    content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
          tertiary: "hsl(var(--background-tertiary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          tertiary: "hsl(var(--foreground-tertiary))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
          active: "hsl(var(--secondary-active))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
  		},
  		borderRadius: {
  			lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
  			small: duoTheme.borderRadius.small,
  			medium: duoTheme.borderRadius.medium,
  			large: duoTheme.borderRadius.large,
  			full: duoTheme.borderRadius.full,
  		},
  		fontFamily: {
  			sans: ["var(--font-sans, ui-sans-serif)", "system-ui", "sans-serif"],
  			heading: ["var(--font-heading, var(--font-sans, ui-sans-serif))", "system-ui", "sans-serif"],
  		},
  		fontSize: duoTheme.typography.fontSizes,
  		fontWeight: duoTheme.typography.fontWeights,
  		lineHeight: duoTheme.typography.lineHeights,
  		boxShadow: {
  			sm: duoTheme.shadows.sm,
  			md: duoTheme.shadows.md,
  			lg: duoTheme.shadows.lg,
  			xl: duoTheme.shadows.xl,
  		},
  		keyframes: {
  			"accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
  		},
  		animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")], // eslint-disable-line @typescript-eslint/no-require-imports -- Tailwind CJS plugins; ticket G-04
};
export default config;
