import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { Project } from '@campsite/types'

import { createQueryNormalizer } from '@/utils/normy/react-query/create-query-normalizer'
import {
  createNormalizedOptimisticUpdate,
  getNormalizedData,
  getNormalizedKey,
  setNormalizedData
} from '@/utils/queryNormalization'

const createSampleProject = (partial: Partial<Project> = {}): Project => ({
  id: 'proj-123',
  name: 'Project Alpha',
  description: 'This is a sample project description.',
  created_at: '2021-07-21T17:32:28Z',
  last_activity_at: '2021-07-21T17:32:28Z',
  personal: false,
  archived_at: null,
  archived: false,
  slack_channel_id: 'C024BE91L',
  posts_count: 42,
  guests_count: 0,
  cover_photo_url: 'https://example.com/photo.jpg',
  url: 'https://example.com/project-alpha',
  call_room_url: null,
  accessory: null,
  private: true,
  is_general: false,
  is_default: false,
  contributors_count: 5,
  organization_id: 'org-456',
  viewer_has_favorited: false,
  viewer_can_archive: true,
  viewer_can_destroy: false,
  viewer_can_unarchive: true,
  viewer_can_update: true,
  viewer_has_subscribed: false,
  viewer_is_member: true,
  unread_for_viewer: false,
  slack_channel: null,
  type_name: 'project',
  members_count: 1,
  ...partial
})

