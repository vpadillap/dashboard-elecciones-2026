/* ============================================================================
   Editorial Data System — Tailwind Preset (portable)
   ----------------------------------------------------------------------------
   Pairs with design-system.css. Import design-system.css once at your entry
   point (it defines the CSS custom properties), then extend your Tailwind
   config with this preset so the semantic names resolve to those variables:

     // tailwind.config.js
     import editorialDataSystem from './design-system/tailwind.preset.js'
     export default {
       presets: [editorialDataSystem],
       content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
     }

   Use semantic class names everywhere (bg-base, text-ink, border-muted,
   text-accent-neutral, …) — never raw hex.
   ========================================================================== */

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        base:    'var(--bg)',
        surface: 'var(--surface)',
        ink:     'var(--text)',
        muted:   'var(--text-muted)',

        'accent-neg':     'var(--accent-negative)',
        'accent-warn':    'var(--accent-warning)',
        'accent-pos':     'var(--accent-positive)',
        'accent-neutral': 'var(--accent-neutral)',
      },

      // Ink-alpha tints for overlays, gridlines, scrims, subtle fills.
      // Exposed under the `tint` key so you can use bg-tint-12, etc.,
      // and also wired into Tailwind's own ink/<n> opacity utilities.
      backgroundColor: {
        'tint-04': 'var(--tint-04)',
        'tint-05': 'var(--tint-05)',
        'tint-06': 'var(--tint-06)',
        'tint-12': 'var(--tint-12)',
        'tint-25': 'var(--tint-25)',
        'tint-50': 'var(--tint-50)',
      },

      fontFamily: {
        sans: [
          'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI',
          'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },

      borderRadius: {
        DEFAULT: '0.25rem',   // controls, chips, focus targets
        md:      '0.375rem',  // tooltips, small surfaces
        '2xl':   '1rem',      // modals, large panels
        full:    '9999px',    // icon buttons, status dots
      },

      transitionDuration: {
        fast: '80ms',         // state-only transitions
      },

      boxShadow: {
        // The only sanctioned shadows — for elements that genuinely float.
        floating: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        modal:    '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      },

      ringColor: {
        // Universal focus ring color.
        DEFAULT: 'var(--accent-neutral)',
      },
    },
  },
  plugins: [],
}
