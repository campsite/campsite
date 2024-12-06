// we can only render a subset of image types
// valid image types: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Supported_image_formats
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']

// we can only render a subset of video types
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#Supported_video_formats
export const VALID_VIDEO_TYPES = ['video/mp4', 'video/quicktime']

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs
export const VALID_AUDIO_TYPES = ['audio/aac', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']

export const isImage = (type: string) => VALID_IMAGE_TYPES.includes(type) && !type.endsWith('gif')
export const isGif = (type: string) => type === 'image/gif'
export const isVideo = (type: string) => VALID_VIDEO_TYPES.includes(type)
export const isLottie = (type: string) => type === 'lottie'
export const isOrigami = (type: string) => type === 'origami'
export const isPrinciple = (type: string) => type === 'principle'
export const isStitch = (type: string) => type === 'stitch'
export const isAudio = (type: string) => VALID_AUDIO_TYPES.includes(type)

const isHeic = (type: string) => type.endsWith('heic')

export const MEDIA_GALLERY_VALIDATORS = [isImage, isGif, isVideo, isLottie, isOrigami, isPrinciple, isStitch, isHeic]
