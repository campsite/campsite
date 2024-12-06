import { createAppTester, tools } from 'zapier-platform-core'

import App from '../index'
import {
  mockApi,
  mockCreateCommentReplyRequest,
  mockCreateCommentReplyResponse,
  mockCreateCommentRequest,
  mockCreateCommentResponse,
  mockCreateMessageReplyRequest,
  mockCreateMessageReplyResponse,
  mockCreateMessageRequest,
  mockCreateMessageResponse,
  mockCreatePostRequest,
  mockCreatePostResponse,
  mockProjectsResponse
} from '../utils/mockApi'

const appTester = createAppTester(App)

tools.env.inject()

describe('resources.project', () => {
  it('should load projects', async () => {
    mockApi.get('/v1/integrations/zapier/projects').reply(200, mockProjectsResponse)

    const results = await appTester(App.resources['project'].list.operation.perform)

    expect(results).toBeDefined()
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toEqual('1')
    expect(results[0].name).toEqual('Staff Lounge')
  })
})

describe('resources.message', () => {
  it('should create a message', async () => {
    mockApi.post('/v1/integrations/zapier/messages').reply(200, mockCreateMessageResponse)

    const result = await appTester(App.resources['message'].create.operation.perform, {
      inputData: mockCreateMessageRequest
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.content).toEqual("I'm near the western trail now, I'll hang around in case any hikers come by.")
  })

  it('should create a reply', async () => {
    mockApi.post('/v1/integrations/zapier/messages').reply(200, mockCreateMessageReplyResponse)

    const result = await appTester(App.resources['message'].create.operation.perform, {
      inputData: mockCreateMessageReplyRequest
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.content).toEqual('Thanks, Reed!')
    expect(result.parent_id).toEqual('1')
  })
})

describe('resources.comment', () => {
  it('should create a comment', async () => {
    mockApi.post('/v1/integrations/zapier/comments').reply(200, mockCreateCommentResponse)

    const result = await appTester(App.resources['comment'].create.operation.perform, {
      inputData: mockCreateCommentRequest
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.content).toEqual("<p>I'm in! Don't forget your sunscreen.</p>")
  })

  it('should create a reply', async () => {
    mockApi.post('/v1/integrations/zapier/comments').reply(200, mockCreateCommentReplyResponse)

    const result = await appTester(App.resources['comment'].create.operation.perform, {
      inputData: mockCreateCommentReplyRequest
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.content).toEqual('<p>Thanks for the reminder.</p>')
    expect(result.parent_id).toEqual('1')
  })

  it('should not reply to a reply', async () => {
    mockApi.post('/v1/integrations/zapier/comments').reply(400, {
      code: 'invalid_request'
    })

    const result = await appTester(App.resources['comment'].create.operation.perform, {
      inputData: mockCreateCommentReplyRequest
    })

    expect(result.code).toEqual('invalid_request')
  })
})

describe('resources.post', () => {
  it('should create a post', async () => {
    mockApi.post('/v1/integrations/zapier/posts').reply(200, mockCreatePostResponse)

    const result = await appTester(App.resources['post'].create.operation.perform, {
      inputData: mockCreatePostRequest
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.content).toContain("Who's in for Hiking Club")
  })
})
