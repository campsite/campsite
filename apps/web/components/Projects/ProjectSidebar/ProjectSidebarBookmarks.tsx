import { FormEvent, KeyboardEvent, useState } from 'react'
import toast from 'react-hot-toast'

import { Project, ProjectBookmark } from '@campsite/types'
import { Button } from '@campsite/ui/Button'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { DotsHorizontal, PencilIcon, PlusIcon, TrashIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { buildMenuItems } from '@campsite/ui/Menu'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'
import { cn } from '@campsite/ui/utils'

import { BookmarkFavicon } from '@/components/Projects/ProjectBookmarks/BookmarkIcon'
import { useCanHover } from '@/hooks/useCanHover'
import { useCreateProjectBookmark } from '@/hooks/useCreateProjectBookmark'
import { useDeleteProjectBookmark } from '@/hooks/useDeleteProjectBookmark'
import { useGetProjectBookmarks } from '@/hooks/useGetProjectBookmarks'
import { useUpdateProjectBookmark } from '@/hooks/useUpdateProjectBookmark'

// ----------------------------------------------------------------------------

function DeleteBookmarkDialog({
  open,
  onOpenChange,
  bookmark
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmark: ProjectBookmark
}) {
  const deleteBookmark = useDeleteProjectBookmark(bookmark.id)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Delete bookmark?</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this bookmark? This action cannot be undone.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deleteBookmark.mutate()} disabled={deleteBookmark.isPending}>
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}

// ----------------------------------------------------------------------------

function AddBookmarkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createBookmark = useCreateProjectBookmark()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    if (createBookmark.isPending) return
    if (url.trim().length === 0) return

    try {
      new URL(url)
    } catch (error) {
      toast.error('Invalid URL')
      return
    }

    await createBookmark.mutate(
      {
        url: url.trim(),
        title: title ? title.trim() : url.trim()
      },
      {
        onSuccess: () => {
          setUrl('')
          setTitle('')
          onOpenChange(false)
        }
      }
    )
  }

  function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Add a bookmark</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-col gap-4'>
          <TextField
            type='text'
            onKeyDownCapture={handleEnter}
            onChange={setUrl}
            value={url}
            autoComplete='new-password'
            placeholder='https://...'
            label='URL'
          />
          <TextField
            type='text'
            onKeyDownCapture={handleEnter}
            onChange={setTitle}
            value={title}
            autoComplete='new-password'
            placeholder=''
            label='Title (optional)'
          />
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={onSubmit} disabled={!url || createBookmark.isPending}>
            Add
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}

// ----------------------------------------------------------------------------

function EditBookmarkDialog({
  open,
  onOpenChange,
  bookmark
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmark: ProjectBookmark
}) {
  const updateBookmark = useUpdateProjectBookmark(bookmark.id)
  const [url, setUrl] = useState(bookmark.url)
  const [title, setTitle] = useState(bookmark.title)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    if (updateBookmark.isPending) return
    if (url.trim().length === 0) return

    try {
      new URL(url)
    } catch (error) {
      toast.error('Invalid URL')
      return
    }

    await updateBookmark.mutate(
      {
        url: url.trim(),
        title: title ? title.trim() : url.trim()
      },
      {
        onSuccess: () => {
          setUrl('')
          setTitle('')
          onOpenChange(false)
        }
      }
    )
  }

  function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Edit bookmark</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-col gap-4'>
          <TextField
            type='text'
            onKeyDownCapture={handleEnter}
            onChange={setUrl}
            value={url}
            autoComplete='new-password'
            placeholder='https://...'
            label='URL'
          />
          <TextField
            type='text'
            onKeyDownCapture={handleEnter}
            onChange={setTitle}
            value={title}
            autoComplete='new-password'
            placeholder=''
            label='Title (optional)'
          />
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={onSubmit} disabled={!url || updateBookmark.isPending}>
            Add
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}

// ----------------------------------------------------------------------------

function BookmarkOverflowDropdown({ bookmark }: { bookmark: ProjectBookmark }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  let items = buildMenuItems([
    {
      type: 'item',
      leftSlot: <PencilIcon />,
      label: 'Edit',
      onSelect: () => setEditDialogOpen(true)
    },
    {
      type: 'item',
      leftSlot: <TrashIcon />,
      label: 'Delete',
      destructive: true,
      onSelect: () => setDeleteDialogOpen(true)
    }
  ])

  return (
    <>
      <EditBookmarkDialog bookmark={bookmark} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <DeleteBookmarkDialog bookmark={bookmark} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      <span className='flex opacity-0 group-hover/bookmark:opacity-100 has-[button[aria-expanded="true"]]:opacity-100'>
        <DropdownMenu
          items={items}
          align='end'
          trigger={<Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Open menu' />}
        />
      </span>
    </>
  )
}

// ----------------------------------------------------------------------------

function BookmarkLink({ bookmark }: { bookmark: ProjectBookmark }) {
  return (
    <div className='group/bookmark flex w-full items-center'>
      <Link
        href={bookmark.url}
        target={'_blank'}
        rel={'noopener noreferrer'}
        className='first-line:h-7.5 text-tertiary hover:bg-quaternary hover:text-primary relative flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 text-sm font-medium'
        draggable={false}
      >
        <span className='flex-none'>
          <BookmarkFavicon url={bookmark.url} title={bookmark.title} />
        </span>
        <span className='truncate'>{bookmark.title}</span>
      </Link>

      <BookmarkOverflowDropdown bookmark={bookmark} />
    </div>
  )
}

// ----------------------------------------------------------------------------

interface ProjectSidebarBookmarksProps {
  project: Project
}

function ProjectSidebarBookmarks({ project }: ProjectSidebarBookmarksProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { data: bookmarks, isLoading } = useGetProjectBookmarks({ projectId: project.id })
  const canHover = useCanHover()

  return (
    <>
      <AddBookmarkDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <div className='group flex flex-col gap-1 border-b px-4 py-4'>
        <div className='flex items-center justify-between'>
          <UIText size='text-xs' tertiary weight='font-medium'>
            Bookmarks
          </UIText>
          <Button
            onClick={() => setAddDialogOpen(true)}
            size='sm'
            iconOnly={<PlusIcon size={16} />}
            className={cn('text-tertiary hover:text-primary opacity-0 group-hover:opacity-100', {
              'opacity-100': !canHover || !bookmarks || bookmarks.length === 0
            })}
            variant='plain'
            accessibilityLabel='Add bookmark'
          />
        </div>

        {bookmarks && !!bookmarks.length && (
          <ul className='-ml-1.5 -mr-0.5 flex flex-col gap-0.5'>
            {bookmarks.map((bookmark) => (
              <BookmarkLink key={bookmark.id} bookmark={bookmark} />
            ))}
          </ul>
        )}

        {!isLoading && (!bookmarks || bookmarks.length === 0) && (
          <div className='text-quaternary flex items-center'>
            <UIText size='text-xs' inherit>
              Add shortcuts to external resources, like design files or project boards.
            </UIText>
          </div>
        )}
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------

export { ProjectSidebarBookmarks }
