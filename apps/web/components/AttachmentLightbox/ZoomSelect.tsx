import { atom, useAtomValue, useSetAtom } from 'jotai'

import { LayeredHotkeys, Select, SelectTrigger, SelectValue, ZoomInIcon } from '@campsite/ui'

import { changeZoomAtom, zoomAtom } from '../ZoomPane/atom'

const zoomTransformAtom = atom((get) => get(zoomAtom).transform.k)
const ZOOM_OPTIONS = [
  { label: 'Zoom in', value: 'increase', shortcut: ['mod', '+'] },
  { label: 'Zoom out', value: 'decrease', shortcut: ['mod', '-'] },
  { label: 'Zoom to fit', value: 'fit', shortcut: ['shift', '1'] },
  { label: 'Zoom to 50%', value: '50%', shortcut: ['shift', '2'] },
  { label: 'Zoom to 100%', value: '100%', shortcut: ['mod', '0'] }
]

export function ZoomSelect() {
  const zoom = useAtomValue(zoomTransformAtom)
  const setState = useSetAtom(changeZoomAtom)

  const onZoomOption = (option: string) => {
    switch (option) {
      case 'decrease':
        setState('zoom-out')
        break
      case 'increase':
        setState('zoom-in')
        break
      case 'fit':
        setState('zoom-fit')
        break
      case '50%':
        setState('zoom-50%')
        break
      case '100%':
        setState('zoom-100%')
        break
    }
  }

  return (
    <>
      <LayeredHotkeys
        keys={['mod+Equal']}
        callback={() => onZoomOption('increase')}
        options={{ preventDefault: true }}
      />
      <LayeredHotkeys
        keys={['mod+minus']}
        callback={() => onZoomOption('decrease')}
        options={{ preventDefault: true }}
      />
      <LayeredHotkeys keys={['shift+1']} callback={() => onZoomOption('fit')} options={{ preventDefault: true }} />
      <LayeredHotkeys keys={['shift+2']} callback={() => onZoomOption('50%')} options={{ preventDefault: true }} />
      <LayeredHotkeys keys={['mod+0']} callback={() => onZoomOption('100%')} options={{ preventDefault: true }} />

      <Select
        typeAhead={false}
        options={ZOOM_OPTIONS}
        value={''}
        onChange={(option) => onZoomOption(option)}
        showCheckmark={false}
        disabled={!zoom}
      >
        <SelectTrigger
          leftSlot={<ZoomInIcon />}
          className='hover:bg-quaternary dark:hover:bg-quaternary bg-transparent font-semibold shadow-none dark:bg-transparent dark:shadow-none'
          chevron={false}
        >
          <SelectValue
            className='inline-block text-right align-bottom font-mono'
            getSelectedLabel={() => `${Math.ceil(zoom * 100)}%`}
          />
        </SelectTrigger>
      </Select>
    </>
  )
}
