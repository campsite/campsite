const config = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'framer-motion',
            importNames: ['useInView'],
            message: "Please import it from 'react-intersection-observer' instead."
          }
        ]
      }
    ]
  }
}

module.exports = config
