import { ReactElement, ReactNode } from 'react'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'

export type ApiErrorResponse = {
  code: string
  message: string
}

export type AppPropsWithLayout<T> = AppProps & {
  Component: NextPageWithLayout<T>
}

type NextPageWithLayout<T> = NextPage & {
  getLayout?: (page: ReactElement, props: T) => ReactNode
  getProviders?: (page: ReactElement, props: T) => ReactNode
}

type NextPageWithProviders<T> = NextPage & {
  getProviders?: (page: ReactElement, props: T) => ReactNode
}

export type PageWithLayout<T> = React.FC<T> & NextPageWithLayout<T> & NextPageWithProviders<T>

export type PageWithProviders<T> = React.FC<T> & NextPageWithProviders<T>

/*
  Why does a transformed file need an id?

  We use the id to do find-and-replace in the web composer Files state. This is
  useful for when a user uploads a video, and we asynchronously upload a poster
  screenshot as the `preview_file_path` — we want to update the single
  transformed file, and need some unique identifer to do it correctly.
*/
export type TransformedFile = {
  id: string
  raw: File
  url: string
  optimistic_src: string | null
  key: string | null
  type: string
  duration?: number
  preview?: File
  preview_file_path: string | null
  relative_url: string | null
  error: Error | null
  width?: number
  height?: number
  name?: string | null
  size?: number | null
}

export type PresignedResource =
  | 'Organization'
  | 'Post'
  | 'User'
  | 'UserCoverPhoto'
  | 'Project'
  | 'FeedbackLogs'
  | 'MessageThread'
  | 'OauthApplication'

export enum NotificationName {
  WeeklyDigest = 'weekly_digest',
  DailyDigest = 'daily_digest',
  ProjectReminder = 'project_reminder'
}

export type Changelog = {
  title: string
  slug: string
  published_at: string
}
