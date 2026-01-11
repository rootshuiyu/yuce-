/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暗紫黑主题
        'dark-bg': '#0f0a1a',
        'dark-surface': '#1a1428',
        'dark-card': '#2a1f3d',
        'dark-border': '#3d2f52',
        'purple-primary': '#a78bfa',
        'purple-light': '#c4b5fd',
        'purple-dark': '#7c3aed',
      },
    },
  },
  plugins: [],
}
