import { Bundle, ZObject } from 'zapier-platform-core'

import { apiUrl } from '../utils'
import { mockCreatePostResponse } from '../utils/mockApi'

const createMessage = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: apiUrl('/v1/integrations/zapier/messages'),
    method: 'POST',
    body: {
      content: bundle.inputData.content,
      thread_id: bundle.inputData.thread_id,
      parent_id: bundle.inputData.parent_id
    }
  })

  return response.data
}

export default {
  key: 'message',
  noun: 'Message',

  create: {
    display: {
      label: 'Send Message',
      description: 'Send a message to a chat.'
    },

    operation: {
      inputFields: [
        {
          key: 'content',
          required: true,
          type: 'text',
          helpText: 'The content of the message.'
        },
        {
          key: 'thread_id',
          label: 'Thread ID',
          required: true,
          type: 'string'
        },
        {
          key: 'parent_id',
          label: 'Reply to ID',
          type: 'string',
          helpText: 'Provide the ID of an existing message to send this message as a reply.'
        }
      ],
      perform: createMessage,
      sample: mockCreatePostResponse
    }
  }
}
