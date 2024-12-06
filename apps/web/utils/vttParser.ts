type VttLine = {
  index: number
  start: number
  end: number
  text: string
  gap: number
  speaker: string | undefined
}

const parseTimestamp = (timestamp: string) => {
  const parts = timestamp.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseFloat(parts[2])

  const time = hours * 60 * 60 + minutes * 60 + seconds

  return time || 0
}

export function parseVtt(text: string): VttLine[][] {
  const lines = text.split('\n')
  const groups = []
  let result: VttLine[] = []
  let index = 0
  let start = 0
  let end = 0
  let gap = 0
  let lastEnd = 0
  const speakerRegex = /^(?<speaker>.+):/
  let speaker: string | undefined = undefined
  let lastSpeaker: string | undefined = undefined

  for (let line of lines) {
    line = line.replace(/\suh\.?\s/gi, ' ')
    line = line.replace(/^uh\.?\s/gi, ' ')
    line = line.replace(/\suh\.?$/gi, ' ')
    line = line.replace(/^uh\.?$/gi, ' ')

    line = line.replace(/\sum\.?\s/gi, ' ')
    line = line.replace(/^um\.?\s/gi, ' ')
    line = line.replace(/\sum\.?$/gi, ' ')
    line = line.replace(/^um\.?$/gi, ' ')

    if (line.trim() === '') {
      continue
    }
    if (line.startsWith('WEBVTT')) {
      continue
    }
    if (line.startsWith('X-TIMESTAMP-MAP')) {
      continue
    }
    if (line.startsWith('NOTE')) {
      continue
    }
    if (line.startsWith('STYLE')) {
      continue
    }
    if (line.startsWith('REGION')) {
      continue
    }
    if (line.startsWith('::cue')) {
      continue
    }
    if (line.match(/^\d+$/)) {
      // Index line
      index = parseInt(line, 10)
      continue
    }

    if (line.match(/([\d:.]+)\s-->\s([\d:.]+)/)) {
      // Timestamp line
      const matches = line.match(/([\d:.]+)\s-->\s([\d:.]+)/)

      if (matches) {
        start = parseTimestamp(matches[1])
        end = parseTimestamp(matches[2])
      }
      continue
    }

    let text = line.trim()

    if (text !== '') {
      gap = start - lastEnd
      lastEnd = end
      lastSpeaker = speaker
      speaker = speakerRegex.exec(line)?.groups?.speaker
      text = text.replace(speakerRegex, '')

      if (result.length > 0 && speaker !== lastSpeaker) {
        groups.push(result)
        result = []
      }

      result.push({ index, start, end, text, gap, speaker })

      if (text.match(/[.?!]\s*$/)) {
        groups.push(result)
        result = []
      }
    }
  }

  if (result.length > 0) groups.push(result)

  return groups
}
