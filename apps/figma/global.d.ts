declare global {
  interface Window {
    APP_URL: string
    AUTH_URL: string
    API_URL: string
    PUSHER_KEY: string
    PUSHER_APP_CLUSTER: string
    SLACKBOT_CLIENT_ID: string
  }
}

export {}
