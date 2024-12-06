import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../Button'
import { Dialog } from './Dialog'

const meta = {
  title: 'UI/Dialog',
  component: Dialog.Root,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Dialog.Root>

export default meta

type Story = StoryObj<typeof Dialog.Root>

export const Basic: Story = {
  render: (props) => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Trigger</Button>
        <Dialog.Root {...props} open={open} onOpenChange={setOpen}>
          <Dialog.Header>
            <Dialog.Title>Lorem Ipsum</Dialog.Title>
            <Dialog.Description>
              Non enim laborum cupidatat nisi tempor. Pariatur duis commodo veniam esse dolore excepteur.
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Footer>
            <Dialog.TrailingActions>
              <Button variant='flat' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </Dialog.TrailingActions>
          </Dialog.Footer>
        </Dialog.Root>
      </>
    )
  }
}
