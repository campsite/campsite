import { withAuth } from '@workos-inc/authkit-nextjs'

import { getLegacyNote, getLegacyPublicNote } from '@/lib/convex/notes'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{
    orgSlug: string
    noteId: string
    hash: string
    size: string
    theme: string
  }>
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function wrapText(value: string, lineLength: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > lineLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }

    if (lines.length >= maxLines) {
      break
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current)
  }

  return lines.slice(0, maxLines)
}

function buildSvg(params: {
  authorName: string
  description: string
  organizationName: string
  size: number
  theme: string
  title: string
}) {
  const width = params.size
  const height = Math.round(params.size * 1.2)
  const dark = params.theme === 'dark'
  const background = dark ? '#111827' : '#f8fafc'
  const card = dark ? '#1f2937' : '#ffffff'
  const border = dark ? '#374151' : '#dbe4ee'
  const titleColor = dark ? '#f9fafb' : '#0f172a'
  const textColor = dark ? '#cbd5e1' : '#475569'
  const accent = dark ? '#60a5fa' : '#2563eb'
  const titleLines = wrapText(params.title || 'Untitled', 22, 3)
  const descriptionLines = wrapText(params.description || 'Untitled note', 28, 7)

  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const descriptionMarkup = descriptionLines
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : 24}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <rect width="${width}" height="${height}" rx="36" fill="${background}" />
      <rect x="40" y="32" width="${width - 80}" height="${height - 64}" rx="28" fill="${card}" stroke="${border}" />
      <rect x="72" y="72" width="${width - 144}" height="10" rx="5" fill="${accent}" opacity="0.12" />
      <text x="72" y="138" fill="${titleColor}" font-size="34" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700">
        ${titleMarkup}
      </text>
      <text x="72" y="280" fill="${textColor}" font-size="20" font-family="ui-sans-serif, system-ui, sans-serif">
        ${descriptionMarkup}
      </text>
      <rect x="72" y="${height - 110}" width="${width - 144}" height="1" fill="${border}" />
      <text x="72" y="${height - 72}" fill="${textColor}" font-size="18" font-family="ui-sans-serif, system-ui, sans-serif">
        ${escapeXml(params.organizationName)} • ${escapeXml(params.authorName)}
      </text>
    </svg>
  `.trim()
}

export async function GET(_: Request, context: Context) {
  const { orgSlug, noteId, size, theme } = await context.params
  const { accessToken, user } = await withAuth()

  if (accessToken && user) {
    await ensureWorkspace(accessToken, user)
  }

  try {
    const note =
      accessToken
        ? await getLegacyNote(accessToken, { slug: orgSlug, noteId }).catch(() =>
            getLegacyPublicNote(accessToken, { slug: orgSlug, noteId })
          )
        : await getLegacyPublicNote(null, { slug: orgSlug, noteId })

    const imageSize = Math.max(320, Math.min(1400, Number(size) || 700))
    const svg = buildSvg({
      authorName: note.member.user.display_name || 'Unknown',
      description: stripHtml(note.description_html),
      organizationName: 'organization' in note ? note.organization.name : orgSlug,
      size: imageSize,
      theme,
      title: note.title || 'Untitled'
    })

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': accessToken ? 'private, max-age=300' : 'public, max-age=3600'
      }
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
