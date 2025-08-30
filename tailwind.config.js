/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{njk,md,html}',
    './src/assets/js/**/*.{js,mjs}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#3B82F6',
        danger: '#EF4444',
        success: '#22C55E'
      },
      borderRadius: {
        lg: '8px'
      }
    }
  },
  plugins: []
};
