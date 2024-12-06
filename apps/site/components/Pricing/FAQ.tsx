import * as AccordionPrimitive from '@radix-ui/react-accordion'
import Link from 'next/link'

import { FAQItem } from '@/components/Home/HomeFAQ'
import { Section, SectionHeading, SectionText } from '@/components/Home/Manifesto'

const FAQData = [
  {
    title: 'Can I try Campsite first?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes, every Campsite starts with a 14-day free trial, no credit card required.
      </SectionText>
    )
  },
  {
    title: 'How will I be charged when I add team members?',
    description: (
      <>
        <SectionText className='text-secondary text-wrap'>
          Your bill will be updated when members are added to your organization. You aren’t billed for viewers or
          guests. The amount you are charged is prorated based on a percentage of the billing cycle left when each new
          member was added.
        </SectionText>
        <SectionText className='text-secondary text-wrap'>
          If you’re on an annual plan, we’ll reconcile your bill once every three months. If the number of members in
          your organization increased, we’ll charge you a prorated amount for the additional members.
        </SectionText>
      </>
    )
  },
  {
    title: 'Can I add guests to my organization?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes — guest roles do not count as paid seats. Guests will only have access to the channels where they’ve been
        added. They can send direct messages and join group calls.
      </SectionText>
    )
  },
  {
    title: 'Do you have a discount for students or non-profits?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Yes. If you are using Campsite as a student, student group, or within a non-profit, please{' '}
        <Link href='/contact' className='text-brand-primary underline-offset-2 hover:underline'>
          get in touch
        </Link>{' '}
        for a discount.
      </SectionText>
    )
  },
  {
    title: 'How do I cancel my paid plan?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        Your Campsite subscription will automatically renew until you cancel it. You can cancel your subscription at any
        time by going to your organization settings page, then to the billing sub-tab, and following the instructions.
      </SectionText>
    )
  },
  {
    title: 'What happens if we cancel our plan?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        After cancelling your plan, you will have access to all of the functionality on that plan until the end of your
        billing cycle.
      </SectionText>
    )
  },
  {
    title: 'Do you allow payments by invoice?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        We support paying via invoice for customers on our Business plan.{' '}
        <Link href='/contact' className='text-brand-primary underline-offset-2 hover:underline'>
          Get in touch
        </Link>{' '}
        if you have questions.
      </SectionText>
    )
  },
  {
    title: 'How do I change my payment method?',
    description: (
      <SectionText className='text-secondary text-wrap'>
        You can change your payment method at any time by going to your organization settings page, then to the billing
        sub-tab, and follow the instructions to manage your active subscription.
      </SectionText>
    )
  },
  {
    title: 'Do you have a Service-Level Agreement (SLA)?',
    description: (
      <>
        <SectionText className='text-secondary text-wrap'>
          For teams on the Business plan, we can offer a custom SLA for uptime and support response times.
        </SectionText>
        <SectionText className='text-secondary text-wrap'>
          <Link href='/contact' className='text-brand-primary underline-offset-2 hover:underline'>
            Get in touch
          </Link>{' '}
          to learn more.
        </SectionText>
      </>
    )
  },
  {
    title: "I didn't see my question here...",
    description: (
      <SectionText className='text-secondary text-wrap'>
        Still have more questions? Please{' '}
        <Link href='/contact' className='text-brand-primary underline-offset-2 hover:underline'>
          get in touch
        </Link>{' '}
        and we’ll respond soon.
      </SectionText>
    )
  }
]

export function FAQ() {
  return (
    <Section>
      <SectionHeading>Common pricing questions</SectionHeading>

      <AccordionPrimitive.Root type='single' collapsible className='flex flex-col gap-4'>
        {FAQData.map((item) => (
          <FAQItem key={item.title.slice(0, 24)} title={item.title}>
            {item.description}
          </FAQItem>
        ))}
      </AccordionPrimitive.Root>
    </Section>
  )
}
