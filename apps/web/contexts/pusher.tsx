import { createContext, useContext, useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import Ajax from 'pusher-js/types/src/core/http/ajax'

import { PUSHER_APP_CLUSTER, PUSHER_KEY } from '@campsite/config'

const PusherContext = createContext<Pusher | null>(null)
let hasWarnedMissingPusherConfig = false

interface Props {
  children: React.ReactNode
}

export const PusherProvider: React.FC<Props> = ({ children }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null)

  useEffect(() => {
    if (!PUSHER_KEY) {
      if (!hasWarnedMissingPusherConfig) {
        hasWarnedMissingPusherConfig = true
        console.warn('Pusher is not configured. Set NEXT_PUBLIC_PUSHER_KEY and PUSHER_SECRET to enable realtime.')
      }

      return
    }

    // https://github.com/pusher/pusher-js/issues/471#issuecomment-659107992
    Pusher.Runtime.createXHR = function () {
      var xhr = new XMLHttpRequest() as Ajax

      xhr.withCredentials = true
      return xhr
    }

    const connection = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      channelAuthorization: { endpoint: '/v1/pusher/auth', transport: 'ajax' }
    })

    setPusher(connection)

    return () => {
      connection.disconnect()
    }
  }, [])

  return <PusherContext.Provider value={pusher}>{children}</PusherContext.Provider>
}

export const usePusher = () => useContext(PusherContext)

export const usePusherSocketIdHeader = () => {
  const pusher = usePusher()

  return pusher?.connection?.socket_id ? { 'X-Pusher-Socket-ID': pusher.connection.socket_id } : undefined
}
