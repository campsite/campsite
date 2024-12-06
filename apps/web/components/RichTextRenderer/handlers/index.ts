import React from 'react'
import { JSONContent } from '@tiptap/core'

import { MediaGalleryOptions } from '@campsite/editor'

import { PostNoteAttachmentOptions } from './PostNoteAttachment'
import { TaskItemOptions } from './TaskItem'

interface NodeProps {
  node: JSONContent
}

export type NodeHandler<T = {}> = React.FC<React.PropsWithChildren & NodeProps & T>

export interface PostHandlersOptions {
  mediaGallery?: MediaGalleryOptions
  postNoteAttachment?: PostNoteAttachmentOptions
  taskItem?: TaskItemOptions
}
