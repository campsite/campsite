/* eslint-disable max-lines */
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

import {
  Avatar,
  Badge,
  BellIcon,
  Button,
  CheckCircleFilledFlushIcon,
  CloseIcon,
  cn,
  FaceSmilePlusIcon,
  MicrophoneIcon,
  PostFilledIcon,
  SignIcon,
  SmartSummaryIcon,
  StreamIcon,
  UIText,
  VideoCameraIcon
} from '@campsite/ui'

import { messageThreads } from '@/components/Chat/data'
import { Messages } from '@/components/Chat/Messages'
import { FacePile } from '@/components/Facepile'
import { CustomerLogos } from '@/components/Home/CustomerLogos'
import { StartButton } from '@/components/Home/StartButton'
import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { FounderNote } from './FounderNote'
import { FAQ } from './HomeFAQ'
import { Testimonial } from './Testimonial'

export function Manifesto() {
  return (
    <div className='w-full overflow-hidden'>
      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-2xl gap-4 pt-12 md:pt-16 lg:pt-20 lg:text-center xl:pt-24 2xl:pt-28'>
        <PageTitle className='leading-[1]'>Teamwork, meet deep work</PageTitle>

        <SectionText className='text-wrap text-[clamp(1.1rem,_2vw,_1.4rem)] font-medium'>
          The new standard for thoughtful team communication — replace noisy chats with focused, organized posts.
        </SectionText>

        <div className='mt-2'>
          <CTA />
        </div>

        <CustomerLogos />
      </WidthContainer>

      <Screenshots />

      <WidthContainer className='3xl:gap-36 4xl:gap-40 xl:gap-18 3xl:py-32 4xl:py-36 isolate max-w-2xl gap-20 py-12 md:gap-24 md:py-16 lg:gap-28 lg:py-20 xl:py-24 2xl:gap-32 2xl:py-28'>
        <Section>
          <SectionHeading className='lg:text-center'>Posts are the sweet spots between chat and docs</SectionHeading>

          <PostsGraphic />
        </Section>

        <Section>
          <SectionHeading className='lg:text-center'>
            Posts keep team communication transparent, decisive, and async-friendly
          </SectionHeading>

          <div className='flex flex-col gap-6 py-6'>
            <div className='grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6'>
              <div className='bg-tertiary dark:bg-secondary flex transform select-none items-center justify-center rounded-xl border-[0.5px] p-4 md:aspect-video dark:border-transparent'>
                <div className='bg-elevated dark:bg-gray-750 flex w-full items-start gap-3 rounded-lg border-[0.5px] px-3 py-2 shadow'>
                  <SmartSummaryIcon size={32} />
                  <div className='flex flex-1 flex-col'>
                    <UIText weight='font-medium'>Show summary</UIText>
                    <UIText tertiary>34 comments</UIText>
                  </div>
                </div>
              </div>
              <div className='flex gap-3 md:flex-col md:justify-center md:gap-1'>
                <div className='flex flex-col gap-1.5'>
                  <p className='text-base font-medium'>Summarize</p>

                  <p className='text-tertiary text-balance text-base leading-[1.4]'>
                    Recap long discussions with one-click smart summaries
                  </p>
                </div>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6'>
              <div className='bg-tertiary dark:bg-secondary transform select-none overflow-hidden rounded-xl border-[0.5px] pl-4 pt-4 md:aspect-video md:pl-5 md:pt-5 dark:border-transparent'>
                <div className='bg-elevated flex h-full w-full flex-col gap-1 rounded-tl-lg border-l-[0.5px] border-t-[0.5px] p-4 shadow dark:bg-gray-800'>
                  <Badge className='mb-2.5 h-auto self-start rounded-full py-2 pl-[9px] pr-3.5' color='green'>
                    <span className='flex items-center gap-2'>
                      <CheckCircleFilledFlushIcon size={14} />
                      <span className='-mb-[0.5px] text-[11px] tracking-wide'>Resolved</span>
                    </span>
                  </Badge>
                  <UIText primary className='min-w-[300px]' weight='font-medium'>
                    Marketing site launch plan
                  </UIText>
                  <div className='flex flex-col gap-2.5 py-2'>
                    <div className='bg-quaternary h-2 w-[90%] rounded-full' />
                    <div className='bg-quaternary h-2 w-[60%] rounded-full' />
                    <div className='bg-quaternary h-2 w-[75%] rounded-full' />
                  </div>
                </div>
              </div>
              <div className='flex gap-3 md:flex-col md:justify-center md:gap-1'>
                <div className='flex flex-col gap-1.5'>
                  <p className='text-base font-medium'>Resolve</p>

                  <p className='text-tertiary text-balance text-base leading-[1.4]'>
                    Close the loop with magically-generated resolutions
                  </p>
                </div>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6'>
              <div className='bg-tertiary dark:bg-secondary relative flex transform select-none flex-col gap-3 overflow-hidden rounded-xl border-[0.5px] pl-4 pt-4 md:aspect-video lg:pl-0 lg:pt-0 dark:border-transparent'>
                <div className='bg-elevated left-4 top-4 flex w-[700px] flex-none rounded-tl-lg border-l-[0.5px] border-t-[0.5px] shadow md:left-5 md:top-5 lg:absolute dark:bg-gray-800'>
                  <div className='flex h-full w-[320px] flex-col border-r-[0.5px]'>
                    <div className='h-11.5 flex items-center gap-0.5 border-b-[0.5px] p-2'>
                      <Button variant='plain'>Inbox</Button>
                      <Button variant='flat'>Follow up</Button>
                    </div>
                    <div className='flex flex-col gap-px p-1.5'>
                      <div className='flex select-none gap-3 rounded-lg p-2 pr-2.5'>
                        <Avatar src='/img/team/alexandru.png' name='Alexandru' size='sm' />

                        <div className='flex flex-1 flex-col gap-0.5'>
                          <div className='flex items-center justify-between'>
                            <UIText inherit className='text-amber-500'>
                              Follow up in 1h
                            </UIText>
                          </div>

                          <UIText weight='font-medium'>Q2 Investor Update</UIText>
                          <div className='flex flex-col gap-2.5 py-2'>
                            <div className='bg-quaternary h-2 w-[90%] rounded-full' />
                            <div className='bg-quaternary h-2 w-[60%] rounded-full' />
                            <div className='bg-quaternary h-2 w-[75%] rounded-full' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex w-[380px] flex-1 flex-col overflow-hidden'>
                    <div className='h-11.5 flex w-full items-center gap-1.5 overflow-hidden border-b-[0.5px] p-2'></div>
                    <div className='p-16'></div>
                  </div>
                </div>
              </div>

              <div className='flex gap-3 md:flex-col md:justify-center md:gap-1'>
                <div className='flex flex-col gap-1.5'>
                  <p className='text-base font-medium'>Follow up</p>

                  <p className='text-tertiary text-balance text-base leading-[1.4]'>
                    Set a reminder to revisit any conversation
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Testimonial
            link='https://x.com/benedictfritz'
            byline='Benedict Fritz, Co-founder at Arrows'
            avatar='/img/home/benedict.jpg'
          >
            <span>
              <Highlight>Campsite is the perfect tool for async communication.</Highlight> Working in Slack can feel
              suffocating. Campsite gives your thoughts the room to breathe that they need.
            </span>
          </Testimonial>
        </Section>

        <Section>
          <SectionHeading className='lg:text-center'>
            Connect the dots between posts and easily reference past decisions
          </SectionHeading>

          <ConnectTheDots />

          <Testimonial
            link='https://x.com/ryanolsonk'
            byline='Ryan Olson, CTO at Retro'
            avatar='/img/home/ryanolson.jpg'
          >
            <span>
              Campsite is like the office for our remote team. It’s a delightful space where we jam on ideas and{' '}
              <Highlight>keep everyone updated on work-in-progress.</Highlight>
            </span>
          </Testimonial>
        </Section>

        <Section>
          <SectionHeading className='lg:text-center'>
            Follow teams &amp; projects without drowning in notifications
          </SectionHeading>

          <KnowledgeSilosGraphic />

          <Testimonial
            link='https://x.com/peer_rich'
            byline='Peer Richelsen, Co-founder at Cal.com'
            avatar='/img/home/peer.jpg'
          >
            <span>
              We went from Slack to Twist to Threads and finally found the best async-first tool for our remote team.{' '}
              <Highlight>Campsite allows us to be more mindful with posts without distracting everyone.</Highlight> It’s
              a huge productivity bonus over Slack.
            </span>
          </Testimonial>
        </Section>

        <Section>
          <SectionHeading className='lg:text-center'>
            Direct messages and quick calls for everything in-between
          </SectionHeading>
          <CallsChat />
        </Section>

        <Section>
          <SectionHeading className='mb-4 lg:text-center'>
            Supercharge every post with apps and custom integrations
          </SectionHeading>
          <ExtendAutomate />
        </Section>

        <Section className='gap-8'>
          <FounderNote />
          <CTA />
        </Section>

        <Section>
          <SectionHeading>Common questions</SectionHeading>
          <FAQ />
        </Section>
      </WidthContainer>
    </div>
  )
}

export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        'scroll-mt-20 text-balance text-[clamp(1.5rem,_3vw,_1.8rem)] font-semibold leading-[1.2] -tracking-[0.5px]',
        className
      )}
    >
      {children}
    </h3>
  )
}

export function SectionText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-balance text-[clamp(1rem,_2vw,_1.1rem)] leading-relaxed -tracking-[0.1px] md:-tracking-[0.2px] lg:-tracking-[0.3px] xl:-tracking-[0.4px]',
        className
      )}
    >
      {children}
    </p>
  )
}

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('flex flex-col gap-4', className)}>{children}</section>
}

function CTA() {
  return (
    <div className='flex flex-col gap-2'>
      <StartButton className='flex-none' />

      <p className='text-quaternary mt-1 text-balance text-center text-xs'>
        14-day free trial, no credit card required. Up and running in two minutes.
      </p>
    </div>
  )
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className='-mx-0.5 rounded bg-amber-100 decoration-clone px-0.5 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100'>
      {children}
    </span>
  )
}

function PostsGraphic() {
  return (
    <div className='mb-4 mt-4 flex flex-col gap-6 lg:-mx-4 xl:-mx-6 2xl:-mx-8'>
      <div className='group/posts relative flex items-center justify-center'>
        <CompactPost
          className='absolute left-[1rem] top-3.5 z-[1] max-w-[calc(100%-2rem)] opacity-50 transition-all delay-100 group-hover/posts:-translate-y-4 group-hover/posts:opacity-0 group-hover/posts:delay-[150ms]'
          post={null}
        />
        <CompactPost
          className='absolute left-[0.5rem] top-2 z-[2] max-w-[calc(100%-1rem)] bg-white/80 opacity-80 backdrop-blur-lg transition-all delay-[150ms] group-hover/posts:-translate-y-2.5 group-hover/posts:opacity-0 group-hover/posts:delay-100 dark:bg-gray-900/80'
          post={null}
        />
        <Link href='https://app.campsite.com/campsite/posts/edf4uyexwd84' target='_blank'>
          <CompactPost
            className='z-[3] transition-all group-hover/posts:shadow'
            post={{
              author: '/img/team/brian.jpeg',
              title: 'What we’re working on · September 2024',
              description: 'Brian: Hey everyone, thanks for joining this space and sharing feedback!',
              channel: '🧪 Product',
              comments: 34
            }}
          />
        </Link>
      </div>
      <div className='flex justify-center'>
        <ClickToSee />
      </div>
    </div>
  )
}

interface Post {
  author: string
  title: string
  description: string
  channel: string
  comments: number
}

