import Link from 'next/link'

import {
  ArrowRightIcon,
  BoxIcon,
  ChatBubbleFilledIcon,
  CodeIcon,
  GridIcon,
  InboxIcon,
  NoteFilledIcon,
  PostFilledIcon,
  ProjectIcon,
  SearchIcon,
  UIText,
  VideoCameraFilledIcon
} from '@campsite/ui'

export function FeaturesHovercard({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <div className='bg-primary dark:border-primary grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border-[0.5px] shadow-md lg:grid-cols-3 dark:border-[0.5px]'>
      <div className='col-span-2 grid grid-cols-2 gap-2 p-2'>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/posts'
          className='bg-tertiary group/lm hover:bg-quaternary dark:bg-secondary dark:hover:bg-tertiary flex flex-col justify-end rounded-l-xl rounded-r p-3'
        >
          <PostFilledIcon size={32} className='-ml-1 mb-2' />
          <UIText size='text-base' weight='font-semibold'>
            Posts
          </UIText>
          <UIText tertiary>The ideal format for team communication</UIText>
          <div className='mt-3 flex items-center gap-1.5 self-start'>
            <UIText>Learn more</UIText>
            <ArrowRightIcon
              size={16}
              strokeWidth='2'
              className='relative translate-x-0 transition-all group-hover/lm:translate-x-1'
            />
          </div>
        </Link>
        <div className='flex flex-col gap-2'>
          <Link
            onClick={() => onOpenChange(false)}
            href='/features/calls'
            className='bg-tertiary text-secondary hover:text-primary dark:bg-secondary dark:hover:bg-tertiary group/link hover:bg-quaternary flex flex-1 flex-col justify-end rounded rounded-tr-xl p-3 lg:rounded-tr'
          >
            <VideoCameraFilledIcon size={24} className='-ml-0.5 mb-1 text-green-500' />
            <UIText weight='font-medium' inherit>
              Calls
            </UIText>
            <UIText tertiary>Record, summarize, share</UIText>
          </Link>
          <Link
            onClick={() => onOpenChange(false)}
            href='/features/dms'
            className='bg-tertiary text-secondary hover:text-primary dark:bg-secondary dark:hover:bg-tertiary group/link hover:bg-quaternary flex flex-1 flex-col justify-end rounded p-3'
          >
            <ChatBubbleFilledIcon size={24} className='-ml-0.5 mb-1 text-rose-500' />
            <UIText weight='font-medium' inherit>
              DMs
            </UIText>
            <UIText tertiary>For everything else</UIText>
          </Link>
          <Link
            onClick={() => onOpenChange(false)}
            href='/features/docs'
            className='bg-tertiary text-secondary hover:text-primary dark:bg-secondary dark:hover:bg-tertiary group/link hover:bg-quaternary flex flex-1 flex-col justify-end rounded p-3'
          >
            <NoteFilledIcon size={24} className='-ml-0.5 mb-1 text-blue-500' />
            <UIText weight='font-medium' inherit>
              Docs
            </UIText>
            <UIText tertiary>Multiplayer rich-text documents</UIText>
          </Link>
        </div>
      </div>
      <div className='col-span-2 flex flex-col gap-1 px-1.5 py-2 lg:col-span-1 lg:pl-0'>
        <UIText weight='font-medium' size='text-[11px]' quaternary className='mb-2 mt-3 px-2.5 uppercase tracking-wide'>
          More
        </UIText>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/channels'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary mt-auto flex items-center gap-2 rounded px-2 py-1.5'
        >
          <ProjectIcon />
          <UIText inherit>Channels</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/inbox'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary flex items-center gap-2 rounded px-2 py-1.5'
        >
          <InboxIcon />
          <UIText inherit>Inbox</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/search'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary flex items-center gap-2 rounded px-2 py-1.5'
        >
          <SearchIcon />
          <UIText inherit>Search</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/apps'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary flex items-center gap-2 rounded px-2 py-1.5'
        >
          <GridIcon />
          <UIText inherit>Apps</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/integrations'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary flex items-center gap-2 rounded px-2 py-1.5'
        >
          <BoxIcon />
          <UIText inherit>Integrations</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
        <Link
          onClick={() => onOpenChange(false)}
          href='/features/api'
          className='text-tertiary group/link hover:text-primary hover:bg-tertiary dark:hover:bg-secondary flex items-center gap-2 rounded rounded-bl-xl rounded-br-xl px-2 py-1.5 lg:rounded-bl'
        >
          <CodeIcon />
          <UIText inherit>API</UIText>
          <ArrowRightIcon
            size={16}
            strokeWidth='2'
            className='text-tertiary ml-auto -translate-x-2 scale-95 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:scale-100 group-hover/link:opacity-100'
          />
        </Link>
      </div>
    </div>
  )
}
