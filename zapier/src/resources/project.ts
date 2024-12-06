import { ZObject } from 'zapier-platform-core'

import { apiUrl } from '../utils'
import { mockProjectsResponse } from '../utils/mockApi'

const performList = async (z: ZObject) => {
  const response = await z.request({
    url: apiUrl('/v1/integrations/zapier/projects')
  })

  // handle backwards compatibility between API deploys
  return 'data' in response.data ? response.data.data : response.data
}

export default {
  key: 'project',
  noun: 'Project',

  list: {
    display: {
      label: 'Projects',
      description: 'List the projects in your organization.',
      // prevents this resource from being available as a trigger
      hidden: true
    },
    operation: {
      perform: performList
    }
  },

  sample: mockProjectsResponse.data[0]
}
