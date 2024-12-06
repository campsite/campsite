import { useEffect, useState } from 'react'
import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import tippy, { Instance, Props as TippyProps } from 'tippy.js'

import { ALIAS_TO_LANGUAGE } from '@campsite/editor'
import {
  CheckIcon,
  ChevronDownIcon,
  cn,
  CONTAINER_STYLES,
  Popover,
  PopoverContent,
  PopoverElementAnchor,
  PopoverPortal,
  SelectCommandContainer,
  SelectCommandEmpty,
  SelectCommandGroup,
  SelectCommandInput,
  SelectCommandItem,
  SelectCommandList,
  SelectCommandSeparator,
  SelectOption
} from '@campsite/ui'

interface Props {
  editor: Editor | null | undefined
}

function languageToOption(alias: string): SelectOption {
  return {
    value: alias,
    label: ALIAS_TO_LANGUAGE[alias]
  }
}

function buildLanguageOptions() {
  const processedName = new Set<string>()
  const aliases: string[] = []

  Object.entries(ALIAS_TO_LANGUAGE).forEach(([alias, name]) => {
    if (!processedName.has(name)) {
      processedName.add(name)
      aliases.push(alias)
    }
  })

  return aliases.sort().map(languageToOption)
}

const languageOptions = buildLanguageOptions()

export function CodeBlockLanguagePicker({ editor }: Props) {
  // used to highlight the selected value on initial open
  const [initialOpen, setInitialOpen] = useState(false)
  // track the element in state so it trigger an effect
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<string | undefined>()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!element || !editor) {
      return
    }

    if (editor?.isDestroyed) {
      return
    }

    const plugin = CodeBlockLanguagePlugin({
      editor,
      element,
      onActiveLanguage: setActiveLanguage
    })

    editor.registerPlugin(plugin)
    return () => {
      editor.unregisterPlugin(codeBlockLanguageKey)
    }
  }, [element, editor])

  const selectedLanguageName = ALIAS_TO_LANGUAGE[activeLanguage ?? 'none']

  return (
    // because the button is managed by tippy, wrapping the menu is necessary to avoid react errors on unmount
    <div className='absolute'>
      <button
        ref={setElement}
        className='text-quaternary hover:text-secondary flex translate-y-full flex-row items-center px-2 py-1 text-xs'
        onClick={() => setOpen(true)}
        // set to hidden initially so that tippy can take over this element
        style={{ visibility: 'hidden' }}
        type='button'
      >
        {selectedLanguageName}
        <ChevronDownIcon size={16} />
      </button>

      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open)
          setInitialOpen(open)
        }}
        modal
      >
        <PopoverElementAnchor element={element} />
        <PopoverPortal>
          <PopoverContent
            className={cn('scrollable min-w-[365px] max-w-[365px]', CONTAINER_STYLES.base)}
            side='bottom'
            align='end'
            onKeyDown={() => setInitialOpen(false)}
            asChild
          >
            <SelectCommandContainer className='flex max-h-[300px] flex-col'>
              <SelectCommandInput placeholder='Change language...' />
              <SelectCommandSeparator alwaysRender />

              <SelectCommandList>
                <SelectCommandEmpty>No results</SelectCommandEmpty>
                <SelectCommandGroup className='py-1'>
                  {languageOptions.map((option) => {
                    const isSelected = option.label === selectedLanguageName

                    return (
                      <SelectCommandItem
                        className={cn('justify-between', {
                          '!bg-white/10': initialOpen && isSelected,
                          '!bg-transparent !shadow-none': initialOpen && !isSelected
                        })}
                        key={`${option.value}${option.label}`}
                        value={option.label.toString()}
                        title={option.label.toString()}
                        onSelect={() => {
                          editor
                            ?.chain()
                            .focus()
                            .updateAttributes('codeBlock', { language: option.value })
                            .scrollIntoView()
                            .run()
                          setOpen(false)
                        }}
                      >
                        <span className='flex-1 truncate'>{option.label}</span>
                        <CheckIcon className={cn('shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                      </SelectCommandItem>
                    )
                  })}
                </SelectCommandGroup>
              </SelectCommandList>
            </SelectCommandContainer>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
}

interface CodeBlockLanguageOptions {
  editor: Editor
  element: HTMLElement
  onActiveLanguage: (language: string) => void
}

function getLanguageMetaFromState(view: EditorView) {
  const selection = view.state.selection
  const { $anchor } = selection
  const parentNode = selection.$anchor.parent

  // only works when selection is inside a code block
  if (parentNode.type.name !== 'codeBlock') {
    return
  }

  // subtract one to get the pos of the parent node
  const parentPos = $anchor.pos - $anchor.parentOffset - 1
  let language = parentNode.attrs.language

  // make sure the language is in the map of highlightable languages
  // this can happen when a user creates a code block with an unknown language like ```made-up-language
  if (!language || !(language in ALIAS_TO_LANGUAGE)) {
    language = 'none'
  }

  return { language, parentPos }
}

const codeBlockLanguageKey = new PluginKey('codeBlockLanguage')

function CodeBlockLanguagePlugin({ editor, element, onActiveLanguage }: CodeBlockLanguageOptions) {
  let popup: Instance<TippyProps> | undefined

  function hide() {
    popup?.hide()
  }

  function update(view: EditorView, oldState?: EditorState) {
    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)
    const isSame = !selectionChanged && !docChanged

    // if the selection hasn't changed, no-op
    if (isSame) {
      return
    }

    // never show the dropdown if the editor is not editable
    if (!view.editable) {
      hide()
      return
    }

    const languageMeta = getLanguageMetaFromState(view)

    if (!languageMeta) {
      hide()
      return
    }

    if (!popup && editor.options.element.parentElement) {
      popup = tippy(editor.options.element, {
        duration: 0,
        getReferenceClientRect: null,
        content: element,
        interactive: true,
        trigger: 'manual',
        placement: 'top-end',
        hideOnClick: 'toggle',
        offset: [4, 0],
        popperOptions: {
          modifiers: [
            {
              // fix the position of the popover
              name: 'flip',
              options: {
                fallbackPlacements: ['top-end']
              }
            }
          ]
        }
      })
    }

    const { language, parentPos } = languageMeta

    onActiveLanguage(language)
    popup?.setProps({
      getReferenceClientRect: () => (view.nodeDOM(parentPos) as HTMLElement)?.getBoundingClientRect()
    })
    popup?.show()
  }

  const onFocus = () => setTimeout(() => update(editor.view))
  const onBlur = ({ event }: { event: FocusEvent }) => {
    // prevent hiding on click or moving focus to the dropdown
    if (event?.relatedTarget && element?.parentNode?.contains(event.relatedTarget as Node)) {
      return
    }
    hide()
  }

  return new Plugin({
    key: codeBlockLanguageKey,
    view: () => {
      // remove from the parent and set to visible now that tippy is in control of the view
      element.remove()
      element.style.visibility = 'visible'

      editor.on('focus', onFocus)
      editor.on('blur', onBlur)

      return {
        destroy() {
          popup?.destroy()
          editor.off('focus', onFocus)
          editor.off('blur', onBlur)
        },
        update
      }
    }
  })
}