function CompactPost({ post, className }: { post: Post | null; className?: string }) {
  return (
    <div
      className={cn(
        'bg-elevated min-h-17 group relative flex w-full select-none scroll-m-1 gap-3 rounded-xl border-[0.5px] px-4 py-3 shadow-sm',
        className
      )}
    >
      {post && (
        <>
          <div className='mt-0.5 flex items-start self-start'>
            <Image alt={post.title} src={post.author} width={80} height={80} className='h-10 w-10 rounded-full' />
          </div>

          <div className='flex flex-1 flex-row items-center gap-3'>
            <div className='flex flex-1 items-center'>
              <div className='flex flex-1 flex-col gap-0.5'>
                <UIText primary weight='font-medium' className='break-anywhere mr-2 line-clamp-1 text-[15px]'>
                  {post.title}
                </UIText>

                <div className='flex items-center'>
                  <span className='h-4.5 text-tertiary mr-2 mt-px flex items-center justify-center self-start rounded bg-black/[0.04] px-1.5 text-[10px] font-semibold uppercase dark:bg-white/10'>
                    {post.comments}
                  </span>

                  <UIText tertiary className='break-anywhere line-clamp-1 flex-1'>
                    {post.description}
                  </UIText>
                </div>
              </div>
            </div>

            <div className='self-center'>
              <ProjectTag channel={post.channel} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProjectTag({ channel }: { channel: string }) {
  return (
    <span className='text-quaternary relative flex h-6 items-center gap-1 rounded-full border-[0.5px] px-2'>
      <UIText className='flex-none' size='text-xs' inherit>
        {channel}
      </UIText>
    </span>
  )
}

function ClickToSee() {
  return (
    <svg
      className='text-quaternary'
      width='285'
      height='33'
      viewBox='0 0 285 33'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        className='opacity-50'
        d='M185.86 6.57894C184.978 6.48893 184.525 7.01378 183.949 7.24244C183.556 7.40204 183.125 7.55315 182.72 7.5574C181.852 7.56508 181.322 6.53102 181.821 5.85164C182.078 5.51503 182.4 5.19924 182.752 4.96346C184.972 3.48659 187.206 2.0159 189.461 0.571366C189.871 0.30257 190.377 0.134598 190.871 0.0281462C191.621 -0.140368 192.328 0.472433 192.315 1.20839C192.312 1.41526 192.278 1.63363 192.24 1.84201C191.846 3.87576 191.475 5.91185 191.042 7.93711C190.941 8.40921 190.742 8.89583 190.467 9.30779C189.941 10.1002 189.07 10.0402 188.582 9.20766C188.447 8.97298 188.376 8.69145 188.214 8.26141C187.863 8.56486 187.609 8.75228 187.387 8.99586C185.969 10.5357 184.562 12.0718 183.158 13.6178C180.026 17.0495 176.089 19.3001 171.828 21.0327C170.496 21.5691 169.057 21.9408 167.637 22.0879C165.413 22.3212 163.169 22.3792 160.943 22.3618C158.436 22.3365 156.369 21.2311 154.652 19.4799C154.367 19.1875 154.103 18.7958 154.014 18.4066C153.953 18.1212 154.092 17.6576 154.312 17.4717C154.533 17.2858 155.026 17.237 155.294 17.3641C155.737 17.5514 156.126 17.907 156.511 18.2189C158.089 19.4746 159.874 20.0807 161.911 19.9979C164.002 19.906 166.103 19.9932 168.16 19.5029C172.697 18.4088 176.636 16.1921 180.015 13.0444C181.855 11.3334 183.479 9.38456 185.198 7.53656C185.437 7.2753 185.598 6.96322 185.86 6.57894Z'
        fill='currentColor'
      />
      <path
        d='M0.292969 21.3008C0.292969 21.0534 0.390625 20.8385 0.585938 20.6562C0.794271 20.4609 0.950521 20.3307 1.05469 20.2656C1.17188 20.1875 1.25 20.1289 1.28906 20.0898C1.35417 21.2747 2.15495 21.8672 3.69141 21.8672C4.90234 21.8672 6.3151 21.4896 7.92969 20.7344C9.07552 20.2135 9.84375 19.6797 10.2344 19.1328C10.3646 18.9635 10.4297 18.8268 10.4297 18.7227C10.4297 18.6055 10.4102 18.5143 10.3711 18.4492L2.26562 16.6328C2.03125 16.5807 1.80339 16.4701 1.58203 16.3008C1.17839 16.0143 0.976562 15.7539 0.976562 15.5195C0.976562 14.6211 1.61458 13.8073 2.89062 13.0781C4.29688 12.2839 6.17839 11.6849 8.53516 11.2812C9.06901 11.1901 9.46615 11.138 9.72656 11.125C9.80469 11.151 9.92188 11.1771 10.0781 11.2031C10.2474 11.2161 10.4167 11.2422 10.5859 11.2812C10.9896 11.3724 11.1589 11.5417 11.0938 11.7891C11.0938 12.2318 10.2474 12.5833 8.55469 12.8438C6.36719 13.1693 5 13.4427 4.45312 13.6641C3.91927 13.8854 3.52865 14.1133 3.28125 14.3477C3.04688 14.582 2.92318 14.862 2.91016 15.1875C2.91016 15.2526 3.0599 15.3242 3.35938 15.4023C3.65885 15.4805 4.01693 15.5781 4.43359 15.6953C4.85026 15.7995 5.39062 15.9427 6.05469 16.125C7.66927 16.5677 9.64844 17.1276 11.9922 17.8047C12.1224 18.0911 12.1875 18.3581 12.1875 18.6055C12.1875 19.2956 11.7839 19.9596 10.9766 20.5977C10.0651 21.3138 8.80208 21.9193 7.1875 22.4141C5.84635 22.8177 4.77865 23.0195 3.98438 23.0195C3.32031 23.0195 2.6888 22.9023 2.08984 22.668C1.49089 22.4336 1.04167 22.2057 0.742188 21.9844C0.442708 21.763 0.292969 21.5352 0.292969 21.3008Z'
        fill='currentColor'
      />
      <path
        d='M17.3633 21.6328C18.5091 21.6328 20.2344 21.112 22.5391 20.0703C22.6823 20.0703 22.7995 20.1224 22.8906 20.2266C22.9818 20.3177 23.0273 20.4284 23.0273 20.5586C22.5065 21.444 21.5104 22.1341 20.0391 22.6289C18.5677 23.1237 17.194 23.2083 15.918 22.8828C14.4727 22.5052 13.5938 21.6914 13.2812 20.4414C13.2552 20.194 13.2422 19.862 13.2422 19.4453C13.2422 19.0286 13.3464 18.4818 13.5547 17.8047C13.776 17.1146 14.1471 16.4635 14.668 15.8516C15.1888 15.2396 15.8008 14.7578 16.5039 14.4062C17.207 14.0547 17.9557 13.8789 18.75 13.8789C19.5052 13.8789 20.3516 14.1393 21.2891 14.6602C21.7318 14.9076 22.0833 15.1875 22.3438 15.5C22.6042 15.8125 22.7344 16.1315 22.7344 16.457C22.7344 16.5482 22.7279 16.6393 22.7148 16.7305C22.6888 17.5247 22.3047 18.026 21.5625 18.2344C21.237 18.3255 20.8594 18.3711 20.4297 18.3711L17.6172 18.2539C16.6797 18.2539 15.9635 18.4557 15.4688 18.8594C15.1823 19.0807 14.9805 19.4128 14.8633 19.8555C15.1888 21.0404 16.0221 21.6328 17.3633 21.6328ZM20.8398 15.5977C20.5534 15.3893 20.2539 15.2396 19.9414 15.1484C19.6289 15.0573 19.3685 15.0117 19.1602 15.0117C18.9518 15.0117 18.6133 15.0833 18.1445 15.2266C17.6758 15.3568 17.2591 15.5065 16.8945 15.6758C15.9961 16.0924 15.5469 16.5286 15.5469 16.9844C16.5885 17.0755 17.3698 17.1211 17.8906 17.1211C19.3359 17.1211 20.3125 16.9974 20.8203 16.75C21.1328 16.6198 21.2891 16.457 21.2891 16.2617C21.2891 16.0273 21.1393 15.806 20.8398 15.5977Z'
        fill='currentColor'
      />
      <path
        d='M28.1836 21.6328C29.3294 21.6328 31.0547 21.112 33.3594 20.0703C33.5026 20.0703 33.6198 20.1224 33.7109 20.2266C33.8021 20.3177 33.8477 20.4284 33.8477 20.5586C33.3268 21.444 32.3307 22.1341 30.8594 22.6289C29.388 23.1237 28.0143 23.2083 26.7383 22.8828C25.293 22.5052 24.4141 21.6914 24.1016 20.4414C24.0755 20.194 24.0625 19.862 24.0625 19.4453C24.0625 19.0286 24.1667 18.4818 24.375 17.8047C24.5964 17.1146 24.9674 16.4635 25.4883 15.8516C26.0091 15.2396 26.6211 14.7578 27.3242 14.4062C28.0273 14.0547 28.776 13.8789 29.5703 13.8789C30.3255 13.8789 31.1719 14.1393 32.1094 14.6602C32.5521 14.9076 32.9036 15.1875 33.1641 15.5C33.4245 15.8125 33.5547 16.1315 33.5547 16.457C33.5547 16.5482 33.5482 16.6393 33.5352 16.7305C33.5091 17.5247 33.125 18.026 32.3828 18.2344C32.0573 18.3255 31.6797 18.3711 31.25 18.3711L28.4375 18.2539C27.5 18.2539 26.7839 18.4557 26.2891 18.8594C26.0026 19.0807 25.8008 19.4128 25.6836 19.8555C26.0091 21.0404 26.8424 21.6328 28.1836 21.6328ZM31.6602 15.5977C31.3737 15.3893 31.0742 15.2396 30.7617 15.1484C30.4492 15.0573 30.1888 15.0117 29.9805 15.0117C29.7721 15.0117 29.4336 15.0833 28.9648 15.2266C28.4961 15.3568 28.0794 15.5065 27.7148 15.6758C26.8164 16.0924 26.3672 16.5286 26.3672 16.9844C27.4089 17.0755 28.1901 17.1211 28.7109 17.1211C30.1562 17.1211 31.1328 16.9974 31.6406 16.75C31.9531 16.6198 32.1094 16.457 32.1094 16.2617C32.1094 16.0273 31.9596 15.806 31.6602 15.5977Z'
        fill='currentColor'
      />
      <path
        d='M50.7031 19.7578C49.7266 21.2943 48.4245 22.2448 46.7969 22.6094C46.4193 22.6875 46.0742 22.7266 45.7617 22.7266C45.4622 22.7266 45.2083 22.7266 45 22.7266C44.8047 22.7135 44.5833 22.681 44.3359 22.6289C44.0885 22.5768 43.8607 22.4922 43.6523 22.375C43.1706 22.1016 42.9297 21.7174 42.9297 21.2227C42.8776 20.9883 42.8516 20.7279 42.8516 20.4414C42.8516 20.1419 42.9167 19.7513 43.0469 19.2695C43.1771 18.7878 43.4115 18.2669 43.75 17.707C44.1016 17.1471 44.5247 16.6328 45.0195 16.1641C46.0482 15.1745 47.1615 14.5365 48.3594 14.25C48.7109 14.1719 49.0299 14.1328 49.3164 14.1328C49.6159 14.1328 49.8828 14.1523 50.1172 14.1914C50.8724 14.1914 51.3802 14.7057 51.6406 15.7344C51.8099 16.3854 51.9076 17.2969 51.9336 18.4688C51.9727 19.6276 52.0052 20.526 52.0312 21.1641C52.0703 21.7891 52.1549 22.362 52.2852 22.8828H51.1328C51.0807 22.5312 51.0417 22.2188 51.0156 21.9453C50.9896 21.6719 50.9635 21.418 50.9375 21.1836C50.8724 20.6367 50.7943 20.1615 50.7031 19.7578ZM50.625 16.7305C50.625 15.9753 50.2539 15.5977 49.5117 15.5977C49.4206 15.5846 49.3294 15.5781 49.2383 15.5781C48.2878 15.5781 47.2852 16.0339 46.2305 16.9453C45.7357 17.362 45.3125 17.8307 44.9609 18.3516C44.4401 19.0938 44.1797 19.7578 44.1797 20.3438C44.1797 21.112 44.6224 21.5677 45.5078 21.7109C46.6797 21.6849 47.7995 21.151 48.8672 20.1094C49.3229 19.6536 49.7005 19.1589 50 18.625C50.4167 17.9089 50.625 17.2773 50.625 16.7305Z'
        fill='currentColor'
      />
      <path
        d='M70.8008 15.8711C70.2539 15.4805 69.5508 15.2852 68.6914 15.2852C67.8841 15.2852 67.1354 15.4349 66.4453 15.7344C65.1432 16.2812 64.2513 16.9844 63.7695 17.8438C63.5612 18.2344 63.457 18.651 63.457 19.0938C63.457 19.1719 63.457 19.3932 63.457 19.7578C63.457 20.1094 63.5221 20.5911 63.6523 21.2031C63.7826 21.8021 63.8477 22.4141 63.8477 23.0391C63.5742 23.0521 63.3529 23.0846 63.1836 23.1367C63.0143 23.1888 62.8711 23.2148 62.7539 23.2148C62.6367 23.2148 62.5326 23.1628 62.4414 23.0586C62.3633 22.9544 62.2721 22.7526 62.168 22.4531C62.1549 22.375 62.1289 22.1536 62.0898 21.7891C62.0508 21.4245 61.9987 20.9818 61.9336 20.4609C61.8815 19.9401 61.8164 19.3737 61.7383 18.7617C61.6732 18.1367 61.6081 17.5247 61.543 16.9258C61.3997 15.6237 61.2891 14.6667 61.2109 14.0547C61.2109 13.7422 61.4388 13.5859 61.8945 13.5859C62.168 13.5859 62.3828 13.7031 62.5391 13.9375C62.6953 14.1589 62.819 14.4193 62.9102 14.7188C63.0013 15.0052 63.0599 15.2917 63.0859 15.5781C63.125 15.8646 63.1576 16.0664 63.1836 16.1836C64.9023 14.6471 67.0378 13.8789 69.5898 13.8789C69.8763 13.8789 70.1758 13.8854 70.4883 13.8984C70.5664 13.8854 70.6641 13.8789 70.7812 13.8789C70.8984 13.8789 71.0156 13.957 71.1328 14.1133C71.276 14.2956 71.3477 14.5169 71.3477 14.7773C71.3477 15.4284 71.1654 15.793 70.8008 15.8711Z'
        fill='currentColor'
      />
      <path
        d='M76.2305 21.6328C77.3763 21.6328 79.1016 21.112 81.4062 20.0703C81.5495 20.0703 81.6667 20.1224 81.7578 20.2266C81.849 20.3177 81.8945 20.4284 81.8945 20.5586C81.3737 21.444 80.3776 22.1341 78.9062 22.6289C77.4349 23.1237 76.0612 23.2083 74.7852 22.8828C73.3398 22.5052 72.4609 21.6914 72.1484 20.4414C72.1224 20.194 72.1094 19.862 72.1094 19.4453C72.1094 19.0286 72.2135 18.4818 72.4219 17.8047C72.6432 17.1146 73.0143 16.4635 73.5352 15.8516C74.056 15.2396 74.668 14.7578 75.3711 14.4062C76.0742 14.0547 76.8229 13.8789 77.6172 13.8789C78.3724 13.8789 79.2188 14.1393 80.1562 14.6602C80.599 14.9076 80.9505 15.1875 81.2109 15.5C81.4714 15.8125 81.6016 16.1315 81.6016 16.457C81.6016 16.5482 81.5951 16.6393 81.582 16.7305C81.556 17.5247 81.1719 18.026 80.4297 18.2344C80.1042 18.3255 79.7266 18.3711 79.2969 18.3711L76.4844 18.2539C75.5469 18.2539 74.8307 18.4557 74.3359 18.8594C74.0495 19.0807 73.8477 19.4128 73.7305 19.8555C74.056 21.0404 74.8893 21.6328 76.2305 21.6328ZM79.707 15.5977C79.4206 15.3893 79.1211 15.2396 78.8086 15.1484C78.4961 15.0573 78.2357 15.0117 78.0273 15.0117C77.819 15.0117 77.4805 15.0833 77.0117 15.2266C76.543 15.3568 76.1263 15.5065 75.7617 15.6758C74.8633 16.0924 74.4141 16.5286 74.4141 16.9844C75.4557 17.0755 76.237 17.1211 76.7578 17.1211C78.2031 17.1211 79.1797 16.9974 79.6875 16.75C80 16.6198 80.1562 16.457 80.1562 16.2617C80.1562 16.0273 80.0065 15.806 79.707 15.5977Z'
        fill='currentColor'
      />
      <path
        d='M90.7422 19.7578C89.7656 21.2943 88.4635 22.2448 86.8359 22.6094C86.4583 22.6875 86.1133 22.7266 85.8008 22.7266C85.5013 22.7266 85.2474 22.7266 85.0391 22.7266C84.8438 22.7135 84.6224 22.681 84.375 22.6289C84.1276 22.5768 83.8997 22.4922 83.6914 22.375C83.2096 22.1016 82.9688 21.7174 82.9688 21.2227C82.9167 20.9883 82.8906 20.7279 82.8906 20.4414C82.8906 20.1419 82.9557 19.7513 83.0859 19.2695C83.2161 18.7878 83.4505 18.2669 83.7891 17.707C84.1406 17.1471 84.5638 16.6328 85.0586 16.1641C86.0872 15.1745 87.2005 14.5365 88.3984 14.25C88.75 14.1719 89.069 14.1328 89.3555 14.1328C89.6549 14.1328 89.9219 14.1523 90.1562 14.1914C90.9115 14.1914 91.4193 14.7057 91.6797 15.7344C91.849 16.3854 91.9466 17.2969 91.9727 18.4688C92.0117 19.6276 92.0443 20.526 92.0703 21.1641C92.1094 21.7891 92.194 22.362 92.3242 22.8828H91.1719C91.1198 22.5312 91.0807 22.2188 91.0547 21.9453C91.0286 21.6719 91.0026 21.418 90.9766 21.1836C90.9115 20.6367 90.8333 20.1615 90.7422 19.7578ZM90.6641 16.7305C90.6641 15.9753 90.293 15.5977 89.5508 15.5977C89.4596 15.5846 89.3685 15.5781 89.2773 15.5781C88.3268 15.5781 87.3242 16.0339 86.2695 16.9453C85.7747 17.362 85.3516 17.8307 85 18.3516C84.4792 19.0938 84.2188 19.7578 84.2188 20.3438C84.2188 21.112 84.6615 21.5677 85.5469 21.7109C86.7188 21.6849 87.8385 21.151 88.9062 20.1094C89.362 19.6536 89.7396 19.1589 90.0391 18.625C90.4557 17.9089 90.6641 17.2773 90.6641 16.7305Z'
        fill='currentColor'
      />
      <path
        d='M93.5938 15.4219C93.5677 14.7188 93.5417 14.0938 93.5156 13.5469C93.4896 12.987 93.4701 12.5768 93.457 12.3164C93.457 12.043 93.3529 11.3854 93.1445 10.3438C93.2617 10.1875 93.3724 10.0378 93.4766 9.89453C93.5938 9.7513 93.7565 9.67969 93.9648 9.67969C94.4206 9.67969 94.7721 11.6003 95.0195 15.4414C95.1497 17.668 95.2148 19.8945 95.2148 22.1211C95.2148 22.7201 94.7982 23.0195 93.9648 23.0195L93.8086 23C93.8086 22.3229 93.7891 21.457 93.75 20.4023C93.7109 19.3477 93.6784 18.4297 93.6523 17.6484C93.6393 16.8672 93.6198 16.125 93.5938 15.4219Z'
        fill='currentColor'
      />
      <path
        d='M106.27 15.168C108.04 14.556 109.57 14.25 110.859 14.25C112.5 14.25 113.594 14.6797 114.141 15.5391C114.388 15.9427 114.512 16.3789 114.512 16.8477C114.512 17.4987 114.303 18.1693 113.887 18.8594C113.483 19.5495 112.943 20.1745 112.266 20.7344C110.69 22.0234 108.776 22.8242 106.523 23.1367C106.523 23.2799 106.523 23.5078 106.523 23.8203C106.536 24.1458 106.543 24.5039 106.543 24.8945C106.556 25.2852 106.562 25.7018 106.562 26.1445C106.576 26.5872 106.589 27.0104 106.602 27.4141C106.641 28.4167 106.667 28.9896 106.68 29.1328C106.706 29.276 106.719 29.3932 106.719 29.4844C106.719 29.8099 106.615 30.0508 106.406 30.207C106.198 30.3763 105.924 30.4609 105.586 30.4609C105.521 30.4609 105.456 30.4609 105.391 30.4609L105.078 14.7578C105.195 14.5885 105.352 14.5104 105.547 14.5234C105.742 14.5365 105.898 14.5885 106.016 14.6797C106.133 14.7708 106.217 14.9336 106.27 15.168ZM111.973 15.8516C111.543 15.6302 111.081 15.5195 110.586 15.5195C110.104 15.5195 109.622 15.5651 109.141 15.6562C108.047 15.8646 107.24 16.3268 106.719 17.043C106.484 17.3815 106.367 17.7982 106.367 18.293C106.367 18.3451 106.367 18.3971 106.367 18.4492V21.8281C109.049 21.2292 110.951 20.3958 112.07 19.3281C112.721 18.7161 113.047 18.0846 113.047 17.4336C113.047 16.7435 112.689 16.2161 111.973 15.8516Z'
        fill='currentColor'
      />
      <path
        d='M116.016 19.2891C116.016 17.7526 116.68 16.5156 118.008 15.5781C119.062 14.8359 120.332 14.3867 121.816 14.2305C121.895 14.2305 122.077 14.2305 122.363 14.2305C122.65 14.2305 123.034 14.3151 123.516 14.4844C124.583 14.849 125.312 15.4935 125.703 16.418C125.859 16.7826 125.938 17.0951 125.938 17.3555C125.938 17.6029 125.931 17.7786 125.918 17.8828C125.918 19.5104 125.299 20.793 124.062 21.7305C122.917 22.5898 121.484 23.0195 119.766 23.0195C118.529 23.0195 117.591 22.7331 116.953 22.1602C116.328 21.5872 116.016 20.6302 116.016 19.2891ZM117.363 19.7578C117.363 20.5651 117.578 21.112 118.008 21.3984C118.333 21.6068 118.88 21.7109 119.648 21.7109C120.417 21.7109 121.094 21.6523 121.68 21.5352C122.266 21.418 122.786 21.2161 123.242 20.9297C124.219 20.3047 124.707 19.3346 124.707 18.0195C124.707 17.2383 124.499 16.6003 124.082 16.1055C123.626 15.5716 123.027 15.3047 122.285 15.3047C121.777 15.3958 121.263 15.4935 120.742 15.5977C120.234 15.7018 119.753 15.9036 119.297 16.2031C118.307 16.8411 117.663 18.026 117.363 19.7578Z'
        fill='currentColor'
      />
      <path
        d='M133.457 17.9609C134.889 17.9609 135.605 18.3255 135.605 19.0547C135.605 19.6016 135.208 20.2396 134.414 20.9688C133.229 22.0495 131.634 22.9154 129.629 23.5664C129.538 23.5664 129.434 23.4753 129.316 23.293C129.212 23.1107 129.128 22.974 129.062 22.8828C129.01 22.7786 128.971 22.7135 128.945 22.6875C130.443 22.1927 131.673 21.5938 132.637 20.8906C133.288 20.4219 133.613 20.0378 133.613 19.7383C133.613 19.4388 133.229 19.2891 132.461 19.2891C131.693 19.2891 130.566 19.4714 129.082 19.8359C128.405 19.8099 127.819 19.569 127.324 19.1133C126.895 18.7096 126.68 18.306 126.68 17.9023C126.68 17.4857 126.797 17.1081 127.031 16.7695C127.266 16.418 127.578 16.0924 127.969 15.793C128.359 15.4935 128.815 15.2201 129.336 14.9727C130.612 14.3607 131.934 14.0547 133.301 14.0547C133.704 14.0547 134.095 14.0938 134.473 14.1719C134.785 14.1719 134.967 14.3086 135.02 14.582C135.072 14.8555 135.098 15.3047 135.098 15.9297C134.329 15.5781 133.464 15.4023 132.5 15.4023C131.302 15.4023 130.312 15.6432 129.531 16.125C128.724 16.5938 128.307 17.2057 128.281 17.9609C128.281 18.3255 128.548 18.5078 129.082 18.5078L130.508 18.3516C131.732 18.0911 132.715 17.9609 133.457 17.9609Z'
        fill='currentColor'
      />
      <path
        d='M139.766 21.125L139.805 18C139.805 17.5052 139.759 17.082 139.668 16.7305H136.641L136.602 15.3828H139.531V10.3438C139.57 10.2266 139.648 10.1094 139.766 9.99219C139.948 9.8099 140.098 9.71875 140.215 9.71875C140.345 9.71875 140.456 9.73177 140.547 9.75781C140.638 9.78385 140.736 9.875 140.84 10.0312C141.048 10.8906 141.152 12.1862 141.152 13.918C141.152 14.3477 141.172 14.7708 141.211 15.1875C141.628 15.1354 142.044 15.1094 142.461 15.1094C142.461 15.1094 142.799 15.1094 143.477 15.1094C143.724 15.1094 143.952 15.0964 144.16 15.0703L144.102 16.4766L141.25 16.3984L141.348 23.1367C141.113 23.2409 140.911 23.293 140.742 23.293C140.091 23.293 139.766 22.5703 139.766 21.125Z'
        fill='currentColor'
      />
    </svg>
  )
}

function KnowledgeSilosGraphic() {
  return (
    <div className='relative mb-2 flex flex-col items-center justify-center py-4 md:py-6 lg:-mx-40 lg:flex-row lg:p-12 lg:py-10 xl:-mx-44 xl:py-12 2xl:-mx-48'>
      <div className='bg-elevated relative flex min-w-[240px] -rotate-[4deg] flex-col gap-px rounded-xl border-[0.5px] p-2 shadow lg:translate-x-3 dark:border-gray-700'>
        <span className='text-quaternary absolute -top-8 right-0 hidden opacity-50 lg:flex'>
          <svg width='57' height='25' viewBox='0 0 57 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M44.4519 7.80683C43.617 8.68011 42.6855 8.52076 41.8871 8.78523C41.3393 8.96177 40.7596 9.1809 40.336 9.53341C39.4292 10.2908 39.7914 11.8576 40.9069 12.1405C41.4692 12.2726 42.0815 12.3244 42.6546 12.2645C46.256 11.879 49.8665 11.4747 53.4762 11.0236C54.1377 10.9484 54.81 10.6811 55.416 10.3586C56.3415 9.87705 56.5349 8.60147 55.8733 7.82985C55.6876 7.61268 55.4602 7.41017 55.2377 7.22162C53.0371 5.40592 50.8594 3.56649 48.6269 1.79337C48.1065 1.37995 47.4708 1.03842 46.8234 0.842108C45.5802 0.462763 44.7306 1.29415 44.9579 2.61028C45.0248 2.97894 45.1988 3.34133 45.4095 3.94182C44.7792 3.92774 44.3502 3.9528 43.9058 3.88918C41.0802 3.50047 38.2686 3.10688 35.452 2.69932C29.1829 1.80938 23.1193 2.88628 17.177 4.79894C15.3247 5.40184 13.505 6.27564 11.9037 7.37081C9.39324 9.08301 7.01684 10.9991 4.72553 12.9795C2.14912 15.2167 0.980938 18.2145 0.74322 21.5916C0.705921 22.1537 0.777427 22.803 1.02834 23.2953C1.21633 23.6528 1.7686 24.0236 2.16071 24.0272C2.55283 24.0307 3.10653 23.6482 3.27302 23.2761C3.56657 22.6869 3.65721 21.965 3.78138 21.2941C4.30999 18.5677 5.62652 16.3491 7.81037 14.6417C10.0589 12.896 12.1595 10.9512 14.7236 9.6593C20.3892 6.82428 26.4242 5.71036 32.6986 6.08085C36.1138 6.27836 39.513 6.92063 42.923 7.37089C43.4002 7.4387 43.8421 7.62868 44.4519 7.80683Z'
              fill='currentColor'
            />
          </svg>
        </span>
        <div className='dark:bg-quaternary bg-tertiary flex select-none items-center gap-3 rounded-lg p-2'>
          <UIText>📈</UIText>
          <UIText weight='font-medium'>Q4 growth</UIText>
        </div>
        <div className='text-quaternary flex select-none items-center gap-3 rounded-lg p-2'>
          <UIText>⚙️</UIText>
          <UIText>Engineering</UIText>
        </div>
        <div className='text-quaternary flex select-none items-center gap-3 rounded-lg p-2'>
          <UIText>🔮</UIText>
          <UIText>Design</UIText>
        </div>
        <div className='text-quaternary flex select-none items-center gap-3 rounded-lg p-2'>
          <UIText>🚩</UIText>
          <UIText>Announcements</UIText>
        </div>
        <div className='text-quaternary flex select-none items-center gap-3 rounded-lg p-2'>
          <UIText>🎱</UIText>
          <UIText>Watercooloer</UIText>
        </div>
      </div>

      <div className='bg-elevated dark:shadow-popover relative -mt-8 flex min-w-[280px] max-w-[320px] rotate-3 select-none flex-col gap-4 rounded-xl border-[0.5px] p-4 shadow md:mt-0 dark:border-gray-700'>
        <span className='text-quaternary absolute -bottom-6 -right-8 hidden rotate-2 opacity-50 lg:flex'>
          <svg width='55' height='29' viewBox='0 0 55 29' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M44.8735 9.06453C43.6829 8.85941 43.0291 9.54171 42.23 9.80418C41.6847 9.98823 41.0883 10.1571 40.5382 10.1257C39.3587 10.0566 38.7176 8.58181 39.4458 7.69063C39.8192 7.24993 40.2805 6.84399 40.7767 6.55118C43.9006 4.71812 47.043 2.89486 50.2126 1.10965C50.7891 0.776559 51.4885 0.591348 52.1674 0.489918C53.1978 0.326345 54.1122 1.23647 54.0395 2.25032C54.0195 2.53533 53.9572 2.83339 53.8906 3.11733C53.2022 5.88601 52.5465 8.66013 51.8071 11.4136C51.6349 12.0555 51.3271 12.7083 50.9236 13.2512C50.1501 14.2958 48.9726 14.1331 48.3722 12.94C48.2066 12.604 48.1308 12.2091 47.9429 11.6011C47.4447 11.9875 47.085 12.2226 46.7656 12.5382C44.7259 14.5318 42.7003 16.5211 40.679 18.5245C36.1699 22.9698 30.6557 25.7121 24.7416 27.7105C22.8942 28.328 20.9118 28.7085 18.9731 28.781C15.9366 28.8986 12.8866 28.7725 9.86667 28.5442C6.46479 28.279 3.7422 26.5647 1.54177 23.9918C1.17738 23.5623 0.848497 22.9979 0.757264 22.4529C0.69564 22.0537 0.918856 21.4271 1.23189 21.1909C1.54493 20.9547 2.21755 20.9327 2.57276 21.1327C3.15928 21.4316 3.66167 21.9579 4.16067 22.4233C6.20769 24.3 8.5859 25.2998 11.357 25.3727C14.203 25.438 17.0484 25.7512 19.8779 25.2639C26.1183 24.1714 31.6316 21.4759 36.4541 17.4449C39.0814 15.2541 41.4313 12.7154 43.9041 10.3246C44.2473 9.98613 44.4895 9.57051 44.8735 9.06453Z'
              fill='currentColor'
            />
          </svg>
        </span>
        <div className='flex flex-col'>
          <div className='bg-tertiary mb-2 flex aspect-square items-center justify-center self-start rounded-lg p-1 dark:bg-white/5'>
            <UIText size='text-xl'>📈</UIText>
          </div>
          <UIText weight='font-semibold' size='text-base'>
            Q4 growth
          </UIText>
          <div className='flex flex-col gap-2.5 py-2'>
            <div className='bg-quaternary h-1.5 w-[90%] rounded-full' />
            <div className='bg-quaternary h-1.5 w-[70%] rounded-full' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <FacePile
            size='sm'
            limit={3}
            totalUserCount={32}
            users={[
              {
                name: 'Alexandru Ţurcanu',
                src: '/img/team/alexandru.png',
                url: 'https://twitter.com/pondorasti'
              },
              { name: 'Dan Philibin', src: '/img/team/dan.jpg', url: 'https://twitter.com/danphilibin' },
              { name: 'Nick Holden', src: '/img/team/nick.jpeg', url: 'https://twitter.com/NickyHolden' },
              { name: 'Ryan Nystrom', src: '/img/team/ryan.jpg', url: 'https://twitter.com/_ryannystrom' },
              { name: 'Brian Lovin', src: '/img/team/brian.jpeg', url: 'https://twitter.com/brian_lovin' }
            ]}
          />
        </div>

        <div className='flex items-center gap-1.5'>
          <Button fullWidth>Join channel</Button>
          <Button variant='flat' iconOnly={<BellIcon />} accessibilityLabel='Subscribe' />
        </div>
      </div>

      <div className='bg-elevated dark:shadow-popover flex min-w-[320px] max-w-[380px] -translate-y-4 -rotate-3 select-none flex-col rounded-xl border-[0.5px] shadow md:mt-0 md:-translate-x-3 dark:border-gray-700'>
        <div className='p-3 pb-0'>
          <UIText weight='font-semibold'>Latest posts</UIText>
        </div>

        <div className='flex gap-3 border-b-[0.5px] p-3'>
          <div className='mt-0.5 flex flex-none items-start self-start'>
            <Image alt='Brian' src='/img/team/brian.jpeg' width={80} height={80} className='h-10 w-10 rounded-full' />
          </div>

          <div className='flex flex-1 flex-row items-center gap-3'>
            <div className='flex flex-1 items-center'>
              <div className='flex flex-1 flex-col gap-1.5'>
                <UIText primary weight='font-normal' className='break-anywhere mr-2 line-clamp-1 text-sm'>
                  Meta ads result
                </UIText>

                <div className='bg-quaternary h-1.5 w-[90%] rounded-full' />
              </div>
            </div>
          </div>
        </div>
        <div className='flex gap-3 border-b-[0.5px] p-3'>
          <div className='mt-0.5 flex flex-none items-start self-start'>
            <Image alt='Nick' src='/img/team/nick.jpeg' width={80} height={80} className='h-10 w-10 rounded-full' />
          </div>

          <div className='flex flex-1 flex-row items-center gap-3'>
            <div className='flex flex-1 items-center'>
              <div className='flex flex-1 flex-col gap-1.5'>
                <UIText primary weight='font-normal' className='break-anywhere mr-2 line-clamp-1 text-sm'>
                  Improving blog post SEO
                </UIText>

                <div className='bg-quaternary h-1.5 w-[70%] rounded-full' />
              </div>
            </div>
          </div>
        </div>
        <div className='flex gap-3 p-3'>
          <div className='mt-0.5 flex flex-none items-start self-start'>
            <Image alt='Ryan' src='/img/team/ryan.jpg' width={80} height={80} className='h-10 w-10 rounded-full' />
          </div>

          <div className='flex flex-1 flex-row items-center gap-3'>
            <div className='flex flex-1 items-center'>
              <div className='flex flex-1 flex-col gap-0.5'>
                <UIText primary weight='font-normal' className='break-anywhere mr-2 line-clamp-1 text-sm'>
                  Onboarding funnel analysis
                </UIText>

                <div className='flex items-center'>
                  <Badge className='mr-2' color='green'>
                    Resolved
                  </Badge>

                  <div className='bg-quaternary h-1.5 w-full rounded-full' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectTheDots() {
  return (
    <div className='3xl:my-10 relative my-6 lg:-mx-4 xl:-mx-6 xl:my-8 2xl:-mx-8'>
      <div className='flex select-none items-center'>
        <div className='bg-elevated w-full rounded-lg border-[0.5px] shadow lg:-rotate-2'>
          <div className='grid grid-cols-[24px,1fr] gap-x-3 gap-y-0.5 border-b-[0.5px] p-3'>
            <Avatar src='/img/team/dan.jpg' size='xs' />
            <div className='flex items-center gap-1.5'>
              <UIText weight='font-medium'>Dan</UIText>
              <UIText quaternary>2m</UIText>
            </div>
            <div className='col-start-2 flex flex-col gap-2.5 py-2 lg:min-w-[400px]'>
              <div className='bg-quaternary h-2 w-[90%] rounded-full' />
              <div className='bg-quaternary h-2 w-[60%] rounded-full' />
              <div className='bg-quaternary h-2 w-[65%] rounded-full' />
              <div className='bg-quaternary h-2 w-[80%] rounded-full' />
              <div className='bg-quaternary h-2 w-[45%] rounded-full' />
            </div>
            <div className='col-start-2 -ml-1 flex flex-wrap items-center gap-x-0.5 gap-y-1 py-2'>
              <InlinePostReactions
                groupedReactions={[
                  { emoji: '👍', reactions_count: 3 },
                  {
                    emoji: '🎉',
                    reactions_count: 1
                  },
                  { emoji: '🔥', reactions_count: 1 }
                ]}
              />
            </div>
          </div>
          <div className='relative grid grid-cols-[24px,1fr] gap-x-3 border-b-[0.5px] p-3'>
            <span className='text-quaternary -left-29 absolute -top-8 hidden lg:flex'>
              <AutomaticBacklinks />
            </span>
            <SignIcon />
            <div className='flex flex-wrap items-center gap-1'>
              <UIText className='break-anywhere inline' weight='font-medium'>
                Ryan
              </UIText>
              <UIText className='break-anywhere inline' quaternary>
                referenced this in
              </UIText>
              <UIText className='break-anywhere inline' weight='font-medium'>
                Landing page refresh S24
              </UIText>
            </div>
          </div>
          <div className='bg-secondary grid grid-cols-[24px,1fr] gap-x-3 rounded-b-[7px] p-3 dark:bg-white/[0.03]'>
            <Avatar src='/img/team/brian.jpeg' size='xs' />
            <UIText size='text-[15px]' quaternary>
              Reply
            </UIText>
          </div>
        </div>
      </div>

      <div className='absolute -right-2 -top-3 hidden max-w-[250px] rotate-[5deg] select-none flex-col gap-1.5 sm:flex'>
        <div className='bg-elevated dark:bg-gray-750 dark:shadow-popover flex flex-col rounded-xl border-[0.5px] shadow dark:border-gray-700'>
          <div className='flex flex-col gap-px border-b-[0.5px] p-1'>
            <UIText size='text-xs' tertiary className='px-2.5 pb-1 pt-3'>
              Posts
            </UIText>
            <div className='text-secondary hidden select-none items-center gap-2 rounded-lg p-2 lg:flex'>
              <PostFilledIcon />
              <UIText className='line-clamp-1'>Mobile app kickoff</UIText>
            </div>
            <div className='text-secondary flex select-none items-center gap-2 rounded-lg p-2'>
              <PostFilledIcon />
              <UIText className='line-clamp-1'>Shipped: new typeahead mentions</UIText>
            </div>
            <div className='text-secondary flex select-none items-center gap-2 rounded-lg p-2'>
              <PostFilledIcon />
              <UIText className='line-clamp-1'>NYC team offsite</UIText>
            </div>
          </div>
          <div className='flex flex-col gap-px p-1'>
            <UIText size='text-xs' tertiary className='px-2.5 pb-1 pt-3'>
              People
            </UIText>
            <div className='text-secondary flex select-none items-center gap-2 rounded-lg p-2'>
              <Avatar src='/img/team/alexandru.png' size='xs' />
              <UIText>Alexandru</UIText>
            </div>
            <div className='text-secondary flex select-none items-center gap-2 rounded-lg p-2'>
              <Avatar src='/img/team/nick.jpeg' size='xs' />
              <UIText>Nick</UIText>
            </div>
          </div>
        </div>
        <div className='bg-elevated dark:bg-gray-750 flex items-center gap-0.5 rounded-xl border-[0.5px] p-3 shadow dark:border-gray-700'>
          <UIText size='text-[15px]'>@</UIText>
          <div className='h-5 w-0.5 animate-pulse rounded-full bg-blue-500' />
        </div>
      </div>
    </div>
  )
}

interface GroupedReactionType {
  emoji: string
  reactions_count: number
}

function InlinePostReactions({ groupedReactions }: { groupedReactions: GroupedReactionType[] }) {
  const getClasses = () => {
    return 'bg-tertiary h-6.5 group pointer-events-auto flex min-w-[32px]  items-center justify-center gap-1.5 rounded-full p-1 pl-2 pr-2.5 text-xs font-semibold'
  }

  if (!groupedReactions.length) return null

  return (
    <>
      <Button size='sm' round variant='plain' iconOnly={<FaceSmilePlusIcon />} accessibilityLabel='Add reaction' />
      <Reactions reactions={groupedReactions} getClasses={getClasses} />
    </>
  )
}

function Reactions({ reactions, getClasses }: { reactions: GroupedReactionType[]; getClasses: () => string }) {
  if (!reactions || reactions.length === 0) return null

  return (
    <>
      {reactions.map((reaction) => {
        if (reaction.reactions_count === 0) return null

        return (
          <span key={reaction.emoji}>
            <div className={getClasses()}>
              {reaction.emoji && <span className='mt-0.5 font-["emoji"] text-xs leading-none'>{reaction.emoji}</span>}

              {reaction.reactions_count > 0 && (
                <span className='font-mono leading-none'>{reaction.reactions_count}</span>
              )}
            </div>
          </span>
        )
      })}
    </>
  )
}

function ExtendAutomate() {
  const { resolvedTheme } = useTheme()

  const extendImages = {
    light: '/img/home/extend-light.png',
    dark: '/img/home/extend-dark.png'
  }
  const isDark = resolvedTheme === 'dark'
  const extendImage = extendImages[isDark ? 'dark' : 'light']

  return (
    <div className='relative -mb-8 flex aspect-video overflow-hidden lg:-mx-4 lg:p-12 xl:-mx-6 2xl:-mx-8'>
      <div className='dark:via-gray-750 via-gray-150 absolute left-0 right-0 top-0 z-30 h-px bg-gradient-to-r from-white to-white dark:from-black dark:to-black' />

      <Image
        src={extendImage}
        alt='Extend and automate'
        width={1282}
        height={634}
        className='absolute left-0 right-0 top-0 w-full object-contain saturate-[110%]'
      />
    </div>
  )
}

function Screenshots() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const images = {
    light: '/img/home/hero.webp',
    dark: '/img/home/hero-dark.webp'
  }

  if (!resolvedTheme) return <div className='flex aspect-[2/1] h-full w-full' />

  return (
    <div className='relative flex aspect-[4/3.6] flex-col gap-4 overflow-hidden md:aspect-auto'>
      <div className='overflow-hidden bg-gradient-to-t from-gray-50 to-white after:absolute after:bottom-0 after:left-0 after:right-0 after:z-20 after:h-[0.5px] after:bg-gray-200 dark:from-gray-900 dark:after:bg-gray-800'>
        <Image
          alt='Screenshot of Campsite feed running in the Desktop app'
          src={isDark ? images.dark : images.light}
          width={3424}
          height={2024}
          priority
          quality={100}
          className='absolute z-10 mx-auto -mb-[60px] mt-0 w-[220vw] max-w-7xl md:relative md:w-full lg:-mb-[100px]'
        />
      </div>
      <Image
        draggable={false}
        src='/img/home/watercolor-2.webp'
        width={1792 / 2}
        height={1024 / 2}
        priority
        alt='watercolor'
        className='absolute -bottom-[20%] left-[53%] z-0 saturate-[200%]'
      />
      <Image
        draggable={false}
        src='/img/home/watercolor-2.webp'
        width={1792 / 2}
        height={1024 / 2}
        priority
        alt='watercolor'
        className='absolute -bottom-[20%] right-[54%] z-0 saturate-[200%]'
      />
    </div>
  )
}

function AutomaticBacklinks() {
  return (
    <svg width='107' height='60' viewBox='0 0 107 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        className='opacity-50'
        d='M96.9956 53.5358C96.216 52.8855 95.4516 53.0999 94.7592 52.9512C94.2845 52.8532 93.7792 52.7227 93.3921 52.4679C92.5631 51.92 92.7203 50.589 93.6271 50.2559C94.0852 50.0967 94.5925 49.9997 95.0775 49.9988C98.1259 50.0003 101.184 50.0166 104.245 50.0717C104.806 50.0757 105.393 50.2379 105.93 50.4517C106.749 50.7693 107.029 51.8098 106.547 52.5079C106.412 52.7044 106.241 52.8924 106.072 53.0684C104.4 54.7681 102.75 56.4855 101.047 58.1528C100.651 58.5415 100.151 58.8809 99.6273 59.1008C98.6227 59.5251 97.8347 58.9109 97.9024 57.7996C97.924 57.488 98.0359 57.1722 98.1563 56.6557C97.6303 56.7231 97.2691 56.7402 96.9033 56.8322C94.5759 57.404 92.2605 57.9787 89.9424 58.5654C84.7811 59.8569 79.6087 59.4997 74.4601 58.4388C72.8546 58.1025 71.2511 57.5388 69.8097 56.7722C67.5504 55.5743 65.3843 54.1956 63.2834 52.7561C60.9201 51.1288 59.664 48.7465 59.151 45.9675C59.0675 45.5048 59.0669 44.9602 59.231 44.5299C59.355 44.2169 59.7824 43.8606 60.1101 43.823C60.4378 43.7854 60.9365 44.0537 61.1104 44.3475C61.4108 44.8101 61.5538 45.4006 61.7201 45.9459C62.4159 48.1596 63.7236 49.8828 65.7092 51.1055C67.7525 52.3543 69.6906 53.7811 71.9557 54.6257C76.9587 56.4758 82.1105 56.8663 87.3246 56.005C90.163 55.5396 92.9467 54.7068 95.7573 54.0323C96.1502 53.9339 96.5021 53.7374 96.9956 53.5358Z'
        fill='currentColor'
      />
      <path
        d='M7.77431 18.2336C7.07367 19.8148 5.98454 20.8916 4.50692 21.4637C4.1632 21.5904 3.84455 21.6758 3.55097 21.7199C3.26962 21.7622 3.03108 21.798 2.83536 21.8274C2.65003 21.8427 2.43749 21.8434 2.19772 21.8294C1.95795 21.8153 1.73194 21.768 1.51968 21.6873C1.02849 21.4984 0.747985 21.1715 0.678165 20.7067C0.596162 20.4938 0.534949 20.2529 0.494527 19.9837C0.452267 19.7024 0.458309 19.3262 0.512652 18.8553C0.566995 18.3843 0.713687 17.8619 0.952727 17.2881C1.204 16.7125 1.52898 16.1696 1.92767 15.6594C2.75441 14.5846 3.71026 13.8281 4.79524 13.39C5.11449 13.2669 5.40868 13.1852 5.67779 13.1448C5.95914 13.1026 6.21267 13.0832 6.43836 13.0869C7.14785 12.9803 7.6975 13.3918 8.0873 14.3214C8.3382 14.9092 8.55856 15.7517 8.74838 16.8489C8.94861 17.9321 9.10597 18.7716 9.22046 19.3673C9.34536 19.949 9.50571 20.4753 9.70153 20.9462L8.61895 21.1088C8.52041 20.7859 8.43962 20.4978 8.37657 20.2446C8.31352 19.9914 8.25322 19.7565 8.19568 19.54C8.05735 19.0354 7.91689 18.6 7.77431 18.2336ZM7.27372 15.4006C7.16715 14.6911 6.76524 14.3887 6.06799 14.4934C5.98052 14.494 5.89397 14.5008 5.80835 14.5137C4.91537 14.6478 4.03777 15.2174 3.17555 16.2225C2.7695 16.6838 2.43809 17.1839 2.18131 17.7228C1.79673 18.4935 1.64579 19.1541 1.72847 19.7046C1.83687 20.4263 2.31709 20.792 3.16912 20.8016C4.26637 20.6118 5.24304 19.9522 6.09912 18.823C6.46295 18.3305 6.74788 17.8124 6.9539 17.2686C7.24428 16.537 7.35089 15.9143 7.27372 15.4006Z'
        fill='currentColor'
      />
      <path
        d='M10.1222 18.5001C10.0928 18.3044 10.034 18.038 9.94585 17.701C9.8681 17.35 9.78576 16.9683 9.69882 16.5561C9.61189 16.1439 9.53627 15.7237 9.47196 15.2955C9.40765 14.8674 9.38555 14.4704 9.40567 14.1047C9.44526 13.2857 9.71582 12.8385 10.2174 12.7632C10.5746 12.8096 10.8192 12.8979 10.9514 13.0282C11.0958 13.1566 11.1845 13.3309 11.2176 13.5511C11.2488 13.759 11.2333 14.0303 11.1709 14.3649C10.9271 15.4897 10.8695 16.4803 10.9981 17.3366C11.0404 17.6179 11.1037 17.9149 11.1882 18.2274C11.507 19.0176 12.2414 19.3263 13.3912 19.1536C13.9906 19.0636 14.5438 18.8742 15.0508 18.5854C16.0214 18.0518 16.6516 17.5006 16.9414 16.9317C16.967 16.3525 16.9485 15.8549 16.8861 15.439C16.8218 15.0109 16.7464 14.6344 16.6601 14.3097C16.5861 13.983 16.4952 13.6277 16.3874 13.2436C16.2901 12.8454 16.1995 12.4087 16.1156 11.9335C16.2636 11.8362 16.411 11.7766 16.5578 11.7545C16.7168 11.7306 16.8878 11.7863 17.0707 11.9214C17.2658 12.0547 17.4515 12.3333 17.6278 12.7571C17.8162 13.1791 17.9738 13.687 18.1006 14.2809C18.2255 14.8626 18.3357 15.4714 18.4312 16.1075C18.539 16.7418 18.6379 17.3586 18.7279 17.958C18.8161 18.5452 18.9168 19.0492 19.0301 19.47C18.9035 19.6266 18.7729 19.715 18.6384 19.7352C18.1491 19.8087 17.7147 19.3736 17.3353 18.4299C17.1965 18.5883 16.9522 18.7939 16.6024 19.0466C15.8612 19.6082 14.9511 20.0451 13.8722 20.3573C13.668 20.413 13.4374 20.4601 13.1805 20.4987C12.9236 20.5373 12.5921 20.537 12.186 20.498C11.792 20.4571 11.3972 20.285 11.0014 19.9817C10.6056 19.6784 10.3125 19.1845 10.1222 18.5001Z'
        fill='currentColor'
      />
      <path
        d='M22.628 17.3159L22.2237 14.3746C22.1539 13.9098 22.0513 13.5186 21.9161 13.2012L19.072 13.6284L18.8452 12.3679L21.5975 11.9544L20.8864 7.22044C20.9066 7.10483 20.9635 6.98371 21.057 6.85709C21.2025 6.66011 21.3304 6.55335 21.4405 6.53681C21.5628 6.51844 21.6686 6.51505 21.7579 6.52666C21.8472 6.53826 21.9518 6.61011 22.0717 6.7422C22.3887 7.52015 22.6694 8.72259 22.9138 10.3495C22.9744 10.7532 23.0524 11.148 23.1479 11.5339C23.532 11.4262 23.9198 11.3429 24.3112 11.2842C24.3112 11.2842 24.6293 11.2364 25.2654 11.1408C25.4978 11.1059 25.71 11.0615 25.9021 11.0077L26.0455 12.3371L23.3555 12.666L24.3981 18.9826C24.1926 19.1136 24.0104 19.191 23.8513 19.2149C23.2397 19.3067 22.8319 18.6737 22.628 17.3159Z'
        fill='currentColor'
      />
      <path
        d='M27.6534 14.7974C27.4366 13.354 27.8859 12.0982 29.0013 11.03C29.8874 10.1839 31.0167 9.58275 32.3892 9.22649C32.4626 9.21547 32.6338 9.18975 32.9029 9.14933C33.172 9.1089 33.5448 9.13421 34.0213 9.22525C35.0759 9.4171 35.8518 9.91972 36.3493 10.7331C36.5475 11.0536 36.665 11.3361 36.7017 11.5808C36.7367 11.8132 36.7553 11.9793 36.7578 12.079C36.9875 13.608 36.5874 14.9002 35.5576 15.9555C34.6024 16.9245 33.3175 17.5303 31.7028 17.7729C30.5407 17.9474 29.6195 17.8106 28.9393 17.3624C28.2712 16.9123 27.8426 16.0574 27.6534 14.7974ZM28.9856 15.0476C29.0995 15.806 29.3785 16.2895 29.8226 16.498C30.1578 16.6477 30.6863 16.6684 31.408 16.56C32.1297 16.4516 32.7576 16.301 33.2915 16.1083C33.8254 15.9155 34.2862 15.6524 34.674 15.319C35.5032 14.594 35.825 13.6138 35.6395 12.3783C35.5292 11.6443 35.2435 11.0743 34.7822 10.6683C34.2787 10.2311 33.6784 10.0648 32.9811 10.1695C32.5169 10.3268 32.0475 10.4911 31.5729 10.6625C31.1105 10.832 30.6864 11.0896 30.3005 11.4353C29.4609 12.1743 29.0226 13.3784 28.9856 15.0476Z'
        fill='currentColor'
      />
      <path
        d='M39.7661 16.2428C39.2958 16.526 38.975 16.6805 38.8038 16.7063C38.6447 16.7302 38.5319 16.7283 38.4652 16.7008C38.3985 16.6733 38.3184 16.5978 38.2248 16.4743C38.1642 16.0706 38.1001 15.5611 38.0327 14.9458C37.9776 14.3287 37.9099 13.6696 37.8296 12.9687C37.7493 12.2678 37.6559 11.5626 37.5493 10.8531C37.4428 10.1436 37.3087 9.50076 37.1471 8.92462C37.0883 8.53318 37.3219 8.29795 37.8479 8.21895C37.9702 8.20057 38.0951 8.40698 38.2224 8.83816C38.3619 9.26751 38.4623 9.60267 38.5235 9.84365C38.5969 10.0828 38.6542 10.2556 38.6952 10.362C38.9269 9.73928 39.4888 9.19205 40.3811 8.7203C40.8588 8.48594 41.3178 8.33569 41.7582 8.26955C42.1986 8.2034 42.5921 8.20057 42.939 8.26105C43.2962 8.30747 43.6121 8.4539 43.8868 8.70033C44.1719 8.9327 44.3484 9.27519 44.4164 9.7278C44.6444 9.08063 45.2792 8.43491 46.3207 7.79064C47.268 7.18553 48.1453 6.82234 48.9527 6.70108C50.1148 6.52653 50.7497 6.88146 50.8575 7.76588L52.2681 14.5338C52.2773 14.5949 52.1064 14.6644 51.7553 14.7421C51.0776 14.894 50.7259 14.8843 50.7002 14.713C50.6512 14.4702 50.6084 14.2265 50.5716 13.9818L50.2196 11.0139C50.012 9.63157 49.713 8.55697 49.3226 7.79004C48.5245 7.97247 47.9208 8.20074 47.5117 8.47483C47.1129 8.73486 46.7714 9.04259 46.487 9.39801C46.2009 9.7412 45.967 10.1829 45.7854 10.723C45.3795 11.9347 45.3162 13.4703 45.5955 15.3296C45.5607 15.5975 45.3415 15.7618 44.9378 15.8224C44.6687 15.8629 44.4421 15.8531 44.2579 15.7932C44.072 15.7211 43.9918 15.6456 44.0175 15.5667C44.0552 14.2351 44.0198 13.2085 43.9114 12.4867C43.825 11.9118 43.6821 11.3766 43.4826 10.8812C43.2935 10.3718 43.0628 9.79351 42.7905 9.14644C41.029 9.41102 39.9481 10.2926 39.5478 11.7912C39.3724 12.4555 39.3076 13.0657 39.3536 13.6216C39.41 14.1635 39.4676 14.6302 39.5264 15.0217C39.5834 15.4009 39.6633 15.8079 39.7661 16.2428Z'
        fill='currentColor'
      />
      <path
        d='M59.6649 10.4395C58.9642 12.0207 57.8751 13.0974 56.3975 13.6696C56.0538 13.7963 55.7351 13.8817 55.4415 13.9258C55.1602 13.968 54.9217 14.0039 54.7259 14.0333C54.5406 14.0486 54.3281 14.0493 54.0883 14.0352C53.8485 14.0212 53.6225 13.9739 53.4102 13.8932C52.9191 13.7043 52.6386 13.3774 52.5687 12.9126C52.4867 12.6997 52.4255 12.4587 52.3851 12.1896C52.3428 11.9083 52.3489 11.5321 52.4032 11.0611C52.4576 10.5901 52.6043 10.0678 52.8433 9.494C53.0946 8.91839 53.4196 8.37549 53.8182 7.8653C54.645 6.79047 55.6008 6.03398 56.6858 5.59583C57.0051 5.47282 57.2992 5.39111 57.5684 5.35069C57.8497 5.30843 58.1032 5.28911 58.3289 5.29273C59.0384 5.18617 59.5881 5.5977 59.9779 6.52732C60.2288 7.11506 60.4491 7.95756 60.639 9.05482C60.8392 10.138 60.9965 10.9775 61.111 11.5732C61.2359 12.1548 61.3963 12.6811 61.5921 13.1521L60.5095 13.3147C60.411 12.9917 60.3302 12.7037 60.2671 12.4505C60.2041 12.1972 60.1438 11.9624 60.0863 11.7459C59.9479 11.2413 59.8075 10.8058 59.6649 10.4395ZM59.1643 7.60643C59.0577 6.89694 58.6558 6.59456 57.9586 6.69929C57.8711 6.69992 57.7845 6.70666 57.6989 6.71952C56.8059 6.85365 55.9283 7.42327 55.0661 8.42838C54.6601 8.88964 54.3287 9.38973 54.0719 9.92864C53.6873 10.6994 53.5364 11.36 53.619 11.9105C53.7274 12.6322 54.2077 12.9979 55.0597 13.0075C56.1569 12.8176 57.1336 12.1581 57.9897 11.0288C58.3535 10.5364 58.6385 10.0183 58.8445 9.47446C59.1349 8.74287 59.2415 8.1202 59.1643 7.60643Z'
        fill='currentColor'
      />
      <path
        d='M64.9771 10.955L64.5729 8.01363C64.503 7.54879 64.4005 7.15766 64.2653 6.84024L61.4212 7.26743L61.1943 6.00687L63.9467 5.59346L63.2356 0.85946C63.2558 0.743855 63.3126 0.622737 63.4062 0.496108C63.5517 0.299128 63.6795 0.192371 63.7896 0.175834C63.9119 0.157461 64.0178 0.154076 64.1071 0.165679C64.1964 0.177283 64.301 0.24913 64.4209 0.381222C64.7379 1.15917 65.0185 2.36162 65.2629 3.98855C65.3235 4.39222 65.4016 4.78703 65.4971 5.17296C65.8812 5.06523 66.269 4.98197 66.6604 4.92317C66.6604 4.92317 66.9785 4.8754 67.6145 4.77986C67.847 4.74495 68.0592 4.70056 68.2512 4.6467L68.3946 5.97608L65.7047 6.30507L66.7473 12.6216C66.5418 12.7526 66.3595 12.83 66.2005 12.8539C65.5889 12.9457 65.1811 12.3128 64.9771 10.955Z'
        fill='currentColor'
      />
      <path
        d='M70.4235 3.1196C70.9261 5.3832 71.4585 8.01134 72.0206 11.004C72.0041 11.3943 71.739 11.628 71.2253 11.7051C71.0907 11.7253 70.9463 11.722 70.7922 11.6951C70.6485 11.6542 70.5509 11.5875 70.4995 11.4952L69.2675 3.29323L70.4235 3.1196ZM68.3422 0.880464C68.2779 0.452324 68.4965 0.200588 68.9981 0.125256C69.3284 0.0756472 69.6085 0.10862 69.8385 0.224176C69.8954 0.353222 69.934 0.485024 69.9542 0.619583C69.9726 0.741908 69.942 0.871584 69.8625 1.00861C69.783 1.14563 69.6454 1.22884 69.4497 1.25824C69.254 1.28764 69.0518 1.27422 68.8433 1.21799C68.6328 1.14953 68.4658 1.03702 68.3422 0.880464Z'
        fill='currentColor'
      />
      <path
        d='M80.0351 8.52434C80.5054 8.24105 80.9662 7.97795 81.4176 7.73504C81.8689 7.49213 82.3086 7.33852 82.7368 7.27421C83.1772 7.20806 83.4176 7.30955 83.458 7.57866C83.4672 7.63983 83.4635 7.74044 83.447 7.88051C83.4409 8.00651 83.2988 8.18423 83.0205 8.41365C82.7527 8.629 82.4105 8.84926 81.994 9.07443C81.5897 9.29776 81.1408 9.51529 80.6473 9.72702C80.1537 9.93875 79.6696 10.1303 79.195 10.3016C78.211 10.6621 77.5049 10.8745 77.0767 10.9388C76.6486 11.0031 76.1764 11.024 75.6602 11.0015C75.1562 10.9771 74.6736 10.887 74.2123 10.7311C73.1443 10.3662 72.535 9.68215 72.3843 8.67908C72.3733 8.60568 72.3513 8.45889 72.3182 8.2387C72.2851 8.01852 72.33 7.69281 72.4529 7.26157C72.5739 6.8181 72.7876 6.36697 73.0939 5.90817C73.3984 5.43715 73.7696 4.99363 74.2075 4.57762C75.1247 3.68933 76.1296 3.05057 77.2219 2.66135C77.6005 2.51692 77.9182 2.42542 78.1751 2.38683C78.4442 2.34641 78.6653 2.31945 78.8384 2.30596C79.0096 2.28024 79.1889 2.26583 79.376 2.26274C79.5613 2.24741 79.7268 2.26634 79.8724 2.31952C80.2143 2.43077 80.4202 2.71882 80.49 3.18365C80.5341 3.47724 80.3693 3.79594 79.9957 4.13976C79.8966 4.22969 79.8089 4.31167 79.7324 4.38569C79.629 4.11353 79.5137 3.88694 79.3864 3.70591C79.2591 3.52489 79.0304 3.45919 78.7001 3.50879C77.3026 4.03142 76.1299 4.67663 75.182 5.44444C74.1124 6.31808 73.6355 7.14023 73.7512 7.91088C73.7641 7.99651 73.784 8.08734 73.8109 8.18336C73.9285 8.96624 74.3118 9.47781 74.9608 9.71806C75.4502 9.89473 76.0496 9.92978 76.7591 9.82321C77.4808 9.7148 78.0927 9.54159 78.5948 9.30356C79.0951 9.05329 79.5752 8.79355 80.0351 8.52434Z'
        fill='currentColor'
      />
      <path
        d='M2.8001 33.4597L2.38953 31.101C2.36013 30.9053 2.40444 30.7423 2.52246 30.6119C2.64048 30.4816 2.79735 30.4018 2.99308 30.3724C3.1888 30.343 3.37444 30.3714 3.55 30.4576C3.72372 30.5316 3.80601 30.6631 3.79688 30.8521L5.11593 38.7595C5.73225 37.6162 6.64248 36.5976 7.84664 35.7038C8.84714 34.9531 9.75718 34.5162 10.5768 34.3931C11.2985 34.2847 11.89 34.4335 12.3512 34.8395C12.6999 35.1624 12.9202 35.6297 13.0121 36.2413C13.1021 36.8407 13.0649 37.3841 12.9005 37.8717C12.7465 38.3451 12.5172 38.8173 12.2127 39.2884C11.9063 39.7472 11.5413 40.1898 11.1175 40.6162C10.6937 41.0426 10.2583 41.4332 9.81123 41.788C8.9624 42.4659 8.11202 43.0502 7.26009 43.5409C7.18302 43.5275 7.05978 43.5397 6.89036 43.5777C6.72094 43.6156 6.51391 43.653 6.26926 43.6897C5.6087 43.789 5.01571 43.7967 4.49029 43.713C4.19341 42.5693 3.86675 40.8109 3.5103 38.4378L2.8001 33.4597ZM5.69463 42.2375C5.71484 42.3721 5.84727 42.421 6.09192 42.3842C6.34881 42.3456 6.65339 42.2498 7.00567 42.0969C7.35795 41.9439 7.77351 41.7126 8.25237 41.403C8.74162 41.0794 9.22077 40.6884 9.68981 40.2302C10.7826 39.1779 11.5528 38.0178 12.0002 36.7498C11.7365 36.0764 11.207 35.7994 10.4119 35.9189C9.6902 36.0273 8.91716 36.4186 8.09279 37.0928C6.92413 38.0563 6.15 39.1483 5.77041 40.3686C5.60597 40.8561 5.55867 41.3323 5.62849 41.7971C5.64686 41.9195 5.66156 42.0173 5.67258 42.0907C5.68361 42.1641 5.69096 42.213 5.69463 42.2375Z'
        fill='currentColor'
      />
      <path
        d='M21.5927 38.4048C20.8921 39.9861 19.8029 41.0628 18.3253 41.635C17.9816 41.7616 17.663 41.847 17.3694 41.8911C17.088 41.9334 16.8495 41.9692 16.6538 41.9986C16.4684 42.0139 16.2559 42.0146 16.0161 42.0006C15.7764 41.9866 15.5503 41.9392 15.3381 41.8585C14.8469 41.6696 14.5664 41.3427 14.4966 40.8779C14.4146 40.6651 14.3534 40.4241 14.3129 40.155C14.2707 39.8736 14.2767 39.4975 14.3311 39.0265C14.3854 38.5555 14.5321 38.0331 14.7711 37.4593C15.0224 36.8837 15.3474 36.3408 15.7461 35.8306C16.5728 34.7558 17.5287 33.9993 18.6136 33.5612C18.9329 33.4382 19.2271 33.3565 19.4962 33.316C19.7775 33.2738 20.0311 33.2545 20.2568 33.2581C20.9663 33.1515 21.5159 33.563 21.9057 34.4927C22.1566 35.0804 22.377 35.9229 22.5668 37.0202C22.767 38.1034 22.9244 38.9428 23.0389 39.5385C23.1638 40.1202 23.3241 40.6465 23.5199 41.1174L22.4374 41.28C22.3388 40.9571 22.258 40.669 22.195 40.4158C22.1319 40.1626 22.0716 39.9277 22.0141 39.7112C21.8758 39.2066 21.7353 38.7712 21.5927 38.4048ZM21.0921 35.5718C20.9856 34.8623 20.5836 34.5599 19.8864 34.6646C19.7989 34.6653 19.7124 34.672 19.6268 34.6849C18.7338 34.819 17.8562 35.3886 16.9939 36.3937C16.5879 36.855 16.2565 37.3551 15.9997 37.894C15.6151 38.6647 15.4642 39.3253 15.5469 39.8758C15.6553 40.5975 16.1355 40.9632 16.9875 40.9728C18.0848 40.783 19.0614 40.1234 19.9175 38.9942C20.2814 38.5017 20.5663 37.9836 20.7723 37.4398C21.0627 36.7082 21.1693 36.0855 21.0921 35.5718Z'
        fill='currentColor'
      />
      <path
        d='M31.5224 38.0579C31.9927 37.7746 32.4535 37.5115 32.9049 37.2686C33.3562 37.0257 33.796 36.8721 34.2241 36.8078C34.6645 36.7416 34.9049 36.8431 34.9453 37.1122C34.9545 37.1734 34.9509 37.274 34.9344 37.4141C34.9283 37.5401 34.7861 37.7178 34.5079 37.9472C34.24 38.1625 33.8978 38.3828 33.4813 38.608C33.0771 38.8313 32.6282 39.0488 32.1346 39.2606C31.6411 39.4723 31.157 39.6638 30.6824 39.8352C29.6983 40.1956 28.9922 40.408 28.5641 40.4723C28.1359 40.5366 27.6637 40.5575 27.1475 40.535C26.6435 40.5106 26.1609 40.4205 25.6997 40.2646C24.6317 39.8997 24.0223 39.2157 23.8717 38.2126C23.8606 38.1392 23.8386 37.9924 23.8055 37.7722C23.7725 37.5521 23.8173 37.2263 23.9402 36.7951C24.0612 36.3516 24.2749 35.9005 24.5812 35.4417C24.8857 34.9707 25.2569 34.5272 25.6948 34.1112C26.6121 33.2229 27.6169 32.5841 28.7092 32.1949C29.0878 32.0505 29.4055 31.959 29.6624 31.9204C29.9315 31.88 30.1526 31.853 30.3257 31.8395C30.497 31.8138 30.6762 31.7994 30.8634 31.7963C31.0487 31.7809 31.2141 31.7999 31.3597 31.8531C31.7016 31.9643 31.9075 32.2524 31.9773 32.7172C32.0214 33.0108 31.8567 33.3295 31.483 33.6733C31.3839 33.7632 31.2962 33.8452 31.2198 33.9192C31.1163 33.6471 31.001 33.4205 30.8737 33.2395C30.7465 33.0584 30.5177 32.9927 30.1874 33.0423C28.7899 33.565 27.6172 34.2102 26.6693 34.978C25.5997 35.8516 25.1228 36.6738 25.2385 37.4444C25.2514 37.5301 25.2713 37.6209 25.2982 37.7169C25.4158 38.4998 25.7991 39.0114 26.4481 39.2516C26.9375 39.4283 27.5369 39.4633 28.2464 39.3568C28.9681 39.2483 29.58 39.0751 30.0821 38.8371C30.5824 38.5868 31.0625 38.3271 31.5224 38.0579Z'
        fill='currentColor'
      />
      <path
        d='M37.6039 35.6997L37.9354 37.2823C38.0824 38.2609 37.9391 38.8891 37.5055 39.1668C37.4131 39.2182 37.2997 39.254 37.1651 39.2742C37.0305 39.2945 36.8669 39.2878 36.6743 39.2542L35.6618 32.3889C35.513 31.3981 35.303 30.4164 35.0319 29.444C34.7711 28.4574 34.5663 27.4688 34.4175 26.4779C34.3587 26.0865 34.5373 25.8595 34.9532 25.797L35.1 25.775C35.1856 25.7621 35.2415 25.76 35.2678 25.7685C35.5653 26.4994 35.8254 27.3985 36.0482 28.4657C36.5411 30.8309 36.9041 32.415 37.1373 33.218C37.3287 33.0767 37.7467 32.6949 38.3913 32.0728C39.0358 31.4506 39.5553 30.9535 39.9497 30.5816C40.3423 30.1974 40.7142 29.8413 41.0652 29.5134C41.8926 28.7762 42.4225 28.3902 42.6549 28.3553C42.8506 28.3259 43.021 28.4191 43.166 28.635C42.6701 29.4975 41.814 30.5017 40.5977 31.6475C40.1042 32.1094 39.6107 32.5713 39.1172 33.0332C38.634 33.481 38.1965 33.9408 37.8045 34.4124C38.6572 34.5095 39.4689 34.6253 40.2396 34.7597C41.0084 34.8819 41.7501 34.9894 42.4645 35.0822C44.1123 35.31 45.5096 35.3691 46.6565 35.2593C46.7061 35.5896 46.7076 35.8083 46.6612 35.9153C46.5768 36.1031 46.3652 36.235 46.0264 36.3109L45.8796 36.3329C45.1022 36.2371 44.0764 36.1535 42.8023 36.0822C40.2927 35.9463 38.5599 35.8188 37.6039 35.6997Z'
        fill='currentColor'
      />
      <path
        d='M47.0913 30.4095C46.9676 29.7526 46.8549 29.1691 46.7533 28.659C46.6498 28.1367 46.5736 27.7541 46.5246 27.5113C46.4861 27.2544 46.2954 26.6514 45.9527 25.7022C46.0407 25.5389 46.1236 25.3826 46.2012 25.2333C46.2911 25.0822 46.4339 24.992 46.6296 24.9626C47.0578 24.8983 47.6591 26.653 48.4335 30.2267C48.87 32.3001 49.2454 34.3826 49.5596 36.4744C49.6441 37.0371 49.2949 37.3773 48.512 37.4948L48.3625 37.4985C48.2669 36.8625 48.1264 36.0517 47.9409 35.0664C47.7554 34.0811 47.5952 33.2233 47.4605 32.493C47.3381 31.7609 47.215 31.0664 47.0913 30.4095Z'
        fill='currentColor'
      />
      <path
        d='M51.1406 28.2627C51.6432 30.5263 52.1755 33.1545 52.7376 36.1472C52.7212 36.5374 52.4561 36.7711 51.9423 36.8483C51.8078 36.8685 51.6634 36.8651 51.5093 36.8383C51.3655 36.7973 51.268 36.7307 51.2166 36.6383L49.9846 28.4364L51.1406 28.2627ZM49.0593 26.0236C48.995 25.5955 49.2136 25.3437 49.7152 25.2684C50.0454 25.2188 50.3256 25.2518 50.5556 25.3673C50.6125 25.4964 50.651 25.6282 50.6713 25.7627C50.6896 25.8851 50.6591 26.0147 50.5796 26.1518C50.5001 26.2888 50.3625 26.372 50.1668 26.4014C49.9711 26.4308 49.7689 26.4174 49.5603 26.3611C49.3499 26.2927 49.1829 26.1802 49.0593 26.0236Z'
        fill='currentColor'
      />
      <path
        d='M60.1811 31.6143C59.9624 30.1586 59.7222 29.1002 59.4602 28.4391C59.5305 28.2409 59.37 28.1712 58.9785 28.23C58.5626 28.2925 58.04 28.4773 57.4107 28.7845C56.7814 29.0916 56.2744 29.3804 55.8897 29.6508C54.9705 30.2767 54.4899 30.8243 54.4477 31.2934L55.1974 36.2843L53.968 36.4689C53.7465 36.0769 53.4915 34.9207 53.2031 33.0001C52.9458 31.2876 52.7872 30.023 52.7271 29.2065C52.6792 28.3881 52.6653 27.9211 52.6855 27.8055C52.9723 27.5498 53.2136 27.4072 53.4093 27.3778C53.7151 27.3319 53.9222 27.6698 54.0306 28.3915C54.0729 28.6729 54.0959 28.9509 54.0996 29.2255C54.1137 29.4861 54.1281 29.6653 54.1428 29.7631C55.9059 28.0098 57.3317 27.0514 58.4204 26.8878C59.6559 26.7023 60.509 27.5936 60.9798 29.5618C61.1579 30.248 61.3398 31.2089 61.5253 32.4443L61.7247 33.8967C61.8056 34.4349 61.8959 34.9529 61.9957 35.4508C61.8844 35.5426 61.792 35.594 61.7186 35.605C61.6801 35.5983 61.5978 35.5919 61.4718 35.5858C61.3458 35.5797 61.1841 35.5852 60.9865 35.6024C60.7907 35.1315 60.649 34.6461 60.5614 34.1464C60.472 33.6345 60.3952 33.1645 60.3308 32.7363L60.1811 31.6143Z'
        fill='currentColor'
      />
      <path
        d='M64.3382 31.6841L64.6697 33.2667C64.8167 34.2453 64.6734 34.8735 64.2398 35.1513C64.1474 35.2027 64.0339 35.2385 63.8994 35.2587C63.7648 35.2789 63.6012 35.2722 63.4085 35.2386L62.3961 28.3734C62.2473 27.3825 62.0373 26.4009 61.7662 25.4284C61.5054 24.4419 61.3006 23.4532 61.1518 22.4623C61.093 22.0709 61.2715 21.8439 61.6874 21.7815L61.8342 21.7594C61.9199 21.7466 61.9758 21.7444 62.0021 21.753C62.2995 22.4838 62.5597 23.3829 62.7825 24.4502C63.2754 26.8153 63.6384 28.3994 63.8716 29.2025C64.063 29.0611 64.481 28.6794 65.1255 28.0572C65.7701 27.435 66.2896 26.938 66.684 26.566C67.0766 26.1818 67.4484 25.8258 67.7995 25.4978C68.6269 24.7606 69.1568 24.3746 69.3892 24.3397C69.5849 24.3103 69.7553 24.4035 69.9003 24.6194C69.4044 25.4819 68.5483 26.4861 67.332 27.632C66.8385 28.0939 66.345 28.5558 65.8514 29.0176C65.3683 29.4655 64.9308 29.9252 64.5388 30.3969C65.3915 30.4939 66.2032 30.6097 66.9739 30.7441C67.7427 30.8663 68.4844 30.9738 69.1988 31.0666C70.8466 31.2944 72.2439 31.3535 73.3907 31.2438C73.4403 31.574 73.4419 31.7927 73.3955 31.8998C73.3111 32.0875 73.0995 32.2194 72.7607 32.2953L72.6139 32.3174C71.8364 32.2215 70.8107 32.1379 69.5366 32.0666C67.027 31.9307 65.2942 31.8032 64.3382 31.6841Z'
        fill='currentColor'
      />
      <path
        d='M80.1289 27.8863C81.4745 27.6842 82.1987 27.9257 82.3016 28.6107C82.3788 29.1245 82.0957 29.7799 81.4524 30.577C80.4918 31.7595 79.1155 32.798 77.3235 33.6926C77.2379 33.7055 77.1272 33.6346 76.9913 33.4798C76.8678 33.3233 76.769 33.2068 76.6949 33.1303C76.6313 33.0398 76.5854 32.9842 76.5573 32.9634C77.8942 32.2873 78.9657 31.5509 79.7717 30.7544C80.3171 30.2222 80.5687 29.8154 80.5265 29.534C80.4842 29.2527 80.1022 29.1662 79.3805 29.2746C78.6588 29.383 77.6264 29.7132 76.2833 30.2652C75.6436 30.3362 75.0591 30.1926 74.53 29.8343C74.0693 29.5157 73.8105 29.1668 73.7536 28.7876C73.6948 28.3962 73.7516 28.0249 73.924 27.6738C74.0946 27.3104 74.3422 26.9605 74.6669 26.6241C74.9917 26.2876 75.3812 25.9664 75.8356 25.6605C76.948 24.9055 78.1465 24.4315 79.4309 24.2386C79.8101 24.1816 80.1826 24.1632 80.5484 24.1833C80.8419 24.1392 81.0325 24.242 81.12 24.4915C81.2075 24.741 81.2954 25.1594 81.3836 25.7465C80.6122 25.5247 79.774 25.4817 78.8688 25.6177C77.7434 25.7867 76.8477 26.1527 76.1817 26.7155C75.4894 27.2698 75.1843 27.9035 75.2664 28.6167C75.3179 28.9592 75.5944 29.0928 76.0959 29.0174L77.4133 28.6695C78.5265 28.2521 79.4316 27.9911 80.1289 27.8863Z'
        fill='currentColor'
      />
    </svg>
  )
}

function CallsChat() {
  return (
    <div className='relative mt-2 select-none sm:mt-6 lg:-mx-4 lg:mt-8 xl:-mx-6 xl:mt-12 2xl:-mx-8'>
      <div className='bg-elevated flex select-none items-center rounded-lg border-[0.5px] pt-2 shadow lg:max-w-[70%] lg:-rotate-2'>
        <Messages thread={messageThreads.group} messages={messageThreads.group.messages} />
      </div>

      <CallUI />
    </div>
  )
}

function CallUI() {
  return (
    <div
      className={cn(
        'bg-elevated bottom-22 dark absolute -right-32 z-20 hidden aspect-video w-full max-w-[75%] rotate-2 select-none self-end rounded-lg md:max-w-[300px] lg:block lg:max-w-[400px]',
        'shadow-[inset_0_0.5px_0_rgb(0_0_0_/_0.1),_0px_2px_4px_rgb(0,0,0,0.1),_0px_4px_12px_rgb(0,0,0,0.1),_0px_8px_20px_rgb(0,0,0,0.02)] dark:bg-neutral-900 dark:shadow-[inset_0px_0px_0px_0.5px_rgb(255_255_255_/_0.12),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_12px_rgb(0_0_0_/_0.12),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24),_0px_2px_30px_rgb(0_0_0_/_0.50)]'
      )}
    >
      <StandupCall />

      <div className='relative flex items-center justify-between gap-3 p-3'>
        <RecordButton />

        <div className='flex items-center gap-1.5'>
          <Button
            variant='flat'
            round
            size='sm'
            iconOnly={<MicrophoneIcon />}
            accessibilityLabel='Audio settings'
            className='bg-green-500 dark:bg-green-500 dark:hover:bg-green-500'
          />
          <Button variant='flat' round size='sm' iconOnly={<VideoCameraIcon />} accessibilityLabel='Video settings' />
          <Button variant='flat' round size='sm' iconOnly={<StreamIcon />} accessibilityLabel='Share screen' />
        </div>

        <Button
          variant='destructive'
          round
          size='sm'
          iconOnly={<CloseIcon strokeWidth='3' size={16} />}
          accessibilityLabel='End call'
        />
      </div>
    </div>
  )
}

function StandupCall() {
  return (
    <div className='pointer-events-none grid aspect-video grid-cols-2 gap-1 px-2 pt-2'>
      <Image
        draggable={false}
        src='/img/home/group-video-1.jpeg'
        alt='Group call'
        width={1456}
        height={816}
        className='aspect-video rounded object-cover'
      />
      <Image
        draggable={false}
        src='/img/home/group-video-2.jpeg'
        alt='Group call'
        width={1456}
        height={816}
        className='aspect-video rounded object-cover'
      />
      <Image
        draggable={false}
        src='/img/home/group-video-3.jpeg'
        alt='Group call'
        width={1456}
        height={816}
        className='aspect-video rounded object-cover object-[20%_20%]'
      />
      <Image
        draggable={false}
        src='/img/home/group-video-4.jpeg'
        alt='Group call'
        width={1456}
        height={816}
        className='aspect-video rounded object-cover'
      />
    </div>
  )
}

function RecordButton() {
  const isRecording = true
  const isStarting = false
  const isStopping = false

  return (
    <div className='relative flex h-6 w-6 items-center justify-center self-start'>
      {/* ring */}
      <motion.div
        animate={{ scale: isRecording ? 1.2 : 1 }}
        className={cn(
          'absolute inset-0 rounded-full border-opacity-50 bg-clip-border before:absolute before:-inset-[3px] before:rounded-full before:border-[2px] before:content-[""]',
          {
            'before:animate-spin': isStarting || isStopping,
            'before:border-red/50 before:border-t-red-500': isRecording && isStopping,
            'before:border-t-white': !isRecording && isStarting,
            'border-[3px] border-white': !isRecording,
            'animate-pulse border-[3px] border-red-500': isRecording,
            'before:border-transparent': isRecording && !isStarting && !isStopping
          }
        )}
      />

      {/* dot */}
      <motion.div
        animate={{
          scale: isRecording ? 0.9 : 1,
          borderRadius: isRecording ? 3 : 8,
          rotate: isRecording ? 0 : 20
        }}
        className={cn('h-3 w-3', {
          'bg-white': !isRecording,
          'bg-red-500': isRecording
        })}
      />
    </div>
  )
}
