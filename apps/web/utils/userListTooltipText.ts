import { User } from '@campsite/types'

type Props = {
  users: User[]
  limit?: number
  prefix?: string
  totalUserCount?: number
}

export function userListTooltipText(props: Props) {
  const { users, limit = 3, prefix, totalUserCount = users.length } = props

  // if the users count one greater than the limit,
  // instead of showing "+1, we can include the last user in the string
  const shouldIncludeExtraUser = totalUserCount === limit + 1
  const adjustedLimit = shouldIncludeExtraUser ? limit + 1 : limit
  const overflowCount = totalUserCount < adjustedLimit ? totalUserCount - users.length : totalUserCount - adjustedLimit

  const reduction = users.slice(0, adjustedLimit).reduce((acc, user) => {
    acc += user.display_name + ', '
    return acc
  }, '')

  // remove trailing comma and space
  let text = reduction.slice(0, -2)

  if (overflowCount > 0) {
    text = `${text} + ${overflowCount} more`
  }

  if (prefix) {
    text = `${prefix} ${text}`
  }

  return text
}
