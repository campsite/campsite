import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { Post } from '@campsite/types/generated'

import { PostSchema } from '@/components/Post/schema'
import { atomWithToggle } from '@/utils/atomWithToggle'

// ----------------------------------------------------------------------------

enum PostComposerSuccessBehavior {
  Toast = 'toast',
  Redirect = 'redirect'
}

enum PostComposerPresentation {
  Dialog = 'dialog',
  Mole = 'mole'
}

enum PostComposerType {
  EditPost = 'edit-post',
  EditDraftPost = 'edit-draft-post',

  /**
   * This is the only type that is persisted to local storage.
   */
  Draft = 'draft',
  /**
   * Automatically creates new post version based on the given post.
   */
  DraftFromPost = 'draft-from-post',
  DraftFromNote = 'draft-from-note',
  DraftFromCall = 'draft-from-call',
  DraftFromMessage = 'draft-from-message',
  DraftFromComment = 'draft-from-comment',
  DraftFromText = 'draft-from-text'
}

function isDraftType(type?: PostComposerType): boolean {
  return (
    type === PostComposerType.Draft ||
    type === PostComposerType.DraftFromComment ||
    type === PostComposerType.DraftFromNote ||
    type === PostComposerType.DraftFromCall ||
    type === PostComposerType.DraftFromMessage ||
    type === PostComposerType.DraftFromText
  )
}

function getSaveDraftButtonId(type?: PostComposerType) {
  if (type === PostComposerType.EditPost) {
    return PostComposerAction.UpdatePost
  }

  if (type === PostComposerType.EditDraftPost) {
    return PostComposerAction.UpdatePostDraft
  }

  if (isDraftType(type)) {
    return PostComposerAction.SavePostDraft
  }
}

function getSubmitButtonId(type?: PostComposerType) {
  if (type === PostComposerType.EditPost) {
    return PostComposerAction.UpdatePost
  }

  if (type === PostComposerType.EditDraftPost) {
    return PostComposerAction.PublishPostDraft
  }

  if (isDraftType(type)) {
    return PostComposerAction.CreatePost
  }

  if (type === PostComposerType.DraftFromPost) {
    return PostComposerAction.CreateNewVersion
  }
}

enum PostComposerAction {
  CreatePost = 'create-post',
  CreateNewVersion = 'create-new-version',
  UpdatePost = 'update-post',
  SavePost = 'save-post',

  SavePostDraft = 'save-post-draft',
  UpdatePostDraft = 'update-post-draft',
  PublishPostDraft = 'publish-post-draft'
}

// ----------------------------------------------------------------------------

type PostComposerState = {
  successBehavior: PostComposerSuccessBehavior
  defaultValues: PostSchema
} & (
  | {
      type:
        | PostComposerType.Draft
        | PostComposerType.DraftFromPost
        | PostComposerType.DraftFromNote
        | PostComposerType.DraftFromCall
        | PostComposerType.DraftFromMessage
        | PostComposerType.DraftFromComment
        | PostComposerType.DraftFromText
    }
  | {
      type: PostComposerType.EditPost | PostComposerType.EditDraftPost
      initialPost: Post
    }
)

const postComposerStateAtom = atom<PostComposerState | undefined>(undefined)
const isPostComposerExpandedAtomFamily = atomFamily((presentation: PostComposerPresentation) =>
  atomWithToggle(getIsPostComposerExpandedDefaultValue(presentation))
)

// ----------------------------------------------------------------------------

function getIsPostComposerExpandedDefaultValue(postComposerPresentation: PostComposerPresentation) {
  switch (postComposerPresentation) {
    case PostComposerPresentation.Dialog:
      return false
    case PostComposerPresentation.Mole:
      return true
  }
}

// ----------------------------------------------------------------------------

export {
  PostComposerSuccessBehavior,
  PostComposerPresentation,
  PostComposerType,
  PostComposerAction,
  postComposerStateAtom,
  isPostComposerExpandedAtomFamily,
  getIsPostComposerExpandedDefaultValue,
  isDraftType,
  getSubmitButtonId,
  getSaveDraftButtonId
}
