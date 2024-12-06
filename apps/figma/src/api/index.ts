import { client } from './client'
import * as analytics from './services/analytics'
import * as attachments from './services/attachments'
import * as auth from './services/auth'
import * as figma from './services/figma'
import * as integrations from './services/integrations'
import * as organizations from './services/organizations'
import * as posts from './services/posts'
import * as projects from './services/projects'
import * as slack from './services/slack'

export const api = {
  client,
  analytics,
  attachments,
  auth,
  figma,
  integrations,
  organizations,
  posts,
  projects,
  slack
}
