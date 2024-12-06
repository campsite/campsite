import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, domMax, LazyMotion } from 'framer-motion'
import { FormProvider, useForm } from 'react-hook-form'
import { api } from 'src/api'
import { useCommand } from 'src/core/command-context'
import { DEFAULT_VALUES, FormSchema, schema } from 'src/core/schema'
import { useSubmit } from 'src/core/submit'
import { useSync } from 'src/core/sync'

import { FileUrlPrompt } from './FileUrlPrompt'
import { ProgressScreen } from './ProgressScreen'
import { UploadScreen } from './UploadScreen'

export function App() {
  const command = useCommand()

  const [promptForUrl, setPromptForUrl] = useState(false)
  const [promptSkipped, setPromptSkipped] = useState(false)

  const methods = useForm<FormSchema>({
    mode: 'onChange',
    defaultValues: {
      ...DEFAULT_VALUES,
      command
    },
    resolver: zodResolver(schema)
  })

  const {
    getValues,
    setValue,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
    watch
  } = methods
  const organization = watch('organization')
  const fileKey = watch('fileKey')

  // Prefetch integration data
  api.slack.useIntegrationQuery(organization)

  const { data: me } = api.auth.useMeQuery()
  const { mutate: analytics } = api.analytics.useCreateEvents()
  const didLogOpenEventRef = useRef(false)

  useEffect(() => {
    if (organization && me && !didLogOpenEventRef.current) {
      didLogOpenEventRef.current = true
      analytics({
        name: 'figma_plugin_opened',
        data: {
          command
        },
        org_slug: organization,
        user_id: me.id
      })
    }
  }, [analytics, command, me, organization])

  const [submit, progressRef] = useSubmit(methods)

  useSync(methods)

  return (
    <FormProvider {...methods}>
      <LazyMotion features={domMax}>
        <AnimatePresence initial={false}>
          {!(isSubmitting || isSubmitSuccessful) ? (
            <UploadScreen
              key='upload'
              onSubmit={() => {
                // As part of a change in Figma URL structure, we incorrectly stored "file" as the fileKey for some files,
                // which broke Figma embeds in Campsite. This check forces users to go through the URL prompt
                // flow again for files in this state so that we can capture the correct fileKey.
                if ((!fileKey || fileKey === 'file') && !promptSkipped) {
                  setPromptForUrl(true)
                } else {
                  submit()
                }
              }}
            />
          ) : (
            <ProgressScreen
              key='progress'
              ref={progressRef}
              onDone={(shouldReset = true) => {
                if (!shouldReset) return
                reset({
                  ...getValues(),
                  post: DEFAULT_VALUES.post
                })
              }}
            />
          )}

          <FileUrlPrompt
            open={promptForUrl}
            onOpenChange={setPromptForUrl}
            onSubmit={(key) => {
              if (key) {
                setValue('fileKey', key, { shouldValidate: true })
              } else {
                setPromptSkipped(true)
              }
              setPromptForUrl(false)
              submit()
            }}
          />
        </AnimatePresence>
      </LazyMotion>
    </FormProvider>
  )
}
