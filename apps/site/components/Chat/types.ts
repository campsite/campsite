export type Position = 'first' | 'middle' | 'last' | 'only'
interface MessageReply {
  content: string
  user: User
}

export interface MessageThread {
  id: string
  image_url: string
  group: boolean
  title: string
  other_members: User[]
  messages: Message[]
}

export interface Call {
  active: boolean
  duration: string
  peers: User[]
}

export interface GroupedReaction {
  emoji: string
  reactions_count: number
}

export interface Message {
  id: string
  call: Call | null
  content: string | null
  created_at: string
  viewer_is_sender: boolean
  attachments: string[]
  unfurled_link: string | null
  reply: MessageReply | null
  grouped_reactions: GroupedReaction[]
  user: User
}

export interface User {
  id: string
  display_name: string
  avatar_url: string
  system: boolean
  integration: boolean
}

export interface MessageGroup {
  viewer_is_sender: boolean
  user: User
  messages: Message[]
}
