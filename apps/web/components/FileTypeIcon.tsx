import Image from 'next/image'

import {
  FileAiIcon,
  FileApkIcon,
  FileAviIcon,
  FileCodeIcon,
  FileCsvIcon,
  FileDmgIcon,
  FileDwgIcon,
  FileEpsIcon,
  FileExeIcon,
  FileIcon,
  FileJsonIcon,
  FileLogIcon,
  FileM4aIcon,
  FileMarkdownIcon,
  FileMkvIcon,
  FileMp3Icon,
  FileOggIcon,
  FilePdfIcon,
  FilePsdIcon,
  FileQtzIcon,
  FileRarIcon,
  FileSqlIcon,
  FileTarIcon,
  FileTxtIcon,
  FileWavIcon,
  FileXmlIcon,
  FileZipIcon
} from '@campsite/ui'

function isCodelike(fileType: string) {
  // return true if file type is a common programming language file extension
  return (
    fileType === 'application/javascript' ||
    fileType === 'application/typescript' ||
    fileType === 'application/x-sh' ||
    fileType === 'application/x-shellscript' ||
    fileType === 'text/html' ||
    fileType === 'text/javascript' ||
    fileType === 'text/jsx' ||
    fileType === 'text/css' ||
    fileType === 'text/less' ||
    fileType === 'text/x-c' ||
    fileType === 'text/x-c++' ||
    fileType === 'text/x-csharp' ||
    fileType === 'text/x-csharp-script' ||
    fileType === 'text/x-java' ||
    fileType === 'text/x-objective' ||
    fileType === 'text/x-objectivec' ||
    fileType === 'text/x-php' ||
    fileType === 'text/x-python' ||
    fileType === 'text/x-ruby' ||
    fileType === 'text/x-ruby-script'
  )
}

export function FileTypeIcon({
  name,
  fileType,
  origami,
  principle,
  stitch,
  figma
}: {
  name: string | null
  fileType?: string
  origami?: boolean
  principle?: boolean
  stitch?: boolean
  figma?: boolean
}) {
  if (origami) {
    return <Image src='/img/origami.png' width={24} height={24} alt='' className='p-0.5' />
  }

  if (principle) {
    return <Image src='/img/principle.png' width={24} height={24} alt='' className='p-0.5' />
  }

  if (stitch) {
    return <Image src='/img/stitch.png' width={24} height={24} alt='' className='p-0.5' />
  }

  if (figma) {
    return <Image src='/img/services/figma.png' width={24} height={24} alt='' />
  }

  if (fileType && isCodelike(fileType)) {
    return <FileCodeIcon />
  }

  switch (fileType) {
    // keynote
    case 'application/vnd.apple.keynote':
    case 'application/x-iwork-keynote-sffkey':
      return <Image src='/img/services/keynote.png' width={24} height={24} alt='' />
    // pages
    case 'application/vnd.apple.pages':
    case 'application/x-iwork-pages-sffpages':
      return <Image src='/img/services/pages.png' width={24} height={24} alt='' />
    // numbers
    case 'application/vnd.apple.numbers':
    case 'application/x-iwork-numbers-sffnumbers':
      return <Image src='/img/services/numbers.png' width={24} height={24} alt='' />
    // powerpoint
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
    case 'application/vnd.ms-powerpoint':
      return <Image src='/img/services/powerpoint.png' width={24} height={24} alt='' />
    // excel
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel.sheet.macroEnabled.12':
    case 'application/vnd.ms-excel':
      return <Image src='/img/services/excel.png' width={24} height={24} alt='' />
    // word
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.ms-word.document.macroEnabled.12':
    case 'application/vnd.ms-word':
    case 'application/msword':
      return <Image src='/img/services/word.png' width={24} height={24} alt='' />
    // pdf
    case 'application/pdf':
      return <FilePdfIcon size={24} className='text-tertiary' />
    // adobe illustrator
    case 'application/postscript':
    case 'application/vnd.adobe.illustrator':
      return <FileAiIcon size={24} className='text-tertiary' />
    // adobe photoshop
    case 'image/vnd.adobe.photoshop':
      return <FilePsdIcon size={24} className='text-tertiary' />
    // adobe eps
    case 'application/eps':
      return <FileEpsIcon size={24} className='text-tertiary' />
    //wav
    case 'audio/wav':
      return <FileWavIcon size={24} className='text-tertiary' />
    //mp3
    case 'audio/mpeg':
      return <FileMp3Icon size={24} className='text-tertiary' />
    // csv
    case 'text/csv':
      return <FileCsvIcon size={24} className='text-tertiary' />
    // txt
    case 'text/plain':
      return <FileTxtIcon size={24} className='text-tertiary' />
    // zip
    case 'application/zip':
      return <FileZipIcon size={24} className='text-tertiary' />
    // rar
    case 'application/x-rar-compressed':
      return <FileRarIcon size={24} className='text-tertiary' />
    // dmg
    case 'application/x-apple-diskimage':
      return <FileDmgIcon size={24} className='text-tertiary' />
    // misc
    case 'application/octet-stream':
      if (name?.endsWith('.sketch')) return <Image src='/img/services/sketch.png' width={24} height={24} alt='' />
      if (name?.endsWith('.dwg')) return <FileDwgIcon size={24} className='text-tertiary' />
      if (name?.endsWith('.qtz')) return <FileQtzIcon size={24} className='text-tertiary' />
      if (name?.endsWith('.dwg')) return <FileDwgIcon size={24} className='text-tertiary' />
      break
    // figma
    case 'application/figma':
    case 'application/x-figma':
      return <Image src='/img/services/figma.png' width={24} height={24} alt='' />
    // exe
    case 'application/x-msdownload':
      return <FileExeIcon size={24} className='text-tertiary' />
    // mkv
    case 'video/x-matroska':
      return <FileMkvIcon size={24} className='text-tertiary' />
    // avi
    case 'video/x-msvideo':
      return <FileAviIcon size={24} className='text-tertiary' />
    // tar
    case 'application/x-tar':
      return <FileTarIcon size={24} className='text-tertiary' />
    // log
    case 'text/x-log':
      return <FileLogIcon size={24} className='text-tertiary' />
    // sql
    case 'application/sql':
      return <FileSqlIcon size={24} className='text-tertiary' />
    // apk
    case 'application/vnd.android.package-archive':
      return <FileApkIcon size={24} className='text-tertiary' />
    // ogg
    case 'audio/ogg':
      return <FileOggIcon size={24} className='text-tertiary' />
    // m4a
    case 'audio/mp4':
      return <FileM4aIcon size={24} className='text-tertiary' />
    // markdown
    case 'text/markdown':
      return <FileMarkdownIcon size={24} className='text-tertiary' />
    // swift
    case 'text/x-swift':
      return <Image src='/img/services/swift.png' width={24} height={24} alt='' />
    // dockerfile
    case 'text/x-dockerfile':
      return <Image src='/img/services/dockerfile.png' width={24} height={24} alt='' />
    // xml
    case 'text/xml':
      return <FileXmlIcon size={24} className='text-tertiary' />
    // json
    case 'application/json':
      return <FileJsonIcon size={24} className='text-tertiary' />
    default: {
      return <FileIcon size={24} className='text-tertiary' />
    }
  }
}
