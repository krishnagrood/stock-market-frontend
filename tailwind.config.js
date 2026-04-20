/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#c5c7c5",
        "on-primary-fixed-variant": "#005227",
        "inverse-surface": "#e2e3e0",
        "on-secondary-fixed-variant": "#444746",
        "tertiary-container": "#ffb0a8",
        "on-tertiary-fixed-variant": "#93000c",
        "on-tertiary-fixed": "#410002",
        "error-container": "#93000a",
        "primary-container": "#4ade80",
        "tertiary-fixed": "#ffdad6",
        "on-primary-container": "#005e2d",
        "primary-fixed-dim": "#4de082",
        "on-primary": "#003919",
        "on-surface": "#e2e3e0",
        "surface-container-highest": "#333534",
        "surface-bright": "#373a38",
        "on-background": "#e2e3e0",
        "surface-dim": "#111413",
        "surface-container": "#1d201f",
        "inverse-on-surface": "#2e312f",
        "surface-variant": "#333534",
        "inverse-primary": "#006d36",
        "tertiary": "#ffd7d2",
        "error": "#ffb4ab",
        "on-surface-variant": "#bccabb",
        "primary-fixed": "#6dfe9c",
        "on-tertiary-container": "#a60010",
        "secondary": "#c5c7c5",
        "secondary-container": "#444746",
        "outline-variant": "#3d4a3e",
        "surface-container-lowest": "#0c0f0d",
        "on-error": "#690005",
        "on-tertiary": "#690006",
        "background": "#111413",
        "on-error-container": "#ffdad6",
        "primary": "#6CB33E",
        "secondary-fixed": "#e1e3e1",
        "on-secondary-container": "#b3b6b4",
        "surface": "#111413",
        "surface-container-high": "#282b29",
        "tertiary-fixed-dim": "#ffb4ab",
        "on-secondary": "#2e3130",
        "surface-container-low": "#191c1b",
        "on-primary-fixed": "#00210c",
        "outline": "#869486",
        "on-secondary-fixed": "#191c1b",
        "surface-tint": "#4de082"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Space Grotesk"],
        "body": ["Inter"],
        "label": ["Inter"],
        "montserrat": ["Montserrat"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}