import { notEmpty } from './notEmpty'

type ClipboardEvent = {
  clipboardData?: DataTransfer | null
  nativeEvent: {
    clipboardData?: DataTransfer | null
  }
}

export function filesFromClipboardData(event: ClipboardEvent) {
  return Array.from((event.clipboardData || event.nativeEvent.clipboardData)?.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter(notEmpty)
}
