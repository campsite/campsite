import Pusher from 'pusher-js'

export const pusher = new Pusher(window.PUSHER_KEY, {
  cluster: window.PUSHER_APP_CLUSTER,
  channelAuthorization: { endpoint: new URL('/v1/pusher/auth', window.API_URL).toString(), transport: 'ajax' }
})
