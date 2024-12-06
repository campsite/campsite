type Props = {
  userId: string
  displayName: string
  username: string
  role: 'member' | 'app'
}

export function createMentionHtml({ userId, displayName, username, role = 'member' }: Props) {
  return `<span data-type="mention" class="mention" data-id="${userId}" data-label="${displayName}" data-role="${role}" data-username="${username}">@${displayName}</span>`
}
