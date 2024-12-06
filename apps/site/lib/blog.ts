import fs from 'fs'
import path from 'path'
import { z } from 'zod'

import { SITE_URL } from '@campsite/config'

import { getOgImageMetadata } from '@/lib/og'

const MetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  posterLight: z.string().optional(),
  posterDark: z.string().optional(),
  posterAlt: z.string().optional(),
  pinned: z.string().optional()
})

type Metadata = z.infer<typeof MetadataSchema>

export interface Blog {
  metadata: Metadata
  slug: string
  url: string
  ogImage: ReturnType<typeof getOgImageMetadata>
  content: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()

    // remove quotes
    value = value.replace(/^['"](.*)['"]$/, '$1')
    metadata[key.trim() as keyof Metadata] = value
  })

  const parsedMetadata = MetadataSchema.safeParse(metadata)

  if (!parsedMetadata.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid metadata:', parsedMetadata.error)
    throw new Error('Invalid blog post metadata')
  }

  return { metadata: parsedMetadata.data, content }
}

function getMDXFiles(directory: string) {
  return fs.readdirSync(directory).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')

  return parseFrontmatter(rawContent)
}

function getMDXData(directory: string): Blog[] {
  let mdxFiles = getMDXFiles(directory)

  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(directory, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      url: `${SITE_URL}/blog/${slug}`,
      ogImage: getOgImageMetadata(metadata.title),
      content
    }
  })
}

export function getBlogs(): Blog[] {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', '_cms')).sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )
}
