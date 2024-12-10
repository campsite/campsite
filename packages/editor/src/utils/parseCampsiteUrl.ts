const CAMPSITE_PATH_REGEX = /\/(?<org>[a-z0-9-]+)\/(?<subject>notes|posts|projects|calls)\/(?<id>[a-z0-9]{12}$)/i
const COMMENT_HASH_REGEX = /#comment-(?<commentId>[a-zA-Z0-9]+)/

export type CampsiteUrlSubjectType = 'notes' | 'posts' | 'projects' | 'calls' | 'comment'

interface ParsedCampsiteUrl {
  org: string
  subject: CampsiteUrlSubjectType
  id: string
}

const isValidSubject = (s: string | undefined): s is CampsiteUrlSubjectType =>
  s === 'notes' || s === 'posts' || s === 'projects' || s === 'calls' || s === 'comment'

export function parseCampsiteUrl(href: string): ParsedCampsiteUrl | null {
  let url: URL | undefined

  try {
    url = new URL(href)
  } catch {
    return null
  }

  const pathResult = CAMPSITE_PATH_REGEX.exec(url.pathname)
  const pathGroups = pathResult?.groups
  let { org, subject, id } = pathGroups || {}

  // Check for comment in the hash
  const hashResult = COMMENT_HASH_REGEX.exec(url.hash)

  if (hashResult && hashResult.groups?.commentId) {
    subject = 'comment'
    id = hashResult.groups?.commentId
  }

  if (!isValidSubject(subject)) {
    return null
  }

  return { org, id, subject }
}
