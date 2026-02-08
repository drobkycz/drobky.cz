/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F2',
        card: '#FFFFFF',
        text: '#1C2321',
        muted: '#5B6461',
        border: '#E7E2D6',
        accent: '#1F6B4E'
      },
      borderRadius: {
        card: '18px'
      },
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      maxWidth: {
        content: '1200px',
        prose: '720px'
      },
      boxShadow: {
        soft: '0 2px 12px rgba(28, 35, 33, 0.06)'
      }
    }
  },
  plugins: []
};
