/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base:       "var(--bg)",
        ink:        "var(--text)",
        muted:      "var(--text-muted)",
        "accent-neg":     "var(--accent-negative)",
        "accent-warn":    "var(--accent-warning)",
        "accent-pos":     "var(--accent-positive)",
        "accent-neutral": "var(--accent-neutral)",
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI',
               'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
