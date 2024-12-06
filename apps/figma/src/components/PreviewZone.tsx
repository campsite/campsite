import { AnimatePresence, m, motion, Transition } from 'framer-motion'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { src } from 'src/core/export'
import { LAYOUT_TRANSITION } from 'src/core/motion'
import { FormSchema, MAX_ATTACHMENTS } from 'src/core/schema'

import { AlertIcon } from '@campsite/ui/src/Icons'
import { UIText } from '@campsite/ui/src/Text'
import { cn } from '@campsite/ui/src/utils'

let rotations = [3, -6, 6, -3]

export function PreviewZone() {
  const { control } = useFormContext<FormSchema>()
  const post = useWatch({ control, name: 'post' })

  const transition: Transition = {
    type: 'spring',
    duration: 0.35,
    opacity: { duration: 0.1 }
  }

  return (
    <Controller
      control={control}
      name='previews'
      render={({ field, fieldState }) => (
        <m.div
          className='h-55 isolate flex w-full items-center justify-center text-center'
          layout='position'
          transition={LAYOUT_TRANSITION}
        >
          <AnimatePresence mode='wait' initial={false}>
            {!field.value || field.value.length === 0 ? (
              <motion.div key='hint' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>
                <UIText size='text-xs' tertiary>
                  Select a frame or two to get started
                </UIText>
              </motion.div>
            ) : (
              <motion.div
                key='previews'
                className='flex w-full flex-col items-center gap-1'
                exit={{
                  opacity: 0,
                  scale: 0.9
                }}
                transition={transition}
              >
                <motion.div
                  layout='position'
                  className='flex w-full flex-col items-center gap-6'
                  transition={transition}
                >
                  <motion.div className='h-45 relative mt-4 w-[90%]'>
                    <AnimatePresence>
                      {field.value.map((preview, index) => (
                        <motion.div
                          key={preview.id}
                          className='absolute left-1/2 top-1/2 flex items-center justify-center'
                          style={{
                            width: `min(${preview.width}px, 100%)`,
                            height: `min(${preview.height}px, 100%)`,
                            x: '-50%',
                            y: '-50%',
                            zIndex: index
                          }}
                          initial={{
                            opacity: 0,
                            scale: 1.5
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: rotations[index % rotations.length]
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.9
                          }}
                          transition={transition}
                        >
                          <div
                            className={cn('max-h-full max-w-full rounded-md ring-1 ring-black/10 dark:ring-white/25')}
                            style={{
                              aspectRatio: `${preview.width} / ${preview.height}`
                            }}
                          >
                            <img
                              className='dark:bg-tertiary dark:border-primary h-full w-full rounded-md border-4 border-white bg-white'
                              src={src(preview)}
                              alt={preview.name}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  <div className='flex items-center gap-1'>
                    {fieldState.error && <AlertIcon className='h-4 w-4 text-red-500' />}
                    <UIText className={cn(fieldState.error && '!text-red-500')} tertiary size='text-xs'>
                      {fieldState.error
                        ? 'Attachment limit reached'
                        : `${field.value.length} frame${field.value.length > 1 ? 's' : ''} selected`}
                    </UIText>
                  </div>
                </motion.div>

                {fieldState.error && (
                  <motion.div
                    className='flex flex-col items-center gap-1'
                    aria-live='polite'
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transition}
                  >
                    <UIText className='flex text-center' tertiary size='text-xs'>
                      {fieldState.error.message}
                    </UIText>
                    {post &&
                      post.attachments.length > 0 &&
                      field.value.length <= MAX_ATTACHMENTS &&
                      field.value.length > MAX_ATTACHMENTS - post.attachments.length && (
                        <button onClick={() => window.open(post.url, '_blank')}>
                          <UIText element='span' className='flex text-center text-blue-500' size='text-xs'>
                            Update post
                          </UIText>
                        </button>
                      )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </m.div>
      )}
    />
  )
}
