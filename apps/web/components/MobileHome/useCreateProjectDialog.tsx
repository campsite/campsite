import { useState } from 'react'
import Router from 'next/router'

import { useScope } from '@/contexts/scope'

import { CreateProjectDialog } from '../Projects/Create/CreateProjectDialog'

export function useCreateProjectDialog() {
  const { scope } = useScope()
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  return {
    setCreateProjectOpen,
    createProjectDialog: (
      <CreateProjectDialog
        onOpenChange={setCreateProjectOpen}
        open={createProjectOpen}
        onCreate={(channel) => {
          setCreateProjectOpen(false)
          Router.push(`/${scope}/projects/${channel.id}`)
        }}
      />
    )
  }
}
