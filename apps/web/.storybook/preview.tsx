// these must match the CSS imports in _app.tsx
import 'styles/editor.css'
import 'styles/global.css'
import 'styles/prose.css'
import '../../../packages/ui/src/styles/global.css'
import '../../../packages/ui/src/styles/code.css'

import { Preview } from '@storybook/react'
import { StorybookParameters } from '@storybook/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '../components/Providers/ThemeProvider'
import { ScopeProvider } from '../contexts/scope'

const client = new QueryClient({})

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <ScopeProvider>
            <Story />
          </ScopeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  ]
}

export default preview

export const parameters: StorybookParameters = {
  layout: 'centered'
}
