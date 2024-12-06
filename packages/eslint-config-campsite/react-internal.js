/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    require.resolve('./rules/no-restricted-imports')
  ],
  globals: {
    React: 'writable'
  },
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/']
    },
    react: {
      version: 'detect'
    }
  },
  rules: {
    'no-console': 'error',
    'react/no-array-index-key': 'error',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'error'
  },
  overrides: [
    {
      files: ['**/*.stories.tsx'],
      rules: {
        'react-hooks/rules-of-hooks': 'off'
      }
    }
  ]
}
