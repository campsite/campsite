import { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Editor, Range } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'

import {
  AtSignIcon,
  CheckSquareIcon,
  CodeIcon,
  FaceSmileIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HorizontalRuleIcon,
  KeyboardShortcut,
  OrderedListIcon,
  PlayIcon,
  PostIcon,
  QuoteIcon,
  TextAlignLeftIcon,
  UIText,
  UnorderedListIcon,
  UploadCloudIcon
} from '@campsite/ui'

import { SuggestionItem, SuggestionRoot } from '@/components/SuggestionList'

import { useUploadNoteAttachments } from './Attachments/useUploadAttachments'

export const ADD_ATTACHMENT_SHORTCUT = 'mod+shift+u'

interface CommandItemProps {
  title: string
  searchTerms?: string[]
  icon: ReactNode
  command: 'upload-file' | ((props: CommandProps) => void)
  kbd?: string
}

interface CommandProps {
  editor: Editor
  range: Range
}

const COMMANDS: CommandItemProps[] = [
  {
    title: 'Add a file',
    searchTerms: [
      'photo',
      'picture',
      'media',
      'image',
      'file',
      'origami',
      'principle',
      'lottie',
      'video',
      'gif',
      'upload'
    ],
    icon: <UploadCloudIcon />,
    command: 'upload-file',
    kbd: ADD_ATTACHMENT_SHORTCUT
  },
  {
    title: 'Text',
    searchTerms: ['paragraph'],
    icon: <TextAlignLeftIcon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run()
    }
  },
  {
    title: 'To-do List',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckSquareIcon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
    kbd: '[ ]'
  },
  {
    title: 'Heading 1',
    searchTerms: ['title'],
    icon: <Heading1Icon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
    kbd: '#'
  },
  {
    title: 'Heading 2',
    searchTerms: ['subtitle'],
    icon: <Heading2Icon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
    kbd: '##'
  },
  {
    title: 'Heading 3',
    searchTerms: ['subtitle'],
    icon: <Heading3Icon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
    kbd: '###'
  },
  {
    title: 'Bullet List',
    searchTerms: ['unordered'],
    icon: <UnorderedListIcon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
    kbd: '-'
  },
  {
    title: 'Numbered List',
    searchTerms: ['ordered'],
    icon: <OrderedListIcon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
    kbd: '1.'
  },
  {
    title: 'Quote',
    searchTerms: ['blockquote'],
    icon: <QuoteIcon />,
    command: ({ editor, range }: CommandProps) =>
      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').toggleBlockquote().run(),
    kbd: '>'
  },
  {
    title: 'Code',
    searchTerms: ['codeblock'],
    icon: <CodeIcon />,
    command: ({ editor, range }: CommandProps) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    kbd: '```'
  },
  {
    title: 'Divider',
    searchTerms: ['divider', 'separator', 'horizontal', 'rule'],
    icon: <HorizontalRuleIcon />,
    command: ({ editor, range }: CommandProps) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    kbd: '---'
  },
  {
    title: 'Toggle section',
    searchTerms: ['toggle', 'section', 'collapse', 'expand', 'details'],
    icon: <PlayIcon />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).setDetails().run()

      // open the toggle section after creating it
      setTimeout(() => {
        // range.from will point to the summary element. get its parent, then find the button, then click it.
        const summaryEl = editor.view.nodeDOM(range.from) as HTMLElement | null
        const parentEl = summaryEl?.closest('[data-type="details"]')
        const button = parentEl?.querySelector(':scope > button') as HTMLButtonElement | null

        button?.click()
      }, 50)
    }
  },
  {
    title: 'Mention',
    searchTerms: ['user', 'member'],
    icon: <AtSignIcon />,
    command: ({ editor, range }: CommandProps) => editor.chain().focus().deleteRange(range).insertContent('@').run(),
    kbd: '@'
  },
  {
    title: 'Reference',
    searchTerms: ['link', 'reference', 'post', 'call', 'doc'],
    icon: <PostIcon />,
    command: ({ editor, range }: CommandProps) => editor.chain().focus().deleteRange(range).insertContent('+').run(),
    kbd: '+'
  },
  {
    title: 'Emoji',
    searchTerms: ['reaction'],
    icon: <FaceSmileIcon />,
    command: ({ editor, range }: CommandProps) => editor.chain().focus().deleteRange(range).insertContent(':').run(),
    kbd: ':'
  }
]

type Props = Pick<ComponentPropsWithoutRef<typeof SuggestionRoot>, 'editor'> & {
  upload: ReturnType<typeof useUploadNoteAttachments>
}

const pluginKey = new PluginKey('slashCommand')

export function SlashCommand({ editor, upload }: Props) {
  return (
    <SuggestionRoot editor={editor} char='/' pluginKey={pluginKey}>
      {COMMANDS.map((item) => {
        return (
          <SuggestionItem
            editor={editor}
            value={item.title}
            keywords={item.searchTerms}
            key={item.title}
            onSelect={({ editor, range }) => {
              if (item.command instanceof Function) {
                item.command({ editor, range })
              } else if (item.command === 'upload-file') {
                editor.chain().focus().deleteRange(range).run()
                const input = document.createElement('input')

                input.type = 'file'
                input.onchange = async () => {
                  if (input.files?.length) {
                    upload({
                      files: Array.from(input.files),
                      editor
                    })
                  }
                }
                input.click()
              }
            }}
          >
            <div className='text-secondary -ml-1 flex h-6 w-6 items-center justify-center'>{item.icon}</div>
            <UIText className='flex-1 pr-4 text-left text-sm font-medium'>{item.title}</UIText>
            {item.kbd && <KeyboardShortcut shortcut={item.kbd} />}
          </SuggestionItem>
        )
      })}
    </SuggestionRoot>
  )
}
