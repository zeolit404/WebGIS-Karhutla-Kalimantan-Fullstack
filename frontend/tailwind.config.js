/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        karhutla: {
          navy: '#0f172a',
          red: '#dc2626',
          orange: '#ea580c',
          amber: '#d97706',
          emerald: '#059669',
          cyan: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
