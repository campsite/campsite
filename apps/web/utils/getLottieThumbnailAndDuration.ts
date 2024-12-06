import lottie from 'lottie-web/build/player/lottie_light'

export async function getLottieThumbnailAndDuration(
  file: File
): Promise<{ preview: File; duration: number; width: number; height: number }> {
  return new Promise<any>((resolve, reject) => {
    const src = URL.createObjectURL(file)

    const container = document.createElement('div')
    const canvas = document.createElement('canvas')

    // Try to maintain a 16:9 aspect ratio
    const width = 1600
    const height = 900

    // Retina
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const cleanup = () => {
      window.URL.revokeObjectURL(src)
    }

    container.style.width = `${width}px`
    container.style.height = `${height}px`

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      path: src,
      loop: false,
      autoplay: false
    })

    anim.addEventListener('DOMLoaded', () => {
      const frames = anim.totalFrames

      // Jump to the middle of the animation as we are more likely to get a good frame
      anim.goToAndStop(frames / 2, true)

      const svgEl = container?.querySelector('svg') as SVGElement

      svgEl?.setAttribute('width', `${width}`)
      svgEl?.setAttribute('height', `${height}`)
      const svg = svgEl?.outerHTML

      if (!svg) {
        cleanup()
        reject(new Error('Could not get lottie svg'))
        return
      }

      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const svgObjectUrl = URL.createObjectURL(svgBlob)
      const image = new Image()

      image.width = width
      image.height = height

      image.addEventListener('load', function () {
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          window.URL.revokeObjectURL(svgObjectUrl)
          cleanup()
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(image, 0, 0)

        canvas.toBlob((blob) => {
          try {
            window.URL.revokeObjectURL(svgObjectUrl)
            cleanup()
          } catch (e) {
            // no-op
          }

          if (!blob) {
            reject(new Error('Could not get lottie preview'))
            return
          }

          const pngName = file.name.replace(/\.json$/, '.png').replace(/\.lottie$/, '.png')

          const preview = new File([blob], pngName, {
            type: 'image/png'
          })

          resolve({
            preview,
            duration: frames,
            width,
            height
          })
        }, 'image/png')
      })
      image.src = svgObjectUrl
    })
  })
}
