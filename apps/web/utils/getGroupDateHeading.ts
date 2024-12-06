export function getGroupDateHeading(date: string) {
  const isToday = new Date(date).toLocaleDateString() === new Date().toLocaleDateString()
  const isYesterday = new Date(date).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString()
  const dateHeading = isToday
    ? 'Today'
    : isYesterday
      ? 'Yesterday'
      : new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })

  return dateHeading
}
