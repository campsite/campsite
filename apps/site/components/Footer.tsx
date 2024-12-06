import Link from 'next/link'

import { cn, GithubBleedIcon, LinkedInIcon, ThreadsIcon, UIText, XIcon } from '@campsite/ui'

import { CampsiteIcon } from '@/components/SiteNavigationBar'

import { WidthContainer } from './Layouts/WidthContainer'

export function Footer() {
  return (
    <>
      <div className='relative hidden dark:block'>
        <div className='dark:via-gray-750 absolute bottom-0 left-0 right-0 z-30 h-px bg-gradient-to-r from-white via-neutral-200 to-white dark:from-gray-950 dark:to-gray-950' />
      </div>

      <div className='flex w-full justify-center border-t py-12 md:py-16 lg:py-20 2xl:py-24 dark:border-transparent'>
        <WidthContainer className='grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-6'>
          <div className='flex flex-col gap-6 sm:col-span-2'>
            <Link href='/' className='text-primary select-none'>
              <div className='flex items-center gap-1.5'>
                <CampsiteIcon />
                <span className='text-primary text-lg font-semibold'>Campsite</span>
              </div>
            </Link>
            <div className='flex items-center gap-4'>
              <Link
                className='text-tertiary hover:text-primary text-sm'
                href='/follow'
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='sr-only'>X/Twitter</span>
                <XIcon />
              </Link>
              <Link
                className='text-tertiary hover:text-primary text-sm'
                href='/follow/threads'
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='sr-only'>Threads</span>
                <ThreadsIcon />
              </Link>
              <Link
                className='text-tertiary hover:text-primary text-sm'
                href='/follow/linkedin'
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='sr-only'>LinkedIn</span>
                <LinkedInIcon />
              </Link>
              <Link
                className='text-tertiary hover:text-primary text-sm'
                href='/follow/github'
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='sr-only'>GitHub</span>
                <GithubBleedIcon />
              </Link>
            </div>
          </div>

          <FooterSection>
            <FooterSectionHeading>Product</FooterSectionHeading>
            <FooterSectionLinks>
              <FooterLink href='/pricing'>Pricing</FooterLink>
              <FooterLink href='/blog'>Blog</FooterLink>
              <FooterLink href='/changelog'>Changelog</FooterLink>
            </FooterSectionLinks>
          </FooterSection>

          <FooterSection>
            <FooterSectionHeading>Apps &amp; integrations</FooterSectionHeading>
            <FooterSectionLinks>
              <FooterLink href='/desktop/download'>Desktop app</FooterLink>
              <FooterLink href='https://developers.campsite.com' target='_blank'>
                API Docs
              </FooterLink>
              <FooterLink href='https://linear.app/integrations/campsite' target='_blank'>
                Linear
              </FooterLink>
              <FooterLink href='https://zapier.com/apps/campsite/integrations' target='_blank'>
                Zapier
              </FooterLink>
              <FooterLink href='https://www.figma.com/community/plugin/1108886817260186751/campsite' target='_blank'>
                Figma
              </FooterLink>
              <FooterLink href='https://workspace.google.com/marketplace/app/campsite/723431485517' target='_blank'>
                Google Calendar
              </FooterLink>
              <FooterLink href='https://app.cal.com/apps/campsite' target='_blank'>
                Cal.com
              </FooterLink>
            </FooterSectionLinks>
          </FooterSection>

          <div className='flex flex-col gap-12'>
            <FooterSection>
              <FooterSectionHeading>About</FooterSectionHeading>
              <FooterSectionLinks>
                <FooterLink href='/contact'>Contact</FooterLink>
                <FooterLink href='https://status.campsite.com'>Status</FooterLink>
                <FooterLink href='/privacy'>Privacy</FooterLink>
                <FooterLink href='/terms'>Terms</FooterLink>
                <FooterLink href='/dpa'>DPA</FooterLink>
                <FooterLink href='/cookies'>Cookies</FooterLink>
              </FooterSectionLinks>
            </FooterSection>

            <FooterSection>
              <FooterSectionHeading>Resources</FooterSectionHeading>
              <FooterSectionLinks>
                <FooterLink href='/glossary/slack'>Slack glossary</FooterLink>
              </FooterSectionLinks>
            </FooterSection>
          </div>
        </WidthContainer>
      </div>
    </>
  )
}

function FooterSection(props: React.HTMLProps<HTMLDivElement>) {
  return <div className='col-span-1 flex flex-col gap-1' {...props} />
}

function FooterSectionHeading(props: React.HTMLProps<HTMLDivElement>) {
  return <UIText weight='font-medium py-1 col-span-1' primary {...props} />
}

function FooterSectionLinks(props: React.HTMLProps<HTMLDivElement>) {
  return <div className='col-span-2 -mx-1 flex flex-wrap gap-2 sm:flex-col' {...props} />
}

function FooterLink({ href, className, ...rest }: React.HTMLProps<HTMLAnchorElement>) {
  if (!href) return null

  return <Link href={href} className={cn('text-tertiary hover:text-primary p-1 text-sm', className)} {...rest} />
}
