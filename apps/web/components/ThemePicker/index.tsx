import { useEffect, useState } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import * as SettingsSection from 'components/SettingsSection'
import { m } from 'framer-motion'
import { useTheme } from 'next-themes'

import { cn } from '@campsite/ui/src/utils'

import { Svg } from '@/components/Svg'
import { Theme, useUpdateTheme } from '@/hooks/useUpdateTheme'

export const ThemePicker = () => {
  const [systemTheme, setSystemTheme] = useState('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const updateTheme = useUpdateTheme()

  function handleChange(selection: Theme) {
    setTheme(selection)
    updateTheme.mutate({ theme: selection })
  }

  const buttonClasses =
    'relative inline-flex h-[30px] transform-gpu touch-none select-none items-center justify-center gap-2 rounded-md border border-none border-transparent bg-button px-3 text-[13px] font-semibold leading-none text-primary shadow-button after:absolute after:-inset-[1px] after:block after:rounded-md after:bg-gradient-to-t after:from-black/5 after:opacity-50 after:transition-opacity hover:after:opacity-100 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:after:from-black/[0.15] dark:focus-visible:ring-blue-600'

  useEffect(() => {
    setSystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    })
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Theme</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>Choose your interface color theme</SettingsSection.Description>

      <SettingsSection.Separator />

      <div className='p-8 pt-4'>
        <form>
          <RadioGroup.Root
            className='RadioGroupRoot'
            defaultValue={theme}
            aria-label='View density'
            onValueChange={(selectedTheme: Theme) => handleChange(selectedTheme)}
          >
            <div className='grid gap-3 max-sm:space-y-3 sm:grid-cols-3'>
              <div
                className={cn(
                  'light flex items-end justify-center rounded-md border bg-gray-50 px-1.5 pt-3 transition',
                  {
                    'border-blue-500 ring-2 ring-blue-100': theme === 'light'
                  }
                )}
              >
                <RadioGroup.Item value='light' id='lightTheme' />
                <label className='relative cursor-pointer' htmlFor='lightTheme'>
                  <span className='block h-full w-full overflow-hidden'>
                    <span className='block rounded-t-sm border border-b-0 shadow-xl shadow-black/20'>
                      <Svg src='/themes/theme-light' responsive />
                    </span>
                  </span>

                  <span className='absolute inset-x-0 bottom-2 flex flex-col items-center sm:-bottom-1'>
                    <span className='relative'>
                      <span className={buttonClasses}>Light</span>

                      {theme === 'light' && (
                        <m.span
                          className='absolute inset-x-1.5 -bottom-3 h-0.5 rounded-full bg-blue-500 max-sm:hidden'
                          layoutId='underline'
                        />
                      )}
                    </span>
                  </span>
                </label>
              </div>

              <div
                className={cn(
                  'bg-secondary dark flex items-end justify-center rounded-md border px-1.5 pt-3 transition',
                  {
                    'border-blue-500 ring-2 ring-blue-800/60': theme === 'dark'
                  }
                )}
              >
                <RadioGroup.Item value='dark' id='darkTheme' />
                <label className='relative cursor-pointer' htmlFor='darkTheme'>
                  <span className='block h-full w-full overflow-hidden'>
                    <span className='block rounded-t-sm border border-b-0 shadow-xl shadow-black/95'>
                      <Svg src='/themes/theme-dark' responsive />
                    </span>
                  </span>
                  <span className='absolute inset-x-0 bottom-2 flex justify-center sm:-bottom-1'>
                    <span className='relative'>
                      <span className={buttonClasses}>Dark</span>

                      {theme === 'dark' && (
                        <m.span
                          className='absolute inset-x-1.5 -bottom-3 h-0.5 rounded-full bg-blue-500 max-sm:hidden'
                          layoutId='underline'
                        />
                      )}
                    </span>
                  </span>
                </label>
              </div>

              <div
                className={cn('bg-secondary flex items-end justify-center rounded-md border px-1.5 pt-3 transition', {
                  dark: systemTheme === 'dark',
                  light: systemTheme === 'light',
                  'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-800/60': theme === 'system'
                })}
              >
                <RadioGroup.Item value='system' id='systemTheme' />
                <label className='relative cursor-pointer' htmlFor='systemTheme'>
                  <span className='block h-full w-full overflow-hidden'>
                    <span
                      className={cn('block rounded-t-sm border border-b-0 shadow-xl', {
                        'shadow-black/95': systemTheme === 'dark',
                        'shadow-black/20': systemTheme === 'light'
                      })}
                    >
                      <Svg src='/themes/theme-system' responsive />
                    </span>
                  </span>
                  <span className='absolute inset-x-0 bottom-2 flex justify-center sm:-bottom-1'>
                    <span className='relative'>
                      <span className={buttonClasses}>System</span>

                      {theme === 'system' && (
                        <m.span
                          className='absolute inset-x-1.5 -bottom-3 h-0.5 rounded-full bg-blue-500 max-sm:hidden'
                          layoutId='underline'
                        />
                      )}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </RadioGroup.Root>
        </form>
      </div>
    </SettingsSection.Section>
  )
}
