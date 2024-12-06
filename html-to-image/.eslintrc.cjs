module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: ['eslint:recommended'],
  plugins: ['simple-import-sort', 'prettier', 'unused-imports'],
  ignorePatterns: ['node_modules/'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prettier/prettier': ['error'],
    'no-irregular-whitespace': 'error',
    'no-empty-function': 'error',
    'no-duplicate-imports': 'error',
    'newline-after-var': 'error',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error'
  }
}
