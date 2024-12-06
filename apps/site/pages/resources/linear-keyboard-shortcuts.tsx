import { FooterCTA } from 'app/blog/_components/FooterCTA'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { isWindows } from 'react-device-detect'

import { SITE_URL } from '@campsite/config'

import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { WidthContainer } from '@/components/Layouts/WidthContainer'
import { linearShortcutsData } from '@/components/Resources/linearShortcutsData'
import { Table, Tbody, Td } from '@/components/Table'

import { PageHead, PageSubtitle } from '../../components/Layouts/PageHead'

export default function LinearKeyboardShortcuts() {
  return (
    <>
      <NextSeo
        title='The Ultimate List of Linear Keyboard Shortcuts'
        description='A free cheat sheet with 100+ keyboard shortcuts to master Linear.'
        canonical={`${SITE_URL}/resources/linear-keyboard-shortcuts`}
      />

      <WidthContainer className='max-w-4xl gap-12 py-16 lg:py-24'>
        <Image
          draggable={false}
          src='/img/home/linear-app-icon.png'
          width={112}
          height={112}
          alt='Linear app icon'
          className='h-16 w-16 -translate-x-1.5 select-none lg:h-32 lg:w-32'
        />

        <PageHead
          title='The ultimate list of Linear keyboard shortcuts'
          subtitle='A free cheat sheet with 100+ keyboard shortcuts to master Linear.'
        />

        <div className='prose lg:prose-lg'>
          <p>Linear keyboard shortcuts are your fast track to working smarter, not harder.</p>
          <p>
            With just a few keystrokes, you can zip through tasks, update issues, and navigate your workspace with ease.
            Whether you’re managing projects, assigning tasks, or fine-tuning your workflow, these shortcuts keep things
            moving without unnecessary clicks.
          </p>

          <p>This Linear cheat sheet lays out the key shortcuts you need to master Linear.</p>
          <ShortcutsTable />
        </div>
      </WidthContainer>
      <HorizontalRule />
      <FooterCTA />
    </>
  )
}

function ShortcutsTable() {
  const cleaned = linearShortcutsData.map((category) => {
    // if the user is on windows, replace the command key with the control key and the option key with the alt key
    if (isWindows) {
      return {
        category: category.category,
        shortcuts: category.shortcuts.map((shortcut) => {
          return {
            action: shortcut.action,
            shortcut: shortcut.shortcut.replace(/⌘/g, 'Ctrl').replace(/⌥/g, 'Alt').replace(/⇧/g, 'Shift')
          }
        })
      }
    } else {
      return category
    }
  })

  return (
    <>
      {cleaned.map((category) => (
        <div className='flex flex-col' key={category.category}>
          <PageSubtitle>{category.category}</PageSubtitle>
          <Table>
            <Tbody>
              {category.shortcuts.map((s) => {
                const shortcutParts = s.shortcut.split(' ').map((part) => part.trim())

                return (
                  <tr key={s.action}>
                    <Td className='px-0'>{s.action}</Td>
                    <Td className='px-0'>
                      <div className='flex items-center justify-end gap-0.5'>
                        {shortcutParts.map((part) => {
                          if (part === 'then' || part === 'and' || part === 'or') {
                            return (
                              <span key={part} className='text-tertiary mx-1 font-normal'>
                                {part}
                              </span>
                            )
                          }

                          return (
                            <kbd
                              key={part}
                              className='bg-quaternary rounded-md border px-1 py-0.5 font-mono text-base font-medium [font-size:100%!important]'
                            >
                              {part}
                            </kbd>
                          )
                        })}
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </Tbody>
          </Table>
        </div>
      ))}
    </>
  )
}
