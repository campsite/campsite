/**
 * @see https://stackoverflow.com/questions/73631283/only-match-a-string-made-of-one-or-more-emojis
 */
function containsOnlyNativeEmojis(text: string): boolean {
  const stringToTest = text.replace(/ /g, '')
  const emojiRegex =
    /^(?:(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(?:\u{200D}\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*)|[\u{1f900}-\u{1f9ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}])+$/u

  return emojiRegex.test(stringToTest) && Number.isNaN(Number(stringToTest))
}

export function containsOnlyReactions(html: string): boolean {
  const element = document.createElement('section')

  element.innerHTML = html
  const nodes = Array.from(element.childNodes)

  if (nodes.length !== 1) return false

  const node = nodes[0]

  const childNodes = Array.from(node.childNodes)

  if (!childNodes.length) return false

  return childNodes.every((childNode) => {
    if (
      childNode.nodeName === 'IMG' &&
      childNode instanceof HTMLImageElement &&
      childNode.getAttribute('data-type') === 'reaction'
    ) {
      return true
    }

    if (
      childNode.nodeName === 'SPAN' &&
      childNode instanceof HTMLSpanElement &&
      childNode.getAttribute('data-type') === 'reaction'
    ) {
      return containsOnlyNativeEmojis(childNode.textContent || '')
    }

    // If it's an empty text node, we can ignore it as it's just whitespace
    if (childNode.nodeName === '#text' && !childNode.textContent?.trim()) {
      return true
    }

    if (childNode.nodeName === '#text') {
      return containsOnlyNativeEmojis(childNode.textContent || '')
    }

    return false
  })
}
