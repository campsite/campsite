interface SplitViewContainerProps extends React.PropsWithChildren {}

export function SplitViewContainer({ children }: SplitViewContainerProps) {
  return <div className='flex flex-1 divide-x overflow-hidden'>{children}</div>
}
