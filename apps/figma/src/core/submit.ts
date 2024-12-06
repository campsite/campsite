import { useCallback, useMemo, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { api } from 'src/api'
import { ProgressScreenRef } from 'src/components/ProgressScreen'
import { DocumentMetadata } from 'src/types'

import {
  Attachment,
  FigmaFile,
  OrganizationPostLinksPostRequest,
  OrganizationsOrgSlugPostsPostRequest
} from '@campsite/types/generated'

import { $figma } from './figma'
import { FormSchema } from './schema'

export function useSubmit({ handleSubmit, reset, getValues }: UseFormReturn<FormSchema>) {
  const { data: me } = api.auth.useMeQuery()
  const { mutateAsync: createFile } = api.figma.useCreateFileMutation()
  const { mutateAsync: createPost } = api.posts.useCreateMutation()
  const { mutateAsync: createAttachment } = api.attachments.useCreateMutation()
  const { mutate: analytics } = api.analytics.useCreateEvents()

  /**
   * Gets or creates a post based on the given form data.
   */
  const getOrCreatePost = useCallback(
    async function (data: FormSchema) {
      let links: OrganizationPostLinksPostRequest[] = []

      if (data.fileKey) {
        const url = new URL(`/file/${data.fileKey}`, 'https://www.figma.com')
        const query = new URLSearchParams({ 'node-id': data.previews[0].id })

        links = [
          {
            url: `${url.toString()}?${query.toString()}`,
            name: 'Figma'
          }
        ]
      }

      let postData: OrganizationsOrgSlugPostsPostRequest

      if (!data.project) throw new Error('Validation error')

      postData = {
        description_html: data.description_html,
        links,
        attachments: [],
        project_id: data.project
      }

      const newPost = await createPost({
        organization: data.organization!,
        data: postData
      })

      return newPost
    },
    [createPost]
  )

  const progressRef = useRef<ProgressScreenRef>(null)

  const submit = useMemo(
    () =>
      handleSubmit(async (data) => {
        try {
          if (!progressRef.current) return
          const progress = progressRef.current
          const post = await getOrCreatePost(data)

          progress.value += 0.2
          let file: FigmaFile | undefined

          if (data.fileKey && data.organization) {
            const metadata = await new Promise<DocumentMetadata>((resolve) => {
              $figma.once('metadataready', (value) => {
                resolve(value)
              })
              $figma.emit('submitstart')
            })

            file = await createFile({
              organization: data.organization,
              data: { remote_file_key: data.fileKey, name: metadata.name }
            })

            progress.value += 0.2
          }

          const uploads: Promise<Attachment>[] = []

          // As exports become ready, immediately start creating attachments
          // and append the promises to the `uploads` array
          await new Promise<void>((resolve) => {
            $figma.on('exportready', (exportedNode) => {
              const position = data.previews.findIndex((preview) => exportedNode.id === preview.id)

              if (position >= 0) {
                uploads.push(
                  createAttachment({
                    organization: data.organization!,
                    postId: post.id,
                    position,
                    file,
                    node: exportedNode
                  })
                )
              }
            })
            $figma.on('exportend', () => {
              resolve()
            })
            $figma.emit('uploadstart')
          })
          progress.value += 0.2
          const step = (1 - progress.value) / uploads.length

          // Wait for all uploads to be completed
          await Promise.all(
            uploads.map(async (upload) => {
              await upload
              progress.value += step
            })
          )
          progress.setPost(post)
          progress.value = 1

          analytics({
            name: 'figma_plugin_post_created',
            data: {
              command: data.command,
              post_id: post.id
            },
            org_slug: data.organization,
            user_id: me?.id
          })
        } catch {
          reset(getValues())
        }
      }),
    [handleSubmit, createAttachment, createFile, getOrCreatePost, getValues, reset, me, analytics]
  )

  return [submit, progressRef] as const
}
