module.exports = ({ env }) => ({
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: './tailwind.mailer.config.js'
    },
    autoprefixer: {},
    'postcss-custom-properties': {
      preserve: false,
      postcssInsertData: ['app/assets/stylesheets/mailer.css']
    }
  }
})
