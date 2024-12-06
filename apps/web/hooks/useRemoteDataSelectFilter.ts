import { useEffect, useState } from 'react'

import { SelectOption } from '@campsite/ui'

type Props = {
  loading: boolean
  query: string | undefined
}

/*
  Using cmdk's built-in filtering for select menus when we fetch options from the API causes
  options to shift twice: once when the query changes and again when the options load.

  This hook returns a custom filter function we can provide select menus when we fetch options
  from the API to prevent the options from jumping around.
*/
export function useRemoteDataSelectFilter({ loading, query }: Props) {
  const [loadedQuery, setLoadedQuery] = useState<string>()

  useEffect(() => {
    if (loading) return
    setLoadedQuery(query)
  }, [loading, query])

  return (option: SelectOption) => !loadedQuery || option.label.toLowerCase().includes(loadedQuery.toLowerCase())
}
