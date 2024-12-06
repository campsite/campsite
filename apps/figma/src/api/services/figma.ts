import { useMutation } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { OrganizationFigmaFilesPostRequest } from '@campsite/types/generated'

import { client } from '../client'

export interface CreateFileOptions {
  organization: string
  data: OrganizationFigmaFilesPostRequest
}

export function useCreateFileMutation() {
  const token = useToken()

  return useMutation({
    mutationFn: (options: CreateFileOptions) =>
      client.organizations.postFigmaFiles().request(options.organization, options.data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
  })
}
