import { MotionProps } from 'framer-motion'

export const POPOVER_MOTION: MotionProps = {
  initial: { opacity: 0, scale: 0.94 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: {
      duration: 0.1
    }
  }
}
