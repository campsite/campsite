import { useEffect, useState } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { toUint8Array } from 'js-base64'
import * as Y from 'yjs'

import { SYNC_URL } from '@campsite/config'
import { NOTE_SCHEMA_VERSION } from '@campsite/editor'
import { useScope } from '@/contexts/scope'
import { useCurrentUserIsLoggedIn } from '@/hooks/useCurrentUserIsLoggedIn'

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
    if (!SYNC_URL) {
      return null
    }

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
      token: async () => {
        const response = await fetch('/v1/users/me/sync-token', {
          body: JSON.stringify({
            orgSlug: scope,
            resourceId,
            resourceType
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        })

        if (!response.ok) {
          return ''
        }

        const payload = (await response.json()) as { token?: string }

        return payload.token || ''
      },
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
    if (!provider) {
      setSyncState('disconnected')
      return
    }

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
