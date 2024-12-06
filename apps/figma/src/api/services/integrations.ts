import { useIsDesktopApp } from '@campsite/ui/src/hooks'

export type AuthorizationUrlOptions = {
  auth_url: string
  success_path?: string
  enable_notifications?: boolean
}

export function useAuthorizationUrl({ enable_notifications, ...rest }: AuthorizationUrlOptions) {
  const isDesktop = useIsDesktopApp()
  const params: { [key: string]: string } = rest

  if (enable_notifications) params.enable_notifications = 'true'
  if (isDesktop) params.desktop_app = 'true'

  return `${window.AUTH_URL}/integrations/auth/new?${new URLSearchParams(params).toString()}`
}
