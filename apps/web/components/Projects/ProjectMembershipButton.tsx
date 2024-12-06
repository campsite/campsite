import { useState } from 'react'
import { useRouter } from 'next/router'

import { Project } from '@campsite/types'
import { Button } from '@campsite/ui'

import { ProjectRemoveMembershipDialog } from '@/components/Projects/ProjectDialogs/ProjectRemoveMembershipDialog'
import { useScope } from '@/contexts/scope'
import { useCreateProjectMembership } from '@/hooks/useCreateProjectMembership'
import { useDeleteProjectMembership } from '@/hooks/useDeleteProjectMembership'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { ProjectRemoveLastPrivateProjectMembershipDialog } from './ProjectDialogs/ProjectRemoveLastPrivateProjectMembershipDialog'

export function ProjectMembershipButton({
  project,
  joinVariant = 'base',
  joinLabel = 'Join channel',
  className
}: {
  project: Project
  joinVariant?: 'primary' | 'base' | 'important'
  joinLabel?: string
  className?: string
}) {
  const router = useRouter()
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const isMember = project.viewer_is_member
  const deleteProjectMembership = useDeleteProjectMembership(project.id)
  const createProjectMembership = useCreateProjectMembership(project.id)
  const isMutating = deleteProjectMembership.isPending || createProjectMembership.isPending
  const [hovered, setHovered] = useState(false)
  const [removePrivateProjectMembershipDialogOpen, setRemovePrivateProjectMembershipDialogOpen] = useState(false)
  const [removeProjectMembershipDialogOpen, setRemoveProjectMembershipDialogOpen] = useState(false)

  if (!currentUser) return null
  if (project.archived && !isMember) return null
  if (!project.viewer_can_update) return null

  return (
    <>
      <ProjectRemoveMembershipDialog
        project={project}
        user={currentUser}
        open={removeProjectMembershipDialogOpen}
        onOpenChange={setRemoveProjectMembershipDialogOpen}
      />
      <ProjectRemoveLastPrivateProjectMembershipDialog
        project={project}
        open={removePrivateProjectMembershipDialogOpen}
        onOpenChange={setRemovePrivateProjectMembershipDialogOpen}
      />
      <Button
        className={className}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        variant={isMember ? 'flat' : joinVariant}
        onClick={() => {
          if (isMember && project.private && project.members_and_guests_count == 1) {
            setRemovePrivateProjectMembershipDialogOpen(true)
          } else if (isMember && project.private) {
            setRemoveProjectMembershipDialogOpen(true)
          } else if (isMember) {
            deleteProjectMembership.mutate(
              { user: currentUser },
              {
                onSuccess: () => {
                  const projectId = router.query.projectId as string | undefined

                  // If the user deletes memberships from the project page, redirect to the projects index
                  if (project.private && projectId === project.id) {
                    router.push(`/${scope}/projects`)
                  }
                }
              }
            )
          } else {
            createProjectMembership.mutate({ userId: currentUser.id })
          }
        }}
        disabled={isMutating}
      >
        {isMember ? (hovered ? 'Leave' : 'Joined') : joinLabel}
      </Button>
    </>
  )
}
