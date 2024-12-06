import { CheckIcon, ExternalLinkIcon, isValidUrl, Link, TextField, TrashIcon } from '@campsite/ui'

export interface AnyEvent {
  preventDefault: () => void
  stopPropagation: () => void
}

interface Props {
  url: string
  onChangeUrl: (value: string) => void
  onSaveLink: (e: AnyEvent) => void
  onRemoveLink: (e: AnyEvent) => void
}

export function LinkEditor({ url, onChangeUrl, onSaveLink, onRemoveLink }: Props) {
  function handleEnter(e: any) {
    e.preventDefault()
    e.stopPropagation()
    onSaveLink(e)
  }

  return (
    <div className='flex items-center gap-1'>
      <div onClickCapture={(e) => e.stopPropagation()}>
        <TextField
          placeholder='Enter a url...'
          autoFocus
          value={url}
          onChange={onChangeUrl}
          onKeyDownCapture={(e) => {
            if (e?.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              onSaveLink(e)
            }
          }}
        />
      </div>
      <button
        type='button'
        onClick={handleEnter}
        className='flex h-7 w-7 flex-none items-center justify-center rounded bg-blue-500 p-1 hover:bg-blue-400'
      >
        <CheckIcon />
      </button>
      <button
        type='button'
        onClick={onRemoveLink}
        className='flex h-7 w-7 flex-none items-center justify-center rounded p-1 hover:bg-red-500'
      >
        <TrashIcon />
      </button>
      {!!url && isValidUrl(url) && (
        <Link
          href={url}
          target='_blank'
          className='hover:bg-quaternary flex h-7 w-7 flex-none items-center justify-center rounded p-1'
          forceInternalLinksBlank
        >
          <ExternalLinkIcon />
        </Link>
      )}
    </div>
  )
}
