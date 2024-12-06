import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostRequest, Post, PostPage } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

export function prependNewPost<Page extends { data: Post[] }>(post: Post) {
  return (old: InfiniteData<Page> | undefined): InfiniteData<Page> | undefined => {
    if (!old) return old

    const [firstPage, ...pages] = old.pages

    return {
      ...old,
      pages: [
        {
          ...firstPage,
          data: [post, ...firstPage.data]
        },
        ...pages
      ]
    }
  }
}

export function bumpPostToTop<Page extends { data: Post[] }>(post: Post) {
  return (old: InfiniteData<Page> | undefined): InfiniteData<Page> | undefined => {
    if (!old) return old

    const dataWithPostRemoved = {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((p) => p.id !== post.id)
      }))
    }

    return prependNewPost<Page>(post)(dataWithPostRemoved)
  }
}

export function publishPostToQueryCache({
  queryClient,
  scope,
  post
}: {
  queryClient: QueryClient
  scope: string
  post: Post
}) {
  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations.getPosts().requestKey({ orgSlug: post.organization.slug }),
    prependNewPost<PostPage>(post)
  )

  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations.getMembersMeForMePosts().requestKey({ orgSlug: post.organization.slug }),
    prependNewPost<PostPage>(post)
  )

  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations.getMembersMeViewerPosts().requestKey({ orgSlug: post.organization.slug }),
    prependNewPost<PostPage>(post)
  )

  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations
      .getProjectsPosts()
      .requestKey({ orgSlug: post.organization.slug, projectId: post.project.id }),
    prependNewPost<PostPage>(post)
  )

  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations.getMembersPosts().requestKey({ orgSlug: scope, username: post.member.user.username }),
    prependNewPost<PostPage>(post)
  )

  queryClient.invalidateQueries({
    queryKey: apiClient.organizations.getPostsVersions().requestKey(scope, post.id)
  })

  queryClient.invalidateQueries({
    queryKey: apiClient.organizations.getTagsPosts().baseKey
  })

  setTypedInfiniteQueriesData(
    queryClient,
    apiClient.organizations.getMembersMeForMePosts().requestKey({ orgSlug: scope }),
    prependNewPost<PostPage>(post)
  )
}

export function useCreatePost() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPostsPostRequest) =>
      apiClient.organizations.postPosts().request(`${scope}`, data, { headers: pusherSocketIdHeader }),
    onSuccess: (post, data) => {
      if (post.published) {
        publishPostToQueryCache({ queryClient, scope: `${scope}`, post })
      } else {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations.getMembersMePersonalDraftPosts().requestKey({ orgSlug: `${scope}` }),
          prependNewPost<PostPage>(post)
        )
      }

      if (data.from_message_id) {
        setTypedInfiniteQueriesData(queryClient, apiClient.organizations.getThreadsMessages().baseKey, (old) => {
          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((message) =>
                message.id === data.from_message_id ? { ...message, shared_post_url: post.url } : message
              )
            }))
          }
        })
      }

      /*
        If the post is a new version, invalidate the feed and channel view entirely
        so that we roll up any previous versions. This is easier than trying to do a
        bunch of manual cache updates.
      */
      if (post.has_parent) {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getPosts().requestKey({ orgSlug: post.organization.slug })
        })

        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getProjectsPosts().requestKey({
            orgSlug: post.organization.slug,
            projectId: post.project.id
          })
        })
      }
    },
    onError: apiErrorToast
  })
}
