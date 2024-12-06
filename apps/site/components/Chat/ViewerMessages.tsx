import { Bubble } from './Bubble'
import { Message, MessageThread } from './types'

export function ViewerMessages({ messages, thread }: { messages: Message[]; thread: MessageThread }) {
  return (
    <div className='m-0 flex w-full flex-col self-end p-0'>
      {messages.map((message) => {
        const position =
          messages.length === 1
            ? 'only'
            : message.id === messages[0].id
              ? 'first'
              : message.id === messages[messages.length - 1].id
                ? 'last'
                : 'middle'

        return <Bubble thread={thread} key={message.id} message={message} position={position} />
      })}
    </div>
  )
}
