import * as Sentry from '@sentry/nextjs'

import {
  codepenRegex,
  codesandboxRegex,
  figmaRegex,
  loomRegex,
  playRegex,
  riveRegex,
  tomeRegex,
  youtubeRegex
} from '@campsite/regex'

function removeTrailingSlash(url: string) {
  if (url.at(-1) === '/') {
    return url.slice(0, -1)
  }
  return url
}

type EmbedType =
  | 'link'
  | 'loom'
  | 'figma'
  | 'codepen'
  | 'codesandbox'
  | 'rive'
  | 'storybook'
  | 'play'
  | 'tome'
  | 'youtube'

export function embedType(link: string) {
  if (link.match(loomRegex)) {
    return 'loom'
  }

  if (link.match(figmaRegex)) {
    return 'figma'
  }

  if (link.match(codepenRegex)) {
    return 'codepen'
  }

  if (link.match(codesandboxRegex)) {
    return 'codesandbox'
  }

  if (link.match(riveRegex)) {
    return 'rive'
  }

  if (link.match(playRegex)) {
    return 'play'
  }

  if (link.match(tomeRegex)) {
    return 'tome'
  }

  if (link.match(youtubeRegex)) {
    return 'youtube'
  }

  return 'link'
}

export function embedTypeTrusted(type: EmbedType) {
  return type !== 'link'
}

export function transformUrl(type: EmbedType, url: string) {
  let src, logo, title

  switch (type) {
    case 'loom':
      src = url.replace('/share/', '/embed/')
      logo = '/img/embed/loom.png'
      title = 'Loom'
      break
    case 'figma': {
      let cleanUrl

      try {
        cleanUrl = new URL(url)
      } catch {
        Sentry.captureException(`Invalid Figma URL: ${url}`)
        src = url
        logo = ''
        break
      }

      const isProto = cleanUrl.pathname.startsWith('/proto/')

      if (isProto) {
        cleanUrl.searchParams.set('scaling', 'scale-down')
      }

      src = `https://www.figma.com/embed?embed_host=campsite&url=${encodeURIComponent(cleanUrl.toString())}`
      logo = '/img/embed/figma.png'
      title = 'Figma'
      break
    }
    case 'codepen':
      src = url.replace('/pen/', '/embed/') + '?default-tab=html%2Cresult'
      logo = '/img/embed/codepen.png'
      title = 'CodePen'
      break
    case 'codesandbox':
      src = url.replace('/s/', '/embed/')
      logo = '/img/embed/codesandbox.png'
      title = 'CodeSandbox'
      break
    case 'rive':
      src = url.endsWith('/embed') ? url : removeTrailingSlash(url) + '/embed'
      logo = '/img/embed/rive.png'
      title = 'Rive'
      break
    case 'tome':
      src = url
      logo = '/img/embed/tome.png'
      title = 'Tome'
      break
    case 'play':
      src = url
      logo = '/img/embed/play.png'
      title = 'Play'
      break
    case 'youtube':
      if (url.match(/\/watch\//)) {
        src = url.replace('/watch/', '/embed/')
      } else {
        src = url.replace('/watch?v=', '/embed/')
      }
      src = src.replace(/[?&]t=(\d+)s/g, (_match, t) => `?start=${t}`)
      logo = '/img/embed/youtube.png'
      title = 'YouTube'
      break
    default:
      src = url
      logo = '/img/embed/link.png'
      break
  }

  return { src, logo, title }
}
