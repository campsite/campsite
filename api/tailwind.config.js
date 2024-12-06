const defaultTheme = require('tailwindcss/defaultTheme')

function spacing() {
  const scale = Array(101)
    .fill(null)
    .map((_, i) => [i * 0.5, `${i * 0.5 * 4}px`])
  const values = Object.fromEntries(scale)

  values.px = '1px'
  values.sm = '2px'
  return values
}

module.exports = {
  darkMode: 'media',
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js',
    // this file transforms HTML for display in services (mail, slack, thumbnails) and contains Tailwind classes
    './lib/rich_text.rb'
  ],
  theme: {
    spacing: spacing(),
    extend: {
      backgroundColor: {
        main: 'var(--bg-main)',
        'primary-action': 'var(--bg-primary-action)',
        'primary-action-hover': 'var(--bg-primary-action-hover)',
        'secondary-action': 'var(--bg-secondary-action)',
        'tertiary-action': 'var(--bg-tertiary-action)',
        button: 'var(--bg-button)',
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        quaternary: 'var(--bg-quaternary)',
        elevated: 'var(--bg-elevated)',
        reverse: 'var(--bg-reverse)'
      },
      borderColor: {
        primary: 'var(--border-primary)',
        secondary: 'var(--border-secondary)'
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        quaternary: 'var(--text-quaternary)',
        link: 'var(--text-link)'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        author: [
          'Author-Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ]
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
