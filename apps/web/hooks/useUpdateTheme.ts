import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

export type Theme = 'light' | 'dark' | 'system'

type UpdateThemeProps = {
  theme: Theme
}

export function useUpdateTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateThemeProps) =>
      apiClient.users.putMePreference().request({ preference: 'theme', value: data.theme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMe().requestKey() })
    }
  })
}
