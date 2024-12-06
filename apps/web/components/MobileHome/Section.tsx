import { PropsWithChildren } from 'react'

export function Section({ children }: PropsWithChildren) {
  return <div className='border-b py-3'>{children}</div>
}
