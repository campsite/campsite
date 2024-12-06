import * as RadixRadioGroup from '@radix-ui/react-radio-group'

export type RadioGroupProps = RadixRadioGroup.RadioGroupProps & {
  label?: string
}

export function RadioGroup({ label, children, ...props }: React.PropsWithChildren<RadioGroupProps>) {
  return (
    <RadixRadioGroup.Root {...props} className={props.className}>
      {label && (
        <span className='block cursor-default select-none text-sm font-medium leading-none tracking-tight'>
          {label}
        </span>
      )}

      {children}
    </RadixRadioGroup.Root>
  )
}
