import { memo, useState } from 'react'
import Image from 'next/image'
import Compress from 'react-image-file-resizer'

import { TransformedFile } from '@/utils/types'

interface ResizedFilePreviewProps {
  file: TransformedFile
  width: number
  className: string | undefined
}
type resizedImageUrlType = string | Blob | File | ProgressEvent<FileReader> | null

const areEqual = (prevProps: ResizedFilePreviewProps, nextProps: ResizedFilePreviewProps) =>
  prevProps.file.raw.name === nextProps.file.raw.name && prevProps.className == nextProps.className

export const ResizedFilePreview = memo(function ResizedFilePreview({
  file,
  width,
  className = ''
}: ResizedFilePreviewProps) {
  const [resizedImageUrl, setResizedImageUrl] = useState<resizedImageUrlType>(null)
  const dimensions = width * window.devicePixelRatio

  if (!resizedImageUrl) {
    Compress.imageFileResizer(
      file.raw,
      dimensions, // width
      dimensions, // height
      'JPEG',
      75, // quality
      0, // rotation
      (uri) => {
        setResizedImageUrl(uri)
      },
      'base64' // blob or base64 default base64
    )
  }
  return (
    <>
      {resizedImageUrl && (
        <Image
          src={resizedImageUrl as string}
          width={36}
          height={36}
          alt='Preview for uploaded file'
          className={className}
          draggable={false}
        />
      )}
    </>
  )
}, areEqual)
