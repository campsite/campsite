import { useMutation } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { ProductLogsPostRequest } from '@campsite/types/generated'

import { client } from '../client'

type Event = ProductLogsPostRequest['events'][0]

export function useCreateEvents() {
  const token = useToken()

  return useMutation({
    mutationFn: (...events: Event[]) =>
      client.productLogs.postProductLogs().request(
        {
          events
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
  })
}