describe('queryNormalization', () => {
  it('it stores query data in the normalized cache', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient)

    queryNormalizer.subscribe()

    queryClient.setQueryData(['foo-bar'], {
      id: 'foo',
      color: 'blue',
      age: 10
    })

    expect(queryNormalizer.getObjectById('foo')).toEqual({
      id: 'foo',
      color: 'blue',
      age: 10
    })

    queryClient.setQueryData(['cat-dog'], {
      id: 'foo',
      color: 'red',
      age: 4
    })

    expect(queryNormalizer.getObjectById('foo')).toEqual({
      id: 'foo',
      color: 'red',
      age: 4
    })
  })

  it('it sets normalized models', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    queryNormalizer.subscribe()

    queryClient.setQueryData(['foo-bar'], createSampleProject())

    expect(getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })).toEqual(createSampleProject())

    setNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123', update: { name: 'Project Beta' } })

    const partialResult = getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })

    expect(partialResult?.name).toEqual('Project Beta')
    expect(partialResult?.cover_photo_url).toEqual('https://example.com/photo.jpg')
  })

  it('it updates normalized models', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    queryNormalizer.subscribe()

    queryClient.setQueryData(['foo-bar'], createSampleProject())

    expect(getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })).toEqual(createSampleProject())

    setNormalizedData({
      queryNormalizer,
      type: 'project',
      id: 'proj-123',
      update: (old) => ({ name: 'Project Beta', contributors_count: old.contributors_count + 1 })
    })

    const partialResult = getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })

    expect(partialResult?.name).toEqual('Project Beta')
    expect(partialResult?.contributors_count).toEqual(6)
    expect(partialResult?.cover_photo_url).toEqual('https://example.com/photo.jpg')
  })

  it('it sets normalized models across queries and shapes', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    const id = 'proj-123'

    queryNormalizer.subscribe()
    queryClient.setQueryData(['single'], createSampleProject({ id }))
    queryClient.setQueryData(['array'], [createSampleProject({ id }), createSampleProject({ id: 'proj-456' })])
    queryClient.setQueryData(['nested-object'], {
      foo: 'bar',
      project: createSampleProject({ id }),
      projects: [createSampleProject({ id }), createSampleProject({ id: 'proj-456' })]
    })

    expect(getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })).toEqual(createSampleProject())

    setNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123', update: { name: 'Project Beta' } })

    const normalizedData = getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })
    const singleQueryData = queryClient.getQueryData<Project>(['single'])
    const arrayQueryData = queryClient.getQueryData<Project[]>(['array'])
    const nestedObjectQueryData = queryClient.getQueryData<{ project: Project; projects: Project[] }>(['nested-object'])

    expect(normalizedData?.name).toEqual('Project Beta')
    expect(normalizedData?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(singleQueryData?.name).toEqual('Project Beta')
    expect(singleQueryData?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(arrayQueryData?.[0]?.name).toEqual('Project Beta')
    expect(arrayQueryData?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(nestedObjectQueryData?.project?.name).toEqual('Project Beta')
    expect(nestedObjectQueryData?.project?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(nestedObjectQueryData?.projects?.[0]?.name).toEqual('Project Beta')
    expect(nestedObjectQueryData?.projects?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')
  })

  it('it updates normalized models across queries and shapes', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    const id = 'proj-123'

    queryNormalizer.subscribe()
    queryClient.setQueryData(['single'], createSampleProject({ id }))
    queryClient.setQueryData(['array'], [createSampleProject({ id }), createSampleProject({ id: 'proj-456' })])
    queryClient.setQueryData(['nested-object'], {
      foo: 'bar',
      project: createSampleProject({ id }),
      projects: [createSampleProject({ id }), createSampleProject({ id: 'proj-456' })]
    })

    expect(getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })).toEqual(createSampleProject())

    setNormalizedData({
      queryNormalizer,
      type: 'project',
      id: 'proj-123',
      update: (old) => ({ name: 'Project Beta', contributors_count: old.contributors_count + 1 })
    })

    const normalizedData = getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })
    const singleQueryData = queryClient.getQueryData<Project>(['single'])
    const arrayQueryData = queryClient.getQueryData<Project[]>(['array'])
    const nestedObjectQueryData = queryClient.getQueryData<{ project: Project; projects: Project[] }>(['nested-object'])

    expect(normalizedData?.name).toEqual('Project Beta')
    expect(normalizedData?.contributors_count).toEqual(6)
    expect(normalizedData?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(singleQueryData?.name).toEqual('Project Beta')
    expect(singleQueryData?.contributors_count).toEqual(6)
    expect(singleQueryData?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(arrayQueryData?.[0]?.name).toEqual('Project Beta')
    expect(arrayQueryData?.[0]?.contributors_count).toEqual(6)
    expect(arrayQueryData?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(nestedObjectQueryData?.project?.name).toEqual('Project Beta')
    expect(nestedObjectQueryData?.project?.contributors_count).toEqual(6)
    expect(nestedObjectQueryData?.project?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    expect(nestedObjectQueryData?.projects?.[0]?.name).toEqual('Project Beta')
    expect(nestedObjectQueryData?.projects?.[0]?.contributors_count).toEqual(6)
    expect(nestedObjectQueryData?.projects?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')
  })

  it('it creates optimistic updates with rollbacks with function', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    queryNormalizer.subscribe()

    queryClient.setQueryData(['foo-bar'], createSampleProject())

    const update = createNormalizedOptimisticUpdate({
      queryNormalizer,
      type: 'project',
      id: 'proj-123',
      update: (old) => ({ name: 'Project Beta', contributors_count: old.contributors_count + 1 })
    })

    expect(update?.optimisticData.name).toEqual('Project Beta')
    expect(update?.optimisticData.contributors_count).toEqual(6)

    expect(update?.rollbackData.name).toEqual('Project Alpha')
    expect(update?.rollbackData.contributors_count).toEqual(5)
    expect(update?.rollbackData.cover_photo_url).not.toBeDefined()
  })

  it('it creates optimistic updates with rollbacks with an object', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    queryNormalizer.subscribe()

    queryClient.setQueryData(['foo-bar'], createSampleProject())

    const update = createNormalizedOptimisticUpdate<'project'>({
      queryNormalizer,
      type: 'project',
      id: 'proj-123',
      update: { name: 'Project Beta', archived: true }
    })

    expect(update?.optimisticData.name).toEqual('Project Beta')
    expect(update?.optimisticData.archived).toBe(true)

    expect(update?.rollbackData.name).toEqual('Project Alpha')
    expect(update?.rollbackData.archived).not.toBe(true)
    expect(update?.rollbackData.cover_photo_url).not.toBeDefined()
  })

  it('it reorders items in an array', async () => {
    const queryClient = new QueryClient()
    const queryNormalizer = createQueryNormalizer(queryClient, { getNormalizationObjectKey: getNormalizedKey })

    const id = 'proj-123'

    queryNormalizer.subscribe()
    queryClient.setQueryData(['array'], [createSampleProject({ id }), createSampleProject({ id: 'proj-456' })])

    expect(getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })).toEqual(createSampleProject({ id }))

    queryClient.setQueryData(
      ['array'],
      [
        createSampleProject({ id, name: 'Project Beta', contributors_count: 9 }),
        createSampleProject({ id: 'proj-456' })
      ]
    )

    const normalizedData = getNormalizedData({ queryNormalizer, type: 'project', id: 'proj-123' })

    expect(normalizedData?.name).toEqual('Project Beta')
    expect(normalizedData?.contributors_count).toEqual(9)
    expect(normalizedData?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    const arrayQueryData = queryClient.getQueryData<Project[]>(['array'])

    expect(arrayQueryData?.[0]?.name).toEqual('Project Beta')
    expect(arrayQueryData?.[0]?.contributors_count).toEqual(9)
    expect(arrayQueryData?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')

    queryClient.setQueryData(
      ['array'],
      [
        createSampleProject({ id: 'proj-456', name: 'Project Gamma' }),
        createSampleProject({ id, name: 'Project Beta', contributors_count: 9 })
      ]
    )

    const arrayQueryData2 = queryClient.getQueryData<Project[]>(['array'])

    expect(arrayQueryData2?.[0]?.name).toEqual('Project Gamma')
    expect(arrayQueryData2?.[0]?.cover_photo_url).toEqual('https://example.com/photo.jpg')
    expect(arrayQueryData2?.[1]?.name).toEqual('Project Beta')
    expect(arrayQueryData2?.[1]?.cover_photo_url).toEqual('https://example.com/photo.jpg')
  })
})
