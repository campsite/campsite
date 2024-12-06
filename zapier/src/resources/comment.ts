import { Bundle, ZObject } from 'zapier-platform-core'

import { apiUrl } from '../utils'
import { mockCreateCommentResponse } from '../utils/mockApi'

const createComment = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: apiUrl('/v1/integrations/zapier/comments'),
    method: 'POST',
    body: {
      content: bundle.inputData.content,
      post_id: bundle.inputData.post_id,
      parent_id: bundle.inputData.parent_id
    },
    skipThrowForStatus: process.env.NODE_ENV === 'test'
  })

  return response.data
}

export default {
  key: 'comment',
  noun: 'Comment',

  create: {
    display: {
      label: 'Create Comment',
      description: 'Create a comment on a post.'
    },

    operation: {
      inputFields: [
        {
          key: 'content',
          required: true,
          type: 'text',
          helpText: 'Markdown is supported.'
        },
        {
          key: 'post_id',
          label: 'Post ID',
          required: true,
          type: 'string'
        },
        {
          key: 'parent_id',
          label: 'Parent comment ID',
          type: 'string',
          helpText: 'Provide the ID of an existing comment to send this comment as a reply.'
        }
      ],
      perform: createComment,
      sample: mockCreateCommentResponse
    }
  }
}
