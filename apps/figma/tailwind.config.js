import defaultConfig from '@campsite/ui/tailwind.config'

/** @type {import('tailwindcss').Config} */
const config = {
  ...defaultConfig,
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/**/*.{ts,tsx}'],
  darkMode: ['class', '.figma-dark']
}

export default config
