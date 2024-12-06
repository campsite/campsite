import { NextSeo } from 'next-seo'
import Image from 'next/image'

import { SITE_URL } from '@campsite/config'

import { SwitchSlackPathPicker } from '@/components/Home/SwitchSlackPathPicker'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../../components/Layouts/PageHead'

export default function SwitchFromSlack() {
  return (
    <>
      <NextSeo
        title='Switch from Slack'
        description='Move from Slack to Campsite in minutes.'
        canonical={`${SITE_URL}/switch-from-slack`}
      />

      <WidthContainer className='max-w-4xl items-center justify-center gap-12 py-16 text-center lg:py-24'>
        <div className='flex items-center gap-4'>
          <Image
            draggable={false}
            src='/img/slack-app-icon.png'
            width={112}
            height={112}
            alt='Slack app icon'
            className='h-16 w-16 -translate-x-1.5 select-none lg:h-32 lg:w-32'
          />
          <svg
            className='text-primary -ml-2 opacity-40'
            width='70'
            height='68'
            viewBox='0 0 202 68'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M142.945 27.861C140.293 22.3009 135.744 19.5314 132.496 15.7357C130.601 13.5262 128.199 11.6386 126.473 9.32177C123.561 5.42252 125.548 1.07819 130.452 0.410978C131.846 0.220168 133.454 0.367555 134.776 0.841859C151.534 6.72014 168.595 11.4385 185.959 15.0526C189.885 15.8634 193.855 17.2308 197.367 19.1435C202.801 22.0995 203.25 26.8322 198.441 30.6684C185.995 40.5549 173.224 50.0452 158.896 57.1669C153.952 59.6111 149.058 62.2787 144.007 64.5538C141.031 65.9312 137.785 66.9692 134.602 67.6752C130.638 68.5303 128.299 66.3107 128.055 62.3606C127.805 58.688 129.257 55.8873 131.645 53.441C135.002 49.961 137.314 45.9573 139.483 40.9504C135.238 39.4657 131.61 40.2172 128.107 40.3604C89.685 41.7162 51.2621 43.1275 12.8403 44.4832C10.2822 44.5922 7.67601 44.3667 5.12786 44.0315C2.74506 43.7555 0.888311 42.3246 0.722551 39.8208C0.555539 37.3724 2.09369 35.6848 4.44351 34.9599C5.84179 34.547 7.34489 34.4142 8.84672 34.337C14.3555 33.9612 19.9223 33.4756 25.4792 33.4343C63.9288 33.3015 102.273 30.4439 140.706 28.5884C140.928 28.5934 141.267 28.3788 142.945 27.861Z'
              fill='currentColor'
            />
          </svg>
          <Image
            draggable={false}
            src='/img/desktop-app-icon.png'
            width={112}
            height={112}
            alt='Campsite app icon'
            className='h-16 w-16 -translate-x-1.5 select-none lg:h-32 lg:w-32'
          />
        </div>

        <PageHead title='Switch from Slack' subtitle='Replace noisy chats with focused, organized posts.' />

        <SwitchSlackPathPicker />
      </WidthContainer>
    </>
  )
}
