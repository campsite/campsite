import { useMemo } from 'react'
import Image from 'next/image'

import { CustomReaction } from '@campsite/types'
import { Avatar, Link, UIText } from '@campsite/ui'

import { FullPageLoading } from '@/components/FullPageLoading'
import { SettingsTableFooter } from '@/components/SettingsSection'
import { useScope } from '@/contexts/scope'
import { useGetCustomReactions } from '@/hooks/useGetCustomReactions'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { DeleteCustomReaction } from './DeleteCustomReaction'

export function CustomReactionsTable() {
  const { scope } = useScope()
  const {
    data: customReactionsData,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetCustomReactions()
  const { customReactions, total } = useMemo(() => {
    return {
      total: customReactionsData?.pages?.slice(-1)?.[0]?.total_count,
      customReactions: flattenInfiniteData(customReactionsData)
    }
  }, [customReactionsData])

  return (
    <div className='flex flex-col'>
      {customReactions && customReactions.length > 0 ? (
        <div className='grid grid-cols-[minmax(0,_1fr)_min-content_min-content]'>
          {customReactions.map((customReaction) => (
            <CustomReactionRow key={customReaction.id} customReaction={customReaction} />
          ))}
        </div>
      ) : isFetching && !customReactionsData ? (
        <div className='p-4'>
          <FullPageLoading />
        </div>
      ) : (
        <div className='flex flex-col place-items-center justify-center gap-2 p-6'>
          <UIText tertiary>No custom emojis added yet</UIText>
          <Link href={`/${scope}/settings/emojis/packs`} className='text-center text-blue-500 hover:underline'>
            <UIText inherit>Install emoji packs</UIText>
          </Link>
        </div>
      )}

      <SettingsTableFooter
        resource='emojis'
        length={customReactions?.length}
        total={total}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}

interface CustomReactionRowProps {
  customReaction: CustomReaction
}

function CustomReactionRow({ customReaction }: CustomReactionRowProps) {
  return (
    <div className='col-span-3 grid grid-cols-subgrid items-center justify-between gap-3 border-t p-3 first:border-0'>
      <div className='flex flex-1 flex-row items-center gap-2.5'>
        <Image
          src={customReaction.file_url}
          alt={customReaction.name}
          className='h-6 w-6 object-contain'
          width={24}
          height={24}
        />
        <UIText weight='font-medium' className='truncate'>
          :{customReaction.name}:
        </UIText>
      </div>

      <div className='flex flex-row items-center justify-start gap-2.5'>
        <Avatar
          name={customReaction.creator.user.display_name}
          size='xs'
          urls={customReaction.creator.user.avatar_urls}
        />
        <UIText className='max-w-28 truncate' tertiary>
          {customReaction.creator.user.display_name}
        </UIText>
      </div>

      <DeleteCustomReaction customReaction={customReaction} />
    </div>
  )
}
