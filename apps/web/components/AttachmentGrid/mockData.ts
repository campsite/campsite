import { Attachment, ImageUrls } from '@campsite/types/generated'

let idCounter = 0

export const CAMPGROUND_SQUARE = 'https://campsite-dev.imgix.net/o/dev-seed-files/attachment-camp-square-1.png'
export const CAMPGROUND_WIDE = 'https://campsite-dev.imgix.net/o/dev-seed-files/attachment-camp-wide-3.png'
export const DESERT_SQUARE = 'https://campsite-dev.imgix.net/o/dev-seed-files/attachment-desert-square-1.png'
export const LAKE_SQUARE = 'https://campsite-dev.imgix.net/o/dev-seed-files/attachment-lake-square-1.png'

export const HIKING_VIDEO = 'https://campsite-dev.imgix.net/o/zemunvw54tho/p/088a73d8-2569-462c-a4d6-0d85ea8b205e.mp4'

// Real video attachment object from the API
const videoAttachment: Attachment = {
  id: '2llsprfhg67e',
  file_type: 'video/mp4',
  url: 'https://campsite-dev.imgix.net/o/zemunvw54tho/p/088a73d8-2569-462c-a4d6-0d85ea8b205e.mp4',
  app_url: '',
  download_url:
    'https://campsite-dev.imgix.net/o/zemunvw54tho/p/088a73d8-2569-462c-a4d6-0d85ea8b205e.mp4?dl=8968040-uhd_2160_4096_25fps.mp4',
  preview_url: 'https://campsite-dev.imgix.net/o/zemunvw54tho/p/1a057170-9d83-4e4f-a4fc-b570fc903c75.png',
  preview_thumbnail_url:
    'https://campsite-dev.imgix.net/o/zemunvw54tho/p/1a057170-9d83-4e4f-a4fc-b570fc903c75.png?auto=compress%2Cformat&dpr=2&q=60&w=112',
  image_urls: null,
  link: false,
  image: false,
  video: true,
  origami: false,
  principle: false,
  stitch: false,
  lottie: false,
  gif: false,
  audio: false,
  no_video_track: false,
  duration: 7520,
  width: 2160,
  height: 4096,
  subject_type: null,
  name: '8968040-uhd_2160_4096_25fps.mp4',
  size: 19455483,
  remote_figma_url: null,
  type_name: 'attachment',
  subject_id: null,
  is_subject_comment: false,
  relative_url: 'o/zemunvw54tho/p/088a73d8-2569-462c-a4d6-0d85ea8b205e.mp4',
  preview_relative_url: 'o/zemunvw54tho/p/1a057170-9d83-4e4f-a4fc-b570fc903c75.png',
  comments_count: 0,
  key: null,
  optimistic_id: null,
  optimistic_file_path: null,
  optimistic_preview_file_path: null,
  optimistic_imgix_video_file_path: null,
  optimistic_src: null,
  optimistic_preview_src: null,
  optimistic_ready: true,
  client_error: null,
  gallery_id: null
}

export function mockVideoAttachment({ url }: Pick<Attachment, 'url'>) {
  return {
    ...videoAttachment,
    id: `${idCounter++}`,
    url,
    relative_url: new URL(url).pathname
  }
}

// Real image attachment object from the API
const imageAttachment: Attachment = {
  id: '9e9zur9y7obb',
  file_type: 'image/png',
  url: 'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png',
  app_url: '',
  download_url:
    'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?dl=ComfyUI_00099_.png',
  preview_url: 'https://campsite-dev.imgix.net',
  preview_thumbnail_url: null,
  image_urls: {
    original_url: 'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png',
    thumbnail_url:
      'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?auto=compress%2Cformat&dpr=2&q=60&w=112',
    feed_url:
      'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?auto=compress%2Cformat&dpr=2&q=80&w=800',
    email_url:
      'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?auto=compress%2Cformat&dpr=2&w=600',
    slack_url:
      'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?auto=compress%2Cformat&dpr=2&q=75&w=1200',
    large_url:
      'https://campsite-dev.imgix.net/o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png?auto=compress%2Cformat&dpr=2&q=90&w=1440'
  },
  link: false,
  image: true,
  video: false,
  origami: false,
  principle: false,
  stitch: false,
  lottie: false,
  audio: false,
  no_video_track: false,
  gif: false,
  duration: 0,
  width: 1344,
  height: 768,
  subject_type: 'Organization',
  name: 'ComfyUI_00099_.png',
  size: 1646738,
  remote_figma_url: null,
  type_name: 'attachment',
  subject_id: 'zemunvw54tho',
  is_subject_comment: false,
  relative_url: 'o/zemunvw54tho/p/5e1a94dc-918d-48a5-85f3-dc81e6393267.png',
  preview_relative_url: '',
  comments_count: 0,
  key: null,
  optimistic_id: null,
  optimistic_file_path: null,
  optimistic_preview_file_path: null,
  optimistic_imgix_video_file_path: null,
  optimistic_src: null,
  optimistic_preview_src: null,
  optimistic_ready: true,
  client_error: null,
  gallery_id: null
}

function makeImageUrl(url: string, size: keyof ImageUrls) {
  switch (size) {
    case 'thumbnail_url':
      return `${url}?auto=compress%2Cformat&dpr=2&q=60&w=112`
    case 'feed_url':
      return `${url}?auto=compress%2Cformat&dpr=2&q=80&w=800`
    case 'email_url':
      return `${url}?auto=compress%2Cformat&dpr=2&w=600`
    case 'slack_url':
      return `${url}?auto=compress%2Cformat&dpr=2&q=75&w=1200`
    case 'large_url':
      return `${url}?auto=compress%2Cformat&dpr=2&q=90&w=1440`
    case 'original_url':
    default:
      return url
  }
}

export function mockImageAttachment({ url }: Pick<Attachment, 'url'>) {
  return {
    ...imageAttachment,
    id: `${idCounter++}`,
    url,
    relative_url: new URL(url).pathname,
    image_urls: {
      original_url: url,
      thumbnail_url: makeImageUrl(url, 'thumbnail_url'),
      feed_url: makeImageUrl(url, 'feed_url'),
      email_url: makeImageUrl(url, 'email_url'),
      slack_url: makeImageUrl(url, 'slack_url'),
      large_url: makeImageUrl(url, 'large_url')
    }
  }
}
