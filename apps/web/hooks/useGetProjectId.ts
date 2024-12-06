import { useRouter } from 'next/router'

export function useGetProjectId(): string | undefined {
  const router = useRouter()
  const projectId = router.query.projectId

  return projectId as string
}
