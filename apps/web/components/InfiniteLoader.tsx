import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { Button, LazyLoadingSpinner, UIText } from '@campsite/ui'

interface Props {
  hasNextPage: boolean
  isError: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function InfiniteLoader(props: Props) {
  const [ref, inView] = useInView()

  const { isError, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = props
  const shouldFetch = inView && !isError && !isFetching && !isFetchingNextPage && hasNextPage

  useEffect(() => {
    if (shouldFetch) {
      fetchNextPage()
    }
  }, [fetchNextPage, shouldFetch])

  if (!hasNextPage) return null

  return (
    <div className='relative flex w-full items-center justify-center p-14'>
      <div className='absolute -top-11' ref={ref}></div>
      {isError && !isFetching && (
        <div className='flex flex-col gap-3 align-middle'>
          <UIText>Oops, we encountered an error.</UIText>
          <Button variant='base' onClick={fetchNextPage}>
            Try again
          </Button>
        </div>
      )}
      {(!isError || isFetching) && <LazyLoadingSpinner />}
    </div>
  )
}
