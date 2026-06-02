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
        "surface-variant": "#e0e2e8",
        "on-secondary": "#ffffff",
        "primary": "#006193",
        "primary-fixed": "#cce5ff",
        "tertiary-fixed": "#cce5ff",
        "on-tertiary": "#ffffff",
        "on-background": "#181c20",
        "surface-tint": "#006497",
        "on-secondary-fixed-variant": "#154b6d",
        "on-primary-fixed": "#001e31",
        "secondary-fixed-dim": "#9dcbf4",
        "surface": "#f7f9ff",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#92ccff",
        "secondary": "#326286",
        "on-tertiary-fixed-variant": "#004b73",
        "outline-variant": "#c0c7d1",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#f7f9ff",
        "primary-fixed-dim": "#92ccff",
        "on-error-container": "#93000a",
        "on-primary-container": "#fdfcff",
        "secondary-fixed": "#cce5ff",
        "surface-container": "#eceef3",
        "secondary-container": "#a5d4fd",
        "surface-container-highest": "#e0e2e8",
        "inverse-on-surface": "#eff1f6",
        "primary-container": "#207ab3",
        "surface-dim": "#d8dadf",
        "background": "#f7f9ff",
        "surface-container-high": "#e6e8ee",
        "tertiary": "#006194",
        "on-secondary-fixed": "#001e31",
        "on-secondary-container": "#2b5c80",
        "on-tertiary-fixed": "#001d31",
        "inverse-primary": "#92ccff",
        "error": "#ba1a1a",
        "on-primary": "#ffffff",
        "tertiary-container": "#007bb9",
        "on-surface-variant": "#40484f",
        "on-tertiary-container": "#fdfcff",
        "inverse-surface": "#2d3135",
        "on-surface": "#181c20",
        "surface-container-low": "#f2f3f9",
        "error-container": "#ffdad6",
        "on-primary-fixed-variant": "#004b73",
        "outline": "#707880"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "header_height": "70px",
        "button_padding_y": "8px",
        "card_gap": "20px",
        "sidebar_width": "260px",
        "lateral_padding": "24px",
        "button_padding_x": "16px"
      },
      fontFamily: {
        "body": ["Manrope", "sans-serif"],
        "title": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"],
        "subtitle": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "body": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "title": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
        "label": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "subtitle": ["18px", { "lineHeight": "26px", "fontWeight": "600" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
