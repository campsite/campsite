import { useCallback, useState } from 'react'
import Image from 'next/image'

import { CustomReactionsPack } from '@campsite/types'
import { Button, ChevronRightIcon, cn, UIText } from '@campsite/ui'

import { FullPageLoading } from '@/components/FullPageLoading'
import { useCreateCustomReactionsPack } from '@/hooks/useCreateCustomReactionsPack'
import { useDeleteCustomReactionsPack } from '@/hooks/useDeleteCustomReactionsPack'
import { useGetCustomReactionsPacks } from '@/hooks/useGetCustomReactionsPacks'

export function CustomReactionsPacks() {
  const { data: packs, isLoading } = useGetCustomReactionsPacks()

  if (isLoading) {
    return (
      <div className='p-4'>
        <FullPageLoading />
      </div>
    )
  }

  return (
    <div className='divide-secondary flex flex-col divide-y'>
      {packs?.map((pack) => <Pack key={pack.name} pack={pack} />)}
    </div>
  )
}

function Pack({ pack }: { pack: CustomReactionsPack }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='flex flex-col'>
      <div key={pack.name} className='grid grid-cols-[32px,1fr] items-center gap-3 p-3'>
        <Button
          variant='plain'
          accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
          iconOnly={
            <ChevronRightIcon
              className={cn('transition-all', {
                'rotate-90 transform': expanded
              })}
            />
          }
          onClick={() => setExpanded(!expanded)}
        />
        <div className='flex items-center gap-3'>
          <Image src={pack.items[0].file_url} alt={pack.name} width={32} height={32} />
          <div className='flex flex-1 flex-col'>
            <UIText weight='font-medium'>{pack.name}</UIText>
            <UIText tertiary>{pack.items.length} emojis</UIText>
          </div>
          <PackButton pack={pack} />
        </div>
      </div>
      {expanded && (
        <div className='grid grid-cols-[32px,1fr] gap-3'>
          <div />
          <div className='flex flex-wrap gap-2 p-3 pt-0'>
            {pack.items.map((item) => (
              <div key={item.name} className='flex items-center gap-3'>
                <Image src={item.file_url} alt={item.name} width={24} height={24} title={item.name} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PackButtonProps {
  pack: CustomReactionsPack
}

function PackButton({ pack }: PackButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const createCustomReactionsPack = useCreateCustomReactionsPack()
  const deleteCustomReactionsPack = useDeleteCustomReactionsPack()
  const loading = createCustomReactionsPack.isPending || deleteCustomReactionsPack.isPending

  const handleOnMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleOnMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <Button
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      variant={pack.installed ? 'flat' : 'base'}
      onClick={() => {
        if (pack.installed) {
          deleteCustomReactionsPack.mutate(pack)
        } else {
          createCustomReactionsPack.mutate(pack)
        }
      }}
      loading={loading}
    >
      {pack.installed ? (isHovered ? 'Uninstall' : 'Installed') : 'Install'}
    </Button>
  )
}
