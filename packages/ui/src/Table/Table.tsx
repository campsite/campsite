interface Props {
  children: React.ReactNode
}

export function Table(props: Props) {
  const { children } = props

  return <div className='divide-y'>{children}</div>
}

export function TableRow(props: Props) {
  const { children } = props

  return <div className='flex flex-wrap items-center gap-3 p-3'>{children}</div>
}
