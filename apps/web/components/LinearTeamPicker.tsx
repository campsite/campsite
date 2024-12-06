import { useMemo, useState } from 'react'
import { useSetAtom } from 'jotai'

import { IntegrationTeam } from '@campsite/types'
import { AlertIcon, LinearIcon, LockIcon, Select, SelectOption, SelectTrigger, SelectValue } from '@campsite/ui'

import { useCreateLinearTeamSync } from '@/hooks/useCreateLinearTeamSync'
import { useGetLinearTeams } from '@/hooks/useGetLinearTeams'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

export const lastUsedLinearTeamAtom = atomWithWebStorage<string | null>(['linear', 'lastUsedTeamId'], null)

interface LinearTeamPickerProps {
  onChange: (team: IntegrationTeam) => void
  onKeyDownCapture?: (event: React.KeyboardEvent) => void
  activeId?: string | null
}

export function LinearTeamPicker({ onChange, activeId, onKeyDownCapture }: LinearTeamPickerProps) {
  const getTeams = useGetLinearTeams()

  const [syncInitiated, setSyncInitiated] = useState(false)
  const syncChannels = useCreateLinearTeamSync()
  const handleOpenChange = (open: boolean) => {
    if (!open || syncInitiated) return
    syncChannels.mutate()
    setSyncInitiated(true)
  }

  if (getTeams.error) {
    return (
      <div className='flex items-center justify-start space-x-1 text-sm'>
        <AlertIcon />
        <span>Unable to load your organization’s Linear teams</span>
      </div>
    )
  }

  return (
    <TeamPicker
      activeId={activeId}
      teams={getTeams.data ?? []}
      onChange={onChange}
      onKeyDownCapture={onKeyDownCapture}
      onOpenChange={handleOpenChange}
      disabled={getTeams.isLoading}
    />
  )
}

interface TeamPickerProps {
  activeId?: string | null
  teams: IntegrationTeam[]
  onChange: (team: IntegrationTeam) => void
  onOpenChange?: (open: boolean) => void
  onKeyDownCapture?: (event: React.KeyboardEvent) => void
  disabled?: boolean
}

function TeamPicker(props: TeamPickerProps) {
  const { teams, onChange, onOpenChange, activeId, onKeyDownCapture } = props
  const setLastUsedTeamId = useSetAtom(lastUsedLinearTeamAtom)

  const options = useMemo(() => {
    let results = teams.map((team) => ({
      value: team.provider_team_id,
      label: team.name,
      leftSlot: team.private ? <LockIcon /> : null
    })) as SelectOption[]

    return results
  }, [teams])

  const activeTeam = useMemo(() => {
    const active = options.find((c) => c.value === activeId)

    return active
  }, [options, activeId])

  async function handleOnChange(value: string) {
    const team = teams.find((c) => c.provider_team_id === value)

    if (!team) return

    onChange(team)
    setLastUsedTeamId(team.provider_team_id)
  }

  return (
    <Select
      typeAhead
      disabled={props.disabled}
      options={options}
      value={activeTeam?.value ?? ''}
      onChange={handleOnChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger leftSlot={<LinearIcon size={16} />} onKeyDownCapture={onKeyDownCapture}>
        <SelectValue placeholder='Select a team' />
      </SelectTrigger>
    </Select>
  )
}
