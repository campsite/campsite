const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

function spacing() {
  const scale = Array(121)
    .fill(null)
    .map((_, i) => [i * 0.5, `${i * 0.5 * 4}px`])
  const values = Object.fromEntries(scale)

  values.px = '1px'
  values.sm = '2px'
  return values
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true
  },
  darkMode: 'class',
  content: [
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    'bg-highlight' // added on the backend and doesn't appear on the client
  ],
  theme: {
    spacing: spacing(),
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans]
      },
      data: {
        highlighted: 'highlighted=true'
      },
      height: {
        screen: '100dvh'
      },
      screens: {
        xs: '430px', // iphone max width
        '3xl': '1792px',
        '4xl': '2048px'
      },
      colors: {
        neutral: {
          150: '#F0F0F0'
        },
        gray: {
          50: '#FCFCFC',
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
          900: '#171717',
          950: '#0D0D0D'
        },
        primary: 'var(--bg-primary)',
        highlight: 'var(--bg-highlight)',
        brand: {
          primary: '#FF591E',
          secondary: '#FB432C'
        }
      },
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
        elevated: 'var(--bg-elevated)'
      },
      borderWidth: {
        DEFAULT: '0.5px',
        1: '1px'
      },
      borderColor: {
        DEFAULT: 'var(--border-primary)',
        primary: 'var(--border-primary)',
        'primary-opaque': 'var(--border-primary-opaque)',
        secondary: 'var(--border-secondary)',
        'secondary-opaque': 'var(--border-secondary-opaque)',
        tertiary: 'var(--border-tertiary)'
      },
      textColor: {
        light: 'var(--text-light)',
        dark: 'var(--text-dark)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        quaternary: 'var(--text-quaternary)',
        'primary-action': 'var(--text-primary-action)',
        'secondary-action': 'var(--text-secondary-action)'
      },
      transitionDuration: {
        DEFAULT: '100ms'
      },
      boxShadow: {
        DEFAULT: `
          0px 3px 6px -3px var(--base-shadow-color, --tw-shadow-color),
          0px 2px 4px -2px var(--base-shadow-color, --tw-shadow-color),
          0px 1px 2px -1px var(--base-shadow-color, --tw-shadow-color),
          0px 1px 1px -1px var(--base-shadow-color, --tw-shadow-color),
          0px 1px 0px -1px var(--base-shadow-color, --tw-shadow-color)
        `,
        button: 'var(--button-shadow)',
        popover: 'var(--popover-shadow)',
        'dropdown-item': 'var(--dropdown-item-shadow)',
        'button-base': 'var(--button-base-shadow)',
        'button-primary': 'var(--button-primary-shadow)',
        'inset-image-border': 'inset 0px 0px 0px 1px var(--border-primary)',
        'select-item':
          'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), inset 0px 1px 0px rgb(255 255 255 / 0.02), inset 0px 0px 0px 1px rgb(255 255 255 / 0.02), 0px 1px 2px rgb(0 0 0 / 0.12), 0px 2px 4px rgb(0 0 0 / 0.08), 0px 0px 0px 0.5px rgb(0 0 0 / 0.24);'
      },
      boxShadowColor: {
        DEFAULT: 'var(--base-shadow-color)'
      },
      animation: {
        shake: 'shake infinite',
        'shake-alt': 'shake-alt infinite alternate',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-fade': 'scale-fade 0.15s ease-in-out',
        backdrop: 'fade 0.15s ease-in-out',
        dialog: 'slide-up-scale-fade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 100ms ease-out',
        'fade-out': 'fade-out 75ms ease-in',
        'hero-overlay-fade-in': 'fade-in 250ms ease',
        'hero-overlay-fade-out': 'fade-out 250ms ease',
        'hero-content-slide-up': 'hero-slide-up 250ms ease',
        'hero-content-slide-down': 'hero-slide-up 250ms ease',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      keyframes: {
        shake: {
          '0%': {
            transform: 'rotate(-2deg)',
            animationTimingFunction: 'ease-in'
          },
          '50%': {
            transform: 'rotate(2.5deg)',
            animationTimingFunction: 'ease-out'
          },
          '100%': {
            transform: 'rotate(-2deg)',
            animationTimingFunction: 'ease-in'
          }
        },
        'shake-alt': {
          '0%': {
            transform: 'rotate(2deg)',
            animationTimingFunction: 'ease-in'
          },
          '50%': {
            transform: 'rotate(-2.5deg)',
            animationTimingFunction: 'ease-out'
          },
          '100%': {
            transform: 'rotate(2deg)',
            animationTimingFunction: 'ease-in'
          }
        },
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'slide-up-fade': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'scale-fade': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        'slide-up-scale-fade': {
          '0%': { opacity: 0, transform: 'scale(0.98) translateY(20px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        'hero-slide-up': {
          '0%': {
            opacity: 0,
            transform: 'translate(-50%, -49%) scale(0.95)'
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%, -50%)'
          }
        },
        'hero-slide-down': {
          '0%': {
            opacity: 1,
            transform: 'translate(-50%, -50%)'
          },
          '100%': {
            opacity: 0,
            transform: 'translate(-50%, -49%) scale(0.95)'
          }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      scale: {
        flip: '-1'
      },
      typography: {
        DEFAULT: {
          css: {
            fontSize: '0.9375rem' // 15px
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar-hide'),
    require('tailwindcss-safe-area'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate'),
    plugin(function ({ addVariant, addBase }) {
      addVariant('initial', 'html :where(&)')
      addBase({
        '.border, .border-x, .border-y, .border-t, .border-r, .border-b, .border-l': {
          backgroundClip: 'padding-box'
        },
        "[class^='divide-'] > :not([hidden]) ~ :not([hidden]), [class*=' divide-'] > :not([hidden]) ~ :not([hidden])": {
          borderColor: 'var(--border-primary)'
        }
      })
    })
  ]
}
