export type Contributor = {
  name: string
  username: string
  twitter: string
  avatar: string
}

export type Changelog = {
  content: string
  content_html: string
  data: {
    title: string
    slug: string
    date: string
    isoDate: string
    feature_image?: string | null
    contributors?: Contributor[]
    ignore?: boolean
    prerelease?: boolean
  }
}

export type GitHubRelease = {
  id: number
  tag_name: string
  name: string
  body: string
  prerelease: boolean
}
