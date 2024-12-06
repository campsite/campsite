import { useEffect, useState } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { toUint8Array } from 'js-base64'
import * as Y from 'yjs'

import { SYNC_URL } from '@campsite/config'
import { NOTE_SCHEMA_VERSION } from '@campsite/editor'
import { ApiError } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useCurrentUserIsLoggedIn } from '@/hooks/useCurrentUserIsLoggedIn'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export type EditorSyncState = 'connecting' | 'connected' | 'disconnected'
type EditorSyncError = 'error' | 'invalid-schema'

interface Props {
  resourceId: string
  resourceType: 'Post' | 'Note'
  initialState: string | null | undefined
}

export function useEditorSync({ resourceId, resourceType, initialState }: Props) {
  const { scope } = useScope()
  const isLoggedIn = useCurrentUserIsLoggedIn()

  const [syncError, setSyncError] = useState<EditorSyncError | null>(null)
  const [syncState, setSyncState] = useState<EditorSyncState>('connecting')

  const [provider] = useState(() => {
    let document: Y.Doc | undefined

    if (initialState) {
      const ydoc = new Y.Doc()
      const update = toUint8Array(initialState)

      Y.applyUpdate(ydoc, update)

      document = ydoc
    }

    return new HocuspocusProvider({
      document,
      url: SYNC_URL,
      name: resourceId,
      token: () =>
        apiClient.users
          .postMeSyncToken()
          .request()
          .then((res) => res.token)
          .catch((error: ApiError) => {
            apiErrorToast(error)
            return ''
          }),
      connect: isLoggedIn,
      parameters: {
        schemaVersion: NOTE_SCHEMA_VERSION,
        organization: scope,
        type: resourceType
      },
      onStateless: (data) => {
        const message = JSON.parse(data.payload)

        if (message.type === 'schema' && NOTE_SCHEMA_VERSION < message.version) {
          setSyncError('invalid-schema')
        }
      },
      onAuthenticationFailed() {
        setSyncError('error')
      },
      onAuthenticated() {
        // don't clear invalid-schema errors on auth
        if (syncError !== 'invalid-schema') {
          setSyncError(null)
        }
      },
      onStatus(data) {
        setSyncState(data.status)
      }
    })
  })

  useEffect(() => {
    if (!provider.isConnected) {
      provider.connect()
    }

    return () => {
      if (provider.isConnected) {
        provider.disconnect()
      }
    }
  }, [provider])

  return [provider, syncState, syncError] as const
}
