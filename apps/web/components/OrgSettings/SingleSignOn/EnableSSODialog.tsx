import { KeyboardEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { Button, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useEnableSSO } from '@/hooks/useEnableSSO'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  open: boolean
  onOpenChange: (bool: boolean) => void
  onComplete: () => void
}

interface Domain {
  id: number
  value: string
}

export function EnableSSODialog({ open, onOpenChange, onComplete }: Props) {
  const enableSSO = useEnableSSO()
  const [domains, setDomains] = useState<Domain[]>([])
  const [currentDomain, setCurrentDomain] = useState<string>('')

  useEffect(() => {
    if (!open) {
      setDomains([])
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: any) {
    e.preventDefault()

    enableSSO.mutate(
      { domains: domains.map((d) => d.value) },
      {
        onSuccess: async () => {
          toast('Successfully enabled SSO authentication for your domains.')
          onComplete()
        },
        onError: apiErrorToast
      }
    )
  }

  function handleChange(value: string) {
    setCurrentDomain(value)
  }

  function handleAdd() {
    setCurrentDomain('')

    setDomains((state) => [
      ...state,
      {
        id: state.length + 1,
        value: currentDomain
      }
    ])
  }

  function handleRemove(id: number) {
    setDomains(domains.filter((domain) => domain.id !== id))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Enable Single Sign-On</Dialog.Title>
      </Dialog.Header>

      <form onSubmit={handleSubmit} autoComplete='off'>
        <Dialog.Content>
          <div className='flex flex-col gap-3 pb-3'>
            <UIText tertiary>Add your organization domains to enable SSO authentication.</UIText>
            <div className='flex space-x-3'>
              <div className='w-full'>
                <TextField
                  type='text'
                  placeholder='example.com'
                  value={currentDomain}
                  autoFocus
                  onChange={handleChange}
                  onKeyDownCapture={(e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      handleAdd()
                      e.preventDefault()
                      e?.stopPropagation()
                    }
                  }}
                />
              </div>
              <div>
                <Button disabled={!currentDomain} onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </div>

            {!!domains.length && (
              <div className='bg-quaternary flex flex-col divide-y rounded-lg px-4 py-1'>
                {domains.map((domain) => {
                  return (
                    <div key={domain.id} className='flex items-center space-x-2 py-3 text-sm'>
                      <UIText secondary className='flex-1 text-left'>
                        {domain.value}
                      </UIText>
                      <div className='flex-1 text-right'>
                        <Button onClick={() => handleRemove(domain.id)}>Remove</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button variant='flat' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={domains.length === 0}
              loading={enableSSO.isPending}
              onClick={handleSubmit}
              variant='primary'
            >
              Enable
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </Dialog.Root>
  )
}
