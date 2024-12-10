export default function isMarkdown(text: string): boolean {
  const fences = text.match(/^```/gm)

  if (fences && fences.length > 1) {
    return true
  }

  if (text.match(/\[[^]+\]\(https?:\/\/\S+\)/gm)) {
    return true
  }

  if (text.match(/\[[^]+\]\(\/\S+\)/gm)) {
    return true
  }

  if (text.match(/^#{1,6}\s+\S+/gm)) {
    return true
  }

  const listItems = text.match(/^([-*]|\d+.)\s\S+/gm)

  if (listItems && listItems.length > 1) {
    return true
  }

  const tables = text.match(/\|\s?[-]+\s?\|/gm)

  if (tables && tables.length > 1) {
    return true
  }

  return false
}
