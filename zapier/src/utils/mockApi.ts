import * as nock from 'nock'

import {
  GetIntegrationsZapierProjectsData,
  PostIntegrationsZapierCommentsData,
  PostIntegrationsZapierMessagesData,
  PostIntegrationsZapierPostsData,
  ZapierIntegrationCommentsPostRequest,
  ZapierIntegrationMessagesPostRequest,
  ZapierIntegrationPostsPostRequest
} from '@campsite/types'

import { apiUrl, authUrl } from '.'

export const mockApi = nock(apiUrl(''))
export const mockAuthApi = nock(authUrl(''))

/**
 * Note: mock data is occasionally shown to users in Zapier to demonstrate
 * what an endpoint returns, so let's use content from Frontier Forest.
 *
 * Zapier testing guide: https://platform.zapier.com/reference/cli-docs#testing
 */

export const mockCreatePostRequest: ZapierIntegrationPostsPostRequest = {
  content: "Who's in for Hiking Club this Saturday? Weather is looking beautiful! Meet at the park at 8am?",
  project_id: '1'
}

export const mockCreatePostResponse: PostIntegrationsZapierPostsData = {
  id: '1',
  project_id: '1',
  title: '',
  content: "<p>Who's in for Hiking Club this Saturday? Weather is looking beautiful! Meet at the park at 8am?</p>",
  created_at: '2024-04-01T000:00:00Z',
  published_at: '2024-04-01T000:00:00Z',
  url: 'https://app.campsite.com/frontier-forest/posts/1'
}

export const mockProjectsResponse: GetIntegrationsZapierProjectsData = {
  data: [
    {
      id: '1',
      name: 'Staff Lounge'
    },
    {
      id: '2',
      name: 'Maintenance Requests'
    }
  ]
}

export const mockCreateMessageRequest: ZapierIntegrationMessagesPostRequest = {
  content: "I'm near the western trail now, I'll hang around in case any hikers come by.",
  thread_id: '1'
}

export const mockCreateMessageResponse: PostIntegrationsZapierMessagesData = {
  id: '1',
  content: "I'm near the western trail now, I'll hang around in case any hikers come by.",
  created_at: '2024-04-01T000:00:00Z',
  updated_at: '2024-04-01T000:00:00Z',
  parent_id: null
}

export const mockCreateMessageReplyRequest: ZapierIntegrationMessagesPostRequest = {
  content: 'Thanks, Reed!',
  parent_id: '1'
}

export const mockCreateMessageReplyResponse: PostIntegrationsZapierMessagesData = {
  ...mockCreateMessageResponse,
  id: '2',
  content: 'Thanks, Reed!',
  parent_id: '1'
}

export const mockCreateCommentRequest: ZapierIntegrationCommentsPostRequest = {
  content: "I'm in! Don't forget your sunscreen.",
  post_id: '1'
}

export const mockCreateCommentResponse: PostIntegrationsZapierCommentsData = {
  id: '1',
  content: "<p>I'm in! Don't forget your sunscreen.</p>",
  created_at: '2024-04-01T000:00:00Z',
  parent_id: null
}

export const mockCreateCommentReplyRequest: ZapierIntegrationCommentsPostRequest = {
  content: 'Thanks for the reminder.',
  parent_id: '1'
}

export const mockCreateCommentReplyResponse: PostIntegrationsZapierCommentsData = {
  ...mockCreateCommentResponse,
  id: '2',
  content: '<p>Thanks for the reminder.</p>',
  parent_id: '1'
}
