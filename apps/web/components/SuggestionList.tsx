import * as React from 'react'
import { Editor, Range } from '@tiptap/core'
import { EditorState, PluginKey } from '@tiptap/pm/state'
import { v4 as uuid } from 'uuid'

import { Suggestion, SuggestionOptions } from '@campsite/editor/extensions/Suggestion'
import {
  isMarkActiveInRange,
  isNodeActiveInRange,
  isRemoteTransaction,
  recreateTransform
} from '@campsite/editor/index'
import {
  cn,
  Command,
  CommandProps,
  CommandRef,
  CONTAINER_STYLES,
  highlightedCommandItemStyles,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
  UIText
} from '@campsite/ui'

const DEFAULT_ALLOWED_PREFIXES = [' ', '(']

const SuggestionRangeContext = React.createContext<React.RefObject<Range>>({ current: null })
const useSuggestionRange = () => React.useContext(SuggestionRangeContext)

const SuggestionEmptyContext = React.createContext<boolean>(true)
const SuggestionQueryContext = React.createContext<string>('')

export const useSuggestionEmpty = () => React.useContext(SuggestionEmptyContext)
export const useSuggestionQuery = () => React.useContext(SuggestionQueryContext)

interface Measurable {
  getBoundingClientRect(): DOMRect
}

type SuggestionProps = React.PropsWithChildren &
  Omit<React.ComponentPropsWithoutRef<'div'>, 'className'> &
  Pick<SuggestionOptions, 'editor' | 'pluginKey' | 'allow' | 'startOfLine' | 'allowedPrefixes' | 'allowSpaces'> &
  Pick<React.ComponentPropsWithoutRef<typeof Popover>, 'modal'> &
  Pick<React.ComponentPropsWithoutRef<typeof PopoverContent>, 'align' | 'side'> &
  Pick<CommandProps, 'filter' | 'minScore'> & {
    // force non-null char
    char: string
    // allow controlled query changes. providing this value will disable cmdk filtering.
    onControlledQueryChange?: (query: string) => void
    contentClassName?: string
    listClassName?: string
  }

