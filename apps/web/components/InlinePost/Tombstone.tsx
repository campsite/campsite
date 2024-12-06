import { EyeHideIcon, UIText } from '@campsite/ui'

export function InlinePostTombstone() {
  return (
    <div className='text-tertiary bg-secondary flex flex-col items-start justify-center gap-3 rounded-lg border p-4 lg:flex-row lg:items-center'>
      <EyeHideIcon className='flex-none' size={24} />
      <UIText inherit>This post cannot be found — it may have have moved or been deleted</UIText>
    </div>
  )
}

export function InlineProjectTombstone() {
  return (
    <div className='text-tertiary bg-secondary flex flex-1 flex-col items-start justify-center gap-3 rounded-lg border p-4 lg:flex-row lg:items-center'>
      <EyeHideIcon className='flex-none' size={24} />
      <UIText inherit>Channel not found — it may be private or deleted</UIText>
    </div>
  )
}
