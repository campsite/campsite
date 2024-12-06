import ChangelogList from '@/components/Changelog/ChangelogList'
import ChangelogPageComponent from '@/components/Changelog/ChangelogPageComponent'
import { getChangelog, PAGE_LIMIT } from '@/lib/changelog'
import { Changelog } from '@/types/index'

interface Props {
  data: Changelog[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

export default function ChangelogIndexPage(props: Props) {
  const { data } = props

  return (
    <ChangelogPageComponent {...props}>
      <ChangelogList data={data} />
    </ChangelogPageComponent>
  )
}

export async function getStaticProps() {
  const data = await getChangelog()
  const set = data.slice(0, PAGE_LIMIT)

  return {
    props: {
      data: set,
      hasNextPage: data.length > PAGE_LIMIT,
      hasPreviousPage: false,
      nextPage: 2,
      previousPage: null
    }
  }
}
