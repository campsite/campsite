import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

function getPinsBookmarksClient(accessToken?: string | null) {
  return getConvexServerClient(accessToken)
}

export async function getProjectBookmarks(accessToken: string, data: { slug: string; projectId: string }) {
  return await getPinsBookmarksClient(accessToken).query(api.pinsBookmarks.getProjectBookmarks, data)
}

export async function createProjectBookmark(
  accessToken: string,
  data: { slug: string; projectId: string; title: string; url: string }
) {
  return await getPinsBookmarksClient(accessToken).mutation(api.pinsBookmarks.createProjectBookmark, data)
}

export async function updateProjectBookmark(
  accessToken: string,
  data: { slug: string; projectId: string; bookmarkId: string; title: string; url: string }
) {
  return await getPinsBookmarksClient(accessToken).mutation(api.pinsBookmarks.updateProjectBookmark, data)
}

export async function deleteProjectBookmark(
  accessToken: string,
  data: { slug: string; projectId: string; bookmarkId: string }
) {
  return await getPinsBookmarksClient(accessToken).mutation(api.pinsBookmarks.deleteProjectBookmark, data)
}

export async function reorderProjectBookmarks(
  accessToken: string,
  data: {
    slug: string
    projectId: string
    bookmarks: {
      id: string
      position: number
    }[]
  }
) {
  return await getPinsBookmarksClient(accessToken).mutation(api.pinsBookmarks.reorderProjectBookmarks, data)
}

export async function getProjectPins(accessToken: string, data: { slug: string; projectId: string }) {
  return await getPinsBookmarksClient(accessToken).action(api.pinsBookmarks.getProjectPins, data)
}

export async function createProjectPin(
  accessToken: string,
  data: {
    slug: string
    subjectType: 'Post' | 'Note' | 'Call'
    subjectId: string
  }
) {
  return await getPinsBookmarksClient(accessToken).action(api.pinsBookmarks.createProjectPin, data)
}

export async function deleteProjectPin(accessToken: string, data: { slug: string; pinId: string }) {
  return await getPinsBookmarksClient(accessToken).mutation(api.pinsBookmarks.deleteProjectPin, data)
}
