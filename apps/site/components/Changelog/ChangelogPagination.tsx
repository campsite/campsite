import { ArrowLeftIcon, ArrowRightIcon, Button, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  nextPage?: number | null
  previousPage?: number | null
}

export function ChangelogPagination(props: Props) {
  const { hasNextPage, hasPreviousPage, nextPage, previousPage } = props

  return (
    <div className='flex items-center gap-4'>
      {hasPreviousPage && (
        <Button
          size='large'
          href={previousPage && previousPage < 2 ? '/changelog' : `/changelog/page/${previousPage}`}
          className={cn('hover:bg-secondary flex flex-1 rounded-full border p-3', {
            'pointer-events-none opacity-50': !hasPreviousPage
          })}
        >
          <span className='flex flex-1 items-center gap-2'>
            <ArrowLeftIcon strokeWidth='2' />
            <UIText weight='font-medium'>Previous</UIText>
          </span>
        </Button>
      )}

      <Button
        size='large'
        href={`/changelog/page/${nextPage}`}
        className={cn('hover:bg-secondary flex flex-1 rounded-full border p-3', {
          'pointer-events-none opacity-50': !hasNextPage
        })}
      >
        <span className='flex flex-1 items-center gap-2'>
          <UIText weight='font-medium'>Next</UIText>
          <ArrowRightIcon strokeWidth='2' />
        </span>
      </Button>
    </div>
  )
}
