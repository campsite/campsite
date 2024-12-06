import { Message, MessageThread } from './types'

export const ryan = {
  id: '1',
  display_name: 'Ryan Nystrom',
  avatar_url: '/img/team/ryan.jpg',
  system: false,
  integration: false
}

export const brian = {
  id: '2',
  display_name: 'Brian Lovin',
  avatar_url: '/img/team/brian.jpeg',
  system: false,
  integration: false
}

export const dan = {
  id: '3',
  display_name: 'Dan Philibin',
  avatar_url: '/img/team/dan.jpg',
  system: false,
  integration: false
}

export const alexandru = {
  id: '4',
  display_name: 'Alexandru Ţurcanu',
  avatar_url: '/img/team/alexandru.png',
  system: false,
  integration: false
}

export const nick = {
  id: '5',
  display_name: 'Nick Holden',
  avatar_url: '/img/team/nick.jpeg',
  system: false,
  integration: false
}

export const zapier = {
  id: '6',
  display_name: 'Zapier',
  avatar_url: '/img/team/zapier.png',
  system: false,
  integration: true
}

const activeDMCall = {
  active: true,
  duration: '16m 32s',
  peers: [ryan, nick, dan, alexandru]
}

const groupMessages = [
  {
    id: '0.4',
    call: null,
    content: 'Morning! Everything going okay this morning with copywriting?',
    created_at: '2024-08-01T16:00:00Z',
    viewer_is_sender: false,
    attachments: [],
    unfurled_link: null,
    reply: null,
    user: ryan,
    grouped_reactions: []
  },
  {
    id: '0.5',
    call: null,
    content:
      'So far so good. I’m having fun playing with "Full-stack team communication" for the tagline — how does that feel?',
    created_at: '2024-08-01T16:00:00Z',
    viewer_is_sender: true,
    attachments: [],
    unfurled_link: null,
    reply: {
      content: 'Morning! Everything going okay this morning with copywriting?',
      user: ryan
    },
    user: brian,
    grouped_reactions: []
  },

  {
    id: '0.7',
    call: null,
    content: 'Should we all jam on this together for a bit?',
    created_at: '2024-08-01T16:00:00Z',
    viewer_is_sender: false,
    attachments: [],
    unfurled_link: null,
    reply: null,
    user: alexandru,
    grouped_reactions: [
      {
        emoji: '👍',
        reactions_count: 2
      }
    ]
  },
  {
    id: '0.8',
    call: activeDMCall,
    content: null,
    created_at: '2024-08-01T16:00:00Z',
    viewer_is_sender: false,
    attachments: [],
    unfurled_link: null,
    reply: null,
    user: ryan,
    grouped_reactions: []
  }
] as Message[]

const groupThread = {
  id: 'group',
  image_url: '/img/home/coffee-talk.png',
  group: true,
  title: 'Espresso and chill',
  other_members: [ryan, brian, dan, nick, alexandru],
  messages: groupMessages
} as MessageThread

export const messageThreads = {
  group: groupThread
} as Record<string, MessageThread>
