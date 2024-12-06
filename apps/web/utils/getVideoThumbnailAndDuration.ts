export async function getVideoThumbnailAndDuration(
  file: File
): Promise<{ preview?: File; duration: number; width: number; height: number }> {
  return new Promise<any>((resolve, reject) => {
    const canvas = document.createElement('canvas')

    const video = document.createElement('video')
    const source = document.createElement('source')

    const context = canvas.getContext('2d')
    const urlRef = URL.createObjectURL(file)

    video.style.display = 'none'
    canvas.style.display = 'none'

    source.setAttribute('src', urlRef)
    video.setAttribute('crossorigin', 'anonymous')

    video.appendChild(source)
    document.body.appendChild(canvas)
    document.body.appendChild(video)

    if (!context) {
      reject(new Error('Could not get canvas context'))
      return
    }

    video.currentTime = 1
    video.load()

    video.addEventListener('loadedmetadata', function () {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    })

    video.addEventListener('loadeddata', function () {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

      canvas.toBlob((blob) => {
        resolve({
          preview: blob
            ? new File([blob], file.name, {
                type: 'image/png'
              })
            : undefined,
          // In milliseconds
          duration: video.duration * 1000,
          width: video.videoWidth,
          height: video.videoHeight
        })
        URL.revokeObjectURL(urlRef)

        video.remove()
        canvas.remove()
      }, 'image/png')
    })
  })
}
