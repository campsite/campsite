import { QueryClient, QueryKey } from '@tanstack/react-query'
import { CookieValueTypes } from 'cookies-next'

import { Favorite, MessageThread, Project } from '@campsite/types'

import { apiClient, getTypedQueryData, setTypedQueriesData } from './queryClient'

const optimisticPrefix = 'temp'

type InsertOptimisticFavoriteOpts = {
  queryClient: QueryClient
  scope: CookieValueTypes
  favoritableId: string
  favoritableType: Favorite['favoritable_type']
  name: string
  project?: Project | null
  messageThread?: MessageThread | null
  url: string
}

export function insertOptimisticFavorite({
  queryClient,
  scope,
  favoritableId,
  favoritableType,
  name,
  project = null,
  messageThread = null,
  url
}: InsertOptimisticFavoriteOpts) {
  const newFavorite = {
    id: `${optimisticPrefix}-${favoritableId}`,
    favoritable_id: favoritableId,
    favoritable_type: favoritableType,
    created_at: new Date().toISOString(),
    name,
    accessory: project?.accessory ?? '',
    position: 999,
    url,
    private: !!project?.private,
    project,
    message_thread: messageThread
  }

  setTypedQueriesData(queryClient, apiClient.organizations.getFavorites().requestKey(`${scope}`), (old) => {
    if (!old) {
      return [newFavorite]
    } else {
      return [...old, newFavorite]
    }
  })

  return newFavorite
}

export function isOptimisticFavorite(favorite: Favorite) {
  return favorite.id.startsWith(optimisticPrefix)
}

type ReplaceOptimisticFavoriteOpts = {
  queryClient: QueryClient
  scope: CookieValueTypes
  favoritableId: string
  data: any
}

export function replaceOptimisticFavorite({ queryClient, scope, favoritableId, data }: ReplaceOptimisticFavoriteOpts) {
  setTypedQueriesData(queryClient, apiClient.organizations.getFavorites().requestKey(`${scope}`), (old) => {
    if (!old) return

    return old.map((favorite) => {
      if (favorite.id === `temp-${favoritableId}`) {
        const updated = {
          ...favorite,
          ...data
        }

        return updated
      }

      return favorite
    })
  })
}

type RemoveFavoriteOpts = {
  queryClient: QueryClient
  scope: CookieValueTypes
  resourceId: string
}

export async function removeFavorite({ queryClient, scope, resourceId }: RemoveFavoriteOpts) {
  const queryKey = apiClient.organizations.getFavorites().requestKey(`${scope}`)

  await queryClient.cancelQueries({ queryKey })

  const previous = getTypedQueryData(queryClient, queryKey)

  setTypedQueriesData(queryClient, queryKey, (old) => {
    if (!old) return

    return old.filter((favorite) => favorite.favoritable_id !== resourceId)
  })

  return { removeFavoriteRollbackData: { queryKey: queryKey as QueryKey, data: previous } }
}
