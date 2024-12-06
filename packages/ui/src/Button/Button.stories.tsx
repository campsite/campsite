import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      controls: {
        // optionally enable a subset of controls
        // include: ['children', 'align', 'variant', 'loading', 'disabled', 'tooltip']
      }
    }
  }
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof Button>

export const Basic: Story = {
  args: {
    children: 'Create post'
  }
}
