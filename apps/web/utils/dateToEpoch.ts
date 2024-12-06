export const MS_IN_DAY = 86400000

export function dateToEpoch(date: Date) {
  const time = date.getTime()

  return time - (time % MS_IN_DAY)
}
