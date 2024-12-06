module.exports = {
  content: [
    'app/views/layouts/mailer.html.erb',
    'app/views/mailers/*.erb',
    'app/views/mailers/**/*.erb',
    // this file transforms HTML for display in services (mail, slack, thumbnails) and contains Tailwind classes
    './lib/rich_text.rb'
  ],
  darkMode: 'class',
  safelist: [
    {
      pattern: /^my-/
    },
    {
      pattern: /^py-/
    },
    {
      pattern: /^mx-/
    },
    {
      pattern: /^px-/
    },
    {
      pattern: /^m-/
    },
    {
      pattern: /^p-/
    }
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          150: '#F0F0F0'
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          150: '#F0F0F0',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          750: '#313131',
          800: '#262626',
          850: '#1E1E1E',
          900: '#171717'
        }
      },
      backgroundColor: {
        primary: '#ffffff',
        secondary: 'theme("colors.gray.100")',
        tertiary: 'theme("colors.gray.50")',
        quaternary: 'theme("colors.gray.150")',
        elevated: 'theme("colors.white")'
      },
      borderColor: {
        primary: 'theme("colors.gray.150")'
      },
      textColor: {
        primary: 'theme("colors.gray.800")',
        secondary: 'theme("colors.gray.500")',
        tertiary: 'theme("colors.gray.100")',
        quaternary: 'theme("colors.gray.400")',
        link: 'theme("colors.blue.500")'
      },
      fontFamily: {
        author: [
          'Author-Variable',
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
  corePlugins: {
    animation: false,
    ringShadow: false,
    ringInset: false,
    boxShadow: false,
    boxSizing: false,
    scrollSnapType: false,
    touchAction: false,
    borderSpacing: false,
    transform: false,
    ringWidth: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropFilter: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    fontVariantNumeric: false,
    filter: false,
    backdropOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    ringOpacity: false,
    textOpacity: false
  },
  plugins: []
}
