/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['next', 'next/core-web-vitals', require.resolve('./rules/no-restricted-imports')],
  plugins: ['@tanstack/query', 'react'],
  globals: {
    React: 'writable'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true
  },
  rules: {
    'no-console': 'error',
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/prefer-query-object-syntax': 'error',
    'react/no-array-index-key': 'error',
    'react-hooks/exhaustive-deps': 'error',
    /**
     * Use TypeScript instead of PropTypes.
     *
     * @see https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
     */
    'react/prop-types': 'off'
  }
}
