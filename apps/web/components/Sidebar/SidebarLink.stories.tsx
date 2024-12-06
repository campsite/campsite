import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { noop } from 'remeda'

import { SidebarUnreadBadge } from '@/components/Sidebar/SidebarUnreadBadge'

import { iconForFavoritableType } from './SidebarFavorite'
import { SidebarLink } from './SidebarLink'

function Template({ children }: React.PropsWithChildren) {
  return <div className='w-53 flex flex-col flex-nowrap'>{children}</div>
}

const meta = {
  title: 'Components/Sidebar/SidebarLink',
  component: SidebarLink
} satisfies Meta<typeof SidebarLink>

export default meta

type Story = StoryObj<typeof SidebarLink>

export const Link: Story = {
  render: () => (
    <Template>
      <SidebarLink id='0' label='Link' href='/' />
      <SidebarLink id='0' label='Active Link' href='/' active />
      <SidebarLink
        id='0'
        label='Link'
        href='/'
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink
        id='0'
        label='Active Link'
        href='/'
        active
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink id='0' label='Link' href='/' onRemove={noop} />
      <SidebarLink id='0' label='Active Link' href='/' active onRemove={noop} />
      <SidebarLink id='0' label='Remove with overflowing container' href='/' />
      <SidebarLink id='0' label='Remove with overflowing container' href='/' onRemove={noop} />
    </Template>
  )
}

export const Button: Story = {
  render: () => (
    <Template>
      <SidebarLink id='0' label='Button' />
      <SidebarLink id='0' label='Active Button' active />
      <SidebarLink
        id='0'
        label='Button'
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink
        id='0'
        label='Active Button'
        active
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink id='0' label='Button' onRemove={noop} />
      <SidebarLink id='0' label='Active Button' active onRemove={noop} />
      <SidebarLink id='0' label='Remove with overflowing container' />
      <SidebarLink id='0' label='Remove with overflowing container' onRemove={noop} />
    </Template>
  )
}

export const LinkLeadingAccesory: Story = {
  render: () => (
    <Template>
      <SidebarLink id='0' label='Link' href='/' leadingAccessory={iconForFavoritableType('Note')} />
      <SidebarLink id='0' label='Active Link' href='/' leadingAccessory={iconForFavoritableType('Note')} active />
      <SidebarLink
        id='0'
        label='Link'
        href='/'
        leadingAccessory={iconForFavoritableType('Note')}
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink
        id='0'
        label='Active Link'
        href='/'
        leadingAccessory={iconForFavoritableType('Note')}
        active
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink id='0' label='Link' href='/' leadingAccessory={iconForFavoritableType('Note')} onRemove={noop} />
      <SidebarLink
        id='0'
        label='Active Link'
        href='/'
        leadingAccessory={iconForFavoritableType('Note')}
        active
        onRemove={noop}
      />
      <SidebarLink
        id='0'
        label='Remove with overflowing container'
        href='/'
        leadingAccessory={iconForFavoritableType('Note')}
      />
      <SidebarLink
        id='0'
        label='Remove with overflowing container'
        href='/'
        leadingAccessory={iconForFavoritableType('Note')}
        onRemove={noop}
      />
    </Template>
  )
}

export const ButtonLeadingAccesory: Story = {
  render: () => (
    <Template>
      <SidebarLink id='0' label='Button' leadingAccessory={iconForFavoritableType('Note')} />
      <SidebarLink id='0' label='Active Button' leadingAccessory={iconForFavoritableType('Note')} active />
      <SidebarLink
        id='0'
        label='Button'
        leadingAccessory={iconForFavoritableType('Note')}
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink
        id='0'
        label='Active Button'
        leadingAccessory={iconForFavoritableType('Note')}
        active
        trailingAccessory={<SidebarUnreadBadge important={false}>5</SidebarUnreadBadge>}
      />
      <SidebarLink id='0' label='Button' leadingAccessory={iconForFavoritableType('Note')} onRemove={noop} />
      <SidebarLink
        id='0'
        label='Active Button'
        leadingAccessory={iconForFavoritableType('Note')}
        active
        onRemove={noop}
      />
      <SidebarLink id='0' label='Remove with overflowing container' leadingAccessory={iconForFavoritableType('Note')} />
      <SidebarLink
        id='0'
        label='Remove with overflowing container'
        leadingAccessory={iconForFavoritableType('Note')}
        onRemove={noop}
      />
    </Template>
  )
}
