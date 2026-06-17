/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        metro: {
          navy:    '#183C72',
          primary: '#506F9B',
          dark:    '#3A5275',
          accent:  '#FEB538',
          orange:  '#FF8C00',
          text:    '#3F3F3F',
          muted:   '#767676',
          bg:      '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
