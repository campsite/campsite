import { Changelog } from '../../types'
import ChangelogListItem from './ChangelogListItem'

interface Props {
  data: Changelog[]
}

export default function ChangelogList(props: Props) {
  const { data } = props

  return (
    <ul className='flex flex-col'>
      {data.map((item) => (
        <ChangelogListItem changelog={item} key={item.data.slug} />
      ))}
    </ul>
  )
}
