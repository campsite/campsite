import { z } from 'zod'

import { Call } from '@campsite/types/generated'

import { EMPTY_HTML } from '@/atoms/markdown'

export const callSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }),
  summary: z.string().refine((s) => s !== EMPTY_HTML, { message: 'Summary cannot be empty' })
})

export type CallSchema = z.infer<typeof callSchema>

const defaultValues: CallSchema = {
  title: '',
  summary: EMPTY_HTML
}

export function getDefaultValues(call: Partial<Call> | undefined): CallSchema {
  if (!call) {
    return { ...defaultValues }
  }
  return {
    title: call.title || defaultValues.title,
    summary: call.summary_html || defaultValues.summary
  }
}
