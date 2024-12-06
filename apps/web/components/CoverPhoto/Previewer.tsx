import Image from 'next/image'

import { TrashIcon } from '@campsite/ui'

interface Props {
  src: string
  onRemove: () => void
}

export function CoverPhotoPreview(props: Props) {
  const { src, onRemove } = props

  return (
    <div className='relative flex w-full'>
      <Image
        src={src}
        width={1280}
        height={426}
        alt='Cover photo'
        className='mx-auto mt-0 aspect-[3/1] w-full place-content-start rounded-md border object-cover object-center'
      />

      {src && (
        <button
          onClick={onRemove}
          type='button'
          className='bg-primary absolute -bottom-2 -right-2 flex translate-y-0 cursor-pointer items-center justify-center rounded-full p-2 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg'
        >
          <TrashIcon />
        </button>
      )}
    </div>
  )
}
