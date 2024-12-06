import * as React from 'react'

type Props = React.PropsWithChildren & {
  condition: boolean
  wrap: (children: React.ReactNode) => React.ReactNode
}

export const ConditionalWrap: React.FC<Props> = ({ condition, wrap, children }) =>
  condition ? wrap(children) : children
