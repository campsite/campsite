import { GetStaticPropsContext } from 'next'

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

export default function ChangelogPage(props: Props) {
  const { data } = props

  return (
    <>
      <ChangelogPageComponent {...props}>
        <ChangelogList data={data} />
      </ChangelogPageComponent>
    </>
  )
}

export async function getStaticPaths() {
  const data = await getChangelog()
  const pages = Math.ceil(data.length / PAGE_LIMIT)
  const paths = Array.from({ length: pages }).map((_, i) => {
    return {
      params: {
        pageNumber: (i + 1).toString()
      }
    }
  })

  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const pageParam = context.params?.pageNumber
  const data = await getChangelog()
  const page = parseInt(pageParam as string, 10)
  const startSlice = page === 0 ? 0 : (page - 1) * PAGE_LIMIT
  const endSlice = page * PAGE_LIMIT
  const set = data.slice(startSlice, endSlice)

  const lastPage = Math.ceil(data.length / PAGE_LIMIT)

  return {
    props: {
      data: set,
      hasNextPage: page < lastPage,
      hasPreviousPage: true,
      nextPage: page + 1,
      previousPage: page - 1
    }
  }
}
