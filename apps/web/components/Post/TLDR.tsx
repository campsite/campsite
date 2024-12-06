import { useEffect, useId, useMemo, useState } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { AnimatePresence, m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import { getMarkdownExtensions } from '@campsite/editor/markdown'
import { Button } from '@campsite/ui/Button'
import { PlayIcon, WarningTriangleIcon } from '@campsite/ui/Icons'
import { LayeredHotkeys } from '@campsite/ui/index'
import { LoadingSpinner } from '@campsite/ui/Spinner'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { GeneratedContentFeedback } from '@/components/GeneratedContentFeedback'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { useGetGeneratedTldr } from '@/hooks/useGetGeneratedTldr'
import { useGetPost } from '@/hooks/useGetPost'
import { scrollInputIntoView } from '@/utils/scrollInputIntoView'

const ANIMATION_DURATION = 150

interface Props {
  open: boolean
  postId: string
  className?: string
  source: string
}

export function TLDR({ open, postId, className, source }: Props) {
  const getGeneratedTldr = useGetGeneratedTldr({ postId, enabled: open })
  const { data: post } = useGetPost({ postId })
  const id = useId()

  useEffect(() => {
    // scroll into view on both pending and success
    if (open && (getGeneratedTldr.status === 'pending' || getGeneratedTldr.status === 'success')) {
      const timeout = setTimeout(() => scrollInputIntoView(id), ANIMATION_DURATION)

      return () => clearTimeout(timeout)
    }
  }, [open, id, getGeneratedTldr.status])

  if (!post) return null

  const isFailed = getGeneratedTldr.data?.status === 'failed' || getGeneratedTldr.isError
  const isPending = getGeneratedTldr.isPending || getGeneratedTldr.data?.status === 'pending'
  const isSuccess = getGeneratedTldr.isSuccess && getGeneratedTldr.data?.status === 'success'
  const hasResponse = isSuccess && !!getGeneratedTldr.data.html

  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: ANIMATION_DURATION / 1000 }}
          className={cn(
            'overflow-hidden dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]',
            className
          )}
        >
          {isPending && <TLDRLoading />}
          {isFailed && <TLDRError />}
          {isSuccess && !!getGeneratedTldr.data.html && (
            <PostTldrContent postId={postId} content={getGeneratedTldr.data.html} source={source} />
          )}
          {isSuccess && !getGeneratedTldr.data.html && <TLDRNotEligible />}

          {hasResponse && !!getGeneratedTldr.data.response_id && (
            <div className='flex justify-center border-t px-3 py-1.5'>
              <GeneratedContentFeedback responseId={getGeneratedTldr.data.response_id} feature='post-tldr' />
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}

function TLDRLoading() {
  return (
    <div className='text-tertiary flex items-center justify-center gap-2 p-5'>
      <LoadingSpinner />
      <UIText inherit>Summarizing...</UIText>
    </div>
  )
}

function TLDRNotEligible() {
  return (
    <div className='text-tertiary flex items-center justify-center gap-2 p-5'>
      <UIText inherit>
        We weren’t able to summarize this post — this may be because the post doesn’t have enough information or
        comments to summarize.
      </UIText>
    </div>
  )
}

function TLDRError() {
  return (
    <div className='text-tertiary flex items-center justify-center gap-2 p-5'>
      <WarningTriangleIcon />
      <UIText inherit>Ran into an issue creating a summary, try again.</UIText>
    </div>
  )
}

function PostTldrContent({ content }: { postId: string; content: string; source: string }) {
  const extensions = useMemo(() => getMarkdownExtensions({ linkUnfurl: {} }), [])
  const [ref] = useInView({ triggerOnce: true })

  return (
    <div ref={ref} className='prose select-text px-3 py-4 focus:outline-none has-[ul]:pt-2'>
      <RichTextRenderer content={content} extensions={extensions} />
    </div>
  )
}

const SUMMARY_ACCORDION_KEY = 'summary'
const SUMMARY_ACCORDION_HEADER_ID = 'summary-accordion-header'

export function PostInlineSummary({ postId, source }: { postId: string; source: string }) {
  const { ref, inView } = useInView()
  const [value, setValue] = useState('')
  const open = !!value
  const getGeneratedTldr = useGetGeneratedTldr({ postId, enabled: open })
  const { data: post } = useGetPost({ postId })

  if (!post) return null

  const isFailed = getGeneratedTldr.data?.status === 'failed' || getGeneratedTldr.isError
  const isPending = getGeneratedTldr.isPending || getGeneratedTldr.data?.status === 'pending'
  const isSuccess = getGeneratedTldr.isSuccess && getGeneratedTldr.data?.status === 'success'
  const hasResponse = isSuccess && !!getGeneratedTldr.data.html

  return (
    <AccordionPrimitive.Root
      type='single'
      collapsible
      className='group flex flex-col'
      value={value}
      onValueChange={setValue}
    >
      <LayeredHotkeys
        keys='shift+s'
        options={{ preventDefault: true }}
        callback={() => {
          if (open) {
            setValue('')
          } else {
            setValue(SUMMARY_ACCORDION_KEY)
          }

          // Only scroll into view if it's being opened and not visible
          if (!open && !inView) {
            queueMicrotask(() =>
              document.getElementById(SUMMARY_ACCORDION_HEADER_ID)?.scrollIntoView({ behavior: 'smooth' })
            )
          }
        }}
      />

      <AccordionPrimitive.Item value={SUMMARY_ACCORDION_KEY} className='flex flex-col'>
        <AccordionPrimitive.Header ref={ref} id={SUMMARY_ACCORDION_HEADER_ID} className='flex h-6 items-center'>
          <AccordionPrimitive.Trigger asChild>
            <span>
              <Button
                size='sm'
                leftSlot={
                  <PlayIcon
                    size={12}
                    className='text-quaternary rotate-0 transform transition-transform group-has-[[data-state="open"]]:rotate-90'
                  />
                }
                variant='plain'
              >
                Summary
              </Button>
            </span>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'>
          <div className='overflow-hidden'>
            {isPending && <TLDRLoading />}
            {isFailed && <TLDRError />}
            {isSuccess && !!getGeneratedTldr.data.html && (
              <PostTldrContent postId={postId} content={getGeneratedTldr.data.html} source={source} />
            )}
            {isSuccess && !getGeneratedTldr.data.html && <TLDRNotEligible />}

            {hasResponse && !!getGeneratedTldr.data.response_id && (
              <div className='flex justify-center border-t px-3 py-1.5'>
                <GeneratedContentFeedback responseId={getGeneratedTldr.data.response_id} feature='post-tldr' />
              </div>
            )}
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}
