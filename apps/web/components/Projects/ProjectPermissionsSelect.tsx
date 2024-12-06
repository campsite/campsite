import { Select } from '@campsite/ui'

type PermissionAction = 'view' | 'edit'

export const projectPermissionActionToLabel = (action: PermissionAction) => {
  switch (action) {
    case 'view':
      return 'View + comment'
    case 'edit':
      return 'Edit'
  }
}

const PERMISSION_ACTIONS = (['view', 'edit'] as const).map((action) => ({
  value: action,
  label: projectPermissionActionToLabel(action)
}))

interface Props {
  selected: PermissionAction
  onChange: (action: PermissionAction) => void
  disabled?: boolean
}

export function ProjectPermissionsSelect({ selected, onChange, disabled = false }: Props) {
  return (
    <Select
      disabled={disabled}
      value={selected}
      onChange={(value) => onChange(value as PermissionAction)}
      options={PERMISSION_ACTIONS}
      showCheckmark
      align='end'
      popoverWidth={180}
    />
  )
}
