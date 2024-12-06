import type { Meta, StoryObj } from '@storybook/react'

import { FileAttachment } from '.'

const meta: Meta<typeof FileAttachment> = {
  title: 'Components/FileAttachment',
  component: FileAttachment,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div className='w-screen max-w-[400px]'>
        <Story />
      </div>
    )
  ]
}

export default meta

type Story = StoryObj<typeof FileAttachment>

export const PDF: Story = {
  args: {
    attachment: {
      name: 'Campground Guide.pdf',
      file_type: 'application/pdf',
      download_url: 'https://example.com/file.pdf',
      origami: false,
      principle: false,
      stitch: false
    }
  }
}

export const Origami: Story = {
  args: {
    attachment: {
      name: 'file.pdf',
      file_type: 'application/pdf',
      download_url: 'https://example.com/file.pdf',
      origami: true,
      principle: false,
      stitch: false
    }
  }
}

export const Principle: Story = {
  args: {
    attachment: {
      name: 'file.pdf',
      file_type: 'application/pdf',
      download_url: 'https://example.com/file.pdf',
      origami: false,
      principle: true,
      stitch: false
    }
  }
}

export const Stitch: Story = {
  args: {
    attachment: {
      name: 'file.pdf',
      file_type: 'application/pdf',
      download_url: 'https://example.com/file.pdf',
      origami: false,
      principle: false,
      stitch: true
    }
  }
}

export const Code: Story = {
  args: {
    attachment: {
      name: 'storybook.ts',
      file_type: 'application/typescript',
      download_url: 'https://example.com/storybook.ts',
      origami: false,
      principle: false,
      stitch: false
    }
  }
}

export const Other: Story = {
  args: {
    attachment: {
      name: 'campsite.design',
      file_type: 'application/design',
      download_url: 'https://campsite.design',
      origami: false,
      principle: false,
      stitch: false
    }
  }
}