export function SuggestionRoot(props: SuggestionProps) {
  const [open, setOpen] = React.useState(false)

  const {
    children,
    editor,
    pluginKey,
    char,
    contentClassName,
    listClassName,
    startOfLine,
    allow,
    allowedPrefixes = DEFAULT_ALLOWED_PREFIXES,
    allowSpaces,
    align = 'start',
    side = 'bottom',
    /**
     * `modal` presentation allows scrolling within the popover when activated
     * from a dialog, which makes it a good candidate to be the default.
     */
    modal = true,
    filter,
    onControlledQueryChange,
    minScore,
    ...etc
  } = props

  // track to manually control the Command component selection state
  const commandRef = React.useRef<CommandRef>(null)
  // track the anchor element so we can manually position it
  const virtualAnchorRef = React.useRef<Measurable | null>(null)

  const rangeRef = React.useRef<Range | null>(null)
  const [query, setQuery] = React.useState('')

  // track allow and open state as refs to lazily register the plugin in an effect without rerunning on anon fns
  const allowRef = React.useRef(allow)
  const openRef = React.useRef(open)
  const updateQuery = (query: string, range: Range | null) => {
    setQuery(query)
    onControlledQueryChange?.(query)
    rangeRef.current = range
  }
  const updateRef = React.useRef(updateQuery)

  allowRef.current = allow
  openRef.current = open
  updateRef.current = updateQuery

  // track positions where the suggestion was dismissed without selection to avoid re-displaying the suggestion
  const dismissedPositionsRef = React.useRef<number[]>([])

  // check if the suggestion char is at the given position
  const isCharAtPos = (state: EditorState, pos: number) => {
    const from = pos
    const to = pos + char.length

    if (from < 0 || to > state.doc.content.size) {
      return false
    }

    return state.doc.textBetween(from, to) === char
  }

  function close() {
    // if the suggestion is at the current position and the character still exists (e.g. no selection), add it to the dismissed positions
    if (
      rangeRef.current?.from &&
      !dismissedPositionsRef.current.includes(rangeRef.current.from) &&
      isCharAtPos(editor.state, rangeRef.current.from)
    ) {
      dismissedPositionsRef.current.push(rangeRef.current.from)
    }

    setOpen(false)
    updateRef.current('', null)
  }

  React.useLayoutEffect(() => {
    if (!editor || editor.isDestroyed) {
      return
    }

    function updateAnchorRect(node: Element | null) {
      if (!node || !(node instanceof HTMLElement)) return

      // capture the bounds outside of the fn because the decoration node will be removed while typing
      // this prevents the anchor from jumping to 0,0 when the node is removed
      const bounds = node.getBoundingClientRect()

      virtualAnchorRef.current = {
        getBoundingClientRect: () => bounds
      }
    }

    const key = pluginKey ?? new PluginKey(uuid())

    const plugin = Suggestion({
      pluginKey: key,
      editor,
      char,
      startOfLine,
      allow: (props) => {
        // this will only capture the allow prop fn, so it MUST be stateless
        const propsAllow = !allowRef.current || allowRef.current(props)

        return (
          propsAllow &&
          // do not display suggestions if it was manually dismissed
          !dismissedPositionsRef.current.includes(props.range.from) &&
          // never allow suggestions in code
          !isMarkActiveInRange(props.state, 'code', props.range) &&
          !isNodeActiveInRange(props.state, 'codeBlock', props.range)
        )
      },
      apply: ({ transaction, state }) => {
        // no-op unless there were actual content changes
        if (!transaction.docChanged || !dismissedPositionsRef.current.length) {
          return
        }

        const mapping = isRemoteTransaction(transaction)
          ? recreateTransform(transaction.before, transaction.doc, true, false).mapping
          : transaction.mapping

        dismissedPositionsRef.current = dismissedPositionsRef.current
          // map the positions to the current transaction
          .map((pos) => mapping.map(pos))
          // only keep positions where the suggestion char still exists
          .filter((pos) => isCharAtPos(state, pos))
      },
      allowedPrefixes,
      allowSpaces,
      items: () => [],
      render: () => {
        return {
          onStart: ({ decorationNode, query, range }) => {
            updateAnchorRect(decorationNode)
            setOpen(true)
            updateRef.current(query, range)
          },
          onUpdate: ({ decorationNode, query, range }) => {
            updateAnchorRect(decorationNode)
            updateRef.current(query, range)
          },
          onExit: close,
          onKeyDown: ({ event }) => {
            // immediately ignore keydowns if the popover is not open
            if (!openRef.current) {
              return false
            }

            let handled = false

            if (event.key === 'Escape') {
              close()
              handled = true
            } else if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'j')) {
              if (event.metaKey) {
                commandRef.current?.last()
              } else if (event.altKey) {
                commandRef.current?.nextGroup()
              } else {
                commandRef.current?.next()
              }
              handled = true
            } else if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'k')) {
              if (event.metaKey) {
                commandRef.current?.first()
              } else if (event.altKey) {
                commandRef.current?.prevGroup()
              } else {
                commandRef.current?.prev()
              }
              handled = true
            } else if (event.key === 'Enter' || event.key === 'Tab') {
              const didSelect = commandRef.current?.onSelect()

              if (!didSelect) {
                close()
              }

              handled = true
            }

            if (handled) {
              event.preventDefault()
              event.stopPropagation()
            }

            return handled
          }
        }
      }
    })

    // register the plugin FIRST so that it receives key events before others
    editor.registerPlugin(plugin, (newPlugin, plugins) => [newPlugin, ...plugins])
    return () => {
      editor.unregisterPlugin(key)
    }
    // allowedPrefixes: ignore so inline arrays can be used
    // close: function only uses stable values
    // isCharAtPos: function only uses stable values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, pluginKey, startOfLine, char, allowSpaces])

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          close()
        }
      }}
      modal={modal}
    >
      <PopoverAnchor virtualRef={virtualAnchorRef} />
      <PopoverPortal>
        {open && (
          <PopoverContent
            side={side}
            align={align}
            // retain focus on the editor
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={cn(
              CONTAINER_STYLES.base,
              'scrollbar-hide bg-elevated dark:border-primary-opaque flex max-h-60 min-w-[265px] scroll-p-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden rounded-[9px] border border-neutral-400/40 p-1 shadow-md outline-none focus:outline-none dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
              contentClassName
            )}
            avoidCollisions='autoPlacement'
            asChild
          >
            <Command
              ref={commandRef}
              shouldFilter={!onControlledQueryChange}
              loop
              // disable default cmdk layered hotkeys so the editor keydown events control the component
              manualInputs
              minScore={minScore}
              filter={filter}
            >
              <Command.Input
                // HACK to use cmdk with controlled input, just don't render the element
                value={query}
                className='hidden'
              />
              <Command.List
                className={cn(CONTAINER_STYLES.base, 'flex flex-col outline-none focus:outline-none', listClassName)}
                {...etc}
              >
                <SuggestionQueryContext.Provider value={query}>
                  <SuggestionEmptyContext.Provider value={!query}>
                    <SuggestionRangeContext.Provider value={rangeRef}>{children}</SuggestionRangeContext.Provider>
                  </SuggestionEmptyContext.Provider>
                </SuggestionQueryContext.Provider>
                <Command.Empty
                  className='flex items-center gap-2 p-2 text-sm'
                  onClick={() => {
                    close()
                    // clicking will steal focus, so return it
                    editor.commands.focus()
                  }}
                >
                  <UIText>No results</UIText>
                  <UIText tertiary>Dismiss</UIText>
                </Command.Empty>
              </Command.List>
            </Command>
          </PopoverContent>
        )}
      </PopoverPortal>
    </Popover>
  )
}

type ItemProps = React.PropsWithChildren &
  Omit<React.ComponentPropsWithoutRef<typeof Command.Item>, 'onSelect'> & {
    editor: Editor
    onSelect: (props: { editor: Editor; range: Range }) => void
  }

export function SuggestionItem({ children, editor, onSelect, className, ...etc }: ItemProps) {
  // using synced storage allows us to track + use the range in the onSelect handler
  // so plugins, extensions, etc can manipulate the editor state at the given range
  const range = useSuggestionRange()

  return (
    <Command.Item
      {...etc}
      className={cn(highlightedCommandItemStyles(), 'space-x-2 rounded-md p-1.5', className)}
      onSelect={() => {
        if (!range.current) return
        onSelect({ editor, range: range.current })
      }}
    >
      {children}
    </Command.Item>
  )
}
