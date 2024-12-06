const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'turbo'],
  plugins: ['@typescript-eslint', 'unused-imports'],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: true },
  env: {
    es2022: true,
    node: true
  },
  rules: {
    'no-irregular-whitespace': 'error',
    'no-empty-function': 'error',
    'newline-after-var': 'error',
    'no-unused-vars': 'off',
    'no-fallthrough': ['error', { allowEmptyCase: true }],
    'no-extra-semi': 'off',
    'max-lines': ['error', 500],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  },
  overrides: [
    {
      files: ['**/__tests__/**/*'],
      env: {
        jest: true
      }
    },
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      rules: {
        'no-undef': 'off',
        'no-redeclare': 'off'
      }
    }
  ],
  ignorePatterns: ['.*.js', 'node_modules/', 'dist/']
}
