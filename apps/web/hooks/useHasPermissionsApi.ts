import { useEffect, useState } from 'react'

export function useHasPermissionsAPI() {
  const [hasPermissionsAPI, setHasPermissionsAPI] = useState(false)

  useEffect(() => {
    if (!('permissions' in navigator && 'query' in navigator.permissions)) {
      setHasPermissionsAPI(false)
      return
    }

    navigator.permissions
      .query({
        // @ts-ignore: FireFox doesn't support camera/microphone. use exceptions to switch to fallback check.
        name: 'camera'
      })
      .then(() => {
        setHasPermissionsAPI(true)
      })
      .catch(() => {
        setHasPermissionsAPI(false)
      })
  }, [])

  return { hasPermissionsAPI }
}
