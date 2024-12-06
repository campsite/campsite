import { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

import { RAILS_API_URL, RAILS_AUTH_URL } from '@campsite/config'
import { Api, ApiError, DataTag } from '@campsite/types'

import { ApiErrorResponse } from './types'

interface UrlProps {
  inviteToken?: string
  from?: string
}

export function signinUrl({ inviteToken, from }: UrlProps = {}): string {
  const url = new URL(RAILS_AUTH_URL)

  url.pathname = '/sign-in'

  if (inviteToken) {
    url.searchParams.append('token', inviteToken)
  }

  if (from) {
    url.searchParams.append('from', from)
  }

  return url.toString()
}

export function signUpUrl({ inviteToken, from }: UrlProps = {}): string {
  const url = new URL(RAILS_AUTH_URL)

  url.pathname = '/sign-up'

  if (inviteToken) {
    url.searchParams.append('token', inviteToken)
  }

  if (from) {
    url.searchParams.append('from', from)
  }

  return url.toString()
}

export function reauthorizeSSOUrl({
  orgSlug,
  from,
  desktop
}: {
  orgSlug: string
  from: string
  desktop: boolean
}): string {
  const url = new URL(RAILS_AUTH_URL)

  url.pathname = '/sign-in/sso/reauthorize'
  url.searchParams.append('org_slug', orgSlug)
  url.searchParams.append('from', from)
  if (desktop) url.searchParams.append('desktop', 'true')

  return url.toString()
}

type Method = 'DELETE' | 'POST' | 'PUT'

const ApiCookieName = '_campsite_api_session'

interface FetcherProps {
  method?: Method
  body?: unknown
  cookies?: Record<string, string>
}

export async function fetcher<T>(url: string, { method, body, cookies }: FetcherProps | undefined = {}): Promise<T> {
  let headers = new Headers({
    'Content-Type': 'application/json'
  })
  let credentials: RequestCredentials | undefined

  if (cookies) {
    const apiCookie = encodeURIComponent(cookies[ApiCookieName])

    headers.append('Cookie', `${ApiCookieName}=${apiCookie}`)
  } else {
    credentials = 'include'
  }

  const resp = await fetch(url, {
    method: method ? method : 'GET',
    credentials: credentials,
    body: body ? JSON.stringify(body) : undefined,
    headers
  })

  if (resp.ok) {
    if (resp.status === 204) {
      return new Promise((resolve) => resolve({} as T))
    }
    return resp.json()
  } else {
    const body: ApiErrorResponse = await resp.json()

    throw new ApiError(resp.status, body.message, body.code)
  }
}

function retry(failureCount: number, error: Error) {
  /*
    Don't retry if the error is a 4xx error — if a resource wasn't found,
    or the user doesn't have permission to access some resource, we should
    resolve the query immediately and show an error or empty state.
  */
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }

  /*
      For all non-4xx errors, retry up to 3 times. This is useful for POSTs which
      we want to retry in case of a network error or API hiccup.
    */
  return failureCount < 3
}

const networkMode = 'online'

export const queryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode,
        refetchOnWindowFocus: false,
        retry
      },
      mutations: {
        networkMode
      }
    }
  })

export const apiClient = new Api({
  baseUrl: RAILS_API_URL,
  baseApiParams: {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    format: 'json'
  }
})

type NoInfer<T> = [T][T extends any ? 0 : never]
type Updater<T> = T | undefined | ((old: T | undefined) => T | undefined)

/**
 * Updates all EXISTING query caches with new data. Will partial-match queries.
 * Works well with partial parameters or just baseKey to update all queries.
 *
 * **NOTE**: Do not use to seed new queries as this only updates caches for existing ones. Use setTypedQueryData instead.
 */
export function setTypedQueriesData<
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : unknown
>(queryClient: TQueryClient, queryKey: TaggedQueryKey, updater: Updater<NoInfer<TInferredData>>) {
  return queryClient.setQueriesData<TInferredData>({ queryKey }, updater)
}

/**
 * Update a one query cache with new data. Will seed caches even if the query has not been used.
 */
export function setTypedQueryData<
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : unknown
>(
  queryClient: TQueryClient,
  queryKey: TaggedQueryKey,
  updater: Updater<NoInfer<TInferredData>>
): TInferredData | undefined {
  return queryClient.setQueryData<TInferredData>(queryKey, updater)
}

export function setTypedInfiniteQueriesData<
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : unknown,
  TPagedData = InfiniteData<TInferredData>
>(queryClient: TQueryClient, queryKey: TaggedQueryKey, updater: Updater<NoInfer<TPagedData>>) {
  return queryClient.setQueriesData<TPagedData>({ queryKey }, updater)
}

export function getTypedQueryData<
  TData = unknown,
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : TData
>(queryClient: TQueryClient, queryKey: TaggedQueryKey) {
  return queryClient.getQueryData<TInferredData>(queryKey)
}

export function getTypedQueriesData<
  TData = unknown,
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : TData
>(queryClient: TQueryClient, queryKey: TaggedQueryKey) {
  return queryClient.getQueriesData<TInferredData>({ queryKey })
}

export function getTypedInfiniteQueryData<
  TData = unknown,
  TQueryClient extends QueryClient = QueryClient,
  TaggedQueryKey extends QueryKey = QueryKey,
  TInferredData = TaggedQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : TData
>(queryClient: TQueryClient, queryKey: TaggedQueryKey) {
  return queryClient.getQueryData<InfiniteData<TInferredData>>(queryKey)
}
