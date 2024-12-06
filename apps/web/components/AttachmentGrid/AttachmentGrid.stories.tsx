import type { Meta, StoryObj } from '@storybook/react'

import { Avatar, UIText } from '@campsite/ui'

import { AttachmentGrid } from '.'
import {
  CAMPGROUND_SQUARE,
  CAMPGROUND_WIDE,
  DESERT_SQUARE,
  HIKING_VIDEO,
  LAKE_SQUARE,
  mockImageAttachment,
  mockVideoAttachment
} from './mockData'

const Template = ({ children }: { children: React.ReactNode }) => (
  <div className='flex w-screen max-w-[690px] items-start gap-3 p-[20px] antialiased'>
    <div className='flex-none'>
      <Avatar
        size='lg'
        src='https://campsite-dev.imgix.net/o/dev-seed-files/avatar-ranger-rick.png?fit=crop&h=80&w=80'
        name='Ranger Rick'
      />
    </div>
    <div className='flex-1'>
      <div className='text-tertiary mb-1 flex items-center justify-start gap-1 text-[15px]'>
        <UIText weight='font-medium' className='text-primary text-[15px]'>
          Ranger Rick
        </UIText>
        <span>in</span>
        <UIText element='span' className='translate-y-px font-["emoji"] text-[13px]' inherit>
          🍕
        </UIText>
        <UIText weight='font-medium' className='text-primary text-[15px]'>
          Staff Lounge
        </UIText>
      </div>
      <div className='prose text-primary mb-5'>
        <p>
          Just got back from the morning patrol on Redwood Trail. The recent rains have left some patches muddy,
          especially near the creek crossings. Hikers should be advised to wear appropriate footwear and expect slower
          paces. The overhead canopy offers some shelter, but sporadic drizzle is still coming through in places. No
          major obstructions or downed trees to report. Visibility is good, and the trail markers are all intact.
        </p>
      </div>
      {children}
    </div>
  </div>
)

const meta = {
  title: 'Components/AttachmentGrid',
  component: AttachmentGrid,
  parameters: {
    controls: {
      include: ['side', 'align', 'sideOffset', 'alignOffset', 'disabled']
    }
  }
} satisfies Meta<typeof AttachmentGrid>

export default meta

type Story = StoryObj<typeof AttachmentGrid>

export const SingleImage: Story = {
  render: () => (
    <Template>
      <AttachmentGrid postId='1' attachments={[mockImageAttachment({ url: CAMPGROUND_SQUARE })]} />
    </Template>
  )
}

export const TwoImages: Story = {
  render: () => (
    <Template>
      <AttachmentGrid
        postId='1'
        attachments={[mockImageAttachment({ url: CAMPGROUND_SQUARE }), mockImageAttachment({ url: CAMPGROUND_WIDE })]}
      />
    </Template>
  )
}

export const ThreeImages: Story = {
  render: () => (
    <Template>
      <AttachmentGrid
        postId='1'
        attachments={[
          mockImageAttachment({ url: CAMPGROUND_SQUARE }),
          mockImageAttachment({ url: CAMPGROUND_WIDE }),
          mockImageAttachment({ url: DESERT_SQUARE })
        ]}
      />
    </Template>
  )
}

export const FourImages: Story = {
  render: () => (
    <Template>
      <AttachmentGrid
        postId='1'
        attachments={[
          mockImageAttachment({ url: CAMPGROUND_SQUARE }),
          mockImageAttachment({ url: CAMPGROUND_WIDE }),
          mockImageAttachment({ url: DESERT_SQUARE }),
          mockImageAttachment({ url: LAKE_SQUARE })
        ]}
      />
    </Template>
  )
}

export const FiveImages: Story = {
  render: () => (
    <Template>
      <AttachmentGrid
        postId='1'
        attachments={[
          mockImageAttachment({ url: CAMPGROUND_SQUARE }),
          mockImageAttachment({ url: CAMPGROUND_WIDE }),
          mockImageAttachment({ url: DESERT_SQUARE }),
          mockImageAttachment({ url: LAKE_SQUARE }),
          mockImageAttachment({ url: CAMPGROUND_WIDE })
        ]}
      />
    </Template>
  )
}

export const SingleVideo: Story = {
  render: () => (
    <Template>
      <AttachmentGrid postId='1' attachments={[mockVideoAttachment({ url: HIKING_VIDEO })]} />
    </Template>
  )
}

export const ImagesAndVideo: Story = {
  render: () => (
    <Template>
      <AttachmentGrid
        postId='1'
        attachments={[mockVideoAttachment({ url: HIKING_VIDEO }), mockImageAttachment({ url: LAKE_SQUARE })]}
      />
    </Template>
  )
}
