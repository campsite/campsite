import { cn } from '@campsite/ui'

export function Table(props: { children: React.ReactNode }) {
  return <table className='not-prose mb-24 w-full table-fixed border-separate border-spacing-0 text-base' {...props} />
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className='text-primary rounded-md border-b text-left'>
      <tr>{children}</tr>
    </thead>
  )
}

export function Tbody(props: { children: React.ReactNode }) {
  return <tbody {...props} />
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('bg-tertiary p-3', className)}>{children}</th>
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('text-secondary border-b p-3 align-top', className)}>{children}</td>
}
