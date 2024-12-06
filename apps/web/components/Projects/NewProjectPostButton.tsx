import { Button, ButtonProps } from '@campsite/ui/Button'

import { usePostComposer } from '@/components/PostComposer'

interface NewPostButtonProps {
  projectId?: string
  onClick?: () => void
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

export function NewProjectPostButton({ projectId, onClick, variant = 'flat', size = 'base' }: NewPostButtonProps) {
  const { showPostComposer } = usePostComposer()

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => {
        showPostComposer({ projectId })
        onClick?.()
      }}
    >
      New post
    </Button>
  )
}
