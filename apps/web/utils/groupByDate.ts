export function groupByDate<T>(items: T[], getDate: (item: T) => string, sortOrder: 'asc' | 'desc' = 'desc') {
  return items
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return getDate(a) < getDate(b) ? -1 : 1
      } else {
        // default to 'desc'
        return getDate(b) < getDate(a) ? -1 : 1
      }
    })
    .reduce(
      (acc, item) => {
        /**
         * The record date key needs to be convertible back to a `Date` object.
         * However, `toLocaleDateString` can result in ambiguous date formats
         * (i.e. MM/DD/YYYY vs. DD/MM/YYYY) that don't allow to be
         * re-initialized (i.e. new Date(22/02/2024) → Invalid Date).
         *
         * That's why we use a custom format, en-US - MM/DD/YYYY, that respects
         * the current timezone and is always convertible back to a `Date` object.
         */
        const date = new Date(getDate(item)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })

        if (!acc[date]) {
          acc[date] = []
        }

        acc[date].push(item)
        return acc
      },
      {} as Record<string, T[]>
    )
}
