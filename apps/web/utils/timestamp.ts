export function timestamp(timestamp: string | Date) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  })
}

export function longTimestamp(timestamp: string, overrides?: Intl.DateTimeFormatOptions) {
  return longTimestampFromDate(new Date(timestamp), overrides)
}

export function longTimestampFromDate(timestamp: Date, overrides?: Intl.DateTimeFormatOptions) {
  return timestamp.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    ...overrides
  })
}
