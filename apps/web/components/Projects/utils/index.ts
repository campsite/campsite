import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// ----------------------------------------------------------------------------

const PROJECT_PAGE_SCROLL_CONTAINER_ID = '/[org]/projects/[projectId]'
const PROJECT_DETAILS_WIDTH = 320

// ----------------------------------------------------------------------------

const isDesktopProjectSidebarOpenAtom = atomWithStorage('campsite:isDesktopProjectSidebarOpen', true, undefined, {
  getOnInit: true
})
const isMobileProjectSidebarOpenAtom = atom(false)

// ----------------------------------------------------------------------------

export {
  PROJECT_DETAILS_WIDTH,
  PROJECT_PAGE_SCROLL_CONTAINER_ID,
  isDesktopProjectSidebarOpenAtom,
  isMobileProjectSidebarOpenAtom
}
