import * as AccordionPrimitive from '@radix-ui/react-accordion'
import Link from 'next/link'

import { ChevronRightIcon } from '@campsite/ui'

import { SectionText } from './Manifesto'

const FAQData = [
  {
    title: 'Can I try Campsite first?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes — every Campsite organization starts with a 14-day free trial, no credit card required. If you need more
        time to make a decision, just let us know.
      </SectionText>
    )
  },
  {
    title: 'Do I need to leave Slack to use Campsite?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        No — many of our happiest customers use Campsite alongside Slack, where Campsite posts are used for thoughtful
        async conversations and Slack is used for ephemeral chat or customer support.
      </SectionText>
    )
  },
  {
    title: 'Can Campsite help my team consolidate tools?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes — many of our customers have moved all of their internal communication to Campsite, consolidating tools like
        Slack, Notion, Zoom, and Loom.
      </SectionText>
    )
  },
  {
    title: 'Can I add guests to my organization?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes — you can add as many guest roles to your organization as needed. Guest roles are free and do not count
        towards your bill.
      </SectionText>
    )
  },
  {
    title: 'Are there any limits to what my team can create or share?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        No limits — every paid Campsite organization includes unlimited posts, calls, docs, messages, and file uploads.
      </SectionText>
    )
  },
  {
    title: "I didn't see my question here...",
    description: (
      <SectionText className='text-secondary text-wrap'>
        Still have more questions? Please{' '}
        <Link href='/contact' className='text-brand-primary underline-offset-2 hover:underline'>
          get in touch
        </Link>
        .
      </SectionText>
    )
  }
]

export function FAQ() {
  return (
    <AccordionPrimitive.Root type='single' collapsible className='flex flex-col gap-4'>
      {FAQData.map((item) => (
        <FAQItem key={item.title.slice(0, 24)} title={item.title}>
          {item.description}
        </FAQItem>
      ))}
    </AccordionPrimitive.Root>
  )
}
interface FAQItemProps {
  title: string
  children: React.ReactNode
}

export function FAQItem({ title, children }: FAQItemProps) {
  return (
    <AccordionPrimitive.Item value={title} className='flex flex-col'>
      <AccordionPrimitive.Header className='flex'>
        <AccordionPrimitive.Trigger asChild>
          <button className='flex w-full flex-1 items-center gap-2 text-left lg:-ml-8 [&[data-state=open]>span>svg]:rotate-90'>
            <span className='text-quaternary opacity-50'>
              <ChevronRightIcon strokeWidth='2' size={24} className='transition-transform duration-200' />
            </span>
            <SectionText className='font-medium'>{title}</SectionText>
          </button>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'>
        <div className='text-primary col-start-2 flex max-w-3xl flex-col gap-4 pl-8 pt-2 text-base leading-relaxed lg:pl-0'>
          {children}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}
