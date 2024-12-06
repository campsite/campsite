import { commandScore } from '@campsite/ui'

export function commandScoreSort<T>(items: T[], query: string, search: (item: T) => string) {
  return items
    .map((item) => {
      const score = commandScore(search(item), query)

      return { score, item }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (a.score === b.score) {
        return search(a.item).localeCompare(search(b.item))
      }
      return b.score - a.score
    })
    .map(({ item }) => item)
}
