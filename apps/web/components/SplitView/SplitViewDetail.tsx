import { useEffect } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'

import { CallView } from '@/components/CallView'
import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { NoteView } from '@/components/NoteView'
import { PostView } from '@/components/Post/PostView'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { debouncedSelectedSplitViewSubjectAtom, selectedSplitViewSubjectAtom } from '@/components/SplitView/utils'
import { useScope } from '@/contexts/scope'

interface SplitViewDetailProps {
  fallback?: React.ReactNode
  fallbackWidth?: `${number}px` | `var(--${string})`
}

export function SplitViewDetail({ fallback, fallbackWidth = '0px' }: SplitViewDetailProps) {
  const { scope } = useScope()
  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const setSelectedSplitViewSubject = useSetAtom(selectedSplitViewSubjectAtom)
  const debouncedSelectedSplitViewSubject = useAtomValue(debouncedSelectedSplitViewSubjectAtom)
  const isSubjectSidebarOpen = isSplitViewAvailable && !!debouncedSelectedSplitViewSubject
  const show = isSubjectSidebarOpen || fallback

  /**
   * Remove split view selection if the split view is suddenly unavailable. For example,
   * if the display mode changes from comfortable to compact.
   */
  useEffect(() => {
    if (!isSplitViewAvailable && debouncedSelectedSplitViewSubject) {
      setSelectedSplitViewSubject(undefined)
    }
  }, [debouncedSelectedSplitViewSubject, isSplitViewAvailable, setSelectedSplitViewSubject])

  /**
   * If the scope changes, we want to clear the selected split view subject.
   */
  useEffect(() => {
    if (debouncedSelectedSplitViewSubject) {
      setSelectedSplitViewSubject(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, setSelectedSplitViewSubject])

  return (
    <>
      {/* If the subject split is active, defer copy url logic to the subject view (i.e. PostView) */}
      {!isSubjectSidebarOpen && <CopyCurrentUrl />}

      <AnimatePresence initial={false}>
        {show && (
          <m.div
            className='bg-primary z-10 flex flex-col overflow-hidden max-lg:hidden'
            transition={{ duration: 0.2 }}
            {...(debouncedSelectedSplitViewSubject
              ? {
                  initial: { width: '60%', marginLeft: '-60%', transform: 'translateX(100%)' },
                  animate: { width: '60%', marginLeft: '0%', transform: 'translateX(0%)' },
                  exit: { width: '60%', marginLeft: '-60%', transform: 'translateX(100%)' }
                }
              : {
                  initial: {
                    width: fallbackWidth,
                    marginLeft: `-${fallbackWidth}`,
                    transform: 'translateX(100%)'
                  },
                  animate: {
                    width: fallbackWidth,
                    marginLeft: `0%`,
                    transform: `translateX(0%)`
                  },
                  exit: {
                    width: fallbackWidth,
                    marginLeft: `-${fallbackWidth}`,
                    transform: 'translateX(100%)'
                  }
                })}
          >
            {debouncedSelectedSplitViewSubject ? (
              <m.div
                className='flex flex-1 flex-col overflow-hidden'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {debouncedSelectedSplitViewSubject?.subjectType === 'post' && (
                  <PostView postId={debouncedSelectedSplitViewSubject.id} />
                )}
                {debouncedSelectedSplitViewSubject?.subjectType === 'note' && (
                  <NoteView noteId={debouncedSelectedSplitViewSubject.id} />
                )}
                {debouncedSelectedSplitViewSubject?.subjectType === 'call' && (
                  <CallView callId={debouncedSelectedSplitViewSubject.id} />
                )}
              </m.div>
            ) : fallback ? (
              <m.div
                className='flex flex-1 flex-col overflow-hidden'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {fallback}
              </m.div>
            ) : null}
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
