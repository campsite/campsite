import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { $figma } from './figma'
import { FormSchema } from './schema'

export function useSync({ watch, setValue, getValues }: UseFormReturn<FormSchema>) {
  const organization = watch('organization')
  const project = watch('project')
  const fileKey = watch('fileKey')

  // Emit organization changes back to `main` thread
  useEffect(() => {
    if (organization) {
      $figma.emit('organizationchange', organization)
    }
  }, [organization])

  // Emit project changes back to `main` thread
  useEffect(() => {
    if (organization && project) {
      $figma.emit('projectchange', { organization, project })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  // Emit filekey changes back to `main` thread
  useEffect(() => {
    if (fileKey) {
      $figma.emit('filekeychange', fileKey)
    }
  }, [fileKey])

  useEffect(() => {
    // Set up initial data event listener
    $figma.on('initialdata', (initialData) => {
      if (initialData.organization) {
        setValue('organization', initialData.organization, { shouldValidate: true })
      }

      if (initialData.project) {
        setValue('project', initialData.project, { shouldValidate: true })
      }

      if (initialData.title) {
        setValue('title', initialData.title, { shouldValidate: true })
      }

      if (initialData.previews) {
        setValue('previews', initialData.previews, { shouldValidate: true })
      }

      if (initialData.fileKey) {
        setValue('fileKey', initialData.fileKey, { shouldValidate: true })
      }
    })

    // Set up preview ready event listener
    $figma.on('previewready', (previews) => {
      const newPreviewMap = new Map(previews.map((preview) => [preview.id, preview]))

      // Keep the same order as the current previews
      const currentPreviews = getValues('previews')
      const unchangedPreviews = currentPreviews.filter((preview) => newPreviewMap.has(preview.id))
      const unchangedPreviewMap = new Map(unchangedPreviews.map((preview) => [preview.id, preview]))

      // Add new previews to the end
      const newPreviews = previews.filter((preview) => !unchangedPreviewMap.has(preview.id))

      setValue('previews', [...unchangedPreviews, ...newPreviews], { shouldValidate: true })
    })

    // Set up title change event listener
    $figma.on('titlechange', (title) => {
      setValue('title', title, { shouldValidate: true })
    })

    // Emit that app is now ready to receive data
    $figma.emit('appready')
  }, [setValue, getValues])
}
