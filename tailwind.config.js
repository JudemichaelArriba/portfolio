/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Instrument Sans', 'sans-serif'],
      },
      colors: {
        blue: {
          main: '#2563eb',
          dark: '#1d4ed8',
          deep: '#1e3a8a',
          light: '#3b82f6',
          glow: '#60a5fa',
        },
        teal: { DEFAULT: '#14b8a6' },
        ink: { DEFAULT: '#04040e', soft: '#080c1a' },
      },
      transitionDuration: {
        400: '400ms',
      },
      animation: {
        'pulse-dot': 'pulsedot 2s ease-in-out infinite',
        'dot-glow': 'dotGlow 2s ease-in-out infinite',
        'bar-grow': 'barGrow 1.4s cubic-bezier(.16,1,.3,1) both',
        learning: 'lpulse 2.5s ease-in-out infinite',
        'orb-a': 'orbA 24s ease-in-out infinite',
        'orb-b': 'orbB 30s ease-in-out infinite',
        'orb-c': 'orbC 20s ease-in-out infinite',
        ticker: 'tickerScroll 32s linear infinite',
        'fade-up-1': 'fadeUp .7s ease .08s both',
        'fade-up-2': 'fadeUp .7s ease .18s both',
        'fade-up-3': 'fadeUp .7s ease .28s both',
        'fade-up-4': 'fadeUp .7s ease .38s both',
        'fade-up-5': 'fadeUp .7s ease .48s both',
        'fade-up-6': 'fadeUp .7s ease .56s both',
        'fade-up-r': 'fadeUp .9s ease .38s both',
      },
      keyframes: {
        pulsedot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.3', transform: 'scale(.65)' },
        },
        dotGlow: {
          '0%,100%': { boxShadow: '0 0 0 2px #14b8a6, 0 0 14px rgba(20,184,166,.4)' },
          '50%': { boxShadow: '0 0 0 4px #14b8a6, 0 0 26px rgba(20,184,166,.65)' },
        },
        barGrow: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        lpulse: {
          '0%,100%': { opacity: '.75' },
          '50%': { opacity: '1' },
        },
        orbA: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '40%': { transform: 'translate(-55px,70px) scale(1.07)' },
          '75%': { transform: 'translate(35px,-45px) scale(.95)' },
        },
        orbB: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '45%': { transform: 'translate(70px,-55px) scale(1.10)' },
          '80%': { transform: 'translate(-25px,40px) scale(.93)' },
        },
        orbC: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-70px,55px) scale(1.14)' },
        },
        tickerScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
};
