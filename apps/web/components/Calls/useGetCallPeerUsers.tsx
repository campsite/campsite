import { useMemo } from 'react'

import { CallPeer, OrganizationMember } from '@campsite/types'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

interface Props {
  peers: CallPeer[]
  activeOnly?: boolean
  excludeCurrentUser?: boolean
}

export function useGetCallPeerMembers({ peers, activeOnly = false, excludeCurrentUser = false }: Props) {
  const { data: currentUser } = useGetCurrentUser()

  return useMemo(
    () =>
      peers.reduce<OrganizationMember[]>((acc, peer) => {
        if (activeOnly && !peer.active) return acc
        if (excludeCurrentUser && currentUser?.id === peer.member.user.id) return acc
        if (acc.find((m) => m.id === peer.member.id && m.user.display_name === peer.member.user.display_name)) {
          return acc
        }
        return [...acc, peer.member]
      }, []),
    [activeOnly, currentUser?.id, excludeCurrentUser, peers]
  )
}
