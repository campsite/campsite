import { ArrowLeftIcon, Button } from '@campsite/ui'

import { useGoBack } from './Providers/HistoryProvider'

interface Props {
  fallbackPath?: string
  icon?: React.ReactNode
}

export function BackButton({ fallbackPath, icon = <ArrowLeftIcon /> }: Props) {
  const goBack = useGoBack()

  return <Button variant='plain' onClick={() => goBack({ fallbackPath })} iconOnly={icon} accessibilityLabel='Back' />
}
