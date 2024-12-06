import { useRouter } from 'next/router'

import { CustomReactionsPacks } from '@/components/OrgSettings/OrganizationReactions/CustomReactionsPacks'
import * as SettingsSection from '@/components/SettingsSection'
import { useScope } from '@/contexts/scope'

import { CreateCustomReaction } from './CreateCustomReaction'
import { CustomReactionsTable } from './CustomReactionsTable'

interface OrganizationReactionsProps {
  type: 'packs' | 'library'
}

export function OrganizationReactions({ type }: OrganizationReactionsProps) {
  const { scope } = useScope()
  const router = useRouter()

  const tabs = [
    {
      label: 'Library',
      active: router.asPath === `/${scope}/settings/emojis`,
      href: `/${scope}/settings/emojis`
    },
    {
      label: 'Packs',
      active: router.asPath === `/${scope}/settings/emojis/packs`,
      href: `/${scope}/settings/emojis/packs`
    }
  ]

  return (
    <>
      <SettingsSection.Section>
        <SettingsSection.Header>
          <SettingsSection.Title>Custom emojis</SettingsSection.Title>

          <div className='flex items-center space-x-2'>
            <CreateCustomReaction />
          </div>
        </SettingsSection.Header>

        <SettingsSection.SubTabs tabs={tabs} />

        {type === 'library' && <CustomReactionsTable />}
        {type === 'packs' && <CustomReactionsPacks />}
      </SettingsSection.Section>
    </>
  )
}
