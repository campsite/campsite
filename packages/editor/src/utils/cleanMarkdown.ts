export default function cleanMarkdown(text: string): string {
  const re = /^\s?(\[(X|\s|_|-)\]\s(.*)?)/gim

  while (text.match(re)) {
    text = text.replace(re, (match) => `- ${match.trim()}`)
  }

  return text.replace(/\n{3,}/g, '\n\n\\\n').replace(/\b\n\b/g, '\n\n')
}
