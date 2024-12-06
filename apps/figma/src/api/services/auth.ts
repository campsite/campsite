import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { $figma } from 'src/core/figma'
import { pusher } from 'src/core/pusher'
import { useToken } from 'src/core/tokens'

import { client } from '../client'

export function useMeQuery() {
  const token = useToken()

  return useQuery({
    queryKey: [token, 'me'],
    queryFn: ({ signal }) =>
      client.users.getMe().request({
        signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    enabled: !!token
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const data = await client.figma.postSignInFigma().request({
        baseUrl: window.AUTH_URL
      })

      const channel = pusher.subscribe(`private-figma-${data.read_key}`)

      try {
        await new Promise<void>((resolve, reject) => {
          channel.bind('pusher:subscription_succeeded', () => {
            const params = new URLSearchParams({ write_key: data.write_key })
            const url = new URL(`/sign-in/figma/open?${params.toString()}`, window.AUTH_URL)

            window.open(url, '_blank')
          })

          channel.bind('pusher:subscription_error', (error: Error) => {
            reject(error)
          })

          channel.bind('token', (accessToken: string) => {
            $figma.emit('signin', accessToken)
            resolve()
          })
        })
      } finally {
        channel.unsubscribe()
        channel.disconnect()
      }
    },

    onSuccess: () => {
      queryClient.prefetchQuery({})
    }
  })
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: async () => {
      $figma.emit('signout')
    }
  })
}
