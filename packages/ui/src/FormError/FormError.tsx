interface FormErrorProps {
  children?: React.ReactNode
}

export function FormError(props: FormErrorProps) {
  const { children } = props

  if (!children) return null

  return <p className='border-l-2 border-red-600 pl-2 text-left text-sm text-red-600'>{children}</p>
}

interface MutationErrorProps {
  mutation: any
}

export function MutationError(props: MutationErrorProps) {
  const { mutation } = props

  const isValid = mutation.isError && mutation.error instanceof Error

  if (!isValid) return null

  return <>{mutation.error.message}</>
}
