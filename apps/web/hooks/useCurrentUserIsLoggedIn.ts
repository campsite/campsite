import { useGetCurrentUser } from './useGetCurrentUser'

export function useCurrentUserIsLoggedIn() {
  const { data: currentUser } = useGetCurrentUser()

  return !!currentUser?.logged_in
}
