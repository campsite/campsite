import slugify from 'slugify'

export function formatTagName(name: string) {
  return slugify(name, { lower: true, trim: false }).replace('#', '')
}
