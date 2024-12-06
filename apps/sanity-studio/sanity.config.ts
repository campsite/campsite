import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { markdownSchema } from 'sanity-plugin-markdown'
import { structureTool } from 'sanity/structure'

import { CustomMarkdownInput } from './CustomMarkdownInput'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Campsite',

  projectId: 'h9rjv9fi',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), markdownSchema({ input: CustomMarkdownInput })],

  schema: {
    types: schemaTypes
  }
})
