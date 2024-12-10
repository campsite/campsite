export function parseSingleIframeSrc(html: string) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    if (doc.body.children.length === 1 && doc.body.firstElementChild?.tagName === 'IFRAME') {
      const iframe = doc.body.firstElementChild
      const src = iframe.getAttribute('src')

      if (src) {
        return src
      }
    }
  } catch (e) {
    // Ignore the million ways parsing could fail.
  }
  return undefined
}
