import { useEffect, useState } from 'react'

import { EditorSyncState } from '../Post/Notes/useEditorSync'

/**
 * If the user is disconnected from the sync server for more than 5 seconds
 * at any point, show connection error and inform the user that changes cannot be saved.
 *
 * The same logic should also apply if the initial connection sync is taking too long.
 */
export function useHasConnectionIssue(syncState: EditorSyncState) {
  const [showConnectionError, setShowConnectionError] = useState(false)

  useEffect(() => {
    if (syncState === 'connected') {
      setShowConnectionError(false)
    }

    if (syncState === 'connecting') {
      const timeout = setTimeout(() => {
        setShowConnectionError(true)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [syncState])

  return showConnectionError
}
