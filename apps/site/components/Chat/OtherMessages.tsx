import { Bubble } from './Bubble'
import { MessageGroup, MessageThread } from './types'

export function OtherMessages({ group, thread }: { group: MessageGroup; thread: MessageThread }) {
  return (
    <div className='flex flex-col'>
      <div className='m-0 flex w-full flex-col self-start p-0'>
        {group.messages.map((message) => {
          const position =
            group.messages.length === 1
              ? 'only'
              : message.id === group.messages[0].id
                ? 'first'
                : message.id === group.messages[group.messages.length - 1].id
                  ? 'last'
                  : 'middle'

          return <Bubble thread={thread} key={message.id} message={message} position={position} />
        })}
      </div>
    </div>
  )
}
