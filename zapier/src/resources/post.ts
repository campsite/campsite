import { Bundle, ZObject } from 'zapier-platform-core'

import { ZapierIntegrationPostsPostRequest } from '@campsite/types'

import { apiUrl } from '../utils'
import { mockCreatePostResponse } from '../utils/mockApi'

const createPost = async (z: ZObject, bundle: Bundle<ZapierIntegrationPostsPostRequest>) => {
  const response = await z.request({
    url: apiUrl('/v1/integrations/zapier/posts'),
    method: 'POST',
    body: {
      title: bundle.inputData.title,
      content: bundle.inputData.content,
      project_id: bundle.inputData.project_id
    }
  })

  return response.data
}

export default {
  key: 'post',
  noun: 'Post',

  create: {
    display: {
      label: 'Create Post',
      description: 'Create a new post.'
    },

    operation: {
      perform: createPost,
      sample: mockCreatePostResponse,
      inputFields: [
        {
          key: 'title',
          type: 'string',
          label: 'Post title (optional)'
        },
        {
          key: 'content',
          type: 'text',
          label: 'Post body',
          required: true,
          helpText: 'Markdown is supported.'
        },
        {
          key: 'project_id',
          type: 'string',
          label: 'Space',
          required: true,
          dynamic: 'project.id',
          helpText: 'Select the space to create this post in.'
        }
      ]
    }
  }
}
