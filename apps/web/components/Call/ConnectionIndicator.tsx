/* Adapated from https://github.com/100mslive/100ms-web/blob/main/src/components/Connection/ConnectionIndicator.jsx */

import React from 'react'
import { selectConnectionQualityByPeerID, useHMSStore } from '@100mslive/react-sdk'
import { useDebounce } from 'use-debounce'

import { Tooltip } from '@campsite/ui/Tooltip'

const connectionTooltip = {
  0: 'Reconnecting',
  1: 'Very bad connection',
  2: 'Bad connection',
  3: 'Moderate connection',
  4: 'Good connection',
  5: 'Excellent connection'
}

type ConnectionScore = -1 | 0 | 1 | 2 | 3 | 4 | 5

/**
 * position is needed here as we don't want all the dots/arcs to be colored,
 * the non colored ones will be passed in the default color. If user is
 * disconnected(score=0), no dot/arc will be colored.
 */
const getColor = ({ position, connectionScore }: { position: 1 | 2 | 3 | 4; connectionScore: ConnectionScore }) => {
  const shouldBeColored = position <= connectionScore
  const defaultColor = 'bg-tertiary'

  if (!shouldBeColored) {
    return defaultColor
  }
  if (connectionScore >= 4) {
    return '#37F28D'
  } else if (connectionScore >= 3) {
    return '#FAC919'
  } else if (connectionScore >= 1) {
    return '#ED4C5A'
  }
  return defaultColor
}

export const ConnectionIndicator = ({ peerId }: { peerId: string }) => {
  const downlinkQuality = useHMSStore(selectConnectionQualityByPeerID(peerId))?.downlinkQuality as
    | ConnectionScore
    | undefined
  // avoid thrashing the connection quality indicator by debouncing for 3 seconds
  const [debouncedDownlinkQuality] = useDebounce(downlinkQuality, 3000)

  if (debouncedDownlinkQuality === -1 || debouncedDownlinkQuality === undefined) {
    return null
  }

  return (
    <Tooltip label={connectionTooltip[debouncedDownlinkQuality]}>
      <svg
        width={20}
        height={20}
        viewBox='0 0 14 12'
        xmlns='http://www.w3.org/2000/svg'
        xmlSpace='preserve'
        style={{
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          strokeLinejoin: 'round',
          strokeMiterlimit: 2
        }}
      >
        <path
          d='M6.875 0c2.549.035 4.679.902 6.445 2.648.366.362.45.796.216 1.096-.239.306-.714.34-1.142.072a2.28 2.28 0 0 1-.341-.271C9.24.862 4.924.775 1.992 3.346c-.284.249-.594.419-.983.393-.272-.019-.49-.135-.613-.388-.125-.261-.05-.498.114-.713.073-.092.156-.177.245-.254C2.516.804 4.591.039 6.875 0Z'
          fill={getColor({ position: 4, connectionScore: debouncedDownlinkQuality })}
          transform='translate(-.333)'
        />
        <path
          d='M7.056 2.964c1.756.035 3.208.7 4.499 1.763.162.134.277.315.354.512.098.251.114.503-.075.72-.193.222-.452.259-.725.198-.293-.066-.518-.247-.738-.443a4.859 4.859 0 0 0-6.198-.26c-.166.127-.318.271-.475.409-.242.211-.513.343-.843.317-.43-.034-.679-.397-.561-.81.062-.211.181-.4.345-.546 1.265-1.162 2.733-1.836 4.417-1.86Z'
          fill={getColor({ position: 3, connectionScore: debouncedDownlinkQuality })}
          transform='translate(-.333)'
        />
        <path
          d='M7.384,6.052C8.293,6.068 9.157,6.449 9.783,7.108C10.005,7.339 10.157,7.6 10.07,7.942C9.959,8.377 9.435,8.581 9.071,8.243C7.935,7.191 6.356,7.183 5.152,8.183C4.816,8.462 4.6,8.485 4.332,8.27C4.063,8.055 3.998,7.691 4.177,7.358C4.273,7.179 4.414,7.038 4.57,6.911C5.26,6.349 6.149,6.05 7.384,6.052L7.384,6.052Z'
          fill={getColor({ position: 2, connectionScore: debouncedDownlinkQuality })}
        />
        <path
          d='M8.214,9.941C8.214,10.234 8.097,10.515 7.888,10.721C7.68,10.928 7.398,11.042 7.104,11.039C6.471,11.036 5.982,10.541 5.993,9.912C6.004,9.259 6.499,8.766 7.133,8.779C7.744,8.791 8.22,9.301 8.214,9.941Z'
          fill={getColor({ position: 1, connectionScore: debouncedDownlinkQuality })}
        />
      </svg>
    </Tooltip>
  )
}
