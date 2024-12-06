import { useGetCurrentUser } from './useGetCurrentUser'

export function useCurrentUserIsStaff() {
  const { data: currentUser } = useGetCurrentUser()

  return !!currentUser?.staff
}
