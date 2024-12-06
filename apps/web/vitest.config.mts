import path from 'path'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'playwright/**'],
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
})
