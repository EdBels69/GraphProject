/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: 'hsl(var(--void) / <alpha-value>)',
        space: 'hsl(var(--space) / <alpha-value>)',
        glass: 'hsl(var(--glass) / <alpha-value>)',

        // Accents
        acid: {
          DEFAULT: 'hsl(var(--acid) / <alpha-value>)',
          dim: 'hsl(var(--acid-dim) / <alpha-value>)',
          500: 'hsl(var(--acid) / <alpha-value>)'
        },
        plasma: {
          DEFAULT: 'hsl(var(--plasma) / <alpha-value>)',
          light: 'hsl(var(--plasma-light) / <alpha-value>)'
        },

        // Semantic
        steel: {
          DEFAULT: 'hsl(var(--steel) / <alpha-value>)',
          dim: 'hsl(var(--steel-dim) / <alpha-value>)'
        },
        ash: 'hsl(var(--ash) / <alpha-value>)'
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-acid': '0 4px 12px rgba(255, 102, 0, 0.12)', // Subtle orange elevation
        'glow-plasma': '0 4px 12px rgba(100, 80, 200, 0.08)', // Subtler elevation
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
