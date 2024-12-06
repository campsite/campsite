import type { Meta, StoryObj } from '@storybook/react'

import { HoverCard } from '.'
import { Button } from '../Button'

const HoverCardTemplate = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <HoverCard>
    <HoverCard.Trigger asChild>
      <Button fullWidth variant='plain' align='left'>
        {title}
      </Button>
    </HoverCard.Trigger>
    <HoverCard.Content>
      <HoverCard.Content.TitleBar>
        <p>{title}</p>
      </HoverCard.Content.TitleBar>
      {children ? children : <div className='h-[300px]'></div>}
    </HoverCard.Content>
  </HoverCard>
)

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    controls: {
      include: ['side', 'align', 'sideOffset', 'alignOffset', 'disabled']
    }
  }
} satisfies Meta<typeof HoverCard>

export default meta

type Story = StoryObj<typeof HoverCard>

export const Basic: Story = {
  render: (props) => <HoverCardTemplate title='Inbox' {...props} />
}

export const Multiple: Story = {
  render: (props) => (
    <div className='flex w-[120px] flex-col gap-2'>
      <HoverCardTemplate title='Inbox' {...props} />
      <HoverCardTemplate title='Calls' {...props} />
      <HoverCardTemplate title='Chats' {...props} />
    </div>
  )
}
