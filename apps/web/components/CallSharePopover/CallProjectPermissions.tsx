import toast from 'react-hot-toast'

import { Call } from '@campsite/types'
import { cn, Select } from '@campsite/ui'

import { CallProjectPicker } from '@/components/CallSharePopover/CallProjectPicker'
import { useUpdateCallProjectPermission } from '@/hooks/useUpdateCallProjectPermission'

const PERMISSION_ACTIONS = [
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' }
] as const

export function CallProjectPermissions({ call }: { call: Call }) {
  const { mutate: updateCallProjectPermission } = useUpdateCallProjectPermission()
  const callProjectId = call.project?.id

  if (!call.viewer_can_edit) return null

  return (
    <div
      className={cn('flex items-center justify-between gap-2', {
        'grid-cols-1': call.project_permission === 'none',
        'grid-cols-5': call.project_permission !== 'none'
      })}
    >
      <div className='col-span-3 flex-1'>
        <CallProjectPicker call={call} />
      </div>

      {callProjectId && call.project_permission !== 'none' && (
        <div className='shrink-0'>
          <Select
            value={call.project_permission}
            onChange={(value) =>
              updateCallProjectPermission(
                { callId: call.id, project_id: callProjectId, permission: value },
                { onSuccess: () => toast('Permission updated') }
              )
            }
            options={PERMISSION_ACTIONS}
            showCheckmark
            align='end'
            popoverWidth={180}
          />
        </div>
      )}
    </div>
  )
}
