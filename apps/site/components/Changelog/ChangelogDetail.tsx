import { Changelog } from '../../types'
import ChangelogListItem from './ChangelogListItem'

interface Props {
  changelog: Changelog
}

export function ChangelogDetail(props: Props) {
  const { changelog } = props

  return <ChangelogListItem changelog={changelog} />
}
