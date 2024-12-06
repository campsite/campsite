import Image from 'next/image'

import { LinkIcon } from '@campsite/ui'

interface Props {
  url: string
  title: string
}

export function BookmarkFavicon(props: Props) {
  const url = new URL(props.url)
  const hostname = url.hostname

  let atlassianRegex = /atlassian.net/
  let slackRegex = /slack.com/
  let framerRegex = /framer.app/
  let basecampRegex = /basecamp.com/
  let zoomRegex = /zoom.us/
  let quipRegex = /quip.com/
  let clickupRegex = /clickup.com/
  let mondayRegex = /monday.com/
  let productBoardRegex = /productboard.com/

  let src = null

  switch (hostname) {
    case 'docs.google.com':
      if (url.pathname.startsWith('/document')) {
        src = '/img/services/google-docs.png'
      } else if (url.pathname.startsWith('/presentation')) {
        src = '/img/services/google-slides.png'
      } else if (url.pathname.startsWith('/spreadsheets')) {
        src = '/img/services/google-sheets.png'
      } else if (url.pathname.startsWith('/forms')) {
        src = '/img/services/google-forms.png'
      } else {
        src = '/img/services/google.png'
      }
      break
    case 'www.icloud.com':
    case 'icloud.com':
      if (url.pathname.startsWith('/keynote')) {
        src = '/img/services/keynote.png'
      }
      if (url.pathname.startsWith('/pages')) {
        src = '/img/services/pages.png'
      }
      if (url.pathname.startsWith('/numbers')) {
        src = '/img/services/numbers.png'
      }
      break
    case 'github.com':
    case 'www.github.com':
      src = '/img/services/github.png'
      break
    case 'figma.com':
    case 'www.figma.com':
      src = '/img/services/figma.png'
      break
    case 'notion.so':
    case 'www.notion.so':
      src = '/img/services/notion.png'
      break
    case 'craft.do':
    case 'www.craft.do':
      src = '/img/services/craft.png'
      break
    case 'trello.com':
    case 'www.trello.com':
      src = '/img/services/trello.png'
      break
    case 'airtable.com':
    case 'www.airtable.com':
      src = '/img/services/airtable.png'
      break
    case 'youtube.com':
    case 'youtu.be':
      src = '/img/services/youtube.png'
      break
    case 'linkedin.com':
    case 'www.linkedin.com':
      src = '/img/services/linkedin.png'
      break
    case 'twitter.com':
    case 'x.com':
    case 'www.x.com':
    case 'www.twitter.com':
      src = '/img/services/x.png'
      break
    case 'threads.net':
    case 'www.threads.net':
      src = '/img/services/threads.png'
      break
    case 'facebook.com':
    case 'www.facebook.com':
      src = '/img/services/facebook.png'
      break
    case 'instagram.com':
    case 'www.instagram.com':
      src = '/img/services/instagram.png'
      break
    case 'reddit.com':
    case 'www.reddit.com':
      src = '/img/services/reddit.png'
      break
    case 'pinterest.com':
    case 'www.pinterest.com':
      src = '/img/services/pinterest.png'
      break
    case 'tiktok.com':
    case 'www.tiktok.com':
      src = '/img/services/tiktok.png'
      break
    case 'twitch.tv':
    case 'www.twitch.tv':
      src = '/img/services/twitch.png'
      break
    case 'medium.com':
    case 'www.medium.com':
      src = '/img/services/medium.png'
      break
    case hostname.match(atlassianRegex)?.input:
      if (url.pathname.startsWith('/wiki/')) {
        src = '/img/services/confluence.png'
      } else if (url.pathname.startsWith('/jira/')) {
        src = '/img/services/jira.png'
      } else {
        src = '/img/services/atlassian.png'
      }
      break
    case 'dropbox.com':
    case 'www.dropbox.com':
      src = '/img/services/dropbox.png'
      break
    case 'google.com':
    case 'www.google.com':
      src = '/img/services/google.png'
      break
    case hostname.match(slackRegex)?.input:
      src = '/img/services/slack.png'
      break
    case hostname.match(framerRegex)?.input:
      src = '/img/services/framer.png'
      break
    case hostname.match(basecampRegex)?.input:
      src = '/img/services/basecamp.png'
      break
    case hostname.match(clickupRegex)?.input:
      src = '/img/services/clickup.png'
      break
    case hostname.match(mondayRegex)?.input:
      src = '/img/services/monday.png'
      break
    case hostname.match(productBoardRegex)?.input:
      src = '/img/services/productboard.png'
      break
    case 'asana.com':
    case 'www.asana.com':
      src = '/img/services/asana.png'
      break
    case 'zoom.us':
    case 'www.zoom.us':
    case hostname.match(zoomRegex)?.input:
      src = '/img/services/zoom.png'
      break
    case hostname.match(quipRegex)?.input:
      src = '/img/services/quip.png'
      break
    case 'gitlab.com':
    case 'www.gitlab.com':
      src = '/img/services/gitlab.png'
      break
    case 'sentry.io':
    case 'www.sentry.io':
      src = '/img/services/sentry.png'
      break
    case 'salesforce.com':
    case 'www.salesforce.com':
      src = '/img/services/salesforce.png'
      break
    case 'vercel.com':
    case 'www.vercel.com':
      src = '/img/services/vercel.png'
      break
    case 'heroku.com':
    case 'www.heroku.com':
      src = '/img/services/heroku.png'
      break
    case 'netlify.com':
    case 'www.netlify.com':
      src = '/img/services/netlify.png'
      break
    case 'codesandbox.io':
    case 'www.codesandbox.io':
      src = '/img/services/codesandbox.png'
      break
    case 'storybook.js.org':
    case 'www.storybook.js.org':
      src = '/img/services/storybook.png'
      break
    case 'share.createwithplay.com':
    case 'www.share.createwithplay.com':
      src = '/img/services/play.png'
      break
    case 'loom.com':
    case 'www.loom.com':
      src = '/img/services/loom.png'
      break
    case 'codepen.io':
    case 'www.codepen.io':
      src = '/img/services/codepen.png'
      break
    case 'rive.app':
    case 'www.rive.app':
      src = '/img/services/rive.png'
      break
    case 'tome.app':
    case 'www.tome.app':
      src = '/img/services/tome.png'
      break
    case 'sketch.com':
    case 'www.sketch.com':
      src = '/img/services/sketch.png'
      break
    case 'zeplin.io':
    case 'www.zeplin.io':
      src = '/img/services/zeplin.png'
      break
    case 'meet.google.com':
    case 'www.meet.google.com':
      src = '/img/services/google-meet.png'
      break
    case 'mail.google.com':
    case 'www.mail.google.com':
      src = '/img/services/gmail.png'
      break
    case 'drive.google.com':
    case 'www.drive.google.com':
      src = '/img/services/google-drive.png'
      break
    case 'calendar.google.com':
    case 'www.calendar.google.com':
      src = '/img/services/google-calendar.png'
      break
    case 'spotify.com':
    case 'open.spotify.com':
    case 'www.spotify.com':
      src = '/img/services/spotify.png'
      break
    case 'testflight.apple.com':
    case 'www.testflight.apple.com':
      src = '/img/services/testflight.png'
      break
    case 'bitbucket.org':
    case 'www.bitbucket.org':
      src = '/img/services/bitbucket.png'
      break
    case 'campsite.design':
    case 'www.campsite.design':
    case 'app.campsite.design':
    case 'campsite.co':
    case 'www.campsite.co':
    case 'app.campsite.co':
    case 'campsite.com':
    case 'www.campsite.com':
    case 'app.campsite.com':
      src = '/img/services/campsite.png'
      break
    case 'linear.app':
    case 'www.linear.app':
      src = '/img/services/linear.png'
      break
    case 'whimsical.com':
    case 'www.whimsical.com':
      src = '/img/services/whimsical.png'
      break
    default:
      src = null
      break
  }

  if (!src) return <LinkIcon />

  return (
    <Image
      className='pointer-events-none h-[18px] w-[18px] flex-none rounded-md'
      src={src}
      width={20}
      height={20}
      draggable={false}
      alt={`Favicon for ${props.title}`}
    />
  )
}
