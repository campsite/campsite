import { Call } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { useCopyToClipboard } from '@campsite/ui/hooks'
import { CheckIcon, LinkIcon, PostPlusIcon } from '@campsite/ui/Icons'
import { cn } from '@campsite/ui/utils'

import { CallProjectPermissions } from '@/components/CallSharePopover/CallProjectPermissions'
import { usePostComposer } from '@/components/PostComposer'
import { PostComposerType } from '@/components/PostComposer/utils'

interface CallShareContentProps {
  call: Call
  onOpenChange: (open: boolean) => void
}

export function CallShareContent({ call, onOpenChange }: CallShareContentProps) {
  const [copy, isCopied] = useCopyToClipboard()
  const { showPostComposer } = usePostComposer()
  const canCreatePost = call.project_permission !== 'none'

  return (
    <>
      {call.viewer_can_edit && (
        <div className='flex flex-col gap-3 p-4'>
          <CallProjectPermissions call={call} />
        </div>
      )}

      <div className='dark:bg-elevated bg-secondary flex gap-3 rounded-lg border-t px-4 py-3'>
        <Button
          variant='flat'
          fullWidth
          onClick={() => {
            if (!isCopied) copy(window.location.href)
          }}
          leftSlot={isCopied ? <CheckIcon /> : <LinkIcon />}
          className={cn({
            '!border-transparent !bg-green-500 !text-white !shadow-none !outline-none !ring-0': isCopied
          })}
          tooltipShortcut='mod+shift+c'
        >
          {isCopied ? 'Copied' : 'Copy link'}
        </Button>
        <Button
          variant='flat'
          fullWidth
          onClick={() => {
            onOpenChange(false)
            showPostComposer({ type: PostComposerType.DraftFromCall, call })
          }}
          leftSlot={<PostPlusIcon />}
          disabled={!canCreatePost}
          tooltip={!canCreatePost ? 'Move this private call to a channel to create a post' : undefined}
        >
          Start a post...
        </Button>
      </div>
    </>
  )
}
