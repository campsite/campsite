import { z } from 'zod'

import { Attachment, FeedbackRequest, PostLink } from '@campsite/types/generated'

export const MAX_ATTACHMENTS = 10

export const schema = z
  .object({
    command: z.enum(['quick-post']),
    fileKey: z.string().optional(),
    organization: z.string().optional(),
    previews: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum(['PNG', 'SVG']),
          node_type: z.string() as unknown as z.Schema<NodeType>,
          name: z.string(),
          bytes: z.instanceof(Uint8Array),
          width: z.number(),
          height: z.number()
        })
      )
      .min(1)
      .max(MAX_ATTACHMENTS, 'Posts can have up to 10 attachments'),
    title: z.string(),
    description_html: z.string(),
    post: z
      .object({
        id: z.string(),
        title: z.string(),
        description_html: z.string(),
        url: z.string(),
        links: z.array(z.any() as unknown as z.Schema<PostLink>),
        attachments: z.array(z.any() as unknown as z.Schema<Attachment>),
        project: z.object({ id: z.string(), name: z.string(), accessory: z.string().nullable() }).nullable(),
        status: z.enum(['none', 'feedback_requested']),
        feedback_requests: z.array(z.any() as unknown as z.Schema<FeedbackRequest>).nullable(),
        has_iterations: z.boolean(),
        version: z.number(),
        thumbnail_url: z.string().nullable(),
        published_at: z.string().nullable(),
        created_at: z.string()
      })
      .nullable(),
    project: z.string().nullable()
  })

  .refine(
    (data) => {
      return !!data.project
    },
    {
      path: ['project'],
      message: 'Select a project'
    }
  )

export type FormSchema = z.infer<typeof schema>

export const DEFAULT_VALUES: FormSchema = {
  command: 'quick-post',
  fileKey: undefined,
  organization: undefined,
  previews: [],
  title: '',
  description_html: '',
  post: null,
  project: null
}
