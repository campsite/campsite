import { useRef } from 'react'
import { Editor } from '@tiptap/react'
import { LayoutGroup, m } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import { useCommand } from 'src/core/command-context'
import { LAYOUT_TRANSITION } from 'src/core/motion'
import { FormSchema } from 'src/core/schema'

import { isMetaEnter } from '@campsite/ui/src/utils'

import { DescriptionEditor } from './DescriptionEditor'
import { OrganizationSwitcher } from './OrganizationSwitcher'
import { PreviewZone } from './PreviewZone'
import { ProjectPicker } from './ProjectPicker'
import { Screen } from './Screen'
import { SubmitFooter } from './SubmitFooter'

export interface UploadScreenProps {
  onSubmit(): void
}

export function UploadScreen({ onSubmit }: UploadScreenProps) {
  const command = useCommand()
  const methods = useFormContext<FormSchema>()
  const editorRef = useRef<{ editor: Editor | null }>(null)

  function submit() {
    const description = editorRef.current?.editor?.getHTML() ?? ''

    methods.setValue('description_html', description)
    onSubmit()
  }

  return (
    <Screen>
      <OrganizationSwitcher />

      <form
        className='mb-0 flex flex-1 flex-col gap-2 p-4 pt-0'
        onSubmit={(evt) => {
          evt.preventDefault()
          submit()
        }}
        onKeyDownCapture={(evt) => {
          if (isMetaEnter(evt)) {
            evt.preventDefault()
            evt.currentTarget.requestSubmit()
          }
        }}
      >
        <LayoutGroup>
          <m.div layout transition={LAYOUT_TRANSITION} className='pointer-events-none flex-1' />

          <PreviewZone />

          <m.div layout transition={LAYOUT_TRANSITION} className='pointer-events-none flex-1' />

          <DescriptionEditor ref={editorRef} />

          <ProjectPicker />

          <SubmitFooter />
        </LayoutGroup>
      </form>
    </Screen>
  )
}
