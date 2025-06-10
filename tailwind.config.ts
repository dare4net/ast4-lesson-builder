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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
  			sans: [duoTheme.typography.fontFamily],
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
  			"duo-bounce": {
  				"0%, 100%": { transform: "translateY(0)" },
  				"50%": { transform: "translateY(-10px)" },
  			},
  			"duo-shake": {
  				"0%, 100%": { transform: "translateX(0)" },
  				"25%": { transform: "translateX(-5px)" },
  				"75%": { transform: "translateX(5px)" },
  			},
  			"duo-pop": {
  				"0%": { transform: "scale(0.95)" },
  				"50%": { transform: "scale(1.05)" },
  				"100%": { transform: "scale(1)" },
  			},
  			"duo-float": {
  				"0%, 100%": { transform: "translateY(0)" },
  				"50%": { transform: "translateY(-5px)" },
  			},
  			"duo-pulse": {
  				"0%, 100%": { opacity: "1" },
  				"50%": { opacity: "0.5" },
  			},
  			"duo-celebrate": {
  				"0%": { transform: "scale(0.95) rotate(0deg)" },
  				"50%": { transform: "scale(1.05) rotate(5deg)" },
  				"100%": { transform: "scale(1) rotate(0deg)" },
  			},
  		},
  		animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
  			"duo-bounce": "duo-bounce 0.3s ease-in-out",
  			"duo-shake": "duo-shake 0.3s ease-in-out",
  			"duo-pop": "duo-pop 0.2s ease-out",
  			"duo-float": "duo-float 3s ease-in-out infinite",
  			"duo-pulse": "duo-pulse 2s ease-in-out infinite",
  			"duo-celebrate": "duo-celebrate 0.5s ease-out",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
