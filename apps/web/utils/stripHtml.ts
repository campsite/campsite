export function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  let childrenText: string[] = []

  Array.from(doc.body.children).forEach((child) => {
    childrenText.push(child.textContent || '')
  })

  return childrenText.join('\n')
}
