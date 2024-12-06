import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { OauthApplication } from '@campsite/types'
import { Button } from '@campsite/ui'

import { CopySecretDialog } from '@/components/OrgSettings/OauthApplications/CopySecretDialog'
import { useCreateOauthAccessToken } from '@/hooks/useCreateOauthAccessToken'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function DeveloperTokenButton({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const [open, setOpen] = useState(false)
  const [secret, setSecret] = useState('')
  const { mutate: createOauthAccessToken } = useCreateOauthAccessToken()

  const handleClick = () => {
    createOauthAccessToken(
      { oauthApplicationId: oauthApplication.id },
      {
        onSuccess: (res) => {
          setSecret(res.token)
          setOpen(true)
          toast('API key generated')
        },
        onError: apiErrorToast
      }
    )
  }

  return (
    <>
      <Button onClick={handleClick} type='button' variant='base'>
        Generate API key
      </Button>
      <CopySecretDialog open={open} onOpenChange={setOpen} secret={secret} keyType='api_key' />
    </>
  )
}
