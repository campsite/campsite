import { v4 as uuid } from 'uuid'

import { isImage } from '@/components/Post/utils'

import { TransformedFile } from './types'

export function generateImageValues({ file, isOnDisk = false }: { file: File; isOnDisk?: boolean }) {
  return new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    function loadImageMetadata(src: string) {
      const img = new Image()

      img.onerror = reject
      img.onload = function () {
        const width = img.width
        const height = img.height

        resolve({ src, width, height })
        img.remove()
      }
      img.src = src
    }

    // if the file is already on disk, just get a url to it
    if (isOnDisk) {
      loadImageMetadata(window.URL.createObjectURL(file))
      return
    }

    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onerror = reject
    reader.onload = () => loadImageMetadata(reader.result as string)
  })
}

const REQUIRED_LOTTIE_KEYS = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h']

const containsLottie = (json: Record<string, any>) =>
  REQUIRED_LOTTIE_KEYS.every((field) => Object.prototype.hasOwnProperty.call(json, field))

export async function fileIsLottie(file: File): Promise<boolean> {
  if (file.type !== 'application/json') return false

  try {
    const text = await file.text()
    const json = JSON.parse(text)

    return containsLottie(json)
  } catch (error) {
    return false
  }
}

async function generateFileMetadata(file: File, isOnDisk: boolean) {
  if (isImage(file.type)) {
    return await generateImageValues({ file, isOnDisk }).then((values) => ({ ...values, url: values.src }))
  } else {
    return { url: window.URL.createObjectURL(file) }
  }
}

export async function transformFile(file: File, isOnDisk = false): Promise<TransformedFile> {
  const isOrigami = file.type === '' && file.name.endsWith('.origami')
  const isPrinciple = file.type === '' && file.name.endsWith('.prd')
  const isStitch = file.type === '' && file.name.endsWith('.stitch')
  const isLottie = await fileIsLottie(file)
  let type = file.type

  if (isOrigami) type = 'origami'
  if (isPrinciple) type = 'principle'
  if (isStitch) type = 'stitch'
  if (isLottie) type = 'lottie'

  const raw = new File([file], file.name, { type })

  const metadata = await generateFileMetadata(file, isOnDisk)

  return {
    ...metadata,
    optimistic_src: metadata.url,
    id: uuid(),
    raw,
    type,
    relative_url: null,
    key: null,
    preview_file_path: null,
    error: null,
    name: file.name,
    size: file.size
  }
}
