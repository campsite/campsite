import { Transition } from 'framer-motion'

export const LAYOUT_TRANSITION: Transition = {
  type: 'tween',
  ease: [0, 0.55, 0.45, 1],
  duration: 0.25,
  opacity: { duration: 0.1 }
}
