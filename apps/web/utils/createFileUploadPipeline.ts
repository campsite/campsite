import * as Sentry from '@sentry/nextjs'
import { v4 as uuid } from 'uuid'

import { IMGIX_DOMAIN } from '@campsite/config/index'
import { uuidExpression } from '@campsite/regex'
import { Attachment } from '@campsite/types/generated'

import { VALID_AUDIO_TYPES, VALID_IMAGE_TYPES, VALID_VIDEO_TYPES } from '@/components/Post/utils'
import { handleFile } from '@/hooks/useUploadFile'
import { getLottieThumbnailAndDuration } from '@/utils/getLottieThumbnailAndDuration'
import { getVideoThumbnailAndDuration } from '@/utils/getVideoThumbnailAndDuration'
import { fileIsLottie, generateImageValues } from '@/utils/transformFile'
import { urlToHlsUrl } from '@/utils/urlToHlsUrl'

type Upload = { file: File; attachment: Attachment; thumbnail?: File }

type RemappedFileResult = {
  type: 'gif' | 'heic' | 'image' | 'video' | 'audio' | 'origami' | 'principle' | 'stitch' | 'lottie' | 'other'
  file: File
}

export function createOptimisticAttachment(value: Partial<Attachment>): Attachment {
  return {
    ...{
      id: '',
      file_type: '',
      subject_type: 'Post',
      is_subject_comment: false,
      subject_id: '',
      link: false,
      image: false,
      gif: false,
      video: false,
      lottie: false,
      origami: false,
      principle: false,
      stitch: false,
      note: false,
      audio: false,
      relative_url: '',
      preview_relative_url: '',
      key: null,
      url: '',
      download_url: '',
      preview_url: null,
      preview_thumbnail_url: null,
      image_urls: null,
      remote_figma_url: null,
      duration: 0,
      width: 0,
      height: 0,
      app_url: '',
      content_html: '',
      optimistic_ready: false,
      name: null,
      size: null,
      comments_count: 0,
      type_name: 'attachment',
      no_video_track: false,
      gallery_id: null
    },
    ...value
  }
}

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')

  return fileName.substring(lastDotIndex).toLowerCase()
}

async function remapFile(file: File): Promise<RemappedFileResult> {
  if (file.type === 'image/gif') {
    return { type: 'gif', file }
  }
  if (file.type.endsWith('heic')) {
    return { type: 'heic', file }
  }
  if (VALID_IMAGE_TYPES.includes(file.type)) {
    return { type: 'image', file }
  }
  if (VALID_VIDEO_TYPES.includes(file.type)) {
    return { type: 'video', file }
  }
  if (VALID_AUDIO_TYPES.includes(file.type)) {
    return { type: 'audio', file }
  }

  let newType: RemappedFileResult['type'] | undefined

  // file type is not known
  if (file.type === '') {
    const extension = getFileExtension(file.name)

    if (extension === '.origami') {
      newType = 'origami'
    } else if (extension === '.prd') {
      newType = 'principle'
    } else if (extension === '.stitch') {
      newType = 'stitch'
    }
  } else if (await fileIsLottie(file)) {
    newType = 'lottie'
  }

  if (newType) {
    return { type: newType, file: new File([file], file.name, { type: newType }) }
  }

  return { type: 'other', file }
}

export function hasOptimisticAttachments(ids: string[]) {
  return ids.some((id) => uuidExpression.test(id))
}

async function createAttachment(raw: File): Promise<Upload> {
  const clientId = uuid()
  const localUrl = window.URL.createObjectURL(raw)
  const { type, file } = await remapFile(raw)

  const base = createOptimisticAttachment({
    id: clientId,
    optimistic_id: clientId,
    file_type: file.type,
    name: file.name,
    size: file.size,
    video: type === 'video',
    lottie: type === 'lottie',
    image: type === 'image',
    gif: type === 'gif',
    origami: type === 'origami',
    principle: type === 'principle',
    stitch: type === 'stitch',
    audio: type === 'audio',
    optimistic_src: localUrl
  })

  // do not render dimensions for heic
  if (type === 'image' || type === 'gif') {
    const { width, height } = await generateImageValues({ file, isOnDisk: true })

    return { file, attachment: { ...base, width, height } }
  }

  if (type === 'video') {
    const { preview, ...rest } = await getVideoThumbnailAndDuration(file)

    return {
      file,
      attachment: {
        ...base,
        ...rest,
        video: !!preview,
        audio: !preview,
        no_video_track: !preview
      },
      thumbnail: preview
    }
  }

  if (type === 'lottie') {
    const { preview, ...rest } = await getLottieThumbnailAndDuration(file)

    return {
      file,
      attachment: {
        ...base,
        ...rest
      },
      thumbnail: preview
    }
  }

  return { file, attachment: base }
}

function partitionAllowedFiles(files: File[], maxFileSize: number) {
  const allowedSizeFiles: File[] = []
  const rejectedSizeFiles: File[] = []

  files.forEach((file) => {
    if (file.size <= maxFileSize) {
      allowedSizeFiles.push(file)
    } else {
      rejectedSizeFiles.push(file)
    }
  })

  return { allowedSizeFiles, rejectedSizeFiles }
}

type Props = {
  files: File[]
  maxFileSize: number
  scope: string
  onFilesExceedMaxSize: (files: File[]) => void
  onAppend: (attachments: Attachment[]) => void
  onUpdate: (optimisticId: string, value: Partial<Attachment>) => void
}

export async function createFileUploadPipeline({
  files,
  scope,
  onFilesExceedMaxSize,
  maxFileSize,
  onAppend,
  onUpdate
}: Props) {
  const { allowedSizeFiles, rejectedSizeFiles } = partitionAllowedFiles(files, maxFileSize)

  if (rejectedSizeFiles.length) {
    onFilesExceedMaxSize(rejectedSizeFiles)
  }

  const uploads = await Promise.all(allowedSizeFiles.map(createAttachment))

  onAppend(uploads.map(({ attachment }) => attachment))

  const promises = uploads.map(async ({ attachment, thumbnail, file }) => {
    const optimisticId = attachment.id
    const uploadPromises: Promise<any>[] = []

    // if there is a thumbnail (video, lottie), upload it first
    if (thumbnail) {
      uploadPromises.push(
        handleFile({
          file: thumbnail,
          type: thumbnail.type,
          resource: 'Post',
          orgSlug: scope as string
        }).then((path) => {
          if (path) {
            // send the thumbnail path to the consumer
            onUpdate(optimisticId, { optimistic_preview_file_path: path })
          }
        })
      )
    }

    uploadPromises.push(
      handleFile({ file, type: file.type, resource: 'Post', orgSlug: scope as string }).then((path) => {
        if (path) {
          onUpdate(optimisticId, { optimistic_file_path: path, url: `${IMGIX_DOMAIN}/${path}` })

          // prefetch the hls video to kick off a transcription job
          if (attachment.video) {
            const hlsUrl = urlToHlsUrl(`${IMGIX_DOMAIN}/${path}`)

            return fetch(hlsUrl, { method: 'HEAD' })
          }
        }
      })
    )

    // upload the thumbnail and file in parrallel
    return Promise.all(uploadPromises)
      .then(() => {
        onUpdate(optimisticId, { optimistic_ready: true })
      })
      .catch((err) => {
        onUpdate(optimisticId, { client_error: err })
        Sentry.captureException(err)
      })
  })

  return Promise.all(promises).then(() => uploads.map(({ attachment: { id } }) => id))
}
