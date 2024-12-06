import { useEffect } from 'react'

import { useAppFocused } from '@/hooks/useAppFocused'
import { useCreatePostView } from '@/hooks/useCreatePostView'

interface Props {
  postId: string
  isFetching: boolean
}

/**
 * Create a PostView when a user views a Post for more than a certain amount of time.
 * Also create a PostView when the app is focused or unseen comment count changes.
 *
 * Note 1: if the Post `isFetching`, then delay creating the PostView to avoid race conditions. Otherwise,
 * we can get in a state where we create a PostView while the Post is still being fetched. Depending on
 * the order of responses the following race condition could happen:
 *
 * 1. Post is fetched
 * 2. PostView mutation is triggered
 * 3. PostView mutation comes back as succesfull and marks the post as read
 * 4. Stale Post response comes back and removes the PostView
 *
 * This will lead to a UI flicker as the PostView is created and then removed, resulting in an incorrect
 * final UI state.
 *
 * Note 2: It is **crucial** to base the logic based on `isFetching` rather than other params like `isLoading`
 * or `isSuccess`:
 *
 * - `isFetching`: a derived boolean from the `fetchStatus` variable above, provided for convenience.
 * - `isLoading`: is true whenever the first fetch for a query is in-flight, the same as `isFetching && isPending`
 *
 * The key point is that the Post query could be already cached in the normalized store, which we'll make `isLoading`
 * always false even though the data could be revalidating (aka fetching) due to the `useQuery` config.
 */
export function useCreateActivePostView({ postId, isFetching }: Props) {
  const { mutate: createPostView } = useCreatePostView()
  const appFocused = useAppFocused()

  useEffect(() => {
    if (!isFetching && appFocused) {
      createPostView({ postId, read: true, clearUnseenComments: true })
    }
  }, [createPostView, isFetching, postId, appFocused])
}
