export function convertNumberToTimestring(number: number) {
  const round = Math.round(Math.floor(number))
  const minutes = Math.floor(round / 60)
  const seconds = round % 60

  if (seconds < 10) {
    return `${minutes}:0${seconds}`
  }

  return `${minutes}:${seconds}`
}
