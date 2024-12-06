import { useState } from 'react'
import { HMSRoomProvider } from '@100mslive/react-sdk'
import { ShortcutProvider } from '@shopify/react-shortcuts'
import { QueryClientProvider } from '@tanstack/react-query'
import ConfirmEmailGuard from 'components/ConfirmEmailGuard'
import { domMax, LazyMotion } from 'framer-motion'
import { HotkeysProvider } from 'react-hotkeys-hook'

import { ActiveModalityProvider } from '@campsite/ui/hooks/useActiveModality'
import { ToasterProvider } from '@campsite/ui/Toast'

import { AutoTimezoneSwitcher } from '@/components/AutoTimezoneSwitcher'
import { IncomingCallRoomInvitationToast } from '@/components/Call/IncomingCallRoomInvitationToast'
import { LocalCommandMenu } from '@/components/CommandMenu'
import { FeedbackDialog } from '@/components/Feedback/FeedbackDialog'
import { GlobalKeyboardShortcuts } from '@/components/GlobalKeyboardShortcuts'
import { DevModeBanner } from '@/components/NavigationSidebar/DevModeBanner'
import { PostComposer } from '@/components/PostComposer'
import { AuthProvider } from '@/components/Providers/AuthProvider'
import { BackgroundAppRefresh } from '@/components/Providers/BackgroundAppRefresh'
import { DesktopProtocolUrlHandler } from '@/components/Providers/DesktopProtocolUrlHandler'
import { DesktopRedirectProvider } from '@/components/Providers/DesktopRedirectProvider'
import { DisableZoom } from '@/components/Providers/DisableZoom'
import { HMSRoomStateSubscriber } from '@/components/Providers/HMSRoomStateSubscriber'
import { MetaTags } from '@/components/Providers/MetaTags'
import { ThemeProvider } from '@/components/Providers/ThemeProvider'
import { StaffDevTools } from '@/components/StaffDevTools'
import { PusherProvider } from '@/contexts/pusher'
import { ScopeProvider } from '@/contexts/scope'
import { WebPushProvider } from '@/contexts/WebPush'
import { OrganizationUserPresenceSubscription } from '@/hooks/useCurrentOrganizationPresenceChannel'
import { QueryNormalizerProvider } from '@/utils/normy/QueryNormalizerProvider'
import { queryClient } from '@/utils/queryClient'
import { getNormalizedKey } from '@/utils/queryNormalization'
import { PageWithProviders } from '@/utils/types'

import { HistoryProvider } from './HistoryProvider'

export const AuthAppProviders: PageWithProviders<any> = ({ children, allowLoggedOut = false, postSeoInfo }) => {
  const [client] = useState(() => queryClient())

  return (
    <LazyMotion features={domMax}>
      <HistoryProvider>
        <HotkeysProvider>
          <QueryNormalizerProvider
            queryClient={client}
            normalizerConfig={{
              getNormalizationObjectKey: getNormalizedKey,
              devLogging: false,
              normalize: true
            }}
          >
            <QueryClientProvider client={client}>
              <ScopeProvider>
                <ThemeProvider>
                  <MetaTags postSeoInfo={postSeoInfo} />
                  <HMSRoomProvider>
                    <HMSRoomStateSubscriber />
                    <AuthProvider allowLoggedOut={allowLoggedOut}>
                      <WebPushProvider>
                        <PusherProvider>
                          <IncomingCallRoomInvitationToast />
                          <DesktopRedirectProvider>
                            <ShortcutProvider>
                              <DisableZoom />
                              <ToasterProvider />
                              <StaffDevTools />
                              <FeedbackDialog />
                              <LocalCommandMenu />
                              <BackgroundAppRefresh />
                              <DevModeBanner />
                              <GlobalKeyboardShortcuts />
                              <DesktopProtocolUrlHandler />
                              <PostComposer />
                              <AutoTimezoneSwitcher />
                              <ActiveModalityProvider />

                              <ConfirmEmailGuard allowLoggedOut={allowLoggedOut}>
                                {children}

                                <OrganizationUserPresenceSubscription />
                              </ConfirmEmailGuard>
                            </ShortcutProvider>
                          </DesktopRedirectProvider>
                        </PusherProvider>
                      </WebPushProvider>
                    </AuthProvider>
                  </HMSRoomProvider>
                </ThemeProvider>
              </ScopeProvider>
            </QueryClientProvider>
          </QueryNormalizerProvider>
        </HotkeysProvider>
      </HistoryProvider>
    </LazyMotion>
  )
}

export default AuthAppProviders
