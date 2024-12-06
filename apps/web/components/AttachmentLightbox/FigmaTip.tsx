import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import Balancer from 'react-wrap-balancer'

import { Attachment } from '@campsite/types'
import { Button, CloseIcon, UIText } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import { useFigmaEmbedLoaded } from '@/hooks/useFigmaEmbedLoaded'
import { useFigmaEmbedSelected } from '@/hooks/useFigmaEmbedSelected'

import { embedType } from '../Post/PostEmbeds/transformUrl'

interface Props {
  attachment: Attachment
}

export function FigmaTip({ attachment }: Props) {
  const figmaLoaded = useFigmaEmbedLoaded()
  const isDesktop = useIsDesktopApp()
  const figmaEmbedSelected = useFigmaEmbedSelected({ attachment })
  const isFigmaAttachment =
    embedType(attachment.url) === 'figma' || (attachment.image && attachment.remote_figma_url && figmaEmbedSelected)
  const [showFigmaTip, setShowFigmaTip] = useState(false)

  // only show figma tips for posts
  const canShowFigmaTip = isFigmaAttachment && !figmaLoaded && attachment.subject_type === 'Post'

  useEffect(() => {
    if (!canShowFigmaTip) {
      setShowFigmaTip(false)
      return
    } else {
      const timer = setTimeout(() => {
        setShowFigmaTip(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [canShowFigmaTip])

  return (
    <AnimatePresence>
      {showFigmaTip && (
        <m.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.1
            }
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
            transition: {
              duration: 0.1
            }
          }}
          className='bg-elevated shadow-popover absolute bottom-4 left-4 z-10 flex w-full max-w-[375px] flex-col gap-4 rounded-lg p-5'
        >
          <div className='flex flex-col gap-1'>
            <UIText weight='font-semibold'>Having trouble viewing this Figma file?</UIText>
            <UIText>
              <Balancer>
                If this file is private or has strict access controls,{' '}
                {isDesktop
                  ? 'it may only load in your browser or the Figma app.'
                  : 'it may only load in the Figma app.'}
              </Balancer>
            </UIText>
          </div>
          <div className='flex flex-1 items-center gap-3'>
            <Button externalLink fullWidth variant={isDesktop ? 'flat' : 'primary'} href={attachment.url}>
              Open in Figma
            </Button>
            {isDesktop && (
              <Button externalLink fullWidth variant='primary' href={`${attachment.app_url}?browser=true`}>
                Open in browser
              </Button>
            )}
          </div>
          <Button
            onClick={() => setShowFigmaTip(false)}
            variant='plain'
            className='absolute right-2 top-2'
            iconOnly={<CloseIcon />}
            accessibilityLabel='Close'
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}
