/* Adapted from https://codesandbox.io/s/markdown-to-slack-converter-iphgn */

import * as cheerio from 'cheerio'
import { jsxslack } from 'jsx-slack'

interface Props {
  html: string
}

const Html = ({ html }: Props) => {
  // Replace <br> with <br/> so cheerio knows they are self-closing.
  html = html.replaceAll('<br>', '<br/>').replaceAll('<hr>', '<hr/>')

  const $ = cheerio.load(`<Root>${html}</Root>`, { xmlMode: true })

  const stripElements = ['label', 'div', 'u', 'details']

  stripElements.forEach((el) => $(el).replaceWith((_, el) => $(el).contents()))

  // strip newlines within lists
  $('li p').replaceWith((_, el) => $(el).contents())

  // replace <input /> with emojis based on checked value
  $('input[type="checkbox"]').replaceWith((_, el) => {
    const $el = $(el)
    const checked = $el.attr('checked') !== undefined

    return checked ? '✓ ' : ':white_medium_small_square: '
  })

  // replace headings with bold text
  $('blockquote')
    .find('h1, h2, h3, h4, h5, h6')
    .replaceWith((_, el) => '<p><b>' + $(el).html() + '</b></p>')

  // remove excessively long links to remain under Slack's 3000 character limit for section text
  $('a').each((_, el) => {
    const href = $(el).attr('href')

    if (href && href.length > 2000) {
      $(el).replaceWith(`<span>${$(el).text()}</span>`)
    }
  })

  $('blockquote hr').replaceWith('<p>────────────────────</p>')

  $('Root > blockquote').wrap('<Section></Section>')
  $('Root > p').replaceWith((_, el) => '<Section>' + $(el).html() + '</Section>')

  // break excessively long lists into multiple sections
  $('Root > ul').each((_, ul) => {
    const html = $(ul).html()

    if (html && html.length < 2000) {
      return false
    }

    $(ul).children('li').wrap('<Section><ul></ul></Section>')
    $(ul).replaceWith((_, ul) => $(ul).contents())
  })

  $('Root > ol').each((_, ol) => {
    const html = $(ol).html()

    if (html && html.length < 2000) {
      return false
    }

    let value = 0

    $(ol)
      .children('li')
      .replaceWith((_, li) => {
        value += 1
        return `<Section><ol><li value=${value}>${$(li).html()}</li></ol></Section>`
      })
    $(ol).replaceWith((_, ol) => $(ol).contents())
  })

  $('h1, h2, h3, h4, h5, h6, summary').replaceWith((_, el) => '<Section><b>' + $(el).html() + '</b></Section>')

  $('kbd').replaceWith((_, el) => '<code>' + $(el).html() + '</code>')

  $('hr').replaceWith('<Divider />')

  $('img[data-type="reaction"]').replaceWith((_, el) => `:${$(el).attr('data-name')}:`)

  $('img').replaceWith((_, el) => `<Image src="${$(el).attr('src')}" alt="${$(el).attr('alt')}" />`)

  $('link-unfurl').replaceWith((_, el) => `<Section>${$(el).attr('href')}</Section>`)

  $('post-attachment').replaceWith((_, el) => {
    const fileType = $(el).attr('file_type')

    const fileTypeEmoji = fileType?.startsWith('image') ? '🖼️' : '📄'

    return `<Section><em>${fileTypeEmoji} Open this post on Campsite to view this attachment.</em></Section>`
  })

  $('media-gallery').replaceWith((_) => {
    return `<Section><em>🖼️ Open this post on Campsite to view attachments.</em></Section>`
  })

  // Invalid Section handling
  // - remove empty sections
  // - replace sections over character with sad message
  $('Section').each((_, el) => {
    const $el = $(el)

    if ($el.text().trim() === '') {
      $el.remove()
    }

    if ($el.text().trim().length > 3000) {
      $el.replaceWith('<Section><i>Removed a section too long to display in Slack.<i></Section>')
    }
  })

  const output = [$('Root').html() ?? '']

  // @ts-ignore
  let parsed = jsxslack(output)

  if (!Array.isArray(parsed)) parsed = [parsed]

  let section = []
  const blocks = []

  for (const content of [...parsed, Symbol('end')]) {
    if (typeof content?.$$jsxslack?.type === 'string') {
      section.push(content)
    } else {
      if (section.length > 0) {
        const sec = jsxslack`<Section children=${section} />`

        if (sec.text.text) blocks.push(sec)
      }
      section = []

      if (typeof content !== 'symbol') blocks.push(content)
    }
  }

  return blocks
}

export function htmlToSlack(html: string) {
  const blocks = jsxslack`<Blocks><${Html} html=${html} /></Blocks>`

  return blocks
}
