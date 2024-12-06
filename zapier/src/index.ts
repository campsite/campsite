import { version as platformVersion } from 'zapier-platform-core'

import authentication from './authentication'
import CommentResource from './resources/comment'
import MessageResource from './resources/message'
import PostResource from './resources/post'
import ProjectResource from './resources/project'

const { version } = require('../package.json')

export default {
  version,
  platformVersion,

  authentication: authentication.config,

  beforeRequest: [...authentication.befores],
  afterResponse: [...authentication.afters],

  // Deprecated this module in v1.0.1 in favor of using the resources format.
  // Zapier recommends leaving it in for a few versions so users have an opportunity
  // to upgrade without breaking changes.
  creates: {
    post: {
      key: 'post',
      noun: 'Post',

      display: {
        ...PostResource.create.display,
        hidden: true
      },

      operation: {
        ...PostResource.create.operation
      }
    }
  },

  resources: {
    comment: CommentResource,
    message: MessageResource,
    post: PostResource,
    project: ProjectResource
  }
}
